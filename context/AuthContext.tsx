import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithCustomToken,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
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
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  credits: number;
  isInfinite: boolean;
  isAdmin: boolean;
  loading: boolean;
  signInWithNaver: (accessToken: string) => Promise<void>;
  signUpWithNaver: (accessToken: string, extraData?: any) => Promise<void>;
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
        const userRef = doc(db, "users", u.uid);
        
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

  const signInWithNaver = async (accessToken: string) => {
    const functions = getFunctions();
    const verifyNaverToken = httpsCallable(functions, "verifyNaverToken");
    
    const result = await verifyNaverToken({ accessToken });
    const { customToken, isRegistered } = result.data as { customToken: string; isRegistered: boolean };
    
    // 가입되지 않은 사용자라면 로그인을 진행하지 않고 바로 중단
    if (!isRegistered) {
      throw new Error("USER_NOT_FOUND");
    }
    
    await signInWithCustomToken(auth, customToken);
  };

  const signUpWithNaver = async (accessToken: string, extraData?: any) => {
    try {
      const functions = getFunctions();
      const verifyNaverToken = httpsCallable(functions, "verifyNaverToken");
      
      const result = await verifyNaverToken({ accessToken });
      const { customToken, email } = result.data as { customToken: string; email: string };
      
      const userCredential = await signInWithCustomToken(auth, customToken);
      const newUser = userCredential.user;

      // Firestore 프로필 생성 시 email 값이 Auth 객체에 아직 반영되지 않았을 수 있으므로 
      // 서버에서 직접 받은 email 값을 최우선으로 사용합니다.
      const finalEmail = email || newUser.email || "";

      // 네이버 회원가입 시 5회 이용권 지급 및 연동 상태 저장
      await initUserProfile(newUser.uid, finalEmail, { ...extraData, isNaverLinked: true }, 5);
      
      // 클라이언트 Auth 객체 정보 업데이트
      await newUser.reload();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use" || err.code === "already-exists") {
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
