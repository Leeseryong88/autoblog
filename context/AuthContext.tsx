import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updatePassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  getCredits,
  initUserProfile,
  deductCredit,
  refundCredit,
  grantNaverSignupReward,
  checkUserExistsByEmail,
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
  signInWithNaver: (email: string, naverId: string) => Promise<void>;
  signUpWithNaver: (email: string, naverId: string, extraData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  useBlogCredit: () => Promise<boolean>;
  refundBlogCredit: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  writingStyle: string;
  writingStyles: WritingStyle[];
  updateUserWritingStyle: (style: string) => Promise<void>;
  saveUserWritingStyles: (styles: WritingStyle[]) => Promise<void>;
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
  const [writingStyle, setWritingStyle] = useState<string>("");
  const [writingStyles, setWritingStyles] = useState<WritingStyle[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCredits = async () => {
    if (!user) {
      setCredits(0);
      setIsInfinite(false);
      setWritingStyle("");
      setWritingStyles([]);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const snap = await getCredits(user.uid); // This is just a helper, but we'll use real-time sync below
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Naver 가입 직후에는 signUpWithNaver에서 5회 이용권을 세팅하므로,
        // 여기서는 데이터가 없을 때만 기본 프로필을 생성하도록 safe하게 처리
        const userRef = doc(db, "users", u.uid);
        const { getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
          await initUserProfile(u.uid, u.email || "");
        }

        setUser(u);
        
        // 실시간 프로필 동기화
        unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setCredits(data.blogCredits);
            setIsInfinite(!!data.isInfinite);
            setWritingStyle(data.writingStyle || "");
            setWritingStyles(data.writingStyles || []);
          }
        });
      } else {
        setUser(null);
        setCredits(0);
        setIsInfinite(false);
        setWritingStyle("");
        setWritingStyles([]);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });
    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signInWithNaver = async (email: string, naverId: string) => {
    // Naver 고유 ID를 비밀번호로 사용하여 로그인 시도
    await signInWithEmailAndPassword(auth, email, naverId);
  };

  const signUpWithNaver = async (email: string, naverId: string, extraData?: any) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, naverId);
      // 네이버 회원가입 시 5회 이용권 지급 및 연동 상태 저장
      await initUserProfile(newUser.uid, newUser.email || "", { ...extraData, isNaverLinked: true, naverId }, 5);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        throw new Error("ALREADY_EXISTS");
      }
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCredits(0);
    setWritingStyle("");
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

  const updateUserWritingStyle = async (style: string) => {
    if (!user) return;
    const { updateWritingStyle } = await import("../services/creditsService");
    await updateWritingStyle(user.uid, style);
  };

  const saveUserWritingStyles = async (styles: WritingStyle[]) => {
    if (!user) return;
    const { saveWritingStyles } = await import("../services/creditsService");
    await saveWritingStyles(user.uid, styles);
  };

  const value: AuthContextType = {
    user,
    credits,
    isInfinite,
    isAdmin: user?.email === ADMIN_EMAIL,
    loading,
    signOut,
    signInWithNaver,
    signUpWithNaver,
    useBlogCredit,
    refundBlogCredit,
    refreshCredits,
    writingStyle,
    writingStyles,
    updateUserWritingStyle,
    saveUserWritingStyles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
