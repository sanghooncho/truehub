"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  status: string;
  targetCount: number;
  currentCount: number;
  approvedCount: number;
  pendingCount: number;
  rewardAmount: number;
  creditCostPerValid: number;
  totalCost: number;
  endAt: string;
  createdAt: string;
}

type StatusFilter = "all" | "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";

export default function AdvertiserCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        const res = await fetch(`/api/v1/advertiser/campaigns?${params}`);
        const json = await res.json();
        if (json.success) {
          setCampaigns(json.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, [statusFilter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">캠페인</h1>
        <Button asChild>
          <Link href="/advertiser/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />새 캠페인
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
          전체
        </FilterButton>
        <FilterButton active={statusFilter === "DRAFT"} onClick={() => setStatusFilter("DRAFT")}>
          작성중
        </FilterButton>
        <FilterButton
          active={statusFilter === "RUNNING"}
          onClick={() => setStatusFilter("RUNNING")}
        >
          진행중
        </FilterButton>
        <FilterButton active={statusFilter === "PAUSED"} onClick={() => setStatusFilter("PAUSED")}>
          일시정지
        </FilterButton>
        <FilterButton
          active={statusFilter === "COMPLETED"}
          onClick={() => setStatusFilter("COMPLETED")}
        >
          완료
        </FilterButton>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-slate-500">
            {statusFilter === "all"
              ? "아직 생성된 캠페인이 없습니다"
              : "해당하는 캠페인이 없습니다"}
          </p>
          {statusFilter === "all" && (
            <Button asChild>
              <Link href="/advertiser/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />첫 캠페인 만들기
              </Link>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "작성중", className: "bg-slate-100 text-slate-700" },
    RUNNING: { label: "진행중", className: "bg-emerald-100 text-emerald-700" },
    PAUSED: { label: "일시정지", className: "bg-amber-100 text-amber-700" },
    CLOSED: { label: "마감", className: "bg-slate-100 text-slate-600" },
    SETTLING: { label: "정산중", className: "bg-blue-100 text-blue-700" },
    COMPLETED: { label: "완료", className: "bg-blue-100 text-blue-700" },
  };

  const config = statusConfig[campaign.status] || statusConfig.DRAFT;
  const endDate = new Date(campaign.endAt).toLocaleDateString("ko-KR");

  return (
    <Link href={`/advertiser/campaigns/${campaign.id}`}>
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <Badge className={config.className}>{config.label}</Badge>
            <h3 className="mt-2 font-semibold text-slate-900">{campaign.title}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4 text-slate-500">
            <span>
              참여 {campaign.currentCount}/{campaign.targetCount}
            </span>
            <span>검토중 {campaign.pendingCount}</span>
          </div>
          <span className="text-slate-400">~{endDate}</span>
        </div>
      </Card>
    </Link>
  );
}
