import React, { useEffect } from "react";

const NaverLoginButton: React.FC = () => {
  useEffect(() => {
    const naverLogin = new (window as any).naver.LoginWithNaverId({
      clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
      callbackUrl: window.location.origin + "/callback",
      isPopup: false,
      loginButton: { color: "green", type: 3, height: 55 },
    });
    naverLogin.init();
  }, []);

  return (
    <div id="naverIdLogin" className="flex justify-center my-4 overflow-hidden rounded-2xl" />
  );
};

export default NaverLoginButton;
