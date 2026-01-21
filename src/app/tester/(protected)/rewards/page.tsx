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
      <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent">리워드</h1>
      <p className="mb-6 text-sm text-slate-500">캠페인 참여로 받은 리워드를 확인하세요</p>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-[1.25rem] border border-white/50 bg-gradient-to-br from-white to-blue-50/50 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <p className="mb-1 text-sm font-medium text-slate-500">총 적립</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">
            {(data?.totalEarned ?? 0).toLocaleString()}P
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/50 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-xl shadow-blue-100/40 backdrop-blur-sm">
          <p className="mb-1 text-sm font-semibold text-blue-600">지급 대기</p>
          <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-2xl font-bold tabular-nums text-transparent">
            {(data?.totalPending ?? 0).toLocaleString()}P
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-bold text-slate-800">리워드 내역</h2>

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
      className="animate-fade-in-up flex items-center justify-between rounded-[1.25rem] border border-white/50 bg-white/80 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-200/30"
      style={style}
    >
      <div>
        <p className="font-semibold text-slate-800">{reward.title}</p>
        <p className="text-xs font-medium text-slate-400">{relativeTime}</p>
      </div>
      <div className="text-right">
        <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-bold tabular-nums text-transparent">+{reward.amount.toLocaleString()}P</p>
        <p className={cn("text-xs font-medium", config.className)}>{config.label}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-5">
      <Skeleton className="mb-2 h-8 w-24" />
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-[1.25rem]" />
        <Skeleton className="h-24 rounded-[1.25rem]" />
      </div>
      <Skeleton className="mb-4 h-6 w-28" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-[1.25rem]" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
        <Gift className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">아직 리워드가 없어요</h3>
      <p className="text-sm text-slate-500">캠페인에 참여하고 승인되면 리워드가 지급돼요!</p>
    </div>
  );
}
