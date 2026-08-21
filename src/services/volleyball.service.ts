import { apiRequest } from "@/lib/api";
import { database } from "@/lib/firebase";
import { ref, push, runTransaction } from "firebase/database";

export interface VolleyballActionPayload {
  type?: string;
  teamId: string;
  points?: number;
  teamName?: string;
  playerName?: string;
  setNumber?: number;
  label?: string;
}

export interface VolleyballActionResponse {
  scoreA?: number;
  scoreB?: number;
  sportState?: any;
  event?: any;
  [key: string]: any;
}

export async function volleyballAction(
  matchId: string,
  teamIdOrPayload: string | VolleyballActionPayload,
  pointsArg?: number
): Promise<VolleyballActionResponse> {
  let teamId: string;
  let points: number;
  let type = "POINT";
  let playerName = "";
  let teamName = "";

  if (typeof teamIdOrPayload === "object") {
    teamId = teamIdOrPayload.teamId;
    points = typeof teamIdOrPayload.points === "number" ? teamIdOrPayload.points : 1;
    type = teamIdOrPayload.type || "POINT";
    playerName = teamIdOrPayload.playerName || "";
    teamName = teamIdOrPayload.teamName || "";
  } else {
    teamId = teamIdOrPayload;
    points = typeof pointsArg === "number" ? pointsArg : 1;
  }

  const payload = { type, teamId, points, playerName, teamName };

  // Execute API & RTDB updates in parallel
  const apiPromise = apiRequest(`/live-matches/${matchId}/volleyball/action`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(() => null);

  const rtdbPromise = (async () => {
    try {
      const matchRef = ref(database, `liveMatches/${matchId}`);
      let updatedScoreA: number | undefined;
      let updatedScoreB: number | undefined;

      await runTransaction(matchRef, (currentData) => {
        if (!currentData) return currentData;

        const teamAId = (currentData?.teamA?.teamId || currentData?.teamAId || "teamA")?.toString().trim();
        const teamBId = (currentData?.teamB?.teamId || currentData?.teamBId || "teamB")?.toString().trim();
        const isTeamA = teamId.toString().trim() === teamAId || (teamId.toString().trim() !== teamBId && teamAId === "teamA");

        if (!currentData.teamA) currentData.teamA = {};
        if (!currentData.teamB) currentData.teamB = {};

        let curSetA = currentData.currentSetTeamA ?? currentData.volleyballScore?.currentSetTeamA ?? 0;
        let curSetB = currentData.currentSetTeamB ?? currentData.volleyballScore?.currentSetTeamB ?? 0;
        let setsWonA = currentData.setsWonTeamA ?? currentData.volleyballScore?.setsWonTeamA ?? (typeof currentData.teamA.score === "number" ? currentData.teamA.score : 0);
        let setsWonB = currentData.setsWonTeamB ?? currentData.volleyballScore?.setsWonTeamB ?? (typeof currentData.teamB.score === "number" ? currentData.teamB.score : 0);
        let currentSet = currentData.currentSet ?? currentData.volleyballScore?.currentSet ?? 1;

        // Increment set point for the scoring team
        if (isTeamA) {
          curSetA += points;
        } else {
          curSetB += points;
        }

        // Volleyball Set Winning Condition:
        // Sets 1 to 4: 25 points & at least 2 points lead
        // Set 5 (Decider): 15 points & at least 2 points lead
        const targetSetPoints = currentSet >= 5 ? 15 : 25;

        if (curSetA >= targetSetPoints && curSetA - curSetB >= 2) {
          setsWonA += 1;
          curSetA = 0;
          curSetB = 0;
          currentSet += 1;
        } else if (curSetB >= targetSetPoints && curSetB - curSetA >= 2) {
          setsWonB += 1;
          curSetA = 0;
          curSetB = 0;
          currentSet += 1;
        }

        // Update Sets Won on Main Score
        currentData.teamA.score = setsWonA;
        currentData.scoreTeamA = setsWonA;
        currentData.teamB.score = setsWonB;
        currentData.scoreTeamB = setsWonB;

        // Update Set Points and Set structure in RTDB
        currentData.currentSetTeamA = curSetA;
        currentData.currentSetTeamB = curSetB;
        currentData.setsWonTeamA = setsWonA;
        currentData.setsWonTeamB = setsWonB;
        currentData.currentSet = currentSet;

        currentData.volleyballScore = {
          setsWonTeamA: setsWonA,
          setsWonTeamB: setsWonB,
          currentSet,
          currentSetTeamA: curSetA,
          currentSetTeamB: curSetB,
        };

        currentData.updatedAt = Date.now();

        updatedScoreA = setsWonA;
        updatedScoreB = setsWonB;

        return currentData;
      });

      // Fire-and-forget event push
      push(ref(database, `liveMatches/${matchId}/events`), {
        type,
        teamId,
        teamName: teamName || null,
        playerName: playerName || null,
        points,
        description: `Volleyball Point (+${points}) scored by ${playerName || "Player"}`,
        timestamp: Date.now(),
        createdAt: Date.now(),
      }).catch(() => {});

      return {
        scoreA: updatedScoreA,
        scoreB: updatedScoreB,
        success: true,
      };
    } catch {
      return null;
    }
  })();

  const [apiRes, rtdbRes] = await Promise.all([apiPromise, rtdbPromise]);

  if (apiRes && (typeof apiRes.scoreA === "number" || typeof apiRes.scoreB === "number")) {
    return apiRes;
  }

  if (rtdbRes) {
    return rtdbRes;
  }

  return { success: true };
}
