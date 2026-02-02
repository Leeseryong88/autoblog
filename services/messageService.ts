import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Message {
  id?: string;
  userId: string;
  userEmail: string;
  subject: string;
  content: string;
  replyContent?: string;
  status: 'pending' | 'replied';
  userRead?: boolean;
  createdAt: number;
  repliedAt?: number;
}

const MESSAGES_COLLECTION = "messages";

// 메시지 보내기
export const sendMessage = async (userId: string, userEmail: string, subject: string, content: string) => {
  const msg: Message = {
    userId,
    userEmail,
    subject,
    content,
    status: 'pending',
    userRead: true,
    createdAt: Date.now(),
  };
  await addDoc(collection(db, MESSAGES_COLLECTION), msg);
};

// 사용자의 메시지 목록 실시간 감시
export const subscribeUserMessages = (userId: string, callback: (msgs: Message[]) => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(msgs);
  });
};

// 관리자용 모든 메시지 목록 조회
export const getAllMessages = async (): Promise<Message[]> => {
  const q = query(collection(db, MESSAGES_COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
};

// 관리자 답장하기
export const replyToMessage = async (messageId: string, replyContent: string) => {
  const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(msgRef, {
    replyContent,
    status: 'replied',
    userRead: false,
    repliedAt: Date.now()
  });
};

// 사용자가 메시지 읽음 처리
export const markMessageAsRead = async (messageId: string) => {
  const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(msgRef, { userRead: true });
};
