"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { auth } from "@/lib/firebase";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getRedirectResult } from "firebase/auth";

function DebugContent() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authTime, setAuthTime] = useState<string>();
  const [lastRedirect, setLastRedirect] = useState<string>();

  useEffect(() => {
    // Check last auth time
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthTime(new Date(user.metadata.lastSignInTime || "").toLocaleString());
      }
    });
    return () => unsubscribe();
  }, []);

  // Check for redirect result
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        console.log("Checking redirect result...");
        const result = await getRedirectResult(auth);
        console.log("Redirect result:", result ? "Success" : "No result");
        if (result?.user) {
          console.log("Logged in user:", result.user.email);
          setLastRedirect(new Date().toLocaleString());
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
          console.error("Redirect error details:", {
            code: (error as { code?: string }).code,
            message: (error as { message?: string }).message,
            customData: (error as { customData?: unknown }).customData
          });
        } else {
          console.error("Redirect error:", error);
        }
      }
    };
    checkRedirect();
  }, []);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Informatie</h1>
      
      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Auth Status</h2>
          <div className="space-y-2 text-sm">
            <p>Loading: {loading ? "Ja" : "Nee"}</p>
            <p>Ingelogd: {user ? "Ja" : "Nee"}</p>
            {user && (
              <>
                <p>Email: {user.email}</p>
                <p>User ID: {user.uid}</p>
                <p>Laatste login: {authTime}</p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Route Informatie</h2>
          <div className="space-y-2 text-sm">
            <p>Huidige pagina: {pathname}</p>
            <p>URL parameters: {searchParams.toString() || "geen"}</p>
            {lastRedirect && (
              <p>Laatste redirect: {lastRedirect}</p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Firebase Auth Status</h2>
          <div className="space-y-2 text-sm">
            <p>Auth instantie: {auth ? "Beschikbaar" : "Niet beschikbaar"}</p>
            <p>Current User: {auth?.currentUser?.email || "Geen"}</p>
            <p>Auth ready: {!loading ? "Ja" : "Nee"}</p>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div className="p-4">Laden...</div>}>
      <DebugContent />
    </Suspense>
  );
}
