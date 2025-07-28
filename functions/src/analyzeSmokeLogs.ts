import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";

// Firebase Admin init
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const MAX_LOGS = 250; // Limiet om API-kosten te beperken

// Helper voor prompt-building met timestamp-uitleg!
function buildPrompt(logs: any[]) {
  return `
Je bent een stoppen-met-roken coach. Je krijgt een rooklogboek van een gebruiker. 
Elke entry heeft onder andere een veld "timestamp". Dit is een UNIX-timestamp in milliseconden sinds 1 januari 1970, UTC. 
Reken deze om naar lokale Nederlandse tijd (Europe/Amsterdam) en groepeer rookmomenten in de volgende dagdelen:

Elke entry heeft verder: "location" (tekst), "emotions" (array), "triggers" (array), "note" (tekst, optioneel), en "isWorkday" (boolean, optioneel).

**Taken:**
1. Geef per dagdeel (ochtend, middag, avond, nacht) het aantal rookmomenten én het percentage van het totaal. Zet dit in een markdown-tabel.
2. Toon de top-3 emoties en triggers (met aantallen) in aparte bullet lists.
3. Zet de locaties met aantallen in een markdown-tabel.
4. Indien "isWorkday" beschikbaar is, vergelijk werkdag vs weekend en beschrijf het patroon.
5. Geef praktisch en persoonlijk advies met minimaal 2 creatieve vervangstrategieën, gericht op de belangrijkste triggers/emoties/locaties.
6. Sluit af met een korte, motiverende zin (“Je kunt dit!”, “Elke kleine stap telt!” etc.).

**Format:**

**Voorbeeld van een entry:**
{
  "timestamp": 1722153600000,
  "location": "Tuin",
  "emotions": ["Gewoonte", "Onrust"],
  "triggers": ["Na eten"],
  "note": "Voelde me onrustig",
  "isWorkday": true
}

Hier volgt het logboek als JSON:
${JSON.stringify(logs, null, 2)}
`;
}

export const analyzeSmokeLogs = functions.https.onRequest(
  {
    cors: true,
    invoker: "public",
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      const uid = req.body?.uid;
      const idToken = req.body?.idToken;
      if (!uid) {
        res.status(401).json({ error: "Je moet ingelogd zijn." });
        return;
      }

      if (idToken) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          if (decodedToken.uid !== uid) {
            res.status(403).json({ error: "Ongeautoriseerd" });
            return;
          }
        } catch (error) {
          res.status(401).json({ error: "Ongeldig authenticatie token" });
          return;
        }
      }

      // OpenAI key ophalen
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        res.status(500).json({ error: "OpenAI configuratie ontbreekt" });
        return;
      }

      const openai = new OpenAI({ apiKey: openaiKey });

      // Laatste rooklogs ophalen (max 100)
      const snapshot = await db
        .collection(`users/${uid}/smokeLogs`)
        .orderBy("timestamp", "desc")
        .limit(MAX_LOGS)
        .get();
      const logs = snapshot.docs.map((doc) => doc.data());

      if (logs.length === 0) {
        res.json({ result: "Je hebt nog geen rookmomenten gelogd om te analyseren." });
        return;
      }

      if (logs.length === MAX_LOGS) {
        logs.push({ note: `Let op: alleen de laatste ${MAX_LOGS} rookmomenten zijn geanalyseerd.` });
      }

      // Prompt bouwen (zie helper)
      const prompt = buildPrompt(logs);

      // OpenAI call
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const insight = response.choices[0].message?.content ?? "Geen resultaat";

      // Analyse opslaan
      await db.doc(`users/${uid}/insights/weekly`).set({
        generatedAt: admin.firestore.Timestamp.now(),
        result: insight,
      });

      res.json({ result: insight });
    } catch (error: any) {
      console.error("Error in analyzeSmokeLogs:", error?.message ?? error);
      res.status(500).json({ error: "Er ging iets mis bij de analyse." });
    }
  }
);
