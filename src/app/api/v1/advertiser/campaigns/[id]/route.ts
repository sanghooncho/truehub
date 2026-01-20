import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        questions: {
          orderBy: { questionOrder: "asc" },
        },
        participations: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMP_NOT_FOUND",
            message: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    if (campaign.advertiserId !== advertiser.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view this campaign",
          },
        },
        { status: 403 }
      );
    }

    const approvedCount = campaign.participations.filter(
      (p) => p.status === "APPROVED" || p.status === "PAID"
    ).length;
    const pendingCount = campaign.participations.filter(
      (p) =>
        p.status === "SUBMITTED" || p.status === "PENDING_REVIEW" || p.status === "MANUAL_REVIEW"
    ).length;
    const rejectedCount = campaign.participations.filter(
      (p) => p.status === "REJECTED" || p.status === "AUTO_REJECTED"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        appLinkIos: campaign.appLinkIos,
        appLinkAndroid: campaign.appLinkAndroid,
        targetCount: campaign.targetCount,
        currentCount: campaign.currentCount,
        rewardAmount: campaign.rewardAmount,
        creditCostPerValid: campaign.creditCostPerValid,
        status: campaign.status,
        startAt: campaign.startAt?.toISOString() || null,
        endAt: campaign.endAt.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        questions: campaign.questions.map((q) => ({
          order: q.questionOrder,
          text: q.questionText,
        })),
        stats: {
          total: campaign.participations.length,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    console.error("Campaign detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch campaign",
        },
      },
      { status: 500 }
    );
  }
}
