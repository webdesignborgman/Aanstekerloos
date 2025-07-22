"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    console.log("🔐 login gestart via popup");

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ user via popup:", result.user);
    } catch (err) {
      console.error("❌ Login fout (popup)", err);
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
