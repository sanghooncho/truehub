import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { enqueueJobBatch } from "@/lib/jobs/queue";

const participationSchema = z.object({
  campaignId: z.string().uuid(),
  answer1: z.string().min(1).max(2000),
  answer2: z.string().min(1).max(2000),
  feedback: z.string().min(30).max(5000),
  image1Key: z.string().min(1),
  image2Key: z.string().min(1),
  deviceFingerprint: z.string().optional(),
});

const DAILY_LIMIT = 3;

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
    const data = participationSchema.parse(body);

    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      select: {
        id: true,
        status: true,
        targetCount: true,
        currentCount: true,
        endAt: true,
        rewardAmount: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: "CAMP_NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    if (campaign.status !== "RUNNING" || campaign.endAt < new Date()) {
      return NextResponse.json(
        { success: false, error: { code: "PART_CAMPAIGN_CLOSED", message: "Campaign is closed" } },
        { status: 400 }
      );
    }

    if (campaign.currentCount >= campaign.targetCount) {
      return NextResponse.json(
        { success: false, error: { code: "PART_CAMPAIGN_CLOSED", message: "Campaign is full" } },
        { status: 400 }
      );
    }

    const existing = await prisma.participation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: data.campaignId,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "PART_ALREADY_SUBMITTED", message: "Already participated" },
        },
        { status: 400 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayCount = await prisma.participation.count({
      where: {
        userId,
        submittedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "PART_DAILY_LIMIT", message: `Daily limit of ${DAILY_LIMIT} reached` },
        },
        { status: 400 }
      );
    }

    const participation = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newParticipation = await tx.participation.create({
        data: {
          campaignId: data.campaignId,
          userId,
          answer1: data.answer1,
          answer2: data.answer2,
          feedback: data.feedback,
          status: "SUBMITTED",
          assets: {
            create: [
              { slot: 1, storageKey: data.image1Key },
              { slot: 2, storageKey: data.image2Key },
            ],
          },
        },
        include: { assets: true },
      });

      await tx.campaign.update({
        where: { id: data.campaignId },
        data: { currentCount: { increment: 1 } },
      });

      if (data.deviceFingerprint) {
        await tx.user.update({
          where: { id: userId },
          data: { deviceFingerprint: data.deviceFingerprint },
        });
      }

      return newParticipation;
    });

    await enqueueJobBatch([
      ...participation.assets.map((asset) => ({
        type: "PHASH_CALC" as const,
        payload: { assetId: asset.id, storageKey: asset.storageKey },
        priority: "HIGH" as const,
      })),
      {
        type: "FRAUD_CHECK" as const,
        payload: { participationId: participation.id },
        priority: "HIGH" as const,
        scheduledAt: new Date(Date.now() + 5000),
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: participation.id,
        status: participation.status,
        message: "Participation submitted. Review in progress.",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const feedbackIssue = error.issues.find((i) => i.path.includes("feedback"));
      if (feedbackIssue) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PART_TEXT_TOO_SHORT",
              message: "Feedback must be at least 30 characters",
            },
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Participation submit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to submit participation" },
      },
      { status: 500 }
    );
  }
}
