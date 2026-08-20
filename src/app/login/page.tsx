"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-pink-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-pink-100 rounded-full text-pink-500 mb-2">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLoginMode ? "우리의 다이어리" : "함께 시작하기"}
          </h1>
          <p className="text-sm text-gray-500">
            {isLoginMode ? "로그인하고 추억을 열어보세요" : "계정을 만들고 추억을 기록해보세요"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition"
              placeholder="couple@example.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition transform active:scale-95"
          >
            {isLoginMode ? "로그인하기" : "가입하기"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {isLoginMode ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
          </p>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-pink-500 hover:text-pink-600 font-medium text-sm mt-1"
          >
            {isLoginMode ? "새 계정 만들기" : "기존 계정으로 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
