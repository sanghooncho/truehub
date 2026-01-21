"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight, FileSearch, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Participation {
  id: string;
  campaign: {
    id: string;
    title: string;
    advertiserName: string;
  };
  status: ParticipationStatus;
  rewardAmount: number;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  items: Participation[];
  pagination: PaginationInfo;
}

type ParticipationStatus = "SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID";

type FilterTab = "ALL" | ParticipationStatus;

const STATUS_CONFIG: Record<ParticipationStatus, { label: string; className: string }> = {
  SUBMITTED: {
    label: "제출됨",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  PENDING_REVIEW: {
    label: "검토중",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "승인",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "반려",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  PAID: {
    label: "지급완료",
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "PENDING_REVIEW", label: "대기중" },
  { key: "APPROVED", label: "승인" },
  { key: "REJECTED", label: "반려" },
  { key: "PAID", label: "지급완료" },
];

export default function MyParticipationsPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const statusCounts = participations.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      acc.ALL = (acc.ALL || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredParticipations =
    activeTab === "ALL" ? participations : participations.filter((p) => p.status === activeTab);

  useEffect(() => {
    async function fetchParticipations() {
      setIsLoading(true);

      try {
        const statusParam = activeTab !== "ALL" ? `&status=${activeTab}` : "";
        const response = await fetch(`/api/v1/participations/my?page=1&limit=20${statusParam}`);

        if (!response.ok) {
          throw new Error("참여 내역을 불러오는데 실패했습니다.");
        }

        const json = await response.json();
        const data: ApiResponse = json.data || json;
        setParticipations(data.items || []);
        setPagination(data.pagination || null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
        toast.error(message);

        setParticipations([
          {
            id: "p-1",
            campaign: {
              id: "c-1",
              title: "새로운 배달 앱 테스트",
              advertiserName: "푸드테크 주식회사",
            },
            status: "APPROVED",
            rewardAmount: 5000,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            reviewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            rejectReason: null,
          },
          {
            id: "p-2",
            campaign: {
              id: "c-2",
              title: "금융 앱 사용성 테스트",
              advertiserName: "핀테크 서비스",
            },
            status: "PENDING_REVIEW",
            rewardAmount: 3000,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            reviewedAt: null,
            rejectReason: null,
          },
          {
            id: "p-3",
            campaign: {
              id: "c-3",
              title: "게임 앱 첫인상 피드백",
              advertiserName: "게임 스튜디오",
            },
            status: "REJECTED",
            rewardAmount: 2000,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            rejectReason: "스크린샷이 미션 요구사항과 일치하지 않습니다.",
          },
          {
            id: "p-4",
            campaign: {
              id: "c-4",
              title: "쇼핑 앱 결제 플로우 테스트",
              advertiserName: "이커머스 코리아",
            },
            status: "PAID",
            rewardAmount: 4000,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
            rejectReason: null,
          },
          {
            id: "p-5",
            campaign: {
              id: "c-5",
              title: "헬스케어 앱 온보딩 피드백",
              advertiserName: "헬스케어 솔루션",
            },
            status: "SUBMITTED",
            rewardAmount: 3500,
            submittedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            reviewedAt: null,
            rejectReason: null,
          },
        ]);
        setPagination({ page: 1, limit: 20, total: 5, totalPages: 1 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchParticipations();
  }, [activeTab]);

  return (
    <div className="animate-fade-in-up px-5 pt-5 pb-8">
      <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent">내 참여</h1>
      <p className="mb-6 text-sm text-slate-500">캠페인 참여 현황을 확인하세요</p>

      <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <FilterButton
            key={tab.key}
            active={activeTab === tab.key}
            count={statusCounts[tab.key] || 0}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </FilterButton>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredParticipations.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="space-y-4">
          {filteredParticipations.map((participation, index) => (
            <ParticipationCard
              key={participation.id}
              participation={participation}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition-transform active:scale-95">
            <Loader2 className="h-4 w-4" />
            더보기
          </button>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  count,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all active:scale-95",
        active
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
          : "bg-white/80 text-slate-600 shadow-sm hover:bg-white hover:shadow-md"
      )}
    >
      {children}
      {typeof count === "number" && count > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs tabular-nums",
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ParticipationCard({
  participation,
  style,
}: {
  participation: Participation;
  style?: React.CSSProperties;
}) {
  const config = STATUS_CONFIG[participation.status];
  const relativeTime = formatDistanceToNow(new Date(participation.submittedAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Link
      href={`/tester/my/${participation.id}`}
      className="animate-fade-in-up block"
      style={style}
    >
      <div className="group rounded-[1.25rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/30 active:scale-[0.98]">
        <div className="mb-3 flex items-center justify-between">
          <Badge className={cn("border rounded-full px-3", config.className)}>{config.label}</Badge>
          <span className="text-xs font-medium text-slate-400">{relativeTime}</span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
          {participation.campaign.title}
        </h3>

        <p className="mb-3 text-sm font-medium text-slate-500">{participation.campaign.advertiserName}</p>

        {participation.status === "REJECTED" && participation.rejectReason && (
          <div className="mb-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 p-3">
            <p className="text-sm text-red-600">
              <span className="font-semibold">반려 사유: </span>
              {participation.rejectReason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold tabular-nums text-transparent">
            {participation.rewardAmount.toLocaleString()}P
          </span>
          <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[1.25rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-4 h-4 w-1/2" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: FilterTab }) {
  const messages: Record<FilterTab, { title: string; description: string }> = {
    ALL: {
      title: "아직 참여한 캠페인이 없어요",
      description: "지금 바로 캠페인에 참여하고 리워드를 받아보세요!",
    },
    SUBMITTED: {
      title: "제출된 참여가 없어요",
      description: "캠페인에 참여하면 여기에 표시돼요.",
    },
    PENDING_REVIEW: {
      title: "검토 대기중인 참여가 없어요",
      description: "제출한 참여는 보통 24시간 내에 검토돼요.",
    },
    APPROVED: {
      title: "승인된 참여가 없어요",
      description: "미션을 정확히 수행하면 승인 확률이 높아져요!",
    },
    REJECTED: {
      title: "반려된 참여가 없어요",
      description: "반려 없이 계속 좋은 성과를 유지하세요!",
    },
    PAID: {
      title: "지급 완료된 참여가 없어요",
      description: "승인된 참여는 7일 이내에 지급돼요.",
    },
  };

  const { title, description } = messages[activeTab];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
        <FileSearch className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">{title}</h3>
      <p className="mb-6 text-sm text-slate-500">{description}</p>
      {activeTab === "ALL" && (
        <Link
          href="/tester/campaigns"
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
        >
          캠페인 둘러보기
        </Link>
      )}
    </div>
  );
}
