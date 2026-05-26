"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Link2, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

export default function Page() {
  const { user, loading, isDemoMode, loginWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect to admin if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
          <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 animate-pulse">
            사용자 세션을 불러오고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden font-sans">
      {/* Premium Decorative Light Gradients */}
      <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-zinc-200/60 dark:bg-zinc-900/10 blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-zinc-200/60 dark:bg-zinc-900/10 blur-[120px] pointer-events-none select-none" />

      {/* Header */}
      <header className="w-full max-w-5xl px-8 py-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 shadow-md">
            <Link2 className="h-4.5 w-4.5" />
          </div>
          <span className="font-heading tracking-wide">My Link</span>
        </div>
        {isDemoMode && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.05)]">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>로컬 데모 모드</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl z-10 my-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-8 select-none">
          <Sparkles className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
          <span>미니멀리즘 링크 디렉토리 서비스</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          닉네임이 주소가 되는<br />
          <span className="bg-gradient-to-r from-zinc-700 via-zinc-900 to-zinc-950 dark:from-zinc-400 dark:via-zinc-200 dark:to-zinc-50 bg-clip-text text-transparent">
            가장 직관적인 저장소
          </span>
        </h1>
        
        <p className="text-zinc-400 dark:text-zinc-400 text-base sm:text-lg max-w-lg mb-12 leading-relaxed font-normal">
          꾸미지 않아도 세련된, 리스트 중심의 미니멀리즘 디자인.<br />
          구글 계정 하나로 나만의 전용 링크 명함을 바로 생성하세요.
        </p>

        {/* Login Area Card */}
        <div className="w-full max-w-md p-6 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-premium flex flex-col gap-4">
          <Button 
            onClick={loginWithGoogle}
            className="w-full py-6 text-base font-bold bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all duration-300 rounded-xl shadow-lg shadow-zinc-950/10 dark:shadow-zinc-50/5 flex items-center justify-center gap-3 cursor-pointer select-none active:scale-[0.98]"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google 계정으로 로그인
          </Button>

          {isDemoMode && (
            <div className="px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              * 임의의 이메일을 입력하여 즉각 테스트 해볼 수 있습니다.
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-24 text-left">
          <div className="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md shadow-premium hover:shadow-premium-hover transition-all duration-300">
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-zinc-200/50 dark:border-zinc-700/50">
              <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <h3 className="font-bold text-sm mb-2 text-zinc-800 dark:text-zinc-200">고유 닉네임 슬러그</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              가입 시 제공되는 지메일 아이디에서 특수문자를 제거한 직관적인 주소 경로를 자동으로 할당해 드립니다.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md shadow-premium hover:shadow-premium-hover transition-all duration-300">
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-zinc-200/50 dark:border-zinc-700/50">
              <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <h3 className="font-bold text-sm mb-2 text-zinc-800 dark:text-zinc-200">원스톱 인라인 편집</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              대시보드 내의 텍스트와 링크를 즉시 편집하고 Blur(포커스 아웃) 시 자동 저장되는 매끄러운 경험을 제공합니다.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md shadow-premium hover:shadow-premium-hover transition-all duration-300">
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-zinc-200/50 dark:border-zinc-700/50">
              <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <h3 className="font-bold text-sm mb-2 text-zinc-800 dark:text-zinc-200">자동 파비콘 & 카운트</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              외부 도메인의 파비콘을 자동으로 캐시하여 매칭하고, 실시간 방문자 클릭 조회수(Hits) 분석을 지원합니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl px-8 py-8 border-t border-zinc-200/60 dark:border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 z-10 gap-4">
        <p>© {new Date().getFullYear()} My Link. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
