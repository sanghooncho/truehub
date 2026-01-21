import { NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";

interface PointHistoryItem {
  id: string;
  transactionType: "earned" | "spent";
  title: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

export async function GET() {
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

    const [rewards, exchanges] = await Promise.all([
      prisma.reward.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          sentAt: true,
          createdAt: true,
          participation: {
            select: {
              campaign: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
      prisma.giftExchange.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          goodsName: true,
          brandName: true,
          pointsUsed: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const getRewardTitle = (type: string) => {
      switch (type) {
        case "SIGNUP_BONUS":
          return "가입 축하 보너스";
        case "REFERRAL_BONUS":
          return "추천인 보너스";
        default:
          return null;
      }
    };

    type RewardItem = (typeof rewards)[number];
    type ExchangeItem = (typeof exchanges)[number];

    const earnedItems: PointHistoryItem[] = rewards
      .filter((r: RewardItem) => !(r.type === "PARTICIPATION" && !r.participation?.campaign))
      .map((r: RewardItem) => {
        const campaign = r.participation?.campaign;
        const bonusTitle = getRewardTitle(r.type);

        return {
          id: `reward-${r.id}`,
          transactionType: "earned" as const,
          title: bonusTitle || campaign?.title || "리워드",
          description: r.type === "PARTICIPATION" ? "캠페인 참여 보상" : null,
          amount: r.amount,
          status: r.status as string,
          createdAt: r.createdAt.toISOString(),
        };
      });

    const spentItems: PointHistoryItem[] = exchanges
      .filter((e: ExchangeItem) => e.status !== "FAILED" && e.status !== "CANCELLED")
      .map((e: ExchangeItem) => ({
        id: `exchange-${e.id}`,
        transactionType: "spent" as const,
        title: e.goodsName,
        description: e.brandName,
        amount: e.pointsUsed,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      }));

    const allItems = [...earnedItems, ...spentItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalEarned = rewards
      .filter((r: RewardItem) => r.status === "SENT")
      .reduce((sum: number, r: RewardItem) => sum + r.amount, 0);

    const totalPending = rewards
      .filter((r: RewardItem) => r.status === "REQUESTED")
      .reduce((sum: number, r: RewardItem) => sum + r.amount, 0);

    const totalSpent = exchanges
      .filter((e: ExchangeItem) => e.status !== "FAILED" && e.status !== "CANCELLED")
      .reduce((sum: number, e: ExchangeItem) => sum + e.pointsUsed, 0);

    const availablePoints = totalEarned - totalSpent;

    return NextResponse.json({
      success: true,
      data: {
        items: allItems,
        summary: {
          availablePoints,
          totalEarned,
          totalPending,
          totalSpent,
        },
      },
    });
  } catch (error) {
    console.error("My rewards error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch rewards" },
      },
      { status: 500 }
    );
  }
}
