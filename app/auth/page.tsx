"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/dashboard";
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Auth Page State:", {
      loading,
      isLoggedIn: !!user,
      userEmail: user?.email,
      nextUrl: next
    });
  }, [loading, user, next]);

  // Als de gebruiker is ingelogd, doorsturen naar de next URL
  useEffect(() => {
    if (!loading && user) {
      console.log("User logged in, redirecting to:", next);
      router.replace(next);
    }
  }, [loading, user, next, router]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-4">
        <LoginForm onSuccess={() => router.replace(next)} />
        
        {/* Debug informatie */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/50 text-sm space-y-2">
          <p>Loading: {loading ? "Ja" : "Nee"}</p>
          <p>Ingelogd: {user ? "Ja" : "Nee"}</p>
          {user && <p>Email: {user.email}</p>}
          <p>Volgende URL: {next}</p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Even laden…</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
