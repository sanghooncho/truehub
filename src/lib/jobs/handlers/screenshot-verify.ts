import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/infra/db/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface ScreenshotVerifyPayload {
  participationId: string;
}

interface ScreenshotResult {
  assetId: string;
  slot: number;
  valid: boolean;
  reason: string;
}

interface TextQualityResult {
  valid: boolean;
  reason: string;
}

interface VerifyResponse {
  screenshotResults: ScreenshotResult[];
  textQuality: TextQualityResult;
  allScreenshotsValid: boolean;
}

export async function verifyScreenshots(payload: ScreenshotVerifyPayload): Promise<VerifyResponse> {
  const participation = await prisma.participation.findUnique({
    where: { id: payload.participationId },
    include: {
      campaign: {
        include: {
          questions: {
            orderBy: { questionOrder: "asc" },
          },
        },
      },
      assets: { orderBy: { slot: "asc" } },
    },
  });

  if (!participation) {
    throw new Error("Participation not found");
  }

  const { campaign, assets } = participation;
  const hasImages = assets.length > 0;
  const openai = getOpenAIClient();
  const supabase = getSupabaseAdmin();

  const screenshotResults: ScreenshotResult[] = [];
  let textQuality: TextQualityResult = { valid: true, reason: "검증 완료" };

  const question1 = campaign.questions[0]?.questionText || "질문 1";
  const question2 = campaign.questions[1]?.questionText || "질문 2";

  if (hasImages) {
    const refKeys = [campaign.screenshot1RefKey, campaign.screenshot2RefKey];
    const missions = [campaign.screenshot1Mission, campaign.screenshot2Mission];

    for (const asset of assets) {
      const refKey = refKeys[asset.slot - 1];
      const mission = missions[asset.slot - 1];

      if (!refKey && !mission) {
        screenshotResults.push({
          assetId: asset.id,
          slot: asset.slot,
          valid: true,
          reason: "검증 미설정 - 자동 승인",
        });
        continue;
      }

      const { data: submittedUrlData } = await supabase.storage
        .from("screenshots")
        .createSignedUrl(asset.storageKey, 60);

      if (!submittedUrlData?.signedUrl) {
        screenshotResults.push({
          assetId: asset.id,
          slot: asset.slot,
          valid: false,
          reason: "제출 이미지 로드 실패",
        });
        continue;
      }

      let refImageUrl: string | null = null;
      if (refKey) {
        const { data: refUrlData } = await supabase.storage
          .from("screenshots")
          .createSignedUrl(refKey, 60);
        refImageUrl = refUrlData?.signedUrl || null;
      }

      try {
        const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

        if (refImageUrl) {
          imageContent.push(
            { type: "image_url", image_url: { url: refImageUrl, detail: "low" } },
            { type: "image_url", image_url: { url: submittedUrlData.signedUrl, detail: "low" } }
          );
        } else {
          imageContent.push({
            type: "image_url",
            image_url: { url: submittedUrlData.signedUrl, detail: "low" },
          });
        }

        const isLastAsset = asset.slot === assets.length;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `당신은 앱 체험 캠페인의 참여 내용을 검증하는 전문가입니다.

[스크린샷 검증]
${refImageUrl ? "참조 이미지와 제출된 스크린샷을 비교하여 같은 화면인지 판단하세요." : "제출된 스크린샷이 미션 요구사항에 맞는지 판단하세요."}

${
  isLastAsset
    ? `[텍스트 품질 검증]
아래 질문-답변과 피드백이 실제 앱 사용 경험을 담고 있는지 판단하세요.
- 글을 잘 썼는지가 아니라, 실제로 앱을 사용해본 경험이 담겨있는지가 중요합니다.
- 의미없는 텍스트(ㅇㄴㅁㄹ, asdf 등), 복사-붙여넣기, 성의없는 답변은 invalid입니다.
- 짧더라도 실제 경험이 담겨있으면 valid입니다.`
    : ""
}

반드시 JSON 형식으로만 응답하세요:
{
  "screenshot": { "valid": boolean, "reason": "판단 이유 (한국어, 1문장)" }${
    isLastAsset
      ? `,
  "textQuality": { "valid": boolean, "reason": "판단 이유 (한국어, 1문장)" }`
      : ""
  }
}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `캠페인: ${campaign.title}
${mission ? `스크린샷 미션: "${mission}"` : ""}
${refImageUrl ? "첫 번째가 참조 이미지, 두 번째가 제출된 스크린샷입니다." : "제출된 스크린샷입니다."}

${
  isLastAsset
    ? `[답변 내용]
Q1: ${question1}
A1: ${participation.answer1}

Q2: ${question2}
A2: ${participation.answer2}

자유 피드백: ${participation.feedback}`
    : ""
}`,
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

        const result = JSON.parse(content) as {
          screenshot: { valid: boolean; reason: string };
          textQuality?: { valid: boolean; reason: string };
        };

        screenshotResults.push({
          assetId: asset.id,
          slot: asset.slot,
          valid: result.screenshot.valid,
          reason: result.screenshot.reason,
        });

        if (isLastAsset && result.textQuality) {
          textQuality = result.textQuality;
        }
      } catch (error) {
        screenshotResults.push({
          assetId: asset.id,
          slot: asset.slot,
          valid: false,
          reason: `검증 오류: ${error instanceof Error ? error.message : "Unknown"}`,
        });
      }
    }
  } else {
    try {
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
Q1: ${question1}
A1: ${participation.answer1}

Q2: ${question2}
A2: ${participation.answer2}

자유 피드백: ${participation.feedback}`,
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

      textQuality = JSON.parse(content) as TextQualityResult;
    } catch (error) {
      textQuality = {
        valid: false,
        reason: `검증 오류: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  }

  await Promise.all([
    ...screenshotResults.map((r) =>
      prisma.participationAsset.update({
        where: { id: r.assetId },
        data: {
          aiVerified: r.valid,
          aiVerifyReason: r.reason,
        },
      })
    ),
    prisma.participation.update({
      where: { id: payload.participationId },
      data: {
        textQualityValid: textQuality.valid,
        textQualityReason: textQuality.reason,
      },
    }),
  ]);

  const allScreenshotsValid =
    screenshotResults.length === 0 || screenshotResults.every((r) => r.valid);

  return { screenshotResults, textQuality, allScreenshotsValid };
}
