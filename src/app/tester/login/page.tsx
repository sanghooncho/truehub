"use client";

import { signIn } from "next-auth/react";

export default function TesterLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-3xl font-bold text-primary">TrueHub</h1>
            <p className="text-base text-slate-500">
              앱을 체험하고 리워드를 받으세요
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signIn("kakao", { callbackUrl: "/tester/campaigns" })}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] font-semibold text-[#191919] transition-transform active:scale-95"
            >
              <KakaoIcon />
              <span>카카오로 시작하기</span>
            </button>

            <button
              onClick={() => signIn("naver", { callbackUrl: "/tester/campaigns" })}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#03C75A] font-semibold text-white transition-transform active:scale-95"
            >
              <NaverIcon />
              <span>네이버로 시작하기</span>
            </button>

            <button
              onClick={() => signIn("google", { callbackUrl: "/tester/campaigns" })}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition-transform active:scale-95"
            >
              <GoogleIcon />
              <span>Google로 시작하기</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="px-5 pb-8 pt-4">
        <p className="text-center text-xs leading-relaxed text-slate-400">
          시작하기를 누르면{" "}
          <a href="/terms" className="underline underline-offset-2">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="underline underline-offset-2">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </footer>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C5.029 2 1 5.132 1 8.999c0 2.457 1.626 4.617 4.076 5.852-.132.469-.847 3.017-.877 3.213 0 0-.017.145.076.2.093.057.203.013.203.013.268-.037 3.105-2.03 3.595-2.373.617.086 1.251.131 1.897.131 4.971 0 9-3.132 9-6.999C19 5.132 14.971 2 10 2"
        fill="#191919"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M13.5 10.548L6.22 3H3v14h3.5V9.452L13.78 17H17V3h-3.5v7.548z"
        fill="white"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
        fill="#34A853"
      />
      <path
        d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z"
        fill="#EA4335"
      />
    </svg>
  );
}
