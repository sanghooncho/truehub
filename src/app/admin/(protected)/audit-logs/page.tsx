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
  FileText,
  User,
  Settings,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  operator: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("action", search);

      const res = await fetch(`/api/v1/admin/audit-logs?${params}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("로그를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = () => {
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">감사 로그</h1>
          <p className="text-slate-500">관리자 활동 기록을 확인하세요</p>
        </div>
        <Button variant="outline" onClick={() => fetchLogs(pagination.page)} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="액션 검색 (예: APPROVE, REJECT)..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Filter className="mr-2 h-4 w-4" />
            검색
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>활동 로그</CardTitle>
          <CardDescription>총 {pagination.total}건 · 최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ActionIcon action={log.action} />
                        <ActionBadge action={log.action} />
                        <span className="text-sm text-slate-500">→</span>
                        <Badge variant="outline">
                          {log.targetType}:{log.targetId.slice(0, 8)}...
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{log.operator?.name || log.operator?.email || "System"}</span>
                        {log.ipAddress && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span>IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-2 max-w-xl overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">기록된 로그가 없습니다</div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionIcon({ action }: { action: string }) {
  if (action.includes("USER")) {
    return <User className="h-4 w-4 text-blue-500" />;
  }
  if (action.includes("PARTICIPATION") || action.includes("REWARD") || action.includes("TOPUP")) {
    return <FileText className="h-4 w-4 text-green-500" />;
  }
  if (action.includes("SETTING") || action.includes("CONFIG")) {
    return <Settings className="h-4 w-4 text-orange-500" />;
  }
  return <Shield className="h-4 w-4 text-slate-500" />;
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    APPROVE_PARTICIPATION: "bg-green-100 text-green-800",
    REJECT_PARTICIPATION: "bg-red-100 text-red-800",
    REWARD_SENT: "bg-emerald-100 text-emerald-800",
    REWARD_FAILED: "bg-red-100 text-red-800",
    USER_BAN: "bg-red-100 text-red-800",
    USER_UNBAN: "bg-blue-100 text-blue-800",
    TOPUP_CONFIRM: "bg-blue-100 text-blue-800",
    TOPUP_CANCEL: "bg-orange-100 text-orange-800",
  };

  const labels: Record<string, string> = {
    APPROVE_PARTICIPATION: "참여 승인",
    REJECT_PARTICIPATION: "참여 반려",
    REWARD_SENT: "리워드 지급",
    REWARD_FAILED: "리워드 실패",
    USER_BAN: "사용자 정지",
    USER_UNBAN: "정지 해제",
    TOPUP_CONFIRM: "충전 승인",
    TOPUP_CANCEL: "충전 취소",
  };

  return (
    <Badge variant="outline" className={colors[action] || ""}>
      {labels[action] || action}
    </Badge>
  );
}
