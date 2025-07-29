"use client";
import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<BadgeCategory>("tijd");
  const { unlocked, recentBadges, markCategorySeen } = useBadgeState();

  // Reset "nieuw" badges op tab wissel
  const handleTab = (cat: BadgeCategory) => {
    setActiveTab(cat);
    if (recentBadges[cat]?.length) {
      markCategorySeen(cat);
    }
  };

  return (
    <section className="mb-12">
      <div className="bg-card text-card-foreground shadow-lg p-4 rounded-2xl">
        {/* Tabbalk */}
        <div className="flex border-b border-card-foreground/10 mb-8">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.value}
              className={`relative px-6 py-2 -mb-px font-semibold transition-all
                border-b-2
                ${
                  activeTab === cat.value
                    ? "border-green-600 text-green-900 bg-white"
                    : "border-transparent text-muted-foreground bg-transparent hover:bg-card/40"
                }
              `}
              onClick={() => handleTab(cat.value)}
              style={{
                borderTopLeftRadius: idx === 0 ? "0.75rem" : 0,
                borderTopRightRadius:
                  idx === CATEGORIES.length - 1 ? "0.75rem" : 0,
              }}
            >
              {cat.label}
              {recentBadges[cat.value]?.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white shadow font-bold">
                  {recentBadges[cat.value].length}
                </span>
              )}
            </button>
          ))}
        </div>

        <BadgesGallery
          badges={ALL_BADGES.filter((b) => b.category === activeTab)}
          unlocked={unlocked}
          newBadges={recentBadges[activeTab] || []}
        />
      </div>
    </section>
  );
}
