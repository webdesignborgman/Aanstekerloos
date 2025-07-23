"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useEffect } from "react";

export function GoogleLoginButton({ onSuccess }: { onSuccess: () => void }) {
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result) {
        toast.success("Succesvolle login!");
        onSuccess();
      }
    }).catch((error) => {
      console.error("Error getting redirect result:", error);
      toast.error("Inloggen mislukt");
    });
  }, [onSuccess]);

  const handleGoogleLogin = async () => {
    try {
      console.log("Starting Google login...");
      const provider = new GoogleAuthProvider();
      // Add scopes and custom parameters
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      console.log("Initiating redirect...");
      await signInWithRedirect(auth, provider);
      console.log("Redirect initiated"); // This might not show due to redirect
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        const err = error as { code?: string; message?: string; customData?: unknown };
        console.error("Login error details:", {
          code: err.code,
          message: err.message,
          customData: err.customData
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
