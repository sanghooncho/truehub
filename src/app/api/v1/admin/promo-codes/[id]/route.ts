import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getOperatorFromRequest } from "@/lib/operator-auth";
import { z } from "zod";

const updateSchema = z.object({
  amount: z.coerce.number().int().min(1000).max(1000000).optional(),
  maxUses: z.coerce.number().int().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(200).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        redemptions: {
          include: {
            advertiser: {
              select: { id: true, email: true, companyName: true },
            },
          },
          orderBy: { redeemedAt: "desc" },
          take: 50,
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Promo code not found" } },
        { status: 404 }
      );
    }

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
        redemptions: promoCode.redemptions.map((r) => ({
          id: r.id,
          advertiser: {
            id: r.advertiser.id,
            email: r.advertiser.email,
            companyName: r.advertiser.companyName,
          },
          redeemedAt: r.redeemedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Admin get promo code error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch promo code" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Promo code not found" } },
        { status: 404 }
      );
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
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

    console.error("Admin update promo code error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update promo code" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const operator = await getOperatorFromRequest(request);
    if (!operator) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Promo code not found" } },
        { status: 404 }
      );
    }

    if (existing.currentUses > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "HAS_REDEMPTIONS",
            message: "Cannot delete promo code with existing redemptions. Deactivate it instead.",
          },
        },
        { status: 400 }
      );
    }

    await prisma.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Admin delete promo code error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete promo code" } },
      { status: 500 }
    );
  }
}
