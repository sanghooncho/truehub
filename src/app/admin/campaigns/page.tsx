import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Megaphone } from "lucide-react";
import Link from "next/link";

export default function AdminCampaignsPage() {
  // TODO: Fetch real data from API
  const campaigns = [
    {
      id: "c001",
      title: "토스 앱 사용성 테스트",
      advertiser: "(주)비바리퍼블리카",
      status: "RUNNING",
      participations: 45,
      target: 100,
      endDate: "2026-02-15",
    },
    {
      id: "c002",
      title: "배달의민족 신규 기능 피드백",
      advertiser: "(주)우아한형제들",
      status: "RUNNING",
      participations: 78,
      target: 100,
      endDate: "2026-02-10",
    },
    {
      id: "c003",
      title: "카카오뱅크 UX 리서치",
      advertiser: "(주)카카오뱅크",
      status: "COMPLETED",
      participations: 100,
      target: 100,
      endDate: "2026-01-15",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">캠페인 관리</h1>
          <p className="text-slate-500">전체 캠페인 현황을 확인하세요</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="캠페인 또는 광고주 검색..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatBadge label="전체" count={89} variant="default" />
        <StatBadge label="진행중" count={15} variant="success" />
        <StatBadge label="일시중지" count={3} variant="warning" />
        <StatBadge label="완료" count={71} variant="secondary" />
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>캠페인 목록</CardTitle>
          <CardDescription>최신순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="text-primary h-4 w-4" />
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-slate-500">{c.advertiser}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      참여: {c.participations}/{c.target}
                    </span>
                    <span>마감: {c.endDate}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(c.participations / c.target) * 100}%` }}
                    />
                  </div>
                </div>
                <Link href={`/admin/campaigns/${c.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" />
                    상세
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBadge({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "default" | "warning" | "success" | "secondary";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-green-100 text-green-700",
    secondary: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    RUNNING: "default",
    PAUSED: "secondary",
    COMPLETED: "secondary",
    CLOSED: "destructive",
  };
  const labels: Record<string, string> = {
    DRAFT: "초안",
    RUNNING: "진행중",
    PAUSED: "일시중지",
    COMPLETED: "완료",
    CLOSED: "종료",
  };

  return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
}
