import { NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { auth } from "@/lib/auth";

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

    const rewards = await prisma.reward.findMany({
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
    });

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

    const items = rewards
      .map((r) => {
        const campaign = r.participation?.campaign;
        const bonusTitle = getRewardTitle(r.type);

        // Skip if it's a PARTICIPATION type but campaign is missing (orphaned data)
        if (r.type === "PARTICIPATION" && !campaign) return null;

        return {
          id: r.id,
          type: r.type,
          campaign: campaign ? { id: campaign.id, title: campaign.title } : null,
          title: bonusTitle || campaign?.title || "리워드",
          amount: r.amount,
          status: r.status,
          sentAt: r.sentAt?.toISOString() || null,
          createdAt: r.createdAt.toISOString(),
        };
      })
      .filter((item) => item !== null);

    const totalEarned = rewards
      .filter((r) => r.status === "SENT")
      .reduce((sum, r) => sum + r.amount, 0);

    const totalPending = rewards
      .filter((r) => r.status === "REQUESTED")
      .reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalEarned,
        totalPending,
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
