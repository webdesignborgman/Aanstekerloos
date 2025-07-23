// components/auth/LoginForm.tsx
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="max-w-sm mx-auto ...">
      <h2>Inloggen</h2>
      <GoogleLoginButton onSuccess={onSuccess} />
    </div>
  );
}



