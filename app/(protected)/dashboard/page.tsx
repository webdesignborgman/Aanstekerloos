"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import OnboardingIntroCard from "@/components/onboarding/OnboardingIntroCard";
import MotivatieCard from "@/components/stop/MotivatieCard";
import CopingCard from "@/components/stop/CopingCard";
import StopStatsCard from "@/components/stop/StopStatsCard";
import { UserData } from "@/types/smokeLog";
import HealthMilestoneGrid from "@/components/stop/HealthMilestoneGrid";
import BadgeTabs from "@/components/badges/BadgeTabs";
import { useBadgeState } from "@/components/badges/useBadgeState";
import { checkAndUnlockAllBadges } from "@/components/badges/checkAndUnlockAllBadges";
import { differenceInDays, differenceInMinutes } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Badge hook
  const { unlocked, unlockBadge } = useBadgeState();

  useEffect(() => {
    if (!user) return;

    const fetchOnboardingData = async () => {
      try {
        const [motivatieSnap, copingSnap, stopdatumSnap, rookgedragSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid, "onboarding", "motivatie")),
          getDoc(doc(db, "users", user.uid, "onboarding", "coping")),
          getDoc(doc(db, "users", user.uid, "onboarding", "stopdatum")),
          getDoc(doc(db, "users", user.uid, "onboarding", "rookgedrag")),
        ]);

        const motivatie = motivatieSnap.exists() ? (motivatieSnap.data().reasons?.join("\n") ?? "") : "";
        const coping = copingSnap.exists() ? (copingSnap.data().strategies?.join("\n") ?? "") : "";
        const stopdatumData = stopdatumSnap.exists() ? stopdatumSnap.data() : {};
        const rookgedragData = rookgedragSnap.exists() ? rookgedragSnap.data() : {};

        const realStopDate = stopdatumData.realStopDate ?? null;
        const plannedStopDate = stopdatumData.date ?? "";

        let combined: UserData;
        if (rookgedragData.type === "shag") {
          combined = {
            motivatie,
            plannedStopDate,
            realStopDate,
            type: "shag",
            sigarettenGedraaid: rookgedragData.sigarettenGedraaid ?? 0,
            pakjesPerWeek: rookgedragData.pakjesPerWeek ?? 0,
            sigarettenPerPakje: 70,
            pricePerPack: rookgedragData.kostenPerShag ?? 0,
            cigsPerPack: 70,
          };
        } else {
          combined = {
            motivatie,
            plannedStopDate,
            realStopDate,
            type: "sigaretten",
            sigarettenGedraaid: 0,
            pakjesPerWeek: rookgedragData.pakjesPerWeek ?? 0,
            sigarettenPerPakje: rookgedragData.sigarettenPerPakje ?? 20,
            pricePerPack: rookgedragData.kostenPerPakje ?? 0,
            cigsPerPack: rookgedragData.sigarettenPerPakje ?? 20,
          };
        }
        setUserData(combined);
      } catch (error) {
        console.error("🔥 Fout bij ophalen onboarding-data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("📡 SW registered:", reg.scope);
        })
        .catch((err) => console.error("❌ SW registratie mislukt:", err));
    }
  }, [user]);

  // 🔗 Badge-unlock logica zodra userData & unlocked geladen zijn
  useEffect(() => {
    if (!userData || !userData.realStopDate || !user || !unlockBadge) return;

    // Statistieken berekenen (met correct onderscheid shag/sigaretten)
    const startDate = new Date(userData.realStopDate.seconds * 1000);
    const now = new Date();

    const tijd = differenceInDays(now, startDate); // dagen rookvrij
    const gezondheid = differenceInMinutes(now, startDate); // minuten rookvrij

    let avgCigsPerDay = 0;
    let pricePerCig = 0;

    if (userData.type === "shag") {
      // Shag: sigarettenGedraaid (per week) + (pakjesPerWeek × 70) / 7 = gemiddeld per dag
      const cigsFromShag = (userData.pakjesPerWeek ?? 0) * 70;
      avgCigsPerDay = ((userData.sigarettenGedraaid ?? 0) + cigsFromShag) / 7;
      pricePerCig = (userData.pricePerPack ?? 25) / 70;
    } else {
      // Sigaretten: pakjesPerWeek × sigarettenPerPakje / 7
      avgCigsPerDay = ((userData.pakjesPerWeek ?? 0) * (userData.sigarettenPerPakje ?? 20)) / 7;
      pricePerCig = (userData.pricePerPack ?? 10) / (userData.sigarettenPerPakje ?? 20);
    }

    const totalCigs = tijd * avgCigsPerDay;
    const geld = Math.floor(totalCigs * pricePerCig);

    // Simpele streak logic (kan uitgebreid worden)
    const streaks = tijd; // zolang je geen logica voor onderbreking hebt

    // Roep checkAndUnlockAllBadges aan
    checkAndUnlockAllBadges(
      unlocked,
      { tijd, geld, streaks, gezondheid },
      unlockBadge
    );
  }, [userData, unlocked, unlockBadge, user]);

  if (!user) {
    return <p className="text-center mt-12">Gebruiker wordt geladen...</p>;
  }

  if (loading) {
    return <p className="text-center mt-12">Bezig met laden...</p>;
  }

  if (!userData) {
    return <p className="text-center mt-12 text-red-500">Kon geen gebruikersdata laden.</p>;
  }

  const isStopped = !!userData.realStopDate;

  return (
    <main className="max-w-xl mx-auto px-2 pb-12 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {!isStopped && <DashboardHero />}

      {isStopped && userData.realStopDate ? (
        <>
          <MotivatieCard motivatie={userData.motivatie} />
          <CopingCard />
          <StopStatsCard
            stopDate={userData.realStopDate}
            type={userData.type}
            sigarettenGedraaid={userData.sigarettenGedraaid}
            pakjesPerWeek={userData.pakjesPerWeek}
            sigarettenPerPakje={userData.sigarettenPerPakje}
            pricePerPack={userData.pricePerPack}
            cigsPerPack={userData.cigsPerPack}
          />
          <HealthMilestoneGrid stopDate={userData.realStopDate} />
          <BadgeTabs />
        </>
      ) : (
        <OnboardingIntroCard />
      )}
    </main>
  );
}
