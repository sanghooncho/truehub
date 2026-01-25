"use client";

import { PageTransition, FadeInUp } from "@/components/ui/motion";
import {
  Smartphone,
  MessageSquare,
  Users,
  Shield,
  Gift,
  Zap,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  UserCheck,
  Lock,
  BarChart3,
  Send,
  Mail,
  Phone,
  Building2,
  Cpu,
  Database,
  Brain,
  Fingerprint,
  FileCheck,
  ShoppingBag,
} from "lucide-react";

export default function IntroductionPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <PageTransition className="mx-auto max-w-5xl px-5 text-center">
          <div className="text-primary mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold">
            <Zap className="h-4 w-4" />
            <span>서비스 소개서</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            AI 기반 앱 피드백 플랫폼
            <br />
            <span className="text-primary">TrueHub</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600">
            TrueHub는 실사용자의 피드백으로 앱을 성장시키고,
            <br className="hidden md:block" />
            테스터에게는 가치 있는 리워드를 제공합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-secondary h-4 w-4" />
              AI 피드백 분석
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-secondary h-4 w-4" />
              사기 탐지 시스템
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-secondary h-4 w-4" />
              자동 리워드 지급
            </span>
          </div>
        </PageTransition>
      </section>

      {/* 서비스 소개 Section */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">TrueHub란?</h2>
              <p className="text-lg text-slate-600">
                광고주와 테스터 모두에게 가치를 제공하는 선순환 피드백 플랫폼
              </p>
            </div>
          </FadeInUp>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeInUp delay={0.1}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-6">
                <div className="text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">광고주를 위한 가치</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>실제 사용자의 생생한 피드백 수집</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>GPT-4o 기반 AI 인사이트 분석 리포트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>사기 탐지 시스템으로 품질 보장</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">테스터를 위한 가치</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>다양한 신규 앱을 미리 체험</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>간단한 소셜 로그인으로 빠른 시작</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>참여할 때마다 모바일 상품권 리워드</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 작동 방식 Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">작동 방식</h2>
              <p className="text-lg text-slate-600">
                테스터와 광고주 모두 간단한 3단계로 시작할 수 있습니다
              </p>
            </div>
          </FadeInUp>

          <div className="grid gap-8 md:grid-cols-2">
            {/* 테스터 플로우 */}
            <FadeInUp delay={0.1}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">테스터</h3>
                </div>
                <div className="space-y-5">
                  <ProcessStep
                    number={1}
                    title="캠페인 선택"
                    desc="관심 있는 앱 캠페인을 찾아 참여"
                  />
                  <ProcessStep
                    number={2}
                    title="체험 & 피드백"
                    desc="앱 사용 후 스크린샷 + 피드백 제출"
                  />
                  <ProcessStep
                    number={3}
                    title="리워드 수령"
                    desc="승인 시 모바일 상품권 즉시 지급"
                    highlight
                  />
                </div>
              </div>
            </FadeInUp>

            {/* 광고주 플로우 */}
            <FadeInUp delay={0.2}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="text-primary flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">광고주</h3>
                </div>
                <div className="space-y-5">
                  <ProcessStep
                    number={1}
                    title="캠페인 생성"
                    desc="앱 정보, 미션, 리워드 금액 설정"
                  />
                  <ProcessStep number={2} title="피드백 수집" desc="실사용자 피드백 자동 수집" />
                  <ProcessStep number={3} title="AI 인사이트" desc="GPT-4o 기반 분석 리포트 제공" />
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 사용자 역할 Section */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">사용자 역할</h2>
              <p className="text-lg text-slate-600">TrueHub는 3가지 사용자 역할로 운영됩니다</p>
            </div>
          </FadeInUp>

          <div className="grid gap-6 md:grid-cols-3">
            <FadeInUp delay={0.1}>
              <RoleCard
                icon={<Smartphone className="h-6 w-6" />}
                iconBg="bg-emerald-100 text-emerald-600"
                title="테스터"
                auth="소셜 로그인"
                authDetail="카카오, 네이버, 구글"
                features={["캠페인 참여", "피드백 제출", "리워드 수령"]}
              />
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <RoleCard
                icon={<Users className="h-6 w-6" />}
                iconBg="bg-blue-100 text-primary"
                title="광고주"
                auth="이메일/비밀번호"
                authDetail="기업 계정"
                features={["캠페인 생성", "크레딧 충전", "인사이트 확인"]}
              />
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <RoleCard
                icon={<Shield className="h-6 w-6" />}
                iconBg="bg-slate-100 text-slate-600"
                title="운영자"
                auth="이메일 + TOTP 2FA"
                authDetail="보안 강화 인증"
                features={["참여 심사", "리워드 지급", "사기 탐지"]}
              />
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 리워드 시스템 Section - 핵심 */}
      <section className="from-secondary/5 to-secondary/10 bg-gradient-to-b py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="mb-12 text-center">
              <div className="bg-secondary/20 text-secondary mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
                <Gift className="h-4 w-4" />
                <span>핵심 기능</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold text-slate-900">리워드 시스템</h2>
              <p className="text-lg text-slate-600">
                기프티쇼 비즈 API 연동을 통한 모바일 상품권 자동 발송 예정
              </p>
            </div>
          </FadeInUp>

          {/* 리워드 종류 */}
          <FadeInUp delay={0.1}>
            <div className="shadow-toss mb-8 rounded-2xl border border-slate-100 bg-white p-8">
              <h3 className="mb-6 text-xl font-bold text-slate-900">리워드 종류</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Gift className="text-secondary h-5 w-5" />
                    <span className="font-semibold text-slate-900">참여 리워드</span>
                  </div>
                  <p className="text-sm text-slate-600">캠페인 완료 시 지급 (메인)</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck className="text-secondary h-5 w-5" />
                    <span className="font-semibold text-slate-900">프로모 보너스</span>
                  </div>
                  <p className="text-sm text-slate-600">프로모 코드 입력 시</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Users className="text-secondary h-5 w-5" />
                    <span className="font-semibold text-slate-900">추천 보너스</span>
                  </div>
                  <p className="text-sm text-slate-600">친구 추천 시 지급</p>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* 리워드 프로세스 */}
          <FadeInUp delay={0.2}>
            <div className="shadow-toss mb-8 rounded-2xl border border-slate-100 bg-white p-8">
              <h3 className="mb-6 text-xl font-bold text-slate-900">리워드 발송 프로세스</h3>
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <FlowStep icon={<FileCheck className="h-5 w-5" />} label="참여 승인" />
                <FlowArrow />
                <FlowStep icon={<CreditCard className="h-5 w-5" />} label="리워드 생성" />
                <FlowArrow />
                <FlowStep
                  icon={<ShoppingBag className="h-5 w-5" />}
                  label="기프티쇼 비즈 API"
                  highlight
                />
                <FlowArrow />
                <FlowStep icon={<Send className="h-5 w-5" />} label="상품권 발송" />
              </div>
            </div>
          </FadeInUp>

          {/* 기프티쇼 비즈 연동 */}
          <FadeInUp delay={0.3}>
            <div className="shadow-toss border-secondary/30 rounded-2xl border-2 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-secondary/20 text-secondary flex h-12 w-12 items-center justify-center rounded-xl">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">기프티쇼 비즈 연동 계획</h3>
                  <p className="text-sm text-slate-600">KT 알파 B2B 모바일 쿠폰 서비스</p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="mb-2 font-semibold text-slate-900">연동 방식</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• MMS 위탁 발송 또는 PIN 번호 발급</li>
                    <li>• REST API 기반 실시간 발송</li>
                    <li>• 발송 상태 자동 추적</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="mb-2 font-semibold text-slate-900">예상 발송량</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>
                      • 월간 <span className="text-secondary font-semibold">500건 이상</span>
                    </li>
                    <li>• 참여 리워드 중심 발송</li>
                    <li>• 서비스 확장에 따라 증가 예상</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/10 rounded-xl p-4">
                <h4 className="mb-3 font-semibold text-slate-900">연동 이점</h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="text-secondary h-4 w-4" />
                    <span>즉시 사용 가능한 리워드</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="text-secondary h-4 w-4" />
                    <span>운영 자동화</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="text-secondary h-4 w-4" />
                    <span>220+ 브랜드 상품</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 기술 & 보안 Section */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">기술 & 보안</h2>
              <p className="text-lg text-slate-600">검증된 기술 스택과 강력한 보안 시스템</p>
            </div>
          </FadeInUp>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeInUp delay={0.1}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="text-primary flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">기술 스택</h3>
                </div>
                <div className="space-y-4">
                  <TechItem
                    icon={<Database className="h-4 w-4" />}
                    name="Next.js 15"
                    desc="App Router"
                  />
                  <TechItem
                    icon={<Database className="h-4 w-4" />}
                    name="PostgreSQL"
                    desc="Prisma ORM"
                  />
                  <TechItem
                    icon={<Brain className="h-4 w-4" />}
                    name="OpenAI GPT-4o"
                    desc="AI 분석"
                  />
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">보안 시스템</h3>
                </div>
                <div className="space-y-4">
                  <TechItem
                    icon={<Fingerprint className="h-4 w-4" />}
                    name="pHash 이미지 검증"
                    desc="중복 탐지"
                  />
                  <TechItem
                    icon={<BarChart3 className="h-4 w-4" />}
                    name="행동 분석"
                    desc="사기 탐지 시스템"
                  />
                  <TechItem
                    icon={<Lock className="h-4 w-4" />}
                    name="TOTP 2FA"
                    desc="관리자 보안"
                  />
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 연락처 Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <FadeInUp>
            <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-8 md:p-12">
              <div className="text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Building2 className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-900">프리뷰앱</h2>
                <p className="mb-8 text-slate-600">TrueHub 서비스 운영사</p>

                <div className="mx-auto max-w-md space-y-4">
                  <a
                    href="mailto:previewapp@naver.com"
                    className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 px-6 py-4 text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <Mail className="text-primary h-5 w-5" />
                    <span className="font-medium">previewapp@naver.com</span>
                  </a>
                  <a
                    href="tel:010-2645-5698"
                    className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 px-6 py-4 text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <Phone className="text-primary h-5 w-5" />
                    <span className="font-medium">010-2645-5698</span>
                  </a>
                </div>

                <p className="mt-8 text-sm text-slate-500">
                  API 연동 및 파트너십 문의를 환영합니다
                </p>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}

// Local Components

function ProcessStep({
  number,
  title,
  desc,
  highlight = false,
}: {
  number: number;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          highlight ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {number}
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="mt-0.5 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  iconBg,
  title,
  auth,
  authDetail,
  features,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  auth: string;
  authDetail: string;
  features: string[];
}) {
  return (
    <div className="shadow-toss rounded-2xl border border-slate-100 bg-white p-6">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
      <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-sm font-medium text-slate-900">{auth}</p>
        <p className="text-xs text-slate-500">{authDetail}</p>
      </div>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="text-secondary h-4 w-4" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowStep({
  icon,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          highlight ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>
      <span className={`text-sm font-medium ${highlight ? "text-secondary" : "text-slate-600"}`}>
        {label}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden text-slate-300 md:block">
      <ArrowRight className="h-6 w-6" />
    </div>
  );
}

function TechItem({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
