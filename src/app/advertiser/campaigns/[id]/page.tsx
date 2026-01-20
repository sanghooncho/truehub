"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  ChevronLeft,
  Calendar,
  Users,
  CreditCard,
  Target,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CampaignStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface Question {
  order: number;
  text: string;
}

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
  status: "DRAFT" | "RUNNING" | "PAUSED" | "CLOSED" | "SETTLING" | "COMPLETED";
  startAt: string | null;
  endAt: string;
  createdAt: string;
  questions: Question[];
  stats: CampaignStats;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: {
    label: "작성중",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    variant: "secondary",
  },
  RUNNING: {
    label: "진행중",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    variant: "secondary",
  },
  PAUSED: {
    label: "일시정지",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    variant: "secondary",
  },
  CLOSED: {
    label: "마감",
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
    variant: "secondary",
  },
  SETTLING: {
    label: "정산중",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    variant: "secondary",
  },
  COMPLETED: {
    label: "완료",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    variant: "secondary",
  },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/advertiser/campaigns/${id}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch campaign");
      }

      setCampaign(json.data);
    } catch (err) {
      console.error(err);
      setError("캠페인 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!campaign) return;

    try {
      setPublishing(true);
      const res = await fetch(`/api/v1/advertiser/campaigns/${id}/publish`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.code === "CRED_INSUFFICIENT") {
          toast.error("크레딧이 부족합니다. 충전 후 다시 시도해주세요.");
          return;
        }
        throw new Error(json.message || "Failed to publish campaign");
      }

      toast.success("캠페인이 게시되었습니다.");
      fetchCampaign();
    } catch (err) {
      console.error(err);
      toast.error("캠페인 게시에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{error || "캠페인을 찾을 수 없습니다."}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT;
  const isDraft = campaign.status === "DRAFT";

  return (
    <div className="animate-in fade-in space-y-6 pb-20 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 text-slate-500 hover:text-slate-900"
            onClick={() => router.push("/advertiser/campaigns")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            목록으로
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{campaign.title}</h1>
            <Badge className={statusInfo.className} variant="secondary">
              {statusInfo.label}
            </Badge>
          </div>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date(campaign.createdAt).toLocaleDateString()} 생성</span>
            {campaign.startAt && (
              <>
                <span>·</span>
                <span>{new Date(campaign.startAt).toLocaleDateString()} 시작</span>
              </>
            )}
            <span>·</span>
            <span>{new Date(campaign.endAt).toLocaleDateString()} 종료</span>
          </p>
        </div>

        {isDraft && (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/advertiser/campaigns/${campaign.id}/edit`}>수정하기</Link>
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  게시 중...
                </>
              ) : (
                "게시하기"
              )}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">캠페인 정보</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <DetailItem
                icon={<Target className="h-4 w-4 text-slate-500" />}
                label="목표 인원"
                value={`${campaign.targetCount.toLocaleString()}명`}
              />
              <DetailItem
                icon={<Users className="h-4 w-4 text-slate-500" />}
                label="현재 참여"
                value={`${campaign.currentCount.toLocaleString()}명`}
              />
              <DetailItem
                icon={<CreditCard className="h-4 w-4 text-slate-500" />}
                label="보상 금액"
                value={`${campaign.rewardAmount.toLocaleString()}원`}
              />
              <DetailItem
                icon={<CreditCard className="h-4 w-4 text-slate-500" />}
                label="1인당 비용"
                value={`${campaign.creditCostPerValid.toLocaleString()}원`}
              />
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-slate-500">앱 링크</h3>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                {campaign.appLinkIos ? (
                  <div className="group flex items-center justify-between rounded-md bg-slate-50 p-3">
                    <span className="font-medium text-slate-600">iOS</span>
                    <a
                      href={campaign.appLinkIos}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[200px] truncate text-blue-600 hover:underline"
                    >
                      {campaign.appLinkIos}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 opacity-60">
                    <span className="font-medium text-slate-600">iOS</span>
                    <span className="text-slate-400">설정안됨</span>
                  </div>
                )}
                {campaign.appLinkAndroid ? (
                  <div className="group flex items-center justify-between rounded-md bg-slate-50 p-3">
                    <span className="font-medium text-slate-600">Android</span>
                    <a
                      href={campaign.appLinkAndroid}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[200px] truncate text-blue-600 hover:underline"
                    >
                      {campaign.appLinkAndroid}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 opacity-60">
                    <span className="font-medium text-slate-600">Android</span>
                    <span className="text-slate-400">설정안됨</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">상세 내용</h2>
            <div className="prose prose-sm max-w-none rounded-lg border border-slate-100 bg-slate-50 p-4 leading-relaxed whitespace-pre-wrap text-slate-600">
              {campaign.description}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-slate-500" />
              질문 목록
            </h2>
            <div className="space-y-3">
              {campaign.questions.map((q) => (
                <div key={q.order} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500 shadow-sm">
                    {q.order}
                  </span>
                  <p className="mt-0.5 text-sm text-slate-700">{q.text}</p>
                </div>
              ))}
              {campaign.questions.length === 0 && (
                <p className="text-sm text-slate-500 italic">등록된 질문이 없습니다.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-l-primary border-l-4 p-6 shadow-md">
            <h3 className="mb-4 text-sm font-medium text-slate-500">참여 현황</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">전체 참여</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  {campaign.stats.total}
                </span>
              </div>
              <Separator />
              <StatRow
                label="승인됨"
                value={campaign.stats.approved}
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                textColor="text-emerald-700"
                bgColor="bg-emerald-50"
              />
              <StatRow
                label="검토중"
                value={campaign.stats.pending}
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                textColor="text-amber-700"
                bgColor="bg-amber-50"
              />
              <StatRow
                label="반려됨"
                value={campaign.stats.rejected}
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                textColor="text-red-700"
                bgColor="bg-red-50"
              />
            </div>

            {campaign.status === "RUNNING" && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-center text-xs text-slate-400">
                  실시간으로 데이터가 업데이트됩니다.
                </p>
              </div>
            )}
          </Card>

          {isDraft && (
            <Card className="border-blue-100 bg-blue-50/50 p-6">
              <h4 className="mb-2 text-sm font-semibold text-blue-900">캠페인 게시 안내</h4>
              <ul className="list-disc space-y-2 pl-4 text-xs text-blue-700">
                <li>게시하기 버튼을 누르면 즉시 사용자들에게 노출됩니다.</li>
                <li>시작일이 미래인 경우 '예정' 상태로 표시됩니다.</li>
                <li>게시 후에는 질문을 수정할 수 없습니다.</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
  textColor,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  textColor: string;
  bgColor: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg p-3 ${bgColor}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      </div>
      <span className={`font-bold tabular-nums ${textColor}`}>{value}</span>
    </div>
  );
}
