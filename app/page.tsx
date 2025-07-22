// app/page.tsx

import { HeroSection } from "@/components/HeroSection";
import { UitlegSection } from "@/components/UitlegSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UitlegSection />
      {/* 
        Hier kun je later andere secties toevoegen, 
        zoals testimonials, een call-to-action, of een FAQ.
      */}
    </>
  );
}
