"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/dashboard";
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Debug logging op de pagina
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev: string[]) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  // Wacht met checken van auth state tot de pagina volledig geladen is
  useEffect(() => {
    addDebugInfo(`Page loaded - Loading: ${loading}, User: ${user?.email || 'none'}`);
    const timeout = setTimeout(() => {
      console.log("Auth Page State:", {
        loading,
        isLoggedIn: !!user,
        userEmail: user?.email,
        nextUrl: next,
        currentUrl: window.location.href
      });
    }, 1000);
    return () => clearTimeout(timeout);
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
          
          <div className="mt-4 border-t pt-2">
            <p className="font-semibold">Debug Log:</p>
            {debugInfo.map((info, index) => (
              <p key={index} className="text-xs">{info}</p>
            ))}
          </div>
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
