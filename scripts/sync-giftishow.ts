import "dotenv/config";
import { syncGiftishowGoods } from "../src/lib/jobs/handlers/giftishow-sync";

async function main() {
  console.log("Starting Giftishow sync...");
  const result = await syncGiftishowGoods();
  console.log("Sync completed:", JSON.stringify(result, null, 2));
  process.exit(result.errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
