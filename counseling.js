import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyDDv6vVR1NHSgl8ZWHBZDqYqdWDHfX8KHM",
  authDomain: "wolf-rent-28e6c.firebaseapp.com",
  projectId: "wolf-rent-28e6c",
  storageBucket: "wolf-rent-28e6c.firebasestorage.app",
  messagingSenderId: "516126424503",
  appId: "1:516126424503:web:0a08118517990925883c32",
  measurementId: "G-R8JKZ86N6N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM 요소 참조
const counselingForm = document.getElementById("counseling-form");
const messagesContainer = document.getElementById("messages");

// 로그인 상태 확인 및 메시지 로드
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("ログインユーザー:", user);
    await loadCounselingMessages(user.uid);

    // 상담 제출 이벤트 핸들러 추가
    counselingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const messageInput = document.getElementById("message");
      const message = messageInput.value.trim();

      if (!message) {
        alert("メッセージを入力してください。");
        return;
      }

      try {
        await addDoc(collection(db, "counseling"), {
          userId: user.uid,
          userName: user.displayName || "匿名",
          message: message,
          timestamp: new Date() // 현재 시간
        });

        alert("カウンセリングが正常に提出されました。");
        messageInput.value = ""; // 입력 필드 초기화
        await loadCounselingMessages(user.uid); // 메시지 다시 로드
      } catch (error) {
        console.error("カウンセリングの送信中のエラー:", error);
        alert("相談の提出に失敗しました。もう一度お試しください。");
      }
    });
  } else {
    console.log("ログインしていない");
    messagesContainer.innerHTML = "<p>ログイン後、相談履歴を確認してください。</p>";
  }
});

// Firestore에서 고민 메시지와 답변 로드
async function loadCounselingMessages(userId) {
  const q = query(collection(db, "counseling"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  messagesContainer.innerHTML = ""; // 기존 메시지 초기화
  if (querySnapshot.empty) {
    messagesContainer.innerHTML = "<p>相談記録はありません。</p>";
    return;
  }

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const messageItem = document.createElement("div");
    messageItem.className = "message-card";

    // 고민 메시지 표시
    messageItem.innerHTML = `
      <p><strong>📩 悩む:</strong> ${data.message}</p>
      <p><strong>🕒 日付:</strong> ${new Date(data.timestamp.toDate()).toLocaleString()}</p>
    `;

    // 답변이 있을 경우 표시
    if (data.답변) {
      messageItem.innerHTML += `
        <p class="reply"><strong>💬 回答:</strong> ${data.답변}</p>
      `;
    } else {
      messageItem.innerHTML += `
        <p class="reply"><em>まだ回答がありません.</em></p>
      `;
    }

    messagesContainer.appendChild(messageItem);
  });
}
