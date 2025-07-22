"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null; // Of een loader/spinner

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <LoginForm />
    </main>
  );
}
