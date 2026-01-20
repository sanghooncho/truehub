import { NextRequest, NextResponse } from "next/server";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const statusFilter = searchParams.get("status") as CampaignStatus | null;
    const search = searchParams.get("search");

    const whereConditions = {
      ...(statusFilter && { status: statusFilter }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { advertiser: { companyName: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [total, campaigns, stats] = await Promise.all([
      prisma.campaign.count({ where: whereConditions }),
      prisma.campaign.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          advertiser: {
            select: {
              id: true,
              companyName: true,
            },
          },
          _count: {
            select: {
              participations: true,
            },
          },
        },
      }),
      prisma.campaign.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const statusCounts = {
      total: 0,
      draft: 0,
      running: 0,
      paused: 0,
      closed: 0,
      settling: 0,
      completed: 0,
    };

    stats.forEach((stat) => {
      statusCounts.total += stat._count.id;
      const key = stat.status.toLowerCase() as keyof typeof statusCounts;
      if (key in statusCounts) {
        statusCounts[key] = stat._count.id;
      }
    });

    const items = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      advertiser: {
        id: c.advertiser.id,
        companyName: c.advertiser.companyName,
      },
      status: c.status,
      participations: c._count.participations,
      targetCount: c.targetCount,
      currentCount: c.currentCount,
      rewardAmount: c.rewardAmount,
      startAt: c.startAt?.toISOString() || null,
      endAt: c.endAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        stats: statusCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Campaigns list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch campaigns",
        },
      },
      { status: 500 }
    );
  }
}
