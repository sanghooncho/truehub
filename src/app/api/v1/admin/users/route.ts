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
    const bannedFilter = searchParams.get("banned");

    const whereConditions = {
      deletedAt: null,
      ...(search && {
        email: { contains: search, mode: "insensitive" as const },
      }),
      ...(bannedFilter === "true" && { isBanned: true }),
      ...(bannedFilter === "false" && { isBanned: false }),
    };

    const [total, users, aggregates] = await Promise.all([
      prisma.user.count({ where: whereConditions }),
      prisma.user.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              participations: true,
            },
          },
          rewards: {
            where: { status: "SENT" },
            select: { amount: true },
          },
        },
      }),
      prisma.$transaction([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { deletedAt: null, isBanned: false } }),
        prisma.user.count({ where: { deletedAt: null, isBanned: true } }),
      ]),
    ]);

    const [totalUsers, activeUsers, bannedUsers] = aggregates;

    const stats = {
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
    };

    const maskedEmail = (email: string | null) => {
      if (!email) return "***";
      const [local, domain] = email.split("@");
      return `${local.slice(0, 3)}***@${domain}`;
    };

    const items = users.map((u) => ({
      id: u.id,
      email: maskedEmail(u.email),
      provider: u.provider,
      profileName: u.profileName,
      participations: u._count.participations,
      rewards: u.rewards.reduce((sum, r) => sum + r.amount, 0),
      isBanned: u.isBanned,
      banReason: u.banReason,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      createdAt: u.createdAt.toISOString(),
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
    console.error("Users list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch users",
        },
      },
      { status: 500 }
    );
  }
}
