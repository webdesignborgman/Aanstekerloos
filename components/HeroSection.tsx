// components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-12">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
        Stoppen met roken, luchtig &{" "}
        <span className="text-orange-500">met een glimlach</span>
      </h1>
      <p className="text-lg md:text-2xl text-gray-700 max-w-2xl mx-auto mb-8">
        Geen gezeur, geen schuldgevoel. Met Aanstekerloos krijg je inzicht, coaching, gamification én steun, helemaal op jouw tempo.
      </p>
      <Button size="lg" className="text-lg px-8 py-4 shadow-md hover:scale-105 transition" asChild>
        <Link href="/auth">Start jouw traject</Link>
      </Button>
      {/* Hier kun je later een illustratie of animatie toevoegen */}
    </section>
  );
}
