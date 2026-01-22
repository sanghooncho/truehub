import { NextRequest, NextResponse } from "next/server";
import { syncGiftishowGoods } from "@/lib/jobs/handlers/giftishow-sync";

async function handleSync(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || process.env.JOBS_API_KEY;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid authorization" } },
        { status: 401 }
      );
    }

    const result = await syncGiftishowGoods();

    return NextResponse.json({
      success: result.errors.length === 0,
      data: result,
    });
  } catch (error) {
    console.error("Giftishow sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}
