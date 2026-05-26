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
import { Link2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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
      // Background click increment (don't block redirect)
      incrementClickCount(profile.uid, link.id);
    } catch (err) {
      console.error("클릭 카운트 증가 실패:", err);
    }
    // Redirect to outer link
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
          {/* Profile Circle Skeleton */}
          <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-6" />
          {/* Name Skeleton */}
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mb-3" />
          {/* Bio Skeleton */}
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mb-10" />

          {/* Links Skeleton */}
          <div className="w-full flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 w-full bg-zinc-200/60 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-10" />
      </div>
    );
  }

  // 2. 404 User Not Found UI
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-900 dark:text-zinc-50">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl max-w-sm w-full shadow-sm flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold mb-2">존재하지 않는 페이지입니다</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            찾으려는 사용자 주소(<code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">@{displayName}</code>)가 삭제되었거나 잘못 입력되었습니다.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full py-2.5 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>메인 페이지로 이동</span>
          </Button>
        </div>
      </div>
    );
  }

  // Generate dynamic Avatar text
  const getAvatarChar = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  // 3. Normal Public Profile UI
  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between py-16 px-6 overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-zinc-200/40 dark:bg-zinc-900/20 blur-3xl pointer-events-none" />

      <main className="w-full max-w-md mx-auto flex flex-col items-center z-10 flex-1">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 text-3xl font-extrabold shadow-sm select-none mb-4">
            {getAvatarChar(profile.username)}
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1.5">{profile.username}</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-3">@{profile.displayName}</p>
          {profile.bio && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Container */}
        <div className="w-full flex flex-col gap-3.5">
          {links.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
              <Link2 className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-semibold text-zinc-400">등록된 링크가 아직 없습니다.</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left group"
              >
                {/* Favicon Container */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
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
                  <h2 className="text-sm font-bold truncate group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                    {link.title}
                  </h2>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="w-full text-center mt-16 z-10 flex flex-col items-center justify-center gap-1.5">
        <a
          href="/"
          className="flex items-center gap-1 text-xs font-bold text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold shrink-0">
            M
          </div>
          <span>My Link</span>
        </a>
      </footer>
    </div>
  );
}
