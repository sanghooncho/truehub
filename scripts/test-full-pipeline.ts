import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SIGNAL_WEIGHTS = {
  BANNED_USER: 100,
  DUPLICATE_IMAGE: 50,
  AI_VERIFY_FAILED: 40,
  LOW_QUALITY_TEXT: 35,
  DUPLICATE_FEEDBACK: 30,
  SIMILAR_IMAGE: 25,
  SAME_DEVICE: 20,
  RAPID_SUBMISSION: 15,
  SHORT_FEEDBACK: 10,
};

type FraudDecision = "PASS" | "REVIEW" | "REJECT";

interface FraudSignal {
  type: string;
  score: number;
  reason?: string;
}

interface TestCase {
  name: string;
  refImageUrl: string | null;
  submittedImageUrl: string;
  campaign: { title: string; description: string; mission: string };
  answers: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    feedback: string;
  };
}

const IMAGES = {
  advertiser: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  goodSubmission: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  catPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
  desktopScreen: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
};

const TEST_CASES: TestCase[] = [
  {
    name: "정상 제출 (유사 이미지 + 좋은 텍스트)",
    refImageUrl: IMAGES.advertiser,
    submittedImageUrl: IMAGES.goodSubmission,
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1:
        "UI가 깔끔하고 카테고리 분류가 잘 되어있어서 원하는 음식을 찾기 쉬웠어요. 로딩도 빠르고 좋았습니다.",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2:
        "결제 수단 추가할 때 본인인증이 좀 번거로웠어요. 간편결제 연동이 더 쉬우면 좋겠어요.",
      feedback:
        "전체적으로 만족스러운 앱이에요. 특히 실시간 배달 추적 기능이 정확해서 좋았고, 리뷰 사진도 크게 볼 수 있어서 메뉴 선택에 도움이 됐습니다.",
    },
  },
  {
    name: "전혀 다른 이미지 (고양이 사진)",
    refImageUrl: IMAGES.advertiser,
    submittedImageUrl: IMAGES.catPhoto,
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "좋았어요 깔끔하고 사용하기 편했습니다. 메뉴도 잘 정리되어 있어요.",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "딱히 불편한점 없었어요. 결제도 빠르게 됐습니다.",
      feedback: "추천합니다 좋은 앱이에요. 다음에도 이용할 예정입니다. 배달도 빨랐어요.",
    },
  },
  {
    name: "쓰레기 텍스트 (자음 나열)",
    refImageUrl: IMAGES.advertiser,
    submittedImageUrl: IMAGES.goodSubmission,
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "ㅇㄴㅁㄹㅇㄴㅁㄹ",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "asdfasdfasdf",
      feedback: "ㅋㅋㅋㅋㅋㅋ",
    },
  },
  {
    name: "다른 화면 스크린샷 (데스크톱) + 짧은 피드백",
    refImageUrl: IMAGES.advertiser,
    submittedImageUrl: IMAGES.desktopScreen,
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "좋음",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "없음",
      feedback: "굿",
    },
  },
  {
    name: "복사-붙여넣기 답변",
    refImageUrl: IMAGES.advertiser,
    submittedImageUrl: IMAGES.goodSubmission,
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "좋았습니다",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "좋았습니다",
      feedback: "좋았습니다",
    },
  },
  {
    name: "이미지 없이 쓰레기 텍스트만",
    refImageUrl: null,
    submittedImageUrl: "",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "",
    },
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "ㅁㄴㅇㄹ",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "ㅁㄴㅇㄹ",
      feedback: "ㅁㄴㅇㄹ",
    },
  },
];

