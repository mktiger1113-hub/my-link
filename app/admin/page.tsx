"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getUserProfile,
  updateUserProfile,
  checkDisplayNameExists,
  getLinks,
  addLink,
  updateLink,
  deleteLink,
  UserProfile,
  UserLink,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Link2,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  Globe,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// Inline Edit Input Component
interface InlineEditProps {
  value: string;
  onSave: (val: string) => Promise<boolean | void>;
  label?: string;
  className?: string;
  validate?: (val: string) => string | null;
  placeholder?: string;
}

function InlineEdit({
  value,
  onSave,
  className = "",
  validate,
  placeholder = "",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (trimmed === value) {
      setIsEditing(false);
      setError(null);
      return;
    }

    if (validate) {
      const err = validate(trimmed);
      if (err) {
        setError(err);
        return;
      }
    }

    setLoading(true);
    try {
      const success = await onSave(trimmed);
      if (success !== false) {
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setInputValue(value);
      setIsEditing(false);
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 w-full max-w-md">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <button onClick={handleSave} className="p-1 hover:text-green-600">
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-2 cursor-pointer ${className}`} onClick={() => setIsEditing(true)}>
      <span className={value ? "" : "text-zinc-400 italic"}>
        {value || placeholder || "입력되지 않음"}
      </span>
      <Edit2 className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Link Add Form state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Profile ID (displayName) Edit state with live validation
  const [idEditing, setIdEditing] = useState(false);
  const [idValue, setIdValue] = useState("");
  const [idError, setIdError] = useState<string | null>(null);
  const [idStatus, setIdStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [idLoading, setIdLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch user data
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
          if (userProfile) {
            setIdValue(userProfile.displayName);
          }

          const userLinks = await getLinks(user.uid);
          setLinks(userLinks);
        } catch (error) {
          console.error("데이터 로드 실패:", error);
        } finally {
          setPageLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  // Live displayName Validation (Debounced)
  useEffect(() => {
    if (!idEditing || !profile) return;

    const trimmed = idValue.trim().toLowerCase();
    if (trimmed === profile.displayName) {
      setIdStatus("idle");
      setIdError(null);
      return;
    }

    if (trimmed.length < 3) {
      setIdStatus("unavailable");
      setIdError("아이디는 최소 3자 이상이어야 합니다.");
      return;
    }

    const validRegex = /^[a-z0-9]+$/;
    if (!validRegex.test(trimmed)) {
      setIdStatus("unavailable");
      setIdError("영문 소문자와 숫자만 사용할 수 있습니다 (특수문자/공백 불가).");
      return;
    }

    setIdStatus("checking");
    setIdError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const exists = await checkDisplayNameExists(trimmed, profile.uid);
        if (exists) {
          setIdStatus("unavailable");
          setIdError("이미 사용 중인 아이디입니다.");
        } else {
          setIdStatus("available");
          setIdError(null);
        }
      } catch (err) {
        setIdStatus("idle");
        setIdError("중복 확인 중 오류가 발생했습니다.");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [idValue, idEditing, profile]);

  if (authLoading || pageLoading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-950 dark:text-zinc-50" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">데이터를 로드하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // Handle Profile Save (Username & Bio)
  const handleProfileSave = async (field: "username" | "bio", val: string) => {
    try {
      await updateUserProfile(user.uid, { [field]: val });
      setProfile((prev) => (prev ? { ...prev, [field]: val } : null));
    } catch (err) {
      console.error(`${field} 저장 실패:`, err);
      return false;
    }
  };

  // Handle DisplayName (URL ID) Save
  const handleIdSave = async () => {
    const cleanId = idValue.trim().toLowerCase();
    if (cleanId === profile.displayName) {
      setIdEditing(false);
      return;
    }

    if (idStatus !== "available") return;

    setIdLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName: cleanId });
      setProfile((prev) => (prev ? { ...prev, displayName: cleanId } : null));
      setIdEditing(false);
      setIdStatus("idle");
    } catch (err) {
      setIdError("아이디 저장에 실패했습니다.");
    } finally {
      setIdLoading(false);
    }
  };

  // URL Validation
  const validateUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "URL 주소를 입력해주세요.";
    // Simple protocol check
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
      const added = await addLink(user.uid, title, url);
      setLinks((prev) => [added, ...prev]);
      setNewTitle("");
      setNewUrl("");
    } catch (err) {
      setAddError("링크 추가에 실패했습니다.");
    } finally {
      setAddLoading(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("이 링크를 정말로 삭제하시겠습니까?")) return;
    try {
      await deleteLink(user.uid, linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      alert("링크 삭제에 실패했습니다.");
    }
  };

  // Update Link inline
  const handleUpdateLink = async (
    linkId: string,
    field: "title" | "url",
    val: string
  ) => {
    try {
      await updateLink(user.uid, linkId, { [field]: val });
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, [field]: val } : l))
      );
    } catch (err) {
      console.error("링크 수정 실패:", err);
      return false;
    }
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950">
              <Link2 className="h-4 w-4" />
            </div>
            <span>My Link Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/${profile.displayName}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>내 페이지 보기</span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </a>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-lg h-9 w-9 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-10 grid grid-cols-1 gap-10">
        {/* Profile Card */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            프로필 정보 설정
            <span className="text-xs font-normal text-zinc-400">(항목을 클릭하여 바로 편집 가능)</span>
          </h2>

          <div className="flex flex-col gap-6">
            {/* DisplayName (Unique Slug ID) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">내 페이지 ID (주소 경로)</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  마이링크 개인 주소: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300">mylink.io/{profile.displayName}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {idEditing ? (
                  <div className="flex flex-col gap-1.5 w-full md:w-80">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">mylink.io/</span>
                        <input
                          type="text"
                          value={idValue}
                          onChange={(e) => setIdValue(e.target.value)}
                          disabled={idLoading}
                          className="w-full pl-[72px] pr-8 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50"
                          placeholder="username"
                        />
                        {idStatus === "checking" && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
                        )}
                      </div>
                      <button
                        onClick={handleIdSave}
                        disabled={idStatus !== "available" || idLoading}
                        className={`p-1.5 rounded border border-zinc-200 dark:border-zinc-800 ${
                          idStatus === "available"
                            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-green-600"
                            : "opacity-40 cursor-not-allowed text-zinc-400"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIdValue(profile.displayName);
                          setIdEditing(false);
                          setIdStatus("idle");
                          setIdError(null);
                        }}
                        disabled={idLoading}
                        className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {idError && (
                      <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        {idError}
                      </span>
                    )}
                    {idStatus === "available" && (
                      <span className="text-xs text-green-600 font-medium">
                        사용 가능한 고유 ID입니다.
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => setIdEditing(true)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                  >
                    <span className="text-sm font-semibold">{profile.displayName}</span>
                    <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Username (Display Name on Public Page) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">표시 이름 (Username)</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">페이지 상단에 크게 표시될 실명 또는 닉네임</p>
              </div>
              <InlineEdit
                value={profile.username}
                onSave={(val) => handleProfileSave("username", val)}
                validate={(val) => (!val ? "이름은 비어 둘 수 없습니다." : null)}
                className="font-medium text-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg"
              />
            </div>

            {/* Bio (Short Introduction) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">한 줄 소개 (Bio)</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">나를 한 줄로 표현해 보세요</p>
              </div>
              <InlineEdit
                value={profile.bio}
                onSave={(val) => handleProfileSave("bio", val)}
                placeholder="한 줄 소개를 입력해주세요."
                className="text-sm text-zinc-600 dark:text-zinc-300 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg max-w-xs md:max-w-md text-right md:text-right"
              />
            </div>
          </div>
        </section>

        {/* Link Add Form */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            새 링크 추가
          </h2>

          <form onSubmit={handleAddLink} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">링크 제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 깃허브 저장소, 개인 블로그"
                  className="px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">URL 주소</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50"
                />
              </div>
            </div>

            {addError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {addError}
              </p>
            )}

            <Button
              type="submit"
              disabled={addLoading}
              className="mt-2 w-full md:w-auto self-end py-2 px-5 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors rounded-lg flex items-center justify-center gap-2 cursor-pointer font-semibold text-sm"
            >
              {addLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>링크 추가</span>
            </Button>
          </form>
        </section>

        {/* Links List */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
            <h2 className="text-lg font-bold tracking-tight">내 링크 목록 ({links.length})</h2>
            <span className="text-xs text-zinc-400">항목을 클릭해서 바로 수정하세요.</span>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Link2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-semibold text-zinc-400">등록된 링크가 없습니다.</p>
              <p className="text-xs text-zinc-400 mt-1">위 폼을 사용하여 링크를 추가해보세요.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Google Favicon API */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      {getFaviconUrl(link.url) ? (
                        <img
                          src={getFaviconUrl(link.url)}
                          alt="favicon"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <Link2 className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                      {/* Inline Edit Title */}
                      <InlineEdit
                        value={link.title}
                        onSave={(val) => handleUpdateLink(link.id, "title", val)}
                        validate={(val) => (!val ? "제목은 필수입니다." : null)}
                        placeholder="링크 제목"
                        className="text-sm font-bold truncate max-w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 px-1 py-0.5 rounded cursor-pointer"
                      />
                      {/* Inline Edit URL */}
                      <InlineEdit
                        value={link.url}
                        onSave={(val) => handleUpdateLink(link.id, "url", val)}
                        validate={validateUrl}
                        placeholder="https://..."
                        className="text-xs text-zinc-500 truncate max-w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 px-1 py-0.5 rounded cursor-pointer font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Click Stats Badge */}
                    <div className="flex flex-col items-center justify-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] font-normal text-zinc-400 leading-none mb-0.5">Hits</span>
                      <span className="leading-none">{link.clickCount || 0}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
