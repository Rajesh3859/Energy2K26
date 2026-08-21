import { apiRequest } from "@/lib/api";
import { database } from "@/lib/firebase";
import { ref, push, runTransaction } from "firebase/database";

export interface BadmintonActionPayload {
  teamId: string;
  action?: string;
  type?: string;
  points?: number;
  teamName?: string;
  playerName?: string;
  label?: string;
}

export async function badmintonAction(
  matchId: string,
  action: BadmintonActionPayload
) {
  console.log("🏸 BADMINTON REQUEST");
  console.log("Match ID:", matchId);
  console.log("Action:", action);

  const teamId = action.teamId;
  const actionType = action.action || action.type || "point";
  const points = typeof action.points === "number" ? action.points : 1;
  const teamName = action.teamName || "";
  const playerName = action.playerName || "";

  const eventPayload = {
    type: actionType,
    teamId,
    teamName,
    playerName,
    points,
    description: `Badminton Point (+${points}) scored by ${playerName || "Player"} (${teamName})`,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  let updatedScoreA: number | undefined;
  let updatedScoreB: number | undefined;

  // 1. Instant RTDB Update & Game Score Calculation for Badminton (21 pts per game, 2 pts lead rule)
  try {
    const matchRef = ref(database, `liveMatches/${matchId}`);
    await runTransaction(matchRef, (currentData) => {
      if (!currentData) return currentData;

      const teamAId = (currentData?.teamA?.teamId || currentData?.teamAId || "teamA")?.toString().trim();
      const teamBId = (currentData?.teamB?.teamId || currentData?.teamBId || "teamB")?.toString().trim();
      const isTeamA = teamId.toString().trim() === teamAId || (teamId.toString().trim() !== teamBId && teamAId === "teamA");

      if (!currentData.teamA) currentData.teamA = {};
      if (!currentData.teamB) currentData.teamB = {};

      let curGameA = currentData.currentGameTeamA ?? currentData.gameScore?.currentGameTeamA ?? 0;
      let curGameB = currentData.currentGameTeamB ?? currentData.gameScore?.currentGameTeamB ?? 0;
      let gamesWonA = currentData.gamesWonTeamA ?? currentData.gameScore?.gamesWonTeamA ?? (typeof currentData.teamA.score === "number" ? currentData.teamA.score : 0);
      let gamesWonB = currentData.gamesWonTeamB ?? currentData.gameScore?.gamesWonTeamB ?? (typeof currentData.teamB.score === "number" ? currentData.teamB.score : 0);
      let currentGame = currentData.currentGame ?? currentData.gameScore?.currentGame ?? 1;

      if (isTeamA) {
        curGameA += points;
      } else {
        curGameB += points;
      }

      // Badminton Game Winning Condition: 21 points & at least 2 points lead (or capped at 30)
      if ((curGameA >= 21 && curGameA - curGameB >= 2) || curGameA >= 30) {
        gamesWonA += 1;
        curGameA = 0;
        curGameB = 0;
        currentGame += 1;
      } else if ((curGameB >= 21 && curGameB - curGameA >= 2) || curGameB >= 30) {
        gamesWonB += 1;
        curGameA = 0;
        curGameB = 0;
        currentGame += 1;
      }

      currentData.teamA.score = gamesWonA;
      currentData.scoreTeamA = gamesWonA;
      currentData.teamB.score = gamesWonB;
      currentData.scoreTeamB = gamesWonB;

      currentData.currentGameTeamA = curGameA;
      currentData.currentGameTeamB = curGameB;
      currentData.gamesWonTeamA = gamesWonA;
      currentData.gamesWonTeamB = gamesWonB;
      currentData.currentGame = currentGame;

      currentData.gameScore = {
        gamesWonTeamA: gamesWonA,
        gamesWonTeamB: gamesWonB,
        currentGame,
        currentGameTeamA: curGameA,
        currentGameTeamB: curGameB,
      };

      currentData.updatedAt = Date.now();

      updatedScoreA = gamesWonA;
      updatedScoreB = gamesWonB;

      return currentData;
    });

    // Push event to RTDB events feed
    await push(ref(database, `liveMatches/${matchId}/events`), eventPayload).catch(() => {});
  } catch (rtdbErr) {
    console.warn("⚠️ Direct RTDB Badminton update warning:", rtdbErr);
  }

  // 2. Sync REST API
  try {
    const res = await apiRequest(
      `/live-matches/${matchId}/badminton/action`,
      {
        method: "POST",
        body: JSON.stringify(action),
      }
    );
    if (res && (typeof res.scoreA === "number" || typeof res.scoreB === "number")) {
      return res;
    }
  } catch {
    // Graceful fallback to RTDB state
  }

  return { success: true, scoreA: updatedScoreA, scoreB: updatedScoreB };
}
