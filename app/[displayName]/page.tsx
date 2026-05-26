"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUserByDisplayName,
  getLinks,
  incrementClickCount,
  UserProfile,
  UserLink,
} from "@/lib/db";
import { Link2, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const { displayName } = use(params);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const userProfile = await getUserByDisplayName(displayName);
        if (!userProfile) {
          setError(true);
          setLoading(false);
          return;
        }

        setProfile(userProfile);
        const userLinks = await getLinks(userProfile.uid);
        setLinks(userLinks);
      } catch (err) {
        console.error("공개 프로필 로딩 실패:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, [displayName]);

  // Click Handler with click tracking
  const handleLinkClick = async (link: UserLink) => {
    if (!profile) return;
    try {
      incrementClickCount(profile.uid, link.id);
    } catch (err) {
      console.error("클릭 카운트 증가 실패:", err);
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  // Favicon URL helper
  const getFaviconUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch (_) {
      return "";
    }
  };

  // 1. Loading Skeleton UI
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-between py-20 px-6">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Profile Circle Skeleton with Ring */}
          <div className="relative mb-6">
            <div className="h-25 w-25 rounded-full border border-zinc-200 dark:border-zinc-800 animate-pulse flex items-center justify-center">
              <div className="h-22 w-22 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          {/* Name Skeleton */}
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mb-3" />
          {/* Slug Skeleton */}
          <div className="h-3 w-20 bg-zinc-150 dark:bg-zinc-800/60 rounded animate-pulse mb-4" />
          {/* Bio Skeleton */}
          <div className="h-4 w-52 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mb-12" />

          {/* Links Skeleton */}
          <div className="w-full flex flex-col gap-3.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-16 w-full bg-zinc-200/60 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-4.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-10" />
      </div>
    );
  }

  // 2. 404 User Not Found UI
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-900 dark:text-zinc-50">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-premium flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-base font-bold mb-2">존재하지 않는 페이지입니다</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            요청하신 주소(<code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200">@{displayName}</code>)는 삭제되었거나 아직 등록되지 않았습니다.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full py-2.5 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>메인 페이지로 이동</span>
          </Button>
        </div>
      </div>
    );
  }

  const getAvatarChar = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  // 3. Normal Public Profile UI
  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between py-20 px-6 overflow-hidden font-sans">
      {/* Premium Blur Backgrounds */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-zinc-200/50 dark:bg-zinc-900/10 blur-[120px] pointer-events-none select-none" />

      <main className="w-full max-w-md mx-auto flex flex-col items-center z-10 flex-1">
        {/* Profile Card Header (Mobile Card Style) */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Avatar with Gradient border ring */}
          <div className="relative mb-5 p-1 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 shadow-sm">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-800 dark:text-zinc-100 text-3xl font-extrabold shadow-inner select-none">
              {getAvatarChar(profile.username)}
            </div>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight mb-1">{profile.username}</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-4">@{profile.displayName}</p>
          
          {profile.bio && (
            <p className="text-sm text-zinc-500 dark:text-zinc-450 max-w-xs leading-relaxed font-normal bg-white/20 dark:bg-zinc-900/10 px-4 py-2 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/20 backdrop-blur-sm shadow-sm">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Cards Container */}
        <div className="w-full flex flex-col gap-4">
          {links.length === 0 ? (
            <div className="text-center py-12 bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-premium">
              <Link2 className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-semibold text-zinc-400">연동된 주소가 없습니다.</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-4 p-4.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer text-left group"
              >
                {/* Favicon Container */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 overflow-hidden shadow-inner">
                  {getFaviconUrl(link.url) ? (
                    <img
                      src={getFaviconUrl(link.url)}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <Link2 className="h-4.5 w-4.5 text-zinc-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                    {link.title}
                  </h2>
                </div>

                <ExternalLink className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
              </button>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center mt-20 z-10 flex flex-col items-center justify-center gap-2">
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-405 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors select-none"
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
