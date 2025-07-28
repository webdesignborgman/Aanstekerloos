"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { OnboardingStepProgressBar } from "@/components/onboarding/OnboardingStepProgressBar";

type RookgedragType = "sigaretten" | "shag" | "";

export default function RookgedragStepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<RookgedragType>("");
  const [perDag, setPerDag] = useState<string>("");
  const [sigPerPakje, setSigPerPakje] = useState<string>("20");
  const [kostenPerPakje, setKostenPerPakje] = useState<string>("");
  const [pakjesPerWeek, setPakjesPerWeek] = useState<string>("");
  const [kostenPerShag, setKostenPerShag] = useState<string>("");
  const [sigarettenGedraaid, setSigarettenGedraaid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) return;
    async function fetchData() {
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid, "onboarding", "rookgedrag"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.type === "sigaretten") {
          setType("sigaretten");
          setPerDag(data.perDag?.toString() || "");
          setSigPerPakje(data.sigarettenPerPakje?.toString() || "20");
          setKostenPerPakje(data.kostenPerPakje?.toString() || "");
        } else if (data.type === "shag") {
          setType("shag");
          setPakjesPerWeek(data.pakjesPerWeek?.toString() || "");
          setKostenPerShag(data.kostenPerShag?.toString() || "");
          setSigarettenGedraaid(data.sigarettenGedraaid?.toString() || "");
        }
      }
      const snap = await getDocs(collection(db, "users", user.uid, "onboarding"));
      setCompletedSteps(snap.size);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const currentStep = 2;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    let data;
    if (type === "sigaretten") {
      data = {
        type,
        perDag: perDag ? parseInt(perDag) : null,
        sigarettenPerPakje: sigPerPakje ? parseInt(sigPerPakje) : null,
        kostenPerPakje: kostenPerPakje ? parseFloat(kostenPerPakje) : null,
        createdAt: new Date()
      };
    } else if (type === "shag") {
      data = {
        type,
        pakjesPerWeek: pakjesPerWeek ? parseInt(pakjesPerWeek) : null,
        kostenPerShag: kostenPerShag ? parseFloat(kostenPerShag) : null,
        sigarettenGedraaid: sigarettenGedraaid ? parseInt(sigarettenGedraaid) : null,
        createdAt: new Date()
      };
    }
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "rookgedrag"),
      data,
      { merge: true }
    );
    setSaving(false);
    setCompletedSteps((prev) => (prev < 3 ? 3 : prev));
    router.push("/dashboard/onboarding/step-4");
  }

  const sigarettenValid =
    type === "sigaretten" &&
    perDag.trim().length > 0 &&
    sigPerPakje.trim().length > 0 &&
    kostenPerPakje.trim().length > 0;

  const shagValid =
    type === "shag" &&
    pakjesPerWeek.trim().length > 0 &&
    kostenPerShag.trim().length > 0;

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
          Hoeveel rook je gemiddeld?
        </h2>
        <p className="mb-4 text-neutral-700 text-center">
          Kies eerst wat je rookt, daarna kun je je gebruik invullen.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={type === "sigaretten" ? "default" : "outline"}
            className={type === "sigaretten" ? "bg-orange-500 text-white" : ""}
            onClick={() => setType("sigaretten")}
            type="button"
          >
            Sigaretten
          </Button>
          <Button
            variant={type === "shag" ? "default" : "outline"}
            className={type === "shag" ? "bg-orange-500 text-white" : ""}
            onClick={() => setType("shag")}
            type="button"
          >
            Shag
          </Button>
        </div>
        {type === "sigaretten" && (
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Sigaretten per dag
              </label>
              <Input
                type="number"
                min={0}
                value={perDag}
                onChange={e => setPerDag(e.target.value)}
                placeholder="Bijv. 8"
                className="mb-2"
              />
            </div>
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Sigaretten per pakje
              </label>
              <Input
                type="number"
                min={1}
                value={sigPerPakje}
                onChange={e => setSigPerPakje(e.target.value)}
                placeholder="Bijv. 20"
                className="mb-2"
              />
            </div>
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Kosten per pakje (€)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={kostenPerPakje}
                onChange={e => setKostenPerPakje(e.target.value)}
                placeholder="Bijv. 10.00"
                className="mb-2"
              />
            </div>
          </div>
        )}
        {type === "shag" && (
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Pakjes shag per week
              </label>
              <Input
                type="number"
                min={0}
                value={pakjesPerWeek}
                onChange={e => setPakjesPerWeek(e.target.value)}
                placeholder="Bijv. 2"
                className="mb-2"
              />
            </div>
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Kosten per pakje shag (€)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={kostenPerShag}
                onChange={e => setKostenPerShag(e.target.value)}
                placeholder="Bijv. 10.00"
                className="mb-2"
              />
            </div>
            <div>
              <label className="block text-sm text-orange-700 mb-1">
                Hoeveel sigaretten draai je uit één pakje shag?
              </label>
              <Input
                type="number"
                min={0}
                value={sigarettenGedraaid}
                onChange={e => setSigarettenGedraaid(e.target.value)}
                placeholder="Bijv. 40"
                className="mb-2"
              />
              <span className="text-xs text-neutral-600">Zo kun je straks bijhouden hoeveel je niet hebt gerookt!</span>
            </div>
          </div>
        )}
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold mt-4"
          disabled={
            saving ||
            (type === "" || (type === "sigaretten" && !sigarettenValid) || (type === "shag" && !shagValid))
          }
          onClick={handleSave}
        >
          {saving ? "Opslaan..." : "Opslaan en doorgaan"}
        </Button>
      </div>
    </div>
  );
}
