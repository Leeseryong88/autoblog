import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TERMS_CONTENT = {
  terms: `제 1 조 (목적)
본 약관은 AI 블로그 오토라이터(이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.

제 2 조 (AI 생성물에 대한 책임)
1. 본 서비스는 인공지능 기술을 활용하여 텍스트를 생성합니다. 생성된 결과물의 정확성이나 완성도를 보장하지 않습니다.
2. 이용자는 AI가 생성한 콘텐츠를 최종적으로 검토하고 수정할 책임이 있으며, 결과물 활용으로 인해 발생하는 모든 책임은 이용자에게 있습니다.

제 3 조 (이용권 사용)
1. 서비스 이용을 위해서는 정해진 이용권(작성권)이 차감됩니다.
2. 시스템 오류로 인해 생성이 실패한 경우에 한하여 작성권이 반환될 수 있습니다.`,
  privacy: `1. 수집하는 개인정보 항목
- 필수: 이메일 주소, 네이버 고유 식별 번호

2. 개인정보의 수집 및 이용 목적
- 서비스 회원 가입 및 관리
- 블로그 포스팅 생성 서비스 제공
- 포인트(작성권) 관리 및 고객 응대

3. 개인정보의 보유 및 이용 기간
- 서비스 탈퇴 시까지 또는 법정 보존 기간 동안 보유합니다.`,
  age: `본 서비스는 개인정보 보호법 및 관계 법령에 따라 만 14세 미만 아동의 가입을 제한하고 있습니다. 가입을 진행함으로써 귀하는 만 14세 이상임을 확인합니다.`
};

interface SnsSignUpProps {
  onClose: () => void;
}

const SnsSignUp: React.FC<SnsSignUpProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { signUpWithNaver } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    id: ""
  });
  
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    age: false
  });
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    const pendingUser = sessionStorage.getItem("pendingNaverUser");
    if (!pendingUser) {
      onClose();
      return;
    }
    const user = JSON.parse(pendingUser);
    setFormData({
      email: user.email || "",
      id: user.id || ""
    });
  }, [onClose]);

  const handleAllAgree = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      age: checked
    });
  };

  const handleSingleAgree = (key: keyof typeof agreements, checked: boolean) => {
    const nextAgreements = { ...agreements, [key]: checked };
    const allChecked = nextAgreements.terms && nextAgreements.privacy && nextAgreements.age;
    setAgreements({ ...nextAgreements, all: allChecked });
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.id) {
      alert("네이버 인증 정보가 누락되었습니다. 다시 로그인해주세요.");
      onClose();
      return;
    }

    if (!agreements.terms || !agreements.privacy || !agreements.age) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    
    setLoading(true);
    try {
      await signUpWithNaver(formData.email, formData.id);
      alert("회원가입이 완료되었습니다!\n이용권 5회가 지급되었습니다.");
      sessionStorage.removeItem("pendingNaverUser");
      onClose();
      navigate("/write");
    } catch (err: any) {
      if (err.message === "ALREADY_EXISTS") {
        alert("이미 등록된 계정이 있습니다. 로그인을 시도해주세요.");
        onClose();
      } else {
        alert(err.message || "회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-10">
      <div className="text-center mb-8 relative">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">SNS 아이디로 회원가입 할게요</h2>
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 text-gray-400 hover:text-gray-600 p-2"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-bold text-gray-400 ml-1 block mb-2">* 이메일</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="w-full p-4 bg-gray-100 text-gray-500 rounded-2xl border-none outline-none cursor-not-allowed text-sm"
          />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
          <input
            type="checkbox"
            checked={agreements.all}
            onChange={(e) => handleAllAgree(e.target.checked)}
            className="w-5 h-5 accent-[#03c75a]"
          />
          <span className="text-sm font-bold text-gray-700">전체동의</span>
        </label>
        
        <div className="space-y-3 px-2">
          {[
            { key: "terms", label: "(필수) 서비스 이용약관", title: "서비스 이용약관" },
            { key: "privacy", label: "(필수) 개인정보 수집 및 이용약관", title: "개인정보 수집 및 이용약관" },
            { key: "age", label: "(필수) 만 14세 이상 서비스 이용 동의", title: "만 14세 이상 서비스 이용 동의" }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements[item.key as keyof typeof agreements]}
                  onChange={(e) => handleSingleAgree(item.key as keyof typeof agreements, e.target.checked)}
                  className="w-4 h-4 accent-[#03c75a]"
                />
                <span className="text-xs text-blue-500">{item.label}</span>
              </label>
              <button 
                type="button"
                onClick={() => setShowModal({ title: item.title, content: TERMS_CONTENT[item.key as keyof typeof TERMS_CONTENT] })}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline"
              >
                보기
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSignUp}
        disabled={loading}
        className="w-full py-4 bg-[#03c75a] text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all hover:bg-[#02b351] active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "처리 중..." : "가입하기"}
      </button>

      {/* 약관 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-gray-900">{showModal.title}</h3>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {showModal.content}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button 
                onClick={() => setShowModal(null)}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnsSignUp;
