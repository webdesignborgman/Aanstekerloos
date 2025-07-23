"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export function GoogleLoginButton({ onSuccess }: { onSuccess: () => void }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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
