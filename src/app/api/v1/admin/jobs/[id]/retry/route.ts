import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: "Job not found",
          },
        },
        { status: 404 }
      );
    }

    if (job.status !== "FAILED" && job.status !== "DEAD") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "JOB_INVALID_STATUS",
            message: "Only failed or dead jobs can be retried",
          },
        },
        { status: 400 }
      );
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        errorMessage: null,
        failedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        operatorId: operator.id,
        action: "RETRY_JOB",
        targetType: "job",
        targetId: jobId,
        details: {
          previousStatus: job.status,
          jobType: job.type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Job queued for retry",
      },
    });
  } catch (error) {
    console.error("Job retry error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retry job",
        },
      },
      { status: 500 }
    );
  }
}
