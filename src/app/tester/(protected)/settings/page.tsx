"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, User, ChevronRight, Mail, UserCircle, Link2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserInfo {
  profileName?: string | null;
  email?: string | null;
  provider?: "KAKAO" | "NAVER" | "GOOGLE" | null;
}

const PROVIDER_LABEL: Record<string, string> = {
  KAKAO: "카카오",
  NAVER: "네이버",
  GOOGLE: "구글",
};

export default function TesterSettingsPage() {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUserInfo({
            profileName: data.user.profileName,
            email: data.user.email,
            provider: data.user.provider,
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/v1/users/me", { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "탈퇴 처리 중 오류가 발생했습니다.");
        return;
      }

      toast.success("회원 탈퇴가 완료되었습니다.");
      signOut({ callbackUrl: "/tester/login" });
    } catch {
      toast.error("탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="p-5">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">설정</h1>
      <Card className="divide-y divide-slate-100">
        <SettingsItem
          icon={<User className="h-5 w-5" />}
          label="내 정보"
          onClick={() => setShowUserInfo(true)}
        />
        <SettingsItem icon={<User className="h-5 w-5" />} label="이용약관" />
        <SettingsItem icon={<User className="h-5 w-5" />} label="개인정보처리방침" />
      </Card>
      <div className="mt-6 space-y-3">
        <Button
          variant="outline"
          className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => signOut({ callbackUrl: "/tester/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
        <Button
          variant="ghost"
          className="w-full text-slate-400 hover:text-red-500"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          회원 탈퇴
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴하면 모든 참여 내역과 리워드가 삭제되며, 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "탈퇴하기"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={showUserInfo} onOpenChange={setShowUserInfo}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>내 정보</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <UserCircle className="h-6 w-6 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">닉네임</p>
                <p className="font-medium text-slate-900">{userInfo?.profileName || "미설정"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Mail className="h-6 w-6 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">이메일</p>
                <p className="font-medium text-slate-900">{userInfo?.email || "미설정"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Link2 className="h-6 w-6 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">연결된 계정</p>
                <p className="font-medium text-slate-900">
                  {userInfo?.provider ? PROVIDER_LABEL[userInfo.provider] : "미설정"}
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300" />
    </button>
  );
}
