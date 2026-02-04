import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const USERS_COLLECTION = "users";
const INITIAL_CREDITS = 1000;
const NAVER_SIGNUP_CREDITS = 1000;
export const CREDITS_PER_BLOG = 100; // Base cost

export interface UserProfile {
  id?: string;
  email: string;
  blogCredits: number;
  isInfinite?: boolean;
  emailVerifiedRewardGiven?: boolean;
  name?: string;
  nickname?: string;
  isNaverLinked?: boolean;
  naverId?: string;
  writingStyle?: string; // Legacy field
  writingStyles?: WritingStyle[];
  createdAt: number;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UserProfile));
};

export const toggleInfiniteCredits = async (userId: string, status: boolean): Promise<boolean> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, { isInfinite: status });
  return status;
};

export const addCredits = async (userId: string, amount: number): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }
  const data = snap.data() as UserProfile;
  const newCredits = data.blogCredits + amount;
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};

export const getCredits = async (userId: string): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  return (snap.data() as UserProfile).blogCredits;
};

export const initUserProfile = async (userId: string, email: string, extraData?: any, initialCredits?: number): Promise<UserProfile> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const profile: UserProfile = {
    email,
    blogCredits: initialCredits !== undefined ? initialCredits : INITIAL_CREDITS,
    isInfinite: false,
    emailVerifiedRewardGiven: false,
    createdAt: Date.now(),
    ...extraData
  };
  await setDoc(userRef, profile);
  return profile;
};

export const grantNaverSignupReward = async (userId: string): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("사용자를 찾을 수 없습니다.");
  
  const data = snap.data() as UserProfile;
  const newCredits = data.blogCredits + NAVER_SIGNUP_CREDITS;
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};

export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
};

export const deductCredit = async (userId: string, amount: number = CREDITS_PER_BLOG): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }
  const data = snap.data() as UserProfile;
  
  if (data.isInfinite) return data.blogCredits;

  const newCredits = Math.max(0, data.blogCredits - amount);
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};

export const refundCredit = async (userId: string, amount: number = CREDITS_PER_BLOG): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  const data = snap.data() as UserProfile;

  if (data.isInfinite) return data.blogCredits;

  const newCredits = data.blogCredits + amount;
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};

export const grantEmailVerificationReward = async (userId: string): Promise<boolean> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;
  
  const data = snap.data() as UserProfile;
  if (data.emailVerifiedRewardGiven) return false;

  await updateDoc(userRef, {
    blogCredits: data.blogCredits + 1000,
    emailVerifiedRewardGiven: true
  });
  return true;
};

export const updateWritingStyle = async (userId: string, style: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, { writingStyle: style });
};

export const saveWritingStyles = async (userId: string, styles: WritingStyle[]): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, { writingStyles: styles });
};
