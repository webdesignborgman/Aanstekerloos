"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Succesvol ingelogd!");
      // Je wordt automatisch door AuthProvider geüpdatet
    } catch (err) {
      toast.error("Inloggen mislukt");
      console.error(err);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex gap-2 items-center justify-center text-base"
      onClick={handleGoogleLogin}
    >
      <FcGoogle size={22} /> Inloggen met Google
    </Button>
  );
}
