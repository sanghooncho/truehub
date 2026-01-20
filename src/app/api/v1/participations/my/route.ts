import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
type ParticipationStatus =
  | "SUBMITTED"
  | "AUTO_REJECTED"
  | "PENDING_REVIEW"
  | "MANUAL_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_INVALID_TOKEN", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      status: searchParams.get("status") || undefined,
    });

    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: { userId: string; status?: ParticipationStatus } = { userId };
    if (status) {
      where.status = status as ParticipationStatus;
    }

    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          rejectReason: true,
          campaign: {
            select: {
              id: true,
              title: true,
              rewardAmount: true,
              advertiser: {
                select: { companyName: true },
              },
            },
          },
        },
      }),
      prisma.participation.count({ where }),
    ]);

    const items = participations.map((p: (typeof participations)[number]) => ({
      id: p.id,
      campaign: {
        id: p.campaign.id,
        title: p.campaign.title,
        advertiserName: p.campaign.advertiser.companyName,
      },
      status: p.status,
      rewardAmount: p.campaign.rewardAmount,
      submittedAt: p.submittedAt.toISOString(),
      reviewedAt: p.reviewedAt?.toISOString() || null,
      rejectReason: p.rejectReason,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("My participations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch participations" },
      },
      { status: 500 }
    );
  }
}
