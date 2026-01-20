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
    const status = searchParams.get("status") || "REQUESTED";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      status: status as "REQUESTED" | "SENT" | "FAILED",
      ...(search && {
        OR: [
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          {
            participation: {
              campaign: { title: { contains: search, mode: "insensitive" as const } },
            },
          },
        ],
      }),
    };

    const [rewards, total, stats] = await Promise.all([
      prisma.reward.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profileName: true,
            },
          },
          participation: {
            select: {
              id: true,
              reviewedAt: true,
              campaign: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          processedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.reward.count({ where }),
      prisma.reward.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const statsMap = stats.reduce(
      (acc, s) => {
        acc[s.status] = {
          count: s._count.id,
          amount: s._sum.amount || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>
    );

    return NextResponse.json({
      success: true,
      data: {
        rewards: rewards.map((r) => ({
          id: r.id,
          amount: r.amount,
          status: r.status,
          method: r.method,
          sentAt: r.sentAt,
          proofText: r.proofText,
          failReason: r.failReason,
          createdAt: r.createdAt,
          user: {
            id: r.user.id,
            email: r.user.email ? maskEmail(r.user.email) : null,
            profileName: r.user.profileName,
          },
          campaign: r.participation
            ? {
                id: r.participation.campaign.id,
                title: r.participation.campaign.title,
              }
            : null,
          approvedAt: r.participation?.reviewedAt ?? null,
          processedBy: r.processedBy
            ? {
                id: r.processedBy.id,
                name: r.processedBy.name,
              }
            : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          requested: statsMap.REQUESTED || { count: 0, amount: 0 },
          sent: statsMap.SENT || { count: 0, amount: 0 },
          failed: statsMap.FAILED || { count: 0, amount: 0 },
        },
      },
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch rewards",
        },
      },
      { status: 500 }
    );
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.slice(0, 3) + "***";
  return `${masked}@${domain}`;
}
