"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdvertiserSettingsPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">설정</h1>

      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">회사 정보</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">회사명</Label>
              <Input id="companyName" defaultValue="테스트 주식회사" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">담당자명</Label>
              <Input id="contactName" defaultValue="홍길동" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">연락처</Label>
              <Input id="contactPhone" defaultValue="010-1234-5678" />
            </div>
            <Button>저장</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">비밀번호 변경</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button>비밀번호 변경</Button>
          </div>
        </Card>

        <Card className="border-red-100 p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-600">위험 영역</h2>
          <p className="mb-4 text-sm text-slate-500">
            계정을 삭제하면 모든 캠페인 데이터가 영구적으로 삭제됩니다.
          </p>
          <Button variant="destructive">계정 삭제</Button>
        </Card>
      </div>
    </div>
  );
}
