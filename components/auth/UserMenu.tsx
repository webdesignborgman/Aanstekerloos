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
   * We verwijderen de push‑subscription uit Firestore én unsubscriben hem uit de service worker,
   * zodat er geen dubbele subscriptions ontstaan wanneer je van account wisselt.
   */
  const handleSignOut = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) {
        // Verwijder de subscription in Firestore (alle users worden nagelopen)
        await fetch("/api/web-push/subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existingSub.endpoint }),
        });

        // Unsubscribe lokaal, zodat het device bij het volgende account opnieuw abonneert
        await existingSub.unsubscribe();
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
        {/* Trigger met avatar en naam, zodat altijd zichtbaar is wie er is ingelogd */}
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
