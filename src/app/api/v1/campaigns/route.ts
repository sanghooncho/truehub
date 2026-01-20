import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sort: z.enum(["latest", "reward", "deadline"]).default("latest"),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      sort: searchParams.get("sort") || "latest",
      category: searchParams.get("category") || undefined,
    });

    const { page, limit, sort } = query;
    const skip = (page - 1) * limit;

    const orderBy = getOrderBy(sort);

    const where = {
      status: "RUNNING" as const,
      endAt: { gt: new Date() },
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          advertiser: {
            select: {
              companyName: true,
            },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    const items = campaigns.map((c: (typeof campaigns)[number]) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      rewardAmount: c.rewardAmount,
      targetCount: c.targetCount,
      currentCount: c.currentCount,
      remainingSlots: Math.max(0, c.targetCount - c.currentCount),
      endAt: c.endAt.toISOString(),
      appLinkIos: c.appLinkIos,
      appLinkAndroid: c.appLinkAndroid,
      advertiserName: c.advertiser.companyName,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Campaign list error:", error);
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

function getOrderBy(sort: string) {
  switch (sort) {
    case "reward":
      return { rewardAmount: "desc" as const };
    case "deadline":
      return { endAt: "asc" as const };
    case "latest":
    default:
      return { createdAt: "desc" as const };
  }
}
