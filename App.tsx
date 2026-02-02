import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppStep, PhotoData, BlogInfo, BlogType, GeneratedBlog } from './types';
import StepProgress from './components/StepProgress';
import LoginForm from './components/LoginForm';
import AdminPage from './components/AdminPage';
import MessageCenter from './components/MessageCenter';
import LandingPage from './components/LandingPage';
import { useAuth } from './context/AuthContext';
import { generateBlogPost } from './services/geminiService';
import { subscribeUserMessages, Message } from './services/messageService';

const MainApp: React.FC = () => {
  const { user, credits, isInfinite, isAdmin, loading, signOut, useBlogCredit, refundBlogCredit } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_TYPE);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [blogInfo, setBlogInfo] = useState<BlogInfo>({
    type: BlogType.RESTAURANT,
    name: '', location: '', mainMenu: '', subject: '', category: '', mood: '', specialNotes: '', rating: 4
  });

  const [generatedPost, setGeneratedPost] = useState<GeneratedBlog | null>(null);

  useEffect(() => {
    if (user && !isAdmin) {
      const unsub = subscribeUserMessages(user.uid, (msgs) => {
        const unread = msgs.filter(m => m.status === 'replied' && !m.userRead).length;
        setUnreadCount(unread);
      });
      return () => unsub();
    }
  }, [user, isAdmin]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const newPhotos: PhotoData[] = [];
      for (const file of filesArray) {
        const resizedBase64 = await resizeImage(file);
        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: resizedBase64,
          base64: resizedBase64
        });
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const generateBlog = async () => {
    if (!isInfinite && credits < 1) {
      alert('블로그 작성권이 부족합니다. 포인트를 충전해주세요.');
      return;
    }
    if (blogInfo.type === BlogType.RESTAURANT) {
      if (!blogInfo.name || !blogInfo.location) {
        alert('식당 이름과 위치는 필수 정보입니다.');
        return;
      }
    } else {
      if (!blogInfo.subject || !blogInfo.category) {
        alert('주제와 카테고리는 필수 정보입니다.');
        return;
      }
    }

    const used = await useBlogCredit();
    if (!used) {
      alert('블로그 작성권 사용에 실패했습니다. 잔여 포인트를 확인해주세요.');
      return;
    }

    setStep(AppStep.GENERATING);
    try {
      const blog = await generateBlogPost(blogInfo, photos);
      setGeneratedPost(blog);
      setStep(AppStep.RESULT);
    } catch (error) {
      await refundBlogCredit();
      alert('오류가 발생했습니다. 작성권이 반환되었습니다. 다시 시도해주세요.');
      setStep(AppStep.INFO);
    }
  };

  const resetApp = () => {
    setStep(AppStep.SELECT_TYPE);
    setPhotos([]);
    setBlogInfo({
      type: BlogType.RESTAURANT,
      name: '', location: '', mainMenu: '', subject: '', category: '', mood: '', specialNotes: '', rating: 4
    });
    setGeneratedPost(null);
  };

  const isRestaurant = blogInfo.type === BlogType.RESTAURANT;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03c75a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center py-8 px-4">
        <header className="w-full max-w-4xl mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#03c75a] rounded-lg flex items-center justify-center text-white text-xl">
              <i className="fas fa-pen-nib"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">AI 블로그 오토라이터</h1>
          </div>
        </header>
        <main className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] border border-gray-100">
          <LoginForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center py-8 px-4">
      <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
          <div className="w-10 h-10 bg-[#03c75a] rounded-lg flex items-center justify-center text-white text-xl">
            <i className="fas fa-pen-nib"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AI 블로그 오토라이터</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMessageCenter(true)}
            className="w-10 h-10 bg-white border border-gray-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:text-[#03c75a] transition-all relative"
            title="제작자에게 문의하기"
          >
            <i className="fas fa-envelope"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#f8f9fb] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 bg-[#03c75a]/10 text-[#03c75a] px-4 py-2 rounded-2xl font-bold">
            <i className="fas fa-coins"></i>
            <span>{isInfinite ? '무제한 작성 가능' : `작성권 ${credits}회`}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all"
            >
              <i className="fas fa-user-shield mr-2"></i> 관리자
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {showMessageCenter && <MessageCenter onClose={() => setShowMessageCenter(false)} />}

      {step !== AppStep.SELECT_TYPE && <StepProgress currentStep={step} />}

      <main className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-gray-100 transition-all duration-500">
        
        {/* Step 0: Select Type */}
        {step === AppStep.SELECT_TYPE && (
          <div className="p-10 animate-fadeIn flex flex-col items-center justify-center h-full min-h-[600px]">
            <h2 className="text-3xl font-black mb-2 text-gray-900 text-center">어떤 주제의 글을 쓸까요?</h2>
            <p className="text-gray-500 mb-12 text-center">원하시는 블로그 테마를 선택해주세요.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button 
                onClick={() => { setBlogInfo({...blogInfo, type: BlogType.RESTAURANT}); setStep(AppStep.UPLOAD); }}
                className="group p-8 rounded-[2rem] border-2 border-gray-100 hover:border-[#03c75a] hover:bg-green-50 transition-all text-left flex flex-col items-start"
              >
                <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-utensils"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">오늘의 맛집 리뷰</h3>
                <p className="text-gray-400 text-sm leading-relaxed">식당 이름, 위치, 메뉴 정보를 바탕으로 생생한 맛집 블로그를 작성합니다.</p>
              </button>

              <button 
                onClick={() => { setBlogInfo({...blogInfo, type: BlogType.GENERAL}); setStep(AppStep.UPLOAD); }}
                className="group p-8 rounded-[2rem] border-2 border-gray-100 hover:border-[#03c75a] hover:bg-green-50 transition-all text-left flex flex-col items-start"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">자유 주제/일상 리뷰</h3>
                <p className="text-gray-400 text-sm leading-relaxed">일상 기록, 제품 사용기, 여행 후기 등 다양한 주제의 글을 작성합니다.</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === AppStep.UPLOAD && (
          <div className="p-10 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {isRestaurant ? "생생한 식당 사진을 올려주세요" : "관련된 사진을 올려주세요"}
            </h2>
            <p className="text-gray-500 mb-8">AI가 사진을 분석하여 더 풍성한 글을 작성해드립니다.</p>
            <div 
              className="border-4 border-dashed border-gray-100 rounded-[2rem] p-16 bg-gray-50 text-center cursor-pointer hover:bg-green-50 hover:border-[#03c75a]/30 transition-all group"
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              <i className="fas fa-images text-5xl text-gray-200 mb-6 group-hover:text-[#03c75a]/50 transition-colors"></i>
              <p className="text-xl font-bold text-gray-700">여기를 클릭하여 사진 추가</p>
              <p className="text-sm text-gray-400 mt-2">최대 10장까지 추천합니다.</p>
              <input id="photo-input" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            {photos.length > 0 && (
              <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {photos.map(p => (
                  <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border shadow-sm group">
                    <img src={p.previewUrl} className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(photos.filter(x => x.id !== p.id))} className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-lg text-xs hover:bg-red-500 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-10 flex gap-4">
              <button onClick={() => setStep(AppStep.SELECT_TYPE)} className="flex-1 p-5 bg-white border border-gray-100 text-gray-400 font-bold rounded-2xl transition-all hover:bg-gray-50">이전 단계</button>
              <button 
                onClick={() => setStep(AppStep.INFO)} 
                disabled={photos.length === 0} 
                className="flex-[2] bg-[#03c75a] text-white font-bold py-5 rounded-2xl shadow-lg shadow-green-100 disabled:bg-gray-200 disabled:shadow-none transition-all hover:bg-[#02b351]"
              >
                정보 입력하러 가기 <i className="fas fa-chevron-right ml-2 text-sm"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Info */}
        {step === AppStep.INFO && (
          <div className="p-10 animate-fadeIn h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">{isRestaurant ? "식당 특징 입력" : "주제 및 특징 입력"}</h2>
            
            <div className="space-y-6">
              {isRestaurant ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">식당 이름 <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="예: 성수 비보 (VIVO)" value={blogInfo.name} onChange={e => setBlogInfo({...blogInfo, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">지역/위치 <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="예: 서울 성동구 연무장길" value={blogInfo.location} onChange={e => setBlogInfo({...blogInfo, location: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">드셨던 주요 메뉴</label>
                    <input type="text" placeholder="예: 비보 피자, 라구 파스타" value={blogInfo.mainMenu} onChange={e => setBlogInfo({...blogInfo, mainMenu: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">글 제목 또는 주제 <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="예: 아이폰 15 프로 사용후기" value={blogInfo.subject} onChange={e => setBlogInfo({...blogInfo, subject: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">카테고리 <span className="text-red-500">*</span></label>
                      <select value={blogInfo.category} onChange={e => setBlogInfo({...blogInfo, category: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all appearance-none">
                        <option value="">카테고리 선택</option>
                        <option value="일상">일상/생각</option>
                        <option value="제품리뷰">IT/제품 리뷰</option>
                        <option value="여행">국내/해외 여행</option>
                        <option value="패션">패션/뷰티</option>
                        <option value="취미">취미/운동</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">분위기 또는 특징</label>
                <input type="text" placeholder={isRestaurant ? "예: 힙한 느낌, 조용한, 데이트 코스" : "예: 가성비 좋은, 감성 넘치는, 실용적인"} value={blogInfo.mood} onChange={e => setBlogInfo({...blogInfo, mood: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">나만의 특별한 메모</label>
                <textarea placeholder="직접 느꼈던 점을 자유롭게 적어주세요. AI가 자연스럽게 문장으로 녹여냅니다." rows={4} value={blogInfo.specialNotes} onChange={e => setBlogInfo({...blogInfo, specialNotes: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none resize-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-gray-700">추천 평점</label>
                  <span className="text-xl font-black text-[#03c75a]">{blogInfo.rating} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" step="0.5" 
                  value={blogInfo.rating} 
                  onChange={e => setBlogInfo({...blogInfo, rating: parseFloat(e.target.value)})} 
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#03c75a]" 
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={() => setStep(AppStep.UPLOAD)} className="flex-1 p-5 bg-white border border-gray-100 text-gray-400 font-bold rounded-2xl transition-all hover:bg-gray-50">이전 단계</button>
              <button 
                onClick={generateBlog} 
                disabled={!isInfinite && credits < 1}
                className="flex-[2] bg-[#03c75a] text-white font-bold py-5 rounded-2xl shadow-lg shadow-green-100 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:bg-[#02b351] active:scale-95"
              >
                {!isInfinite && credits < 1 ? (
                  <>작성권 부족 <i className="fas fa-exclamation-circle ml-2"></i></>
                ) : (
                  <>블로그 작성 시작 <i className="fas fa-magic ml-2"></i></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === AppStep.GENERATING && (
          <div className="p-10 flex flex-col items-center justify-center h-[600px] animate-fadeIn">
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-8 border-green-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-[#03c75a] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-[#03c75a] text-4xl">
                <i className="fas fa-pen-fancy animate-pulse"></i>
              </div>
            </div>
            <h2 className="text-2xl font-black mb-3">포스팅을 정성껏 쓰고 있어요</h2>
            <p className="text-gray-400 text-center leading-relaxed">
              검색을 통해 최신 정보를 확인하고<br/>사진과 함께 풍성한 글을 만드는 중입니다.
            </p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === AppStep.RESULT && generatedPost && (
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 z-20 bg-white/90 backdrop-blur-md">
              <div className="flex gap-3">
                <button onClick={() => {
                  const text = `${generatedPost.title}\n\n` + generatedPost.sections.map(s => s.content).join('\n\n');
                  navigator.clipboard.writeText(text);
                  alert('텍스트가 복사되었습니다!');
                }} className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-bold text-sm shadow-sm transition-all hover:bg-gray-900 active:scale-95">전체 텍스트 복사</button>
                <button onClick={resetApp} className="px-6 py-3 bg-white border border-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">새 글 쓰기</button>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full">
                {isRestaurant ? '맛집 리뷰 완성' : '블로그 포스팅 완성'}
              </span>
            </div>

            <div className="p-10 overflow-y-auto">
              <article className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-black text-center mb-16 leading-tight break-keep">{generatedPost.title}</h1>
                
                <div className="space-y-12">
                  {generatedPost.sections.map((s, i) => (
                    <div key={i}>
                      {s.type === 'subtitle' && <h2 className="text-2xl font-bold text-[#03c75a] mt-12 mb-6">{s.content}</h2>}
                      {s.type === 'text' && <p className="text-lg leading-[1.8] text-gray-700 whitespace-pre-wrap font-normal">{s.content}</p>}
                      {s.type === 'image' && (
                        <div className="my-10 text-center group">
                          {s.imageIndex !== undefined && photos[s.imageIndex] && (
                            <div className="relative overflow-hidden rounded-3xl shadow-lg border border-gray-100">
                              <img src={photos[s.imageIndex].previewUrl} className="w-full h-auto" />
                            </div>
                          )}
                          <p className="mt-4 text-gray-400 italic text-sm font-medium">{s.content}</p>
                        </div>
                      )}
                      {s.type === 'summary' && (
                        <div className="bg-[#f2fcf6] p-10 rounded-[2.5rem] border border-[#03c75a]/10 my-16 shadow-inner text-center">
                          <h3 className="text-xl font-black text-[#03c75a] mb-6 flex items-center justify-center gap-2">
                            <i className="fas fa-heart text-red-400"></i> 요약 및 한 줄 평
                          </h3>
                          <p className="text-[#2d5a42] text-lg leading-[1.8] font-medium italic">"{s.content}"</p>
                          <div className="mt-8 flex justify-center text-2xl text-yellow-400">
                            {[...Array(5)].map((_, idx) => (
                              <i key={idx} className={`fas fa-star ${idx < Math.floor(blogInfo.rating) ? '' : 'text-gray-200'}`}></i>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-20 pt-10 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 mb-10">
                    {generatedPost.tags.map(t => <span key={t} className="text-gray-400 font-medium">#{t.replace('#','')}</span>)}
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const AdminWrapper: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center py-8 px-4">
      <main className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-gray-100">
        <AdminPage onBack={() => navigate('/')} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/write" element={<MainApp />} />
      <Route path="/admin" element={<AdminWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
