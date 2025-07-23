"use client";

import { useAuth } from "./AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      const nextUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      router.replace(`/auth?next=${encodeURIComponent(nextUrl)}`);
    }
  }, [user, loading, pathname, searchParams, router]);

  if (loading) return <div className="py-12 text-center">Even laden…</div>;
  if (!user) return null;
  return <>{children}</>;
}
