import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { enqueueJob } from "@/lib/jobs/queue";

const rejectSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

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

    const { id: participationId } = await params;

    const body = await request.json();
    const validation = rejectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Rejection reason is required",
          },
        },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PART_NOT_FOUND",
            message: "Participation not found",
          },
        },
        { status: 404 }
      );
    }

    const validStatuses = ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"];
    if (!validStatuses.includes(participation.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PART_INVALID_STATUS",
            message: "Participation cannot be rejected in current status",
          },
        },
        { status: 400 }
      );
    }

    await prisma.participation.update({
      where: { id: participationId },
      data: {
        status: "REJECTED",
        reviewerId: operator.id,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });

    await prisma.auditLog.create({
      data: {
        operatorId: operator.id,
        action: "REJECT_PARTICIPATION",
        targetType: "participation",
        targetId: participationId,
        details: {
          campaignId: participation.campaignId,
          reason,
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: participation.userId },
      select: { email: true },
    });

    if (user?.email) {
      await enqueueJob({
        type: "SEND_EMAIL",
        priority: "MEDIUM",
        payload: {
          templateType: "PARTICIPATION_REJECTED",
          recipientEmail: user.email,
          recipientType: "user",
          recipientId: participation.userId,
          data: {
            campaignTitle: participation.campaign.title,
            rejectReason: reason,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: "REJECTED",
        message: "Participation rejected",
      },
    });
  } catch (error) {
    console.error("Reject participation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reject participation",
        },
      },
      { status: 500 }
    );
  }
}
