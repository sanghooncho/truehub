import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Building2, CreditCard, Megaphone } from "lucide-react";
import Link from "next/link";

export default function AdminAdvertisersPage() {
  // TODO: Fetch real data from API
  const advertisers = [
    {
      id: "a001",
      companyName: "(주)비바리퍼블리카",
      email: "marketing@toss.im",
      campaigns: 5,
      credits: 850000,
      createdAt: "2025-12-01",
    },
    {
      id: "a002",
      companyName: "(주)우아한형제들",
      email: "ux@woowahan.com",
      campaigns: 3,
      credits: 450000,
      createdAt: "2025-12-15",
    },
    {
      id: "a003",
      companyName: "(주)카카오뱅크",
      email: "research@kakaobank.com",
      campaigns: 8,
      credits: 1200000,
      createdAt: "2025-11-20",
    },
  ];

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
            <Input placeholder="회사명 또는 이메일로 검색..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="전체 광고주" value="56" />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="진행중인 캠페인" value="15" />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="총 크레딧 잔액" value="₩12.5M" />
      </div>

      {/* Advertiser List */}
      <Card>
        <CardHeader>
          <CardTitle>광고주 목록</CardTitle>
          <CardDescription>최근 가입순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
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
                  </div>
                  <p className="text-sm text-slate-500">{a.email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">
                      <Megaphone className="mr-1 h-3 w-3" />
                      캠페인 {a.campaigns}
                    </Badge>
                    <Badge variant="outline" className="text-primary">
                      <CreditCard className="mr-1 h-3 w-3" />₩{a.credits.toLocaleString()}
                    </Badge>
                    <span className="text-slate-400">가입: {a.createdAt}</span>
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
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
