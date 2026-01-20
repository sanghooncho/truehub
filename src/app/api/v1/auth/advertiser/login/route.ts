import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");
const JWT_EXPIRES_IN = "7d";

async function generateToken(payload: { id: string; email: string; type: "advertiser" }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const advertiser = await prisma.advertiser.findUnique({
      where: { email: data.email },
      include: {
        creditWallet: {
          select: { balance: true },
        },
      },
    });

    if (!advertiser) {
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

    if (!advertiser.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_ACCOUNT_DISABLED",
            message: "Account is disabled",
          },
        },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(data.password, advertiser.passwordHash);

    if (!isValidPassword) {
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

    const token = await generateToken({
      id: advertiser.id,
      email: advertiser.email,
      type: "advertiser",
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        advertiser: {
          id: advertiser.id,
          email: advertiser.email,
          companyName: advertiser.companyName,
          creditBalance: advertiser.creditWallet?.balance ?? 0,
        },
      },
    });

    response.cookies.set("advertiser-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
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

    console.error("Advertiser login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to login",
        },
      },
      { status: 500 }
    );
  }
}
