"use client";

import { useState } from "react";
import { badmintonAction } from "@/services/badminton.service";

interface BadmintonConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function BadmintonConsole({ match, liveData, onEventAdded }: BadmintonConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || (match as any)?.teamAName || (liveData as any)?.teamAName || (match as any)?.teamA?.teamName || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || (match as any)?.teamBName || (liveData as any)?.teamBName || (match as any)?.teamB?.teamName || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const currentTeamId = teamId || teamAId;

  async function handleAddBadmintonPoint(type: string, label: string) {
    try {
      setLoading(true);
      const isTeamA = currentTeamId === teamAId;
      const tName = isTeamA ? teamAName : teamBName;

      await badmintonAction(matchId, {
        teamId: currentTeamId,
        action: type,
        type: type,
        points: 1,
        teamName: tName,
        playerName: playerName || "Player",
        label: label,
      });

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Badminton point");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
          Badminton Scorer Console
        </h3>
        <select
          value={currentTeamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value={teamAId}>Point for: {teamAName}</option>
          <option value={teamBId}>Point for: {teamBName}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleAddBadmintonPoint("point", "Rally Point (+1)")}
          disabled={loading}
          className="rounded-md bg-teal-600 hover:bg-teal-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          Rally Point (+1)
        </button>

        <button
          onClick={() => handleAddBadmintonPoint("smash_point", "Smash Winner")}
          disabled={loading}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          Smash Winner
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
        <input
          type="text"
          placeholder="e.g. Viktor Axelsen / PV Sindhu"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
