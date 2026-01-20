import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding test data...\n");

  // 1. Create test advertiser
  console.log("Creating test advertiser...");
  const advertiser = await prisma.advertiser.upsert({
    where: { email: "advertiser@test.com" },
    update: {},
    create: {
      email: "advertiser@test.com",
      passwordHash: await bcrypt.hash("test1234", 12),
      companyName: "(주)테스트컴퍼니",
      businessType: "CORPORATION",
      contactName: "김테스트",
      contactPhone: "010-1234-5678",
    },
  });
  console.log(`  ✓ Advertiser: ${advertiser.email}`);

  // Ensure credit wallet exists
  console.log("Ensuring credit wallet...");
  await prisma.creditWallet.upsert({
    where: { advertiserId: advertiser.id },
    update: {
      balance: 500000,
      totalTopup: 500000,
    },
    create: {
      advertiserId: advertiser.id,
      balance: 500000,
      totalTopup: 500000,
      totalConsumed: 0,
    },
  });
  console.log(`  ✓ Credit wallet: 500,000원`);

  // 2. Create admin operator
  console.log("\nCreating admin operator...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@truehub.kr";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  const operator = await prisma.operator.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: process.env.ADMIN_NAME || "Admin",
      totpEnabled: false,
    },
  });
  console.log(`  ✓ Operator: ${operator.email}`);

  console.log("\n✅ Seed completed!\n");
  console.log("=".repeat(50));
  console.log("Test Accounts:");
  console.log("=".repeat(50));
  console.log(`\n📱 Advertiser Login:`);
  console.log(`   Email: advertiser@test.com`);
  console.log(`   Password: test1234`);
  console.log(`\n🔐 Admin Login:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`\n👤 Tester: Use social login (Kakao/Naver/Google)`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
