import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: advertiserId } = await params;

    const advertiser = await prisma.advertiser.findUnique({
      where: { id: advertiserId },
      include: {
        creditWallet: true,
        campaigns: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            _count: {
              select: { participations: true },
            },
          },
        },
        topupRequests: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!advertiser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADVERTISER_NOT_FOUND",
            message: "Advertiser not found",
          },
        },
        { status: 404 }
      );
    }

    const [campaignStats, topupStats] = await Promise.all([
      prisma.campaign.groupBy({
        by: ["status"],
        where: { advertiserId },
        _count: { id: true },
      }),
      prisma.topupRequest.aggregate({
        where: { advertiserId, status: "CONFIRMED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const stats = {
      campaigns: {
        total: 0,
        running: 0,
        completed: 0,
        draft: 0,
      },
      credits: {
        balance: advertiser.creditWallet?.balance || 0,
        totalTopup: advertiser.creditWallet?.totalTopup || 0,
        totalConsumed: advertiser.creditWallet?.totalConsumed || 0,
      },
      topups: {
        totalAmount: topupStats._sum.amount || 0,
        count: topupStats._count.id,
      },
    };

    campaignStats.forEach((stat) => {
      stats.campaigns.total += stat._count.id;
      if (stat.status === "RUNNING") {
        stats.campaigns.running += stat._count.id;
      } else if (stat.status === "COMPLETED") {
        stats.campaigns.completed += stat._count.id;
      } else if (stat.status === "DRAFT") {
        stats.campaigns.draft += stat._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: advertiser.id,
        email: advertiser.email,
        companyName: advertiser.companyName,
        businessType: advertiser.businessType,
        contactName: advertiser.contactName,
        contactPhone: advertiser.contactPhone,
        isActive: advertiser.isActive,
        createdAt: advertiser.createdAt.toISOString(),
        stats,
        campaigns: advertiser.campaigns.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          targetCount: c.targetCount,
          currentCount: c.currentCount,
          rewardAmount: c.rewardAmount,
          participations: c._count.participations,
          endAt: c.endAt.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
        topupRequests: advertiser.topupRequests.map((t) => ({
          id: t.id,
          amount: t.amount,
          method: t.method,
          status: t.status,
          depositCode: t.depositCode,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Advertiser detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch advertiser",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: advertiserId } = await params;
    const body = await request.json();
    const { action } = body;

    const advertiser = await prisma.advertiser.findUnique({
      where: { id: advertiserId },
    });

    if (!advertiser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADVERTISER_NOT_FOUND",
            message: "Advertiser not found",
          },
        },
        { status: 404 }
      );
    }

    if (action === "activate") {
      await prisma.advertiser.update({
        where: { id: advertiserId },
        data: { isActive: true },
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "ACTIVATE_ADVERTISER",
          targetType: "advertiser",
          targetId: advertiserId,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: "Advertiser activated successfully" },
      });
    }

    if (action === "deactivate") {
      await prisma.advertiser.update({
        where: { id: advertiserId },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "DEACTIVATE_ADVERTISER",
          targetType: "advertiser",
          targetId: advertiserId,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: "Advertiser deactivated successfully" },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "Invalid action",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Advertiser update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update advertiser",
        },
      },
      { status: 500 }
    );
  }
}
