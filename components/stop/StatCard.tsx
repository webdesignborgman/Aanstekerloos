// /components/stop/StatCard.tsx
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  icon?: string;
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <Card className="bg-neutralBg-100 text-center shadow-sm rounded-xl">
      <CardContent className="py-4">
        <div className="text-2xl font-semibold">{icon} {value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
