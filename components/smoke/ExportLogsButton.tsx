"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export function ExportLogsButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setLoading(true);

    const snapshot = await getDocs(collection(db, `users/${user.uid}/smokeLogs`));
    const data = snapshot.docs.map((doc) => doc.data());

    const text = data
      .map((entry, i) => {
        const date = format(entry.timestamp.toDate?.() || entry.timestamp, "EEEE d MMMM yyyy HH:mm", { locale: nl });
        const emoties = entry.emotions?.join(", ") || "-";
        const triggers = entry.triggers?.join(", ") || "-";
        const locatie = entry.location || "-";
        const notitie = entry.note || "-";

        return `📌 Rookmoment #${i + 1}\n🕒 Tijd: ${date}\n📍 Locatie: ${locatie}\n🎭 Emoties: ${emoties}\n⚡ Triggers: ${triggers}\n📝 Notitie: ${notitie}\n---\n`;
      })
      .join("\n");

    const header = `🧠 Rookgedrag logboek – gegenereerd op ${new Date().toLocaleString("nl-NL")}\nAantal momenten: ${data.length}\n\n${text}`;
    const blob = new Blob([header], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "rookgedrag_logboek.txt");

    setLoading(false);
  };

  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? "📦 Exporteren..." : "📤 Exporteer rookgedrag"}
    </Button>
  );
}
