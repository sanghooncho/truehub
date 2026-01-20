"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
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
import { Search, Eye, Ban, CheckCircle, Users, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  provider: string;
  profileName: string | null;
  participations: number;
  rewards: number;
  isBanned: boolean;
  banReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  banned: number;
}

type BannedFilter = "all" | "active" | "banned";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, banned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [bannedFilter, setBannedFilter] = useState<BannedFilter>("all");
  const [search, setSearch] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (bannedFilter === "active") params.set("banned", "false");
      if (bannedFilter === "banned") params.set("banned", "true");
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.items);
        setStats(data.data.stats);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bannedFilter]);

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanReason("");
    setBanDialogOpen(true);
  };

  const handleBan = async () => {
    if (!selectedUser) return;

    setActionLoading(selectedUser.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ban", reason: banReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "정지에 실패했습니다");
        return;
      }

      toast.success("사용자가 정지되었습니다");
      setBanDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "정지 해제에 실패했습니다");
        return;
      }

      toast.success("정지가 해제되었습니다");
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
          <h1 className="text-2xl font-bold text-slate-900">사용자 관리</h1>
          <p className="text-slate-500">테스터 사용자를 관리하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="이메일로 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton active={bannedFilter === "all"} onClick={() => setBannedFilter("all")}>
              전체
            </FilterButton>
            <FilterButton
              active={bannedFilter === "active"}
              onClick={() => setBannedFilter("active")}
            >
              활성
            </FilterButton>
            <FilterButton
              active={bannedFilter === "banned"}
              onClick={() => setBannedFilter("banned")}
            >
              정지
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="전체 사용자" count={stats.total} />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          label="활성 사용자"
          count={stats.active}
        />
        <StatCard
          icon={<Ban className="h-5 w-5 text-red-500" />}
          label="정지된 사용자"
          count={stats.banned}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>최근 가입순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{u.email}</p>
                      <ProviderBadge provider={u.provider} />
                      {u.isBanned && <Badge variant="destructive">정지</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>참여: {u.participations}건</span>
                      <span>리워드: ₩{u.rewards.toLocaleString()}</span>
                      <span>가입: {new Date(u.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${u.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        상세
                      </Button>
                    </Link>
                    {u.isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnban(u.id)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        해제
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openBanDialog(u)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="mr-1 h-4 w-4" />
                        )}
                        정지
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">등록된 사용자가 없습니다</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정지</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} 사용자를 정지합니다. 정지 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="정지 사유를 입력하세요..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              정지하기
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

function StatCard({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{count.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    KAKAO: "bg-yellow-100 text-yellow-800",
    NAVER: "bg-green-100 text-green-800",
    GOOGLE: "bg-blue-100 text-blue-800",
  };

  return (
    <Badge variant="outline" className={colors[provider] || ""}>
      {provider}
    </Badge>
  );
}
