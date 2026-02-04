import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate('/write');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#03c75a] rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-green-100">
              <i className="fas fa-pen-nib"></i>
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">오토라이터</span>
          </div>
          <button 
            onClick={handleStart}
            className="px-6 py-2.5 bg-[#03c75a] text-white rounded-full font-bold text-sm hover:bg-[#02b351] transition-all shadow-md shadow-green-100"
          >
            {user ? '내 대시보드' : '무료로 시작하기'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-green-50 text-[#03c75a] rounded-full text-xs md:text-sm font-bold mb-6 animate-bounce">
            AI 기반 스마트 블로깅 솔루션
          </div>
          <h1 className="text-4xl md:text-7xl font-black leading-[1.2] md:leading-[1.1] mb-6 md:mb-8 tracking-tight break-keep">
            사진만 올리세요.<br/>
            <span className="text-[#03c75a]">완벽한 블로그</span>는 AI가 씁니다.
          </h1>
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm md:text-base border border-orange-100 shadow-sm">
              <i className="fas fa-coffee"></i>
              <span>커피 한 잔 값으로 실현하는 완벽한 1일 1포스팅</span>
            </div>
          </div>
          <p className="text-base md:text-xl text-gray-500 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            단순한 글쓰기가 아닙니다. 최신 블로그 트렌드를 실시간으로 참조하여 
            당신의 일상을 가장 매력적인 포스팅으로 탈바꿈시킵니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 md:px-0">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-[#03c75a] text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl hover:scale-105 transition-all shadow-xl shadow-green-200"
            >
              지금 바로 글쓰기 <i className="fas fa-magic ml-2"></i>
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm md:text-base font-medium">
              <i className="fas fa-check-circle text-[#03c75a]"></i> 이메일 인증 시 1000포인트 즉시 지급
            </div>
          </div>
        </div>
      </section>

      {/* Key Feature: Reference Analysis */}
      <section className="py-16 md:py-24 bg-[#f8f9fb]">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes search-rotate {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(10deg) scale(1.1); }
            75% { transform: rotate(-10deg) scale(1.1); }
            100% { transform: rotate(0deg) scale(1); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-search-rotate {
            animation: search-rotate 4s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          .animate-scroll-up {
            animation: scroll-up 20s linear infinite;
          }
          .animate-scroll-up:hover {
            animation-play-state: paused;
          }
          .mask-fade-y {
            mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          }
        `}} />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-2xl border border-gray-100 group animate-float overflow-hidden">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl animate-search-rotate">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-lg md:text-xl font-black">실시간 레퍼런스 분석 중...</h3>
                </div>
                
                <div className="relative">
                  <div className="h-64 md:h-80 overflow-hidden relative border-y border-gray-50 my-2 mask-fade-y">
                    <div className="space-y-4 py-4 animate-scroll-up">
                      {/* First set of items */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">네이버 블로그 레퍼런스 수집</span>
                              <span className="text-[10px] md:text-xs font-bold text-blue-500">84%</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="pl-5 space-y-2 border-l-2 border-gray-50 ml-1">
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-blue-300"></i>
                            <span>"인생 파스타", "친절한 서비스" 키워드 추출</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-blue-300"></i>
                            <span>메뉴판 이미지 데이터 매칭 완료 (봉골레 외 12종)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">블로그 지수 최적화 분석</span>
                              <span className="text-[10px] md:text-xs font-bold text-[#03c75a]">진행 중</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-[#03c75a] rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 pl-5">
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          <span>사용자 맞춤형 '친근한 언니' 말투 적용 분석 중...</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">이미지 구도 및 색감 분석</span>
                              <span className="text-[10px] md:text-xs font-bold text-purple-500">완료</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="pl-5 space-y-2 border-l-2 border-gray-50 ml-1">
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-purple-300"></i>
                            <span>인스타 감성 필터링 및 조명 분석 완료</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-purple-300"></i>
                            <span>메인 요리 중심 최적 구도 8개 선별</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">방문자 반응 예측 시뮬레이션</span>
                              <span className="text-[10px] md:text-xs font-bold text-orange-500">분석 중</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Second set of items (Clone for infinite scroll) */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">네이버 블로그 레퍼런스 수집</span>
                              <span className="text-[10px] md:text-xs font-bold text-blue-500">84%</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="pl-5 space-y-2 border-l-2 border-gray-50 ml-1">
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-blue-300"></i>
                            <span>"인생 파스타", "친절한 서비스" 키워드 추출</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-blue-300"></i>
                            <span>메뉴판 이미지 데이터 매칭 완료 (봉골레 외 12종)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">블로그 지수 최적화 분석</span>
                              <span className="text-[10px] md:text-xs font-bold text-[#03c75a]">진행 중</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-[#03c75a] rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 pl-5">
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          <span>사용자 맞춤형 '친근한 언니' 말투 적용 분석 중...</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] md:text-xs font-bold text-gray-400">이미지 구도 및 색감 분석</span>
                              <span className="text-[10px] md:text-xs font-bold text-purple-500">완료</span>
                            </div>
                            <div className="h-1.5 md:h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="pl-5 space-y-2 border-l-2 border-gray-50 ml-1">
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-purple-300"></i>
                            <span>인스타 감성 필터링 및 조명 분석 완료</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                            <i className="fas fa-check-circle text-purple-300"></i>
                            <span>메인 요리 중심 최적 구도 8개 선별</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 mt-4 flex justify-between items-center bg-white relative z-20">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-blue-500">
                      <i className="fas fa-link animate-spin-slow"></i> 관련 맛집 리뷰 1,245건 참조 완료
                    </div>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden">
                          <i className="fas fa-user text-[8px] md:text-[10px] text-gray-300"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 leading-tight break-keep">
                데이터를 근거로 쓰는<br/>
                <span className="text-blue-500">지능형 레퍼런스 참조</span>
              </h2>
              <p className="text-base md:text-lg text-gray-500 leading-[1.7] md:leading-[1.8] mb-6 md:mb-8">
                단순히 상상해서 글을 쓰지 않습니다. 수만 건의 기존 블로그 데이터를 실시간으로 분석하여 
                맛집의 분위기, 메뉴 구성, 사용자들의 실제 반응을 포스팅에 자연스럽게 녹여냅니다.
              </p>
              <ul className="space-y-3 md:space-y-4 font-bold text-gray-700 text-sm md:text-base">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px]"><i className="fas fa-check"></i></div>
                  인기 블로그 키워드 자동 분석 및 적용
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px]"><i className="fas fa-check"></i></div>
                  메뉴 이름, 가격 등 정확한 정보 대조
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px]"><i className="fas fa-check"></i></div>
                  상황별 최적화된 말투와 문체 자동 선택
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-4">왜 오토라이터인가요?</h2>
            <p className="text-sm md:text-base text-gray-500">블로거들의 고충을 해결하기 위해 태어났습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-8 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 text-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl mb-6 md:mb-8">
                <i className="fas fa-camera"></i>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">시각적 분석 기술</h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">업로드한 사진의 색감, 사물, 분위기를 AI가 시각적으로 분석하여 글에 생생함을 더합니다.</p>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#03c75a]/10 text-[#03c75a] rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl mb-6 md:mb-8">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">단 30초면 완성</h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">1시간 넘게 걸리던 포스팅 작성이 단 30초 만에 끝납니다. 당신의 소중한 시간을 아끼세요.</p>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 text-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl mb-6 md:mb-8">
                <i className="fas fa-tags"></i>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">SEO 최적화 태그</h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">검색 결과 상단 노출을 돕기 위해 최신 인기 키워드를 포함한 해시태그를 자동으로 생성합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-[#03c75a] rounded-3xl md:rounded-[3rem] p-10 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-black mb-6 md:mb-8 leading-tight break-keep">
              지금 바로 무료포인트와 함께<br/>
              시작해보세요.
            </h2>
            <button 
              onClick={handleStart}
              className="px-10 md:px-12 py-5 md:py-6 bg-white text-[#03c75a] rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl hover:bg-gray-50 transition-all shadow-xl active:scale-95"
            >
              시작하기 <i className="fas fa-arrow-right ml-2 text-xl"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#03c75a]/20 text-[#03c75a] rounded-lg flex items-center justify-center text-sm font-bold">
              <i className="fas fa-pen-nib"></i>
            </div>
            <span className="font-bold text-gray-400 text-sm tracking-tight">AI BLOG AUTOWRITER</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 AI Blog Autowriter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
