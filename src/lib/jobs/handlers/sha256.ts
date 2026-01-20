import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/infra/db/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface Sha256Payload {
  assetId: string;
  storageKey: string;
}

export async function calculateSha256(payload: Sha256Payload): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from("screenshots").download(payload.storageKey);

  if (error || !data) {
    throw new Error(`Failed to download image: ${error?.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  await prisma.participationAsset.update({
    where: { id: payload.assetId },
    data: { sha256: hash },
  });

  return hash;
}

export async function findDuplicateImages(
  sha256: string,
  excludeAssetId: string
): Promise<string[]> {
  const duplicates = await prisma.participationAsset.findMany({
    where: {
      sha256,
      id: { not: excludeAssetId },
    },
    select: { id: true },
  });

  return duplicates.map((d) => d.id);
}
