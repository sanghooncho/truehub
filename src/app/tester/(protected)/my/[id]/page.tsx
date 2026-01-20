"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ParticipationStatus =
  | "SUBMITTED"
  | "AUTO_REJECTED"
  | "PENDING_REVIEW"
  | "MANUAL_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

interface ParticipationDetail {
  id: string;
  status: ParticipationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  campaign: {
    id: string;
    title: string;
    description: string;
    advertiserName: string;
    rewardAmount: number;
    questions: { order: number; text: string }[];
  };
  answers: {
    answer1: string;
    answer2: string;
    feedback: string;
  };
  assets: {
    id: string;
    slot: number;
    url: string | null;
    filename: string | null;
    mimeType: string | null;
  }[];
  reward: {
    id: string;
    status: string;
    amount: number;
    sentAt: string | null;
  } | null;
}

const STATUS_CONFIG: Record<
  ParticipationStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  SUBMITTED: {
    label: "제출됨",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  AUTO_REJECTED: {
    label: "자동 반려",
    icon: <XCircle className="h-4 w-4" />,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  PENDING_REVIEW: {
    label: "검토 대기",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  MANUAL_REVIEW: {
    label: "수동 검토중",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "승인",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "반려",
    icon: <XCircle className="h-4 w-4" />,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  PAID: {
    label: "지급완료",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
};

export default function ParticipationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ParticipationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await fetch(`/api/v1/participations/my/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("참여 내역을 찾을 수 없습니다.");
            router.push("/tester/my");
            return;
          }
          throw new Error("참여 내역을 불러오는데 실패했습니다.");
        }
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchDetail();
    }
  }, [params.id, router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <div className="animate-fade-in-up pb-8">
      <header className="sticky top-14 z-40 -mx-5 border-b border-slate-100 bg-white/80 px-5 py-3 backdrop-blur-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>
      </header>

      <div className="space-y-6 p-5">
        <div>
          <Badge className={cn("mb-3 gap-1 border", statusConfig.className)}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
          <h1 className="text-xl font-bold text-slate-900">{data.campaign.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{data.campaign.advertiserName}</p>
        </div>

        {data.status === "REJECTED" && data.rejectReason && (
          <Card className="border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-700">반려 사유</p>
                <p className="mt-1 text-sm text-red-600">{data.rejectReason}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-slate-900">리워드</h2>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">금액</span>
            <span className="text-secondary text-xl font-bold tabular-nums">
              {data.campaign.rewardAmount.toLocaleString()}P
            </span>
          </div>
          {data.reward && (
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">지급 상태</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  data.reward.status === "SENT"
                    ? "text-emerald-600"
                    : data.reward.status === "FAILED"
                      ? "text-red-600"
                      : "text-amber-600"
                )}
              >
                {data.reward.status === "SENT"
                  ? "지급완료"
                  : data.reward.status === "FAILED"
                    ? "지급실패"
                    : "지급대기"}
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-slate-900">타임라인</h2>
          <div className="space-y-3">
            <TimelineItem label="제출" date={data.submittedAt} isCompleted />
            {data.reviewedAt && (
              <TimelineItem
                label={data.status === "APPROVED" || data.status === "PAID" ? "승인" : "검토완료"}
                date={data.reviewedAt}
                isCompleted
              />
            )}
            {data.reward?.sentAt && (
              <TimelineItem label="리워드 지급" date={data.reward.sentAt} isCompleted />
            )}
          </div>
        </Card>

        {data.assets.length > 0 && (
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-slate-900">제출한 스크린샷</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-100"
                >
                  {asset.url ? (
                    <Image
                      src={asset.url}
                      alt={`스크린샷 ${asset.slot}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      이미지 로드 실패
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-slate-900">제출한 답변</h2>
          <div className="space-y-4">
            {data.campaign.questions.map((q, idx) => (
              <div key={q.order}>
                <p className="text-sm font-medium text-slate-700">{q.text}</p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {idx === 0 ? data.answers.answer1 : data.answers.answer2}
                </p>
              </div>
            ))}
            <div>
              <p className="text-sm font-medium text-slate-700">추가 피드백</p>
              <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {data.answers.feedback || "없음"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  isCompleted,
}: {
  label: string;
  date: string;
  isCompleted: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          isCompleted ? "bg-emerald-100" : "bg-slate-100"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <Clock className="h-4 w-4 text-slate-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">
          {format(new Date(date), "yyyy.MM.dd HH:mm", { locale: ko })}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-5">
      <Skeleton className="mb-4 h-6 w-20" />
      <Skeleton className="mb-2 h-7 w-3/4" />
      <Skeleton className="mb-6 h-4 w-1/3" />
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
