"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Building2, CreditCard, Megaphone, Loader2 } from "lucide-react";

interface Advertiser {
  id: string;
  companyName: string;
  email: string;
  contactName: string | null;
  contactPhone: string | null;
  isActive: boolean;
  campaigns: number;
  credits: number;
  createdAt: string;
}

interface Stats {
  totalAdvertisers: number;
  runningCampaigns: number;
  totalCredits: number;
}

export default function AdminAdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAdvertisers: 0,
    runningCampaigns: 0,
    totalCredits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/advertisers?${params}`);
      const data = await res.json();

      if (data.success) {
        setAdvertisers(data.data.items);
        setStats(data.data.stats);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
      }
    } catch (error) {
      console.error("Failed to fetch advertisers:", error);
      toast.error("데이터를 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCredits = (amount: number) => {
    if (amount >= 1000000) {
      return `₩${(amount / 1000000).toFixed(1)}M`;
    }
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">광고주 관리</h1>
          <p className="text-slate-500">광고주 현황을 확인하세요</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="회사명 또는 이메일로 검색..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <Filter className="mr-2 h-4 w-4" />
            검색
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="전체 광고주"
          value={stats.totalAdvertisers.toString()}
        />
        <StatCard
          icon={<Megaphone className="h-5 w-5" />}
          label="진행중인 캠페인"
          value={stats.runningCampaigns.toString()}
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5" />}
          label="총 크레딧 잔액"
          value={formatCredits(stats.totalCredits)}
        />
      </div>

      {/* Advertiser List */}
      <Card>
        <CardHeader>
          <CardTitle>광고주 목록</CardTitle>
          <CardDescription>최근 가입순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : advertisers.length > 0 ? (
            <div className="space-y-4">
              {advertisers.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{a.companyName}</p>
                      {!a.isActive && (
                        <Badge variant="destructive" className="text-xs">
                          비활성
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{a.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        <Megaphone className="mr-1 h-3 w-3" />
                        캠페인 {a.campaigns}
                      </Badge>
                      <Badge variant="outline" className="text-primary">
                        <CreditCard className="mr-1 h-3 w-3" />
                        {formatCredits(a.credits)}
                      </Badge>
                      <span className="text-slate-400">
                        가입: {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/advertisers/${a.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      상세
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">등록된 광고주가 없습니다</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
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
  );
}
