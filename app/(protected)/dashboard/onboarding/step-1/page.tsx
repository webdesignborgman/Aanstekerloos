"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

export default function MotivatieStepPage() {
  const router = useRouter();
  const { user } = useAuth(); // user: User | null
  const [reasons, setReasons] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  // 1. Redirect als user niet ingelogd (TypeScript-safe)
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 2. Voortgang ophalen als user er is
  useEffect(() => {
    if (!user) return;
    const fetchCompletedSteps = async () => {
      const snap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(snap.size);
    };
    fetchCompletedSteps();
  }, [user]);

  const currentStep = 0;

  // 3. Opslaan, user check vóór elk gebruik!
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "motivatie"),
      {
        reasons: reasons.split("\n").filter(Boolean),
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 1 ? 1 : prev));
    router.push("/dashboard/onboarding/step-2");
  }

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-40 text-neutral-400 text-lg">
        Laden...
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto mt-6">
      <OnboardingStepProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-orange-800 mb-2 text-center">
          Waarom wil je stoppen met roken?
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Noteer hieronder al je redenen. Je kunt ze later altijd aanpassen of aanvullen. <br />
          <span className="text-orange-600 font-semibold">Iedere reden telt!</span>
        </p>
        <Textarea
          value={reasons}
          onChange={e => setReasons(e.target.value)}
          rows={5}
          placeholder="Bijvoorbeeld:&#10;• Voor mijn gezondheid&#10;• Geld besparen&#10;• Meer energie"
          className="mb-4"
        />
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
          disabled={saving || reasons.trim().length === 0}
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Opslaan en doorgaan"}
        </Button>
      </div>
    </div>
  );
}
