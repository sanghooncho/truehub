import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/tester/bottom-nav";

export default async function TesterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/tester/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-cyan-50/20 pb-20">
      {/* Grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.15]" />

      <header className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link href="/tester/campaigns" className="transition-transform hover:scale-105">
            <Image src="/logo.png" alt="TrueHub" width={100} height={28} />
          </Link>
          <Link
            href="/tester/settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm transition-all hover:shadow-md hover:scale-105"
          >
            <User className="h-4 w-4 text-slate-600" />
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-md pt-14">{children}</main>

      <BottomNav />
    </div>
  );
}
