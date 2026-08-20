import { apiRequest } from "@/lib/api";
import { database } from "@/lib/firebase";
import { ref, push, get, update } from "firebase/database";

export async function cricketAction(
  matchId: string,
  action: {
    type: string;
    runs?: number;
    deliveryType?: string;
    battingTeamId?: string;
    teamId?: string;
    teamName?: string;
    bowlerName?: string;
    strikerName?: string;
    nonStrikerName?: string;
    outBatsmanName?: string;
    wicketType?: string;
  }
) {
  console.log("🔥 CRICKET ACTION SUBMITTED:", { matchId, action });

  const battingTeamId = (action.battingTeamId || action.teamId || "")?.toString().trim();
  const rawType = (action.type || "run").toLowerCase();

  let eventType = rawType;
  if (rawType === "run") {
    if (action.runs === 4) eventType = "boundary_4";
    else if (action.runs === 6) eventType = "boundary_6";
    else eventType = "run";
  }

  const runsToAdd = typeof action.runs === "number" ? action.runs : 0;

  // 1. Precise Cricket Event payload for RTDB
  const cricketEvent = {
    type: eventType,
    runs: runsToAdd,
    deliveryType: action.deliveryType || "LEGAL",
    teamId: battingTeamId,
    teamName: action.teamName || null,
    strikerName: action.strikerName || null,
    bowlerName: action.bowlerName || null,
    outBatsmanName: action.outBatsmanName || null,
    wicketType: action.wicketType || null,
    description: `Cricket ${eventType.toUpperCase()}: ${runsToAdd} run(s)`,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  // 2. Direct push to Firebase Realtime Database under liveMatches/{matchId}/events & Update team score
  try {
    const matchRef = ref(database, `liveMatches/${matchId}`);
    const matchSnap = await get(matchRef);

    if (matchSnap.exists()) {
      const matchData = matchSnap.val();
      const teamAId = (matchData?.teamA?.teamId || matchData?.teamAId || "teamA")?.toString().trim();
      const teamBId = (matchData?.teamB?.teamId || matchData?.teamBId || "teamB")?.toString().trim();

      // Push event to RTDB
      const matchEventsRef = ref(database, `liveMatches/${matchId}/events`);
      await push(matchEventsRef, cricketEvent);

      // Update team score in RTDB
      if (runsToAdd > 0 && battingTeamId) {
        const isTeamA = battingTeamId === teamAId || (battingTeamId !== teamBId && teamAId === "teamA");
        const targetTeamKey = isTeamA ? "teamA" : "teamB";
        const currentScore = typeof matchData?.[targetTeamKey]?.score === "number"
          ? matchData[targetTeamKey].score
          : (typeof matchData?.[`score${isTeamA ? "TeamA" : "TeamB"}`] === "number" ? matchData[`score${isTeamA ? "TeamA" : "TeamB"}`] : 0);

        const newScore = currentScore + runsToAdd;

        const updates: Record<string, any> = {
          [`${targetTeamKey}/score`]: newScore,
          [`score${isTeamA ? "TeamA" : "TeamB"}`]: newScore,
          updatedAt: Date.now(),
        };

        await update(matchRef, updates);
        console.log(`✅ Updated ${targetTeamKey} score in RTDB to ${newScore}`);
      }
    } else {
      // Fallback push event if snapshot does not exist
      const matchEventsRef = ref(database, `liveMatches/${matchId}/events`);
      await push(matchEventsRef, cricketEvent);
    }
  } catch (rtdbErr) {
    console.warn("⚠️ Direct RTDB update warning:", rtdbErr);
  }

  // 3. REST API backend sync attempt
  try {
    await apiRequest(`/live-matches/${matchId}/cricket/action`, {
      method: "POST",
      body: JSON.stringify(action),
    });
  } catch (err: any) {
    console.warn("Backend REST API sync notice:", err?.message || err);
  }

  return { success: true, message: "Cricket action recorded successfully" };
}
