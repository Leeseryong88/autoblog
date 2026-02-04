import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NaverLoginButton from "./NaverLoginButton";
import SnsSignUp from "./SnsSignUp";

type Mode = "login" | "signup";

const LoginForm: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showSnsSignUp, setShowSnsSignUp] = useState(false);

  useEffect(() => {
    if (location.state?.showSnsSignUp) {
      setShowSnsSignUp(true);
      // 상태 처리 후 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { signOut } = useAuth();

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-10 animate-fadeIn">
      <div className="text-center mb-8 md:mb-10">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#03c75a] rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-4 md:mb-6">
          <i className="fas fa-pen-nib"></i>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
          로그인
        </h2>
        <p className="text-gray-500 text-xs md:text-sm">
          네이버 로그인을 통해 간편하게 시작해보세요.<br/>
          첫 가입 시 1000포인트를 드려요!
        </p>
      </div>

      <div className="space-y-4">
        <NaverLoginButton />
      </div>

      {/* SNS 회원가입 모달 */}
      {showSnsSignUp && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            <SnsSignUp onClose={() => setShowSnsSignUp(false)} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LoginForm;
