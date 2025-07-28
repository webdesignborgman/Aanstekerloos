// /components/stop/StopStatsOverviewSection.tsx
"use client";

import StatCard from "./StatCard";

interface Props {
  stopDate: { seconds: number; nanoseconds: number };
  pricePerPack: number; // kostenPerShag
  cigsPerPack: number; // sigarettenPerPakje
  type: string;
  sigarettenGedraaid: number;
  pakjesPerWeek: number;
  sigarettenPerPakje: number;
}

export default function StopStatsOverviewSection({
  stopDate,
  pricePerPack,
  cigsPerPack,
  type,
  sigarettenGedraaid,
  pakjesPerWeek,
  sigarettenPerPakje,
}: Props) {
  console.log('StopStatsCard debug:', {
    stopDate,
    pricePerPack,
    cigsPerPack,
    type,
    sigarettenGedraaid,
    pakjesPerWeek,
    sigarettenPerPakje
  });
  const startDate = new Date(stopDate.seconds * 1000);
  const now = new Date();
  const totalMinutes = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60)));
  console.log('startDate:', startDate, 'now:', now, 'totalMinutes:', totalMinutes);

  // Bereken gemiddeld per dag
  let avgPerDay = 0;
  if (type === "shag") {
    avgPerDay = (sigarettenGedraaid + pakjesPerWeek * sigarettenPerPakje) / 7;
  } else if (type === "sigaretten") {
    avgPerDay = (pakjesPerWeek * sigarettenPerPakje) / 7;
  }
  console.log('avgPerDay:', avgPerDay);

  const sigsAvoided = (avgPerDay / (24 * 60)) * totalMinutes;
  console.log('sigsAvoided:', sigsAvoided);
  const pricePerCig = pricePerPack / cigsPerPack;
  const moneySaved = sigsAvoided * pricePerCig;
  console.log('moneySaved:', moneySaved);
  const minutesSaved = sigsAvoided * 11;
  const hoursGained = Math.round((minutesSaved / 60) * 10) / 10;
  console.log('hoursGained:', hoursGained);
  const days = Math.floor(totalMinutes / (60 * 24));
  console.log('days:', days);

  return (
    <section className="p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-4">📊 Statistieken</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Dagen rookvrij" value={days.toString()} icon="🚭" />
        <StatCard label="Sigaretten vermeden" value={Math.round(sigsAvoided).toString()} icon="📦" />
        <StatCard label="Geld bespaard" value={`€${moneySaved.toFixed(2)}`} icon="💰" />
        <StatCard label="Levensduur herwonnen" value={`${hoursGained} uur`} icon="⏱️" />
      </div>
    </section>
  );
}
