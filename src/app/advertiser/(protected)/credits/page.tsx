"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";

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

interface Transaction {
  id: string;
  type: "TOPUP" | "CONSUME" | "REFUND" | "ADJUST" | "BONUS";
  amount: number;
  balanceAfter: number;
  description: string | null;
  refType: string | null;
  createdAt: string;
  campaign: { id: string; title: string } | null;
  tester: { id: string; name: string } | null;
}

interface CampaignStat {
  id: string;
  title: string;
  count: number;
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TransactionsData {
  items: Transaction[];
  pagination: Pagination;
  summary: {
    totalConsumed: number;
    byCampaign: CampaignStat[];
  };
}

export default function AdvertiserCreditsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [transactions, setTransactions] = useState<TransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  const fetchTransactions = useCallback(async (page: number) => {
    setTxLoading(true);
    try {
      const res = await fetch(`/api/v1/advertiser/transactions?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, topupsRes, txRes] = await Promise.all([
          fetch("/api/v1/advertiser/dashboard"),
          fetch("/api/v1/advertiser/topups"),
          fetch("/api/v1/advertiser/transactions?page=1&limit=20"),
        ]);

        const [dashData, topupsData, txData] = await Promise.all([
          dashRes.json(),
          topupsRes.json(),
          txRes.json(),
        ]);

        if (dashData.success) {
          setDashboard({ creditBalance: dashData.data.creditBalance });
        }
        if (topupsData.success) {
          setTopups(topupsData.data.items);
        }
        if (txData.success) {
          setTransactions(txData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (newPage: number) => {
    setTxPage(newPage);
    fetchTransactions(newPage);
  };

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

      {transactions && transactions.summary.byCampaign.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-500" />
              캠페인별 사용 현황
            </CardTitle>
            <CardDescription>
              총 사용: {transactions.summary.totalConsumed.toLocaleString()}원
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.summary.byCampaign.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{campaign.title}</p>
                    <p className="text-sm text-slate-500">{campaign.count}건 승인</p>
                  </div>
                  <span className="font-semibold text-rose-600">
                    -{campaign.total.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {transactions && transactions.pagination.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>크레딧 내역</CardTitle>
            <CardDescription>총 {transactions.pagination.total}건의 크레딧 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.items.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            )}

            {transactions.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(txPage - 1)}
                  disabled={txPage <= 1 || txLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-slate-600">
                  {txPage} / {transactions.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(txPage + 1)}
                  disabled={txPage >= transactions.pagination.totalPages || txLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

function TransactionItem({ tx }: { tx: Transaction }) {
  const isPositive = tx.type === "TOPUP" || tx.type === "BONUS" || tx.type === "REFUND";

  const getTitle = () => {
    switch (tx.type) {
      case "BONUS":
        return tx.description || "보너스";
      case "TOPUP":
        return tx.description || "크레딧 충전";
      case "CONSUME":
        return tx.campaign?.title || "캠페인 사용";
      case "REFUND":
        return tx.description || "환불";
      case "ADJUST":
        return tx.description || "조정";
      default:
        return "크레딧 변동";
    }
  };

  const getSubtitle = () => {
    switch (tx.type) {
      case "CONSUME":
        return tx.tester ? `테스터: ${tx.tester.name}` : null;
      case "BONUS":
      case "TOPUP":
      case "REFUND":
      case "ADJUST":
        return null;
      default:
        return null;
    }
  };

  const getBadge = () => {
    const config: Record<string, { label: string; className: string }> = {
      BONUS: { label: "보너스", className: "bg-emerald-100 text-emerald-700" },
      TOPUP: { label: "충전", className: "bg-blue-100 text-blue-700" },
      CONSUME: { label: "사용", className: "bg-rose-100 text-rose-700" },
      REFUND: { label: "환불", className: "bg-amber-100 text-amber-700" },
      ADJUST: { label: "조정", className: "bg-slate-100 text-slate-600" },
    };
    return config[tx.type] || { label: tx.type, className: "bg-slate-100" };
  };

  const subtitle = getSubtitle();
  const badge = getBadge();

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{getTitle()}</p>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
          {isPositive ? "+" : "-"}
          {tx.amount.toLocaleString()}원
        </p>
        <p className="text-xs text-slate-400">
          {new Date(tx.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
