import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/db/prisma";

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    const pendingParticipations = await prisma.participation.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"] },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다." },
        },
        { status: 404 }
      );
    }

    if (user.deletedAt) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_DELETED", message: "이미 탈퇴한 계정입니다." } },
        { status: 400 }
      );
    }

    if (pendingParticipations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PENDING_PARTICIPATION",
            message:
              "심사 대기 중인 참여가 있어 탈퇴할 수 없습니다. 심사 완료 후 다시 시도해주세요.",
          },
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: { message: "회원 탈퇴가 완료되었습니다." },
    });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "탈퇴 처리 중 오류가 발생했습니다." },
      },
      { status: 500 }
    );
  }
}
