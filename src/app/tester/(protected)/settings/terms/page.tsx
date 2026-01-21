"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">이용약관</h1>
      </div>

      <div className="p-5">
        <div className="prose prose-slate max-w-none text-sm">
          <p className="text-slate-500">시행일: 2026년 1월 21일</p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제1조 (목적)</h2>
          <p className="text-slate-700">
            본 약관은 프리뷰(이하 "회사")가 제공하는 앱 체험 리워드 플랫폼 서비스(이하 "서비스")의
            이용 조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
          </p>

          <h2 className="mt-6 text-base font-bold text-slate-900">제2조 (정의)</h2>
          <p className="text-slate-700">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li><strong>"서비스"</strong>란 테스터가 캠페인에 참여하여 앱 체험 후 피드백을 제출하고 리워드를 받는 플랫폼을 의미합니다.</li>
            <li><strong>"테스터"</strong>란 서비스에 가입하여 캠페인에 참여하는 개인 회원을 의미합니다.</li>
            <li><strong>"캠페인"</strong>이란 광고주가 등록한 앱 체험 및 피드백 수집 프로그램을 의미합니다.</li>
            <li><strong>"리워드"</strong>란 캠페인 참여가 승인된 테스터에게 지급되는 보상을 의미합니다.</li>
            <li><strong>"참여"</strong>란 테스터가 캠페인에 스크린샷, 질문 답변, 피드백을 제출하는 행위를 의미합니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
            <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>약관이 변경되는 경우 회사는 변경 내용을 시행일 7일 전부터 서비스 내 공지합니다.</li>
            <li>이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제4조 (서비스 가입)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>서비스 가입은 카카오, 네이버, 구글 소셜 로그인을 통해 이루어집니다.</li>
            <li>이용자는 본인의 정보를 정확하게 제공해야 하며, 허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.</li>
            <li>만 14세 미만의 아동은 서비스에 가입할 수 없습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제5조 (캠페인 참여)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>테스터는 진행 중인 캠페인에 참여할 수 있습니다.</li>
            <li>각 캠페인당 1회만 참여할 수 있습니다.</li>
            <li>하루에 최대 3개의 캠페인에 참여할 수 있습니다.</li>
            <li>참여 시 스크린샷 2장, 질문 2개에 대한 답변, 30자 이상의 피드백을 필수로 제출해야 합니다.</li>
            <li>제출된 콘텐츠는 수정이 불가능하며, 검토 후 승인 또는 반려 처리됩니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제6조 (리워드 지급)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>참여가 승인된 경우 캠페인에 명시된 리워드가 지급됩니다.</li>
            <li>리워드 금액은 캠페인별로 1,000원~50,000원 범위 내에서 결정됩니다.</li>
            <li>리워드는 운영자의 수동 처리를 통해 지급되며, 지급 방식은 회사가 정한 바에 따릅니다.</li>
            <li>부정한 방법으로 취득한 리워드는 환수될 수 있으며, 해당 계정은 정지될 수 있습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제7조 (금지행위)</h2>
          <p className="text-slate-700">이용자는 다음의 행위를 해서는 안 됩니다.</p>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>허위 또는 타인의 정보를 이용한 가입</li>
            <li>동일하거나 유사한 스크린샷을 반복 제출하는 행위</li>
            <li>표절하거나 의미 없는 피드백을 제출하는 행위</li>
            <li>자동화 프로그램(봇)을 이용한 참여</li>
            <li>여러 계정을 생성하여 중복 참여하는 행위</li>
            <li>서비스 운영을 방해하거나 부정한 방법으로 리워드를 취득하는 행위</li>
            <li>기타 관련 법령에 위반되는 행위</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제8조 (서비스 이용 제한)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>회사는 이용자가 제7조의 금지행위를 한 경우 사전 통보 없이 서비스 이용을 제한할 수 있습니다.</li>
            <li>부정행위가 적발된 경우 해당 참여는 자동 반려되며, 계정이 정지될 수 있습니다.</li>
            <li>부정행위 탐지 점수가 70점 이상인 경우 자동 반려됩니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제9조 (회원 탈퇴)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>이용자는 언제든지 서비스 내 설정에서 회원 탈퇴를 요청할 수 있습니다.</li>
            <li>탈퇴 시 모든 참여 내역과 리워드 정보가 삭제되며, 복구할 수 없습니다.</li>
            <li>미지급된 리워드가 있는 경우, 탈퇴 전 지급 완료 여부를 확인하시기 바랍니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제10조 (서비스 변경 및 중단)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>회사는 서비스 운영상, 기술상의 필요에 따라 서비스 내용을 변경할 수 있습니다.</li>
            <li>서비스 변경 시 변경 내용을 사전에 공지합니다.</li>
            <li>회사는 천재지변, 시스템 장애 등 불가피한 사유로 서비스를 일시적으로 중단할 수 있습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제11조 (지적재산권)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>서비스에 관한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
            <li>이용자가 제출한 피드백 및 스크린샷은 광고주에게 제공될 수 있으며,
                이용자는 이에 동의한 것으로 간주됩니다.</li>
            <li>이용자는 제출한 콘텐츠에 대해 회사와 광고주가 서비스 개선 및 마케팅 목적으로
                이용할 수 있는 권리를 허여합니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제12조 (면책조항)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
            <li>회사는 이용자가 서비스를 통해 얻은 정보의 정확성, 신뢰성에 대해 보증하지 않습니다.</li>
            <li>회사는 광고주가 제공하는 앱의 품질, 안전성에 대해 보증하지 않습니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제13조 (분쟁 해결)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>본 약관과 관련한 분쟁은 대한민국 법률에 따라 해석됩니다.</li>
            <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우,
                회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</li>
          </ol>

          <h2 className="mt-6 text-base font-bold text-slate-900">제14조 (기타)</h2>
          <ol className="list-decimal pl-5 text-slate-700">
            <li>본 약관에서 정하지 않은 사항은 관련 법령 및 회사 정책에 따릅니다.</li>
            <li>서비스 운영 시간: 평일 오전 9시 ~ 오후 6시 (KST)</li>
          </ol>

          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <strong>부칙</strong><br />
              본 약관은 2026년 1월 21일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
