import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/tester/bottom-nav";

export const metadata: Metadata = {
  title: "리뷰 미션 참여하고 포인트 받기 | 참여형 미션 리워드 플랫폼",
  description:
    "앱 리뷰 미션에 참여하고 포인트를 적립하세요. 적립한 포인트는 스타벅스, 편의점 기프티콘으로 즉시 교환! 매일 새로운 미션이 업데이트됩니다.",
  keywords: [
    "리뷰 미션",
    "포인트 적립 사이트",
    "참여형 미션",
    "앱 체험 리워드",
    "포인트 기프티콘 교환",
    "스타벅스 기프티콘",
    "편의점 쿠폰",
    "미션 포인트",
    "리워드 앱",
  ],
  openGraph: {
    title: "리뷰 미션 참여하고 포인트 받기 | TrueHub",
    description:
      "앱 리뷰 미션에 참여하고 포인트를 적립하세요. 스타벅스, 편의점 기프티콘으로 즉시 교환 가능!",
    type: "website",
    locale: "ko_KR",
    siteName: "TrueHub",
    url: "https://truehub.previewapp.co.kr/tester/campaigns",
    images: [
      {
        url: "https://truehub.previewapp.co.kr/logo.png",
        width: 800,
        height: 400,
        alt: "TrueHub - 리뷰 미션 참여하고 포인트 받기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "리뷰 미션 참여하고 포인트 받기 | TrueHub",
    description:
      "앱 리뷰 미션에 참여하고 포인트를 적립하세요. 스타벅스, 편의점 기프티콘으로 즉시 교환 가능!",
    images: ["https://truehub.previewapp.co.kr/logo.png"],
  },
  alternates: {
    canonical: "https://truehub.previewapp.co.kr/tester/campaigns",
  },
};

export default async function TesterPublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-cyan-50/20 pb-20">
      {/* Grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.15]" />

      <header className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link href="/tester/campaigns" className="transition-transform hover:scale-105">
            <Image src="/logo.png" alt="TrueHub" width={100} height={28} />
          </Link>
          {session?.user ? (
            <Link
              href="/tester/settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm transition-all hover:shadow-md hover:scale-105"
            >
              <User className="h-4 w-4 text-slate-600" />
            </Link>
          ) : (
            <Link
              href="/tester/login"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              로그인
            </Link>
          )}
        </div>
      </header>
      <main className="relative mx-auto max-w-md pt-14">{children}</main>
      <BottomNav />
    </div>
  );
}
