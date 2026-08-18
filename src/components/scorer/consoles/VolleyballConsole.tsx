"use client";

import { useState } from "react";
import { createFootballEvent } from "@/services/liveScore.service";

interface VolleyballConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function VolleyballConsole({ match, liveData, onEventAdded }: VolleyballConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const currentTeamId = teamId || teamAId;

  async function handleAddVolleyEvent(type: string, label: string) {
    try {
      setLoading(true);
      const isTeamA = currentTeamId === teamAId;
      const tName = isTeamA ? teamAName : teamBName;

      await createFootballEvent(matchId, {
        type: type,
        teamId: currentTeamId,
        teamName: tName,
        minute: liveData?.currentSet || 1,
        playerName: playerName || "Player",
        description: `${label} scored by ${playerName || "Player"} (${tName})`,
      });

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Volleyball event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2">
          <span>🏐</span> Volleyball Scorer Console
        </h3>
        <select
          value={currentTeamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value={teamAId}>Point for: {teamAName}</option>
          <option value={teamBId}>Point for: {teamBName}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleAddVolleyEvent("point", "Rally Point (+1)")}
          disabled={loading}
          className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          🏐 Rally Point (+1)
        </button>

        <button
          onClick={() => handleAddVolleyEvent("ace", "Service Ace")}
          disabled={loading}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          ⚡ Service Ace
        </button>

        <button
          onClick={() => handleAddVolleyEvent("block_point", "Block Point")}
          disabled={loading}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          🛡️ Block Point
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
        <input
          type="text"
          placeholder="e.g. Yuji Nishida"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    </div>
  );
}
