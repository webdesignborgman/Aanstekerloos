// app/auth/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function AuthPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <LoginForm />
      {/* Wil je login/register tabs, laat het weten! */}
    </main>
  );
}
