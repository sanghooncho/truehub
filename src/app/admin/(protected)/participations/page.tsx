"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Search, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Participation {
  id: string;
  campaign: { id: string; title: string; rewardAmount: number };
  user: { id: string; email: string; provider: string };
  status: string;
  fraudScore: number | null;
  fraudDecision: string | null;
  submittedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

type StatusFilter =
  | "all"
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "MANUAL_REVIEW"
  | "APPROVED"
  | "REJECTED";

export default function AdminParticipationsPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/participations?${params}`);
      const data = await res.json();

      if (data.success) {
        setParticipations(data.data.items);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch participations:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/admin/participations/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "승인에 실패했습니다");
        return;
      }

      toast.success("참여가 승인되었습니다");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (id: string) => {
    setSelectedId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedId || !rejectReason.trim()) {
      toast.error("반려 사유를 입력해주세요");
      return;
    }

    setActionLoading(selectedId);
    try {
      const res = await fetch(`/api/v1/admin/participations/${selectedId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "반려에 실패했습니다");
        return;
      }

      toast.success("참여가 반려되었습니다");
      setRejectDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  const isPending = (status: string) =>
    ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"].includes(status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">참여 심사</h1>
          <p className="text-slate-500">사용자 참여 내역을 심사하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="캠페인 검색..."
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
              active={statusFilter === "SUBMITTED"}
              onClick={() => setStatusFilter("SUBMITTED")}
            >
              대기
            </FilterButton>
            <FilterButton
              active={statusFilter === "APPROVED"}
              onClick={() => setStatusFilter("APPROVED")}
            >
              승인
            </FilterButton>
            <FilterButton
              active={statusFilter === "REJECTED"}
              onClick={() => setStatusFilter("REJECTED")}
            >
              반려
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatBadge label="전체" count={stats.total} variant="default" />
        <StatBadge label="대기" count={stats.pending} variant="warning" />
        <StatBadge label="승인" count={stats.approved} variant="success" />
        <StatBadge label="반려" count={stats.rejected} variant="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>심사 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : participations.length > 0 ? (
            <div className="space-y-4">
              {participations.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{p.campaign.title}</p>
                    <p className="text-sm text-slate-500">
                      {p.user.email} · {new Date(p.submittedAt).toLocaleString("ko-KR")}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} />
                      <FraudBadge score={p.fraudScore} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/participations/${p.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        상세
                      </Button>
                    </Link>
                    {isPending(p.status) && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(p.id)}
                          disabled={actionLoading === p.id}
                        >
                          {actionLoading === p.id ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                          승인
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectDialog(p.id)}
                          disabled={actionLoading === p.id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          반려
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">심사할 참여가 없습니다</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>참여 반려</DialogTitle>
            <DialogDescription>반려 사유를 입력해주세요</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="반려 사유를 입력하세요..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading !== null}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              반려하기
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

function StatBadge({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "default" | "warning" | "success" | "destructive";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-green-100 text-green-700",
    destructive: "bg-red-100 text-red-700",
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: "대기", className: "bg-amber-100 text-amber-700" },
    PENDING_REVIEW: { label: "대기", className: "bg-amber-100 text-amber-700" },
    MANUAL_REVIEW: { label: "검토", className: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
    PAID: { label: "지급완료", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "반려", className: "bg-red-100 text-red-700" },
    AUTO_REJECTED: { label: "자동반려", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}

function FraudBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  const normalized = score > 1 ? score / 100 : score;

  if (normalized < 0.3) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        정상
      </Badge>
    );
  } else if (normalized < 0.7) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700">
        주의
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700">
        의심
      </Badge>
    );
  }
}
