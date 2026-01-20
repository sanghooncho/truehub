"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTransition, FadeInUp, MotionButton } from "@/components/ui/motion";
import {
  Smartphone,
  MessageSquare,
  Sparkles,
  Shield,
  Gift,
  Users,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Search,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-primary text-xl font-bold tracking-tight">
            TrueHub
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/tester/campaigns"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              캠페인 참여
            </Link>
            <Link
              href="/advertiser/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              광고주 로그인
            </Link>
            <Button asChild size="sm" className="rounded-full px-5 font-semibold">
              <Link href="/advertiser/register">광고주 시작하기</Link>
            </Button>
          </nav>
          {/* Mobile Menu Placeholder - can be added if needed, for now sticking to core request */}
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32">
          <PageTransition className="mx-auto max-w-6xl px-5 text-center">
            <div className="text-primary mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>AI 기반 피드백 분석 플랫폼</span>
            </div>
            <h1 className="mb-8 text-4xl leading-tight font-bold tracking-tight text-slate-900 md:text-6xl">
              진짜 유저의 목소리로
              <br />
              <span className="text-primary">서비스를 성장</span>시키세요
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-600">
              TrueHub는 실제 사용자의 생생한 경험 데이터를 수집하고
              <br className="hidden md:block" />
              AI가 분석한 핵심 인사이트를 제공합니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MotionButton
                className="bg-primary inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-xl px-8 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
                whileTap={{ scale: 0.96 }}
                onClick={() => (window.location.href = "/advertiser/register")}
              >
                무료로 시작하고 10,000P 받기
              </MotionButton>
              <MotionButton
                className="inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-xl bg-slate-100 px-8 text-base font-bold text-slate-900 transition-colors hover:bg-slate-200"
                whileTap={{ scale: 0.96 }}
                onClick={() => (window.location.href = "/tester/campaigns")}
              >
                <Gift className="text-secondary mr-2 h-5 w-5" />앱 체험하고 리워드 받기
              </MotionButton>
            </div>
          </PageTransition>
        </section>

        {/* Stats Section (Trust) */}
        <section className="border-y border-slate-100 bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <StatItem label="누적 피드백" value="50,000+" />
              <StatItem label="파트너사" value="120+" />
              <StatItem label="평균 응답 시간" value="24시간" />
              <StatItem label="AI 분석 정확도" value="98%" />
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                왜 TrueHub인가요?
              </h2>
              <p className="text-lg text-slate-600">
                단순한 설문조사가 아닌, 성장의 파트너가 되어드립니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FadeInUp delay={0.1}>
                <FeatureCard
                  icon={<MessageSquare className="h-6 w-6" />}
                  title="진정성 있는 피드백"
                  description="어뷰징 방지 시스템으로 검증된 실제 사용자의 솔직한 의견만을 전달합니다."
                />
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <FeatureCard
                  icon={<TrendingUp className="h-6 w-6" />}
                  title="데이터 기반 의사결정"
                  description="GPT-4o가 수집된 피드백을 분석하여 즉시 적용 가능한 개선점을 도출합니다."
                />
              </FadeInUp>
              <FadeInUp delay={0.3}>
                <FeatureCard
                  icon={<Search className="h-6 w-6" />}
                  title="심층 UX 리포트"
                  description="스크린샷과 상세한 답변을 통해 사용자의 행동 패턴을 정밀하게 파악하세요."
                />
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-16 md:grid-cols-2">
              {/* Advertiser Flow */}
              <FadeInUp className="shadow-toss rounded-3xl border border-slate-100 bg-white p-8 md:p-12">
                <div className="mb-8 flex items-center gap-3">
                  <div className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">광고주</h3>
                </div>
                <div className="space-y-6">
                  <ProcessStep
                    number={1}
                    title="캠페인 설계"
                    desc="원하는 타겟과 질문을 설정하세요."
                  />
                  <ProcessStep
                    number={2}
                    title="캠페인 게시"
                    desc="즉시 수천 명의 테스터에게 노출됩니다."
                  />
                  <ProcessStep
                    number={3}
                    title="인사이트 확보"
                    desc="AI 리포트로 핵심 개선점을 확인하세요."
                  />
                </div>
                <div className="mt-8 border-t border-slate-100 pt-8">
                  <Link
                    href="/advertiser/register"
                    className="group text-primary inline-flex items-center font-bold hover:underline"
                  >
                    광고주로 시작하기{" "}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FadeInUp>

              {/* Tester Flow */}
              <FadeInUp
                delay={0.2}
                className="shadow-toss rounded-3xl border border-slate-100 bg-white p-8 md:p-12"
              >
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">테스터</h3>
                </div>
                <div className="space-y-6">
                  <ProcessStep
                    number={1}
                    title="캠페인 선택"
                    desc="관심 있는 신규 앱을 발견하세요."
                  />
                  <ProcessStep
                    number={2}
                    title="체험 및 피드백"
                    desc="앱을 사용해보고 솔직한 의견을 남기세요."
                  />
                  <ProcessStep
                    number={3}
                    title="리워드 획득"
                    desc="참여 즉시 포인트가 적립됩니다."
                  />
                </div>
                <div className="mt-8 border-t border-slate-100 pt-8">
                  <Link
                    href="/tester/campaigns"
                    className="group inline-flex items-center font-bold text-emerald-600 hover:underline"
                  >
                    테스터로 활동하기{" "}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-24 text-white">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              더 나은 서비스를 만드는 여정,
              <br />
              TrueHub와 함께하세요.
            </h2>
            <p className="mb-10 text-lg text-blue-100 md:text-xl">
              지금 가입하면 첫 캠페인을 위한 10,000 크레딧을 드립니다.
            </p>
            <MotionButton
              whileTap={{ scale: 0.96 }}
              className="text-primary h-[60px] rounded-2xl bg-white px-10 text-lg font-bold shadow-2xl transition-transform hover:shadow-white/20"
              onClick={() => (window.location.href = "/advertiser/register")}
            >
              무료로 시작하기
            </MotionButton>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 text-slate-500">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <span className="text-lg font-bold text-slate-900">TrueHub</span>
            <p className="mt-4 max-w-xs text-sm">
              TrueHub는 투명하고 신뢰할 수 있는 모바일 앱 테스팅 플랫폼입니다.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-slate-900">Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tester/campaigns" className="hover:text-slate-900">
                  테스터 참여
                </Link>
              </li>
              <li>
                <Link href="/advertiser/login" className="hover:text-slate-900">
                  광고주 로그인
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-slate-900">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-slate-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-slate-200 px-5 pt-8 text-center text-xs">
          &copy; 2026 TrueHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group shadow-toss rounded-2xl border border-slate-100 bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="text-primary group-hover:bg-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
