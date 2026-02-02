import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  getCredits,
  initUserProfile,
  deductCredit,
  refundCredit,
  CREDITS_PER_BLOG,
  UserProfile,
} from "../services/creditsService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  credits: number;
  isInfinite: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  useBlogCredit: () => Promise<boolean>;
  refundBlogCredit: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const ADMIN_EMAIL = "kidcap1001@naver.com";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isInfinite, setIsInfinite] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const refreshCredits = async () => {
    if (!user) {
      setCredits(0);
      setIsInfinite(false);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const snap = await getCredits(user.uid); // This is just a helper, but we'll use real-time sync below
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await initUserProfile(u.uid, u.email || "");
        
        // 실시간 프로필 동기화 추가
        unsubProfile = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setCredits(data.blogCredits);
            setIsInfinite(!!data.isInfinite);
          }
        });
      } else {
        setCredits(0);
        setIsInfinite(false);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });
    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await initUserProfile(newUser.uid, newUser.email || "");
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCredits(0);
  };

  const useBlogCredit = async (): Promise<boolean> => {
    if (!user) return false;
    if (!isInfinite && credits < CREDITS_PER_BLOG) return false;
    const newCredits = await deductCredit(user.uid);
    // setCredits and setIsInfinite are handled by onSnapshot
    return true;
  };

  const refundBlogCredit = async () => {
    if (!user) return;
    await refundCredit(user.uid);
    // setCredits and setIsInfinite are handled by onSnapshot
  };

  const value: AuthContextType = {
    user,
    credits,
    isInfinite,
    isAdmin: user?.email === ADMIN_EMAIL,
    loading,
    signIn,
    signUp,
    signOut,
    useBlogCredit,
    refundBlogCredit,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
