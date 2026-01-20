"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  RefreshCw,
  Cog,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Skull,
} from "lucide-react";

interface Job {
  id: string;
  type: string;
  status: string;
  priority: string;
  payload: string;
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  scheduledAt: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead: number;
}

type StatusFilter = "all" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "DEAD";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    dead: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/jobs?${params}`);
      const data = await res.json();

      if (data.success) {
        setJobs(data.data.items);
        setStats(data.data.stats);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      const res = await fetch(`/api/v1/admin/jobs/${jobId}/retry`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "재시도 요청에 실패했습니다");
        return;
      }

      toast.success("작업이 재시도 대기열에 추가되었습니다");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setRetryingId(null);
    }
  };

  const runJobs = async () => {
    try {
      const res = await fetch("/api/v1/jobs/run", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success(`처리: ${data.data.processed}건, 실패: ${data.data.failed}건`);
        fetchData();
      } else {
        toast.error("작업 실행에 실패했습니다");
      }
    } catch {
      toast.error("오류가 발생했습니다");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">잡 큐</h1>
          <p className="text-slate-500">백그라운드 작업 현황을 모니터링하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <Button onClick={runJobs}>
            <Cog className="mr-2 h-4 w-4" />
            작업 실행
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          icon={<Clock className="h-5 w-5 text-slate-500" />}
          label="대기"
          count={stats.pending}
          variant="default"
        />
        <StatCard
          icon={<Cog className="h-5 w-5 animate-spin text-blue-500" />}
          label="처리중"
          count={stats.processing}
          variant="info"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          label="완료"
          count={stats.completed}
          variant="success"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="실패"
          count={stats.failed}
          variant="error"
        />
        <StatCard
          icon={<Skull className="h-5 w-5 text-orange-500" />}
          label="Dead Letter"
          count={stats.dead}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Job ID 또는 payload 검색..."
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
              active={statusFilter === "PENDING"}
              onClick={() => setStatusFilter("PENDING")}
            >
              대기
            </FilterButton>
            <FilterButton
              active={statusFilter === "PROCESSING"}
              onClick={() => setStatusFilter("PROCESSING")}
            >
              처리중
            </FilterButton>
            <FilterButton
              active={statusFilter === "FAILED"}
              onClick={() => setStatusFilter("FAILED")}
            >
              실패
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>작업 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={j.type} />
                      <StatusBadge status={j.status} />
                      <PriorityBadge priority={j.priority} />
                    </div>
                    <p className="max-w-md truncate font-mono text-xs text-slate-500">
                      {j.payload}
                    </p>
                    {j.errorMessage && (
                      <p className="text-xs text-red-500">
                        <AlertCircle className="mr-1 inline h-3 w-3" />
                        {j.errorMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>ID: {j.id.slice(0, 8)}...</span>
                      <span>
                        시도: {j.attempts}/{j.maxAttempts}
                      </span>
                      <span>{new Date(j.createdAt).toLocaleString("ko-KR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(j.status === "FAILED" || j.status === "DEAD") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(j.id)}
                        disabled={retryingId === j.id}
                      >
                        {retryingId === j.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-4 w-4" />
                        )}
                        재시도
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">등록된 작업이 없습니다</div>
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

function StatCard({
  icon,
  label,
  count,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  variant: "default" | "info" | "error" | "warning" | "success";
}) {
  const colors = {
    default: "bg-slate-50 border-slate-200",
    info: "bg-blue-50 border-blue-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-orange-50 border-orange-200",
    success: "bg-green-50 border-green-200",
  };

  return (
    <Card className={`border ${colors[variant]}`}>
      <CardContent className="flex items-center gap-4 p-4">
        {icon}
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    FRAUD_CHECK: "bg-purple-100 text-purple-800",
    PHASH_CALC: "bg-indigo-100 text-indigo-800",
    TEXT_SIMILARITY: "bg-cyan-100 text-cyan-800",
    AI_REPORT: "bg-blue-100 text-blue-800",
    SEND_EMAIL: "bg-orange-100 text-orange-800",
    SCREENSHOT_VERIFY: "bg-pink-100 text-pink-800",
  };

  return (
    <Badge variant="outline" className={colors[type] || "bg-slate-100"}>
      {type}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    PENDING: { variant: "outline", label: "대기" },
    PROCESSING: { variant: "secondary", label: "처리중" },
    COMPLETED: { variant: "default", label: "완료" },
    FAILED: { variant: "destructive", label: "실패" },
    DEAD: { variant: "destructive", label: "Dead" },
  };

  const c = config[status] || { variant: "outline" as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-slate-100 text-slate-800",
  };

  return (
    <Badge variant="outline" className={colors[priority] || ""}>
      {priority}
    </Badge>
  );
}
