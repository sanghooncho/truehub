import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/db/prisma";

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && {
        status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
      }),
    };

    const [exchanges, total, stats] = await Promise.all([
      prisma.giftExchange.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          goodsCode: true,
          goodsName: true,
          brandName: true,
          goodsImageUrl: true,
          amount: true,
          discountPrice: true,
          pointsUsed: true,
          phoneNumber: true,
          status: true,
          orderNo: true,
          pinNo: true,
          couponImageUrl: true,
          validUntil: true,
          failReason: true,
          createdAt: true,
        },
      }),
      prisma.giftExchange.count({ where }),
      prisma.giftExchange.aggregate({
        where: { userId },
        _sum: {
          pointsUsed: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const userRewards = await prisma.reward.findMany({
      where: { userId },
      select: { amount: true, status: true },
    });

    const totalEarned = userRewards
      .filter((r) => r.status === "SENT")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalUsed = stats._sum.pointsUsed || 0;
    const availablePoints = totalEarned - totalUsed;

    const formattedExchanges = exchanges.map((e) => ({
      id: e.id,
      goodsCode: e.goodsCode,
      goodsName: e.goodsName,
      brandName: e.brandName,
      goodsImageUrl: e.goodsImageUrl,
      amount: e.amount,
      discountPrice: e.discountPrice,
      pointsUsed: e.pointsUsed,
      phoneNumber: maskPhone(e.phoneNumber),
      status: e.status,
      orderNo: e.orderNo,
      pinNo: e.status === "COMPLETED" ? e.pinNo : null,
      couponImageUrl: e.status === "COMPLETED" ? e.couponImageUrl : null,
      validUntil: e.validUntil?.toISOString() || null,
      failReason: e.failReason,
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        exchanges: formattedExchanges,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          totalEarned,
          totalUsed,
          availablePoints,
          totalExchanges: stats._count.id,
        },
      },
    });
  } catch (error) {
    console.error("GiftShop exchange history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "교환 내역을 불러오는데 실패했습니다" },
      },
      { status: 500 }
    );
  }
}

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}
