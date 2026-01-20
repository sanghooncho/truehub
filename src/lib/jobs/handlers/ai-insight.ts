import OpenAI from "openai";
import { Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface AiInsightPayload {
  campaignId: string;
}

interface InsightResult {
  summary: string;
  pros: string[];
  cons: string[];
  onboardingIssues: string[];
  keywords: string[];
  sentiment: { positive: number; neutral: number; negative: number };
  themes: { theme: string; count: number }[];
}

export async function generateAiInsight(payload: AiInsightPayload): Promise<InsightResult> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
    include: {
      participations: {
        where: { status: "APPROVED" },
        select: {
          answer1: true,
          answer2: true,
          feedback: true,
        },
        take: 100,
      },
      questions: {
        orderBy: { questionOrder: "asc" },
      },
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.participations.length < 5) {
    throw new Error("Not enough approved participations (minimum 5)");
  }

  const feedbackData = campaign.participations.map((p, i) => ({
    id: i + 1,
    q1: campaign.questions[0]?.questionText || "Question 1",
    a1: p.answer1,
    q2: campaign.questions[1]?.questionText || "Question 2",
    a2: p.answer2,
    feedback: p.feedback,
  }));

  const prompt = `
You are an expert UX researcher analyzing user feedback for a mobile app campaign.

Campaign: ${campaign.title}
Description: ${campaign.description}

User Feedback Data (${feedbackData.length} responses):
${JSON.stringify(feedbackData, null, 2)}

Analyze this feedback and provide insights in the following JSON format:
{
  "summary": "2-3 sentence executive summary of user sentiment",
  "pros": ["top 5 positive points users mentioned"],
  "cons": ["top 5 negative points or issues users mentioned"],
  "onboardingIssues": ["specific problems users had when first using the app"],
  "keywords": ["10 most frequently mentioned keywords"],
  "sentiment": {
    "positive": 0.0-1.0,
    "neutral": 0.0-1.0,
    "negative": 0.0-1.0
  },
  "themes": [
    {"theme": "theme name", "count": number of mentions}
  ]
}

Respond ONLY with valid JSON, no markdown or explanation.
`;

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const result: InsightResult = JSON.parse(content);

  const existingInsight = await prisma.aiInsight.findFirst({
    where: { campaignId: payload.campaignId },
    orderBy: { version: "desc" },
  });

  await prisma.aiInsight.create({
    data: {
      campaignId: payload.campaignId,
      version: (existingInsight?.version || 0) + 1,
      participationCount: campaign.participations.length,
      summary: result.summary,
      pros: result.pros as Prisma.InputJsonValue,
      cons: result.cons as Prisma.InputJsonValue,
      onboardingIssues: result.onboardingIssues as Prisma.InputJsonValue,
      keywords: result.keywords as Prisma.InputJsonValue,
      sentiment: result.sentiment as Prisma.InputJsonValue,
      themes: result.themes as Prisma.InputJsonValue,
      rawData: { feedbackCount: feedbackData.length } as Prisma.InputJsonValue,
    },
  });

  return result;
}

export async function shouldGenerateInsight(campaignId: string): Promise<boolean> {
  const [approvedCount, lastInsight] = await Promise.all([
    prisma.participation.count({
      where: { campaignId, status: "APPROVED" },
    }),
    prisma.aiInsight.findFirst({
      where: { campaignId },
      orderBy: { version: "desc" },
    }),
  ]);

  if (approvedCount < 10) return false;
  if (!lastInsight) return true;

  const threshold = Math.floor(approvedCount / 10) * 10;
  return lastInsight.participationCount < threshold;
}
