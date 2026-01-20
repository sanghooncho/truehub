import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

const BUCKET_NAME = "screenshots";

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
});

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request" } },
        { status: 400 }
      );
    }

    const { filename, contentType } = validation.data;
    const ext = filename.split(".").pop() || "jpg";
    const key = `campaign-refs/${advertiser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUploadUrl(key, {
      upsert: false,
    });

    if (error) {
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: data.signedUrl,
        key,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create upload URL" } },
      { status: 500 }
    );
  }
}
