"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

const DEFAULT_TRIGGERS = [
  "Na het eten",
  "Met koffie/thee",
  "Bij stress",
  "Tijdens autorijden",
  "Tijdens pauze op werk",
  "Sociaal moment (met anderen)",
  "Bij alcohol",
  "Uit gewoonte/verveling"
];

export default function TriggersStepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Data laden uit Firestore
  useEffect(() => {
    if (user === undefined) return;
    if (!user) return;
    async function fetchData() {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid, "onboarding", "triggers"));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.moments)) setSelected(data.moments);
      }
      const stepsSnap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(stepsSnap.size);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const currentStep = 3;

  function addCustomTrigger() {
    if (customTrigger.trim().length === 0) return;
    setSelected((prev) =>
      prev.includes(customTrigger.trim())
        ? prev
        : [...prev, customTrigger.trim()]
    );
    setCustomTrigger("");
  }

  function toggleTrigger(trigger: string) {
    setSelected((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "triggers"),
      {
        moments: selected,
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 4 ? 4 : prev));
    router.push("/dashboard/onboarding/step-5");
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
          Wanneer rook je meestal?
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Selecteer je bekende rookmomenten en voeg eventueel zelf nog triggers toe.<br />
          <span className="text-orange-600 font-semibold">
            Dit helpt je straks bij het herkennen van verleidingen!
          </span>
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {DEFAULT_TRIGGERS.map((trigger) => (
            <label key={trigger} className="flex items-center gap-2 text-orange-800 cursor-pointer">
              <input
                type="checkbox"
                className="accent-orange-500"
                checked={selected.includes(trigger)}
                onChange={() => toggleTrigger(trigger)}
              />
              {trigger}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Input
            value={customTrigger}
            onChange={e => setCustomTrigger(e.target.value)}
            placeholder="Eigen trigger toevoegen…"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTrigger();
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            type="button"
            onClick={addCustomTrigger}
            disabled={customTrigger.trim().length === 0}
          >
            Toevoegen
          </Button>
        </div>

        {selected.length > 0 && (
          <div className="mb-2 text-sm text-orange-700">
            <strong>Geselecteerd:</strong>{" "}
            {selected.map((s) => (
              <span key={s} className="inline-block px-2 py-1 bg-orange-100 rounded-lg mr-1 mb-1">
                {s}
                <button
                  type="button"
                  onClick={() => toggleTrigger(s)}
                  className="ml-1 text-orange-400 hover:text-orange-600 font-bold"
                  aria-label="Verwijderen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold mt-2"
          disabled={saving || selected.length === 0}
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Opslaan en doorgaan"}
        </Button>
      </div>
    </div>
  );
}
