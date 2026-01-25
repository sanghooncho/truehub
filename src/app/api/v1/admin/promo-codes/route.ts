import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { z } from "zod";

const createSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Code must contain only letters, numbers, underscores, and hyphens"),
  amount: z.coerce
    .number()
    .int()
    .min(1000, "Minimum amount is 1,000")
    .max(1000000, "Maximum amount is 1,000,000"),
  maxUses: z.coerce.number().int().min(1, "Minimum 1 use").max(10000, "Maximum 10,000 uses"),
  description: z.string().max(200).optional(),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const activeOnly = searchParams.get("active") === "true";

    const where = activeOnly ? { isActive: true } : {};

    const [total, promoCodes, stats] = await Promise.all([
      prisma.promoCode.count({ where }),
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { redemptions: true },
          },
        },
      }),
      prisma.promoCode.aggregate({
        _count: { id: true },
        _sum: { currentUses: true },
        where: { isActive: true },
      }),
    ]);

    const totalActive = await prisma.promoCode.count({ where: { isActive: true } });

    return NextResponse.json({
      success: true,
      data: {
        items: promoCodes.map((p) => ({
          id: p.id,
          code: p.code,
          amount: p.amount,
          maxUses: p.maxUses,
          currentUses: p.currentUses,
          isActive: p.isActive,
          description: p.description,
          expiresAt: p.expiresAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
        })),
        stats: {
          total: await prisma.promoCode.count(),
          active: totalActive,
          totalRedemptions: stats._sum.currentUses || 0,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin promo codes list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch promo codes" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "DUPLICATE_CODE", message: "This promo code already exists" },
        },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        amount: data.amount,
        maxUses: data.maxUses,
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: promoCode.id,
        code: promoCode.code,
        amount: promoCode.amount,
        maxUses: promoCode.maxUses,
        currentUses: promoCode.currentUses,
        isActive: promoCode.isActive,
        description: promoCode.description,
        expiresAt: promoCode.expiresAt?.toISOString() || null,
        createdAt: promoCode.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Admin create promo code error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create promo code" },
      },
      { status: 500 }
    );
  }
}
