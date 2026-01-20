"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

interface DashboardData {
  creditBalance: number;
}

interface Topup {
  id: string;
  amount: number;
  method: string;
  depositCode: string;
  status: string;
  expiresAt: string;
  confirmedAt: string | null;
  createdAt: string;
}

export default function AdvertiserCreditsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, topupsRes] = await Promise.all([
          fetch("/api/v1/advertiser/dashboard"),
          fetch("/api/v1/advertiser/topups"),
        ]);

        const [dashData, topupsData] = await Promise.all([dashRes.json(), topupsRes.json()]);

        if (dashData.success) {
          setDashboard({ creditBalance: dashData.data.creditBalance });
        }
        if (topupsData.success) {
          setTopups(topupsData.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">크레딧</h1>
        <Button asChild>
          <Link href="/advertiser/credits/topup">
            <Plus className="mr-2 h-4 w-4" />
            충전하기
          </Link>
        </Button>
      </div>

      <Card className="from-primary to-primary/80 relative overflow-hidden bg-gradient-to-br p-6 text-white">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        <p className="mb-1 text-sm text-white/80">보유 크레딧</p>
        <p className="text-4xl font-bold tabular-nums">
          {(dashboard?.creditBalance ?? 0).toLocaleString()}
          <span className="ml-2 text-xl">원</span>
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>충전 내역</CardTitle>
          <CardDescription>최근 충전 요청 내역입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {topups.length > 0 ? (
            <div className="space-y-4">
              {topups.map((topup) => (
                <div
                  key={topup.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {topup.amount.toLocaleString()}원
                      </span>
                      <TopupStatusBadge status={topup.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {topup.method === "BANK_TRANSFER" ? "무통장 입금" : "카드 결제"} ·{" "}
                      {topup.depositCode}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{new Date(topup.createdAt).toLocaleDateString("ko-KR")}</p>
                    {topup.status === "PENDING" && (
                      <p className="text-amber-600">
                        만료: {new Date(topup.expiresAt).toLocaleString("ko-KR")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">충전 내역이 없습니다</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TopupStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "대기중", className: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "완료", className: "bg-green-100 text-green-700" },
    CANCELLED: { label: "취소", className: "bg-slate-100 text-slate-600" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={className}>{label}</Badge>;
}
