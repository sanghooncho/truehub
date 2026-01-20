import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-xl font-bold text-primary">
            TrueHub
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
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-5 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} TrueHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
