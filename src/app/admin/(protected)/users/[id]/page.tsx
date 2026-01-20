"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Ban,
  CheckCircle,
  Megaphone,
  CreditCard,
  Eye,
  Shield,
  Clock,
} from "lucide-react";

interface UserDetail {
  id: string;
  email: string;
  provider: string;
  profileName: string | null;
  deviceFingerprint: string | null;
  isBanned: boolean;
  banReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  stats: {
    participations: {
      total: number;
      approved: number;
      rejected: number;
      pending: number;
    };
    rewards: {
      totalAmount: number;
      count: number;
    };
  };
  participations: {
    id: string;
    campaignId: string;
    campaignTitle: string;
    rewardAmount: number;
    status: string;
    fraudScore: number | null;
    submittedAt: string;
  }[];
  rewards: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast.error("데이터를 불러오지 못했습니다");
      router.push("/admin/users");
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBan = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
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
      setBanReason("");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">사용자 상세</h1>
          <p className="text-slate-500">{user.email}</p>
        </div>
        {user.isBanned ? (
          <Badge variant="destructive" className="px-3 py-1 text-sm">
            정지됨
          </Badge>
        ) : (
          <Badge className="bg-green-100 px-3 py-1 text-sm text-green-700">활성</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="ID" value={user.id} mono />
              <InfoRow label="이메일" value={user.email} />
              <InfoRow label="로그인 방식" value={<ProviderBadge provider={user.provider} />} />
              <InfoRow label="닉네임" value={user.profileName || "-"} />
              <InfoRow
                label="가입일"
                value={new Date(user.createdAt).toLocaleDateString("ko-KR")}
              />
              <InfoRow
                label="최근 로그인"
                value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("ko-KR") : "-"}
              />
              {user.deviceFingerprint && (
                <InfoRow
                  label="기기 핑거프린트"
                  value={user.deviceFingerprint.slice(0, 16) + "..."}
                  mono
                />
              )}
              {user.banReason && (
                <div className="col-span-2 rounded-lg bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">정지 사유</p>
                  <p className="text-sm text-red-600">{user.banReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                참여 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.participations.length > 0 ? (
                <div className="space-y-3">
                  {user.participations.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{p.campaignTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{new Date(p.submittedAt).toLocaleDateString("ko-KR")}</span>
                          <span>·</span>
                          <span>₩{p.rewardAmount.toLocaleString()}</span>
                          {p.fraudScore !== null && (
                            <>
                              <span>·</span>
                              <FraudBadge score={p.fraudScore} />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        <Link href={`/admin/participations/${p.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">참여 내역이 없습니다</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                리워드 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.rewards.length > 0 ? (
                <div className="space-y-3">
                  {user.rewards.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">
                          {r.type === "PARTICIPATION"
                            ? "참여 리워드"
                            : r.type === "SIGNUP_BONUS"
                              ? "가입 보너스"
                              : r.type === "REFERRAL_BONUS"
                                ? "추천 보너스"
                                : r.type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">
                          {r.amount.toLocaleString()}P
                        </span>
                        <RewardStatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">리워드 내역이 없습니다</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="총 참여" value={user.stats.participations.total} />
                <StatBox
                  label="승인"
                  value={user.stats.participations.approved}
                  color="text-green-600"
                />
                <StatBox
                  label="반려"
                  value={user.stats.participations.rejected}
                  color="text-red-600"
                />
                <StatBox
                  label="대기"
                  value={user.stats.participations.pending}
                  color="text-amber-600"
                />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">총 지급 리워드</span>
                  <span className="text-lg font-bold text-slate-900">
                    {user.stats.rewards.totalAmount.toLocaleString()}P
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                관리
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.isBanned ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleUnban}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  정지 해제
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setBanDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  사용자 정지
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정지</DialogTitle>
            <DialogDescription>정지 사유를 입력해주세요</DialogDescription>
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
            <Button variant="destructive" onClick={handleBan} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              정지하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-sm text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color || "text-slate-900"}`}>{value}</p>
    </div>
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

function RewardStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    REQUESTED: { label: "대기", className: "bg-amber-100 text-amber-700" },
    SENT: { label: "지급완료", className: "bg-green-100 text-green-700" },
    FAILED: { label: "실패", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}

function FraudBadge({ score }: { score: number }) {
  if (score < 40) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        정상
      </Badge>
    );
  }
  if (score < 70) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700">
        주의
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700">
      의심
    </Badge>
  );
}
