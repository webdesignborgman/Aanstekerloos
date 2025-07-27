// /components/smoke/SmokeNowModal.tsx
"use client";

import { useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

const EMOTIONS = ["Stress", "Verveling", "Blij", "Gewoonte", "Sociaal", "Onrustig", "Boos", "Moe"];
const TRIGGERS = ["Na eten", "Koffie", "Werk", "Auto", "Pauze", "Ochtendroutine", "Alcohol", "Voor het slapen"];
const LOCATIONS = ["Keuken", "Wc", "Buiten", "Tuin", "Werk", "Anders"];

export function SmokeNowModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [urgency, setUrgency] = useState<number | null>(null);
  const [isWorkday, setIsWorkday] = useState(false);
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("Anders");
  const [saving, setSaving] = useState(false);

  const handleToggle = (value: string, arr: string[], setArr: (arr: string[]) => void) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleLog = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const today = new Date();
      const logsTodaySnapshot = await getDocs(query(
        collection(db, `users/${user.uid}/smokeLogs`),
        where("timestamp", ">=", startOfDay(today)),
        where("timestamp", "<=", endOfDay(today))
      ));
      const isFirstLog = logsTodaySnapshot.empty;

      await addDoc(collection(db, `users/${user.uid}/smokeLogs`), {
        timestamp: new Date(),
        createdBy: user.uid,
        emotions,
        triggers,
        note: note || null,
        urgency: urgency ?? null,
        isWorkday: isFirstLog ? isWorkday : null,
        location: locationType !== "Anders" ? locationType : location ?? "",
      });
      toast.success("Logje toegevoegd!");
      setOpen(false);
      setEmotions([]);
      setTriggers([]);
      setNote("");
      setUrgency(null);
      setIsWorkday(false);
      setLocation("");
      setLocationType("Anders");
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
            <div>
              <div className="text-sm font-medium mb-1">Noodzaak (1–10)</div>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <Button
                    key={val}
                    size="icon"
                    variant={urgency === val ? "default" : "outline"}
                    onClick={() => setUrgency(val)}
                    className="w-8 h-8 text-sm"
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="isWorkday"
                checked={isWorkday}
                onChange={(e) => setIsWorkday(e.target.checked)}
              />
              <label htmlFor="isWorkday" className="text-sm">Vandaag een werkdag?</label>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Locatie</div>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {locationType === "Anders" && (
                <input
                  className="w-full border rounded p-2 text-sm mt-2"
                  type="text"
                  placeholder="Eigen locatie..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              )}
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
