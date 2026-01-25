import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  Zap,
} from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { AnimatedCard } from "@/components/landing/animated-card";
import { CTAButton } from "@/components/landing/cta-button";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-100/50 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="TrueHub" width={140} height={40} className="h-8 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
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
            <Button
              asChild
              size="sm"
              className="rounded-full px-6 font-semibold shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
            >
              <Link href="/advertiser/register">광고주 시작하기</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section - SSR with client animations */}
        <HeroSection />

        {/* Features Bar - Static SEO content */}
        <section className="relative z-10 -mt-8">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50 md:p-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <FeatureItem
                  icon={<Sparkles className="h-6 w-6" />}
                  label="AI 기반 분석"
                  description="GPT-4o 분석"
                  color="blue"
                />
                <FeatureItem
                  icon={<Shield className="h-6 w-6" />}
                  label="어뷰징 자동 탐지"
                  description="신뢰성 검증"
                  color="violet"
                />
                <FeatureItem
                  icon={<MessageSquare className="h-6 w-6" />}
                  label="실시간 피드백"
                  description="즉각적 수집"
                  color="cyan"
                />
                <FeatureItem
                  icon={<Gift className="h-6 w-6" />}
                  label="포인트 → 기프티콘"
                  description="스타벅스/편의점"
                  color="emerald"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition - SEO optimized static content */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-20 text-center">
              <span className="mb-4 inline-block text-sm font-bold tracking-widest text-blue-600 uppercase">
                Why TrueHub
              </span>
              <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
                왜 TrueHub인가요?
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-600">
                단순한 설문조사가 아닌, 앱 테스터 모집부터 AI 피드백 분석까지 성장의 파트너가
                되어드립니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <AnimatedCard delay={0.1}>
                <FeatureCard
                  icon={<MessageSquare className="h-7 w-7" />}
                  title="진정성 있는 피드백"
                  description="어뷰징 방지 시스템으로 검증된 실제 사용자의 솔직한 의견만을 전달합니다. 베타 테스터 모집 후 신뢰할 수 있는 리뷰를 받으세요."
                  color="blue"
                  number="01"
                />
              </AnimatedCard>
              <AnimatedCard delay={0.2}>
                <FeatureCard
                  icon={<TrendingUp className="h-7 w-7" />}
                  title="데이터 기반 의사결정"
                  description="GPT-4o가 수집된 사용자 피드백을 분석하여 즉시 적용 가능한 앱 개선점을 도출합니다."
                  color="cyan"
                  number="02"
                />
              </AnimatedCard>
              <AnimatedCard delay={0.3}>
                <FeatureCard
                  icon={<Search className="h-7 w-7" />}
                  title="심층 UX 리포트"
                  description="스크린샷과 상세한 답변을 통해 사용자의 행동 패턴을 정밀하게 파악하세요. UX 리서치 플랫폼으로 활용 가능합니다."
                  color="emerald"
                  number="03"
                />
              </AnimatedCard>
            </div>
          </div>
        </section>

        {/* Process Section - SEO optimized */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-30" />

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-20 text-center">
              <span className="mb-4 inline-block text-sm font-bold tracking-widest text-blue-600 uppercase">
                How It Works
              </span>
              <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
                간단한 3단계로 테스터 모집 시작
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-600">
                앱 테스트 서비스를 통해 실제 사용자 피드백을 빠르게 수집하세요.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Advertiser Flow */}
              <AnimatedCard delay={0.1}>
                <div className="group relative rounded-[2rem] border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 md:p-12">
                  {/* Gradient accent */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500" />

                  <div className="mb-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">테스터</h3>
                      <p className="text-slate-500">
                        가입만 해도 1,000P! 리뷰 하나면 커피 한잔 무료 ☕
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <ProcessStep
                      number={1}
                      title="캠페인 설계"
                      desc="원하는 타겟과 질문을 설정하세요. 베타 테스터 모집 조건을 상세히 지정할 수 있습니다."
                      color="blue"
                    />
                    <ProcessStep
                      number={2}
                      title="테스터 모집 시작"
                      desc="캠페인 게시 즉시 수천 명의 검증된 테스터에게 노출됩니다."
                      color="blue"
                    />
                    <ProcessStep
                      number={3}
                      title="AI 인사이트 확보"
                      desc="AI 피드백 분석 리포트로 핵심 앱 개선점을 확인하세요."
                      color="blue"
                    />
                  </div>

                  <div className="mt-10 border-t border-slate-100 pt-8">
                    <Link
                      href="/advertiser/register"
                      className="group/link inline-flex items-center gap-2 text-lg font-bold text-blue-600 transition-all hover:gap-3"
                    >
                      무료로 테스터 모집 시작하기
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </AnimatedCard>

              {/* Tester Flow */}
              <AnimatedCard delay={0.2}>
                <div className="group relative rounded-[2rem] border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-100/50 md:p-12">
                  {/* Gradient accent */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500" />

                  <div className="mb-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">테스터</h3>
                      <p className="text-slate-500">가입만 해도 1,000P! 리뷰 하나면 커피 ☕</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <ProcessStep
                      number={1}
                      title="캠페인 선택"
                      desc="관심 있는 신규 앱을 발견하세요."
                      color="emerald"
                    />
                    <ProcessStep
                      number={2}
                      title="체험 및 피드백"
                      desc="앱을 사용해보고 솔직한 의견을 남기세요."
                      color="emerald"
                    />
                    <ProcessStep
                      number={3}
                      title="포인트 적립 & 기프티콘 교환"
                      desc="참여 즉시 포인트 적립, 스타벅스/편의점 기프티콘으로 교환!"
                      color="emerald"
                    />
                  </div>

                  <div className="mt-10 border-t border-slate-100 pt-8">
                    <Link
                      href="/tester/campaigns"
                      className="group/link inline-flex items-center gap-2 text-lg font-bold text-emerald-600 transition-all hover:gap-3"
                    >
                      테스터로 활동하기
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-12 md:p-16">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative z-10 grid gap-12 text-center md:grid-cols-3">
                <div>
                  <div className="mb-3 text-5xl font-bold text-white md:text-6xl">98%</div>
                  <div className="text-lg text-slate-400">피드백 신뢰도</div>
                </div>
                <div>
                  <div className="mb-3 text-5xl font-bold text-white md:text-6xl">24h</div>
                  <div className="text-lg text-slate-400">평균 피드백 수집 시간</div>
                </div>
                <div>
                  <div className="mb-3 text-5xl font-bold text-white md:text-6xl">3x</div>
                  <div className="text-lg text-slate-400">인사이트 도출 효율</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - SEO optimized */}
        <section className="relative overflow-hidden py-32">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600" />

          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              <span>프로모션 코드 입력 시 10,000원 지급</span>
            </div>

            <h2 className="mb-8 text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
              앱 테스터 모집,
              <br />
              <span className="text-cyan-300">TrueHub와 함께하세요.</span>
            </h2>

            <p className="mx-auto mb-12 max-w-2xl text-xl text-blue-100">
              실제 유저의 목소리로 제품을 성장시키세요.
              <br />
              AI가 분석한 사용자 피드백으로 더 빠르게 앱을 개선할 수 있습니다.
            </p>

            <CTAButton href="/advertiser/register">무료로 테스터 모집 시작하기</CTAButton>
          </div>
        </section>
      </main>

      {/* Footer - SEO optimized */}
      <footer className="bg-slate-900 pt-20 pb-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 grid gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <Image
                src="/logo.png"
                alt="TrueHub - 앱 테스터 모집 플랫폼"
                width={140}
                height={40}
                className="mb-6 h-8 w-auto brightness-0 invert"
              />
              <p className="max-w-sm leading-relaxed text-slate-500">
                TrueHub는 앱 테스터 모집부터 AI 기반 사용자 피드백 분석까지, 제품 성장에 필요한 모든
                것을 제공하는 테스터 모집 플랫폼입니다. 베타 테스터 모집, UX 리서치, 앱 사용성
                테스트를 한 곳에서 진행하세요.
              </p>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold tracking-wider text-slate-300 uppercase">
                서비스
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/tester/campaigns" className="transition-colors hover:text-white">
                    테스터 참여
                  </Link>
                </li>
                <li>
                  <Link href="/advertiser/login" className="transition-colors hover:text-white">
                    광고주 로그인
                  </Link>
                </li>
                <li>
                  <Link href="/advertiser/register" className="transition-colors hover:text-white">
                    광고주 가입
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold tracking-wider text-slate-300 uppercase">
                고객지원
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/policy/terms" className="transition-colors hover:text-white">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/policy/privacy" className="transition-colors hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="/policy/refund" className="transition-colors hover:text-white">
                    환불정책
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-12">
            <div className="space-y-2 text-center text-sm text-slate-500">
              <p>
                <span className="font-semibold text-slate-400">프리뷰</span> | 대표: 조상훈 |
                사업자등록번호: 659-44-01557
              </p>
              <p>통신판매업 신고번호: 제2025-서울광진-1698호</p>
              <p>주소: 서울특별시 광진구 군자로12길 46, 102동 501호(군자동, 일성파크아파트)</p>
              <p>전화: 0502-1925-0051 | 이메일: previewapp@naver.com</p>
              <p className="pt-4 text-slate-600">
                &copy; {new Date().getFullYear()} 프리뷰. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  label,
  description,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: "blue" | "violet" | "cyan" | "emerald";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/30",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/30",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-bold text-slate-900">{label}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  number,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "cyan" | "emerald";
  number: string;
}) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      shadowHover: "group-hover:shadow-blue-500/30",
    },
    cyan: {
      gradient: "from-cyan-500 to-cyan-600",
      shadow: "shadow-cyan-500/20",
      shadowHover: "group-hover:shadow-cyan-500/30",
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      shadowHover: "group-hover:shadow-emerald-500/30",
    },
  };

  return (
    <div
      className={`group relative rounded-[2rem] bg-white p-8 shadow-xl md:p-10 ${colorClasses[color].shadow} border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${colorClasses[color].shadowHover}`}
    >
      {/* Number badge */}
      <div className="absolute top-6 right-6 text-6xl font-bold text-slate-100">{number}</div>

      <div
        className={`relative z-10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClasses[color].gradient} text-white shadow-lg ${colorClasses[color].shadow}`}
      >
        {icon}
      </div>
      <h3 className="relative z-10 mb-4 text-2xl font-bold text-slate-900">{title}</h3>
      <p className="relative z-10 text-lg leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  desc,
  color,
}: {
  number: number;
  title: string;
  desc: string;
  color: "blue" | "emerald";
}) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
    emerald:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30",
  };

  return (
    <div className="flex items-start gap-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]} text-sm font-bold`}
      >
        {number}
      </div>
      <div>
        <h4 className="text-xl font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
