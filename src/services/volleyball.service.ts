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

  if (typeof teamIdOrPayload === "object") {
    teamId = teamIdOrPayload.teamId;
    points = typeof teamIdOrPayload.points === "number" ? teamIdOrPayload.points : 1;
    type = teamIdOrPayload.type || "POINT";
  } else {
    teamId = teamIdOrPayload;
    points = typeof pointsArg === "number" ? pointsArg : 1;
  }

  const payload = { type, teamId, points };

  // Execute API & RTDB updates in parallel to minimize response time
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

        if (isTeamA) {
          if (!currentData.teamA) currentData.teamA = {};
          currentData.teamA.score = (currentData.teamA.score || 0) + points;
          currentData.scoreTeamA = currentData.teamA.score;
        } else {
          if (!currentData.teamB) currentData.teamB = {};
          currentData.teamB.score = (currentData.teamB.score || 0) + points;
          currentData.scoreTeamB = currentData.teamB.score;
        }
        currentData.updatedAt = Date.now();

        updatedScoreA = currentData?.teamA?.score ?? currentData?.scoreTeamA;
        updatedScoreB = currentData?.teamB?.score ?? currentData?.scoreTeamB;

        return currentData;
      });

      // Fire-and-forget event push
      push(ref(database, `liveMatches/${matchId}/events`), {
        type,
        teamId,
        points,
        timestamp: Date.now(),
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
