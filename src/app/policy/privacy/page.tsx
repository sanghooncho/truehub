"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link
          href="/"
          className="rounded-full p-1 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">개인정보처리방침</h1>
      </div>

      <div className="mx-auto max-w-3xl p-5">
        <div className="prose prose-slate max-w-none text-sm">
          <p className="text-slate-500">시행일: 2026년 1월 21일</p>

          <p className="mt-4 text-slate-700">
            프리뷰(이하 "회사")는 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고
            이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제1조 (개인정보 수집 항목)</h2>
          <p className="text-slate-700">회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">1. 필수 수집 항목</h3>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2 text-left font-medium">수집 시점</th>
                <th className="p-2 text-left font-medium">수집 항목</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b">
                <td className="p-2">테스터 회원 가입</td>
                <td className="p-2">소셜 계정 식별자, 이메일 주소, 닉네임(프로필명)</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">광고주 회원 가입</td>
                <td className="p-2">이메일 주소, 비밀번호(암호화), 회사명, 담당자 정보</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">캠페인 참여</td>
                <td className="p-2">스크린샷 이미지, 질문 답변, 피드백 내용</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">서비스 이용</td>
                <td className="p-2">접속 로그, IP 주소, 기기 정보(디바이스 핑거프린트)</td>
              </tr>
            </tbody>
          </table>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">2. 자동 수집 항목</h3>
          <ul className="list-disc pl-5 text-slate-700">
            <li>접속 일시, 서비스 이용 기록</li>
            <li>디바이스 정보 (운영체제, 브라우저 종류)</li>
            <li>쿠키 및 유사 기술을 통한 정보</li>
          </ul>

          <h2 className="mt-6 text-base font-bold text-slate-900">제2조 (개인정보 수집 방법)</h2>
          <p className="text-slate-700">회사는 다음의 방법으로 개인정보를 수집합니다.</p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>소셜 로그인(카카오, 네이버, 구글)을 통한 회원가입 시 자동 수집</li>
            <li>광고주 회원가입 시 직접 입력</li>
            <li>캠페인 참여 시 이용자의 직접 입력</li>
            <li>서비스 이용 과정에서 자동 생성 및 수집</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제3조 (개인정보 수집·이용 목적)</h2>
          <p className="text-slate-700">회사는 다음의 목적으로 개인정보를 처리합니다.</p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2 text-left font-medium">처리 목적</th>
                <th className="p-2 text-left font-medium">상세 내용</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b">
                <td className="p-2">회원 관리</td>
                <td className="p-2">회원 식별, 가입 의사 확인, 본인 인증, 서비스 제공</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">서비스 제공</td>
                <td className="p-2">캠페인 참여 처리, 리워드 지급, 참여 내역 관리, 크레딧 관리</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">부정행위 방지</td>
                <td className="p-2">
                  중복 참여 탐지, 이미지 중복 검사(pHash), 텍스트 유사도 분석,
                  디바이스 핑거프린트를 통한 부정행위 탐지
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">서비스 개선</td>
                <td className="p-2">서비스 품질 향상, AI 인사이트 리포트 생성, 통계 분석</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">고지사항 전달</td>
                <td className="p-2">약관 변경, 서비스 공지, 참여 결과 안내</td>
              </tr>
            </tbody>
          </table>

          <h2 className="mt-6 text-base font-bold text-slate-900">제4조 (개인정보의 제3자 제공)</h2>
          <p className="text-slate-700">
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라
                수사기관의 요구가 있는 경우</li>
          </ol>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">광고주에게 제공되는 정보</h3>
          <p className="text-slate-700">
            캠페인 참여 시 제출한 피드백, 답변, 스크린샷은 해당 캠페인의 광고주에게 제공됩니다.
            단, <strong>이용자의 개인 식별 정보(이메일, 닉네임 등)는 광고주에게 제공되지 않으며</strong>,
            익명화된 형태로만 제공됩니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제5조 (개인정보 처리 위탁)</h2>
          <p className="text-slate-700">
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁합니다.
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2 text-left font-medium">수탁업체</th>
                <th className="p-2 text-left font-medium">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b">
                <td className="p-2">Supabase Inc.</td>
                <td className="p-2">데이터베이스 및 파일 저장소 운영</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Vercel Inc.</td>
                <td className="p-2">웹 서비스 호스팅</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">OpenAI, Inc.</td>
                <td className="p-2">AI 인사이트 리포트 생성</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">NHN KCP</td>
                <td className="p-2">결제 처리</td>
              </tr>
            </tbody>
          </table>

          <h2 className="mt-6 text-base font-bold text-slate-900">제6조 (개인정보 보유 및 이용 기간)</h2>
          <p className="text-slate-700">
            회사는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            다만, 관련 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2 text-left font-medium">보관 정보</th>
                <th className="p-2 text-left font-medium">보관 기간</th>
                <th className="p-2 text-left font-medium">근거 법령</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b">
                <td className="p-2">계약 또는 청약철회 등에 관한 기록</td>
                <td className="p-2">5년</td>
                <td className="p-2">전자상거래법</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">대금결제 및 재화 등의 공급에 관한 기록</td>
                <td className="p-2">5년</td>
                <td className="p-2">전자상거래법</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">소비자의 불만 또는 분쟁처리에 관한 기록</td>
                <td className="p-2">3년</td>
                <td className="p-2">전자상거래법</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">웹사이트 방문기록</td>
                <td className="p-2">3개월</td>
                <td className="p-2">통신비밀보호법</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">참여 내역 및 이미지</td>
                <td className="p-2">2년</td>
                <td className="p-2">내부 정책</td>
              </tr>
            </tbody>
          </table>

          <h2 className="mt-6 text-base font-bold text-slate-900">제7조 (개인정보의 파기)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li><strong>파기 절차</strong>: 이용 목적이 달성된 개인정보는 별도의 DB로 옮겨져 내부 방침 및
                관련 법령에 따라 일정 기간 저장 후 파기됩니다.</li>
            <li><strong>파기 방법</strong>: 전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제하고,
                종이 문서는 분쇄기로 분쇄하거나 소각합니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제8조 (이용자의 권리와 행사 방법)</h2>
          <p className="text-slate-700">이용자는 다음의 권리를 행사할 수 있습니다.</p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li><strong>열람권</strong>: 자신의 개인정보 처리 현황을 열람할 수 있습니다.</li>
            <li><strong>정정권</strong>: 부정확한 개인정보의 정정을 요구할 수 있습니다.</li>
            <li><strong>삭제권</strong>: 개인정보의 삭제를 요구할 수 있습니다.</li>
            <li><strong>처리정지권</strong>: 개인정보 처리의 정지를 요구할 수 있습니다.</li>
          </ol>
          <p className="mt-2 text-slate-700">
            권리 행사는 서비스 내 설정 메뉴 또는 개인정보 보호책임자에게 서면, 이메일로 연락하여
            행사할 수 있으며, 회사는 지체 없이 조치하겠습니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제9조 (쿠키의 사용)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.</li>
            <li>쿠키는 서비스 이용 시 자동으로 생성되어 이용자의 브라우저에 저장됩니다.</li>
            <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
                이 경우 서비스 이용에 제한이 있을 수 있습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제10조 (개인정보 보호를 위한 기술적 조치)</h2>
          <p className="text-slate-700">회사는 개인정보를 안전하게 처리하기 위해 다음의 조치를 취합니다.</p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li><strong>암호화</strong>: 비밀번호는 암호화되어 저장·관리됩니다.</li>
            <li><strong>해킹 등에 대비한 기술적 대책</strong>: SSL/TLS를 통한 데이터 전송 암호화,
                침입탐지시스템 운영</li>
            <li><strong>접근 권한 관리</strong>: 개인정보에 대한 접근 권한을 최소한으로 제한합니다.</li>
            <li><strong>내부 관리계획 수립</strong>: 개인정보 보호를 위한 내부 관리계획을 수립·시행합니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제11조 (개인정보 보호책임자 및 사업자 정보)</h2>
          <p className="text-slate-700">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
            개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위하여
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="mt-2 rounded-lg bg-slate-50 p-4">
            <p className="text-slate-700">
              <strong>사업자 정보</strong><br />
              상호: 프리뷰<br />
              대표: 조상훈<br />
              사업자등록번호: 659-44-01557<br />
              통신판매업 신고번호: 제2025-서울광진-1698호<br />
              주소: 서울특별시 광진구 군자로12길 46, 102동 501호(군자동, 일성파크아파트)<br />
              이메일: previewapp@naver.com
            </p>
          </div>

          <h2 className="mt-6 text-base font-bold text-slate-900">제12조 (권익침해 구제방법)</h2>
          <p className="text-slate-700">
            개인정보침해로 인한 구제를 받기 위해 아래 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 text-slate-700">
            <li>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
            <li>개인정보분쟁조정위원회: 1833-6972 / www.kopico.go.kr</li>
            <li>대검찰청 사이버수사과: (국번없이) 1301 / www.spo.go.kr</li>
            <li>경찰청 사이버수사국: (국번없이) 182 / ecrm.cyber.go.kr</li>
          </ul>

          <h2 className="mt-6 text-base font-bold text-slate-900">제13조 (개인정보처리방침 변경)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 변경될 수 있습니다.</li>
            <li>변경 시 최소 7일 전에 서비스 내 공지하며, 중요한 변경사항은 30일 전에 공지합니다.</li>
          </ol>

          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <strong>부칙</strong><br />
              본 개인정보처리방침은 2026년 1월 21일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
