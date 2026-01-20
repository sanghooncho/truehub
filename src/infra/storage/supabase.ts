import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_NAME = "screenshots";

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

export async function createSignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; expiresAt: Date }> {
  const ext = filename.split(".").pop() || "jpg";
  const key = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUploadUrl(key, {
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  return {
    uploadUrl: data.signedUrl,
    key,
    expiresAt,
  };
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(key, 60 * 60);

  if (error) {
    throw new Error(`Failed to create download URL: ${error.message}`);
  }

  return data.signedUrl;
}
