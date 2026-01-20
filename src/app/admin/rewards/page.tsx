"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, Gift, Loader2, RefreshCw } from "lucide-react";

interface Reward {
  id: string;
  amount: number;
  status: "REQUESTED" | "SENT" | "FAILED";
  method: string | null;
  sentAt: string | null;
  proofText: string | null;
  failReason: string | null;
  createdAt: string;
  user: { id: string; email: string | null; profileName: string | null };
  campaign: { id: string; title: string };
  approvedAt: string | null;
  processedBy: { id: string; name: string } | null;
}

interface Stats {
  requested: { count: number; amount: number };
  sent: { count: number; amount: number };
  failed: { count: number; amount: number };
}

type StatusFilter = "REQUESTED" | "SENT" | "FAILED";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats>({
    requested: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("REQUESTED");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [proofText, setProofText] = useState("");
  const [failReason, setFailReason] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/rewards?${params}`);
      const data = await res.json();

      if (data.success) {
        setRewards(data.data.rewards);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const openSendDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setProofText("");
    setSendDialogOpen(true);
  };

  const openFailDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setFailReason("");
    setFailDialogOpen(true);
  };

  const handleMarkSent = async () => {
    if (!selectedReward) return;

    setActionLoading(selectedReward.id);
    try {
      const res = await fetch(`/api/v1/admin/rewards/${selectedReward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sent",
          method: "MANUAL",
          proofText: proofText || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "지급 처리에 실패했습니다");
        return;
      }

      toast.success("리워드가 지급 완료 처리되었습니다");
      setSendDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkFailed = async () => {
    if (!selectedReward || !failReason.trim()) {
      toast.error("실패 사유를 입력해주세요");
      return;
    }

    setActionLoading(selectedReward.id);
    try {
      const res = await fetch(`/api/v1/admin/rewards/${selectedReward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "failed",
          failReason,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "처리에 실패했습니다");
        return;
      }

      toast.success("리워드가 실패 처리되었습니다");
      setFailDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">리워드 지급</h1>
          <p className="text-slate-500">승인된 참여에 대한 리워드를 지급하세요</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="사용자 또는 캠페인 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={statusFilter === "REQUESTED"}
              onClick={() => setStatusFilter("REQUESTED")}
            >
              지급 대기
            </FilterButton>
            <FilterButton active={statusFilter === "SENT"} onClick={() => setStatusFilter("SENT")}>
              지급 완료
            </FilterButton>
            <FilterButton
              active={statusFilter === "FAILED"}
              onClick={() => setStatusFilter("FAILED")}
            >
              지급 실패
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="지급 대기"
          count={stats.requested.count}
          amount={stats.requested.amount}
          variant="warning"
        />
        <StatCard
          label="지급 완료"
          count={stats.sent.count}
          amount={stats.sent.amount}
          variant="success"
        />
        <StatCard
          label="지급 실패"
          count={stats.failed.count}
          amount={stats.failed.amount}
          variant="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "REQUESTED"
              ? "지급 대기 목록"
              : statusFilter === "SENT"
                ? "지급 완료 목록"
                : "지급 실패 목록"}
          </CardTitle>
          <CardDescription>참여 승인 순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : rewards.length > 0 ? (
            <div className="space-y-4">
              {rewards.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Gift className="text-secondary h-4 w-4" />
                      <p className="font-medium text-slate-900">{r.amount.toLocaleString()}원</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {r.user.email || r.user.profileName || "Unknown"} · {r.campaign.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      승인: {r.approvedAt ? new Date(r.approvedAt).toLocaleString("ko-KR") : "-"}
                    </p>
                    {r.status === "SENT" && r.proofText && (
                      <p className="text-xs text-green-600">증빙: {r.proofText}</p>
                    )}
                    {r.status === "FAILED" && r.failReason && (
                      <p className="text-xs text-red-600">사유: {r.failReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === "REQUESTED" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openSendDialog(r)}
                          disabled={actionLoading === r.id}
                        >
                          {actionLoading === r.id ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                          지급 완료
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFailDialog(r)}
                          disabled={actionLoading === r.id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          지급 실패
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              {statusFilter === "REQUESTED"
                ? "지급 대기 중인 리워드가 없습니다"
                : statusFilter === "SENT"
                  ? "지급 완료된 리워드가 없습니다"
                  : "지급 실패한 리워드가 없습니다"}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리워드 지급 완료</DialogTitle>
            <DialogDescription>
              {selectedReward?.user.email || selectedReward?.user.profileName}님에게{" "}
              {selectedReward?.amount.toLocaleString()}원을 지급 완료 처리합니다
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="증빙 메모 (선택사항)"
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleMarkSent} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              지급 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={failDialogOpen} onOpenChange={setFailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리워드 지급 실패</DialogTitle>
            <DialogDescription>실패 사유를 입력해주세요</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="실패 사유를 입력하세요..."
            value={failReason}
            onChange={(e) => setFailReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkFailed}
              disabled={!failReason.trim() || actionLoading !== null}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              실패 처리
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
  amount: number;
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
        <p className="text-2xl font-bold text-slate-900">{count}건</p>
        <p className="text-sm text-slate-600">{amount.toLocaleString()}원</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    REQUESTED: "secondary",
    SENT: "default",
    FAILED: "destructive",
  };
  const labels: Record<string, string> = {
    REQUESTED: "대기",
    SENT: "완료",
    FAILED: "실패",
  };

  return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
}
