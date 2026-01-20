import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { getSignedDownloadUrl } from "@/infra/storage/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
          select: {
            id: true,
            title: true,
            description: true,
            rewardAmount: true,
            creditCostPerValid: true,
            questions: {
              orderBy: { questionOrder: "asc" },
              select: {
                questionOrder: true,
                questionText: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profileName: true,
            provider: true,
            isBanned: true,
            createdAt: true,
            _count: {
              select: {
                participations: true,
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
            phash: true,
          },
        },
        fraudSignals: {
          select: {
            signalType: true,
            signalValue: true,
            score: true,
            details: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
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

    const maskedEmail = (email: string | null) => {
      if (!email) return "***";
      const [local, domain] = email.split("@");
      return `${local.slice(0, 3)}***@${domain}`;
    };

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
          rewardAmount: participation.campaign.rewardAmount,
          creditCostPerValid: participation.campaign.creditCostPerValid,
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
        user: {
          id: participation.user.id,
          email: maskedEmail(participation.user.email),
          profileName: participation.user.profileName,
          provider: participation.user.provider,
          isBanned: participation.user.isBanned,
          joinedAt: participation.user.createdAt.toISOString(),
          totalParticipations: participation.user._count.participations,
        },
        assets: await Promise.all(
          participation.assets.map(async (a) => ({
            id: a.id,
            slot: a.slot,
            storageKey: a.storageKey,
            url: await getSignedDownloadUrl(a.storageKey).catch(() => null),
            filename: a.originalFilename,
            mimeType: a.mimeType,
          }))
        ),
        fraud: {
          score: participation.fraudScore,
          decision: participation.fraudDecision,
          reasons: participation.fraudReasons,
          signals: participation.fraudSignals,
        },
        reviewer: participation.reviewer
          ? {
              id: participation.reviewer.id,
              name: participation.reviewer.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Participation detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch participation",
        },
      },
      { status: 500 }
    );
  }
}
