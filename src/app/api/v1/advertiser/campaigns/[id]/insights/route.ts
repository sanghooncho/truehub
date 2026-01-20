import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";
import { enqueueJob } from "@/lib/jobs/queue";

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

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        advertiserId: advertiser.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            participations: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_NOT_FOUND",
            message: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    const latestInsight = await prisma.aiInsight.findFirst({
      where: { campaignId },
      orderBy: { version: "desc" },
    });

    const pendingJob = await prisma.job.findFirst({
      where: {
        type: "AI_REPORT",
        status: { in: ["PENDING", "PROCESSING"] },
        payload: {
          path: ["campaignId"],
          equals: campaignId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          approvedCount: campaign._count.participations,
        },
        insight: latestInsight
          ? {
              id: latestInsight.id,
              version: latestInsight.version,
              participationCount: latestInsight.participationCount,
              summary: latestInsight.summary,
              pros: latestInsight.pros,
              cons: latestInsight.cons,
              onboardingIssues: latestInsight.onboardingIssues,
              keywords: latestInsight.keywords,
              sentiment: latestInsight.sentiment,
              themes: latestInsight.themes,
              generatedAt: latestInsight.generatedAt,
            }
          : null,
        canGenerate: campaign._count.participations >= 5,
        isGenerating: !!pendingJob,
        minParticipations: 5,
      },
    });
  } catch (error) {
    console.error("Get AI insights error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch AI insights",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        advertiserId: advertiser.id,
      },
      select: {
        id: true,
        _count: {
          select: {
            participations: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_NOT_FOUND",
            message: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    if (campaign._count.participations < 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_DATA",
            message: "최소 5개 이상의 승인된 참여가 필요합니다",
          },
        },
        { status: 400 }
      );
    }

    const existingJob = await prisma.job.findFirst({
      where: {
        type: "AI_REPORT",
        status: { in: ["PENDING", "PROCESSING"] },
        payload: {
          path: ["campaignId"],
          equals: campaignId,
        },
      },
    });

    if (existingJob) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_GENERATING",
            message: "AI 분석이 이미 진행 중입니다",
          },
        },
        { status: 400 }
      );
    }

    await enqueueJob({
      type: "AI_REPORT",
      priority: "MEDIUM",
      payload: { campaignId },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "AI 분석이 요청되었습니다. 잠시 후 새로고침해주세요.",
      },
    });
  } catch (error) {
    console.error("Generate AI insight error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to request AI insight generation",
        },
      },
      { status: 500 }
    );
  }
}
