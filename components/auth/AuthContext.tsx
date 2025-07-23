"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  getRedirectResult,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("🟡 AuthProvider gestart");

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("✅ getRedirectResult: user gevonden", result.user);
          setUser(result.user);
        } else {
          console.log("ℹ️ getRedirectResult: geen user gevonden");
        }
      })
      .catch((error) => {
        console.error("❌ getRedirectResult fout:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("📡 onAuthStateChanged triggered:", firebaseUser);
      setUser(firebaseUser);
      setLoading(false);

      // Verwijderd: automatische redirect naar /dashboard
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
