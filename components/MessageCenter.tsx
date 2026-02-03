import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessage, subscribeUserMessages, Message, markMessageAsRead } from '../services/messageService';

const MessageCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'list' | 'write'>('list');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const unsub = subscribeUserMessages(user.uid, (msgs) => {
        setMessages(msgs);
        // 안 읽은 답변이 있으면 읽음 처리
        msgs.forEach(msg => {
          if (msg.status === 'replied' && !msg.userRead && msg.id) {
            markMessageAsRead(msg.id);
          }
        });
      });
      return () => unsub();
    }
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await sendMessage(user.uid, user.email || '', subject, content);
      alert('문의가 성공적으로 전달되었습니다.');
      setSubject('');
      setContent('');
      setView('list');
    } catch (err) {
      alert('전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900">제작자에게 문의하기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === 'list' ? (
            <div className="space-y-4">
              <button 
                onClick={() => setView('write')}
                className="w-full py-4 bg-[#03c75a] text-white rounded-2xl font-bold shadow-lg shadow-green-100 mb-6 hover:bg-[#02b351] transition-all"
              >
                <i className="fas fa-paper-plane mr-2"></i> 새 문의 작성하기
              </button>
              
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400">문의 내역이 없습니다.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800">{msg.subject}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${msg.status === 'replied' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                        {msg.status === 'replied' ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.replyContent && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-sm">
                          <i className="fas fa-reply"></i> 관리자 답변
                        </div>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{msg.replyContent}</p>
                      </div>
                    )}
                    <div className="mt-4 text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1 block mb-1">제목</label>
                <input 
                  type="text" placeholder="제목을 입력하세요" required 
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1 block mb-1">내용</label>
                <textarea 
                  placeholder="내용을 입력하세요" required rows={6}
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] resize-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setView('list')} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">취소</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-[#03c75a] text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-[#02b351] transition-all disabled:opacity-50">
                  {loading ? '전송 중...' : '보내기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
