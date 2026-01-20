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

    const [
      totalUsers,
      totalAdvertisers,
      totalCampaigns,
      pendingParticipations,
      pendingTopups,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.advertiser.count(),
      prisma.campaign.count(),
      prisma.participation.count({
        where: {
          status: { in: ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"] },
        },
      }),
      prisma.topupRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          operator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const approvedToday = await prisma.participation.count({
      where: {
        status: "APPROVED",
        reviewedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAdvertisers,
          totalCampaigns,
          pendingParticipations,
          pendingTopups,
          approvedToday,
        },
        recentActivity: recentActivity.map((log: (typeof recentActivity)[number]) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          details: log.details,
          operator: log.operator
            ? {
                name: log.operator.name,
                email: log.operator.email,
              }
            : null,
          createdAt: log.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
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
