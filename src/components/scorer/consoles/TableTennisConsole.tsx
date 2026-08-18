"use client";

import { useState } from "react";
import { createFootballEvent } from "@/services/liveScore.service";

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

  const currentTeamId = teamId || teamAId;

  async function handleAddTTPoint(type: string, label: string) {
    try {
      setLoading(true);
      const isTeamA = currentTeamId === teamAId;
      const tName = isTeamA ? teamAName : teamBName;

      await createFootballEvent(matchId, {
        type: type,
        teamId: currentTeamId,
        teamName: tName,
        minute: liveData?.currentGame || 1,
        playerName: playerName || "Player",
        description: `${label} scored by ${playerName || "Player"} (${tName})`,
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <span>🏓</span> Table Tennis Scorer Console
        </h3>
        <select
          value={currentTeamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value={teamAId}>Point for: {teamAName}</option>
          <option value={teamBId}>Point for: {teamBName}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleAddTTPoint("point", "Point (+1)")}
          disabled={loading}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          🏓 Point (+1)
        </button>

        <button
          onClick={() => handleAddTTPoint("ace", "Service Winner")}
          disabled={loading}
          className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          ⚡ Service Winner
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
        <input
          type="text"
          placeholder="e.g. Ma Long"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}
