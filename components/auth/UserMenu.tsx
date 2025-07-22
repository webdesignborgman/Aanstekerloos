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

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Je bent uitgelogd");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 cursor-pointer select-none focus:outline-none">
          <Avatar className="w-8 h-8">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback>
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium max-w-[120px] truncate">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
