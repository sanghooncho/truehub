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
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link href="/tester/campaigns">
            <Image src="/logo.png" alt="TrueHub" width={100} height={28} />
          </Link>
          <Link href="/tester/settings" className="rounded-full p-2 hover:bg-slate-100">
            <User className="h-5 w-5 text-slate-600" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md pt-14">{children}</main>

      <BottomNav />
    </div>
  );
}
