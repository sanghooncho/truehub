"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-blue-400/10 blur-3xl" />
      <div
        className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-cyan-400/10 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-64 w-64 animate-pulse rounded-full bg-emerald-400/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20 text-center"
      >
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2 text-sm font-semibold shadow-lg shadow-slate-200/50">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            AI 기반 앱 테스터 모집 플랫폼
          </span>
        </div>

        {/* Main headline - SEO H1 */}
        <h1 className="mb-8 text-5xl leading-[1.15] font-bold tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
          <span className="block">실제 유저 피드백으로</span>
          <span className="mt-2 block bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            앱 성장을 가속화하세요
          </span>
        </h1>

        {/* Subheadline - SEO description */}
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          TrueHub에서 검증된 앱 테스터를 모집하고 진짜 사용자 피드백을 받으세요.
          <br className="hidden md:block" />
          AI가 분석한 인사이트 리포트로 제품 개선점을 즉시 파악할 수 있습니다.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <motion.button
              className="group relative inline-flex h-14 min-w-[240px] items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/40"
              whileTap={{ scale: 0.98 }}
              onClick={() => (window.location.href = "/advertiser/register")}
            >
              <span>무료로 테스터 모집 시작하기</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <span className="text-sm font-medium text-blue-600">
              🎟️ 프로모션 코드 입력 시 10,000원 지급
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <motion.button
              className="group inline-flex h-14 min-w-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 shadow-lg shadow-slate-200/50 transition-all hover:scale-[1.02] hover:border-slate-300 hover:shadow-xl"
              whileTap={{ scale: 0.98 }}
              onClick={() => (window.location.href = "/tester/campaigns")}
            >
              <Gift className="mr-2 h-5 w-5 text-emerald-500" />
              <span>테스터로 참여하기</span>
            </motion.button>
            <span className="text-sm font-medium text-emerald-600">
              🎁 가입만 해도 1,000P 지급!
            </span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>무료 가입</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>신용카드 불필요</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>즉시 시작 가능</span>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-slate-300 p-2">
          <div className="h-3 w-1.5 animate-pulse rounded-full bg-slate-400" />
        </div>
      </div>
    </section>
  );
}
