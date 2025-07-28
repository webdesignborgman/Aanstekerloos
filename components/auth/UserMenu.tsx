"use client";

import { useAuth } from "./AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.displayName || user.email || "Gebruiker";
  const photoURL = user.photoURL || undefined;

  /**
   * Uitloggen én subscription opruimen.
   * Voordat we uitloggen halen we de bestaande push‑subscription op,
   * verwijderen die uit Firestore (zodat hij niet meer aan dit account hangt),
   * en loggen dan pas uit.
   */
  const handleSignOut = async () => {
    try {
      // Probeer bestaande subscription op te halen en uit Firestore te verwijderen
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) {
        // Delete de subscription in Firestore (alle users worden nagelopen)
        await fetch("/api/web-push/subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existingSub.endpoint }),
        });
        // (Optioneel) unsubscribe van het device zelf:
        // await existingSub.unsubscribe();
      }
    } catch (error) {
      console.error("Error cleaning up subscription on sign out:", error);
    }

    await signOut(auth);
    toast.success("Je bent uitgelogd");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* De trigger bevat het avatar‑icoon en de naam zodat je altijd ziet wie er is ingelogd */}
        <div className="flex items-center gap-2 cursor-pointer select-none focus:outline-none">
          <Avatar className="w-8 h-8">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback>
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium max-w-[120px] truncate">{displayName}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href="/profiel">Profiel</a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600"
        >
          Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
