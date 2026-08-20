"use client";

import { useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";
import CoupleLink from "@/components/CoupleLink";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || userLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-pink-50 text-gray-500">로딩 중...</div>;
  }

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <main className="min-h-screen bg-pink-50 p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">우리의 다이어리</h1>
          <p className="text-sm text-gray-500">{user.email}님 환영합니다</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-pink-500 bg-white rounded-full shadow-sm"
        >
          <LogOut size={20} />
        </button>
      </header>

      {!userData?.coupleId ? (
        <Suspense fallback={<div className="text-center text-gray-400">링크 불러오는 중...</div>}>
          <CoupleLink />
        </Suspense>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => router.push("/album")}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center aspect-square border-2 border-transparent hover:border-pink-200 transition cursor-pointer"
          >
            <span className="text-4xl mb-2">📸</span>
            <span className="font-semibold text-gray-700">네컷 앨범</span>
          </div>
          <div 
            onClick={() => router.push("/map")}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center aspect-square border-2 border-transparent hover:border-pink-200 transition cursor-pointer"
          >
            <span className="text-4xl mb-2">🗺️</span>
            <span className="font-semibold text-gray-700">데이트 지도</span>
          </div>
          <div 
            onClick={() => router.push("/capsules")}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center aspect-square border-2 border-transparent hover:border-pink-200 transition cursor-pointer"
          >
            <span className="text-4xl mb-2">🎙️</span>
            <span className="font-semibold text-gray-700">타임캡슐</span>
          </div>
          <div 
            onClick={() => router.push("/vault")}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center aspect-square border-2 border-transparent hover:border-pink-200 transition cursor-pointer"
          >
            <span className="text-4xl mb-2">🔐</span>
            <span className="font-semibold text-gray-700">시크릿 폴더</span>
          </div>
        </div>
      )}
    </main>
  );
}
