import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const campaignId = "549807fe-5dfb-42f0-8f4d-5081f43e068e";

  console.log("=== 참여 및 리워드 조회 ===\n");

  const participations = await prisma.participation.findMany({
    where: { campaignId },
    include: { reward: true },
  });

  for (const p of participations) {
    console.log(`참여 ID: ${p.id}`);
    console.log(`Status: ${p.status}`);
    if (p.reward) {
      console.log(`Reward: ${p.reward.id} (${p.reward.status})`);
    } else {
      console.log(`Reward: 없음`);
    }
    console.log("---");
  }

  const needsFix = participations.filter(
    (p) => ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"].includes(p.status) && p.reward !== null
  );

  if (needsFix.length > 0) {
    console.log(`\n⚠️ 수정 필요한 참여 ${needsFix.length}건 발견!`);
    console.log("리워드 삭제 중...\n");

    for (const p of needsFix) {
      if (p.reward) {
        await prisma.reward.delete({ where: { id: p.reward.id } });
        console.log(`✅ 삭제됨: Reward ${p.reward.id}`);
      }
    }

    console.log("\n완료! 이제 승인 버튼이 정상 작동합니다.");
  } else {
    console.log("\n✅ 수정할 항목 없음");
  }
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
