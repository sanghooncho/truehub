import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Gift, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            앱을 체험하고
            <br />
            <span className="text-primary">리워드</span>를 받으세요
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            프리뷰에서 다양한 앱을 체험하고 솔직한 피드백을 남기면 리워드를 드립니다. 광고주는
            실제 사용자의 목소리로 서비스를 개선할 수 있습니다.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/tester/login">
                테스터로 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/advertiser/register">광고주로 시작하기</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">어떻게 작동하나요?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              step={1}
              title="캠페인 선택"
              description="관심 있는 앱 캠페인을 찾아 참여하세요."
            />
            <StepCard step={2} title="체험 & 피드백" description="앱을 사용해보고 솔직한 피드백을 남기세요." />
            <StepCard step={3} title="리워드 수령" description="승인되면 리워드가 지급됩니다." />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">테스터라면</h2>
              <ul className="space-y-4">
                <FeatureItem text="다양한 신규 앱을 미리 체험" />
                <FeatureItem text="참여할 때마다 리워드 지급" />
                <FeatureItem text="간편한 소셜 로그인" />
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">광고주라면</h2>
              <ul className="space-y-4">
                <FeatureItem text="실제 사용자의 솔직한 피드백" />
                <FeatureItem text="AI 기반 인사이트 리포트" />
                <FeatureItem text="사기 탐지 시스템으로 품질 보장" />
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-toss">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle className="h-5 w-5 text-secondary" />
      <span className="text-slate-700">{text}</span>
    </li>
  );
}
