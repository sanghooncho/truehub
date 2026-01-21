"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link
          href="/"
          className="rounded-full p-1 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">환불 및 취소 정책</h1>
      </div>

      <div className="mx-auto max-w-3xl p-5">
        <div className="prose prose-slate max-w-none text-sm">
          <p className="text-slate-500">시행일: 2026년 1월 21일</p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제1조 (서비스 개요)</h2>
          <p className="text-slate-700">
            프리뷰(이하 "회사")가 제공하는 서비스는 광고주가 크레딧을 충전하여 앱 체험 캠페인을
            운영하고, 테스터의 피드백을 수집하는 플랫폼입니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제2조 (크레딧 충전)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>크레딧은 50,000원, 100,000원, 300,000원 단위로 충전할 수 있습니다.</li>
            <li>충전된 크레딧은 결제 완료 즉시 계정에 반영됩니다.</li>
            <li>크레딧은 캠페인 참여가 승인될 때 차감됩니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제3조 (서비스 제공 기간)</h2>
          <p className="text-slate-700">
            충전된 크레딧은 충전일로부터 <strong>1년간</strong> 유효합니다.
            유효기간이 경과한 크레딧은 자동 소멸되며, 환불 대상에서 제외됩니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제4조 (환불 정책)</h2>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">1. 환불 가능한 경우</h3>
          <ul className="list-disc pl-5 text-slate-700">
            <li>충전 후 7일 이내, 미사용 크레딧에 한해 전액 환불 가능</li>
            <li>서비스 장애로 인해 정상적인 이용이 불가능한 경우</li>
            <li>회사의 귀책사유로 서비스가 중단된 경우</li>
          </ul>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">2. 환불이 제한되는 경우</h3>
          <ul className="list-disc pl-5 text-slate-700">
            <li>이미 캠페인에 사용(차감)된 크레딧</li>
            <li>충전 후 7일이 경과한 크레딧</li>
            <li>유효기간(1년)이 경과한 크레딧</li>
            <li>프로모션, 이벤트 등으로 무상 지급된 크레딧</li>
          </ul>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">3. 부분 환불</h3>
          <p className="text-slate-700">
            일부 크레딧을 사용한 경우, 미사용 크레딧에 대해서만 환불이 가능합니다.
            단, 충전 후 7일 이내이며 환불 수수료(결제 수수료 상당액)가 차감될 수 있습니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제5조 (환불 절차)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>환불 요청은 이메일(previewapp@naver.com)로 접수합니다.</li>
            <li>환불 요청 시 다음 정보를 포함해 주세요:
              <ul className="list-disc pl-5 mt-1">
                <li>광고주 계정 이메일</li>
                <li>환불 요청 금액</li>
                <li>환불 사유</li>
                <li>환불받을 계좌 정보</li>
              </ul>
            </li>
            <li>환불 요청 접수 후 영업일 기준 3~5일 이내 처리됩니다.</li>
            <li>환불금은 원결제 수단 또는 지정 계좌로 입금됩니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제6조 (캠페인 취소)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li><strong>DRAFT(작성 중) 상태</strong>: 언제든지 삭제 가능, 크레딧 차감 없음</li>
            <li><strong>RUNNING(진행 중) 상태</strong>: 일시정지 또는 종료 가능
              <ul className="list-disc pl-5 mt-1">
                <li>이미 승인된 참여 건에 대한 크레딧은 환불되지 않음</li>
                <li>미사용 크레딧은 계정에 그대로 유지됨</li>
              </ul>
            </li>
            <li><strong>CLOSED(종료) 상태</strong>: 캠페인 재개 불가</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제7조 (교환)</h2>
          <p className="text-slate-700">
            디지털 서비스 특성상 교환은 적용되지 않습니다.
            충전 금액 변경이 필요한 경우 환불 후 재충전해 주세요.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제8조 (분쟁 해결)</h2>
          <p className="text-slate-700">
            환불 및 취소와 관련한 분쟁은 회사와 이용자 간 협의를 통해 해결합니다.
            협의가 되지 않을 경우 관련 법령 및 소비자 보호 규정에 따릅니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제9조 (문의)</h2>
          <div className="mt-2 rounded-lg bg-slate-50 p-4">
            <p className="text-slate-700">
              환불 및 취소 관련 문의<br />
              이메일: previewapp@naver.com<br />
              처리 시간: 평일 09:00 ~ 18:00 (공휴일 제외)
            </p>
          </div>

          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <strong>부칙</strong><br />
              본 환불 및 취소 정책은 2026년 1월 21일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
