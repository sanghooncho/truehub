"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Megaphone,
  Building2,
  Calendar,
  Users,
  CreditCard,
  Eye,
  Smartphone,
  Image,
  MessageSquare,
  Brain,
} from "lucide-react";

interface CampaignDetail {
  id: string;
  title: string;
  description: string;
  appLinkIos: string | null;
  appLinkAndroid: string | null;
  targetCount: number;
  currentCount: number;
  rewardAmount: number;
  creditCostPerValid: number;
  screenshot1Mission: string | null;
  screenshot2Mission: string | null;
  screenshot1RefKey: string | null;
  screenshot2RefKey: string | null;
  status: string;
  startAt: string | null;
  endAt: string;
  closedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  advertiser: {
    id: string;
    companyName: string;
    email: string;
  };
  questions: {
    id: string;
    order: number;
    text: string;
  }[];
  participations: {
    id: string;
    user: {
      id: string;
      email: string;
      profileName: string | null;
    };
    status: string;
    fraudScore: number | null;
    fraudDecision: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  }[];
  latestInsight: {
    id: string;
    version: number;
    summary: string;
    participationCount: number;
  } | null;
  stats: {
    total: number;
    submitted: number;
    pendingReview: number;
    manualReview: number;
    approved: number;
    rejected: number;
    autoRejected: number;
    paid: number;
  };
}

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/campaigns/${campaignId}`);
      const data = await res.json();

      if (data.success) {
        setCampaign(data.data);
      } else {
        toast.error(data.error?.message || "Failed to load campaign");
        router.push("/admin/campaigns");
      }
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
      toast.error("Failed to load campaign");
      router.push("/admin/campaigns");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) return null;

  const progressPercent = Math.min((campaign.currentCount / campaign.targetCount) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
          <p className="text-slate-500">{campaign.advertiser.companyName}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                캠페인 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">설명</p>
                <p className="mt-1 text-slate-900">{campaign.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="ID" value={campaign.id} mono />
                <InfoRow label="리워드" value={`₩${campaign.rewardAmount.toLocaleString()}`} />
                <InfoRow
                  label="건당 크레딧 비용"
                  value={`${campaign.creditCostPerValid.toLocaleString()} 크레딧`}
                />
                <InfoRow
                  label="마감일"
                  value={new Date(campaign.endAt).toLocaleDateString("ko-KR")}
                />
                <InfoRow
                  label="생성일"
                  value={new Date(campaign.createdAt).toLocaleDateString("ko-KR")}
                />
                {campaign.startAt && (
                  <InfoRow
                    label="시작일"
                    value={new Date(campaign.startAt).toLocaleDateString("ko-KR")}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />앱 링크
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">iOS</p>
                {campaign.appLinkIos ? (
                  <a
                    href={campaign.appLinkIos}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    {campaign.appLinkIos}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">-</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Android</p>
                {campaign.appLinkAndroid ? (
                  <a
                    href={campaign.appLinkAndroid}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    {campaign.appLinkAndroid}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">-</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                스크린샷 미션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">미션 1</p>
                <p className="mt-1 text-slate-900">{campaign.screenshot1Mission || "-"}</p>
                {campaign.screenshot1RefKey && (
                  <p className="mt-1 text-xs text-slate-400">
                    참조 이미지: {campaign.screenshot1RefKey}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">미션 2</p>
                <p className="mt-1 text-slate-900">{campaign.screenshot2Mission || "-"}</p>
                {campaign.screenshot2RefKey && (
                  <p className="mt-1 text-xs text-slate-400">
                    참조 이미지: {campaign.screenshot2RefKey}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                질문
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.questions.length > 0 ? (
                <div className="space-y-3">
                  {campaign.questions.map((q) => (
                    <div key={q.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">질문 {q.order}</p>
                      <p className="text-slate-900">{q.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">등록된 질문이 없습니다</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                최근 참여 ({campaign.stats.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.participations.length > 0 ? (
                <div className="space-y-3">
                  {campaign.participations.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">
                          {p.user.profileName || p.user.email}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{new Date(p.submittedAt).toLocaleDateString("ko-KR")}</span>
                          {p.fraudScore !== null && (
                            <>
                              <span>·</span>
                              <FraudBadge score={p.fraudScore} />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ParticipationStatusBadge status={p.status} />
                        <Link href={`/admin/participations/${p.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400">참여 내역이 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                진행 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">참여</span>
                  <span className="font-medium text-slate-900">
                    {campaign.currentCount} / {campaign.targetCount}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">
                  {progressPercent.toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="대기"
                  value={campaign.stats.pendingReview + campaign.stats.submitted}
                  color="text-amber-600"
                />
                <StatBox
                  label="검토 필요"
                  value={campaign.stats.manualReview}
                  color="text-blue-600"
                />
                <StatBox label="승인" value={campaign.stats.approved} color="text-green-600" />
                <StatBox label="지급완료" value={campaign.stats.paid} color="text-green-600" />
                <StatBox label="반려" value={campaign.stats.rejected} color="text-red-600" />
                <StatBox
                  label="자동반려"
                  value={campaign.stats.autoRejected}
                  color="text-red-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                광고주
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-slate-900">{campaign.advertiser.companyName}</p>
              <p className="text-sm text-slate-500">{campaign.advertiser.email}</p>
              <Link href={`/admin/advertisers/${campaign.advertiser.id}`}>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  광고주 상세
                </Button>
              </Link>
            </CardContent>
          </Card>

          {campaign.latestInsight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI 인사이트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{campaign.latestInsight.summary}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>v{campaign.latestInsight.version}</span>
                  <span>{campaign.latestInsight.participationCount}개 참여 기반</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-sm text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color || "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "초안", className: "bg-slate-100 text-slate-700" },
    RUNNING: { label: "진행중", className: "bg-green-100 text-green-700" },
    PAUSED: { label: "일시중지", className: "bg-amber-100 text-amber-700" },
    CLOSED: { label: "종료", className: "bg-red-100 text-red-700" },
    SETTLING: { label: "정산중", className: "bg-blue-100 text-blue-700" },
    COMPLETED: { label: "완료", className: "bg-slate-100 text-slate-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={`px-3 py-1 text-sm ${className}`}>{label}</Badge>;
}

function ParticipationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: "제출", className: "bg-slate-100 text-slate-700" },
    PENDING_REVIEW: { label: "대기", className: "bg-amber-100 text-amber-700" },
    MANUAL_REVIEW: { label: "검토", className: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "반려", className: "bg-red-100 text-red-700" },
    AUTO_REJECTED: { label: "자동반려", className: "bg-red-100 text-red-700" },
    PAID: { label: "지급완료", className: "bg-green-100 text-green-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}

function FraudBadge({ score }: { score: number }) {
  if (score < 40) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        정상 ({score})
      </Badge>
    );
  }
  if (score < 70) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700">
        주의 ({score})
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700">
      의심 ({score})
    </Badge>
  );
}
