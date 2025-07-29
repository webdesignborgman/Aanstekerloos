// /components/badges/checkAndUnlockAllBadges.ts
import { ALL_BADGES, BadgeCategory } from "./ALL_BADGES";

// statValues is: { tijd: aantalDagen, geld: totaalEuro, streaks: streakAantal, gezondheid: minutenSindsStop }
export async function checkAndUnlockAllBadges(
  unlocked: string[],
  statValues: Record<BadgeCategory, number>,
  unlockBadge: (badgeId: string) => Promise<void>
) {
  for (const badge of ALL_BADGES) {
    if (
      typeof statValues[badge.category] === "number" &&
      statValues[badge.category] >= badge.value &&
      !unlocked.includes(badge.id)
    ) {
      await unlockBadge(badge.id);
    }
  }
}
