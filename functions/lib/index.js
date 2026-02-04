"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNaverToken = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
admin.initializeApp();
exports.verifyNaverToken = functions.https.onCall(async (request) => {
    const { accessToken } = request.data;
    if (!accessToken) {
        throw new functions.https.HttpsError("invalid-argument", "AccessToken이 없습니다.");
    }
    try {
        // 1. 네이버 API를 통해 사용자 정보 가져오기 (검증)
        const naverResponse = await axios_1.default.get("https://openapi.naver.com/v1/nid/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const { resultcode, response } = naverResponse.data;
        if (resultcode !== "00") {
            throw new functions.https.HttpsError("unauthenticated", "네이버 인증 실패");
        }
        const naverUid = `naver:${response.id}`;
        const email = response.email;
        const displayName = response.name || response.nickname || "";
        console.log(`[NaverAuth] UID: ${naverUid}, Email: ${email}, Name: ${displayName}`);
        if (!email) {
            console.error("[NaverAuth] Email is missing from Naver response. Check Naver Dev Center permissions.");
            // 이메일이 없으면 에러를 던져서 식별자 없는 유저 생성을 방지합니다.
            throw new functions.https.HttpsError("invalid-argument", "네이버 계정에 이메일 정보가 없습니다. 이메일 제공에 동의해주세요.");
        }
        // 2. Firebase Auth 유저 레코드 생성 또는 업데이트
        try {
            const userRecord = await admin.auth().getUser(naverUid).catch(() => null);
            if (userRecord) {
                // 기존 유저 정보 업데이트
                await admin.auth().updateUser(naverUid, {
                    email: email,
                    emailVerified: true,
                    displayName: displayName,
                    photoURL: response.profile_image || undefined
                });
                console.log(`[NaverAuth] Updated existing user record: ${naverUid}`);
            }
            else {
                // 새 유저 생성
                await admin.auth().createUser({
                    uid: naverUid,
                    email: email,
                    emailVerified: true,
                    displayName: displayName,
                    photoURL: response.profile_image || undefined
                });
                console.log(`[NaverAuth] Created new user record: ${naverUid}`);
            }
        }
        catch (error) {
            console.error(`[NaverAuth] Auth Record Error: ${error.message}`);
            // 이메일 중복 등의 치명적인 에러는 무시하지 않고 throw하여 클라이언트가 알 수 있게 합니다.
            if (error.code === 'auth/email-already-in-use') {
                throw new functions.https.HttpsError("already-exists", "이미 사용 중인 이메일입니다. 다른 방법으로 로그인해주세요.");
            }
            throw new functions.https.HttpsError("internal", "사용자 계정 생성 중 오류가 발생했습니다: " + error.message);
        }
        // 3. Firestore에서 가입된 유저인지 확인
        const userDoc = await admin.firestore().collection("users").doc(naverUid).get();
        const isRegistered = userDoc.exists;
        // 4. Firebase 커스텀 토큰 생성
        const customToken = await admin.auth().createCustomToken(naverUid, {
            provider: "naver.com",
        });
        return { customToken, email, isRegistered, naverResponse: response };
    }
    catch (error) {
        console.error("Naver verification error:", error);
        throw new functions.https.HttpsError("internal", error.message || "인증 처리 중 오류가 발생했습니다.");
    }
});
//# sourceMappingURL=index.js.map