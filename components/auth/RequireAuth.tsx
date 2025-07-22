"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth"); // of een andere loginpagina
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center py-12">Bezig met laden...</div>;
  }

  if (!user) {
    return null; // Of eventueel een skeleton
  }

  return <>{children}</>;
}
