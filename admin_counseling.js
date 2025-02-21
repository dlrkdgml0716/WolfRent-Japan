import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
const adminMessagesContainer = document.getElementById("admin-messages");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 관리자인지 확인하는 로직
        const adminEmails = ["hermann8hesse@gmail.com", "dlrkdgml0716@gmail.com"];
        if (!adminEmails.includes(user.email)) {
            alert("管理者のみがアクセスできます。");
            window.location.href = "/index.html";
            return;
        }

        // 모든 고민 메시지 로드
        loadAllCounselingMessages();
    } else {
        alert("ログイン後に利用可能です。");
        window.location.href = "/login.html";
    }
});

// Firestore에서 모든 고민 불러오기
async function loadAllCounselingMessages() {
    const querySnapshot = await getDocs(collection(db, "counseling"));
    adminMessagesContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const messageId = doc.id;

        // 고민 메시지 카드 생성
        const messageItem = document.createElement("div");
        messageItem.className = "message-card";
        messageItem.innerHTML = `
          <strong>${data.userName}:</strong> ${data.message}
          <p><strong>現在の回答:</strong> ${data.답변 || "まだ答えがありません。"}</p>
          <textarea id="reply-${messageId}" placeholder="答えを入力してください"></textarea>
          <button onclick="submitReply('${messageId}')">回答を保存</button>
        `;
        adminMessagesContainer.appendChild(messageItem);
    });
}

// Firestore에 답변 업데이트
window.submitReply = async function (messageId) {
    const replyText = document.getElementById(`reply-${messageId}`).value.trim();
    if (!replyText) {
        alert("答えを入力してください。");
        return;
    }

    try {
        const messageRef = doc(db, "counseling", messageId);
        await updateDoc(messageRef, { 답변: replyText });
        alert("答えが保存されました。");
        loadAllCounselingMessages(); // 새로고침
    } catch (error) {
        console.error("回答の保存中のエラー:", error);
        alert("回答の保存に失敗しました。");
    }
};
