import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

export async function GET(request: NextRequest) {
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

    const [campaigns, recentCampaigns, participationStats] = await Promise.all([
      prisma.campaign.findMany({
        where: { advertiserId: advertiser.id },
        select: {
          id: true,
          status: true,
          _count: {
            select: { participations: true },
          },
          participations: {
            select: { status: true },
          },
        },
      }),

      prisma.campaign.findMany({
        where: { advertiserId: advertiser.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          targetCount: true,
          currentCount: true,
          rewardAmount: true,
          endAt: true,
          createdAt: true,
        },
      }),

      prisma.participation.groupBy({
        by: ["status"],
        where: {
          campaign: { advertiserId: advertiser.id },
        },
        _count: { id: true },
      }),
    ]);

    const statusCounts = {
      draft: 0,
      running: 0,
      paused: 0,
      completed: 0,
    };

    let totalParticipations = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    campaigns.forEach((campaign) => {
      const status = campaign.status.toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    participationStats.forEach((stat) => {
      const count = stat._count.id;
      totalParticipations += count;

      switch (stat.status) {
        case "APPROVED":
        case "PAID":
          approvedCount += count;
          break;
        case "SUBMITTED":
        case "PENDING_REVIEW":
        case "MANUAL_REVIEW":
          pendingCount += count;
          break;
        case "REJECTED":
        case "AUTO_REJECTED":
          rejectedCount += count;
          break;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        creditBalance: advertiser.creditBalance,
        campaigns: {
          total: campaigns.length,
          ...statusCounts,
        },
        participations: {
          total: totalParticipations,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
        recentCampaigns: recentCampaigns.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          targetCount: c.targetCount,
          currentCount: c.currentCount,
          rewardAmount: c.rewardAmount,
          endAt: c.endAt.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch dashboard data",
        },
      },
      { status: 500 }
    );
  }
}
