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
import { toast } from "sonner";

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
    console.log("Setting up auth state listener...");
    
    // Check for redirect result first
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("Redirect successful, user:", result.user.email);
        setUser(result.user);
        setLoading(false);
        toast.success("Succesvol ingelogd!");
      }
    }).catch((error) => {
      console.error("Redirect error:", {
        code: error.code,
        message: error.message
      });
    });

    // Then set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", {
        hasUser: !!firebaseUser,
        email: firebaseUser?.email,
        uid: firebaseUser?.uid
      });
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
