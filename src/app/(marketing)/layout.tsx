import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-xl font-bold text-primary">
            프리뷰
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/tester/login">테스터 로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/advertiser/login">광고주 로그인</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/policy/terms" className="text-slate-500 hover:text-slate-700">
              이용약관
            </Link>
            <Link href="/policy/privacy" className="text-slate-500 hover:text-slate-700">
              개인정보처리방침
            </Link>
            <Link href="/policy/refund" className="text-slate-500 hover:text-slate-700">
              환불정책
            </Link>
          </div>
          <div className="text-center text-xs text-slate-400 leading-relaxed">
            <p className="mb-1">
              <span className="font-medium">프리뷰</span> | 대표: 조상훈 | 사업자등록번호: 659-44-01557
            </p>
            <p className="mb-1">
              통신판매업 신고번호: 제2025-서울광진-1698호
            </p>
            <p className="mb-1">
              주소: 서울특별시 광진구 군자로12길 46, 102동 501호(군자동, 일성파크아파트)
            </p>
            <p className="mb-3">
              이메일: previewapp@naver.com
            </p>
            <p>&copy; {new Date().getFullYear()} 프리뷰. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
