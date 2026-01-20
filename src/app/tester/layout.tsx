import Link from "next/link";
import { Home, Search, User, Gift } from "lucide-react";

export default function TesterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link href="/tester/campaigns" className="text-xl font-bold text-primary">
            TrueHub
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/tester/settings" className="rounded-full p-2 hover:bg-slate-100">
              <User className="h-5 w-5 text-slate-600" />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white pb-safe">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          <NavItem href="/tester/campaigns" icon={<Home className="h-5 w-5" />} label="홈" />
          <NavItem href="/tester/campaigns" icon={<Search className="h-5 w-5" />} label="탐색" />
          <NavItem href="/tester/my" icon={<User className="h-5 w-5" />} label="내 참여" />
          <NavItem href="/tester/rewards" icon={<Gift className="h-5 w-5" />} label="리워드" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
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
      className="flex flex-col items-center gap-1 text-slate-500 transition-colors hover:text-primary"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
