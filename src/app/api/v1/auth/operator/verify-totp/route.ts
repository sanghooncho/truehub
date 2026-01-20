import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import speakeasy from "speakeasy";
import { prisma } from "@/infra/db/prisma";
import { verifyTempToken, createOperatorToken } from "@/lib/operator-auth";

const verifyTotpSchema = z.object({
  tempToken: z.string().min(1),
  totpCode: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyTotpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
          },
        },
        { status: 400 }
      );
    }

    const { tempToken, totpCode } = validation.data;

    const operatorId = await verifyTempToken(tempToken, "totp");
    if (!operatorId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_TOKEN",
            message: "Invalid or expired token",
          },
        },
        { status: 401 }
      );
    }

    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
      select: {
        id: true,
        email: true,
        name: true,
        totpSecret: true,
        totpEnabled: true,
        isActive: true,
      },
    });

    if (!operator || !operator.isActive || !operator.totpSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_TOKEN",
            message: "Invalid operator state",
          },
        },
        { status: 401 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: operator.totpSecret,
      encoding: "base32",
      token: totpCode,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_TOTP",
            message: "Invalid TOTP code",
          },
        },
        { status: 401 }
      );
    }

    await prisma.operator.update({
      where: { id: operator.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createOperatorToken(operator.id);

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        operator: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
        },
      },
    });

    response.cookies.set("operator-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Verification failed",
        },
      },
      { status: 500 }
    );
  }
}
