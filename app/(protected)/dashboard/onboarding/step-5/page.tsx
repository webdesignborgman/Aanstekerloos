"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

export default function StopdatumStepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stopDate, setStopDate] = useState<string>("");
  const [motivatie, setMotivatie] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Redirect als user niet ingelogd
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Voortgang ophalen als user er is
  useEffect(() => {
    if (!user) return;
    const fetchCompletedSteps = async () => {
      const snap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(snap.size);
    };
    fetchCompletedSteps();
  }, [user]);

  const currentStep = 4; // step-5 = index 4

  // Opslaan
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "stopdatum"),
      {
        date: stopDate,
        motivatie: motivatie.trim() || null,
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 5 ? 5 : prev));
    router.push("/dashboard/onboarding/step-6");
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
          Kies je stopdatum!
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Plan je eerste rookvrije dag. Zet je keuze kracht bij met een korte motivatie!
        </p>

        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label className="block text-sm text-orange-700 mb-1">
              Stopdatum
            </label>
            <Input
              type="date"
              value={stopDate}
              onChange={e => setStopDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
              className="mb-2"
            />
          </div>
          <div>
            <label className="block text-sm text-orange-700 mb-1">
              Motivatie of persoonlijke boodschap <span className="text-orange-400 font-normal">(optioneel)</span>
            </label>
            <Textarea
              value={motivatie}
              onChange={e => setMotivatie(e.target.value)}
              rows={3}
              placeholder="Bijvoorbeeld: Dit doe ik voor mezelf! / Mijn gezondheid is het waard!"
            />
          </div>
        </div>

        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold mt-2"
          disabled={saving || stopDate.trim().length === 0}
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Opslaan en doorgaan"}
        </Button>
      </div>
    </div>
  );
}
