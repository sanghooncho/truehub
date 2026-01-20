import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  MessageSquare,
  Sparkles,
  Shield,
  Gift,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-primary text-xl font-bold">
            TrueHub
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/tester/campaigns"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              캠페인 참여
            </Link>
            <Link
              href="/advertiser/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              광고주 로그인
            </Link>
            <Button asChild size="sm">
              <Link href="/advertiser/register">광고주 가입</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI 기반 피드백 분석 플랫폼
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            실사용자 피드백으로
            <br />
            <span className="text-primary">앱을 성장</span>시키세요
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            TrueHub는 실제 사용자의 앱 체험과 피드백을 연결합니다. AI가 분석한 인사이트로 더 나은
            사용자 경험을 만들어보세요.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/advertiser/register">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tester/campaigns">캠페인 둘러보기</Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">왜 TrueHub인가요?</h2>
              <p className="text-slate-600">광고주와 테스터 모두를 위한 윈-윈 플랫폼</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="진정성 있는 피드백"
                description="실제 사용자가 앱을 체험하고 솔직한 의견을 남깁니다."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="AI 인사이트 분석"
                description="GPT-4o가 수백 개의 피드백을 분석해 핵심 인사이트를 도출합니다."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="사기 방지 시스템"
                description="이미지 해싱, 행동 분석 등 다층 검증으로 품질을 보장합니다."
              />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">이렇게 진행됩니다</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <Users className="text-primary h-5 w-5" />
                  광고주
                </h3>
                <div className="space-y-4">
                  <StepItem number={1} text="캠페인 생성 및 질문 설정" />
                  <StepItem number={2} text="크레딧 충전 후 캠페인 게시" />
                  <StepItem number={3} text="참여자 피드백 검토 및 승인" />
                  <StepItem number={4} text="AI 분석 인사이트 확인" />
                </div>
              </div>
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <Smartphone className="text-secondary h-5 w-5" />
                  테스터
                </h3>
                <div className="space-y-4">
                  <StepItem number={1} text="관심 있는 캠페인 선택" />
                  <StepItem number={2} text="앱 설치 및 체험" />
                  <StepItem number={3} text="스크린샷과 피드백 제출" />
                  <StepItem number={4} text="승인 후 리워드 수령" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary border-t border-slate-100 py-16 text-white">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <Gift className="mx-auto mb-4 h-12 w-12 opacity-80" />
            <h2 className="mb-4 text-3xl font-bold">지금 시작하고 첫 캠페인 무료 체험</h2>
            <p className="text-primary-foreground/80 mb-8">
              회원가입 즉시 10,000 크레딧을 드립니다
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/advertiser/register">
                무료 가입하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-slate-500">&copy; 2026 TrueHub. All rights reserved.</div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-900">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-slate-900">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-slate-900">
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </footer>
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
    <Card className="border-slate-200">
      <CardContent className="pt-6">
        <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-lg p-3">{icon}</div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {number}
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="text-slate-700">{text}</span>
      </div>
    </div>
  );
}
