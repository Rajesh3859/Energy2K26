import { ref, onValue, Unsubscribe } from "firebase/database";
import { database } from "@/lib/firebase";

/**
 * Subscribes to real-time updates for a single live match from Firebase RTDB.
 * Firebase automatically pushes any score/event/status changes to connected listeners.
 */
export function subscribeToLiveMatch(
  matchId: string,
  callback: (data: any) => void
): Unsubscribe {
  const matchRef = ref(database, `liveMatches/${matchId}`);
  const unsubscribe = onValue(
    matchRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Firebase RTDB error listening to match ${matchId}:`, error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates for all live matches from Firebase RTDB.
 * Pushes instant updates across Admin, Scorer, and Public screens.
 */
export function subscribeToAllLiveMatches(
  callback: (matchesData: Record<string, any> | null) => void
): Unsubscribe {
  const liveMatchesRef = ref(database, "liveMatches");
  const unsubscribe = onValue(
    liveMatchesRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Firebase RTDB error listening to all live matches:", error);
    }
  );

  return unsubscribe;
}
