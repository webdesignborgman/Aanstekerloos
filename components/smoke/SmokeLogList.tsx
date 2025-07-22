// /components/smoke/SmokeLogList.tsx
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { SmokeLog } from "@/types/smokeLog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react"; // <--- icons!

export function SmokeLogList() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SmokeLog[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmotions, setEditEmotions] = useState<string[]>([]);
  const [editTriggers, setEditTriggers] = useState<string[]>([]);
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/smokeLogs`),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setLogs(
        snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(),
            emotions: Array.isArray(data.emotions) ? data.emotions : [],
            triggers: Array.isArray(data.triggers) ? data.triggers : [],
            note: typeof data.note === "string" ? data.note : "",
            createdBy: data.createdBy ?? "",
          } as SmokeLog;
        })
      );
    });
    return () => unsub();
  }, [user]);

  const startEdit = (log: SmokeLog) => {
    setEditId(log.id);
    setEditEmotions(log.emotions ?? []);
    setEditTriggers(log.triggers ?? []);
    setEditNote(log.note ?? "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditEmotions([]);
    setEditTriggers([]);
    setEditNote("");
  };

  const saveEdit = async (log: SmokeLog) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/smokeLogs/${log.id}`), {
      emotions: editEmotions,
      triggers: editTriggers,
      note: editNote,
    });
    toast.success("Log bijgewerkt!");
    cancelEdit();
  };

  const removeLog = async (log: SmokeLog) => {
    if (!user) return;
    if (confirm("Weet je zeker dat je deze log wilt verwijderen?")) {
      await deleteDoc(doc(db, `users/${user.uid}/smokeLogs/${log.id}`));
      toast.success("Log verwijderd");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <Card key={log.id} className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-xs">
              {log.timestamp.toLocaleString("nl-NL")}
            </div>
            <div className="flex gap-1">
              {editId !== log.id ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(log)}
                    aria-label="Bewerken"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeLog(log)}
                    aria-label="Verwijderen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => saveEdit(log)}
                    aria-label="Opslaan"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={cancelEdit}
                    aria-label="Annuleren"
                  >
                    <X className="w-4 h-4 text-orange-400" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {editId === log.id ? (
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-xs font-semibold">Emoties:</label>
                <CreatableSelect
                  isMulti
                  value={editEmotions.map((e) => ({ value: e, label: e }))}
                  onChange={(vals) =>
                    setEditEmotions(vals.map((v) => v.value))
                  }
                  placeholder="Emoties"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Triggers:</label>
                <CreatableSelect
                  isMulti
                  value={editTriggers.map((t) => ({ value: t, label: t }))}
                  onChange={(vals) =>
                    setEditTriggers(vals.map((v) => v.value))
                  }
                  placeholder="Triggers"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Notitie:</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm mt-1"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* Alleen tonen als er emoties zijn */}
              {log.emotions?.length > 0 && (
                <div>
                  <span className="text-xs font-semibold">Emoties: </span>
                  {log.emotions.map((e, i) => (
                    <span
                      key={e + i}
                      className="inline-block bg-orange-100 text-orange-700 rounded px-2 mr-1 text-xs"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {/* Alleen tonen als er triggers zijn */}
              {log.triggers?.length > 0 && (
                <div>
                  <span className="text-xs font-semibold">Triggers: </span>
                  {log.triggers.map((t, i) => (
                    <span
                      key={t + i}
                      className="inline-block bg-sky-100 text-sky-700 rounded px-2 mr-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {log.note && (
                <div>
                  <span className="text-xs font-semibold">Notitie: </span>
                  <span className="text-xs">{log.note}</span>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
