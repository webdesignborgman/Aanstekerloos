// components/auth/LoginForm.tsx
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-2">Inloggen</h2>
      <GoogleLoginButton />
      {/* Later eventueel e-mail/wachtwoord toevoegen */}
    </div>
  );
}
