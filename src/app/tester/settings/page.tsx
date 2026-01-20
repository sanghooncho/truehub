"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, ChevronRight } from "lucide-react";

export default function TesterSettingsPage() {
  return (
    <div className="p-5">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">설정</h1>
      <Card className="divide-y divide-slate-100">
        <SettingsItem icon={<User className="h-5 w-5" />} label="내 정보" />
        <SettingsItem icon={<User className="h-5 w-5" />} label="이용약관" />
        <SettingsItem icon={<User className="h-5 w-5" />} label="개인정보처리방침" />
      </Card>
      <Button
        variant="outline"
        className="mt-6 w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => signOut({ callbackUrl: "/tester/login" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        로그아웃
      </Button>
    </div>
  );
}

function SettingsItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300" />
    </button>
  );
}
