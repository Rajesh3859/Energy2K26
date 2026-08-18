import { ref, onValue, remove, Unsubscribe } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { getPublicLiveMatch, getPublicLiveMatches } from "@/services/publicScore.service";

async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn("Firebase anonymous auth sign-in warning:", err);
  }
}

export async function removeLiveMatchRealtime(matchId: string) {
  try {
    await ensureAuth();
    const matchRef = ref(database, `liveMatches/${matchId}`);
    await remove(matchRef);
  } catch (err) {
    console.warn("Failed to remove live match node from client RTDB:", err);
  }
}

/**
 * Subscribes to real-time updates for a single live match from Firebase RTDB.
 * Fallback to 2-second HTTP polling if Firebase RTDB returns permission_denied.
 */
export function subscribeToLiveMatch(
  matchId: string,
  callback: (data: any) => void
): Unsubscribe {
  ensureAuth();

  let fallbackInterval: NodeJS.Timeout | null = null;
  const matchRef = ref(database, `liveMatches/${matchId}`);

  const unsubscribe = onValue(
    matchRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    },
    (error) => {
      console.warn("⚠️ Firebase RTDB listener restricted (permission_denied). Activating HTTP fallback ticker...", error);
      if (!fallbackInterval) {
        fallbackInterval = setInterval(async () => {
          try {
            const res = await getPublicLiveMatch(matchId);
            if (res && res.data) {
              callback(res.data);
            }
          } catch (e) {}
        }, 2000);
      }
    }
  );

  return () => {
    if (fallbackInterval) clearInterval(fallbackInterval);
    unsubscribe();
  };
}

/**
 * Subscribes to real-time updates for all live matches from Firebase RTDB.
 * Fallback to 2-second HTTP polling if Firebase RTDB returns permission_denied.
 */
export function subscribeToAllLiveMatches(
  callback: (matchesData: Record<string, any> | null) => void
): Unsubscribe {
  ensureAuth();

  let fallbackInterval: NodeJS.Timeout | null = null;
  const liveMatchesRef = ref(database, "liveMatches");

  const unsubscribe = onValue(
    liveMatchesRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    },
    (error) => {
      console.warn("⚠️ Firebase RTDB listener restricted (permission_denied). Activating HTTP fallback ticker...", error);
      if (!fallbackInterval) {
        fallbackInterval = setInterval(async () => {
          try {
            const res = await getPublicLiveMatches();
            const list = res.data || res || [];
            if (Array.isArray(list)) {
              const mapObj: Record<string, any> = {};
              list.forEach((m: any) => {
                mapObj[m.matchId || m.id] = m;
              });
              callback(mapObj);
            }
          } catch (e) {}
        }, 2000);
      }
    }
  );

  return () => {
    if (fallbackInterval) clearInterval(fallbackInterval);
    unsubscribe();
  };
}
