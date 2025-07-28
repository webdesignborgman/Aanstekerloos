// /components/stop/MotivatieCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  motivatie?: string;
}

export default function MotivatieCard({ motivatie }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 Jouw motivatie</CardTitle>
      </CardHeader>
      <CardContent>
        {motivatie ? (
          <p className="text-sm text-muted-foreground">{motivatie}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Je hebt nog geen motivatie ingevuld. Voeg dit toe in je profiel!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
