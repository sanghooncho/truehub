import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Gift,
  CreditCard,
  Ticket,
  Megaphone,
  Users,
  Building2,
  Cog,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { getOperatorSession } from "@/lib/operator-auth";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getOperatorSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="flex">
        <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r border-slate-100 bg-white">
          <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="TrueHub" width={90} height={25} />
              <span className="text-sm font-medium text-slate-500">Admin</span>
            </Link>
          </div>
          <nav className="space-y-1 overflow-y-auto p-4" style={{ height: "calc(100vh - 120px)" }}>
            <div className="mb-2 px-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
              Overview
            </div>
            <SidebarItem
              href="/admin/dashboard"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="대시보드"
            />

            <div className="mt-4 mb-2 px-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
              Review Queue
            </div>
            <SidebarItem
              href="/admin/participations"
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="참여 심사"
            />
            <SidebarItem
              href="/admin/rewards"
              icon={<Gift className="h-5 w-5" />}
              label="리워드 지급"
            />
            <SidebarItem
              href="/admin/topups"
              icon={<CreditCard className="h-5 w-5" />}
              label="충전 승인"
            />
            <SidebarItem
              href="/admin/promo-codes"
              icon={<Ticket className="h-5 w-5" />}
              label="프로모 코드"
            />

            <div className="mt-4 mb-2 px-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
              Management
            </div>
            <SidebarItem
              href="/admin/campaigns"
              icon={<Megaphone className="h-5 w-5" />}
              label="캠페인"
            />
            <SidebarItem href="/admin/users" icon={<Users className="h-5 w-5" />} label="사용자" />
            <SidebarItem
              href="/admin/advertisers"
              icon={<Building2 className="h-5 w-5" />}
              label="광고주"
            />

            <div className="mt-4 mb-2 px-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
              System
            </div>
            <SidebarItem href="/admin/jobs" icon={<Cog className="h-5 w-5" />} label="잡 큐" />
            <SidebarItem
              href="/admin/audit-logs"
              icon={<FileText className="h-5 w-5" />}
              label="감사 로그"
            />
            <SidebarItem
              href="/admin/settings"
              icon={<Settings className="h-5 w-5" />}
              label="설정"
            />
          </nav>
          <div className="absolute right-0 bottom-0 left-0 border-t border-slate-100 p-4">
            <div className="mb-2 px-3 text-xs text-slate-500">{session.email}</div>
            <form action="/api/v1/auth/operator/logout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut className="h-5 w-5" />
                <span>로그아웃</span>
              </button>
            </form>
          </div>
        </aside>
        <main className="ml-64 flex-1">
          <div className="p-8">{children}</div>
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
      className="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
