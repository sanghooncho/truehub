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
} from "lucide-react";

export default function AdminJobsPage() {
  // TODO: Fetch real data from API
  const jobs = [
    {
      id: "j001",
      type: "FRAUD_CHECK",
      status: "PENDING",
      payload: "participation_id: p001",
      attempts: 0,
      createdAt: "2026-01-20 16:30",
    },
    {
      id: "j002",
      type: "AI_INSIGHT",
      status: "PROCESSING",
      payload: "campaign_id: c001",
      attempts: 1,
      createdAt: "2026-01-20 16:25",
    },
    {
      id: "j003",
      type: "REWARD_PAYOUT",
      status: "FAILED",
      payload: "reward_id: r001",
      attempts: 3,
      error: "Payment gateway timeout",
      createdAt: "2026-01-20 16:00",
    },
    {
      id: "j004",
      type: "EMAIL_SEND",
      status: "COMPLETED",
      payload: "user_id: u001, template: reward_approved",
      attempts: 1,
      createdAt: "2026-01-20 15:45",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">잡 큐</h1>
          <p className="text-slate-500">백그라운드 작업 현황을 모니터링하세요</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-slate-500" />}
          label="대기"
          count={12}
          variant="default"
        />
        <StatCard
          icon={<Cog className="h-5 w-5 animate-spin text-blue-500" />}
          label="처리중"
          count={3}
          variant="info"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="실패"
          count={2}
          variant="error"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          label="Dead Letter"
          count={1}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Job ID 또는 payload 검색..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>작업 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
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
                  </div>
                  <p className="font-mono text-xs text-slate-500">{j.payload}</p>
                  {j.error && (
                    <p className="text-xs text-red-500">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      {j.error}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>ID: {j.id}</span>
                    <span>시도: {j.attempts}/3</span>
                    <span>{j.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {j.status === "FAILED" && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-1 h-4 w-4" />
                      재시도
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
  variant: "default" | "info" | "error" | "warning";
}) {
  const colors = {
    default: "bg-slate-50 border-slate-200",
    info: "bg-blue-50 border-blue-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-orange-50 border-orange-200",
  };

  return (
    <Card className={`border ${colors[variant]}`}>
      <CardContent className="flex items-center gap-4 p-4">
        {icon}
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    FRAUD_CHECK: "bg-purple-100 text-purple-800",
    AI_INSIGHT: "bg-blue-100 text-blue-800",
    REWARD_PAYOUT: "bg-green-100 text-green-800",
    EMAIL_SEND: "bg-orange-100 text-orange-800",
  };

  return (
    <Badge variant="outline" className={colors[type] || ""}>
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
