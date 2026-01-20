import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        rewardAmount: true,
        targetCount: true,
        currentCount: true,
        endAt: true,
        appLinkIos: true,
        appLinkAndroid: true,
        screenshot1Mission: true,
        screenshot2Mission: true,
        screenshot1RefKey: true,
        screenshot2RefKey: true,
        status: true,
        questions: {
          select: {
            questionOrder: true,
            questionText: true,
          },
          orderBy: { questionOrder: "asc" },
        },
        advertiser: {
          select: {
            companyName: true,
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

    if (campaign.status !== "RUNNING") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMP_ALREADY_CLOSED",
            message: "Campaign is not accepting participations",
          },
        },
        { status: 400 }
      );
    }

    let isParticipated = false;
    if (session?.user?.id) {
      const existing = await prisma.participation.findUnique({
        where: {
          campaignId_userId: {
            campaignId: id,
            userId: session.user.id,
          },
        },
        select: { id: true },
      });
      isParticipated = !!existing;
    }

    const image1Required = !!(campaign.screenshot1RefKey || campaign.screenshot1Mission);
    const image2Required = !!(campaign.screenshot2RefKey || campaign.screenshot2Mission);

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        rewardAmount: campaign.rewardAmount,
        targetCount: campaign.targetCount,
        currentCount: campaign.currentCount,
        remainingSlots: Math.max(0, campaign.targetCount - campaign.currentCount),
        endAt: campaign.endAt.toISOString(),
        appLinkIos: campaign.appLinkIos,
        appLinkAndroid: campaign.appLinkAndroid,
        screenshot1Mission: campaign.screenshot1Mission,
        screenshot2Mission: campaign.screenshot2Mission,
        image1Required,
        image2Required,
        questions: campaign.questions.map((q: (typeof campaign.questions)[number]) => ({
          order: q.questionOrder,
          text: q.questionText,
        })),
        advertiserName: campaign.advertiser.companyName,
        isParticipated,
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
