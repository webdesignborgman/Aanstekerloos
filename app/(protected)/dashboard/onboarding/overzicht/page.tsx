"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

// -- TypeScript interfaces --
type Motivatie = { reasons: string[] };
type Coping = { strategies: string[] };
type RookgedragSigaretten = {
  type: "sigaretten";
  perDag: number | null;
  sigarettenPerPakje: number | null;
  kostenPerPakje: number | null;
};
type RookgedragShag = {
  type: "shag";
  pakjesPerWeek: number | null;
  kostenPerShag: number | null;
};
type Rookgedrag = RookgedragSigaretten | RookgedragShag | null;
type Triggers = { moments: string[] };
type Stopdatum = { date: string; motivatie?: string | null };
type Buddy = { naam: string; telefoon?: string | null };
type Steun = { buddies: Buddy[] };

type OnboardingData = {
  motivatie: Motivatie | null;
  coping: Coping | null;
  rookgedrag: Rookgedrag;
  triggers: Triggers | null;
  stopdatum: Stopdatum | null;
  steun: Steun | null;
};

export default function OnboardingOverzichtPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    motivatie: null,
    coping: null,
    rookgedrag: null,
    triggers: null,
    stopdatum: null,
    steun: null,
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
      return;
    }
    async function fetchData() {
      if (!user) return; // <-- TypeScript is nu blij!
      const [
        motivatieSnap,
        copingSnap,
        rookgedragSnap,
        triggersSnap,
        stopdatumSnap,
        steunSnap,
      ] = await Promise.all([
        getDoc(doc(db, "users", user.uid, "onboarding", "motivatie")),
        getDoc(doc(db, "users", user.uid, "onboarding", "coping")),
        getDoc(doc(db, "users", user.uid, "onboarding", "rookgedrag")),
        getDoc(doc(db, "users", user.uid, "onboarding", "triggers")),
        getDoc(doc(db, "users", user.uid, "onboarding", "stopdatum")),
        getDoc(doc(db, "users", user.uid, "onboarding", "steun")),
      ]);
      setData({
        motivatie: motivatieSnap.exists()
          ? (motivatieSnap.data() as Motivatie)
          : null,
        coping: copingSnap.exists() ? (copingSnap.data() as Coping) : null,
        rookgedrag: rookgedragSnap.exists()
          ? (rookgedragSnap.data() as Rookgedrag)
          : null,
        triggers: triggersSnap.exists()
          ? (triggersSnap.data() as Triggers)
          : null,
        stopdatum: stopdatumSnap.exists()
          ? (stopdatumSnap.data() as Stopdatum)
          : null,
        steun: steunSnap.exists() ? (steunSnap.data() as Steun) : null,
      });
      setLoading(false);
    }
    fetchData();
  }, [user, router]);

  const currentStep = 6;

  if (user === undefined || loading) {
    return (
      <div className="flex items-center justify-center h-40 text-neutral-400 text-lg">
        Laden...
      </div>
    );
  }
  if (!user) return null;

  function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <OnboardingStepProgressBar
        currentStep={currentStep}
        completedSteps={6}
      />

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-2xl font-bold text-orange-800 mb-4 text-center">
          Je persoonlijke stopplan!
        </h2>
        <p className="mb-6 text-neutral-700 text-center">
          Gefeliciteerd, je bent helemaal voorbereid om te stoppen met roken!<br />
          Dit is jouw plan, gebaseerd op wat je zojuist hebt ingevuld.
        </p>

        <div className="space-y-6">
          {/* Motivatie */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw motivatie</h3>
            <ul className="list-disc pl-5">
              {data.motivatie?.reasons?.length
                ? data.motivatie.reasons.map((r) => <li key={r}>{r}</li>)
                : <li>–</li>}
            </ul>
          </section>

          {/* Coping */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw strategieën bij trek</h3>
            <ul className="list-disc pl-5">
              {data.coping?.strategies?.length
                ? data.coping.strategies.map((r) => <li key={r}>{r}</li>)
                : <li>–</li>}
            </ul>
          </section>

          {/* Rookgedrag */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw huidige rookgedrag</h3>
            {data.rookgedrag?.type === "sigaretten" ? (
              <ul className="pl-2">
                <li><span className="font-semibold">Sigaretten per dag:</span> {data.rookgedrag.perDag}</li>
                <li><span className="font-semibold">Sigaretten per pakje:</span> {data.rookgedrag.sigarettenPerPakje}</li>
                <li><span className="font-semibold">Kosten per pakje:</span> €{data.rookgedrag.kostenPerPakje}</li>
              </ul>
            ) : data.rookgedrag?.type === "shag" ? (
              <ul className="pl-2">
                <li><span className="font-semibold">Pakjes per week:</span> {data.rookgedrag.pakjesPerWeek}</li>
                <li><span className="font-semibold">Kosten per pakje shag:</span> €{data.rookgedrag.kostenPerShag}</li>
              </ul>
            ) : <span>–</span>}
          </section>

          {/* Triggers */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw belangrijkste triggers/momenten</h3>
            <ul className="list-disc pl-5">
              {data.triggers?.moments?.length
                ? data.triggers.moments.map((m) => <li key={m}>{m}</li>)
                : <li>–</li>}
            </ul>
          </section>

          {/* Stopdatum */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw gekozen stopdatum</h3>
            <div>
              <span className="font-semibold">Stopdatum:</span> {formatDate(data.stopdatum?.date)}
              {data.stopdatum?.motivatie && (
                <div className="text-orange-600 mt-1 italic">“{data.stopdatum.motivatie}”</div>
              )}
            </div>
          </section>

          {/* Steun */}
          <section>
            <h3 className="text-lg font-semibold text-orange-700 mb-1">Jouw steunpersonen</h3>
            {data.steun?.buddies?.length ? (
              <ul className="pl-2">
                {data.steun.buddies.map((b, idx) => (
                  <li key={b.naam + (b.telefoon ?? "") + idx}>
                    <span className="font-semibold">{b.naam}</span>
                    {b.telefoon && <span className="ml-2 text-neutral-600">({b.telefoon})</span>}
                  </li>
                ))}
              </ul>
            ) : <span>–</span>}
          </section>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-2"
            onClick={() => router.push("/dashboard")}
          >
            Naar mijn dashboard
          </Button>
          <span className="text-orange-600 text-lg font-semibold">
            Zet ‘m op – jij kan dit!
          </span>
        </div>
      </div>
    </div>
  );
}
