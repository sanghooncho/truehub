import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";
import { calculateCreditCost } from "@/lib/config";

const updateCampaignSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  appLinkIos: z.string().url().optional().nullable(),
  appLinkAndroid: z.string().url().optional().nullable(),
  targetCount: z.number().int().min(10).max(10000).optional(),
  rewardAmount: z.number().int().min(1000).max(50000).optional(),
  endAt: z.string().datetime().optional(),
  screenshot1Mission: z.string().min(5).max(200).optional().nullable(),
  screenshot2Mission: z.string().min(5).max(200).optional().nullable(),
  screenshot1RefKey: z.string().optional().nullable(),
  screenshot2RefKey: z.string().optional().nullable(),
  questions: z
    .array(
      z.object({
        order: z.union([z.literal(1), z.literal(2)]),
        text: z.string().min(10).max(500),
      })
    )
    .length(2)
    .optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        questions: {
          orderBy: { questionOrder: "asc" },
        },
        participations: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMP_NOT_FOUND",
            message: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    if (campaign.advertiserId !== advertiser.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view this campaign",
          },
        },
        { status: 403 }
      );
    }

    const approvedCount = campaign.participations.filter(
      (p) => p.status === "APPROVED" || p.status === "PAID"
    ).length;
    const pendingCount = campaign.participations.filter(
      (p) =>
        p.status === "SUBMITTED" || p.status === "PENDING_REVIEW" || p.status === "MANUAL_REVIEW"
    ).length;
    const rejectedCount = campaign.participations.filter(
      (p) => p.status === "REJECTED" || p.status === "AUTO_REJECTED"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        appLinkIos: campaign.appLinkIos,
        appLinkAndroid: campaign.appLinkAndroid,
        targetCount: campaign.targetCount,
        currentCount: campaign.currentCount,
        rewardAmount: campaign.rewardAmount,
        creditCostPerValid: campaign.creditCostPerValid,
        screenshot1Mission: campaign.screenshot1Mission,
        screenshot2Mission: campaign.screenshot2Mission,
        screenshot1RefKey: campaign.screenshot1RefKey,
        screenshot2RefKey: campaign.screenshot2RefKey,
        status: campaign.status,
        startAt: campaign.startAt?.toISOString() || null,
        endAt: campaign.endAt.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        questions: campaign.questions.map((q) => ({
          order: q.questionOrder,
          text: q.questionText,
        })),
        stats: {
          total: campaign.participations.length,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    console.error("Campaign detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch campaign",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: "CAMP_NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    if (campaign.advertiserId !== advertiser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized" } },
        { status: 403 }
      );
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CAMP_NOT_EDITABLE", message: "Only DRAFT campaigns can be edited" },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.endAt) {
      const endAtDate = new Date(data.endAt);
      const now = new Date();
      if (endAtDate <= now) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "VALIDATION_ERROR", message: "End date must be in the future" },
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.questions) {
        await tx.campaignQuestion.deleteMany({ where: { campaignId } });
        await tx.campaignQuestion.createMany({
          data: data.questions.map((q) => ({
            campaignId,
            questionOrder: q.order,
            questionText: q.text,
          })),
        });
      }

      return tx.campaign.update({
        where: { id: campaignId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.appLinkIos !== undefined && { appLinkIos: data.appLinkIos }),
          ...(data.appLinkAndroid !== undefined && { appLinkAndroid: data.appLinkAndroid }),
          ...(data.targetCount && { targetCount: data.targetCount }),
          ...(data.rewardAmount && {
            rewardAmount: data.rewardAmount,
            creditCostPerValid: calculateCreditCost(data.rewardAmount),
          }),
          ...(data.endAt && { endAt: new Date(data.endAt) }),
          ...(data.screenshot1Mission !== undefined && {
            screenshot1Mission: data.screenshot1Mission,
          }),
          ...(data.screenshot2Mission !== undefined && {
            screenshot2Mission: data.screenshot2Mission,
          }),
          ...(data.screenshot1RefKey !== undefined && {
            screenshot1RefKey: data.screenshot1RefKey,
          }),
          ...(data.screenshot2RefKey !== undefined && {
            screenshot2RefKey: data.screenshot2RefKey,
          }),
        },
        include: { questions: { orderBy: { questionOrder: "asc" } } },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        message: "Campaign updated successfully",
      },
    });
  } catch (error) {
    console.error("Campaign update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update campaign" } },
      { status: 500 }
    );
  }
}
