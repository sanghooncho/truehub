"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Megaphone, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  advertiser: {
    id: string;
    companyName: string;
  };
  status: string;
  participations: number;
  targetCount: number;
  currentCount: number;
  rewardAmount: number;
  startAt: string | null;
  endAt: string;
  createdAt: string;
}

interface Stats {
  total: number;
  draft: number;
  running: number;
  paused: number;
  closed: number;
  settling: number;
  completed: number;
}

type StatusFilter = "all" | "DRAFT" | "RUNNING" | "PAUSED" | "CLOSED" | "SETTLING" | "COMPLETED";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    running: 0,
    paused: 0,
    closed: 0,
    settling: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/campaigns?${params}`);
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.data.items);
        setStats(data.data.stats);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">캠페인 관리</h1>
          <p className="text-slate-500">전체 캠페인 현황을 확인하세요</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="캠페인 또는 광고주 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              전체
            </FilterButton>
            <FilterButton
              active={statusFilter === "RUNNING"}
              onClick={() => setStatusFilter("RUNNING")}
            >
              진행중
            </FilterButton>
            <FilterButton
              active={statusFilter === "PAUSED"}
              onClick={() => setStatusFilter("PAUSED")}
            >
              일시중지
            </FilterButton>
            <FilterButton
              active={statusFilter === "COMPLETED"}
              onClick={() => setStatusFilter("COMPLETED")}
            >
              완료
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatBadge label="전체" count={stats.total} variant="default" />
        <StatBadge label="진행중" count={stats.running} variant="success" />
        <StatBadge label="일시중지" count={stats.paused} variant="warning" />
        <StatBadge label="완료" count={stats.completed} variant="secondary" />
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>캠페인 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Megaphone className="text-primary h-4 w-4" />
                      <p className="font-medium text-slate-900">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-slate-500">{c.advertiser.companyName}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>
                        참여: {c.currentCount}/{c.targetCount}
                      </span>
                      <span>리워드: ₩{c.rewardAmount.toLocaleString()}</span>
                      <span>마감: {new Date(c.endAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.min((c.currentCount / c.targetCount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <Link href={`/admin/campaigns/${c.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      상세
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">등록된 캠페인이 없습니다</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function StatBadge({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "default" | "warning" | "success" | "secondary";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-green-100 text-green-700",
    secondary: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    RUNNING: "default",
    PAUSED: "secondary",
    CLOSED: "destructive",
    SETTLING: "secondary",
    COMPLETED: "secondary",
  };
  const labels: Record<string, string> = {
    DRAFT: "초안",
    RUNNING: "진행중",
    PAUSED: "일시중지",
    CLOSED: "종료",
    SETTLING: "정산중",
    COMPLETED: "완료",
  };

  return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
}
