import { Job, JobType } from "@prisma/client";
import { getPendingJobs, markJobProcessing, markJobCompleted, markJobFailed } from "./queue";
import { calculatePhash, PhashPayload } from "./handlers/phash";
import { calculateSha256, Sha256Payload } from "./handlers/sha256";
import { calculateFraudScore, FraudCheckPayload } from "./handlers/fraud-check";
import { generateAiInsight, AiInsightPayload } from "./handlers/ai-insight";
import { sendEmail, EmailPayload } from "./handlers/email";
import { verifyScreenshots, ScreenshotVerifyPayload } from "./handlers/screenshot-verify";
import { syncGiftishowGoods, GiftishowSyncPayload } from "./handlers/giftishow-sync";

type JobHandler = (payload: unknown) => Promise<unknown>;

const handlers: Record<JobType, JobHandler> = {
  [JobType.PHASH_CALC]: async (payload) => {
    const p = payload as PhashPayload;
    const [phash, sha256] = await Promise.all([
      calculatePhash(p),
      calculateSha256(p as Sha256Payload),
    ]);
    return { phash, sha256 };
  },
  [JobType.FRAUD_CHECK]: async (payload) => calculateFraudScore(payload as FraudCheckPayload),
  [JobType.AI_REPORT]: async (payload) => generateAiInsight(payload as AiInsightPayload),
  [JobType.SEND_EMAIL]: async (payload) => sendEmail(payload as EmailPayload),
  [JobType.TEXT_SIMILARITY]: async () => {
    throw new Error("TEXT_SIMILARITY not implemented");
  },
  [JobType.SCREENSHOT_VERIFY]: async (payload) =>
    verifyScreenshots(payload as ScreenshotVerifyPayload),
  [JobType.GIFT_EXCHANGE]: async () => {
    throw new Error("GIFT_EXCHANGE is handled synchronously in API");
  },
  [JobType.GIFTISHOW_SYNC]: async (payload) => syncGiftishowGoods(payload as GiftishowSyncPayload),
};

export async function processJob(job: Job): Promise<void> {
  const handler = handlers[job.type];
  if (!handler) {
    throw new Error(`No handler for job type: ${job.type}`);
  }

  await markJobProcessing(job.id);

  try {
    const result = await handler(job.payload);
    await markJobCompleted(job.id, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await markJobFailed(job.id, message);
    throw error;
  }
}

export async function runJobBatch(
  limit: number = 50
): Promise<{ processed: number; failed: number }> {
  const jobs = await getPendingJobs(limit);

  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await processJob(job);
      processed++;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      failed++;
    }
  }

  return { processed, failed };
}

export async function processHashJobs(): Promise<void> {
  const { calculateSha256: calcSha256 } = await import("./handlers/sha256");

  const jobs = await getPendingJobs(50);
  const hashJobs = jobs.filter((j) => j.type === JobType.PHASH_CALC);

  for (const job of hashJobs) {
    await markJobProcessing(job.id);
    try {
      const payload = job.payload as { assetId: string; storageKey: string };
      const [phash] = await Promise.all([calculatePhash(payload), calcSha256(payload)]);
      await markJobCompleted(job.id, { phash });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await markJobFailed(job.id, message);
    }
  }
}
