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
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      toast.success("Succesvolle login!");
      onSuccess();
    } catch {
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
