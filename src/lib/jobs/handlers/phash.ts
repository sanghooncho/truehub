import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/infra/db/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface PhashPayload {
  assetId: string;
  storageKey: string;
}

export async function calculatePhash(payload: PhashPayload): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from("screenshots").download(payload.storageKey);

  if (error || !data) {
    throw new Error(`Failed to download image: ${error?.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  const resized = await sharp(buffer).resize(8, 8, { fit: "fill" }).grayscale().raw().toBuffer();

  const pixels = Array.from(resized);
  const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  const bits = pixels.map((p) => (p >= mean ? "1" : "0")).join("");
  const hash = BigInt(`0b${bits}`).toString(16).padStart(16, "0");

  await prisma.participationAsset.update({
    where: { id: payload.assetId },
    data: { phash: hash },
  });

  return hash;
}

export function hammingDistance(hash1: string, hash2: string): number {
  const bin1 = parseInt(hash1, 16).toString(2).padStart(64, "0");
  const bin2 = parseInt(hash2, 16).toString(2).padStart(64, "0");

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) distance++;
  }

  return distance;
}

export async function findSimilarImages(
  phash: string,
  excludeAssetId: string,
  threshold: number = 10,
  sameUserId?: string
): Promise<{ assetId: string; distance: number }[]> {
  const assets = await prisma.participationAsset.findMany({
    where: {
      phash: { not: null },
      id: { not: excludeAssetId },
      ...(sameUserId && {
        participation: { userId: sameUserId },
      }),
    },
    select: { id: true, phash: true },
  });

  const similar: { assetId: string; distance: number }[] = [];

  for (const asset of assets) {
    if (!asset.phash) continue;
    const distance = hammingDistance(phash, asset.phash);
    if (distance <= threshold) {
      similar.push({ assetId: asset.id, distance });
    }
  }

  return similar.sort((a, b) => a.distance - b.distance);
}
