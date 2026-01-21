import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  businessType: z.enum(["INDIVIDUAL", "SOLE_PROPRIETOR", "CORPORATION"]).optional(),
  contactName: z.string().max(50).optional(),
  contactPhone: z.string().max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const passwordHash = await bcrypt.hash(data.password, 12);

    const SIGNUP_BONUS_AMOUNT = 10000;

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
          balance: SIGNUP_BONUS_AMOUNT,
          totalTopup: SIGNUP_BONUS_AMOUNT,
          totalConsumed: 0,
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "BONUS",
          amount: SIGNUP_BONUS_AMOUNT,
          balanceAfter: SIGNUP_BONUS_AMOUNT,
          refType: "signup_bonus",
          description: "가입 보너스",
        },
      });

      return newAdvertiser;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: advertiser.id,
        email: advertiser.email,
        companyName: advertiser.companyName,
        message: "Registration successful. Please login.",
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
