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
      creditWallet: {
        create: {
          balance: 500000,
          totalTopup: 500000,
          totalConsumed: 0,
        },
      },
    },
  });
  console.log(`  ✓ Advertiser: ${advertiser.email}`);

  // 2. Create test campaigns
  console.log("\nCreating test campaigns...");

  const campaigns = [
    {
      title: "토스 앱 사용성 테스트",
      description:
        "토스 앱의 새로운 송금 기능을 테스트하고 피드백을 남겨주세요. 앱을 설치하고, 송금 기능을 사용해본 뒤 스크린샷과 함께 솔직한 의견을 작성해주시면 됩니다.",
      rewardAmount: 5000,
      targetCount: 100,
      currentCount: 45,
      creditCostPerValid: 6000,
      endAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
      appLinkIos: "https://apps.apple.com/kr/app/toss",
      appLinkAndroid: "https://play.google.com/store/apps/details?id=viva.republica.toss",
      questions: [
        { order: 1, text: "송금 기능을 사용하면서 가장 편리했던 점은 무엇인가요?" },
        { order: 2, text: "개선이 필요하다고 느낀 부분이 있다면 무엇인가요?" },
      ],
    },
    {
      title: "배달의민족 신규 기능 피드백",
      description:
        "배달의민족 앱의 새로운 '함께 주문' 기능을 체험하고 의견을 들려주세요. 친구나 가족과 함께 주문해보시고, 사용 경험을 공유해주세요.",
      rewardAmount: 3000,
      targetCount: 200,
      currentCount: 178,
      creditCostPerValid: 4000,
      endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후 (마감임박)
      appLinkIos: "https://apps.apple.com/kr/app/baemin",
      appLinkAndroid: "https://play.google.com/store/apps/details?id=com.sampleapp",
      questions: [
        { order: 1, text: "'함께 주문' 기능을 어떤 상황에서 사용하셨나요?" },
        { order: 2, text: "기존 개별 주문과 비교했을 때 장단점은 무엇인가요?" },
      ],
    },
    {
      title: "카카오뱅크 UX 리서치",
      description:
        "카카오뱅크 앱의 전반적인 사용 경험에 대한 피드백을 수집합니다. 평소 사용하시면서 느낀 점들을 솔직하게 공유해주세요.",
      rewardAmount: 7000,
      targetCount: 50,
      currentCount: 12,
      creditCostPerValid: 8000,
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      appLinkIos: "https://apps.apple.com/kr/app/kakaobank",
      appLinkAndroid: "https://play.google.com/store/apps/details?id=com.kakaobank",
      questions: [
        { order: 1, text: "카카오뱅크에서 가장 자주 사용하는 기능은 무엇인가요?" },
        { order: 2, text: "다른 은행 앱과 비교했을 때 카카오뱅크만의 장점은?" },
      ],
    },
    {
      title: "당근마켓 거래 후기 수집",
      description:
        "당근마켓에서 최근 거래를 완료하신 분들의 경험담을 듣고 싶습니다. 거래 과정에서의 경험을 스크린샷과 함께 공유해주세요.",
      rewardAmount: 2000,
      targetCount: 300,
      currentCount: 287,
      creditCostPerValid: 2500,
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      appLinkIos: "https://apps.apple.com/kr/app/daangn",
      appLinkAndroid: "https://play.google.com/store/apps/details?id=com.towneers.www",
      questions: [
        { order: 1, text: "거래 상대방과의 소통은 원활했나요?" },
        { order: 2, text: "거래 과정에서 불편했던 점이 있었다면?" },
      ],
    },
    {
      title: "네이버 지도 신기능 테스트",
      description:
        "네이버 지도의 새로운 AR 길안내 기능을 테스트해주세요. 실제로 길을 찾아가면서 AR 기능을 사용해보시고 피드백을 남겨주세요.",
      rewardAmount: 10000,
      targetCount: 30,
      currentCount: 8,
      creditCostPerValid: 12000,
      endAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21일 후
      appLinkIos: "https://apps.apple.com/kr/app/naver-map",
      appLinkAndroid: "https://play.google.com/store/apps/details?id=com.nhn.android.nmap",
      questions: [
        { order: 1, text: "AR 길안내가 실제 길찾기에 도움이 되었나요?" },
        { order: 2, text: "AR 기능의 정확도는 어땠나요? (위치, 방향 등)" },
      ],
    },
  ];

  for (const campaignData of campaigns) {
    const { questions, ...data } = campaignData;

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        advertiserId: advertiser.id,
        status: "RUNNING",
        startAt: new Date(),
        questions: {
          create: questions.map((q) => ({
            questionOrder: q.order,
            questionText: q.text,
          })),
        },
      },
    });
    console.log(`  ✓ Campaign: ${campaign.title}`);
  }

  // 3. Create test user (for viewing participations)
  console.log("\nCreating test user...");
  const user = await prisma.user.upsert({
    where: {
      provider_providerUserId: {
        provider: "GOOGLE",
        providerUserId: "test-user-001",
      },
    },
    update: {},
    create: {
      provider: "GOOGLE",
      providerUserId: "test-user-001",
      email: "tester@test.com",
      profileName: "테스터",
    },
  });
  console.log(`  ✓ User: ${user.email}`);

  // 4. Create admin operator
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
