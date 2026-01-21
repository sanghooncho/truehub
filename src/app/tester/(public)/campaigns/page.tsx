import { Suspense } from "react";
import { prisma } from "@/infra/db/prisma";
import { CampaignList } from "./campaign-list";
import { CampaignListSkeleton } from "./campaign-skeleton";

export const revalidate = 60; // ISR: 60초마다 재생성

interface Campaign {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  targetCount: number;
  currentCount: number;
  remainingSlots: number;
  endAt: string;
  appLinkIos: string | null;
  appLinkAndroid: string | null;
  advertiserName: string;
}

async function getCampaigns(): Promise<Campaign[]> {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "RUNNING",
      endAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      description: true,
      rewardAmount: true,
      targetCount: true,
      currentCount: true,
      endAt: true,
      appLinkIos: true,
      appLinkAndroid: true,
      advertiser: {
        select: {
          companyName: true,
        },
      },
    },
  });

  return campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    rewardAmount: c.rewardAmount,
    targetCount: c.targetCount,
    currentCount: c.currentCount,
    remainingSlots: Math.max(0, c.targetCount - c.currentCount),
    endAt: c.endAt.toISOString(),
    appLinkIos: c.appLinkIos,
    appLinkAndroid: c.appLinkAndroid,
    advertiserName: c.advertiser.companyName,
  }));
}

export default async function CampaignsPage() {
  const initialCampaigns = await getCampaigns();

  return (
    <div className="animate-fade-in-up min-h-screen">
      {/* SEO Hero 섹션 - 검색엔진이 바로 인식 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 px-5 pt-6 pb-8 text-white">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
          실시간 미션 업데이트
        </div>
        <h1 className="relative mb-3 text-2xl font-bold leading-tight">
          리뷰 미션 참여하고
          <br />
          포인트로 기프티콘 교환
        </h1>
        <p className="relative text-sm leading-relaxed text-blue-100">
          앱 리뷰 미션에 참여하고 포인트를 적립하세요.
          <br />
          스타벅스, 편의점 기프티콘으로 <strong className="text-white">즉시 교환</strong> 가능!
        </p>

        {/* 키워드 태그 */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-sm transition-all hover:bg-white/20">
            #참여형미션
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-sm transition-all hover:bg-white/20">
            #포인트적립
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-sm transition-all hover:bg-white/20">
            #리워드플랫폼
          </span>
        </div>
      </section>

      {/* 캠페인 목록 - 클라이언트 컴포넌트 */}
      <Suspense fallback={<CampaignListSkeleton />}>
        <CampaignList initialCampaigns={initialCampaigns} />
      </Suspense>

      {/* SEO 푸터 컨텐츠 */}
      <section className="mt-8 border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              TrueHub 참여형 미션 리워드 플랫폼
            </h2>
            <p className="text-xs text-slate-500">국내 No.1 리뷰 미션 플랫폼</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            TrueHub는 앱 리뷰 미션에 참여하고 포인트를 적립할 수 있는 참여형 미션 사이트입니다.
            적립한 포인트는 스타벅스 아메리카노, 편의점 상품권 등 다양한 기프티콘으로 교환할 수 있습니다.
            매일 새로운 리뷰 미션이 업데이트되니 자주 방문해 주세요!
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">리워드 플랫폼</span>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-600">참여형 미션 사이트</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">포인트 적립 사이트</span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">리뷰 미션</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">포인트 기프티콘 교환</span>
          </div>
        </div>
      </section>
    </div>
  );
}
