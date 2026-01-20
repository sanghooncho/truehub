import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/infra/db/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export interface AdvertiserSession {
  id: string;
  email: string;
  companyName: string;
  creditBalance: number;
}

export async function getAdvertiserSession(): Promise<AdvertiserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("advertiser-token")?.value;

    if (!token) {
      return null;
    }

    return verifyAndGetAdvertiser(token);
  } catch {
    return null;
  }
}

export async function getAdvertiserFromRequest(
  request: NextRequest
): Promise<AdvertiserSession | null> {
  try {
    const cookieToken = request.cookies.get("advertiser-token")?.value;
    const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return null;
    }

    return verifyAndGetAdvertiser(token);
  } catch {
    return null;
  }
}

async function verifyAndGetAdvertiser(token: string): Promise<AdvertiserSession | null> {
  const { payload } = await jwtVerify(token, JWT_SECRET);

  if (payload.type !== "advertiser") {
    return null;
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { id: payload.id as string },
    select: {
      id: true,
      email: true,
      companyName: true,
      isActive: true,
      creditWallet: {
        select: { balance: true },
      },
    },
  });

  if (!advertiser || !advertiser.isActive) {
    return null;
  }

  return {
    id: advertiser.id,
    email: advertiser.email,
    companyName: advertiser.companyName,
    creditBalance: advertiser.creditWallet?.balance ?? 0,
  };
}
