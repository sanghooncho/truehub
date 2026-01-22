import { NextRequest, NextResponse } from "next/server";
import { runJobBatch } from "@/lib/jobs/runner";
import { getJobStats } from "@/lib/jobs/queue";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const limit = Math.min(100, Math.max(1, body.limit || 50));

    const result = await runJobBatch(limit);
    const stats = await getJobStats();

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    console.error("Job runner error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to run jobs",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
        { status: 401 }
      );
    }

    const result = await runJobBatch(50);
    const stats = await getJobStats();

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    console.error("Job runner error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to run jobs",
        },
      },
      { status: 500 }
    );
  }
}
