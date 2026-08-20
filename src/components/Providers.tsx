"use client";

import { NavermapsProvider } from "react-naver-maps";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NavermapsProvider ncpClientId={process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NavermapsProvider>
  );
}
