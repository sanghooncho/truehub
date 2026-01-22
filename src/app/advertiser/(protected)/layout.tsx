import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Megaphone, CreditCard, Settings } from "lucide-react";
import { getAdvertiserSession } from "@/lib/advertiser-auth";
import { LogoutButton } from "@/components/advertiser/logout-button";

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdvertiserSession();

  if (!session) {
    redirect("/advertiser/login");
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="flex">
        <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 border-r border-slate-100 bg-white lg:block">
          <div className="flex h-14 items-center border-b border-slate-100 px-6">
            <Link href="/advertiser/dashboard">
              <Image src="/logo.png" alt="TrueHub" width={100} height={28} />
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
          <div className="absolute right-0 bottom-0 left-0 border-t border-slate-100 p-4">
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-lg lg:hidden">
            <div className="flex h-14 items-center justify-between px-5">
              <Link href="/advertiser/dashboard">
                <Image src="/logo.png" alt="TrueHub" width={100} height={28} />
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
      className="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
