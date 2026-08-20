import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export interface UserData {
  email: string;
  coupleId?: string;
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      } else {
        // Create initial user document if it doesn't exist
        const initialData: UserData = { email: user.email || "" };
        setDoc(userRef, initialData).then(() => {
          setUserData(initialData);
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { userData, loading };
}
