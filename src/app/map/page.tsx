"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Photo } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    naver: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const { userData } = useUserData();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!userData?.coupleId) return;
    
    const fetchPhotos = async () => {
      const q = query(
        collection(db, "photos"),
        where("coupleId", "==", userData.coupleId)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Photo[];
      
      setPhotos(fetched.filter(p => p.location));
    };

    fetchPhotos();
  }, [userData?.coupleId]);

  useEffect(() => {
    if (!scriptLoaded || !window.naver || !window.naver.maps) return;

    // Initialize map
    if (!mapRef.current) {
      const defaultCenter = photos.length > 0 
        ? new window.naver.maps.LatLng(photos[0].location!.lat, photos[0].location!.lng)
        : new window.naver.maps.LatLng(37.5666805, 126.9784147);

      mapRef.current = new window.naver.maps.Map("map", {
        center: defaultCenter,
        zoom: 13,
      });
    }

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    photos.forEach(photo => {
      const position = new window.naver.maps.LatLng(photo.location!.lat, photo.location!.lng);
      const marker = new window.naver.maps.Marker({
        position,
        map: mapRef.current,
        icon: {
          content: `
            <div style="background-color: white; padding: 2px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); cursor: pointer;">
              <img src="${photo.type === 'image' ? photo.url : '/icons/icon-192x192.png'}" 
                   style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
            </div>
          `,
          anchor: new window.naver.maps.Point(20, 20),
        }
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        setSelectedPhoto(photo);
      });

      markersRef.current.push(marker);
    });

  }, [scriptLoaded, photos]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative">
      <Script 
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <header className="absolute top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-10 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 text-gray-600 hover:text-pink-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">우리의 지도</h1>
        <div className="w-8" />
      </header>

      <div className="flex-1 w-full h-full">
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>

      {selectedPhoto && (
        <div className="absolute bottom-6 left-4 right-4 bg-white p-3 rounded-2xl shadow-xl flex gap-4 animate-in slide-in-from-bottom-5">
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            {selectedPhoto.type === 'video' ? (
              <video src={selectedPhoto.url} className="w-full h-full object-cover" autoPlay muted loop />
            ) : (
              <img src={selectedPhoto.url} className="w-full h-full object-cover" alt="Memory" />
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-gray-800 text-sm">
              {new Date(selectedPhoto.createdAt?.toDate?.() || selectedPhoto.createdAt).toLocaleDateString()}
            </h3>
            {selectedPhoto.tags && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {selectedPhoto.tags.map(t => `#${t}`).join(" ")}
              </p>
            )}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="mt-2 text-xs font-semibold text-pink-500 self-start"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
