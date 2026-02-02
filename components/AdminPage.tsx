import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, getAllUsers, addCredits, toggleInfiniteCredits } from '../services/creditsService';
import { getAllMessages, replyToMessage, Message } from '../services/messageService';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<'users' | 'messages'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, msgData] = await Promise.all([getAllUsers(), getAllMessages()]);
      setUsers(userData);
      setMessages(msgData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleReply = async (msgId: string) => {
    const content = replyText[msgId];
    if (!content) return;
    
    try {
      setActionLoading(msgId);
      await replyToMessage(msgId, content);
      alert('답장이 전송되었습니다.');
      setReplyText(prev => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      setSelectedMessage(null);
      await fetchData();
    } catch (err) {
      console.error("Error replying:", err);
      alert('오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCredits = async (userId: string, amount: number) => {
    if (!window.confirm(`${amount}회의 작성권을 지급하시겠습니까?`)) return;
    
    try {
      setActionLoading(userId);
      await addCredits(userId, amount);
      alert("지급이 완료되었습니다.");
      await fetchData();
    } catch (error) {
      console.error("Error adding credits:", error);
      alert("지급 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleInfinite = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      await toggleInfiniteCredits(userId, !currentStatus);
      alert(`${!currentStatus ? '무제한' : '일반'} 상태로 변경되었습니다.`);
      await fetchData();
    } catch (error) {
      console.error("Error toggling infinite:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-red-500">접근 권한이 없습니다.</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-xl">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fadeIn h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-6 items-end">
          <h2 className="text-2xl font-black text-gray-900 leading-none">관리자 센터</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setTab('users')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'users' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              사용자
            </button>
            <button 
              onClick={() => setTab('messages')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'messages' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              문의함
            </button>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i> 메인으로
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#03c75a] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">정보를 불러오는 중...</p>
        </div>
      ) : tab === 'users' ? (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b-2 border-gray-100">
                <th className="py-4 px-2 text-sm font-bold text-gray-400">가입일</th>
                <th className="py-4 px-2 text-sm font-bold text-gray-400">이메일</th>
                <th className="py-4 px-2 text-sm font-bold text-gray-400 text-center">잔여 작성권</th>
                <th className="py-4 px-2 text-sm font-bold text-gray-400 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const pendingMessage = messages.find(m => m.userEmail === user.email && m.status === 'pending');
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        {user.email}
                        {pendingMessage && (
                          <button 
                            onClick={() => setSelectedMessage(pendingMessage)}
                            className="text-orange-500 hover:text-orange-600 animate-bounce"
                            title="답변 대기 중인 문의가 있습니다"
                          >
                            <i className="fas fa-envelope"></i>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      {user.isInfinite ? (
                        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                          무제한
                        </span>
                      ) : (
                        <span className="bg-green-50 text-[#03c75a] px-3 py-1 rounded-full text-sm font-bold">
                          {user.blogCredits}회
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => user.id && handleToggleInfinite(user.id, !!user.isInfinite)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            user.isInfinite ? 'bg-gray-200 text-gray-600' : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                        >
                          {user.isInfinite ? '무제한 해제' : '무제한 설정'}
                        </button>
                        <button
                          onClick={() => user.id && handleAddCredits(user.id, 1)}
                          disabled={actionLoading === user.id || !!user.isInfinite}
                          className="px-3 py-1 bg-[#03c75a] text-white text-xs font-bold rounded-lg hover:bg-[#02b351] transition-all disabled:opacity-30"
                        >
                          +1회
                        </button>
                        <button
                          onClick={() => user.id && handleAddCredits(user.id, 5)}
                          disabled={actionLoading === user.id || !!user.isInfinite}
                          className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-30"
                        >
                          +5회
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">문의 내역이 없습니다.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block mb-1">{msg.userEmail} · {new Date(msg.createdAt).toLocaleString()}</span>
                    <h3 className="text-lg font-bold text-gray-800">{msg.subject}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${msg.status === 'replied' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {msg.status === 'replied' ? '답변완료' : '답변대기'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 text-sm whitespace-pre-wrap">{msg.content}</p>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <textarea 
                    placeholder="답장 내용을 입력하세요" rows={3}
                    defaultValue={msg.replyContent || ''}
                    onChange={e => setReplyText({...replyText, [msg.id!]: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none text-sm resize-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => handleReply(msg.id!)}
                      disabled={actionLoading === msg.id}
                      className="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      {actionLoading === msg.id ? '전송 중...' : '답장 전송'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 문의 답변 모달 */}
      {selectedMessage && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-fadeIn max-h-[90vh]">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900">문의 답변하기</h2>
                <p className="text-xs text-gray-400 mt-1">{selectedMessage.userEmail}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1 block mb-2">문의 내용</label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar text-sm">
                  <h3 className="font-bold text-gray-800 mb-2">{selectedMessage.subject}</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1 block mb-2">답변 작성</label>
                <textarea 
                  placeholder="답변 내용을 입력하세요" rows={5}
                  value={replyText[selectedMessage.id!] || ''}
                  onChange={e => setReplyText({...replyText, [selectedMessage.id!]: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none text-sm resize-none focus:ring-2 focus:ring-[#03c75a] transition-all"
                />
              </div>
              <div className="flex gap-4 sticky bottom-0 bg-white pt-2">
                <button onClick={() => setSelectedMessage(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">취소</button>
                <button 
                  onClick={() => handleReply(selectedMessage.id!)}
                  disabled={actionLoading === selectedMessage.id || !replyText[selectedMessage.id!]}
                  className="flex-[2] py-4 bg-[#03c75a] text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-[#02b351] transition-all disabled:opacity-50"
                >
                  {actionLoading === selectedMessage.id ? '전송 중...' : '답변 보내기'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPage;
