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

  const initialSetsA = liveData?.setsWonTeamA ?? liveData?.volleyballScore?.setsWonTeamA ?? liveData?.teamA?.score ?? liveData?.scoreTeamA ?? match?.scoreTeamA ?? 0;
  const initialSetsB = liveData?.setsWonTeamB ?? liveData?.volleyballScore?.setsWonTeamB ?? liveData?.teamB?.score ?? liveData?.scoreTeamB ?? match?.scoreTeamB ?? 0;

  const [setsA, setSetsA] = useState<number>(initialSetsA);
  const [setsB, setSetsB] = useState<number>(initialSetsB);
  const [curPtsA, setCurPtsA] = useState<number>(liveData?.currentSetTeamA ?? liveData?.volleyballScore?.currentSetTeamA ?? 0);
  const [curPtsB, setCurPtsB] = useState<number>(liveData?.currentSetTeamB ?? liveData?.volleyballScore?.currentSetTeamB ?? 0);
  const [currentSet, setCurrentSet] = useState<number>(liveData?.currentSet ?? liveData?.volleyballScore?.currentSet ?? 1);

  useEffect(() => {
    const vb = liveData?.volleyballScore || liveData;
    if (typeof vb?.setsWonTeamA === "number") setSetsA(vb.setsWonTeamA);
    else if (typeof liveData?.teamA?.score === "number") setSetsA(liveData.teamA.score);

    if (typeof vb?.setsWonTeamB === "number") setSetsB(vb.setsWonTeamB);
    else if (typeof liveData?.teamB?.score === "number") setSetsB(liveData.teamB.score);

    if (typeof vb?.currentSetTeamA === "number") setCurPtsA(vb.currentSetTeamA);
    if (typeof vb?.currentSetTeamB === "number") setCurPtsB(vb.currentSetTeamB);
    if (typeof vb?.currentSet === "number") setCurrentSet(vb.currentSet);
  }, [liveData]);

  const currentTeamId = teamId || teamAId;

  async function handleAddPoint(targetTeamId: string, actionType = "POINT") {
    const isTeamA = targetTeamId === teamAId;
    const tName = isTeamA ? teamAName : teamBName;

    // ⚡ Instant Optimistic UI Update (0ms delay) for Set Points
    if (isTeamA) setCurPtsA((prev) => prev + 1);
    else setCurPtsB((prev) => prev + 1);

    setLoading(true);

    try {
      const data = await volleyballAction(matchId, {
        teamId: targetTeamId,
        type: actionType,
        points: 1,
        playerName: playerName || "Player",
        teamName: tName,
      });

      if (data && typeof data.scoreA === "number") setSetsA(data.scoreA);
      if (data && typeof data.scoreB === "number") setSetsB(data.scoreB);

      setPlayerName("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Volleyball event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      {/* Header & Scores */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2">
          Volleyball Scorer Console
        </h3>
        <div className="flex items-center gap-3 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <span className="text-slate-300">{teamAName}: <span className="text-sky-400 text-sm">{setsA} Sets</span> ({curPtsA} pts)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">{teamBName}: <span className="text-sky-400 text-sm">{setsB} Sets</span> ({curPtsB} pts)</span>
          <span className="text-xs text-amber-400 font-mono ml-1">[Set {currentSet}]</span>
        </div>
      </div>

      {/* Main +1 Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAddPoint(teamAId, "POINT")}
          disabled={loading}
          className="rounded-md bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-3 text-base transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          +1 {teamAName}
        </button>

        <button
          onClick={() => handleAddPoint(teamBId, "POINT")}
          disabled={loading}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 text-base transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
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
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={teamAId}>{teamAName}</option>
            <option value={teamBId}>{teamBName}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleAddPoint(currentTeamId, "RALLY_POINT")}
            disabled={loading}
            className="rounded-md bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Rally Point (+1)
          </button>

          <button
            onClick={() => handleAddPoint(currentTeamId, "SERVICE_ACE")}
            disabled={loading}
            className="rounded-md bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Service Ace (+1)
          </button>

          <button
            onClick={() => handleAddPoint(currentTeamId, "BLOCK_POINT")}
            disabled={loading}
            className="rounded-md bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Block Point (+1)
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
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    </div>
  );
}

