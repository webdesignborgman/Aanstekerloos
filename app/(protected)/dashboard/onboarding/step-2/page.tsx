"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

export default function CopingStepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) return;
    async function fetchData() {
      if (!user) return;
      const copingSnap = await getDoc(doc(db, "users", user.uid, "onboarding", "coping"));
      if (copingSnap.exists()) {
        const data = copingSnap.data();
        if (Array.isArray(data.strategies)) {
          setStrategies(data.strategies.join("\n"));
        }
      }
      const snap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(snap.size);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const currentStep = 1;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "coping"),
      {
        strategies: strategies.split("\n").filter(Boolean),
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 2 ? 2 : prev));
    router.push("/dashboard/onboarding/step-3");
  }

  if (user === undefined || loading) {
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
          Wat ga je doen als je trek krijgt?
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Noteer hieronder wat je kunt doen als je zin hebt in een sigaret.{" "}
          <span className="text-orange-600 font-semibold">
            Denk aan: glas water drinken, ademhalingsoefening, iemand bellen, wandeling maken, enzovoort.
          </span>
        </p>
        <Textarea
          value={strategies}
          onChange={e => setStrategies(e.target.value)}
          rows={5}
          placeholder={`Bijvoorbeeld:\n• Glas water drinken\n• Ademhalingsoefening doen\n• Even naar buiten\n• Iemand bellen`}
          className="mb-4"
        />
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
          disabled={saving || strategies.trim().length === 0}
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Opslaan en doorgaan"}
        </Button>
      </div>
    </div>
  );
}
