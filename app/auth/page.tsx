"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/dashboard";

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <LoginForm onSuccess={() => router.replace(next)} />
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
