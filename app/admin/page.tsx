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
import { Dialog } from "@/components/ui/dialog";
import {
  Link2,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Globe,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Premium Inline Edit Input Component
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
      <div className="flex flex-col gap-1.5 w-full max-w-md animate-in fade-in-0 duration-200">
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
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 shadow-sm"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500 shrink-0" />
          ) : (
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={handleSave} 
                className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
              </button>
              <button 
                onClick={() => { setInputValue(value); setIsEditing(false); setError(null); }}
                className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`group flex items-center gap-3 cursor-pointer select-none transition-all duration-300 ${className}`} 
      onClick={() => setIsEditing(true)}
    >
      <span className={value ? "text-zinc-900 dark:text-zinc-50 font-medium" : "text-zinc-400 italic font-normal"}>
        {value || placeholder || "입력되지 않음"}
      </span>
      <Edit3 className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
          <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 animate-pulse">데이터를 로드하는 중입니다...</p>
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
      setIsAddDialogOpen(false);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20 overflow-hidden font-sans">
      {/* Decorative light gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-200/40 dark:bg-zinc-900/10 blur-[100px] pointer-events-none select-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 dark:border-zinc-900/80 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg select-none">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 shadow-sm">
              <Link2 className="h-4.5 w-4.5" />
            </div>
            <span className="font-heading">My Link Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/${profile.displayName}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shadow-sm active:scale-95 bg-white dark:bg-zinc-950"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>내 페이지 보기</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-xl h-9.5 w-9.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900 cursor-pointer active:scale-95 shadow-sm bg-white dark:bg-zinc-950"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-12 flex flex-col gap-8 z-10 relative">
        {/* Profile Card */}
        <section className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6.5 shadow-premium">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>프로필 설정</span>
            </h2>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">각 항목을 클릭해 바로 편집해보세요.</span>
          </div>

          <div className="flex flex-col gap-6">
            {/* DisplayName (Unique Slug ID) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-5 gap-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">내 페이지 ID (주소 경로)</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  공개 URL: <code className="bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded font-semibold text-zinc-700 dark:text-zinc-300">mylink.io/{profile.displayName}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {idEditing ? (
                  <div className="flex flex-col gap-1.5 w-full md:w-80 animate-in fade-in-0 duration-200">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">mylink.io/</span>
                        <input
                          type="text"
                          value={idValue}
                          onChange={(e) => setIdValue(e.target.value)}
                          disabled={idLoading}
                          className="w-full pl-[62px] pr-8 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 shadow-sm"
                          placeholder="username"
                        />
                        {idStatus === "checking" && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-zinc-400" />
                        )}
                      </div>
                      <button
                        onClick={handleIdSave}
                        disabled={idStatus !== "available" || idLoading}
                        className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all ${
                          idStatus === "available"
                            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-green-600 cursor-pointer"
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
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-all cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {idError && (
                      <span className="text-[11px] text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {idError}
                      </span>
                    )}
                    {idStatus === "available" && (
                      <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        사용 가능한 고유 ID입니다.
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => setIdEditing(true)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all"
                  >
                    <span className="text-sm font-bold">{profile.displayName}</span>
                    <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Username (Display Name on Public Page) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-5 gap-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">표시 이름 (Username)</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">프로필 메인 영역에 노출될 별명 또는 필명</p>
              </div>
              <InlineEdit
                value={profile.username}
                onSave={(val) => handleProfileSave("username", val)}
                validate={(val) => (!val ? "이름은 필수 항목입니다." : null)}
                className="font-bold text-sm border border-zinc-200 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 rounded-xl shadow-sm"
              />
            </div>

            {/* Bio (Short Introduction) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">한 줄 소개 (Bio)</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">공유받은 방문자들에게 보여줄 짧은 인삿말</p>
              </div>
              <InlineEdit
                value={profile.bio}
                onSave={(val) => handleProfileSave("bio", val)}
                placeholder="한 줄 소개를 입력해보세요."
                className="text-sm border border-zinc-200 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 rounded-xl shadow-sm max-w-xs md:max-w-md"
              />
            </div>
          </div>
        </section>

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
                placeholder="예: 개인 포트폴리오, 링크드인"
                className="px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 shadow-sm text-zinc-900 dark:text-zinc-50 font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">URL 주소</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
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

        {/* Links List */}
        <section className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6.5 shadow-premium">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold tracking-tight">내 링크 리스트 ({links.length})</h2>
              <span className="hidden md:inline text-[11px] text-zinc-400">제목/주소를 클릭해 즉시 편집 가능</span>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="py-2 px-3.5 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all rounded-xl flex items-center gap-1.5 cursor-pointer font-bold text-xs h-8.5 active:scale-95 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>새 링크 추가</span>
            </Button>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Link2 className="h-9 w-9 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-xs font-bold text-zinc-400">등록된 링크가 아직 없네요.</p>
              <p className="text-[11px] text-zinc-400 mt-1">상단의 새 링크 추가 버튼을 통해 경로를 연동해보세요.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-premium transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Google Favicon API */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 overflow-hidden">
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

                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                      {/* Inline Edit Title */}
                      <InlineEdit
                        value={link.title}
                        onSave={(val) => handleUpdateLink(link.id, "title", val)}
                        validate={(val) => (!val ? "링크명은 비어둘 수 없습니다." : null)}
                        placeholder="링크 이름"
                        className="text-sm font-bold truncate max-w-full hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-1 py-0.5 rounded-lg cursor-pointer"
                      />
                      {/* Inline Edit URL */}
                      <InlineEdit
                        value={link.url}
                        onSave={(val) => handleUpdateLink(link.id, "url", val)}
                        validate={validateUrl}
                        placeholder="https://..."
                        className="text-xs text-zinc-500 truncate max-w-full hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-1 py-0.5 rounded-lg cursor-pointer font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    {/* Click Stats Badge */}
                    <div className="flex flex-col items-center justify-center px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-extrabold border border-zinc-200/50 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-400/80 uppercase tracking-wide leading-none mb-0.5">Hits</span>
                      <span className="leading-none">{link.clickCount || 0}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer active:scale-90"
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
