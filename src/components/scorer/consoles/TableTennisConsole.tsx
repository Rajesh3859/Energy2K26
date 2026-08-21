"use client";

import { useState, useEffect } from "react";
import { tableTennisAction } from "@/services/tabletennis.service";

interface TableTennisConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function TableTennisConsole({ match, liveData, onEventAdded }: TableTennisConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const initialScoreA = liveData?.gamesWonTeamA ?? liveData?.teamA?.score ?? liveData?.scoreTeamA ?? match?.scoreTeamA ?? 0;
  const initialScoreB = liveData?.gamesWonTeamB ?? liveData?.teamB?.score ?? liveData?.scoreTeamB ?? match?.scoreTeamB ?? 0;

  const [gamesA, setGamesA] = useState<number>(initialScoreA);
  const [gamesB, setGamesB] = useState<number>(initialScoreB);
  const [curPtsA, setCurPtsA] = useState<number>(liveData?.currentGameTeamA ?? 0);
  const [curPtsB, setCurPtsB] = useState<number>(liveData?.currentGameTeamB ?? 0);
  const [currentGame, setCurrentGame] = useState<number>(liveData?.currentGame ?? 1);

  useEffect(() => {
    if (typeof liveData?.gamesWonTeamA === "number") setGamesA(liveData.gamesWonTeamA);
    else if (typeof liveData?.teamA?.score === "number") setGamesA(liveData.teamA.score);

    if (typeof liveData?.gamesWonTeamB === "number") setGamesB(liveData.gamesWonTeamB);
    else if (typeof liveData?.teamB?.score === "number") setGamesB(liveData.teamB.score);

    if (typeof liveData?.currentGameTeamA === "number") setCurPtsA(liveData.currentGameTeamA);
    if (typeof liveData?.currentGameTeamB === "number") setCurPtsB(liveData.currentGameTeamB);
    if (typeof liveData?.currentGame === "number") setCurrentGame(liveData.currentGame);
  }, [liveData]);

  const currentTeamId = teamId || teamAId;

  async function handleAddTTPoint(targetTeamId: string, type: string, label: string) {
    const isTeamA = targetTeamId === teamAId;
    const tName = isTeamA ? teamAName : teamBName;

    // Optimistic UI updates
    if (isTeamA) setCurPtsA((prev) => prev + 1);
    else setCurPtsB((prev) => prev + 1);

    try {
      setLoading(true);
      await tableTennisAction(matchId, {
        type: type,
        teamId: targetTeamId,
        teamName: tName,
        playerName: playerName || "Player",
        label: label,
      });

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Table Tennis point");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      {/* Score Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          Table Tennis Scorer Console
        </h3>
        <div className="flex items-center gap-3 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <span className="text-slate-300">{teamAName}: <span className="text-emerald-400 text-sm">{gamesA}</span> ({curPtsA} pts)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">{teamBName}: <span className="text-emerald-400 text-sm">{gamesB}</span> ({curPtsB} pts)</span>
          <span className="text-xs text-amber-400 font-mono ml-1">[Game {currentGame}]</span>
        </div>
      </div>

      {/* Main +1 Point Buttons for Each Team */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAddTTPoint(teamAId, "point", "Point (+1)")}
          disabled={loading}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          +1 {teamAName}
        </button>

        <button
          onClick={() => handleAddTTPoint(teamBId, "point", "Point (+1)")}
          disabled={loading}
          className="rounded-md bg-teal-600 hover:bg-teal-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          +1 {teamBName}
        </button>
      </div>

      {/* Action Buttons for Selected Team */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400">Selected Team for Actions:</label>
          <select
            value={currentTeamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={teamAId}>Point for: {teamAName}</option>
            <option value={teamBId}>Point for: {teamBName}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleAddTTPoint(currentTeamId, "point", "Point (+1)")}
            disabled={loading}
            className="rounded-md bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Rally Point (+1)
          </button>

          <button
            onClick={() => handleAddTTPoint(currentTeamId, "ace", "Service Winner")}
            disabled={loading}
            className="rounded-md bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Service Winner (+1)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name (Optional)</label>
        <input
          type="text"
          placeholder="e.g. Ma Long"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}

