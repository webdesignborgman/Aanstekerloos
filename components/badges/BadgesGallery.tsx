"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Badge } from "./ALL_BADGES";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function BadgesGallery({
  badges,
  unlocked,
  newBadges,
}: {
  badges: Badge[];
  unlocked: string[];
  newBadges: string[];
}) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevNewBadgesRef = useRef<string[]>([]);
  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start confetti alleen als het aantal nieuwe badges toeneemt en confetti niet al actief is
    const isUnlock = newBadges.length > 0 &&
      (prevNewBadgesRef.current.length === 0 ||
        newBadges.some((id) => !prevNewBadgesRef.current.includes(id)));

    if (isUnlock && !showConfetti) {
      setShowConfetti(true);
      if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
      confettiTimeout.current = setTimeout(() => setShowConfetti(false), 5000); // 3s
    }

    prevNewBadgesRef.current = newBadges;
    // Cleanup bij unmount
    return () => {
      if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
    };
  }, [newBadges, showConfetti]);

  return (
    <div className="relative">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={350} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const unlockedNow = unlocked.includes(badge.id);
          const isNew = newBadges.includes(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-xl border shadow-sm p-4 flex flex-col items-center cursor-pointer outline-none",
                unlockedNow
                  ? isNew
                    ? "bg-yellow-100 border-yellow-300 ring-2 ring-yellow-500/70"
                    : "bg-green-50 border-green-200"
                  : "bg-muted/30 border-muted opacity-60"
              )}
              tabIndex={0}
              whileHover={unlockedNow ? { scale: 1.06 } : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-4xl mb-2">{badge.icon}</span>
              <span className="font-semibold text-center">{badge.label}</span>
              <span className="text-xs text-muted-foreground mt-1 text-center">{badge.description}</span>
              {unlockedNow && <span className="text-green-600 text-xs mt-2">✅ Behaald</span>}
              {!unlockedNow && <span className="text-xs text-gray-400 mt-2">🔒</span>}
              {isNew && <span className="text-xs bg-yellow-400 text-yellow-900 rounded-full px-2 mt-1">Nieuw!</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
