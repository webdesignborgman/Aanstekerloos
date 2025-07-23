// /components/smoke/SmokeNowModal.tsx
"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const EMOTIONS = ["Stress", "Verveling", "Blij", "Gewoonte", "Sociaal", "Onrustig", "Boos", "Moe"];
const TRIGGERS = ["Na eten", "Koffie", "Werk", "Auto", "Pauze", "Ochtendroutine", "Alcohol", "Voor het slapen"];

export function SmokeNowModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleToggle = (value: string, arr: string[], setArr: (arr: string[]) => void) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleLog = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/smokeLogs`), {
        timestamp: new Date(),
        createdBy: user.uid,
        emotions,
        triggers,
        note: note || null,
      });
      toast.success("Logje toegevoegd!");
      setOpen(false);
      setEmotions([]);
      setTriggers([]);
      setNote("");
    } catch {
      toast.error("Kon niet loggen.");
    }
    setSaving(false);
  };

  const handleClick = () => setOpen(true);

  return (
    <>
      <Button onClick={handleClick} className="bg-accent">Ik rook nu</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertel iets over dit moment</DialogTitle>
            <DialogDescription>
              Selecteer je emoties, triggers en voeg eventueel een notitie toe. Zo krijg je meer inzicht in je rookgedrag.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Emoties (meerdere mogelijk)</div>
              <div className="flex gap-2 flex-wrap">
                {EMOTIONS.map((e) => (
                  <Button
                    key={e}
                    variant={emotions.includes(e) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggle(e, emotions, setEmotions)}
                    type="button"
                  >
                    {e}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Triggers (meerdere mogelijk)</div>
              <div className="flex gap-2 flex-wrap">
                {TRIGGERS.map((t) => (
                  <Button
                    key={t}
                    variant={triggers.includes(t) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggle(t, triggers, setTriggers)}
                    type="button"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Notitie (optioneel)</div>
              <input
                className="w-full border rounded p-2 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                placeholder="Bijvoorbeeld: met vrienden op terras"
                type="text"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Annuleren
              </Button>
            </DialogClose>
            <Button onClick={handleLog} disabled={saving}>
              Loggen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
