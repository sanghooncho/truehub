import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/db/prisma";
import { getGiftishowClient, getGiftishowErrorMessage, GiftishowClient } from "@/lib/giftishow";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_INVALID_TOKEN", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const { goodsCode, phoneNumber } = body;

    if (!goodsCode || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "상품 코드와 휴대폰 번호는 필수입니다" },
        },
        { status: 400 }
      );
    }

    const phoneRegex = /^01[0-9]{8,9}$/;
    const cleanPhone = phoneNumber.replace(/-/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "유효하지 않은 휴대폰 번호입니다" },
        },
        { status: 400 }
      );
    }

    const client = getGiftishowClient();
    const goodsResponse = await client.getGoodsDetail(goodsCode);

    if (goodsResponse.code !== "0000" || !goodsResponse.result?.goodsDetail) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "GOODS_NOT_FOUND", message: "상품을 찾을 수 없습니다" },
        },
        { status: 404 }
      );
    }

    const goods = goodsResponse.result.goodsDetail;

    if (goods.goodsStateCd !== "SALE") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "GOODS_NOT_AVAILABLE", message: "현재 판매중인 상품이 아닙니다" },
        },
        { status: 400 }
      );
    }

    const userRewards = await prisma.reward.aggregate({
      where: {
        userId,
        status: "SENT",
      },
      _sum: {
        amount: true,
      },
    });

    const usedPoints = await prisma.giftExchange.aggregate({
      where: {
        userId,
        status: { in: ["COMPLETED", "PROCESSING", "PENDING"] },
      },
      _sum: {
        pointsUsed: true,
      },
    });

    const totalEarned = userRewards._sum.amount || 0;
    const totalUsed = usedPoints._sum.pointsUsed || 0;
    const availablePoints = totalEarned - totalUsed;

    if (availablePoints < goods.discountPrice) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_POINTS",
            message: `포인트가 부족합니다. 필요: ${goods.discountPrice.toLocaleString()}P, 보유: ${availablePoints.toLocaleString()}P`,
          },
        },
        { status: 400 }
      );
    }

    const trId = GiftishowClient.generateTrId();

    const exchange = await prisma.giftExchange.create({
      data: {
        userId,
        goodsCode: goods.goodsCode,
        goodsName: goods.goodsName,
        brandName: goods.brandName,
        goodsImageUrl: goods.goodsImgS,
        amount: goods.salePrice,
        discountPrice: goods.discountPrice,
        pointsUsed: goods.discountPrice,
        phoneNumber: cleanPhone,
        trId,
        status: "PROCESSING",
        sendMethod: "N",
      },
    });

    try {
      const sendResponse = await client.sendCoupon({
        goodsCode: goods.goodsCode,
        trId,
        phoneNo: cleanPhone,
        mmsTitle: "TrueHub",
        mmsMsg: `${goods.goodsName} 상품권이 도착했습니다.`,
        callbackNo: process.env.GIFTISHOW_CALLBACK_NO || "15880000",
        gubun: "N",
        bannerId: process.env.GIFTISHOW_BANNER_ID,
        templateId: process.env.GIFTISHOW_TEMPLATE_ID,
      });

      if (sendResponse.code === "0000" && sendResponse.result?.result) {
        const result = sendResponse.result.result;

        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (goods.limitDay || 30));

        await prisma.giftExchange.update({
          where: { id: exchange.id },
          data: {
            status: "COMPLETED",
            orderNo: result.orderNo,
            pinNo: result.pinNo,
            couponImageUrl: result.couponImgUrl,
            giftishowCode: sendResponse.code,
            giftishowMsg: sendResponse.message,
            validUntil,
            processedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            exchangeId: exchange.id,
            goodsName: goods.goodsName,
            brandName: goods.brandName,
            goodsImageUrl: goods.goodsImgS,
            pointsUsed: goods.discountPrice,
            remainingPoints: availablePoints - goods.discountPrice,
            orderNo: result.orderNo,
            pinNo: result.pinNo,
            couponImageUrl: result.couponImgUrl,
            validUntil: validUntil.toISOString(),
            message: "상품권이 성공적으로 발송되었습니다",
          },
        });
      } else {
        await prisma.giftExchange.update({
          where: { id: exchange.id },
          data: {
            status: "FAILED",
            giftishowCode: sendResponse.code,
            giftishowMsg: sendResponse.message,
            failReason: getGiftishowErrorMessage(sendResponse.code),
            processedAt: new Date(),
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: sendResponse.code,
              message: getGiftishowErrorMessage(sendResponse.code),
            },
          },
          { status: 400 }
        );
      }
    } catch (sendError) {
      await prisma.giftExchange.update({
        where: { id: exchange.id },
        data: {
          status: "FAILED",
          failReason: sendError instanceof Error ? sendError.message : "발송 중 오류 발생",
          processedAt: new Date(),
        },
      });

      try {
        await client.cancelSendFail(trId);
      } catch {
        console.error("Failed to cancel send fail:", trId);
      }

      throw sendError;
    }
  } catch (error) {
    console.error("GiftShop exchange error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "상품권 교환 중 오류가 발생했습니다" },
      },
      { status: 500 }
    );
  }
}
