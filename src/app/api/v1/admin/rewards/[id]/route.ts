import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { enqueueJob } from "@/lib/jobs/queue";

const markSentSchema = z.object({
  action: z.enum(["sent", "failed"]),
  method: z.string().optional(),
  proofText: z.string().optional(),
  failReason: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: rewardId } = await params;
    const body = await request.json();
    const validation = markSentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { action, method, proofText, failReason } = validation.data;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: {
        user: { select: { id: true, email: true } },
        participation: {
          select: {
            campaign: { select: { title: true, rewardAmount: true } },
          },
        },
      },
    });

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REWARD_NOT_FOUND",
            message: "Reward not found",
          },
        },
        { status: 404 }
      );
    }

    if (reward.status !== "REQUESTED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REWARD_INVALID_STATUS",
            message: "Reward has already been processed",
          },
        },
        { status: 400 }
      );
    }

    if (action === "sent") {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.reward.update({
          where: { id: rewardId },
          data: {
            status: "SENT",
            method: method || "MANUAL",
            proofText,
            sentAt: new Date(),
            processedById: operator.id,
          },
        });

        if (reward.participationId) {
          await tx.participation.update({
            where: { id: reward.participationId },
            data: { status: "PAID" },
          });
        }
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "REWARD_SENT",
          targetType: "reward",
          targetId: rewardId,
          details: { method, proofText },
        },
      });

      if (reward.user.email && reward.participation) {
        await enqueueJob({
          type: "SEND_EMAIL",
          priority: "HIGH",
          payload: {
            templateType: "REWARD_SENT",
            recipientEmail: reward.user.email,
            recipientType: "user",
            recipientId: reward.user.id,
            data: {
              campaignTitle: reward.participation.campaign.title,
              rewardAmount: reward.amount,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: "SENT",
          message: "Reward marked as sent",
        },
      });
    } else {
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: "FAILED",
          failReason: failReason || "지급 실패",
          processedById: operator.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "REWARD_FAILED",
          targetType: "reward",
          targetId: rewardId,
          details: { failReason },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          status: "FAILED",
          message: "Reward marked as failed",
        },
      });
    }
  } catch (error) {
    console.error("Update reward error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update reward",
        },
      },
      { status: 500 }
    );
  }
}
