/**
 * OpenAI Vision API 테스트 스크립트
 *
 * 사용법: npx tsx scripts/test-vision-api.ts
 */

import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 테스트용 공개 이미지 URL
const IMAGES = {
  // 앱 스토어 스크린샷 (배달앱 예시)
  advertiser: {
    foodDeliveryHome: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", // 음식 이미지
    foodDeliveryApp: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", // 다른 음식 이미지
  },
  // 테스터 제출 이미지
  tester: {
    // 좋은 케이스: 비슷한 음식 앱 스크린샷
    goodCase: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400", // 음식 관련 이미지
    // 나쁜 케이스: 전혀 다른 이미지 (고양이)
    badCase: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400", // 고양이 이미지
    // 나쁜 케이스: 빈 화면 / 데스크톱
    wrongScreen: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400", // 노트북 화면
  },
};

// 테스트 케이스 정의
interface TestCase {
  name: string;
  description: string;
  campaign: {
    title: string;
    description: string;
    mission: string;
  };
  refImageUrl: string | null;
  submittedImageUrl: string;
  answers: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    feedback: string;
  };
  expectedScreenshot: "valid" | "invalid";
  expectedText: "valid" | "invalid";
}

const TEST_CASES: TestCase[] = [
  // ============ 좋은 케이스들 ============
  {
    name: "✅ GOOD: 정상 제출 (유사 이미지 + 좋은 텍스트)",
    description: "광고주 참조 이미지와 유사한 스크린샷, 실제 경험 담긴 피드백",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷을 찍어주세요",
    },
    refImageUrl: IMAGES.advertiser.foodDeliveryHome,
    submittedImageUrl: IMAGES.tester.goodCase,
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
    expectedScreenshot: "valid",
    expectedText: "valid",
  },

  // ============ 나쁜 케이스들 ============
  {
    name: "❌ BAD: 전혀 다른 이미지 (고양이 사진)",
    description: "음식앱인데 고양이 사진 제출",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷을 찍어주세요",
    },
    refImageUrl: IMAGES.advertiser.foodDeliveryHome,
    submittedImageUrl: IMAGES.tester.badCase,
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "좋았어요 깔끔하고 사용하기 편했습니다",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "딱히 불편한점 없었어요",
      feedback: "추천합니다 좋은 앱이에요",
    },
    expectedScreenshot: "invalid",
    expectedText: "valid", // 텍스트는 짧지만 valid할 수 있음
  },
  {
    name: "❌ BAD: 쓰레기 텍스트 (자음 나열)",
    description: "이미지는 비슷하지만 텍스트가 의미없음",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷을 찍어주세요",
    },
    refImageUrl: IMAGES.advertiser.foodDeliveryHome,
    submittedImageUrl: IMAGES.tester.goodCase,
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "ㅇㄴㅁㄹㅇㄴㅁㄹ",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "asdfasdfasdf",
      feedback: "ㅋㅋㅋㅋㅋㅋ",
    },
    expectedScreenshot: "valid",
    expectedText: "invalid",
  },
  {
    name: "❌ BAD: 다른 화면 스크린샷 (데스크톱)",
    description: "모바일 앱이 아닌 데스크톱 화면 제출",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷을 찍어주세요",
    },
    refImageUrl: IMAGES.advertiser.foodDeliveryHome,
    submittedImageUrl: IMAGES.tester.wrongScreen,
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "디자인이 예쁘고 사용하기 편했어요",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "없었습니다",
      feedback: "좋은 앱입니다 추천해요",
    },
    expectedScreenshot: "invalid",
    expectedText: "valid",
  },
  {
    name: "❌ BAD: 복사-붙여넣기 답변",
    description: "모든 답변이 동일함",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "앱 메인 화면에서 음식 메뉴가 보이는 스크린샷을 찍어주세요",
    },
    refImageUrl: IMAGES.advertiser.foodDeliveryHome,
    submittedImageUrl: IMAGES.tester.goodCase,
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "좋았습니다",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "좋았습니다",
      feedback: "좋았습니다",
    },
    expectedScreenshot: "valid",
    expectedText: "invalid",
  },
  {
    name: "❌ BAD: 이미지 없이 쓰레기 텍스트만",
    description: "이미지 제출 없이 의미없는 텍스트",
    campaign: {
      title: "맛있는 배달앱 체험",
      description: "새로운 배달앱을 설치하고 주문해보세요",
      mission: "",
    },
    refImageUrl: null,
    submittedImageUrl: "", // 이미지 없음
    answers: {
      question1: "앱 설치 후 첫 인상은 어땠나요?",
      answer1: "ㅁㄴㅇㄹ",
      question2: "주문 과정에서 불편한 점이 있었나요?",
      answer2: "ㅁㄴㅇㄹ",
      feedback: "ㅁㄴㅇㄹ",
    },
    expectedScreenshot: "valid", // 이미지 없으므로 스킵
    expectedText: "invalid",
  },
];

