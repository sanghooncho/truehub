"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Mail,
  Phone,
  User,
  CreditCard,
  Megaphone,
  Eye,
  Calendar,
  TrendingUp,
  Ban,
  CheckCircle,
} from "lucide-react";

interface AdvertiserDetail {
  id: string;
  email: string;
  companyName: string;
  businessType: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  stats: {
    campaigns: {
      total: number;
      running: number;
      completed: number;
      draft: number;
    };
    credits: {
      balance: number;
      totalTopup: number;
      totalConsumed: number;
    };
    topups: {
      totalAmount: number;
      count: number;
    };
  };
  campaigns: {
    id: string;
    title: string;
    status: string;
    targetCount: number;
    currentCount: number;
    rewardAmount: number;
    participations: number;
    endAt: string;
    createdAt: string;
  }[];
  topupRequests: {
    id: string;
    amount: number;
    method: string;
    status: string;
    depositCode: string;
    createdAt: string;
  }[];
}

export default function AdminAdvertiserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const advertiserId = params.id as string;

  const [advertiser, setAdvertiser] = useState<AdvertiserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/advertisers/${advertiserId}`);
      const data = await res.json();

      if (data.success) {
        setAdvertiser(data.data);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
        router.push("/admin/advertisers");
      }
    } catch (error) {
      console.error("Failed to fetch advertiser:", error);
      toast.error("데이터를 불러오지 못했습니다");
      router.push("/admin/advertisers");
    } finally {
      setIsLoading(false);
    }
  }, [advertiserId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async () => {
    if (!advertiser) return;

    setActionLoading(true);
    try {
      const action = advertiser.isActive ? "deactivate" : "activate";
      const res = await fetch(`/api/v1/admin/advertisers/${advertiserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "처리에 실패했습니다");
        return;
      }

      toast.success(advertiser.isActive ? "비활성화되었습니다" : "활성화되었습니다");
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

  if (!advertiser) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/advertisers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{advertiser.companyName}</h1>
          <p className="text-slate-500">{advertiser.email}</p>
        </div>
        {advertiser.isActive ? (
          <Badge className="bg-green-100 px-3 py-1 text-sm text-green-700">활성</Badge>
        ) : (
          <Badge variant="destructive" className="px-3 py-1 text-sm">
            비활성
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="회사명"
                value={advertiser.companyName}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="이메일"
                value={advertiser.email}
              />
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="담당자"
                value={advertiser.contactName || "-"}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="연락처"
                value={advertiser.contactPhone || "-"}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="가입일"
                value={new Date(advertiser.createdAt).toLocaleDateString("ko-KR")}
              />
              <InfoRow
                icon={<TrendingUp className="h-4 w-4" />}
                label="업종"
                value={advertiser.businessType || "-"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                캠페인 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {advertiser.campaigns.length > 0 ? (
                <div className="space-y-3">
                  {advertiser.campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{c.title}</p>
                          <CampaignStatusBadge status={c.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            참여: {c.currentCount}/{c.targetCount}
                          </span>
                          <span>리워드: ₩{c.rewardAmount.toLocaleString()}</span>
                          <span>마감: {new Date(c.endAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>
                      <Link href={`/admin/campaigns/${c.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">등록된 캠페인이 없습니다</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                충전 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              {advertiser.topupRequests.length > 0 ? (
                <div className="space-y-3">
                  {advertiser.topupRequests.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">₩{t.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{t.method === "BANK_TRANSFER" ? "계좌이체" : "카드결제"}</span>
                          <span>·</span>
                          <span>입금코드: {t.depositCode}</span>
                          <span>·</span>
                          <span>{new Date(t.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>
                      <TopupStatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">충전 내역이 없습니다</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                크레딧 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">현재 잔액</p>
                <p className="text-3xl font-bold text-slate-900">
                  ₩{advertiser.stats.credits.balance.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="총 충전"
                  value={`₩${(advertiser.stats.credits.totalTopup / 1000).toFixed(0)}K`}
                />
                <StatBox
                  label="총 사용"
                  value={`₩${(advertiser.stats.credits.totalConsumed / 1000).toFixed(0)}K`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                캠페인 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="전체" value={advertiser.stats.campaigns.total} />
                <StatBox
                  label="진행중"
                  value={advertiser.stats.campaigns.running}
                  color="text-green-600"
                />
                <StatBox
                  label="완료"
                  value={advertiser.stats.campaigns.completed}
                  color="text-blue-600"
                />
                <StatBox
                  label="초안"
                  value={advertiser.stats.campaigns.draft}
                  color="text-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>관리</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={advertiser.isActive ? "destructive" : "default"}
                onClick={handleToggleActive}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : advertiser.isActive ? (
                  <Ban className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {advertiser.isActive ? "비활성화" : "활성화"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color || "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function CampaignStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "초안", className: "bg-slate-100 text-slate-700" },
    RUNNING: { label: "진행중", className: "bg-green-100 text-green-700" },
    PAUSED: { label: "일시중지", className: "bg-amber-100 text-amber-700" },
    CLOSED: { label: "종료", className: "bg-red-100 text-red-700" },
    SETTLING: { label: "정산중", className: "bg-blue-100 text-blue-700" },
    COMPLETED: { label: "완료", className: "bg-blue-100 text-blue-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}

function TopupStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "대기", className: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "완료", className: "bg-green-100 text-green-700" },
    CANCELLED: { label: "취소", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}
