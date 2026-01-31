"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Apple, Smartphone, CheckCircle2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  targetCount: number;
  currentCount: number;
  remainingSlots: number;
  endAt: string;
  appLinkIos?: string;
  appLinkAndroid?: string;
  questions: { order: number; text: string }[];
  advertiserName: string;
  isParticipated: boolean;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignId = params.id as string;

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error("캠페인을 불러올 수 없습니다.");
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || "캠페인을 불러올 수 없습니다.");
        }
        setCampaign(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const getDday = (endAt: string) => {
    const days = differenceInDays(new Date(endAt), new Date());
    if (days < 0) return "마감";
    if (days === 0) return "D-Day";
    return `D-${days}`;
  };

  const canParticipate = campaign && !campaign.isParticipated && campaign.remainingSlots > 0;

  if (isLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-5">
        <p className="text-slate-500">{error || "캠페인을 찾을 수 없습니다."}</p>
        <button onClick={() => router.back()} className="text-primary mt-4 font-medium">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      <div className="sticky top-14 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="flex h-12 items-center gap-3 px-5">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm transition-all hover:shadow-md hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <span className="text-base font-bold text-slate-800">캠페인 상세</span>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-8">
        <section className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          {campaign.isParticipated && (
            <Badge className="mb-3 border-transparent bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              이미 참여함
            </Badge>
          )}
          <h1 className="mb-2 text-xl leading-tight font-bold text-slate-800">{campaign.title}</h1>
          <p className="mb-4 text-sm font-medium text-slate-500">{campaign.advertiserName}</p>

          <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-center">
            <p className="mb-1 text-xs font-semibold text-blue-600">참여 리워드</p>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-3xl font-bold tabular-nums text-transparent">
              {campaign.rewardAmount.toLocaleString()}P
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold">남은 기간</span>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">
                {getDday(campaign.endAt)}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-slate-500">
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold">남은 자리</span>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">
                {campaign.remainingSlots}명
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <h2 className="mb-3 text-base font-bold text-slate-800">캠페인 소개</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
            {campaign.description}
          </p>
        </section>

        {(campaign.appLinkIos || campaign.appLinkAndroid) && (
          <section className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
            <h2 className="mb-3 text-base font-bold text-slate-800">앱 다운로드</h2>
            <div className="flex gap-3">
              {campaign.appLinkIos && (
                <motion.a
                  href={campaign.appLinkIos}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Apple className="h-5 w-5" />
                  App Store
                </motion.a>
              )}
              {campaign.appLinkAndroid && (
                <motion.a
                  href={campaign.appLinkAndroid}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Smartphone className="h-5 w-5" />
                  Play Store
                </motion.a>
              )}
            </div>
          </section>
        )}

        <section className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">참여 방법</h2>
          <div className="space-y-3">
            <StepItem
              number={1}
              title="앱 설치하기"
              description="위 다운로드 버튼을 눌러 앱을 설치해주세요."
            />
            <StepItem
              number={2}
              title="미션 수행하기"
              description="앱을 사용하면서 아래 질문에 대한 답변을 준비해주세요."
            />
            <StepItem
              number={3}
              title="스크린샷 & 피드백 제출"
              description="캡처 2장과 질문 답변, 자유 의견을 제출해주세요."
            />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">답변할 질문</h2>
          <div className="space-y-3">
            {campaign.questions.map((q) => (
              <div key={q.order} className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-md shadow-blue-200">
                    {q.order}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">{q.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pb-safe fixed right-0 bottom-16 left-0 border-t border-white/50 bg-white/80 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          {campaign.isParticipated ? (
            <button
              disabled
              className="h-[52px] w-full cursor-not-allowed rounded-2xl bg-slate-100 text-base font-semibold text-slate-400"
            >
              이미 참여한 캠페인이에요
            </button>
          ) : campaign.remainingSlots <= 0 ? (
            <button
              disabled
              className="h-[52px] w-full cursor-not-allowed rounded-2xl bg-slate-100 text-base font-semibold text-slate-400"
            >
              모집이 마감되었어요
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (session?.user) {
                  router.push(`/tester/submit/${campaignId}`);
                } else {
                  router.push(`/tester/login?callbackUrl=${encodeURIComponent(pathname)}`);
                }
              }}
              className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
            >
              참여하고 {campaign.rewardAmount.toLocaleString()}P 받기
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/50 bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 text-sm font-bold text-blue-600">
        {number}
      </span>
      <div>
        <p className="mb-0.5 text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function CampaignDetailSkeleton() {
  return (
    <div className="pb-24">
      <div className="sticky top-14 z-40 border-b border-slate-100 bg-white">
        <div className="flex h-12 items-center gap-3 px-5">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="space-y-4 bg-slate-50 p-4 pb-8">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="mb-4 h-4 w-1/3" />
          <Skeleton className="mb-4 h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="mb-3 h-5 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-16 left-0 border-t border-slate-100 bg-white p-4">
        <div className="mx-auto max-w-md">
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
