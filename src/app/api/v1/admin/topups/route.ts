import { NextRequest, NextResponse } from "next/server";
import { TopupStatus } from "@prisma/client";
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
    const statusFilter = searchParams.get("status");

    const where = {
      status: (statusFilter as TopupStatus) || TopupStatus.PENDING,
    };

    const [total, topups, stats] = await Promise.all([
      prisma.topupRequest.count({ where }),
      prisma.topupRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          advertiser: {
            select: {
              id: true,
              email: true,
              companyName: true,
            },
          },
        },
      }),
      prisma.topupRequest.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      totalPendingAmount: 0,
    };

    stats.forEach((stat) => {
      if (stat.status === "PENDING") {
        statusCounts.pending = stat._count.id;
        statusCounts.totalPendingAmount = stat._sum.amount || 0;
      } else if (stat.status === "CONFIRMED") {
        statusCounts.confirmed = stat._count.id;
      } else if (stat.status === "CANCELLED") {
        statusCounts.cancelled = stat._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        items: topups.map((t) => ({
          id: t.id,
          advertiser: {
            id: t.advertiser.id,
            email: t.advertiser.email,
            companyName: t.advertiser.companyName,
          },
          amount: t.amount,
          method: t.method,
          depositCode: t.depositCode,
          status: t.status,
          expiresAt: t.expiresAt.toISOString(),
          createdAt: t.createdAt.toISOString(),
        })),
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
    console.error("Admin topups list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch top-ups",
        },
      },
      { status: 500 }
    );
  }
}
