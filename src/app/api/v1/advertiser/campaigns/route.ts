import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CampaignStatus, ParticipationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";
import { calculateCreditCost } from "@/lib/config";

const createCampaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be at most 2000 characters"),
  appLinkIos: z.string().url("Invalid iOS app link").optional().nullable(),
  appLinkAndroid: z.string().url("Invalid Android app link").optional().nullable(),
  targetCount: z
    .number()
    .int()
    .min(10, "Target count must be at least 10")
    .max(10000, "Target count must be at most 10000"),
  rewardAmount: z
    .number()
    .int()
    .min(1000, "Reward must be at least 1000 KRW")
    .max(50000, "Reward must be at most 50000 KRW"),
  endAt: z.string().datetime({ message: "Invalid date format" }),
  screenshot1Mission: z
    .string()
    .min(5, "Mission must be at least 5 characters")
    .max(200, "Mission must be at most 200 characters")
    .optional()
    .nullable(),
  screenshot2Mission: z
    .string()
    .min(5, "Mission must be at least 5 characters")
    .max(200, "Mission must be at most 200 characters")
    .optional()
    .nullable(),
  screenshot1RefKey: z.string().optional().nullable(),
  screenshot2RefKey: z.string().optional().nullable(),
  questions: z
    .array(
      z.object({
        order: z.union([z.literal(1), z.literal(2)]),
        text: z
          .string()
          .min(10, "Question must be at least 10 characters")
          .max(500, "Question must be at most 500 characters"),
      })
    )
    .length(2, "Exactly 2 questions required"),
});

export async function POST(request: NextRequest) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
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

    const body = await request.json();
    const validation = createCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const creditCostPerValid = calculateCreditCost(data.rewardAmount);

    const endAtDate = new Date(data.endAt);
    const now = new Date();
    const maxEndDate = new Date();
    maxEndDate.setDate(maxEndDate.getDate() + 90);

    if (endAtDate <= now) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "End date must be in the future",
          },
        },
        { status: 400 }
      );
    }

    if (endAtDate > maxEndDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "End date must be within 90 days from now",
          },
        },
        { status: 400 }
      );
    }

    const orders = data.questions.map((q) => q.order).sort();
    if (orders[0] !== 1 || orders[1] !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Questions must have orders 1 and 2",
          },
        },
        { status: 400 }
      );
    }

    const campaign = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newCampaign = await tx.campaign.create({
        data: {
          advertiserId: advertiser.id,
          title: data.title,
          description: data.description,
          appLinkIos: data.appLinkIos || null,
          appLinkAndroid: data.appLinkAndroid || null,
          targetCount: data.targetCount,
          rewardAmount: data.rewardAmount,
          creditCostPerValid,
          screenshot1Mission: data.screenshot1Mission || null,
          screenshot2Mission: data.screenshot2Mission || null,
          screenshot1RefKey: data.screenshot1RefKey || null,
          screenshot2RefKey: data.screenshot2RefKey || null,
          endAt: endAtDate,
          status: "DRAFT",
          questions: {
            create: data.questions.map((q) => ({
              questionOrder: q.order,
              questionText: q.text,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      return newCampaign;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        status: campaign.status,
        message: "Campaign created. Publish when ready.",
      },
    });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create campaign",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
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
    const statusFilter = searchParams.get("status");

    const where = statusFilter
      ? { advertiserId: advertiser.id, status: statusFilter as CampaignStatus }
      : { advertiserId: advertiser.id };

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          participations: {
            select: {
              status: true,
            },
          },
        },
      }),
    ]);

    const items = campaigns.map((campaign) => {
      const approvedCount = campaign.participations.filter(
        (p) => p.status === ParticipationStatus.APPROVED || p.status === ParticipationStatus.PAID
      ).length;
      const pendingCount = campaign.participations.filter(
        (p) =>
          p.status === ParticipationStatus.SUBMITTED ||
          p.status === ParticipationStatus.PENDING_REVIEW ||
          p.status === ParticipationStatus.MANUAL_REVIEW
      ).length;

      return {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        targetCount: campaign.targetCount,
        currentCount: campaign.currentCount,
        approvedCount,
        pendingCount,
        rewardAmount: campaign.rewardAmount,
        creditCostPerValid: campaign.creditCostPerValid,
        totalCost: approvedCount * campaign.creditCostPerValid,
        endAt: campaign.endAt.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
      };
    });

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
    console.error("Campaign list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch campaigns",
        },
      },
      { status: 500 }
    );
  }
}
