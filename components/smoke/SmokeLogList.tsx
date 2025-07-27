// components/smoke/SmokeLogList.tsx
"use client";

import { useState } from "react";
import { SmokeLog } from "@/types/smokeLog";
import { format, isSameDay } from "date-fns";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MultiSelectComboBox } from "@/components/ui/MultiSelectComboBox";

const EMOTIONS = [
  "Stress", "Verveling", "Blij", "Gewoonte", "Sociaal", "Onrust", "Saaie klus", "Zenuwen", "Focus", "Verdrietig"
];
const TRIGGERS = [
  "Na eten", "Koffie", "Werk", "Auto", "Pauze", "Alcohol", "Met vrienden", "TV", "Ochtend", "Avond"
];
const LOCATIONS = ["Keuken", "Wc", "Buiten", "Tuin", "Werk", "Anders"];

interface Props {
  logs: SmokeLog[];
}

export function SmokeLogList({ logs }: Props) {
  const { user } = useAuth();
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<SmokeLog>>({});
  const [deleteCandidate, setDeleteCandidate] = useState<SmokeLog | null>(null);

  const isFirstLogOfToday = (log: SmokeLog) => {
    return !logs.some(
      (l) =>
        l.id !== log.id &&
        isSameDay(l.timestamp, log.timestamp) &&
        l.timestamp < log.timestamp
    );
  };

  const startEdit = (log: SmokeLog) => {
    setEditId(log.id);
    setEditState({
      emotions: [...(log.emotions || [])],
      triggers: [...(log.triggers || [])],
      note: log.note ?? "",
      urgency: log.urgency ?? undefined,
      isWorkday: log.isWorkday ?? false,
      location: log.location ?? "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditState({});
  };

  const saveEdit = async (log: SmokeLog) => {
    if (!user) return;
    const ref = doc(db, `users/${user.uid}/smokeLogs/${log.id}`);
    await updateDoc(ref, {
      emotions: editState.emotions ?? [],
      triggers: editState.triggers ?? [],
      note: editState.note ?? "",
      urgency: editState.urgency ?? null,
      isWorkday: editState.isWorkday ?? null,
      location: editState.location ?? "",
    });
    setEditId(null);
    setEditState({});
  };

  const confirmDelete = async () => {
    if (!user || !deleteCandidate) return;
    await deleteDoc(doc(db, `users/${user.uid}/smokeLogs/${deleteCandidate.id}`));
    setDeleteCandidate(null);
  };

  const sorted = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <>
      <div className="space-y-2">
        {sorted.map((l) => (
          <div
            key={l.id}
            className={cn(
              "bg-card p-3 rounded-xl shadow flex items-center justify-between gap-2 transition-all",
              editId === l.id && "ring-2 ring-primary/60"
            )}
          >
            {editId === l.id ? (
              <form
                className="flex-1 flex flex-col gap-1"
                onSubmit={e => {
                  e.preventDefault();
                  saveEdit(l);
                }}
              >
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">{format(l.timestamp, "dd/MM/yyyy HH:mm")}</span>
                  <MultiSelectComboBox
                    options={EMOTIONS}
                    selected={editState.emotions as string[] || []}
                    onChange={arr => setEditState(s => ({ ...s, emotions: arr }))}
                    placeholder="Emoties"
                    chipColor="bg-green-100 text-green-800"
                  />
                  <MultiSelectComboBox
                    options={TRIGGERS}
                    selected={editState.triggers as string[] || []}
                    onChange={arr => setEditState(s => ({ ...s, triggers: arr }))}
                    placeholder="Triggers"
                    chipColor="bg-orange-100 text-orange-800"
                  />
                </div>
                <input
                  className="border rounded p-1 text-xs w-full mt-1"
                  value={editState.note ?? ""}
                  onChange={e => setEditState(s => ({ ...s, note: e.target.value }))}
                  placeholder="Notitie..."
                  maxLength={120}
                />
                <div className="flex gap-2 items-center text-xs mt-1">
                  <label className="w-28 shrink-0" htmlFor="urgency">Noodzaak (1–10):</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    id="urgency"
                    value={editState.urgency ?? ""}
                    onChange={(e) => setEditState(s => ({ ...s, urgency: parseInt(e.target.value) }))}
                    className="border rounded p-1 w-16"
                  />
                </div>
                {isFirstLogOfToday(l) && (
                  <div className="flex gap-2 items-center text-xs mt-1">
                    <input
                      type="checkbox"
                      id="isWorkday"
                      checked={editState.isWorkday ?? false}
                      onChange={(e) => setEditState(s => ({ ...s, isWorkday: e.target.checked }))}
                    />
                    <label htmlFor="isWorkday">Werkdag?</label>
                  </div>
                )}
                <div className="flex gap-2 items-center text-xs mt-1">
                  <label className="w-28 shrink-0" htmlFor="location">Locatie:</label>
                  <select
                    id="location"
                    value={LOCATIONS.includes(editState.location || "") ? editState.location || "" : "Anders"}

                    onChange={(e) => {
                      const value = e.target.value;
                      setEditState((s) => ({
                        ...s,
                        location: value === "Anders" ? "" : value,
                      }));
                    }}
                    className="border rounded p-1"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {(!LOCATIONS.includes(editState.location ?? "") || editState.location === "Anders") && (
                    <input
                      type="text"
                      className="border rounded p-1 text-xs"
                      placeholder="Eigen locatie..."
                      value={editState.location ?? ""}
                      onChange={(e) => setEditState(s => ({ ...s, location: e.target.value }))}
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <Button type="submit" size="sm" className="h-7 px-2 py-1">Opslaan</Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2 py-1" onClick={cancelEdit}>
                    Annuleer
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">{format(l.timestamp, "dd/MM/yyyy HH:mm")}</span>
                  {l.emotions?.map(val => (
                    <span key={val} className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">{val}</span>
                  ))}
                  {l.triggers?.map(val => (
                    <span key={val} className="bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs">{val}</span>
                  ))}
                </div>
                {l.note && <div className="text-xs text-muted-foreground italic">{l.note}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  {l.urgency && <>🔸 Noodzaak: <strong>{l.urgency}/10</strong><br /></>}
                  {l.isWorkday !== undefined && <>📅 Werkdag: {l.isWorkday ? "Ja" : "Nee"}<br /></>}
                  {l.location && <>📍 Locatie: {l.location}</>}
                </div>
              </div>
            )}
            <div className="flex gap-1 items-center ml-2 shrink-0">
              {editId !== l.id && (
                <>
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-primary/10 focus-visible:ring-2 focus:outline-none transition"
                    title="Bewerk"
                    onClick={() => startEdit(l)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-destructive/10 focus-visible:ring-2 focus:outline-none transition"
                    title="Verwijder"
                    onClick={() => setDeleteCandidate(l)}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!deleteCandidate} onOpenChange={v => !v && setDeleteCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verwijder rooklogje?</DialogTitle>
          </DialogHeader>
          <p>Weet je zeker dat je deze entry wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>
              Annuleer
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Ja, verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}