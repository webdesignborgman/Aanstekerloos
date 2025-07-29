// /components/stop/CopingCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Gamepad2, PhoneCall, Brain } from "lucide-react";

export default function CopingCard({ coping }: { coping?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🛠️ Toolbox – Coping</CardTitle>
        {coping && (
          <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
            {coping}
          </div>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="outline" className="flex-col h-auto py-4">
          <Wind className="mb-1" />
          Ademhaling
        </Button>
        <Button variant="outline" className="flex-col h-auto py-4">
          <Gamepad2 className="mb-1" />
          Spelletje
        </Button>
        <Button variant="outline" className="flex-col h-auto py-4">
          <PhoneCall className="mb-1" />
          Bel buddy
        </Button>
        <Button variant="outline" className="flex-col h-auto py-4">
          <Brain className="mb-1" />
          Tip lezen
        </Button>
      </CardContent>
    </Card>
  );
}
