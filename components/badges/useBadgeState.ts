import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BadgeCategory, ALL_BADGES } from "./ALL_BADGES";
import { useAuth } from "@/components/auth/AuthContext";
import { useEffect, useState, useCallback } from "react";

export function useBadgeState() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [recentBadges, setRecentBadges] = useState<Record<BadgeCategory, string[]>>({
    tijd: [],
    geld: [],
    streaks: [],
    gezondheid: [],
  });

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      const badgeSnap = await getDocs(collection(db, "users", user.uid, "unlockedBadges"));
      setUnlocked(badgeSnap.docs.map((doc) => doc.id));

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      setRecentBadges(
        data?.recentBadges ||
          { tijd: [], geld: [], streaks: [], gezondheid: [] }
      );
    };
    fetchBadges();
  }, [user]);

  // 🔄 UNLOCK BADGE
  const unlockBadge = useCallback(
    async (badgeId: string) => {
      if (!user) return;
      const badgeDocRef = doc(db, "users", user.uid, "unlockedBadges", badgeId);
      const badgeSnap = await getDoc(badgeDocRef);
      if (badgeSnap.exists()) return;

      await setDoc(badgeDocRef, { unlockedAt: new Date() });

      const badge = ALL_BADGES.find((b) => b.id === badgeId);
      if (!badge) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data() || {};
      const recent = data.recentBadges || { tijd: [], geld: [], streaks: [], gezondheid: [] };
      const newArr = [...new Set([...(recent[badge.category] || []), badgeId])];

      // ✅ Gebruik setDoc met merge:true (nooit meer "No document to update"!)
      await setDoc(userRef, {
        recentBadges: {
          ...recent,
          [badge.category]: newArr,
        }
      }, { merge: true });

      setRecentBadges((prev) => ({
        ...prev,
        [badge.category]: newArr,
      }));
      setUnlocked((prev) => [...prev, badgeId]);
    },
    [user]
  );

  // 🔄 MARK CATEGORY SEEN
  const markCategorySeen = useCallback(
    async (category: BadgeCategory) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      // ✅ Gebruik setDoc met merge:true
      await setDoc(userRef, {
        recentBadges: {
          [category]: [],
        }
      }, { merge: true });
      setRecentBadges((prev) => ({
        ...prev,
        [category]: [],
      }));
    },
    [user]
  );

  return { unlocked, recentBadges, unlockBadge, markCategorySeen };
}
