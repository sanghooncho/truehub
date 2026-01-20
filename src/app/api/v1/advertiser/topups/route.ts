import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

const createTopupSchema = z.object({
  amount: z.number().int().min(10000, "Minimum 10,000 KRW").max(10000000, "Maximum 10,000,000 KRW"),
  method: z.enum(["BANK_TRANSFER", "STRIPE"]),
});

function generateDepositCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
    const validation = createTopupSchema.safeParse(body);

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

    const { amount, method } = validation.data;

    const pendingTopup = await prisma.topupRequest.findFirst({
      where: {
        advertiserId: advertiser.id,
        status: "PENDING",
      },
    });

    if (pendingTopup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOPUP_PENDING_EXISTS",
            message: "You have a pending top-up request. Please wait for it to be processed.",
          },
        },
        { status: 400 }
      );
    }

    const depositCode = generateDepositCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const topup = await prisma.topupRequest.create({
      data: {
        advertiserId: advertiser.id,
        amount,
        method,
        depositCode,
        status: "PENDING",
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: topup.id,
        amount: topup.amount,
        method: topup.method,
        depositCode: topup.depositCode,
        expiresAt: topup.expiresAt.toISOString(),
        bankInfo:
          method === "BANK_TRANSFER"
            ? {
                bankName: "신한은행",
                accountNumber: "110-397-512270",
                accountHolder: "조상훈",
                depositMessage: `${depositCode} 입금`,
              }
            : null,
        message: "Top-up request created. Please complete the payment.",
      },
    });
  } catch (error) {
    console.error("Top-up request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create top-up request",
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

    const [total, topups] = await Promise.all([
      prisma.topupRequest.count({ where: { advertiserId: advertiser.id } }),
      prisma.topupRequest.findMany({
        where: { advertiserId: advertiser.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: topups.map((t) => ({
          id: t.id,
          amount: t.amount,
          method: t.method,
          depositCode: t.depositCode,
          status: t.status,
          expiresAt: t.expiresAt.toISOString(),
          confirmedAt: t.confirmedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Top-up list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch top-ups",
        },
      },
      { status: 500 }
    );
  }
}
