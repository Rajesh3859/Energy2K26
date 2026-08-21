"use client";

import { useState } from "react";
import { createFootballEvent } from "@/services/liveScore.service";

interface BasketballConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function BasketballConsole({ match, liveData, onEventAdded }: BasketballConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const currentTeamId = teamId || teamAId;

  async function handleAddBasketEvent(type: string, pts: number, label: string) {
    try {
      setLoading(true);
      const isTeamA = currentTeamId === teamAId;
      const tName = isTeamA ? teamAName : teamBName;

      await createFootballEvent(matchId, {
        type: type,
        teamId: currentTeamId,
        teamName: tName,
        minute: liveData?.quarter || 1,
        playerName: playerName || "Player",
        description: `${label} scored by ${playerName || "Player"} (${tName})`,
      });

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Basketball event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
          Basketball Scorer Console
        </h3>
        <select
          value={currentTeamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value={teamAId}>Team: {teamAName}</option>
          <option value={teamBId}>Team: {teamBName}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={() => handleAddBasketEvent("point_1", 1, "Free Throw (+1)")}
          disabled={loading}
          className="rounded-md bg-slate-800 hover:bg-orange-600 text-white font-extrabold py-2.5 sm:py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
        >
          Free Throw (+1)
        </button>

        <button
          onClick={() => handleAddBasketEvent("point_2", 2, "Field Goal (+2)")}
          disabled={loading}
          className="rounded-md bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-2.5 sm:py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
        >
          Field Goal (+2)
        </button>

        <button
          onClick={() => handleAddBasketEvent("point_3", 3, "3-Pointer (+3)")}
          disabled={loading}
          className="rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 sm:py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
        >
          3-Pointer (+3)
        </button>

        <button
          onClick={() => handleAddBasketEvent("foul", 0, "Personal Foul")}
          disabled={loading}
          className="rounded-md bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 sm:py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
        >
          Foul
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
        <input
          type="text"
          placeholder="e.g. LeBron James"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
