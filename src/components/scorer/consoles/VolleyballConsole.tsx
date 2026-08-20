"use client";

import { useState, useEffect } from "react";
import { volleyballAction } from "@/services/volleyball.service";

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

  const initialScoreA = liveData?.teamA?.score ?? liveData?.scoreTeamA ?? match?.scoreTeamA ?? match?.teamA?.score ?? 0;
  const initialScoreB = liveData?.teamB?.score ?? liveData?.scoreTeamB ?? match?.scoreTeamB ?? match?.teamB?.score ?? 0;

  const [scoreA, setScoreA] = useState<number>(initialScoreA);
  const [scoreB, setScoreB] = useState<number>(initialScoreB);

  useEffect(() => {
    if (typeof liveData?.teamA?.score === "number") setScoreA(liveData.teamA.score);
    else if (typeof liveData?.scoreTeamA === "number") setScoreA(liveData.scoreTeamA);

    if (typeof liveData?.teamB?.score === "number") setScoreB(liveData.teamB.score);
    else if (typeof liveData?.scoreTeamB === "number") setScoreB(liveData.scoreTeamB);
  }, [liveData]);

  const currentTeamId = teamId || teamAId;

  async function handleAddPoint(targetTeamId: string) {
    const isTeamA = targetTeamId === teamAId;
    const prevScoreA = scoreA;
    const prevScoreB = scoreB;

    // ⚡ Instant Optimistic UI Update (0ms delay)
    if (isTeamA) setScoreA((prev) => prev + 1);
    else setScoreB((prev) => prev + 1);

    setLoading(true);

    try {
      const data = await volleyballAction(matchId, targetTeamId, 1);

      // Reconcile with exact backend/RTDB scores if provided
      if (data && typeof data.scoreA === "number") setScoreA(data.scoreA);
      if (data && typeof data.scoreB === "number") setScoreB(data.scoreB);

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      // Revert optimistic update on failure
      setScoreA(prevScoreA);
      setScoreB(prevScoreB);
      alert(err.message || "Failed to record Volleyball event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      {/* Header & Scores */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2">
          <span>🏐</span> Volleyball Scorer Console
        </h3>
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-slate-300">{teamAName}: <span className="text-sky-400 text-base">{scoreA}</span></span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{teamBName}: <span className="text-slate-300 text-base">{scoreB}</span></span>
        </div>
      </div>

      {/* Main +1 Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAddPoint(teamAId)}
          disabled={loading}
          className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-3 text-base transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          +1 {teamAName}
        </button>

        <button
          onClick={() => handleAddPoint(teamBId)}
          disabled={loading}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-base transition-all shadow-md active:scale-95 disabled:opacity-50"
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
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={teamAId}>{teamAName}</option>
            <option value={teamBId}>{teamBName}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleAddPoint(currentTeamId)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            🏐 Rally Point (+1)
          </button>

          <button
            onClick={() => handleAddPoint(currentTeamId)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            ⚡ Service Ace (+1)
          </button>

          <button
            onClick={() => handleAddPoint(currentTeamId)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            🛡️ Block Point (+1)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name (Optional)</label>
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
