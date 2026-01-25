"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Copy, Loader2, Ticket, Users, Calendar, Trash2, Edit } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  totalRedemptions: number;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, totalRedemptions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    amount: 10000,
    maxUses: 100,
    description: "",
    expiresAt: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/promo-codes");
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.data.items);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCodes = promoCodes.filter((p) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.code.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  });

  const resetForm = () => {
    setFormData({ code: "", amount: 10000, maxUses: 100, description: "", expiresAt: "" });
  };

  const handleCreate = async () => {
    if (!formData.code.trim()) {
      toast.error("코드를 입력해주세요");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          amount: formData.amount,
          maxUses: formData.maxUses,
          description: formData.description || undefined,
          expiresAt: formData.expiresAt || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const details = data.error?.details;
        if (details && Array.isArray(details)) {
          toast.error(details.map((d: { message: string }) => d.message).join(", "));
        } else {
          toast.error(data.error?.message || "생성에 실패했습니다");
        }
        return;
      }

      toast.success(`프로모션 코드 ${data.data.code}가 생성되었습니다`);
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (promoCode: PromoCode) => {
    try {
      const res = await fetch(`/api/v1/admin/promo-codes/${promoCode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promoCode.isActive }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "변경에 실패했습니다");
        return;
      }

      toast.success(promoCode.isActive ? "비활성화되었습니다" : "활성화되었습니다");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    }
  };

  const handleDelete = async (promoCode: PromoCode) => {
    if (!confirm(`${promoCode.code}를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/promo-codes/${promoCode.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "삭제에 실패했습니다");
        return;
      }

      toast.success("삭제되었습니다");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    }
  };

  const openEditDialog = (promoCode: PromoCode) => {
    setSelectedCode(promoCode);
    setFormData({
      code: promoCode.code,
      amount: promoCode.amount,
      maxUses: promoCode.maxUses,
      description: promoCode.description || "",
      expiresAt: promoCode.expiresAt ? promoCode.expiresAt.slice(0, 16) : "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCode) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/promo-codes/${selectedCode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.amount,
          maxUses: formData.maxUses,
          description: formData.description || null,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "수정에 실패했습니다");
        return;
      }

      toast.success("수정되었습니다");
      setEditDialogOpen(false);
      resetForm();
      setSelectedCode(null);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("코드가 복사되었습니다");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">프로모션 코드</h1>
          <p className="text-slate-500">광고주 가입 보너스 코드를 관리하세요</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          코드 생성
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="전체 코드" value={stats.total} icon={<Ticket className="h-5 w-5" />} />
        <StatCard
          label="활성 코드"
          value={stats.active}
          icon={<Ticket className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="총 사용 횟수"
          value={stats.totalRedemptions}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="코드 / 설명 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>코드 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : filteredCodes.length > 0 ? (
            <div className="space-y-4">
              {filteredCodes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(p.code)}
                        className="hover:text-primary flex items-center gap-1 font-mono text-lg font-bold text-slate-900"
                      >
                        {p.code}
                        <Copy className="h-4 w-4" />
                      </button>
                      {!p.isActive && <Badge variant="secondary">비활성</Badge>}
                      {isExpired(p.expiresAt) && <Badge variant="destructive">만료됨</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="text-primary font-semibold">
                        ₩{p.amount.toLocaleString()}
                      </span>
                      <span>
                        {p.currentUses} / {p.maxUses}명 사용
                      </span>
                      {p.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(p.expiresAt).toLocaleDateString("ko-KR")}
                        </span>
                      )}
                    </div>
                    {p.description && <p className="text-sm text-slate-400">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={p.isActive} onCheckedChange={() => handleToggleActive(p)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {p.currentUses === 0 && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">프로모션 코드가 없습니다</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로모션 코드 생성</DialogTitle>
            <DialogDescription>새로운 가입 보너스 코드를 생성합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">코드</Label>
              <Input
                id="code"
                placeholder="예: DISQUIET10000"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">보너스 금액 (원)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">최대 사용 횟수</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Input
                id="description"
                placeholder="예: 디스콰이엇 프로모션"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">만료일 (선택)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로모션 코드 수정</DialogTitle>
            <DialogDescription>{selectedCode?.code}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">보너스 금액 (원)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxUses">최대 사용 횟수</Label>
                <Input
                  id="edit-maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">만료일</Label>
              <Input
                id="edit-expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                resetForm();
                setSelectedCode(null);
              }}
            >
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "primary";
}) {
  const colors = {
    default: "bg-slate-50 border-slate-200",
    success: "bg-green-50 border-green-200",
    primary: "bg-blue-50 border-blue-200",
  };

  return (
    <Card className={`border ${colors[variant]}`}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="text-slate-400">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
