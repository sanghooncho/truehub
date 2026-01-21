"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Gift, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        <NavItem
          href="/tester/campaigns"
          icon={<Home className="h-5 w-5" />}
          label="홈"
          isActive={pathname === "/tester/campaigns"}
        />
        <NavItem
          href="/tester/my"
          icon={<LayoutGrid className="h-5 w-5" />}
          label="내 활동"
          isActive={pathname?.startsWith("/tester/my")}
        />
        <NavItem
          href="/tester/giftshop"
          icon={<Gift className="h-5 w-5" />}
          label="상품권"
          isActive={
            pathname?.startsWith("/tester/giftshop") || pathname?.startsWith("/tester/rewards")
          }
        />
        <NavItem
          href="/tester/settings"
          icon={<User className="h-5 w-5" />}
          label="마이"
          isActive={pathname === "/tester/settings"}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200",
        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute -top-[1px] h-[3px] w-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
        isActive && "bg-gradient-to-br from-blue-100 to-cyan-100 scale-110"
      )}>
        {icon}
      </div>
      <span className={cn("text-[10px] transition-all", isActive ? "font-bold" : "font-medium")}>
        {label}
      </span>
    </Link>
  );
}
