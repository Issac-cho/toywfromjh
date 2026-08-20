"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Capsule } from "@/types";
import { ArrowLeft, Plus, Lock, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import UploadCapsuleModal from "@/components/UploadCapsuleModal";

export default function CapsulesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();
  
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    // 1분마다 현재 시간 업데이트 (잠금 해제 상태 갱신용)
    const interval = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userData?.coupleId) return;

    const q = query(
      collection(db, "capsules"),
      where("coupleId", "==", userData.coupleId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Firestore Timestamp를 Date로 변환
          unlockDate: data.unlockDate?.toDate().getTime() || 0,
          createdAt: data.createdAt?.toDate().getTime() || 0,
        };
      }) as Capsule[];
      setCapsules(fetched);
    });

    return () => unsubscribe();
  }, [userData?.coupleId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 bg-white shadow-sm z-10 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 text-gray-600 hover:text-pink-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">타임캡슐</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 -mr-2 text-pink-500 hover:bg-pink-50 rounded-full"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 p-4">
        {capsules.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
            <span className="text-5xl mb-4">🎙️</span>
            <p>묻어둔 타임캡슐이 없습니다.</p>
            <p className="text-sm">우측 상단의 + 버튼을 눌러 서로의 목소리를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {capsules.map(capsule => {
              const isLocked = now < capsule.unlockDate;
              const unlockDateStr = new Date(capsule.unlockDate).toLocaleDateString("ko-KR");

              return (
                <div 
                  key={capsule.id} 
                  className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${isLocked ? 'border-gray-300' : 'border-pink-400'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                        {capsule.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">개봉일: {unlockDateStr}</p>
                    </div>
                    <div className={`p-2 rounded-full ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-pink-50 text-pink-500'}`}>
                      {isLocked ? <Lock size={20} /> : <Mic size={20} />}
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="w-full bg-gray-50 rounded-lg py-4 text-center text-sm text-gray-400 border border-gray-100 backdrop-blur-sm">
                      🔒 아직 개봉할 수 없습니다
                    </div>
                  ) : (
                    <div className="w-full">
                      <audio src={capsule.audioUrl} controls className="w-full h-10" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <UploadCapsuleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
