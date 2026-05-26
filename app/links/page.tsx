"use client";

import { dummyLinks } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LinksListPage() {
  const router = useRouter();

  // Favicon URL helper
  const getFaviconUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch (_) {
      return "";
    }
  };

  const handleCardClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between py-16 px-6 overflow-hidden">
      {/* Decorative Blur Effect */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-zinc-200/50 dark:bg-zinc-900/30 blur-3xl pointer-events-none" />

      <main className="w-full max-w-md mx-auto flex flex-col items-center z-10 flex-1">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>메인으로</span>
          </Button>

          <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-600">
            Link Directory
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">더미 링크 디렉토리</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            `data/links.ts` 파일의 리스트 데이터들을 로드하여 렌더링한 리스트입니다. 각 카드를 클릭하면 지정된 페이지로 새 창 이동합니다.
          </p>
        </div>

        {/* Links List - Vertical layout, Center aligned */}
        <div className="w-full flex flex-col gap-4">
          {dummyLinks.map((link) => (
            <Card
              key={link.id}
              onClick={() => handleCardClick(link.url)}
              className="group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Google Favicon API */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    {getFaviconUrl(link.url) ? (
                      <img
                        src={getFaviconUrl(link.url)}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        className="h-5.5 w-5.5 object-contain"
                      />
                    ) : (
                      <Link2 className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                      {link.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-[200px] mt-0.5">
                      {link.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Optional clickCount badge (PRD inspired) */}
                  {link.clickCount !== undefined && (
                    <span className="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400">
                      {link.clickCount} Hits
                    </span>
                  )}
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center mt-12 z-10 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
          Powered by MyLink Grid
        </span>
      </footer>
    </div>
  );
}
