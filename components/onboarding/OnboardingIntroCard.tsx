"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const ONBOARDING_STEPS = [
  { key: "motivatie", route: "/dashboard/onboarding/step-1" },
  { key: "coping", route: "/dashboard/onboarding/step-2" },
  { key: "rookgedrag", route: "/dashboard/onboarding/step-3" },
  { key: "triggers", route: "/dashboard/onboarding/step-4" },
  { key: "stopdatum", route: "/dashboard/onboarding/step-5" },
  { key: "steun", route: "/dashboard/onboarding/step-6" }
];

export default function OnboardingIntroCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Voortgang ophalen uit Firestore
  useEffect(() => {
    if (user === undefined) return;
    if (!user) return;
    async function fetchProgress() {
      if (!user) return; // TypeScript null-check binnen async!
      const snap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      const done: string[] = [];
      snap.forEach(doc => {
        done.push(doc.id);
      });
      setCompletedSteps(done);
      const pct = Math.round((done.length / ONBOARDING_STEPS.length) * 100);
      setProgress(pct);
      setLoading(false);
    }
    fetchProgress();
  }, [user]);

  if (user === undefined || loading) {
    return (
      <div className="max-w-xl mx-auto mb-8 p-6 rounded-2xl bg-orange-50 border border-orange-100 shadow-xl text-center">
        <span className="text-orange-600 font-bold">Voortgang wordt geladen…</span>
      </div>
    );
  }
  if (!user) return null;

  const completed = progress === 100;

  // Zoek eerste niet afgeronde stap
  const firstIncomplete =
    ONBOARDING_STEPS.find(s => !completedSteps.includes(s.key))?.route ||
    ONBOARDING_STEPS[0].route;

  return (
    <div className="max-w-xl mx-auto mb-8">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 justify-center text-orange-600 font-bold text-lg">
          <Sparkles className="w-6 h-6 animate-pulse" />
          Maak je klaar voor een rookvrije toekomst!
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Goed voorbereid stoppen werkt echt! Vul kort je motivatie, gewoonten en plannen in, zodat je straks sterker staat bij cravings.<br />
          Je hoeft het niet perfect te doen – iedere stap helpt!
        </p>
      </div>

      <div className="rounded-2xl p-6 shadow-xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-800 mb-2 text-center">
          Start je voorbereiding!
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          In een paar korte stappen maak je jouw persoonlijke <span className="font-semibold">stoppen-met-roken plan</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl transition"
            onClick={() => router.push(firstIncomplete)}
            disabled={completed}
          >
            {completed ? "Voorbereiding voltooid!" : "Start / Ga verder"}
          </Button>
          <Button
            variant="outline"
            className="font-semibold px-6 py-2 rounded-xl"
            onClick={() => router.push("/dashboard/onboarding/overzicht")}
          >
            Bekijk mijn plan
          </Button>
          <Button
            variant="ghost"
            className="font-semibold px-6 py-2 rounded-xl"
            onClick={() => router.push(firstIncomplete)}
          >
            Aanpassen
          </Button>
        </div>
        <div className="mt-6">
          <Progress value={progress} className="h-3 bg-orange-100" />
          <p className="text-center mt-2 text-sm text-orange-700">
            {progress === 0
              ? "Nog niet gestart"
              : progress === 100
              ? "Klaar! Je bent helemaal voorbereid 🎉"
              : `Voorbereiding ${progress}% voltooid`}
          </p>
        </div>
      </div>
    </div>
  );
}
