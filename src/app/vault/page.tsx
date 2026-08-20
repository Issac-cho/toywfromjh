"use client";

import { useState, useEffect } from "react";
import { realtimeDb, db } from "@/lib/firebase";
import { ref as rtdbRef, onValue, set, onDisconnect } from "firebase/database";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { ArrowLeft, Lock, Unlock, Key, Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { Photo } from "@/types";
import UploadPhotoModal from "@/components/UploadPhotoModal";

export default function VaultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [myReady, setMyReady] = useState(false);
  
  const [secretPhotos, setSecretPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 실시간 동시 인증 로직
  useEffect(() => {
    if (!user || !userData?.coupleId) return;

    const vaultRef = rtdbRef(realtimeDb, `vaults/${userData.coupleId}`);

    // 연결이 끊어지면 내 인증 상태를 false로 만듦 (보안)
    const myStateRef = rtdbRef(realtimeDb, `vaults/${userData.coupleId}/${user.uid}`);
    onDisconnect(myStateRef).set(false);

    // 상태 리스너
    const unsubscribe = onValue(vaultRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 상대방 상태 확인
        const uids = Object.keys(data);
        const partnerUid = uids.find(uid => uid !== user.uid);
        const isPartnerReady = partnerUid ? data[partnerUid] === true : false;
        
        setPartnerReady(isPartnerReady);

        // 둘 다 true면 잠금 해제
        if (data[user.uid] === true && isPartnerReady) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } else {
        setPartnerReady(false);
        setIsUnlocked(false);
      }
    });

    return () => {
      // 컴포넌트 언마운트 시 내 상태 초기화
      set(myStateRef, false);
      unsubscribe();
    };
  }, [user, userData?.coupleId]);

  // 자동 잠금 타이머 (5분 미사용 시)
  useEffect(() => {
    if (!isUnlocked || !user || !userData?.coupleId) return;

    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // 5분 경과 시 내 상태를 false로 변경 -> 자동 잠금
        const myStateRef = rtdbRef(realtimeDb, `vaults/${userData.coupleId}/${user.uid}`);
        set(myStateRef, false);
        setMyReady(false);
      }, 5 * 60 * 1000);
    };

    // 사용자 액션 시 타이머 리셋
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [isUnlocked, user, userData?.coupleId]);

  // 시크릿 사진 불러오기 (잠금 해제시에만)
  useEffect(() => {
    if (!isUnlocked || !userData?.coupleId) return;

    const q = query(
      collection(db, "photos"),
      where("coupleId", "==", userData.coupleId),
      where("isSecret", "==", true), // 시크릿 태그(필드)가 있는 것만
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Photo[];
      setSecretPhotos(fetched);
    });

    return () => unsubscribe();
  }, [isUnlocked, userData?.coupleId]);

  const toggleReady = async () => {
    if (!user || !userData?.coupleId) return;
    const newState = !myReady;
    setMyReady(newState);
    
    const myStateRef = rtdbRef(realtimeDb, `vaults/${userData.coupleId}/${user.uid}`);
    await set(myStateRef, newState);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isUnlocked ? 'bg-gray-900 text-white' : 'bg-pink-50'}`}>
      <header className={`sticky top-0 z-10 px-4 py-4 flex items-center justify-between ${isUnlocked ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-white shadow-sm'}`}>
        <button onClick={() => router.push("/")} className={`p-2 -ml-2 ${isUnlocked ? 'text-gray-300' : 'text-gray-600 hover:text-pink-500'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-gray-800'}`}>
          {isUnlocked ? '시크릿 갤러리' : '듀얼 키 시크릿 폴더'}
        </h1>
        {isUnlocked ? (
          <button 
            onClick={toggleReady}
            className="text-sm font-semibold text-pink-400 bg-pink-400/20 px-3 py-1.5 rounded-full"
          >
            잠그기
          </button>
        ) : <div className="w-8" />}
      </header>

      <main className="flex-1 p-4 flex flex-col">
        {!isUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-8 mb-8">
                {/* 내 상태 */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${myReady ? 'bg-pink-500 text-white' : 'bg-white text-gray-300'}`}>
                    <Key size={32} />
                  </div>
                  <span className={`text-sm font-bold ${myReady ? 'text-pink-600' : 'text-gray-400'}`}>
                    {myReady ? '준비 완료' : '대기 중'}
                  </span>
                </div>

                {/* 상대방 상태 */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${partnerReady ? 'bg-pink-500 text-white' : 'bg-white text-gray-300'}`}>
                    <Key size={32} />
                  </div>
                  <span className={`text-sm font-bold ${partnerReady ? 'text-pink-600' : 'text-gray-400'}`}>
                    {partnerReady ? '상대방 준비됨' : '상대방 대기 중'}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                두 개의 열쇠가 필요합니다
              </h2>
              <p className="text-gray-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                시크릿 폴더를 열려면 두 사람이 <br/>동시에 아래 버튼을 눌러야 합니다.
              </p>
            </div>

            <button 
              onClick={toggleReady}
              className={`relative group w-32 h-32 rounded-full shadow-xl flex items-center justify-center transition-all transform active:scale-95 ${
                myReady ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-white'
              }`}
            >
              <div className={`absolute inset-0 rounded-full opacity-20 ${myReady ? 'animate-ping bg-pink-400' : ''}`} />
              <Fingerprint size={56} className={myReady ? 'text-white' : 'text-pink-300'} />
            </button>
            <p className="text-xs text-gray-400 animate-pulse">
              {myReady ? (partnerReady ? "열리는 중..." : "상대방을 기다리고 있습니다...") : "버튼을 터치하여 승인하세요"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {secretPhotos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <Lock size={48} className="mb-4 opacity-50" />
                <p>아직 시크릿 폴더에 등록된 사진이 없습니다.</p>
                <p className="text-sm mt-2">일반 앨범 업로드 시 기능이 추가될 예정입니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {secretPhotos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="relative bg-gray-800 rounded-xl overflow-hidden aspect-[3/4] border border-gray-700"
                  >
                    {photo.type === 'video' ? (
                      <video 
                        src={photo.url} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        controls={false}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img 
                        src={photo.url} 
                        alt="Secret Memory" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
