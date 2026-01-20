import { NextRequest, NextResponse } from "next/server";
import { JobStatus, JobType } from "@prisma/client";
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
    const statusFilter = searchParams.get("status") as JobStatus | null;
    const typeFilter = searchParams.get("type") as JobType | null;
    const search = searchParams.get("search");

    const whereConditions = {
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { type: typeFilter }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: "insensitive" as const } },
          { payload: { path: [], string_contains: search } },
        ],
      }),
    };

    const [total, jobs, stats] = await Promise.all([
      prisma.job.count({ where: whereConditions }),
      prisma.job.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      dead: 0,
    };

    stats.forEach((stat) => {
      statusCounts.total += stat._count.id;
      const key = stat.status.toLowerCase() as keyof typeof statusCounts;
      if (key in statusCounts) {
        statusCounts[key] = stat._count.id;
      }
    });

    const items = jobs.map((job) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      priority: job.priority,
      payload: JSON.stringify(job.payload),
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      errorMessage: job.errorMessage,
      scheduledAt: job.scheduledAt.toISOString(),
      startedAt: job.startedAt?.toISOString() || null,
      completedAt: job.completedAt?.toISOString() || null,
      failedAt: job.failedAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
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
    console.error("Jobs list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch jobs",
        },
      },
      { status: 500 }
    );
  }
}
