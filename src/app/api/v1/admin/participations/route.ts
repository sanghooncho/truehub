import { NextRequest, NextResponse } from "next/server";
import { ParticipationStatus } from "@prisma/client";
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
    const statusFilter = searchParams.get("status") as ParticipationStatus | null;
    const search = searchParams.get("search");

    const pendingStatuses: ParticipationStatus[] = [
      ParticipationStatus.SUBMITTED,
      ParticipationStatus.PENDING_REVIEW,
      ParticipationStatus.MANUAL_REVIEW,
    ];

    const whereConditions = {
      status: statusFilter ? statusFilter : { in: pendingStatuses },
      ...(search && {
        campaign: { title: { contains: search, mode: "insensitive" as const } },
      }),
    };

    const [total, participations, stats] = await Promise.all([
      prisma.participation.count({ where: whereConditions }),
      prisma.participation.findMany({
        where: whereConditions,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              rewardAmount: true,
              creditCostPerValid: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              profileName: true,
              provider: true,
            },
          },
          assets: {
            select: {
              id: true,
              slot: true,
              storageKey: true,
            },
          },
        },
      }),
      prisma.participation.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      statusCounts.total += stat._count.id;
      if (pendingStatuses.includes(stat.status)) {
        statusCounts.pending += stat._count.id;
      } else if (
        stat.status === ParticipationStatus.APPROVED ||
        stat.status === ParticipationStatus.PAID
      ) {
        statusCounts.approved += stat._count.id;
      } else if (
        stat.status === ParticipationStatus.REJECTED ||
        stat.status === ParticipationStatus.AUTO_REJECTED
      ) {
        statusCounts.rejected += stat._count.id;
      }
    });

    const maskedEmail = (email: string | null) => {
      if (!email) return "***";
      const [local, domain] = email.split("@");
      return `${local.slice(0, 3)}***@${domain}`;
    };

    const items = participations.map((p) => ({
      id: p.id,
      campaign: {
        id: p.campaign.id,
        title: p.campaign.title,
        rewardAmount: p.campaign.rewardAmount,
      },
      user: {
        id: p.user.id,
        email: maskedEmail(p.user.email),
        provider: p.user.provider,
      },
      status: p.status,
      fraudScore: p.fraudScore,
      fraudDecision: p.fraudDecision,
      submittedAt: p.submittedAt.toISOString(),
      assets: p.assets.map((a: { id: string; slot: number; storageKey: string }) => ({
        id: a.id,
        slot: a.slot,
        storageKey: a.storageKey,
      })),
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
    console.error("Participations list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch participations",
        },
      },
      { status: 500 }
    );
  }
}
