"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth as firebaseAuth, isFirebaseConfigured } from "./firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { getUserProfile, createUserProfile, checkDisplayNameExists } from "./db";

export interface UserSession {
  uid: string;
  email: string;
  photoURL: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isDemoMode: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function sanitizeEmailToSlug(email: string): string {
  const localPart = email.split("@")[0];
  // Remove special characters, keep only alphanumerics, and convert to lowercase
  return localPart.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  // Firebase observer
  useEffect(() => {
    if (!isDemoMode && firebaseAuth) {
      const unsubscribe = firebaseAuth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          const sessionUser: UserSession = {
            uid: fbUser.uid,
            email: fbUser.email || "",
            photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
          };

          // Check if profile exists, if not, create one
          const profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            let initialSlug = sanitizeEmailToSlug(sessionUser.email);
            // Ensure unique slug
            let uniqueSlug = initialSlug;
            let counter = 1;
            while (await checkDisplayNameExists(uniqueSlug)) {
              uniqueSlug = `${initialSlug}${counter}`;
              counter++;
            }

            await createUserProfile(fbUser.uid, {
              displayName: uniqueSlug,
              username: fbUser.displayName || uniqueSlug,
              bio: "안녕하세요! 마이링크에 오신 것을 환영합니다.",
            });
          }
          setUser(sessionUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock Mode Initialization
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mylink_session");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  const loginWithGoogle = async () => {
    setLoading(true);
    if (!isDemoMode && firebaseAuth) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(firebaseAuth, provider);
      } catch (error) {
        console.error("Google sign in failed:", error);
        setLoading(false);
      }
    } else {
      // Mock Login Action (Prompt for mock email or use a beautiful mock modal)
      // For ease of use, we can ask for a email or generate one
      const mockEmail = window.prompt(
        "데모 로그인용 구글 이메일을 입력해주세요 (예: developer@gmail.com):",
        "mktiger@gmail.com"
      );
      if (!mockEmail) {
        setLoading(false);
        return;
      }

      const uid = "mock_uid_" + mockEmail.replace(/[^a-zA-Z0-9]/g, "");
      const sessionUser: UserSession = {
        uid,
        email: mockEmail,
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
      };

      const profile = await getUserProfile(uid);
      if (!profile) {
        let initialSlug = sanitizeEmailToSlug(mockEmail);
        let uniqueSlug = initialSlug;
        let counter = 1;
        while (await checkDisplayNameExists(uniqueSlug)) {
          uniqueSlug = `${initialSlug}${counter}`;
          counter++;
        }

        await createUserProfile(uid, {
          displayName: uniqueSlug,
          username: mockEmail.split("@")[0],
          bio: "반갑습니다! 마이링크 데모 프로필입니다.",
        });
      }

      localStorage.setItem("mylink_session", JSON.stringify(sessionUser));
      setUser(sessionUser);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (!isDemoMode && firebaseAuth) {
      try {
        await fbSignOut(firebaseAuth);
      } catch (error) {
        console.error("Sign out failed:", error);
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.removeItem("mylink_session");
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
