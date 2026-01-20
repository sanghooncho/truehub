"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  CheckCircle,
  XCircle,
  CreditCard,
  Building2,
  Loader2,
  Copy,
  Clock,
} from "lucide-react";

interface Topup {
  id: string;
  advertiser: {
    id: string;
    email: string;
    companyName: string | null;
  };
  amount: number;
  method: string;
  depositCode: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  confirmed: number;
  cancelled: number;
  totalPendingAmount: number;
}

type StatusFilter = "PENDING" | "CONFIRMED" | "CANCELLED";

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<Topup[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalPendingAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTopup, setSelectedTopup] = useState<Topup | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);

      const res = await fetch(`/api/v1/admin/topups?${params}`);
      const data = await res.json();

      if (data.success) {
        setTopups(data.data.items);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch topups:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTopups = topups.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      t.advertiser.companyName?.toLowerCase().includes(searchLower) ||
      t.advertiser.email.toLowerCase().includes(searchLower) ||
      t.depositCode.toLowerCase().includes(searchLower)
    );
  });

  const openConfirmDialog = (topup: Topup) => {
    setSelectedTopup(topup);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedTopup) return;

    setActionLoading(selectedTopup.id);
    try {
      const res = await fetch(`/api/v1/admin/topups/${selectedTopup.id}/confirm`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "확인에 실패했습니다");
        return;
      }

      toast.success(`₩${selectedTopup.amount.toLocaleString()} 충전이 확인되었습니다`);
      setConfirmDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  const copyDepositCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("입금자명이 복사되었습니다");
  };

  const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">충전 승인</h1>
          <p className="text-slate-500">광고주 크레딧 충전 요청을 처리하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="광고주 / 입금자명 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={statusFilter === "PENDING"}
              onClick={() => setStatusFilter("PENDING")}
            >
              대기
            </FilterButton>
            <FilterButton
              active={statusFilter === "CONFIRMED"}
              onClick={() => setStatusFilter("CONFIRMED")}
            >
              완료
            </FilterButton>
            <FilterButton
              active={statusFilter === "CANCELLED"}
              onClick={() => setStatusFilter("CANCELLED")}
            >
              취소
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="대기"
          count={stats.pending}
          amount={stats.totalPendingAmount}
          variant="warning"
        />
        <StatCard label="완료" count={stats.confirmed} variant="success" />
        <StatCard label="취소" count={stats.cancelled} variant="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>충전 요청 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : filteredTopups.length > 0 ? (
            <div className="space-y-4">
              {filteredTopups.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {t.advertiser.companyName || t.advertiser.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-primary h-4 w-4" />
                      <p className="text-primary text-lg font-bold tabular-nums">
                        ₩{t.amount.toLocaleString()}
                      </p>
                      <MethodBadge method={t.method} />
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>요청: {new Date(t.createdAt).toLocaleString("ko-KR")}</span>
                      <button
                        onClick={() => copyDepositCode(t.depositCode)}
                        className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                      >
                        <span>입금자명: {t.depositCode}</span>
                        <Copy className="h-3 w-3" />
                      </button>
                      {t.status === "PENDING" && (
                        <span
                          className={`flex items-center gap-1 ${isExpired(t.expiresAt) ? "text-red-500" : "text-slate-400"}`}
                        >
                          <Clock className="h-3 w-3" />
                          {isExpired(t.expiresAt)
                            ? "만료됨"
                            : `만료: ${new Date(t.expiresAt).toLocaleString("ko-KR")}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.status === "PENDING" && !isExpired(t.expiresAt) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openConfirmDialog(t)}
                        disabled={actionLoading === t.id}
                      >
                        {actionLoading === t.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        입금 확인
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">충전 요청이 없습니다</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>입금 계좌 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-600">
            <span className="font-medium">은행:</span> 신한은행
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">계좌번호:</span> 110-397-512270
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">예금주:</span> 조상훈
          </p>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입금 확인</DialogTitle>
            <DialogDescription>아래 충전 요청의 입금을 확인하시겠습니까?</DialogDescription>
          </DialogHeader>
          {selectedTopup && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">광고주</span>
                <span className="font-medium text-slate-900">
                  {selectedTopup.advertiser.companyName || selectedTopup.advertiser.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">충전 금액</span>
                <span className="text-primary font-bold">
                  ₩{selectedTopup.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">입금자명</span>
                <span className="font-mono font-medium text-slate-900">
                  {selectedTopup.depositCode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">요청일시</span>
                <span className="text-slate-700">
                  {new Date(selectedTopup.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              입금 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  label,
  count,
  amount,
  variant,
}: {
  label: string;
  count: number;
  amount?: number;
  variant: "warning" | "success" | "destructive";
}) {
  const colors = {
    warning: "bg-amber-50 border-amber-200",
    success: "bg-green-50 border-green-200",
    destructive: "bg-red-50 border-red-200",
  };

  return (
    <Card className={`border ${colors[variant]}`}>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{count}건</p>
        {amount !== undefined && (
          <p className="text-sm text-slate-600 tabular-nums">₩{amount.toLocaleString()}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MethodBadge({ method }: { method: string }) {
  const labels: Record<string, string> = {
    BANK: "계좌이체",
    STRIPE: "카드결제",
  };

  return (
    <Badge variant="outline" className="text-xs">
      {labels[method] || method}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { variant: "default" | "secondary" | "destructive"; label: string }
  > = {
    PENDING: { variant: "secondary", label: "대기" },
    CONFIRMED: { variant: "default", label: "완료" },
    CANCELLED: { variant: "destructive", label: "취소" },
  };
  const { variant, label } = config[status] || { variant: "secondary" as const, label: status };

  return <Badge variant={variant}>{label}</Badge>;
}
