import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NaverCallback: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithNaver, user: currentUser, loading: authLoading } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    // Firebase 인증 상태 로딩 중이면 대기
    if (authLoading) return;

    // 이미 로그인된 상태라면 바로 이동
    if (currentUser) {
      console.log("User already logged in, redirecting...");
      navigate("/write");
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    const naverLogin = new (window as any).naver.LoginWithNaverId({
      clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
      callbackUrl: window.location.origin + "/callback",
    });
    naverLogin.init();

    naverLogin.getLoginStatus(async (status: boolean) => {
      if (status) {
        const naverUser = naverLogin.user;
        console.log("Naver user data fetched:", { email: naverUser.email, id: !!naverUser.id });
        
        if (naverUser.email && naverUser.id) {
          try {
            // 로그인 시도
            await signInWithNaver(naverUser.email, naverUser.id);
            console.log("Firebase login success via Naver");
            navigate("/write");
          } catch (err: any) {
            console.error("Firebase login failed:", err.code, err.message);
            
            // 가입 정보가 없거나 기타 에러인 경우 회원가입 유도
            const userData = {
              email: naverUser.email,
              id: naverUser.id,
              name: naverUser.name || "",
              nickname: naverUser.nickname || "",
            };
            sessionStorage.setItem("pendingNaverUser", JSON.stringify(userData));

            // 회원가입 모달 트리거
            navigate("/write", { state: { showSnsSignUp: true } });
          }
        } else {
          console.error("Naver user data incomplete");
          alert("네이버 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
          navigate("/");
        }
      } else {
        console.error("Naver SDK: Login status is false");
        navigate("/");
      }
    });
  }, [navigate, signInWithNaver, currentUser, authLoading]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#03c75a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">네이버 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default NaverCallback;
