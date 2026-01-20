import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const operator = await getOperatorFromRequest(request);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        advertiser: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        questions: {
          orderBy: { questionOrder: "asc" },
        },
        participations: {
          orderBy: { submittedAt: "desc" },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profileName: true,
              },
            },
          },
        },
        aiInsights: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const participationStats = await prisma.participation.groupBy({
      by: ["status"],
      where: { campaignId: id },
      _count: { id: true },
    });

    const stats = {
      total: 0,
      submitted: 0,
      pendingReview: 0,
      manualReview: 0,
      approved: 0,
      rejected: 0,
      autoRejected: 0,
      paid: 0,
    };

    participationStats.forEach((s) => {
      const count = s._count.id;
      stats.total += count;
      switch (s.status) {
        case "SUBMITTED":
          stats.submitted = count;
          break;
        case "PENDING_REVIEW":
          stats.pendingReview = count;
          break;
        case "MANUAL_REVIEW":
          stats.manualReview = count;
          break;
        case "APPROVED":
          stats.approved = count;
          break;
        case "REJECTED":
          stats.rejected = count;
          break;
        case "AUTO_REJECTED":
          stats.autoRejected = count;
          break;
        case "PAID":
          stats.paid = count;
          break;
      }
    });

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
        startAt: campaign.startAt,
        endAt: campaign.endAt,
        closedAt: campaign.closedAt,
        completedAt: campaign.completedAt,
        createdAt: campaign.createdAt,
        advertiser: campaign.advertiser,
        questions: campaign.questions.map((q) => ({
          id: q.id,
          order: q.questionOrder,
          text: q.questionText,
        })),
        participations: campaign.participations.map((p) => ({
          id: p.id,
          user: p.user,
          status: p.status,
          fraudScore: p.fraudScore,
          fraudDecision: p.fraudDecision,
          submittedAt: p.submittedAt,
          reviewedAt: p.reviewedAt,
        })),
        latestInsight: campaign.aiInsights[0] || null,
        stats,
      },
    });
  } catch (error) {
    console.error("Failed to fetch campaign detail:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch campaign" } },
      { status: 500 }
    );
  }
}
