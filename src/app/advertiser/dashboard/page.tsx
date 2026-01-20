"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

interface DashboardData {
  creditBalance: number;
  campaigns: {
    total: number;
    draft: number;
    running: number;
    paused: number;
    completed: number;
  };
  participations: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  recentCampaigns: {
    id: string;
    title: string;
    status: string;
    targetCount: number;
    currentCount: number;
    rewardAmount: number;
    endAt: string;
    createdAt: string;
  }[];
}

export default function AdvertiserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/advertiser/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-slate-500">데이터를 불러올 수 없습니다</p>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <Button asChild>
          <Link href="/advertiser/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />새 캠페인
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <Card className="from-primary to-primary/80 relative overflow-hidden bg-gradient-to-br p-5 text-white">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
          <p className="mb-1 text-sm text-white/80">보유 크레딧</p>
          <p className="mb-4 text-3xl font-bold tabular-nums">
            {data.creditBalance.toLocaleString()}
            <span className="ml-1 text-lg">원</span>
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/advertiser/credits/topup">충전하기</Link>
          </Button>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">캠페인 현황</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="진행 중" value={data.campaigns.running} />
        <StatCard label="검토중" value={data.participations.pending} color="amber" />
        <StatCard label="승인" value={data.participations.approved} color="emerald" />
        <StatCard label="반려" value={data.participations.rejected} color="red" />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">최근 캠페인</h2>
      {data.recentCampaigns.length > 0 ? (
        <Card className="divide-y divide-slate-100">
          {data.recentCampaigns.map((campaign) => (
            <CampaignItem key={campaign.id} campaign={campaign} />
          ))}
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-slate-500">아직 생성된 캠페인이 없습니다</p>
          <Button asChild>
            <Link href="/advertiser/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />첫 캠페인 만들기
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "slate",
}: {
  label: string;
  value: number;
  color?: "slate" | "amber" | "emerald" | "red";
}) {
  const colorClass = {
    slate: "text-slate-900",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    red: "text-red-500",
  }[color];

  return (
    <Card className="p-4">
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Card>
  );
}

function CampaignItem({
  campaign,
}: {
  campaign: {
    id: string;
    title: string;
    status: string;
    targetCount: number;
    currentCount: number;
    endAt: string;
  };
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "작성중", className: "bg-slate-100 text-slate-700" },
    RUNNING: { label: "진행중", className: "bg-emerald-100 text-emerald-700" },
    PAUSED: { label: "일시정지", className: "bg-amber-100 text-amber-700" },
    CLOSED: { label: "마감", className: "bg-slate-100 text-slate-600" },
    SETTLING: { label: "정산중", className: "bg-blue-100 text-blue-700" },
    COMPLETED: { label: "완료", className: "bg-blue-100 text-blue-700" },
  };

  const config = statusConfig[campaign.status] || statusConfig.DRAFT;
  const daysLeft = Math.ceil(
    (new Date(campaign.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link
      href={`/advertiser/campaigns/${campaign.id}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <Badge className={config.className}>{config.label}</Badge>
        <span className="text-sm font-medium text-slate-900">{campaign.title}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>
          {campaign.currentCount}/{campaign.targetCount}명
        </span>
        {daysLeft > 0 ? <span>D-{daysLeft}</span> : <span className="text-red-500">마감</span>}
      </div>
    </Link>
  );
}
