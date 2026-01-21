import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

export async function GET(request: NextRequest) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const wallet = await prisma.creditWallet.findUnique({
      where: { advertiserId: advertiser.id },
    });

    if (!wallet) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          summary: { totalConsumed: 0, byCampaign: [] },
        },
      });
    }

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { walletId: wallet.id, type: "CONSUME" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creditTransaction.count({
        where: { walletId: wallet.id, type: "CONSUME" },
      }),
    ]);

    const participationIds = transactions
      .filter((t) => t.refType === "participation" && t.refId)
      .map((t) => t.refId as string);

    const participations = await prisma.participation.findMany({
      where: { id: { in: participationIds } },
      include: {
        campaign: { select: { id: true, title: true } },
        user: { select: { id: true, profileName: true } },
      },
    });

    const participationMap = new Map(participations.map((p) => [p.id, p]));

    const items = transactions.map((t) => {
      const participation = t.refId ? participationMap.get(t.refId) : null;
      return {
        id: t.id,
        amount: Math.abs(t.amount),
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt.toISOString(),
        campaign: participation?.campaign
          ? { id: participation.campaign.id, title: participation.campaign.title }
          : null,
        tester: participation?.user
          ? { id: participation.user.id, name: participation.user.profileName || "익명" }
          : null,
      };
    });

    const allTransactions = await prisma.creditTransaction.findMany({
      where: { walletId: wallet.id, type: "CONSUME" },
      select: { refId: true, amount: true },
    });

    const allParticipationIds = allTransactions
      .filter((t) => t.refId)
      .map((t) => t.refId as string);

    const allParticipations = await prisma.participation.findMany({
      where: { id: { in: allParticipationIds } },
      include: { campaign: { select: { id: true, title: true } } },
    });

    const allParticipationMap = new Map(allParticipations.map((p) => [p.id, p]));

    const campaignStats = new Map<
      string,
      { id: string; title: string; count: number; total: number }
    >();
    for (const t of allTransactions) {
      const participation = t.refId ? allParticipationMap.get(t.refId) : null;
      if (participation?.campaign) {
        const existing = campaignStats.get(participation.campaign.id);
        if (existing) {
          existing.count += 1;
          existing.total += Math.abs(t.amount);
        } else {
          campaignStats.set(participation.campaign.id, {
            id: participation.campaign.id,
            title: participation.campaign.title,
            count: 1,
            total: Math.abs(t.amount),
          });
        }
      }
    }

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
        summary: {
          totalConsumed: wallet.totalConsumed,
          byCampaign: Array.from(campaignStats.values()).sort((a, b) => b.total - a.total),
        },
      },
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch transactions" },
      },
      { status: 500 }
    );
  }
}
