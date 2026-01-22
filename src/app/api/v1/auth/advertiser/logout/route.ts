import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 광고주 토큰 쿠키 삭제
  cookieStore.delete("advertiser-token");

  return NextResponse.json({ success: true });
}
