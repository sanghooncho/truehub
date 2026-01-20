"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Megaphone,
  ClipboardCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalAdvertisers: number;
  totalCampaigns: number;
  pendingParticipations: number;
  pendingTopups: number;
  approvedToday: number;
}

interface ActivityLog {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  operator: { name: string; email: string } | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        const data = await res.json();

        if (data.success) {
          setStats(data.data.stats);
          setActivity(data.data.recentActivity);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error("데이터를 불러오지 못했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500">TrueHub 관리 현황을 확인하세요</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="전체 사용자"
          value={stats?.totalUsers.toLocaleString() || "0"}
          href="/admin/users"
        />
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="광고주"
          value={stats?.totalAdvertisers.toLocaleString() || "0"}
          href="/admin/advertisers"
        />
        <StatCard
          icon={<Megaphone className="h-5 w-5" />}
          label="캠페인"
          value={stats?.totalCampaigns.toLocaleString() || "0"}
          href="/admin/campaigns"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            대기 중인 작업
          </CardTitle>
          <CardDescription>빠른 처리가 필요한 항목들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <PendingItem
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="참여 심사 대기"
              count={stats?.pendingParticipations || 0}
              href="/admin/participations"
            />
            <PendingItem
              icon={<CreditCard className="h-5 w-5" />}
              label="충전 승인 대기"
              count={stats?.pendingTopups || 0}
              href="/admin/topups"
            />
            <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="font-medium text-green-700">오늘 승인 완료</span>
              </div>
              <Badge className="bg-green-100 text-green-700">{stats?.approvedToday || 0}건</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>시스템 최근 활동 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map((log) => (
                <ActivityItem
                  key={log.id}
                  action={formatAction(log.action)}
                  target={formatTarget(log)}
                  time={formatRelativeTime(log.createdAt)}
                  operator={log.operator?.email || "시스템"}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">최근 활동이 없습니다</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PendingItem({
  icon,
  label,
  count,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-500">{icon}</div>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <Badge variant={count > 0 ? "destructive" : "secondary"} className="tabular-nums">
        {count}건
      </Badge>
    </Link>
  );
}

function ActivityItem({
  action,
  target,
  time,
  operator,
}: {
  action: string;
  target: string;
  time: string;
  operator: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-slate-700">
          <span className="text-primary">{action}</span>
          {target && <span> — {target}</span>}
        </p>
        <p className="text-sm text-slate-500">{operator}</p>
      </div>
      <span className="text-sm whitespace-nowrap text-slate-400">{time}</span>
    </div>
  );
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    APPROVE_PARTICIPATION: "참여 승인",
    REJECT_PARTICIPATION: "참여 반려",
    CONFIRM_TOPUP: "충전 승인",
    CREATE_CAMPAIGN: "캠페인 생성",
    UPDATE_CAMPAIGN: "캠페인 수정",
    BAN_USER: "사용자 차단",
    UNBAN_USER: "사용자 차단 해제",
  };
  return actionMap[action] || action;
}

function formatTarget(log: ActivityLog): string {
  if (!log.targetType || !log.targetId) return "";

  const details = log.details as Record<string, unknown> | null;

  switch (log.targetType) {
    case "participation":
      return `참여 #${log.targetId.slice(0, 8)}`;
    case "topup":
      if (details?.amount) {
        return `₩${(details.amount as number).toLocaleString()}`;
      }
      return `충전 #${log.targetId.slice(0, 8)}`;
    case "campaign":
      return `캠페인 #${log.targetId.slice(0, 8)}`;
    case "user":
      return `사용자 #${log.targetId.slice(0, 8)}`;
    default:
      return `#${log.targetId.slice(0, 8)}`;
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR");
}
