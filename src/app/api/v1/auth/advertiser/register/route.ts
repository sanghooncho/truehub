import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .regex(/[A-Z]/, "비밀번호에 대문자를 포함해주세요")
    .regex(/[0-9]/, "비밀번호에 숫자를 포함해주세요"),
  companyName: z.string().min(2, "회사명은 2자 이상이어야 합니다").max(100, "회사명이 너무 깁니다"),
  businessType: z.enum(["INDIVIDUAL", "SOLE_PROPRIETOR", "CORPORATION"]).optional(),
  contactName: z.string().max(50).optional(),
  contactPhone: z.string().max(20).optional(),
  promoCode: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.promoCode === "") delete body.promoCode;
    if (body.contactName === "") delete body.contactName;
    if (body.contactPhone === "") delete body.contactPhone;

    const data = registerSchema.parse(body);

    const existingAdvertiser = await prisma.advertiser.findUnique({
      where: { email: data.email },
    });

    if (existingAdvertiser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_EMAIL_EXISTS",
            message: "Email already registered",
          },
        },
        { status: 400 }
      );
    }

    let promoCode = null;
    if (data.promoCode) {
      promoCode = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase() },
      });

      if (!promoCode) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "INVALID_PROMO_CODE", message: "Invalid promo code" },
          },
          { status: 400 }
        );
      }

      if (!promoCode.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "INVALID_PROMO_CODE", message: "This promo code is no longer active" },
          },
          { status: 400 }
        );
      }

      if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "PROMO_CODE_EXPIRED", message: "This promo code has expired" },
          },
          { status: 400 }
        );
      }

      if (promoCode.currentUses >= promoCode.maxUses) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PROMO_CODE_EXHAUSTED",
              message: "This promo code has reached its usage limit",
            },
          },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const bonusAmount = promoCode?.amount ?? 0;

    const advertiser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newAdvertiser = await tx.advertiser.create({
        data: {
          email: data.email,
          passwordHash,
          companyName: data.companyName,
          businessType: data.businessType,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
        },
      });

      const wallet = await tx.creditWallet.create({
        data: {
          advertiserId: newAdvertiser.id,
          balance: bonusAmount,
          totalTopup: bonusAmount,
          totalConsumed: 0,
        },
      });

      if (promoCode && bonusAmount > 0) {
        await tx.creditTransaction.create({
          data: {
            walletId: wallet.id,
            type: "BONUS",
            amount: bonusAmount,
            balanceAfter: bonusAmount,
            refType: "promo_code",
            refId: promoCode.id,
            description: `프로모션 코드 보너스 (${promoCode.code})`,
          },
        });

        await tx.promoCode.update({
          where: { id: promoCode.id },
          data: { currentUses: { increment: 1 } },
        });

        await tx.promoRedemption.create({
          data: {
            promoCodeId: promoCode.id,
            advertiserId: newAdvertiser.id,
          },
        });
      }

      return newAdvertiser;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: advertiser.id,
        email: advertiser.email,
        companyName: advertiser.companyName,
        bonusAmount,
        message:
          bonusAmount > 0
            ? `Registration successful. ${bonusAmount.toLocaleString()}원 bonus credited!`
            : "Registration successful. Please login.",
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

    console.error("Advertiser registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to register advertiser",
        },
      },
      { status: 500 }
    );
  }
}
