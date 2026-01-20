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

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          orderBy: { submittedAt: "desc" },
          take: 20,
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                rewardAmount: true,
              },
            },
          },
        },
        rewards: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const [participationStats, rewardStats] = await Promise.all([
      prisma.participation.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      }),
      prisma.reward.aggregate({
        where: { userId, status: "SENT" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const stats = {
      participations: {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      },
      rewards: {
        totalAmount: rewardStats._sum.amount || 0,
        count: rewardStats._count.id,
      },
    };

    participationStats.forEach((stat) => {
      stats.participations.total += stat._count.id;
      if (stat.status === "APPROVED" || stat.status === "PAID") {
        stats.participations.approved += stat._count.id;
      } else if (stat.status === "REJECTED" || stat.status === "AUTO_REJECTED") {
        stats.participations.rejected += stat._count.id;
      } else {
        stats.participations.pending += stat._count.id;
      }
    });

    const maskedEmail = (email: string | null) => {
      if (!email) return "***";
      const [local, domain] = email.split("@");
      return `${local.slice(0, 3)}***@${domain}`;
    };

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: maskedEmail(user.email),
        provider: user.provider,
        profileName: user.profileName,
        deviceFingerprint: user.deviceFingerprint,
        isBanned: user.isBanned,
        banReason: user.banReason,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        stats,
        participations: user.participations.map((p) => ({
          id: p.id,
          campaignId: p.campaign.id,
          campaignTitle: p.campaign.title,
          rewardAmount: p.campaign.rewardAmount,
          status: p.status,
          fraudScore: p.fraudScore,
          submittedAt: p.submittedAt.toISOString(),
        })),
        rewards: user.rewards.map((r) => ({
          id: r.id,
          type: r.type,
          amount: r.amount,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch user",
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

    const { id: userId } = await params;
    const body = await request.json();
    const { action, reason } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    if (action === "ban") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: reason || "관리자에 의해 정지됨",
        },
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "BAN_USER",
          targetType: "user",
          targetId: userId,
          details: { reason },
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: "User banned successfully" },
      });
    }

    if (action === "unban") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          operatorId: operator.id,
          action: "UNBAN_USER",
          targetType: "user",
          targetId: userId,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: "User unbanned successfully" },
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
    console.error("User update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update user",
        },
      },
      { status: 500 }
    );
  }
}
