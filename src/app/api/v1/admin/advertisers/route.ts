import { NextRequest, NextResponse } from "next/server";
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
    const search = searchParams.get("search");

    const whereConditions = {
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, advertisers, aggregates] = await Promise.all([
      prisma.advertiser.count({ where: whereConditions }),
      prisma.advertiser.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creditWallet: {
            select: {
              balance: true,
            },
          },
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
      }),
      prisma.$transaction([
        prisma.advertiser.count(),
        prisma.campaign.count({ where: { status: "RUNNING" } }),
        prisma.creditWallet.aggregate({ _sum: { balance: true } }),
      ]),
    ]);

    const [totalAdvertisers, runningCampaigns, creditSum] = aggregates;

    const stats = {
      totalAdvertisers,
      runningCampaigns,
      totalCredits: creditSum._sum.balance || 0,
    };

    const items = advertisers.map((a) => ({
      id: a.id,
      companyName: a.companyName,
      email: a.email,
      contactName: a.contactName,
      contactPhone: a.contactPhone,
      isActive: a.isActive,
      campaigns: a._count.campaigns,
      credits: a.creditWallet?.balance || 0,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Advertisers list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch advertisers",
        },
      },
      { status: 500 }
    );
  }
}
