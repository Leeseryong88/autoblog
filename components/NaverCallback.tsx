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
        const accessToken = (naverLogin as any).accessToken.accessToken;
        console.log("Naver user data fetched, attempting Firebase login...");
        
        if (accessToken) {
          try {
            // 로그인 시도 (정석적인 방법: accessToken 전달)
            await signInWithNaver(accessToken);
            console.log("Firebase login success via Naver Custom Token");
            navigate("/write");
          } catch (err: any) {
            console.error("Firebase login failed:", err.code, err.message);
            
            if (err.code === "already-exists") {
              alert("이미 가입된 이메일입니다. 다른 방법으로 로그인해주세요.");
              navigate("/");
              return;
            }

            if (err.code === "invalid-argument") {
              alert(err.message);
              navigate("/");
              return;
            }
            
            // 가입 정보가 없거나 기타 에러인 경우 회원가입 유도
            const userData = {
              email: naverUser.email,
              id: naverUser.id,
              name: naverUser.name || "",
              nickname: naverUser.nickname || "",
              accessToken: accessToken, // 회원가입 시 필요
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
