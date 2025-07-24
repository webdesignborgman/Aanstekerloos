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

  useEffect(() => {
    console.log("🔧 AuthProvider: Initializing auth...");

    // Check for redirect result first
    getRedirectResult(auth)
      .then((result) => {
        console.log("🔍 Redirect result check:", result ? "Found user" : "No result");
        if (result?.user) {
          console.log("✅ Redirect successful, user:", result.user.email);
          setUser(result.user);
          setLoading(false);
          toast.success("Succesvol ingelogd!");
          return; // Early return to prevent onAuthStateChanged from overriding
        }

        // If no redirect result, proceed with normal auth state check
        console.log("📡 Setting up auth state listener...");
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("🔄 Auth state changed:", {
            hasUser: !!firebaseUser,
            email: firebaseUser?.email,
            uid: firebaseUser?.uid,
          });
          setUser(firebaseUser);
          setLoading(false);
        });

        return () => {
          console.log("🧹 Cleaning up auth listener");
          unsubscribe();
        };
      })
      .catch((error) => {
        console.error("❌ Redirect error:", {
          code: error.code,
          message: error.message,
        });
        // Still set up listener even if redirect fails
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("🔄 Auth state changed (after error):", {
            hasUser: !!firebaseUser,
            email: firebaseUser?.email,
          });
          setUser(firebaseUser);
          setLoading(false);
        });

        return () => unsubscribe();
      });
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
