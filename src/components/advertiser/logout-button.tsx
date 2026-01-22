"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/advertiser/logout", {
        method: "POST",
      });
      router.push("/advertiser/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
    >
      <LogOut className="h-5 w-5" />
      <span>{isLoading ? "로그아웃 중..." : "로그아웃"}</span>
    </button>
  );
}
