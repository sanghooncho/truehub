import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/db/prisma";
import { getGiftishowClient, getGiftishowErrorMessage } from "@/lib/giftishow";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
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

    const { code } = await params;

    const client = getGiftishowClient();
    const response = await client.getGoodsDetail(code);

    if (response.code !== "0000") {
      await prisma.giftishowGoods.updateMany({
        where: { goodsCode: code },
        data: { isActive: false, syncedAt: new Date() },
      });

      return NextResponse.json(
        {
          success: false,
          error: { code: "SOLD_OUT", message: "해당 상품은 품절되었습니다" },
        },
        { status: 400 }
      );
    }

    const g = response.result?.goodsDetail;
    if (!g) {
      await prisma.giftishowGoods.updateMany({
        where: { goodsCode: code },
        data: { isActive: false, syncedAt: new Date() },
      });

      return NextResponse.json(
        {
          success: false,
          error: { code: "SOLD_OUT", message: "해당 상품은 품절되었습니다" },
        },
        { status: 404 }
      );
    }

    if (g.goodsStateCd !== "SALE") {
      await prisma.giftishowGoods.updateMany({
        where: { goodsCode: code },
        data: { goodsStateCd: g.goodsStateCd, isActive: false, syncedAt: new Date() },
      });

      return NextResponse.json(
        {
          success: false,
          error: { code: "SOLD_OUT", message: "해당 상품은 품절되었습니다" },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        goodsCode: g.goodsCode,
        goodsName: g.goodsName,
        brandCode: g.brandCode,
        brandName: g.brandName,
        brandIconImg: g.brandIconImg,
        goodsImgS: g.goodsImgS,
        goodsImgB: g.goodsImgB,
        goodsDescImgWeb: g.goodsDescImgWeb,
        content: g.content,
        contentAddDesc: g.contentAddDesc,
        salePrice: g.salePrice,
        discountPrice: g.discountPrice,
        discountRate: g.discountRate,
        limitDay: g.limitDay,
        goodsTypeDtlNm: g.goodsTypeDtlNm,
        affiliate: g.affiliate,
        categoryName1: g.categoryName1,
        goodsStateCd: g.goodsStateCd,
      },
    });
  } catch (error) {
    console.error("GiftShop goods detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "상품 정보를 불러오는데 실패했습니다" },
      },
      { status: 500 }
    );
  }
}
