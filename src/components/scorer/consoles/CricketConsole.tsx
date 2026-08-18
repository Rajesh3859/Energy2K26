"use client";

import { useState } from "react";
import { createFootballEvent, deleteFootballEvent } from "@/services/liveScore.service";

interface CricketConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function CricketConsole({ match, liveData, onEventAdded }: CricketConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [note, setNote] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  const [battingTeamId, setBattingTeamId] = useState<string>(teamAId);

  async function handleAddCricketEvent(type: string, runVal: number, wicketVal: boolean, extraLabel?: string) {
    try {
      setLoading(true);
      const isTeamA = battingTeamId === teamAId;
      const battingTeamName = isTeamA ? teamAName : teamBName;

      let eventType = type;
      if (wicketVal) eventType = "wicket";
      else if (runVal === 4 && type === "run") eventType = "boundary_4";
      else if (runVal === 6 && type === "run") eventType = "boundary_6";

      const desc = extraLabel
        ? `${extraLabel} (+${runVal} runs)`
        : wicketVal
        ? `🔴 WICKET (OUT)! ${playerName || "Batsman"} is Out!`
        : runVal === 0
        ? `Dot ball to ${playerName || "Batsman"}`
        : `${runVal} runs scored by ${playerName || "Batsman"}`;

      await createFootballEvent(matchId, {
        type: eventType,
        teamId: battingTeamId,
        teamName: battingTeamName,
        minute: liveData?.currentOver || 1,
        playerName: playerName || (wicketVal ? "Batsman Out" : "Batsman"),
        description: note ? `${desc} — ${note}` : desc,
      });

      setPlayerName("");
      setNote("");
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to record Cricket event");
    } finally {
      setLoading(false);
    }
  }

  // Get last event for Undo / Decrement support
  const eventsObj = liveData?.events || {};
  const eventsList: any[] = Array.isArray(eventsObj)
    ? eventsObj
    : Object.values(eventsObj);
  const lastEvent = eventsList.length > 0 ? eventsList[eventsList.length - 1] : null;

  async function handleUndoLastEvent() {
    if (!lastEvent || !lastEvent.id) {
      alert("No recent ball event to undo.");
      return;
    }
    if (!confirm(`Undo last event "${lastEvent.description || lastEvent.type}"?`)) return;

    try {
      setLoading(true);
      await deleteFootballEvent(matchId, lastEvent.id);
      if (onEventAdded) onEventAdded();
    } catch (err: any) {
      alert(err.message || "Failed to undo last event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <span>🏏</span> Cricket Scorer Console
        </h3>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={battingTeamId}
            onChange={(e) => setBattingTeamId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value={teamAId}>Batting: {teamAName}</option>
            <option value={teamBId}>Batting: {teamBName}</option>
          </select>

          {lastEvent && (
            <button
              onClick={handleUndoLastEvent}
              disabled={loading}
              className="rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-700 px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1"
            >
              <span>↩️ Undo Last Ball</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scoring Action Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400">Quick Runs & Wicket (Out)</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          <button
            onClick={() => handleAddCricketEvent("run", 0, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            0 (Dot)
          </button>

          <button
            onClick={() => handleAddCricketEvent("run", 1, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +1 Run
          </button>

          <button
            onClick={() => handleAddCricketEvent("run", 2, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +2 Runs
          </button>

          <button
            onClick={() => handleAddCricketEvent("run", 3, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +3 Runs
          </button>

          <button
            onClick={() => handleAddCricketEvent("boundary_4", 4, false)}
            disabled={loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            4️⃣ FOUR
          </button>

          <button
            onClick={() => handleAddCricketEvent("boundary_6", 6, false)}
            disabled={loading}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            6️⃣ SIX!
          </button>

          <button
            onClick={() => handleAddCricketEvent("wicket", 0, true)}
            disabled={loading}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 col-span-2 sm:col-span-1"
          >
            🔴 OUT!
          </button>
        </div>
      </div>

      {/* Extras Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400">Extras & Boundaries</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleAddCricketEvent("wide", 1, false, "Wide Ball")}
            disabled={loading}
            className="rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold py-2 text-xs transition-all border border-amber-500/40"
          >
            ➕ Wide (+1)
          </button>

          <button
            onClick={() => handleAddCricketEvent("no_ball", 1, false, "No Ball")}
            disabled={loading}
            className="rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold py-2 text-xs transition-all border border-amber-500/40"
          >
            ➕ No Ball (+1)
          </button>

          <button
            onClick={() => handleAddCricketEvent("bye", 1, false, "Bye Run")}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 text-xs transition-all border border-slate-700"
          >
            ➕ Bye (+1)
          </button>

          <button
            onClick={() => handleAddCricketEvent("leg_bye", 1, false, "Leg Bye Run")}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 text-xs transition-all border border-slate-700"
          >
            ➕ Leg Bye (+1)
          </button>
        </div>
      </div>

      {/* Form Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Batsman Name</label>
          <input
            type="text"
            placeholder="e.g. Virat Kohli"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Event Note / Ball Comment</label>
          <input
            type="text"
            placeholder="e.g. Cover drive / Catch taken at mid-off"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
