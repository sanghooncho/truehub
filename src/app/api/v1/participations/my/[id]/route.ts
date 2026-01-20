import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/infra/storage/supabase";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: participationId } = await params;

    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            rewardAmount: true,
            advertiser: {
              select: { companyName: true },
            },
            questions: {
              orderBy: { questionOrder: "asc" },
              select: {
                questionOrder: true,
                questionText: true,
              },
            },
          },
        },
        assets: {
          orderBy: { slot: "asc" },
          select: {
            id: true,
            slot: true,
            storageKey: true,
            originalFilename: true,
            mimeType: true,
          },
        },
        reward: {
          select: {
            id: true,
            status: true,
            amount: true,
            sentAt: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "PART_NOT_FOUND", message: "Participation not found" },
        },
        { status: 404 }
      );
    }

    // Ensure user can only view their own participation
    if (participation.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: participation.id,
        status: participation.status,
        submittedAt: participation.submittedAt.toISOString(),
        reviewedAt: participation.reviewedAt?.toISOString() || null,
        rejectReason: participation.rejectReason,
        campaign: {
          id: participation.campaign.id,
          title: participation.campaign.title,
          description: participation.campaign.description,
          advertiserName: participation.campaign.advertiser.companyName,
          rewardAmount: participation.campaign.rewardAmount,
          questions: participation.campaign.questions.map((q) => ({
            order: q.questionOrder,
            text: q.questionText,
          })),
        },
        answers: {
          answer1: participation.answer1,
          answer2: participation.answer2,
          feedback: participation.feedback,
        },
        assets: await Promise.all(
          participation.assets.map(async (a) => ({
            id: a.id,
            slot: a.slot,
            url: await getSignedDownloadUrl(a.storageKey).catch(() => null),
            filename: a.originalFilename,
            mimeType: a.mimeType,
          }))
        ),
        reward: participation.reward
          ? {
              id: participation.reward.id,
              status: participation.reward.status,
              amount: participation.reward.amount,
              sentAt: participation.reward.sentAt?.toISOString() || null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("My participation detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch participation" },
      },
      { status: 500 }
    );
  }
}
