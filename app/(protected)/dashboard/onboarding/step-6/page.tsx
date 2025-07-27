"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

type Buddy = {
  naam: string;
  telefoon?: string;
};

export default function SteunStepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [buddies, setBuddies] = useState<Buddy[]>([{ naam: "", telefoon: "" }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) return;
    async function fetchData() {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid, "onboarding", "steun"));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.buddies) && data.buddies.length > 0) {
          setBuddies(data.buddies.map((b: Buddy) => ({
            naam: b.naam || "",
            telefoon: b.telefoon || ""
          })));
        }
      }
      const stepsSnap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(stepsSnap.size);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const currentStep = 5;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    // Filter lege buddies eruit
    const filtered = buddies
      .map((b) => ({
        naam: b.naam.trim(),
        telefoon: b.telefoon?.trim() || null,
      }))
      .filter((b) => b.naam.length > 0);

    await setDoc(
      doc(db, "users", user.uid, "onboarding", "steun"),
      {
        buddies: filtered,
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 6 ? 6 : prev));
    router.push("/dashboard/onboarding/overzicht");
  }

  function updateBuddy(index: number, field: keyof Buddy, value: string) {
    setBuddies((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      )
    );
  }

  function addBuddy() {
    setBuddies((prev) => [...prev, { naam: "", telefoon: "" }]);
  }

  function removeBuddy(index: number) {
    setBuddies((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  }

  const atLeastOneFilled = buddies.some(b => b.naam.trim().length > 0);

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
          Wie worden jouw steunpersonen?
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Voeg één of meer buddies toe. Zij kunnen je helpen bij moeilijke momenten.
        </p>

        <div className="flex flex-col gap-6 mb-4">
          {buddies.map((buddy, idx) => (
            <div key={idx} className="bg-white/80 rounded-xl p-4 shadow flex flex-col gap-2 relative border border-orange-100">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-orange-700 mb-1">
                    Naam
                  </label>
                  <Input
                    value={buddy.naam}
                    onChange={e => updateBuddy(idx, "naam", e.target.value)}
                    placeholder="Bijv. Jan, Petra, Coach"
                    className="mb-1"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-orange-700 mb-1">
                    Telefoonnummer <span className="text-orange-400 font-normal">(optioneel)</span>
                  </label>
                  <Input
                    value={buddy.telefoon || ""}
                    onChange={e => updateBuddy(idx, "telefoon", e.target.value)}
                    placeholder="Bijv. 06-12345678"
                    className="mb-1"
                    type="tel"
                  />
                </div>
              </div>
              {buddies.length > 1 && (
                <Button
                  variant="ghost"
                  type="button"
                  className="absolute top-2 right-2 text-orange-400 hover:text-orange-700 p-1 h-7 w-7 rounded-full"
                  onClick={() => removeBuddy(idx)}
                  title="Verwijder deze buddy"
                >
                  &times;
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mb-4 w-full"
          onClick={addBuddy}
        >
          + Nog een steunpersoon toevoegen
        </Button>

        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
          disabled={saving || !atLeastOneFilled}
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Onboarding afronden"}
        </Button>
      </div>
    </div>
  );
}
