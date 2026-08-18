"use client";

import { useState } from "react";
import { createFootballEvent } from "@/services/liveScore.service";

interface KabaddiConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function KabaddiConsole({ match, liveData, onEventAdded }: KabaddiConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [raiderName, setRaiderName] = useState("");
  const [teamId, setTeamId] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const currentTeamId = teamId || teamAId;

  async function handleAddKabaddiEvent(type: string, pts: number, label: string) {
    try {
      setLoading(true);
      const isTeamA = currentTeamId === teamAId;
      const tName = isTeamA ? teamAName : teamBName;

      await createFootballEvent(matchId, {
        type: type,
        teamId: currentTeamId,
        teamName: tName,
        minute: liveData?.half || 1,
        playerName: raiderName || "Player",
        description: `${label} (+${pts} pts) recorded for ${tName}`,
      });

      setRaiderName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Kabaddi event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <span>🤼</span> Kabaddi Scorer Console
        </h3>
        <select
          value={currentTeamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value={teamAId}>Team: {teamAName}</option>
          <option value={teamBId}>Team: {teamBName}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleAddKabaddiEvent("touch_point", 1, "Raid Point")}
          disabled={loading}
          className="rounded-xl bg-slate-800 hover:bg-amber-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          🏃 Raid Point (+1)
        </button>

        <button
          onClick={() => handleAddKabaddiEvent("tackle", 1, "Tackle Point")}
          disabled={loading}
          className="rounded-xl bg-slate-800 hover:bg-amber-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          🤼 Tackle Point (+1)
        </button>

        <button
          onClick={() => handleAddKabaddiEvent("bonus_point", 1, "Bonus Point")}
          disabled={loading}
          className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          ⭐ Bonus Point (+1)
        </button>

        <button
          onClick={() => handleAddKabaddiEvent("super_raid", 3, "SUPER RAID")}
          disabled={loading}
          className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          ⚡ Super Raid (+3)
        </button>

        <button
          onClick={() => handleAddKabaddiEvent("super_tackle", 2, "SUPER TACKLE")}
          disabled={loading}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          💪 Super Tackle (+2)
        </button>

        <button
          onClick={() => handleAddKabaddiEvent("all_out", 2, "ALL OUT")}
          disabled={loading}
          className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          💥 ALL OUT (+2)
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Raider / Tackler Player Name</label>
        <input
          type="text"
          placeholder="e.g. Pardeep Narwal"
          value={raiderName}
          onChange={(e) => setRaiderName(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
