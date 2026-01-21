import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, TopupMethod } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().int().min(10000).max(10000000),
});

export async function POST(request: NextRequest) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { paymentId, amount } = validation.data;

    // PortOne V2 API로 결제 검증 (필수)
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const apiSecret = process.env.PORTONE_API_SECRET;

    // PORTONE_API_SECRET이 없으면 결제 처리 불가 (보안상 필수)
    if (!apiSecret) {
      console.error("PORTONE_API_SECRET is not configured - payment verification blocked");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIG_ERROR",
            message: "결제 시스템이 설정되지 않았습니다. 관리자에게 문의하세요.",
          },
        },
        { status: 500 }
      );
    }

    // PortOne V2 결제 조회 API 호출
    const portoneResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!portoneResponse.ok) {
      console.error("PortOne API error:", await portoneResponse.text());
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYMENT_VERIFICATION_FAILED",
            message: "결제 확인에 실패했습니다",
          },
        },
        { status: 400 }
      );
    }

    const paymentData = await portoneResponse.json();

    // 결제 상태 검증
    if (paymentData.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYMENT_NOT_COMPLETED",
            message: "결제가 완료되지 않았습니다",
          },
        },
        { status: 400 }
      );
    }

    // 금액 검증
    if (paymentData.amount.total !== amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AMOUNT_MISMATCH",
            message: "결제 금액이 일치하지 않습니다",
          },
        },
        { status: 400 }
      );
    }

    // Store ID 검증
    if (paymentData.storeId !== storeId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STORE_MISMATCH",
            message: "잘못된 결제 정보입니다",
          },
        },
        { status: 400 }
      );
    }

    // 중복 처리 방지 - 같은 paymentId로 이미 처리된 건인지 확인
    const existingTopup = await prisma.topupRequest.findFirst({
      where: {
        depositCode: paymentId,
        status: "CONFIRMED",
      },
    });

    if (existingTopup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_PROCESSED",
            message: "이미 처리된 결제입니다",
          },
        },
        { status: 400 }
      );
    }

    // 광고주 지갑 조회
    const wallet = await prisma.creditWallet.findUnique({
      where: { advertiserId: advertiser.id },
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WALLET_NOT_FOUND",
            message: "지갑을 찾을 수 없습니다",
          },
        },
        { status: 400 }
      );
    }

    // 트랜잭션으로 크레딧 충전 처리
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 충전 요청 레코드 생성
      await tx.topupRequest.create({
        data: {
          advertiserId: advertiser.id,
          amount,
          method: TopupMethod.CARD,
          depositCode: paymentId,
          status: "CONFIRMED",
          confirmedAt: new Date(),
          expiresAt: new Date(), // 카드 결제는 즉시 완료되므로 만료시간 불필요
        },
      });

      // 지갑 잔액 업데이트
      const newBalance = wallet.balance + amount;
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalTopup: { increment: amount },
        },
      });

      // 거래 내역 생성
      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "TOPUP",
          amount,
          balanceAfter: newBalance,
          refType: "card_payment",
          refId: paymentId,
          description: `카드 결제 충전 (${paymentId})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "크레딧이 충전되었습니다",
        amount,
        newBalance: wallet.balance + amount,
      },
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "결제 처리 중 오류가 발생했습니다",
          debug: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
      },
      { status: 500 }
    );
  }
}
