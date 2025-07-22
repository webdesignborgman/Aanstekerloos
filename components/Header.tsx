"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/components/auth/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/70 shadow-sm relative z-20">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl select-none">
        <Image
          src="/logo/apple-touch-icon.png"
          alt="Aanstekerloos logo"
          width={36}
          height={36}
          className="rounded-md"
          priority
        />
        <span className="tracking-tight">Aanstekerloos</span>
      </Link>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-6 items-center text-base">
        <Link href="#uitleg" className="hover:text-orange-600">Hoe werkt het?</Link>
        <Link href="#contact" className="hover:text-orange-600">Contact</Link>
        {user ? (
          <UserMenu />
        ) : (
          <Button asChild>
            <Link href="/auth">Start</Link>
          </Button>
        )}
      </nav>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label="Open menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {/* Animated mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg flex flex-col gap-6 p-8 md:hidden z-50"
          >
            <button
              className="self-end mb-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={28} />
            </button>
            <Link href="#uitleg" className="hover:text-orange-600 text-lg" onClick={() => setMenuOpen(false)}>
              Hoe werkt het?
            </Link>
            <Link href="#contact" className="hover:text-orange-600 text-lg" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            {user ? (
              <div onClick={() => setMenuOpen(false)}>
                <UserMenu />
              </div>
            ) : (
              <Button asChild className="w-full" onClick={() => setMenuOpen(false)}>
                <Link href="/auth">Start</Link>
              </Button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
