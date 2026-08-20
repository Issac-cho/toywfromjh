"use client";

import { useState } from "react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadPhotoModal({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isSecret, setIsSecret] = useState(false);

  const { user } = useAuth();
  const { userData } = useUserData();

  if (!isOpen || !user || !userData?.coupleId) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    // 파일 확장자 및 타입
    const isVideo = file.type.startsWith("video/");
    const storageRef = ref(storage, `albums/${userData.coupleId}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error("업로드 에러:", error);
        alert("업로드에 실패했습니다.");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        let locationData = null;
        try {
          if (navigator.geolocation) {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            locationData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          }
        } catch (e) {
          console.log("위치 정보를 가져올 수 없습니다.", e);
        }

        // Firestore에 메타데이터 저장
        await addDoc(collection(db, "photos"), {
          coupleId: userData.coupleId,
          uploaderId: user.uid,
          url: downloadURL,
          type: isVideo ? "video" : "image",
          tags: tags.split(",").map(t => t.trim()).filter(t => t),
          location: locationData,
          isSecret,
          createdAt: serverTimestamp(),
        });

        setIsUploading(false);
        setFile(null);
        setTags("");
        setIsSecret(false);
        onClose();
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">새로운 추억 추가하기</h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-pink-200 bg-pink-50 rounded-xl p-8 flex flex-col items-center justify-center relative cursor-pointer hover:bg-pink-100 transition">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <span className="text-pink-600 font-medium truncate w-full text-center">
                {file.name}
              </span>
            ) : (
              <>
                <UploadCloud size={40} className="text-pink-400 mb-2" />
                <span className="text-gray-500 text-sm">터치하여 사진이나 영상 선택</span>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 1주년, 데이트, 부산"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isSecret" 
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
            />
            <label htmlFor="isSecret" className="text-sm text-gray-700 cursor-pointer">
              시크릿 폴더로 보내기 (잠금 필요)
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold rounded-lg shadow-md transition flex justify-center items-center gap-2 mt-4"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> 
                {Math.round(progress)}% 업로드 중...
              </>
            ) : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
