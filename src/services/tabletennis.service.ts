import { apiRequest } from "@/lib/api";
import { database } from "@/lib/firebase";
import { ref, push, runTransaction } from "firebase/database";

export interface TableTennisActionPayload {
  type?: string;
  teamId: string;
  points?: number;
  teamName?: string;
  playerName?: string;
  label?: string;
}

export async function tableTennisAction(
  matchId: string,
  payload: TableTennisActionPayload
) {
  const teamId = payload.teamId;
  const type = payload.type || "point";
  const points = typeof payload.points === "number" ? payload.points : 1;
  const teamName = payload.teamName || "";
  const playerName = payload.playerName || "";
  const label = payload.label || (type === "ace" ? "Service Winner" : "Point (+1)");

  const eventPayload = {
    type,
    teamId,
    teamName,
    playerName,
    points,
    description: `${label} scored by ${playerName || "Player"} (${teamName})`,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };

  let updatedScoreA: number | undefined;
  let updatedScoreB: number | undefined;

  // 1. Instant RTDB Update & Game Score Calculation
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

      // Check Table Tennis game winning condition (11 points & at least 2 points lead)
      if (curGameA >= 11 && curGameA - curGameB >= 2) {
        gamesWonA += 1;
        curGameA = 0;
        curGameB = 0;
        currentGame += 1;
      } else if (curGameB >= 11 && curGameB - curGameA >= 2) {
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

    // Push event to RTDB events list
    await push(ref(database, `liveMatches/${matchId}/events`), eventPayload).catch(() => {});
  } catch (rtdbErr) {
    console.warn("⚠️ Direct RTDB Table Tennis update warning:", rtdbErr);
  }

  // 2. Sync to REST API backend silently (catch REST API non-football type errors gracefully)
  try {
    await apiRequest(`/live-matches/${matchId}/events`, {
      method: "POST",
      body: JSON.stringify(eventPayload),
    });
  } catch {
    try {
      await apiRequest(`/live-matches/${matchId}/table-tennis/action`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // Ignored since RTDB is source of truth
    }
  }

  return { success: true, scoreA: updatedScoreA, scoreB: updatedScoreB };
}
