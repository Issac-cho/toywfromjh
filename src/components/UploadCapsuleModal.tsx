"use client";

import { useState, useRef } from "react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { X, Mic, Square, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadCapsuleModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const { userData } = useUserData();

  const [title, setTitle] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen || !user || !userData?.coupleId) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("마이크 권한 획득 실패:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob || !title || !unlockDate || !userData?.coupleId) return;
    setIsUploading(true);

    const storageRef = ref(storage, `capsules/${userData.coupleId}/${Date.now()}.webm`);
    const uploadTask = uploadBytesResumable(storageRef, audioBlob);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("업로드 에러:", error);
        alert("업로드에 실패했습니다.");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // 날짜 파싱 후 자정으로 설정
        const unlockDateObj = new Date(unlockDate);
        unlockDateObj.setHours(0, 0, 0, 0);

        await addDoc(collection(db, "capsules"), {
          coupleId: userData.coupleId,
          uploaderId: user.uid,
          audioUrl: downloadURL,
          title,
          unlockDate: Timestamp.fromDate(unlockDateObj),
          createdAt: serverTimestamp(),
        });

        setIsUploading(false);
        resetForm();
        onClose();
      }
    );
  };

  const resetForm = () => {
    setTitle("");
    setUnlockDate("");
    setAudioBlob(null);
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={() => { resetForm(); onClose(); }} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">타임캡슐 묻기</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 우리의 첫 기념일을 위해"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">개봉할 날짜</label>
            <input
              type="date"
              value={unlockDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">목소리 녹음</label>
            <div className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-xl border-2 border-dashed border-pink-200">
              {audioBlob ? (
                <div className="w-full space-y-3">
                  <p className="text-center text-sm font-medium text-pink-600">녹음 완료!</p>
                  <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10" />
                  <button 
                    onClick={() => setAudioBlob(null)} 
                    className="text-xs text-gray-500 underline text-center w-full block"
                  >
                    다시 녹음하기
                  </button>
                </div>
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-full shadow-md transition transform active:scale-95 ${
                    isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-pink-500 hover:bg-pink-600'
                  }`}
                >
                  {isRecording ? <Square fill="currentColor" className="text-white" size={32} /> : <Mic className="text-white" size={32} />}
                </button>
              )}
              {!audioBlob && (
                <p className="text-xs text-gray-500 mt-3">
                  {isRecording ? "녹음 중... 버튼을 다시 눌러 완료하세요" : "마이크 버튼을 눌러 녹음을 시작하세요"}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!title || !unlockDate || !audioBlob || isUploading}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold rounded-lg shadow-md transition flex justify-center items-center gap-2 mt-4"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> 업로드 중...
              </>
            ) : "타임캡슐 묻기"}
          </button>
        </div>
      </div>
    </div>
  );
}
