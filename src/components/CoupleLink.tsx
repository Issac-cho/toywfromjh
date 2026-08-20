"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, collection } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { Link2, Copy, CheckCircle2 } from "lucide-react";

export default function CoupleLink() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteUid = searchParams.get("invite");
  
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const inviteLink = typeof window !== "undefined" 
    ? `${window.location.origin}/?invite=${user?.uid}`
    : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "우리의 다이어리",
          text: "커플 다이어리에 초대합니다! 링크를 눌러 연결해주세요.",
          url: inviteLink,
        });
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptInvite = async () => {
    if (!user || !inviteUid || isLinking) return;
    setIsLinking(true);

    try {
      // 1. 커플 그룹(couples) 문서 생성
      const coupleRef = doc(collection(db, "couples"));
      await setDoc(coupleRef, {
        users: [inviteUid, user.uid],
        createdAt: new Date(),
      });

      // 2. 두 유저의 문서에 coupleId 업데이트
      // 주의: 상대방 문서를 수정하려면 Firestore Security Rule에서 허용해야 함
      // 여기서는 클라이언트에서 둘 다 업데이트 시도
      await updateDoc(doc(db, "users", user.uid), {
        coupleId: coupleRef.id
      });
      await updateDoc(doc(db, "users", inviteUid), {
        coupleId: coupleRef.id
      });
      
      router.replace("/");
    } catch (error) {
      console.error("커플 연결 실패:", error);
      alert("연결에 실패했습니다. 코드가 유효한지 확인해주세요.");
      setIsLinking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl shadow-sm p-8 text-center space-y-6">
      <div className="p-4 bg-pink-50 rounded-full text-pink-500 mb-2">
        <Link2 size={40} />
      </div>
      
      {inviteUid && inviteUid !== user?.uid ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">초대를 받으셨네요!</h2>
          <p className="text-gray-500 text-sm">
            상대방과 계정을 연결하여 다이어리를 공유하세요.
          </p>
          <button 
            onClick={handleAcceptInvite}
            disabled={isLinking}
            className="w-full py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-md transition"
          >
            {isLinking ? "연결 중..." : "초대 수락하고 연결하기"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          <h2 className="text-xl font-bold text-gray-800">상대방 초대하기</h2>
          <p className="text-gray-500 text-sm">
            아직 커플이 연결되지 않았습니다.<br/>
            아래 버튼을 눌러 링크를 카카오톡으로 보내주세요!
          </p>
          
          <button 
            onClick={handleShare}
            className="w-full py-3 px-6 bg-[#FAE100] text-[#371D1E] hover:bg-[#ebd300] font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            카카오톡/메시지로 공유하기
          </button>

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">또는 링크 복사</span>
            </div>
          </div>

          <button 
            onClick={handleCopy}
            className="w-full py-3 px-6 bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium rounded-xl border border-gray-200 transition flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? "복사되었습니다!" : "초대 링크 복사"}
          </button>
        </div>
      )}
    </div>
  );
}
