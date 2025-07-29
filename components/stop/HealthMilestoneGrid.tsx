"use client";

import { useMemo, useEffect, useState } from "react";
import { formatDistanceStrict, differenceInMinutes } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc as firestoreDoc, getDoc } from "firebase/firestore";

interface Milestone {
  id: string;
  label: string;
  description: string;
  minutes: number;
  icon: string;
}

interface Props {
  stopDate: { seconds: number; nanoseconds: number };
}

const MILESTONES: Milestone[] = [
  { id: "20min", label: "20 minuten", description: "Hartslag & bloeddruk dalen", minutes: 20, icon: "❤️" },
  { id: "8hr", label: "8 uur", description: "Zuurstofgehalte normaliseert", minutes: 8 * 60, icon: "⚕️" },
  { id: "12hr", label: "12 uur", description: "CO-niveau daalt", minutes: 12 * 60, icon: "💨" },
  { id: "1d", label: "1 dag", description: "Kans op hartaanval daalt", minutes: 24 * 60, icon: "💉" },
  { id: "2d", label: "2 dagen", description: "Smaak & geur scherper", minutes: 2 * 24 * 60, icon: "🍽️" },
  { id: "3d", label: "3 dagen", description: "Ademen gaat makkelijker", minutes: 3 * 24 * 60, icon: "🧜" },
  { id: "1w", label: "1 week", description: "Longfunctie verbetert", minutes: 7 * 24 * 60, icon: "🪗" },
  { id: "2w", label: "2 weken", description: "Bloedsomloop beter", minutes: 14 * 24 * 60, icon: "⛹️" },
  { id: "1m", label: "1 maand", description: "Hoest verdwijnt", minutes: 30 * 24 * 60, icon: "🩼" },
  { id: "3m", label: "3 maanden", description: "+30% longcapaciteit", minutes: 90 * 24 * 60, icon: "🌿" },
  { id: "6m", label: "6 maanden", description: "Trilhaarcellen herstellen", minutes: 180 * 24 * 60, icon: "🤔" },
  { id: "9m", label: "9 maanden", description: "Minder longinfecties", minutes: 270 * 24 * 60, icon: "🪠" },
  { id: "1y", label: "1 jaar", description: "Risico hartziekten halveert", minutes: 365 * 24 * 60, icon: "💊" },
  { id: "5y", label: "5 jaar", description: "Risico beroerte daalt 50%", minutes: 5 * 365 * 24 * 60, icon: "🎉" },
  { id: "10y", label: "10 jaar", description: "Longkanker-risico halveert", minutes: 10 * 365 * 24 * 60, icon: "🤷" },
];

export default function HealthMilestoneGrid({ stopDate }: Props) {
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  // Bij eerste render: haal reeds behaalde milestones op
  useEffect(() => {
    if (!user) return;
    const fetchUnlocked = async () => {
      const ref = collection(db, "users", user.uid, "unlockedMilestones");
      const snap = await getDocs(ref);
      const ids = snap.docs.map((doc) => doc.data().milestoneId);
      setUnlockedIds(ids);
    };
    fetchUnlocked();
  }, [user]);

  // Bij nieuwe milestones: check of er milestones behaald zijn die nog niet in Firestore staan
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const startDate = new Date(stopDate.seconds * 1000);
    const totalMinutes = differenceInMinutes(now, startDate);

    MILESTONES.forEach(async (ms) => {
      if (totalMinutes >= ms.minutes && !unlockedIds.includes(ms.id)) {
        const docRef = firestoreDoc(db, "users", user.uid, "unlockedMilestones", ms.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, { milestoneId: ms.id, unlockedAt: new Date() }, { merge: true });

          if ("Notification" in window && Notification.permission === "granted") {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification("🎉 Nieuwe gezondheidsmijlpaal!", {
                body: `${ms.label} bereikt: ${ms.description}`,
                icon: "/icons/badge-health.png",
              });
            });
          }

          toast.success(`🎉 Je hebt ${ms.label} behaald: ${ms.description}`);

          // Update local unlocked lijst
          setUnlockedIds((prev) => [...prev, ms.id]);
        }
      }
    });
  }, [user, stopDate, unlockedIds]);

  // Render grid
  const cards = useMemo(() => {
    const now = new Date();
    const startDate = new Date(stopDate.seconds * 1000);
    const totalMinutes = differenceInMinutes(now, startDate);

    return MILESTONES.map((ms) => {
      const reached = totalMinutes >= ms.minutes;
      const progress = Math.min(100, Math.round((totalMinutes / ms.minutes) * 100));

      return (
        <motion.div
          key={ms.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: reached ? 0.1 : 0 }}
          className={cn(
            "rounded-xl p-4 shadow-sm border",
            reached ? "bg-green-50 border-green-200" : "bg-muted/30 border-muted"
          )}
        >
          <div className="text-xl font-bold flex items-center gap-2">
            <span>{ms.icon}</span>
            <span>{ms.label}</span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground min-h-[2rem]">{ms.description}</p>

          {!reached && (
            <>
              <Progress value={progress} className="my-2" />
              <p className="text-xs text-muted-foreground italic">
                Nog {formatDistanceStrict(now, new Date(startDate.getTime() + ms.minutes * 60 * 1000))}
              </p>
            </>
          )}

          {reached && <p className="text-xs text-green-700 mt-2">✅ Behaald</p>}
        </motion.div>
      );
    });
  }, [stopDate]);

  return (
    <section className="bg-muted/40 p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-4">💨 Gezondheidsimpact</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards}
      </div>
    </section>
  );
}
