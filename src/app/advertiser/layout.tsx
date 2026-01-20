import Link from "next/link";
import { LayoutDashboard, Megaphone, CreditCard, Settings, LogOut } from "lucide-react";

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-100 bg-white lg:block">
          <div className="flex h-14 items-center border-b border-slate-100 px-6">
            <Link href="/advertiser/dashboard" className="text-xl font-bold text-primary">
              TrueHub
            </Link>
          </div>
          <nav className="space-y-1 p-4">
            <SidebarItem
              href="/advertiser/dashboard"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="대시보드"
            />
            <SidebarItem
              href="/advertiser/campaigns"
              icon={<Megaphone className="h-5 w-5" />}
              label="캠페인"
            />
            <SidebarItem
              href="/advertiser/credits"
              icon={<CreditCard className="h-5 w-5" />}
              label="크레딧"
            />
            <SidebarItem
              href="/advertiser/settings"
              icon={<Settings className="h-5 w-5" />}
              label="설정"
            />
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <LogOut className="h-5 w-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-lg lg:hidden">
            <div className="flex h-14 items-center justify-between px-5">
              <Link href="/advertiser/dashboard" className="text-xl font-bold text-primary">
                TrueHub
              </Link>
            </div>
          </header>
          <div className="p-5 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
