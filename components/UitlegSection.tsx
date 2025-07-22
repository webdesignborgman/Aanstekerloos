// components/UitlegSection.tsx
import { Card, CardContent } from "@/components/ui/card";

type UitlegBlok = {
  title: string;
  text: string;
  icon: string;
};

const uitlegBlokken: UitlegBlok[] = [
  {
    title: "Inzicht in je gewoonte",
    text: "Log je rookmomenten, ontdek patronen en triggers. Grafieken & heatmaps helpen je écht begrijpen waar jouw uitdaging zit.",
    icon: "📊",
  },
  {
    title: "Persoonlijk stopplan",
    text: "Stel je stopdatum in, krijg een plan op maat. Kleine opdrachten, dagelijkse check-ins en een coach in je broekzak.",
    icon: "🗓️",
  },
  {
    title: "Dagelijkse begeleiding",
    text: "Toolbox voor moeilijke momenten, badges en beloningen, inspirerende statistieken. Maak stoppen een avontuur!",
    icon: "🏅",
  },
];

export function UitlegSection() {
  return (
    <section id="uitleg" className="max-w-4xl mx-auto px-4 py-16 grid gap-8 md:grid-cols-3">
      {uitlegBlokken.map((blok, i) => (
        <Card key={i} className="rounded-2xl shadow-lg hover:scale-105 transition">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="text-3xl mb-2">{blok.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{blok.title}</h3>
            <p className="text-gray-600">{blok.text}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