async function testWithImage(testCase: TestCase): Promise<{
  screenshot: { valid: boolean; reason: string };
  textQuality: { valid: boolean; reason: string };
}> {
  const { campaign, refImageUrl, submittedImageUrl, answers } = testCase;

  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  if (refImageUrl) {
    imageContent.push({
      type: "image_url",
      image_url: { url: refImageUrl, detail: "low" },
    });
  }
  if (submittedImageUrl) {
    imageContent.push({
      type: "image_url",
      image_url: { url: submittedImageUrl, detail: "low" },
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `당신은 앱 체험 캠페인의 참여 내용을 검증하는 전문가입니다.

[스크린샷 검증]
${refImageUrl ? "첫 번째 이미지가 참조 이미지(광고주가 요구하는 화면), 두 번째가 제출된 스크린샷입니다. 같은 종류의 화면/앱인지 판단하세요." : submittedImageUrl ? "제출된 스크린샷이 미션 요구사항에 맞는지 판단하세요." : "이미지가 제출되지 않았습니다."}

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
캠페인 설명: ${campaign.description}
${campaign.mission ? `스크린샷 미션: "${campaign.mission}"` : ""}
${refImageUrl && submittedImageUrl ? "첫 번째가 참조 이미지, 두 번째가 제출된 스크린샷입니다." : submittedImageUrl ? "제출된 스크린샷입니다." : "이미지가 제출되지 않았습니다."}

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
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

async function testTextOnly(testCase: TestCase): Promise<{
  valid: boolean;
  reason: string;
}> {
  const { campaign, answers } = testCase;

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
- 질문에 맞지 않는 동문서답도 invalid입니다.

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
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

async function runTests() {
  console.log("🧪 OpenAI Vision API 테스트 시작\n");
  console.log("=".repeat(80));

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   ${testCase.description}`);
    console.log("-".repeat(60));

    try {
      let result: {
        screenshot: { valid: boolean; reason: string };
        textQuality: { valid: boolean; reason: string };
      };

      if (testCase.submittedImageUrl) {
        // 이미지 있음 -> gpt-4o
        result = await testWithImage(testCase);
      } else {
        // 이미지 없음 -> gpt-4o-mini (텍스트만)
        const textResult = await testTextOnly(testCase);
        result = {
          screenshot: { valid: true, reason: "이미지 미제출 - 스킵" },
          textQuality: textResult,
        };
      }

      // 결과 출력
      const screenshotMatch =
        (result.screenshot.valid && testCase.expectedScreenshot === "valid") ||
        (!result.screenshot.valid && testCase.expectedScreenshot === "invalid");

      const textMatch =
        (result.textQuality.valid && testCase.expectedText === "valid") ||
        (!result.textQuality.valid && testCase.expectedText === "invalid");

      console.log(`\n   📸 스크린샷: ${result.screenshot.valid ? "✅ valid" : "❌ invalid"}`);
      console.log(`      이유: ${result.screenshot.reason}`);
      console.log(
        `      예상: ${testCase.expectedScreenshot} → ${screenshotMatch ? "✅ 일치" : "⚠️ 불일치"}`
      );

      console.log(`\n   📝 텍스트: ${result.textQuality.valid ? "✅ valid" : "❌ invalid"}`);
      console.log(`      이유: ${result.textQuality.reason}`);
      console.log(`      예상: ${testCase.expectedText} → ${textMatch ? "✅ 일치" : "⚠️ 불일치"}`);

      if (screenshotMatch && textMatch) {
        passed++;
        console.log(`\n   🎯 결과: PASS`);
      } else {
        failed++;
        console.log(`\n   ⚠️ 결과: MISMATCH (예상과 다름)`);
      }
    } catch (error) {
      failed++;
      console.log(`\n   ❌ 오류: ${error instanceof Error ? error.message : "Unknown"}`);
    }

    console.log("-".repeat(60));
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 테스트 결과: ${passed}/${TEST_CASES.length} 통과, ${failed} 불일치/오류`);
  console.log("=".repeat(80));
}

runTests().catch(console.error);
