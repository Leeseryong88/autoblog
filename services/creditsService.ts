import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

const USERS_COLLECTION = "users";
const INITIAL_CREDITS = 5;
export const CREDITS_PER_BLOG = 1;

export interface UserProfile {
  id?: string;
  email: string;
  blogCredits: number;
  isInfinite?: boolean;
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

export const initUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const profile: UserProfile = {
    email,
    blogCredits: INITIAL_CREDITS,
    isInfinite: false,
    createdAt: Date.now(),
  };
  await setDoc(userRef, profile);
  return profile;
};

export const deductCredit = async (userId: string): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }
  const data = snap.data() as UserProfile;
  
  if (data.isInfinite) return data.blogCredits;

  const newCredits = Math.max(0, data.blogCredits - CREDITS_PER_BLOG);
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};

export const refundCredit = async (userId: string): Promise<number> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  const data = snap.data() as UserProfile;

  if (data.isInfinite) return data.blogCredits;

  const newCredits = data.blogCredits + CREDITS_PER_BLOG;
  await updateDoc(userRef, { blogCredits: newCredits });
  return newCredits;
};
