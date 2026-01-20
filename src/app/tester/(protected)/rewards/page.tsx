"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RewardStatus = "REQUESTED" | "SENT" | "FAILED";

interface Reward {
  id: string;
  type: string;
  campaign: {
    id: string;
    title: string;
  } | null;
  title: string;
  amount: number;
  status: RewardStatus;
  sentAt: string | null;
  createdAt: string;
}

interface RewardsData {
  items: Reward[];
  totalEarned: number;
  totalPending: number;
}

const STATUS_CONFIG: Record<RewardStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "대기중",
    className: "text-amber-600",
  },
  SENT: {
    label: "지급완료",
    className: "text-emerald-600",
  },
  FAILED: {
    label: "실패",
    className: "text-red-600",
  },
};

export default function RewardsPage() {
  const [data, setData] = useState<RewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      try {
        const response = await fetch("/api/v1/rewards/my");
        if (!response.ok) {
          throw new Error("리워드를 불러오는데 실패했습니다.");
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

    fetchRewards();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="animate-fade-in-up p-5">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">리워드</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">총 적립</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {(data?.totalEarned ?? 0).toLocaleString()}P
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">지급 대기</p>
          <p className="text-secondary text-2xl font-bold tabular-nums">
            {(data?.totalPending ?? 0).toLocaleString()}P
          </p>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">리워드 내역</h2>

      {data?.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {data?.items.map((reward, index) => (
            <RewardItem
              key={reward.id}
              reward={reward}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RewardItem({ reward, style }: { reward: Reward; style?: React.CSSProperties }) {
  const config = STATUS_CONFIG[reward.status];
  const dateStr = reward.sentAt || reward.createdAt;
  const relativeTime = formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div
      className="animate-fade-in-up flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
      style={style}
    >
      <div>
        <p className="font-medium text-slate-900">{reward.title}</p>
        <p className="text-xs text-slate-400">{relativeTime}</p>
      </div>
      <div className="text-right">
        <p className="text-secondary font-bold tabular-nums">+{reward.amount.toLocaleString()}P</p>
        <p className={cn("text-xs", config.className)}>{config.label}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-5">
      <Skeleton className="mb-6 h-8 w-24" />
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="mb-4 h-6 w-28" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Gift className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">아직 리워드가 없어요</h3>
      <p className="text-sm text-slate-500">캠페인에 참여하고 승인되면 리워드가 지급돼요!</p>
    </div>
  );
}