async function callOpenAI(testCase: TestCase): Promise<{
  screenshot: { valid: boolean; reason: string };
  textQuality: { valid: boolean; reason: string };
}> {
  const { campaign, refImageUrl, submittedImageUrl, answers } = testCase;

  if (!submittedImageUrl) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 앱 체험 캠페인의 텍스트 품질을 검증하는 전문가입니다.

아래 질문-답변과 피드백이 실제 앱 사용 경험을 담고 있는지 판단하세요.

판단 기준:
- 글을 잘 썼는지가 아니라, 실제로 앱을 사용해본 경험이 담겨있는지가 중요합니다.
- 의미없는 텍스트(ㅇㄴㅁㄹ, asdf, 자음만 나열 등)는 invalid입니다.
- 같은 내용 복사-붙여넣기, 성의없는 한두 단어 답변은 invalid입니다.
- 짧더라도 실제 경험이 담겨있으면 valid입니다.

반드시 JSON 형식으로만 응답하세요:
{ "valid": boolean, "reason": "판단 이유 (한국어, 1문장)" }`,
        },
        {
          role: "user",
          content: `캠페인: ${campaign.title}
캠페인 설명: ${campaign.description}

[답변 내용]
Q1: ${answers.question1}
A1: ${answers.answer1}

Q2: ${answers.question2}
A2: ${answers.answer2}

자유 피드백: ${answers.feedback}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response");

    const textResult = JSON.parse(content);
    return {
      screenshot: { valid: true, reason: "이미지 미제출" },
      textQuality: textResult,
    };
  }

  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
  if (refImageUrl) {
    imageContent.push({ type: "image_url", image_url: { url: refImageUrl, detail: "low" } });
  }
  imageContent.push({ type: "image_url", image_url: { url: submittedImageUrl, detail: "low" } });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `당신은 앱 체험 캠페인의 참여 내용을 검증하는 전문가입니다.

[스크린샷 검증]
${refImageUrl ? "첫 번째 이미지가 참조 이미지(광고주가 요구하는 화면), 두 번째가 제출된 스크린샷입니다. 같은 종류의 화면/앱인지 판단하세요." : "제출된 스크린샷이 미션 요구사항에 맞는지 판단하세요."}

[텍스트 품질 검증]
아래 질문-답변과 피드백이 실제 앱 사용 경험을 담고 있는지 판단하세요.
- 글을 잘 썼는지가 아니라, 실제로 앱을 사용해본 경험이 담겨있는지가 중요합니다.
- 의미없는 텍스트(ㅇㄴㅁㄹ, asdf 등), 복사-붙여넣기, 성의없는 답변은 invalid입니다.
- 짧더라도 실제 경험이 담겨있으면 valid입니다.

반드시 JSON 형식으로만 응답하세요:
{
  "screenshot": { "valid": boolean, "reason": "판단 이유 (한국어, 1문장)" },
  "textQuality": { "valid": boolean, "reason": "판단 이유 (한국어, 1문장)" }
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `캠페인: ${campaign.title}
${campaign.mission ? `스크린샷 미션: "${campaign.mission}"` : ""}
${refImageUrl ? "첫 번째가 참조 이미지, 두 번째가 제출된 스크린샷입니다." : "제출된 스크린샷입니다."}

[답변 내용]
Q1: ${answers.question1}
A1: ${answers.answer1}

Q2: ${answers.question2}
A2: ${answers.answer2}

