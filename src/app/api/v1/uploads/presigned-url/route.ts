import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSignedUploadUrl } from "@/infra/storage/supabase";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const requestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSize: z.number().min(1).max(MAX_FILE_SIZE),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_INVALID_TOKEN", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    const result = await createSignedUploadUrl(session.user.id, data.filename, data.contentType);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        key: result.key,
        expiresAt: result.expiresAt.toISOString(),
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

    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create upload URL" } },
      { status: 500 }
    );
  }
}
