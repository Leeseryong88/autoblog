import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        alert("회원가입이 완료되었습니다! 입력하신 이메일로 인증 메일을 보냈습니다. 인증을 완료하시면 작성권 5개가 지급됩니다.");
        setMode("login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      if (typeof msg === "string" && msg.includes("auth/")) {
        if (msg.includes("user-not-found") || msg.includes("wrong-password"))
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        else if (msg.includes("email-already-in-use"))
          setError("이미 사용 중인 이메일입니다.");
        else if (msg.includes("invalid-email"))
          setError("올바른 이메일 형식을 입력해주세요.");
        else if (msg.includes("weak-password"))
          setError("비밀번호를 6자 이상 입력해주세요.");
        else setError("로그인에 실패했습니다. 다시 시도해주세요.");
      } else {
        setError("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-10 animate-fadeIn">
      <div className="text-center mb-8 md:mb-10">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#03c75a] rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-4 md:mb-6">
          <i className="fas fa-pen-nib"></i>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
          {mode === "login" ? "로그인" : "회원가입"}
        </h2>
        <p className="text-gray-500 text-xs md:text-sm">
          {mode === "login"
            ? "블로그 작성권을 사용해 AI 블로그를 작성해보세요"
            : "이메일 인증을 완료하면 작성권 5회를 바로 드려요"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <div>
          <label className="text-xs md:text-sm font-bold text-gray-700 ml-1 block mb-2">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="w-full p-4 md:p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all text-sm md:text-base"
          />
        </div>

        <div>
          <label className="text-xs md:text-sm font-bold text-gray-700 ml-1 block mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            required
            minLength={6}
            className="w-full p-4 md:p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all text-sm md:text-base"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 ml-1 block mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력"
              required
              className="w-full p-4 md:p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#03c75a] transition-all text-sm md:text-base"
            />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs md:text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 md:py-5 bg-[#03c75a] text-white font-bold rounded-2xl shadow-lg shadow-green-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:bg-[#02b351] active:scale-[0.98] text-sm md:text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner fa-spin"></i> 처리 중...
            </span>
          ) : mode === "login" ? (
            "로그인"
          ) : (
            "회원가입"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-500 text-sm">
        {mode === "login" ? (
          <>
            아직 계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className="text-[#03c75a] font-bold hover:underline"
            >
              회원가입
            </button>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-[#03c75a] font-bold hover:underline"
            >
              로그인
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default LoginForm;
