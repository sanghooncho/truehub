import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/infra/db/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");
const TEMP_TOKEN_SECRET = new TextEncoder().encode(
  (process.env.NEXTAUTH_SECRET || "fallback-secret") + "-temp"
);

export interface OperatorSession {
  id: string;
  email: string;
  name: string;
}

export async function getOperatorSession(): Promise<OperatorSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("operator-token")?.value;

    if (!token) {
      return null;
    }

    return verifyAndGetOperator(token);
  } catch {
    return null;
  }
}

export async function getOperatorFromRequest(
  request: NextRequest
): Promise<OperatorSession | null> {
  try {
    const cookieToken = request.cookies.get("operator-token")?.value;
    const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return null;
    }

    return verifyAndGetOperator(token);
  } catch {
    return null;
  }
}

async function verifyAndGetOperator(token: string): Promise<OperatorSession | null> {
  const { payload } = await jwtVerify(token, JWT_SECRET);

  if (payload.type !== "operator") {
    return null;
  }

  const operator = await prisma.operator.findUnique({
    where: { id: payload.id as string },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });

  if (!operator || !operator.isActive) {
    return null;
  }

  return {
    id: operator.id,
    email: operator.email,
    name: operator.name,
  };
}

export async function createOperatorToken(operatorId: string): Promise<string> {
  return new SignJWT({ id: operatorId, type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function createTempToken(
  operatorId: string,
  purpose: "totp" | "setup"
): Promise<string> {
  return new SignJWT({ id: operatorId, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(TEMP_TOKEN_SECRET);
}

export async function verifyTempToken(
  token: string,
  expectedPurpose: "totp" | "setup"
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, TEMP_TOKEN_SECRET);

    if (payload.purpose !== expectedPurpose) {
      return null;
    }

    return payload.id as string;
  } catch {
    return null;
  }
}