자유 피드백: ${answers.feedback}`,
          },
          ...imageContent,
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 300,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response");

  return JSON.parse(content);
}

function calculateFraudScore(
  testCase: TestCase,
  aiResult: {
    screenshot: { valid: boolean; reason: string };
    textQuality: { valid: boolean; reason: string };
  }
): { score: number; decision: FraudDecision; signals: FraudSignal[] } {
  const signals: FraudSignal[] = [];

  if (!aiResult.screenshot.valid) {
    signals.push({
      type: "AI_VERIFY_FAILED",
      score: SIGNAL_WEIGHTS.AI_VERIFY_FAILED,
      reason: aiResult.screenshot.reason,
    });
  }

  if (!aiResult.textQuality.valid) {
    signals.push({
      type: "LOW_QUALITY_TEXT",
      score: SIGNAL_WEIGHTS.LOW_QUALITY_TEXT,
      reason: aiResult.textQuality.reason,
    });
  }

  if (testCase.answers.feedback.length < 50) {
    signals.push({
      type: "SHORT_FEEDBACK",
      score: SIGNAL_WEIGHTS.SHORT_FEEDBACK,
      reason: `피드백 ${testCase.answers.feedback.length}자 (50자 미만)`,
    });
  }

  const totalScore = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.score, 0)
  );

  let decision: FraudDecision;
  if (totalScore >= 70) {
    decision = "REJECT";
  } else if (totalScore >= 40) {
    decision = "REVIEW";
  } else {
    decision = "PASS";
  }

  return { score: totalScore, decision, signals };
}

function getDecisionEmoji(decision: FraudDecision): string {
  switch (decision) {
    case "PASS":
      return "✅";
    case "REVIEW":
      return "⚠️";
    case "REJECT":
      return "❌";
  }
}

function getStatusText(decision: FraudDecision): string {
  switch (decision) {
    case "PASS":
      return "PENDING_REVIEW (자동 통과)";
    case "REVIEW":
      return "MANUAL_REVIEW (수동 검토 필요)";
    case "REJECT":
      return "AUTO_REJECTED (자동 거절)";
  }
}

async function runTests() {
  console.log("\n" + "═".repeat(90));
  console.log("  🔍 TrueHub 사기 탐지 파이프라인 시뮬레이션 테스트");
  console.log("═".repeat(90));

  console.log("\n📊 점수 기준:");
  console.log("   • 0-39점: PASS → PENDING_REVIEW");
  console.log("   • 40-69점: REVIEW → MANUAL_REVIEW");
  console.log("   • 70-100점: REJECT → AUTO_REJECTED\n");

  console.log("📋 시그널 가중치:");
  Object.entries(SIGNAL_WEIGHTS).forEach(([key, value]) => {
    console.log(`   • ${key}: +${value}점`);
  });

  console.log("\n" + "─".repeat(90));

  const results: Array<{
    name: string;
    score: number;
    decision: FraudDecision;
    signals: FraudSignal[];
  }> = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n📋 테스트: ${testCase.name}`);
    console.log("─".repeat(60));

    try {
      console.log("   🤖 OpenAI 호출 중...");
      const aiResult = await callOpenAI(testCase);

      console.log(`\n   [1단계] AI 검증 결과:`);
      console.log(
        `   📸 스크린샷: ${aiResult.screenshot.valid ? "✅ valid" : "❌ invalid"} - ${aiResult.screenshot.reason}`
      );
      console.log(
        `   📝 텍스트: ${aiResult.textQuality.valid ? "✅ valid" : "❌ invalid"} - ${aiResult.textQuality.reason}`
      );

      const fraudResult = calculateFraudScore(testCase, aiResult);

      console.log(`\n   [2단계] 사기 점수 계산:`);
      if (fraudResult.signals.length === 0) {
        console.log(`   (시그널 없음)`);
      } else {
        fraudResult.signals.forEach((s) => {
          console.log(`   • ${s.type}: +${s.score}점 → ${s.reason}`);
        });
      }

      console.log(`\n   [3단계] 최종 판정:`);
      console.log(`   ┌─────────────────────────────────────────────────────┐`);
      console.log(
        `   │  총점: ${String(fraudResult.score).padStart(3)}점  │  판정: ${getDecisionEmoji(fraudResult.decision)} ${fraudResult.decision.padEnd(6)}  │`
      );
      console.log(`   │  상태: ${getStatusText(fraudResult.decision).padEnd(40)} │`);
      console.log(`   └─────────────────────────────────────────────────────┘`);

      results.push({
        name: testCase.name,
        score: fraudResult.score,
        decision: fraudResult.decision,
        signals: fraudResult.signals,
      });
    } catch (error) {
      console.log(`   ❌ 오류: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }

  console.log("\n" + "═".repeat(90));
  console.log("  📊 전체 테스트 결과 요약");
  console.log("═".repeat(90));
  console.log("\n  ┌────────────────────────────────────────────────┬───────┬──────────┐");
  console.log("  │ 테스트 케이스                                  │ 점수  │ 판정     │");
  console.log("  ├────────────────────────────────────────────────┼───────┼──────────┤");

  results.forEach((r) => {
    const name = r.name.length > 44 ? r.name.slice(0, 41) + "..." : r.name.padEnd(44);
    const score = String(r.score).padStart(3) + "점";
    const decision = `${getDecisionEmoji(r.decision)} ${r.decision}`;
    console.log(`  │ ${name} │ ${score} │ ${decision.padEnd(8)} │`);
  });

  console.log("  └────────────────────────────────────────────────┴───────┴──────────┘");

  const passCount = results.filter((r) => r.decision === "PASS").length;
  const reviewCount = results.filter((r) => r.decision === "REVIEW").length;
  const rejectCount = results.filter((r) => r.decision === "REJECT").length;

  console.log(
    `\n  통계: ✅ PASS ${passCount}건 | ⚠️ REVIEW ${reviewCount}건 | ❌ REJECT ${rejectCount}건`
  );
  console.log("═".repeat(90) + "\n");
}

runTests().catch(console.error);
