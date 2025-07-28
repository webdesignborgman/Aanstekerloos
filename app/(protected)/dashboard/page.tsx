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

export default function DashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOnboardingData = async () => {
      try {
        // Haal alle relevante onboarding-subdocumenten op
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

        // Bepaal of er een daadwerkelijke stopdatum is (realStopDate)
        // plannedStopDate = geplande datum, realStopDate = daadwerkelijke stopdatum
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

        </>
        
      ) : (
        <OnboardingIntroCard />
      )}
    </main>
  );
}
