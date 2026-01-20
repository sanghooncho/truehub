import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { enqueueJob } from "@/lib/jobs/queue";

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

    const { id: participationId } = await params;

    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        campaign: {
          include: {
            advertiser: {
              include: {
                creditWallet: true,
              },
            },
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PART_NOT_FOUND",
            message: "Participation not found",
          },
        },
        { status: 404 }
      );
    }

    const validStatuses = ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"];
    if (!validStatuses.includes(participation.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PART_INVALID_STATUS",
            message: "Participation cannot be approved in current status",
          },
        },
        { status: 400 }
      );
    }

    const wallet = participation.campaign.advertiser.creditWallet;
    const creditCost = participation.campaign.creditCostPerValid;

    if (!wallet || wallet.balance < creditCost) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CRED_INSUFFICIENT",
            message: "Advertiser has insufficient credits",
          },
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.participation.update({
        where: { id: participationId },
        data: {
          status: "APPROVED",
          reviewerId: operator.id,
          reviewedAt: new Date(),
        },
      });

      const newBalance = wallet.balance - creditCost;
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalConsumed: { increment: creditCost },
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "CONSUME",
          amount: -creditCost,
          balanceAfter: newBalance,
          refType: "participation",
          refId: participationId,
          description: `Campaign: ${participation.campaign.title}`,
        },
      });

      await tx.reward.create({
        data: {
          participationId,
          userId: participation.userId,
          amount: participation.campaign.rewardAmount,
          status: "REQUESTED",
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        operatorId: operator.id,
        action: "APPROVE_PARTICIPATION",
        targetType: "participation",
        targetId: participationId,
        details: {
          campaignId: participation.campaignId,
          creditDeducted: creditCost,
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: participation.userId },
      select: { email: true },
    });

    if (user?.email) {
      await enqueueJob({
        type: "SEND_EMAIL",
        priority: "HIGH",
        payload: {
          templateType: "PARTICIPATION_APPROVED",
          recipientEmail: user.email,
          recipientType: "user",
          recipientId: participation.userId,
          data: {
            campaignTitle: participation.campaign.title,
            rewardAmount: participation.campaign.rewardAmount,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: "APPROVED",
        message: "Participation approved successfully",
      },
    });
  } catch (error) {
    console.error("Approve participation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to approve participation",
        },
      },
      { status: 500 }
    );
  }
}
