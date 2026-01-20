import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Ban, CheckCircle, Users } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  // TODO: Fetch real data from API
  const users = [
    {
      id: "u001",
      email: "user@gmail.com",
      provider: "GOOGLE",
      participations: 12,
      rewards: 48000,
      isBanned: false,
      createdAt: "2026-01-15",
    },
    {
      id: "u002",
      email: "test@naver.com",
      provider: "NAVER",
      participations: 8,
      rewards: 32000,
      isBanned: false,
      createdAt: "2026-01-10",
    },
    {
      id: "u003",
      email: "fraud@kakao.com",
      provider: "KAKAO",
      participations: 45,
      rewards: 0,
      isBanned: true,
      createdAt: "2026-01-05",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">사용자 관리</h1>
          <p className="text-slate-500">테스터 사용자를 관리하세요</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="이메일로 검색..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="전체 사용자" count={1234} />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          label="활성 사용자"
          count={1220}
        />
        <StatCard
          icon={<Ban className="h-5 w-5 text-red-500" />}
          label="정지된 사용자"
          count={14}
        />
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>최근 가입순으로 정렬됨</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <span>가입: {u.createdAt}</span>
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
                    <Button variant="outline" size="sm">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      해제
                    </Button>
                  ) : (
                    <Button variant="destructive" size="sm">
                      <Ban className="mr-1 h-4 w-4" />
                      정지
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
          <p className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</p>
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
