"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Tag,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
}

interface Theme {
  theme: string;
  count: number;
}

interface Insight {
  id: string;
  version: number;
  participationCount: number;
  summary: string | null;
  pros: string[] | null;
  cons: string[] | null;
  onboardingIssues: string[] | null;
  keywords: string[] | null;
  sentiment: Sentiment | null;
  themes: Theme[] | null;
  generatedAt: string;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
  approvedCount: number;
}

interface InsightData {
  campaign: Campaign;
  insight: Insight | null;
  canGenerate: boolean;
  isGenerating: boolean;
  minParticipations: number;
}

export default function CampaignInsightsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/v1/advertiser/campaigns/${id}/insights`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to fetch insights");
      }

      setData(json.data);
    } catch (err) {
      console.error(err);
      toast.error("데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/v1/advertiser/campaigns/${id}/insights`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "AI 분석 요청에 실패했습니다");
        return;
      }

      toast.success("AI 분석이 요청되었습니다. 잠시 후 새로고침해주세요.");
      setTimeout(() => fetchData(), 3000);
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-500">데이터를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  const { campaign, insight, canGenerate, isGenerating } = data;

  return (
    <div className="animate-in fade-in space-y-6 pb-20 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 text-slate-500 hover:text-slate-900"
            onClick={() => router.push(`/advertiser/campaigns/${id}`)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            캠페인으로
          </Button>
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI 인사이트</h1>
          </div>
          <p className="text-sm text-slate-500">{campaign.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          {canGenerate && (
            <Button onClick={handleGenerate} disabled={generating || isGenerating}>
              {generating || isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {insight ? "재분석" : "AI 분석 생성"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!insight && !canGenerate && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
            <p className="text-center text-amber-800">
              승인된 참여가 {data.minParticipations}개 이상일 때 AI 분석이 가능합니다.
            </p>
            <p className="mt-2 text-sm text-amber-600">
              현재 승인된 참여: {campaign.approvedCount}개
            </p>
          </CardContent>
        </Card>
      )}

      {!insight && canGenerate && !isGenerating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="mb-4 h-12 w-12 text-blue-500" />
            <p className="mb-4 text-center text-blue-800">
              AI가 {campaign.approvedCount}개의 피드백을 분석하여 인사이트를 제공합니다.
            </p>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI 분석 시작하기
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && !insight && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
            <p className="text-center text-blue-800">AI 분석을 생성하고 있습니다...</p>
            <p className="mt-2 text-sm text-blue-600">잠시만 기다려주세요.</p>
          </CardContent>
        </Card>
      )}

      {insight && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-500" />
                요약
              </CardTitle>
              <CardDescription>{insight.participationCount}개의 피드백 분석 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-slate-700">
                {insight.summary || "요약 정보가 없습니다."}
              </p>
            </CardContent>
          </Card>

          {insight.sentiment && (
            <Card>
              <CardHeader>
                <CardTitle>감정 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SentimentBar
                  label="긍정"
                  value={insight.sentiment.positive}
                  color="bg-emerald-500"
                  bgColor="bg-emerald-100"
                />
                <SentimentBar
                  label="중립"
                  value={insight.sentiment.neutral}
                  color="bg-slate-400"
                  bgColor="bg-slate-100"
                />
                <SentimentBar
                  label="부정"
                  value={insight.sentiment.negative}
                  color="bg-red-500"
                  bgColor="bg-red-100"
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {insight.pros && insight.pros.length > 0 && (
              <Card className="border-emerald-200">
                <CardHeader className="bg-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                    장점
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {insight.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {insight.cons && insight.cons.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <TrendingDown className="h-5 w-5" />
                    단점
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {insight.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {insight.onboardingIssues && insight.onboardingIssues.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                  온보딩 이슈
                </CardTitle>
                <CardDescription>첫 사용 시 겪은 문제점</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {insight.onboardingIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insight.keywords && insight.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-slate-500" />
                  주요 키워드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insight.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insight.themes && insight.themes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>주요 테마</CardTitle>
                <CardDescription>피드백에서 자주 언급된 주제</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {insight.themes.map((theme, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <span className="font-medium text-slate-700">{theme.theme}</span>
                      <Badge variant="outline">{theme.count}회</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm text-slate-400">
            분석일시: {new Date(insight.generatedAt).toLocaleString("ko-KR")} (v{insight.version})
          </div>
        </>
      )}
    </div>
  );
}

function SentimentBar({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-500 tabular-nums">{percentage}%</span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${bgColor}`}>
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
