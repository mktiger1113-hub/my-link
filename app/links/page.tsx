"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAnonymousLinks,
  addAnonymousLink,
  deleteAnonymousLink,
  incrementAnonymousClickCount,
  UserLink,
} from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  Link2,
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LinksListPage() {
  const router = useRouter();

  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Link Add Form state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load Anonymous Links
  useEffect(() => {
    async function loadLinks() {
      try {
        const anonymousLinks = await getAnonymousLinks();
        setLinks(anonymousLinks);
      } catch (err) {
        console.error("링크 로딩 실패:", err);
        setError("링크 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  // Favicon URL helper
  const getFaviconUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch (_) {
      return "";
    }
  };

  const handleLinkClick = async (link: UserLink) => {
    try {
      await incrementAnonymousClickCount(link.id);
      // Update local state clickCount to react immediately
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l))
      );
    } catch (err) {
      console.error("클릭 카운트 증가 실패:", err);
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  // URL Validation
  const validateUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "URL 주소를 입력해주세요.";
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (!hasProtocol) {
      return "올바른 URL 주소를 입력하세요 (http:// 또는 https:// 포함)";
    }
    try {
      new URL(trimmed);
      return null;
    } catch (_) {
      return "올바른 URL 형식이어야 합니다.";
    }
  };

  // Add Link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const title = newTitle.trim();
    const url = newUrl.trim();

    if (!title) {
      setAddError("링크 제목을 입력해주세요.");
      return;
    }

    const urlErr = validateUrl(url);
    if (urlErr) {
      setAddError(urlErr);
      return;
    }

    setAddLoading(true);
    try {
      const added = await addAnonymousLink(title, url);
      setLinks((prev) => [added, ...prev]);
      setNewTitle("");
      setNewUrl("");
      setIsAddDialogOpen(false);
    } catch (err) {
      setAddError("링크 추가에 실패했습니다.");
    } finally {
      setAddLoading(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (e: React.MouseEvent, linkId: string) => {
    e.stopPropagation(); // Card click prevention
    if (!confirm("이 링크를 정말로 삭제하시겠습니까?")) return;
    try {
      await deleteAnonymousLink(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      alert("링크 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between py-16 px-6 overflow-hidden font-sans">
      {/* Premium Blur Backgrounds */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-zinc-200/40 dark:bg-zinc-900/10 blur-[100px] pointer-events-none select-none" />

      <main className="w-full max-w-md mx-auto flex flex-col items-center z-10 flex-1">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between mb-10">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-250 cursor-pointer active:scale-95 px-3 py-1.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold text-xs">메인으로</span>
          </Button>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="py-1.5 px-3 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all rounded-xl flex items-center gap-1.5 cursor-pointer font-bold text-xs h-8.5 active:scale-95 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>링크 추가</span>
          </Button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/80 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 mb-3 select-none">
            <Sparkles className="h-2.5 w-2.5 text-zinc-900 dark:text-zinc-100" />
            <span>Firestore 연동 마이그레이션 완료</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">익명 링크 디렉토리</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Firestore의 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-zinc-700 dark:text-zinc-300">users/anonymous/links</code> 경로에 저장 및 관리되는 링크 디렉토리입니다.
          </p>
        </div>

        {/* Links List - Premium Vertical cards */}
        <div className="w-full flex flex-col gap-4">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 animate-pulse flex items-center p-4 gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-950 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-850 rounded" />
                  <div className="h-3 w-40 bg-zinc-150 dark:bg-zinc-850/60 rounded" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12 bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-premium">
              <Link2 className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-semibold text-zinc-400">등록된 링크가 아직 없습니다.</p>
              <p className="text-[11px] text-zinc-400 mt-1">상단의 링크 추가 버튼을 통해 경로를 등록해보세요.</p>
            </div>
          ) : (
            links.map((link) => (
              <Card
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="group border border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 shadow-premium hover:shadow-premium-hover hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Google Favicon API */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 overflow-hidden shadow-inner">
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
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                        {link.title}
                      </span>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono truncate max-w-[200px] mt-0.5">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {link.clickCount !== undefined && (
                      <span className="text-[9px] font-extrabold bg-zinc-100 dark:bg-zinc-950/80 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-450 border border-zinc-200/40 dark:border-zinc-800 shadow-sm">
                        {link.clickCount} Hits
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteLink(e, link.id)}
                      className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer active:scale-90"
                      title="삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-450 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Link Add Form Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setAddError(null);
          setNewTitle("");
          setNewUrl("");
        }}
        title="새 링크 등록"
      >
        <form onSubmit={handleAddLink} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">링크 이름</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="예: 네이버, GitHub"
              className="px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 shadow-sm text-zinc-900 dark:text-zinc-50 font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">URL 주소</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://naver.com"
              className="px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 shadow-sm text-zinc-900 dark:text-zinc-50 font-mono"
            />
          </div>

          {addError && (
            <p className="text-xs text-red-500 flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              {addError}
            </p>
          )}

          <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddDialogOpen(false);
                setAddError(null);
                setNewTitle("");
                setNewUrl("");
              }}
              className="py-2.5 px-4.5 rounded-xl cursor-pointer text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 bg-white dark:bg-zinc-950 active:scale-95"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={addLoading}
              className="py-2.5 px-4.5 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold text-xs active:scale-95 shadow-sm"
            >
              {addLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>링크 등록</span>
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Footer */}
      <footer className="w-full text-center mt-16 z-10 flex flex-col items-center justify-center gap-1.5">
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-650 hover:text-zinc-900 dark:hover:text-zinc-350 transition-colors select-none"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-950 dark:bg-zinc-50 text-[10px] text-zinc-50 dark:text-zinc-950 font-bold shrink-0 shadow-sm">
            M
          </div>
          <span className="font-heading tracking-wide">My Link</span>
        </a>
      </footer>
    </div>
  );
}
