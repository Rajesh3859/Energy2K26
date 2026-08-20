"use client";

import { useEffect, useState } from "react";
import { cricketAction } from "@/services/cricket.service";
import { CricketActionPayload } from "@/types/cricket";

interface CricketConsoleProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
}

export default function CricketConsole({ match, liveData, onEventAdded }: CricketConsoleProps) {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [bowlerName, setBowlerName] = useState("");
  const [note, setNote] = useState("");

  const matchId = match.id || match.matchId;
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || (match as any)?.teamAName || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || (match as any)?.teamBName || "Team B";
  const teamAId = (liveData?.teamA?.teamId || match?.teamA?.id || (match as any)?.teamAId || "teamA")?.toString();
  const teamBId = (liveData?.teamB?.teamId || match?.teamB?.id || (match as any)?.teamBId || "teamB")?.toString();

  const currentInnings = liveData?.sportState?.innings || 1;
  const defaultBattingTeamId =
    liveData?.sportState?.battingTeamId ||
    (currentInnings === 2 ? teamBId : teamAId);

  const [battingTeamId, setBattingTeamId] = useState<string>(defaultBattingTeamId);

  useEffect(() => {
    if (defaultBattingTeamId && battingTeamId !== teamAId && battingTeamId !== teamBId) {
      setBattingTeamId(defaultBattingTeamId);
    }
  }, [defaultBattingTeamId, teamAId, teamBId]);

  const activeBattingId = (battingTeamId || defaultBattingTeamId)?.toString().trim();

  async function handleAddCricketAction(
    type: string,
    runVal: number = 0,
    wicketVal: boolean = false,
    extraLabel?: string
  ) {
    if (
      !activeBattingId ||
      (activeBattingId !== teamAId && activeBattingId !== teamBId)
    ) {
      alert("Please select a valid batting team.");
      return;
    }

    try {
      setLoading(true);

      const cricketPayload: CricketActionPayload = {
        type:
          type === "change_innings"
            ? "CHANGE_INNINGS"
            : wicketVal
            ? "WICKET"
            : type === "wide"
            ? "WIDE"
            : type === "no_ball"
            ? "NO_BALL"
            : type === "bye"
            ? "BYE"
            : type === "leg_bye"
            ? "LEG_BYE"
            : "RUN",

        runs: runVal,

        deliveryType:
          type === "wide"
            ? "WIDE"
            : type === "no_ball"
            ? "NO_BALL"
            : "LEGAL",

        battingTeamId: activeBattingId,

        strikerName:
          playerName || undefined,

        bowlerName:
          bowlerName || undefined,

        outBatsmanName:
          wicketVal
            ? playerName || "Batsman"
            : undefined,
      };

      const result = await cricketAction(
        matchId,
        cricketPayload
      );

      console.log("Cricket updated:", result);

      // Check target completion in 2nd Innings
      if (currentInnings === 2) {
        const eventsObj = liveData?.events || {};
        const eventsList: any[] = Array.isArray(eventsObj) ? eventsObj : Object.values(eventsObj);

        let rA = 0, rB = 0;
        eventsList.forEach((ev: any) => {
          const runVal = ev.type === "boundary_4" ? 4 : ev.type === "boundary_6" ? 6 : (typeof ev.runs === "number" ? ev.runs : 1);
          const isA = ev.teamId === teamAId || ev.teamName === teamAName;
          if (["run", "boundary_4", "boundary_6", "wide", "no_ball", "bye", "leg_bye"].includes(ev.type)) {
            if (isA) rA += runVal;
            else rB += runVal;
          }
        });

        // Add current action runs to Team B score if team B is batting
        if (activeBattingId === teamBId) {
          rB += runVal;
        }

        const targetRuns = rA + 1;
        if (rB >= targetRuns) {
          console.info(`🏆 Match Target Reached! ${teamBName} reached target ${targetRuns} runs.`);
        }
      }

      setPlayerName("");
      setNote("");

      onEventAdded?.();

    } catch (err: any) {
      console.error(
        "Cricket action failed:",
        err
      );

      alert(
        err?.message ||
          "Failed to record Cricket action"
      );
    } finally {
      setLoading(false);
    }
  }

  const totalOvers = match?.totalOvers || liveData?.totalOvers || (match as any)?.totalOvers || 20;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <span>🏏</span> Cricket Scorer Console
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            {totalOvers} Overs Match
          </span>
        </h3>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Batting Team Selection Guard */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Batting:</span>
            <select
              value={activeBattingId}
              onChange={(e) => setBattingTeamId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value={teamAId} className="bg-slate-900 text-white">
                {teamAName} (Home)
              </option>
              <option value={teamBId} className="bg-slate-900 text-white">
                {teamBName} (Away)
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleAddCricketAction("change_innings", 0, false, "Innings Changed")}
            disabled={loading}
            className="rounded-xl bg-purple-950/80 hover:bg-purple-800 border border-purple-500/40 px-3 py-1.5 text-xs font-extrabold text-purple-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1"
            title="Switch Batting / Bowling Innings"
          >
            <span>🔄 Switch Innings</span>
          </button>
        </div>
      </div>

      {/* Main Run Scoring Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400">Quick Runs & Wicket (Out)</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 0, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            0 (Dot)
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 1, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +1 Run
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 2, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +2 Runs
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 3, false)}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            +3 Runs
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 4, false)}
            disabled={loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            4️⃣ FOUR
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("run", 6, false)}
            disabled={loading}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            6️⃣ SIX!
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("wicket", 0, true)}
            disabled={loading}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 col-span-2 sm:col-span-1"
          >
            🔴 OUT!
          </button>
        </div>
      </div>

      {/* Extras Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400">Extras & Deliveries</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleAddCricketAction("wide", 1, false, "Wide Ball")}
            disabled={loading}
            className="rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold py-2 text-xs transition-all border border-amber-500/40"
          >
            ➕ Wide (+1)
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("no_ball", 1, false, "No Ball")}
            disabled={loading}
            className="rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold py-2 text-xs transition-all border border-amber-500/40"
          >
            ➕ No Ball (+1)
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("bye", 1, false, "Bye Run")}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 text-xs transition-all border border-slate-700"
          >
            ➕ Bye (+1)
          </button>

          <button
            type="button"
            onClick={() => handleAddCricketAction("leg_bye", 1, false, "Leg Bye Run")}
            disabled={loading}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 text-xs transition-all border border-slate-700"
          >
            ➕ Leg Bye (+1)
          </button>
        </div>
      </div>

      {/* Player Details & Comment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Striker Batsman</label>
          <input
            type="text"
            placeholder="e.g. Virat Kohli"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Bowler Name</label>
          <input
            type="text"
            placeholder="e.g. Jasprit Bumrah"
            value={bowlerName}
            onChange={(e) => setBowlerName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Ball Comment / Note</label>
          <input
            type="text"
            placeholder="e.g. Cover drive to boundary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
