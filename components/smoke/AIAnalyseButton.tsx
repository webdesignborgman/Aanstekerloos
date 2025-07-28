"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export function AIAnalyseButton() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleAnalyse = async () => {
    setLoading(true);
    setOutput(null);
    try {
      // Haal uid op van ingelogde gebruiker
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setOutput("Je moet ingelogd zijn.");
        setLoading(false);
        return;
      }

      // Haal het ID token op voor authenticatie
      let idToken = null;
      try {
        idToken = await auth.currentUser?.getIdToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
      }

      // Stuur POST request naar de HTTP functie
      const res = await fetch("/api/analyzeSmokeLogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, idToken }),
      });
      const json = await res.json();
      setOutput(json.result as string);
    } catch {
      setOutput("Er ging iets mis met de analyse.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAnalyse} disabled={loading}>
        {loading ? "🧠 Bezig met analyseren..." : "🧠 Genereer AI-inzicht"}
      </Button>
      {output && (
        <div className="bg-muted p-4 rounded whitespace-pre-wrap text-left">
          {output}
        </div>
      )}
    </div>
  );
}
