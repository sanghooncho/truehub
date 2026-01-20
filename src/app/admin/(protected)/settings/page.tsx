"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, KeyRound, LogOut, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // TODO: Fetch real operator data
  const operator = {
    email: "admin@truehub.kr",
    name: "관리자",
    totpEnabled: true,
    lastLogin: "2026-01-20 16:00",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="text-slate-500">관리자 계정 설정을 관리하세요</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필 정보
          </CardTitle>
          <CardDescription>관리자 계정 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input value={operator.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={operator.name} disabled />
            </div>
          </div>
          <div className="text-sm text-slate-500">마지막 로그인: {operator.lastLogin}</div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>계정 비밀번호를 변경합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button>비밀번호 변경</Button>
        </CardContent>
      </Card>

      {/* TOTP Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            2단계 인증 (TOTP)
          </CardTitle>
          <CardDescription>Google Authenticator를 사용한 2단계 인증</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <Shield
                className={`h-5 w-5 ${operator.totpEnabled ? "text-green-500" : "text-slate-400"}`}
              />
              <div>
                <p className="font-medium text-slate-900">
                  {operator.totpEnabled ? "2단계 인증 활성화됨" : "2단계 인증 비활성화됨"}
                </p>
                <p className="text-sm text-slate-500">
                  {operator.totpEnabled
                    ? "로그인 시 인증 코드가 필요합니다"
                    : "보안을 위해 2단계 인증을 활성화하세요"}
                </p>
              </div>
            </div>
            <Button variant={operator.totpEnabled ? "outline" : "default"}>
              {operator.totpEnabled ? "재설정" : "설정하기"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <LogOut className="h-5 w-5" />
            로그아웃
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500">현재 세션을 종료하고 로그아웃합니다.</p>
          <Button variant="destructive">로그아웃</Button>
        </CardContent>
      </Card>
    </div>
  );
}
