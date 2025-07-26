"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useEffect } from "react";

export function GoogleLoginButton({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();

  // Trigger onSuccess when user becomes available
  useEffect(() => {
    if (user) {
      // User detected, triggering onSuccess
      onSuccess();
    }
  }, [user, onSuccess]);

  const handleGoogleLogin = async () => {
    try {
      // Starting Google login...
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      provider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, provider);
      toast.success("Succesvol ingelogd!");
      onSuccess();
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        const err = error as { code?: string; message?: string; customData?: unknown };
        console.error("Login error details:", {
          code: err.code,
          message: err.message,
          customData: err.customData,
        });
      } else {
        console.error("Login error details:", error);
      }
      toast.error("Inloggen mislukt");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex gap-2 items-center justify-center"
      onClick={handleGoogleLogin}
    >
      <FcGoogle size={22} /> Inloggen met Google
    </Button>
  );
}
