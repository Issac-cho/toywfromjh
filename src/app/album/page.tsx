"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Photo } from "@/types";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import UploadPhotoModal from "@/components/UploadPhotoModal";

export default function AlbumPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userData?.coupleId) return;

    const q = query(
      collection(db, "photos"),
      where("coupleId", "==", userData.coupleId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPhotos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      
      // 클라이언트 측에서 시크릿 사진 필터링
      setPhotos(fetchedPhotos.filter(p => !p.isSecret));
    });

    return () => unsubscribe();
  }, [userData?.coupleId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 bg-white shadow-sm z-10 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 text-gray-600 hover:text-pink-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">네컷 앨범</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 -mr-2 text-pink-500 hover:bg-pink-50 rounded-full"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 p-4">
        {photos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
            <span className="text-5xl mb-4">📸</span>
            <p>아직 등록된 추억이 없습니다.</p>
            <p className="text-sm">우측 상단의 + 버튼을 눌러 사진을 추가해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(photo => (
              <div 
                key={photo.id} 
                className="relative bg-white rounded-xl shadow-sm overflow-hidden aspect-[3/4] border border-gray-100"
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
                    alt="Memory" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* 딤 효과 및 태그 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-3">
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-white/80 text-gray-800 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadPhotoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
