"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Clock, Users, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  targetCount: number;
  currentCount: number;
  remainingSlots: number;
  endAt: string;
  appLinkIos: string | null;
  appLinkAndroid: string | null;
  advertiserName: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    items: Campaign[];
    pagination: Pagination;
  };
}

type SortOption = "latest" | "reward" | "deadline";

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const daysLeft = differenceInDays(new Date(campaign.endAt), new Date());
  const isUrgent = daysLeft <= 3;
  const isAlmostFull = campaign.remainingSlots <= 10;
  const progress = Math.round((campaign.currentCount / campaign.targetCount) * 100);

  return (
    <Link
      href={`/tester/campaigns/${campaign.id}`}
      className="block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          "rounded-[1.25rem] border border-white/50 bg-white/80 p-5 backdrop-blur-sm",
          "shadow-xl shadow-slate-200/40",
          "transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/30",
          "active:scale-[0.98]",
          "animate-fade-in-up"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <Clock className="h-3 w-3" />
            1분 컷
          </span>
          {isUrgent && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-50 to-rose-50 px-3 py-1 text-xs font-semibold text-red-600">
              마감임박
            </span>
          )}
          {isAlmostFull && !isUrgent && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-600">
              마감직전
            </span>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-800">
          {campaign.title}
        </h3>

        <p className="mb-4 text-xs font-medium text-slate-400">{campaign.advertiserName}</p>

        <div className="mb-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
              <Calendar className="h-3 w-3 text-blue-500" />
              <span className="font-medium">D-{Math.max(daysLeft, 0)}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
              <Users className="h-3 w-3 text-emerald-500" />
              <span className="font-medium tabular-nums">{campaign.remainingSlots}</span>명 남음
            </span>
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold tabular-nums text-transparent">
            {campaign.rewardAmount.toLocaleString()}P
          </span>
        </div>
      </div>
    </Link>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-1 h-5 w-3/4" />

      <Skeleton className="mb-4 h-3 w-20" />

      <Skeleton className="mb-4 h-2 w-full rounded-full" />

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center px-5 py-16">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
        <Search className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">
        {searchQuery ? "검색 결과가 없어요" : "진행 중인 캠페인이 없어요"}
      </h3>
      <p className="text-center text-sm text-slate-500">
        {searchQuery ? "다른 키워드로 검색해 보세요" : "새로운 캠페인이 곧 등록될 예정이에요"}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center px-5 py-16">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-red-100 to-rose-100 shadow-lg shadow-red-100/50">
        <span className="text-3xl">😢</span>
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">캠페인을 불러올 수 없어요</h3>
      <p className="mb-4 text-center text-sm text-slate-500">
        네트워크 상태를 확인하고 다시 시도해 주세요
      </p>
      <button
        onClick={onRetry}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95"
      >
        다시 시도
      </button>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        sort: sortBy,
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/v1/campaigns?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setCampaigns(data.data.items);
        setPagination(data.data.pagination);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, debouncedSearch]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "reward", label: "리워드순" },
    { value: "deadline", label: "마감임박순" },
  ] as const;

  return (
    <div className="animate-fade-in-up min-h-screen">
      <div className="sticky top-14 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="space-y-3 px-5 py-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-blue-500" />
            <Input
              type="text"
              placeholder="캠페인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border-0 bg-gradient-to-r from-slate-50 to-blue-50/50 pr-4 pl-11 text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-200"
            />
          </div>

          <div className="flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <p className="text-sm text-slate-500">
                {pagination ? (
                  <>
                    총{" "}
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {pagination.total}
                    </span>
                    개의 캠페인
                  </>
                ) : (
                  "캠페인 목록"
                )}
              </p>
            )}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-9 w-auto gap-1.5 rounded-xl border-white/50 bg-white/80 text-sm shadow-sm backdrop-blur-sm">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[120px] rounded-xl border-white/50 shadow-xl">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && <ErrorState onRetry={fetchCampaigns} />}

        {!isLoading && !error && campaigns.length === 0 && (
          <EmptyState searchQuery={debouncedSearch} />
        )}

        {!isLoading && !error && campaigns.length > 0 && (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={index} />
            ))}
          </div>
        )}

        {!isLoading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              <span className="tabular-nums">{pagination.page}</span> /{" "}
              <span className="tabular-nums">{pagination.totalPages}</span> 페이지
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
