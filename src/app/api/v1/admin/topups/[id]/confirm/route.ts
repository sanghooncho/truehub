import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
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

    const { id: topupId } = await params;

    const topup = await prisma.topupRequest.findUnique({
      where: { id: topupId },
      include: {
        advertiser: {
          include: {
            creditWallet: true,
          },
        },
      },
    });

    if (!topup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOPUP_NOT_FOUND",
            message: "Top-up request not found",
          },
        },
        { status: 404 }
      );
    }

    if (topup.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOPUP_INVALID_STATUS",
            message: "Top-up request is not pending",
          },
        },
        { status: 400 }
      );
    }

    if (new Date() > topup.expiresAt) {
      await prisma.topupRequest.update({
        where: { id: topupId },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOPUP_EXPIRED",
            message: "Top-up request has expired",
          },
        },
        { status: 400 }
      );
    }

    const wallet = topup.advertiser.creditWallet;
    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WALLET_NOT_FOUND",
            message: "Advertiser wallet not found",
          },
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.topupRequest.update({
        where: { id: topupId },
        data: {
          status: "CONFIRMED",
          confirmedById: operator.id,
          confirmedAt: new Date(),
        },
      });

      const newBalance = wallet.balance + topup.amount;
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalTopup: { increment: topup.amount },
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "TOPUP",
          amount: topup.amount,
          balanceAfter: newBalance,
          refType: "topup",
          refId: topupId,
          description: `Top-up via ${topup.method}`,
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        operatorId: operator.id,
        action: "CONFIRM_TOPUP",
        targetType: "topup",
        targetId: topupId,
        details: {
          advertiserId: topup.advertiserId,
          amount: topup.amount,
          method: topup.method,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        status: "CONFIRMED",
        message: "Top-up confirmed successfully",
        amount: topup.amount,
      },
    });
  } catch (error) {
    console.error("Confirm topup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to confirm top-up",
        },
      },
      { status: 500 }
    );
  }
}
