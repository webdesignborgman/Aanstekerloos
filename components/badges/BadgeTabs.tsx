"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ALL_BADGES, BadgeCategory } from "./ALL_BADGES";
import BadgesGallery from "./BadgesGallery";
import { useBadgeState } from "./useBadgeState";

const CATEGORIES: { label: string; value: BadgeCategory }[] = [
  { label: "Tijd", value: "tijd" },
  { label: "Geld", value: "geld" },
  { label: "Streaks", value: "streaks" },
  { label: "Gezondheid", value: "gezondheid" },
];

export default function BadgeTabs() {
  const { unlocked, recentBadges, markCategorySeen } = useBadgeState();

  return (
    <section className="mb-12">
      <div className="bg-card text-card-foreground shadow-lg p-4 rounded-2xl">
        <Tabs defaultValue="tijd" className="">
          <TabsList className="w-full flex justify-start gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="relative"
                onClick={() => {
                  if (recentBadges[cat.value]?.length)
                    markCategorySeen(cat.value);
                }}
              >
                {cat.label}
                {recentBadges[cat.value]?.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white shadow font-bold">
                    {recentBadges[cat.value].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((cat) => (
            <TabsContent value={cat.value} key={cat.value} className="p-0">
              <BadgesGallery
                badges={ALL_BADGES.filter((b) => b.category === cat.value)}
                unlocked={unlocked}
                newBadges={recentBadges[cat.value] || []}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
