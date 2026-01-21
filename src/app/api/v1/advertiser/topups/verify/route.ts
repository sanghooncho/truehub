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

    // PortOne V2 API로 결제 검증
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

    // PortOne V2 결제 조회 API 호출
    const portoneResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `PortOne ${process.env.PORTONE_API_SECRET || ""}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 테스트 모드에서는 API Secret이 없을 수 있으므로 클라이언트 측 검증만 수행
    // 실제 운영 시에는 PORTONE_API_SECRET 환경변수를 설정해야 함
    if (!process.env.PORTONE_API_SECRET) {
      console.warn("PORTONE_API_SECRET not set - skipping server-side verification");
      // 테스트 모드에서는 클라이언트 응답을 신뢰
    } else if (!portoneResponse.ok) {
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
    } else {
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
