import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, getRedirectResult } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// (1) Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyDDv6vVR1NHSgl8ZWHBZDqYqdWDHfX8KHM",
  authDomain: "wolf-rent-28e6c.firebaseapp.com",
  projectId: "wolf-rent-28e6c",
  storageBucket: "wolf-rent-28e6c.firebasestorage.app",
  messagingSenderId: "516126424503",
  appId: "1:516126424503:web:0a08118517990925883c32",
  measurementId: "G-R8JKZ86N6N"
};

// (2) Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const googleLoginBtn = document.getElementById("googleLogin");

  // A. 로그인 상태 변화 감지
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("이미 로그인됨:", user);
      if (googleLoginBtn) googleLoginBtn.style.display = "none";
      showUserName(user.displayName);
    } else {
      console.log("로그인 안 됨");
      if (googleLoginBtn) googleLoginBtn.style.display = "inline-block";
    }
  });

  // B. Firebase Redirect 결과 처리
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log("리디렉트 로그인 성공:", result.user);
      if (googleLoginBtn) googleLoginBtn.style.display = "none";
      showUserName(result.user.displayName);
    }
  } catch (error) {
    console.error("로그인 오류:", error);
  }

  // C. 구글 로그인 버튼 클릭 이벤트
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", (event) => {
      event.preventDefault();
      signInWithRedirect(auth, provider); // ✅ 기본 브라우저에서 Google 로그인 창 열기
    });
  } else {
    console.error("구글 로그인 버튼을 찾을 수 없습니다.");
  }
});

// (3) 사용자 이름 표시 함수
function showUserName(name) {
  if (document.getElementById("userNameSpan")) return;

  const userNameElement = document.createElement("span");
  userNameElement.id = "userNameSpan";
  userNameElement.textContent = name;
  userNameElement.style.fontSize = "20px";
  userNameElement.style.color = "#fff";
  userNameElement.style.marginLeft = "10px";

  const googleLoginContainer = document.querySelector(".googleLogin");
  if (googleLoginContainer) {
    googleLoginContainer.appendChild(userNameElement);
  }
}

// Firestore (db)와 Firebase 관련 객체를 다른 모듈에서 사용할 수 있도록 export
export { app, auth, db };
