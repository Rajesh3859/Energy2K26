"use client";

import { getSportDefinition } from "@/config/sports";
import {
  CricketMatchScore,
  KabaddiMatchScore,
  BasketballMatchScore,
  VolleyballMatchScore,
  TableTennisMatchScore,
  BadmintonMatchScore,
} from "@/types/sportEngine";

interface MultiSportScoreDisplayProps {
  sportCode?: string;
  sportName?: string;
  teamAName: string;
  teamBName: string;
  scoreA?: number;
  scoreB?: number;
  liveData?: any;
}

export default function MultiSportScoreDisplay({
  sportCode,
  sportName,
  teamAName,
  teamBName,
  scoreA = 0,
  scoreB = 0,
  liveData,
}: MultiSportScoreDisplayProps) {
  const sportDef = getSportDefinition(sportCode || sportName);
  const code = sportDef.code;

  // 1. CRICKET SCOREBOARD DISPLAY
  if (code === "cricket") {
    const teamAScoreObj = liveData?.teamA?.score || liveData?.scoreA;
    const teamBScoreObj = liveData?.teamB?.score || liveData?.scoreB;

    const runsA = typeof teamAScoreObj === "object" ? (teamAScoreObj?.score ?? teamAScoreObj?.runs ?? 0) : (Number(teamAScoreObj) || scoreA || 0);
    const wicketsA = typeof teamAScoreObj === "object" ? (teamAScoreObj?.wickets ?? 0) : (liveData?.wicketsTeamA || 0);
    const oversA = typeof teamAScoreObj === "object" ? (teamAScoreObj?.overs ?? 0) : (liveData?.oversTeamA || 0);

    const runsB = typeof teamBScoreObj === "object" ? (teamBScoreObj?.score ?? teamBScoreObj?.runs ?? 0) : (Number(teamBScoreObj) || scoreB || 0);
    const wicketsB = typeof teamBScoreObj === "object" ? (teamBScoreObj?.wickets ?? 0) : (liveData?.wicketsTeamB || 0);
    const oversB = typeof teamBScoreObj === "object" ? (teamBScoreObj?.overs ?? 0) : (liveData?.oversTeamB || 0);

    const currentInnings = liveData?.currentInnings || (runsB > 0 || oversB > 0 ? 2 : 1);
    const battingTeam = currentInnings === 1 ? teamAName : teamBName;
    const battingRuns = currentInnings === 1 ? runsA : runsB;
    const battingWickets = currentInnings === 1 ? wicketsA : wicketsB;
    const battingOvers = currentInnings === 1 ? oversA : oversB;

    const targetRuns = currentInnings === 2 ? runsA + 1 : null;
    const runsNeeded = targetRuns ? Math.max(0, targetRuns - runsB) : null;

    return (
      <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs font-extrabold uppercase">
          <span className="text-cyan-400 flex items-center gap-1.5">
            <span>🏏</span> CRICKET INNINGS {currentInnings}
          </span>
          <span className="text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
            ● LIVE SCORE
          </span>
        </div>

        {/* Center Score Display matching reference design: 144/1 | 16.5/20 Overs */}
        <div className="grid grid-cols-3 items-center text-center">
          <div className="space-y-1">
            <h3 className={`text-base sm:text-xl font-black truncate ${currentInnings === 1 ? "text-cyan-300" : "text-white"}`}>
              {teamAName}
            </h3>
            <p className="text-xs font-mono font-semibold text-slate-400">
              {runsA}/{wicketsA} <span className="text-slate-500">({oversA} ov)</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {battingRuns}<span className="text-cyan-400 font-extrabold">/{battingWickets}</span>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {battingOvers} Overs
            </div>
            {targetRuns && (
              <div className="text-[11px] font-bold text-rose-400">
                Target {targetRuns}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className={`text-base sm:text-xl font-black truncate ${currentInnings === 2 ? "text-cyan-300" : "text-white"}`}>
              {teamBName}
            </h3>
            <p className="text-xs font-mono font-semibold text-slate-400">
              {runsB}/{wicketsB} <span className="text-slate-500">({oversB} ov)</span>
            </p>
          </div>
        </div>

        {/* Target & Match Situation Banner */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-center text-xs font-bold text-slate-300">
          {currentInnings === 2 && runsNeeded !== null ? (
            <span className="text-emerald-400">
              ⚡ {teamBName} need <span className="text-white font-mono text-sm underline">{runsNeeded}</span> runs to win
            </span>
          ) : (
            <span className="text-cyan-300">
              🏏 1st Innings in progress — {battingTeam} Batting
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. VOLLEYBALL SCOREBOARD DISPLAY (Set-based)
  if (code === "volleyball") {
    const vb: VolleyballMatchScore = liveData?.volleyballScore || liveData?.score?.volleyball || {
      setsWonTeamA: liveData?.setsWonTeamA ?? scoreA,
      setsWonTeamB: liveData?.setsWonTeamB ?? scoreB,
      currentSet: liveData?.currentSet ?? 1,
      currentSetTeamA: liveData?.currentSetTeamA ?? 0,
      currentSetTeamB: liveData?.currentSetTeamB ?? 0,
    };

    return (
      <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-3 items-center text-center">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamAName}</h3>
            <span className="text-xs text-slate-400">Sets Won</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{vb.setsWonTeamA}</span>
            <span className="text-xl text-slate-600 font-light">:</span>
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{vb.setsWonTeamB}</span>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamBName}</h3>
            <span className="text-xs text-slate-400">Sets Won</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Set {vb.currentSet} Score
          </span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-400">
            {vb.currentSetTeamA} ── {vb.currentSetTeamB}
          </div>
        </div>
      </div>
    );
  }

  // 3. TABLE TENNIS & BADMINTON DISPLAY (Game-based)
  if (code === "table_tennis" || code === "badminton") {
    const tt: TableTennisMatchScore = liveData?.gameScore || liveData?.score?.game || {
      gamesWonTeamA: liveData?.gamesWonTeamA ?? scoreA,
      gamesWonTeamB: liveData?.gamesWonTeamB ?? scoreB,
      currentGame: liveData?.currentGame ?? 1,
      currentGameTeamA: liveData?.currentGameTeamA ?? 0,
      currentGameTeamB: liveData?.currentGameTeamB ?? 0,
    };

    const icon = code === "table_tennis" ? "🏓" : "🏸";

    return (
      <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-3 items-center text-center">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamAName}</h3>
            <span className="text-xs text-slate-400">Games Won</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{tt.gamesWonTeamA}</span>
            <span className="text-xl text-slate-600 font-light">:</span>
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{tt.gamesWonTeamB}</span>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamBName}</h3>
            <span className="text-xs text-slate-400">Games Won</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {icon} Game {tt.currentGame} Points
          </span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-400">
            {tt.currentGameTeamA} ── {tt.currentGameTeamB}
          </div>
        </div>
      </div>
    );
  }

  // 4. BASKETBALL SCOREBOARD DISPLAY (Quarter-based)
  if (code === "basketball") {
    const bk: BasketballMatchScore = liveData?.basketballScore || liveData?.score?.basketball || {
      teamA: liveData?.scoreA ?? scoreA,
      teamB: liveData?.scoreB ?? scoreB,
      quarter: liveData?.quarter ?? 1,
    };

    return (
      <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-3 items-center text-center">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamAName}</h3>
            <span className="text-xs text-slate-400">Points</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{bk.teamA}</span>
            <span className="text-xl text-slate-600 font-light">:</span>
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{bk.teamB}</span>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamBName}</h3>
            <span className="text-xs text-slate-400">Points</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300 bg-slate-900 py-1.5 px-3 rounded-xl border border-slate-800 w-max mx-auto">
          <span>🏀 Quarter {bk.quarter > 4 ? `OT ${bk.quarter - 4}` : bk.quarter}</span>
        </div>
      </div>
    );
  }

  // 5. KABADDI SCOREBOARD DISPLAY
  if (code === "kabaddi") {
    const kb: KabaddiMatchScore = liveData?.kabaddiScore || liveData?.score?.kabaddi || {
      teamA: liveData?.scoreA ?? scoreA,
      teamB: liveData?.scoreB ?? scoreB,
    };

    return (
      <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-3 items-center text-center">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamAName}</h3>
            <span className="text-xs text-slate-400">Points</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{kb.teamA}</span>
            <span className="text-xl text-slate-600 font-light">:</span>
            <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{kb.teamB}</span>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamBName}</h3>
            <span className="text-xs text-slate-400">Points</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. DEFAULT / FOOTBALL SCOREBOARD DISPLAY (Goals / Standard)
  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 shadow-xl">
      <div className="grid grid-cols-3 items-center text-center">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamAName}</h3>
          <span className="text-xs text-slate-400">Home</span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{scoreA}</span>
          <span className="text-xl sm:text-3xl font-light text-slate-600">:</span>
          <span className="text-3xl sm:text-5xl font-black font-mono text-cyan-400">{scoreB}</span>
        </div>

        <div>
          <h3 className="font-extrabold text-white text-base sm:text-xl truncate">{teamBName}</h3>
          <span className="text-xs text-slate-400">Away</span>
        </div>
      </div>
    </div>
  );
}
