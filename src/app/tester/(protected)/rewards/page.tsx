"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Wallet, TrendingUp, TrendingDown, ChevronLeft, Coins } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PointHistoryItem {
  id: string;
  transactionType: "earned" | "spent";
  title: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

interface PointsData {
  items: PointHistoryItem[];
  summary: {
    availablePoints: number;
    totalEarned: number;
    totalPending: number;
    totalSpent: number;
  };
}

export default function PointsHistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch("/api/v1/rewards/my");
        if (!response.ok) {
          throw new Error("포인트 내역을 불러오는데 실패했습니다.");
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

    fetchPoints();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const summary = data?.summary;

  return (
    <div className="animate-fade-in-up min-h-screen pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 px-5 pt-4 pb-8 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <button
          onClick={() => router.back()}
          className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <h1 className="relative mb-2 text-2xl font-bold">포인트 내역</h1>
        <p className="relative mb-4 text-sm text-blue-100">포인트 적립 및 사용 내역을 확인하세요</p>

        <div className="relative rounded-[1.5rem] border border-white/20 bg-white/20 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">보유 포인트</p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {(summary?.availablePoints ?? 0).toLocaleString()}
                <span className="ml-1 text-lg">P</span>
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Coins className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.25rem] border border-white/50 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">총 적립</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">
              +{(summary?.totalEarned ?? 0).toLocaleString()}
              <span className="ml-0.5 text-base">P</span>
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-white/50 bg-gradient-to-br from-white to-rose-50/50 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">총 사용</p>
            </div>
            <p className="text-2xl font-bold text-rose-600 tabular-nums">
              -{(summary?.totalSpent ?? 0).toLocaleString()}
              <span className="ml-0.5 text-base">P</span>
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-slate-800">거래 내역</h2>

        {data?.items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {data?.items.map((item, index) => (
              <TransactionItem
                key={item.id}
                item={item}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionItem({ item, style }: { item: PointHistoryItem; style?: React.CSSProperties }) {
  const isEarned = item.transactionType === "earned";
  const relativeTime = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div
      className="animate-fade-in-up flex items-center gap-3 rounded-[1.25rem] border border-white/50 bg-white/80 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-200/30"
      style={style}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          isEarned
            ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30"
            : "bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/30"
        )}
      >
        {isEarned ? (
          <TrendingUp className="h-6 w-6 text-white" />
        ) : (
          <TrendingDown className="h-6 w-6 text-white" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800">{item.title}</p>
        <p className="text-xs font-medium text-slate-400">
          {item.description ? `${item.description} · ` : ""}
          {relativeTime}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-lg font-bold tabular-nums",
          isEarned ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {isEarned ? "+" : "-"}
        {item.amount.toLocaleString()}P
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 px-5 pt-4 pb-8">
        <Skeleton className="mb-4 h-10 w-10 rounded-xl bg-white/20" />
        <Skeleton className="mb-2 h-8 w-32 bg-white/20" />
        <Skeleton className="mb-4 h-4 w-52 bg-white/20" />
        <Skeleton className="h-28 rounded-[1.5rem] bg-white/20" />
      </div>
      <div className="px-5 pt-4">
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-[1.25rem]" />
          <Skeleton className="h-24 rounded-[1.25rem]" />
        </div>
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
        <Wallet className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">아직 포인트 내역이 없어요</h3>
      <p className="text-sm text-slate-500">캠페인에 참여하고 승인되면 포인트가 적립돼요!</p>
    </div>
  );
}
