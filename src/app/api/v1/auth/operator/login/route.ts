import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/infra/db/prisma";
import { createTempToken } from "@/lib/operator-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

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

    const { email, password } = validation.data;

    const operator = await prisma.operator.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        totpSecret: true,
        totpEnabled: true,
        isActive: true,
      },
    });

    if (!operator || !operator.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, operator.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    if (operator.totpEnabled && operator.totpSecret) {
      const tempToken = await createTempToken(operator.id, "totp");
      return NextResponse.json({
        success: true,
        data: {
          requiresTotp: true,
          tempToken,
        },
      });
    }

    const secret = speakeasy.generateSecret({
      name: `TrueHub:${operator.email}`,
      length: 20,
    });

    await prisma.operator.update({
      where: { id: operator.id },
      data: { totpSecret: secret.base32 },
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");
    const tempToken = await createTempToken(operator.id, "setup");

    return NextResponse.json({
      success: true,
      data: {
        requiresTotp: false,
        requiresTotpSetup: true,
        tempToken,
        totpSecret: secret.base32,
        totpQrCode: qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error("Operator login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Login failed",
        },
      },
      { status: 500 }
    );
  }
}
