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
    const eventsList: any[] = liveData?.events ? (Array.isArray(liveData.events) ? liveData.events : Object.values(liveData.events)) : [];

    const teamAId = liveData?.teamA?.teamId || "teamA";
    const teamBId = liveData?.teamB?.teamId || "teamB";

    // Dynamic Team A Cricket score calculation from events stream
    const dynamicA = (() => {
      let r = 0, w = 0, legalBalls = 0;
      eventsList.forEach((ev: any) => {
        const matchesA = ev.teamId === teamAId || (ev.teamName && teamAName && ev.teamName.toLowerCase().trim() === teamAName.toLowerCase().trim());
        if (matchesA) {
          if (ev.type === "run" || ev.type === "boundary_4" || ev.type === "boundary_6" || ev.type === "wide" || ev.type === "no_ball" || ev.type === "bye" || ev.type === "leg_bye") {
            const runVal = ev.type === "boundary_4" ? 4 : ev.type === "boundary_6" ? 6 : (typeof ev.runs === "number" ? ev.runs : 1);
            r += runVal;
          }
          if (ev.type === "wicket") {
            w += 1;
          }
          if (ev.type !== "wide" && ev.type !== "no_ball") {
            legalBalls += 1;
          }
        }
      });
      const ovStr = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
      return { runs: r, wickets: w, overs: ovStr, legalBalls };
    })();

    // Dynamic Team B Cricket score calculation from events stream
    const dynamicB = (() => {
      let r = 0, w = 0, legalBalls = 0;
      eventsList.forEach((ev: any) => {
        const matchesB = ev.teamId === teamBId || (ev.teamName && teamBName && ev.teamName.toLowerCase().trim() === teamBName.toLowerCase().trim());
        if (matchesB) {
          if (ev.type === "run" || ev.type === "boundary_4" || ev.type === "boundary_6" || ev.type === "wide" || ev.type === "no_ball" || ev.type === "bye" || ev.type === "leg_bye") {
            const runVal = ev.type === "boundary_4" ? 4 : ev.type === "boundary_6" ? 6 : (typeof ev.runs === "number" ? ev.runs : 1);
            r += runVal;
          }
          if (ev.type === "wicket") {
            w += 1;
          }
          if (ev.type !== "wide" && ev.type !== "no_ball") {
            legalBalls += 1;
          }
        }
      });
      const ovStr = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
      return { runs: r, wickets: w, overs: ovStr, legalBalls };
    })();

    const tA = liveData?.teamA;
    const tB = liveData?.teamB;

    const runsA = dynamicA.runs > 0 ? dynamicA.runs : (typeof tA?.score === "object" ? (tA?.score?.runs ?? tA?.score?.score ?? 0) : (Number(tA?.score) || liveData?.runsTeamA || scoreA || 0));
    const wicketsA = dynamicA.wickets > 0 ? dynamicA.wickets : (typeof tA?.score === "object" ? (tA?.score?.wickets ?? 0) : (liveData?.wicketsTeamA || 0));
    const oversA = dynamicA.legalBalls > 0 ? dynamicA.overs : (typeof tA?.score === "object" ? (tA?.score?.overs ?? 0) : (liveData?.oversTeamA || 0));

    const runsB = dynamicB.runs > 0 ? dynamicB.runs : (typeof tB?.score === "object" ? (tB?.score?.runs ?? tB?.score?.score ?? 0) : (Number(tB?.score) || liveData?.runsTeamB || scoreB || 0));
    const wicketsB = dynamicB.wickets > 0 ? dynamicB.wickets : (typeof tB?.score === "object" ? (tB?.score?.wickets ?? 0) : (liveData?.wicketsTeamB || 0));
    const oversB = dynamicB.legalBalls > 0 ? dynamicB.overs : (typeof tB?.score === "object" ? (tB?.score?.overs ?? 0) : (liveData?.oversTeamB || 0));

    const currentInnings = liveData?.currentInnings || (runsB > 0 || oversB > 0 || wicketsB > 0 ? 2 : 1);
    const battingTeam = currentInnings === 1 ? teamAName : teamBName;
    const battingRuns = currentInnings === 1 ? runsA : runsB;
    const battingWickets = currentInnings === 1 ? wicketsA : wicketsB;
    const battingOvers = currentInnings === 1 ? oversA : oversB;

    const targetRuns = currentInnings === 2 ? runsA + 1 : null;
    const runsNeeded = targetRuns ? Math.max(0, targetRuns - runsB) : null;

    const maxOvers = liveData?.totalOvers || liveData?.match?.totalOvers || 20;

    return (
      <div className="w-full rounded-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-2xl space-y-3 sm:space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-2.5 text-[10px] sm:text-xs font-extrabold uppercase gap-1.5">
          <span className="text-cyan-400 flex items-center gap-1.5 truncate">
            CRICKET INNINGS {currentInnings} ({maxOvers} OVERS MATCH)
          </span>
          <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-mono">
            LIVE SCORE
          </span>
        </div>

        {/* Center Score Display */}
        <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <h3 className={`text-xs sm:text-lg md:text-xl font-black truncate ${currentInnings === 1 ? "text-cyan-300" : "text-white"}`}>
              {teamAName}
            </h3>
            <p className="text-[10px] sm:text-xs font-mono font-semibold text-slate-400 truncate">
              {runsA}/{wicketsA} <span className="text-slate-500 hidden sm:inline">({oversA}/{maxOvers} ov)</span>
            </p>
          </div>

          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <div className="font-mono text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {battingRuns}<span className="text-cyan-400 font-extrabold">/{battingWickets}</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 truncate">
              {battingOvers} / {maxOvers} Overs
            </div>
            {targetRuns && (
              <div className="text-[10px] sm:text-[11px] font-bold text-rose-400">
                Target {targetRuns}
              </div>
            )}
          </div>

          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <h3 className={`text-xs sm:text-lg md:text-xl font-black truncate ${currentInnings === 2 ? "text-cyan-300" : "text-white"}`}>
              {teamBName}
            </h3>
            <p className="text-[10px] sm:text-xs font-mono font-semibold text-slate-400 truncate">
              {runsB}/{wicketsB} <span className="text-slate-500 hidden sm:inline">({oversB} ov)</span>
            </p>
          </div>
        </div>

        {/* Target & Match Situation Banner */}
        <div className="rounded-md bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 text-center text-[11px] sm:text-xs font-bold text-slate-300">
          {currentInnings === 2 && runsNeeded !== null ? (
            runsNeeded === 0 ? (
              <span className="text-emerald-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 animate-pulse">
                MATCH COMPLETED — {teamBName} won by chasing target! ({runsB}/{wicketsB})
              </span>
            ) : (
              <span className="text-emerald-400">
                {teamBName} need <span className="text-white font-mono text-xs sm:text-sm underline">{runsNeeded}</span> runs to win
              </span>
            )
          ) : (
            <span className="text-cyan-300">
              1st Innings in progress — {battingTeam} Batting
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
      <div className="w-full rounded-md bg-slate-950/80 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-xl space-y-3 sm:space-y-4">
        <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamAName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Sets Won</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-3">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{vb.setsWonTeamA}</span>
            <span className="text-lg sm:text-xl text-slate-600 font-light">:</span>
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{vb.setsWonTeamB}</span>
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamBName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Sets Won</span>
          </div>
        </div>

        <div className="rounded-md bg-slate-900 border border-slate-800 p-2 sm:p-3 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Set {vb.currentSet} Score
          </span>
          <div className="font-mono text-lg sm:text-2xl font-extrabold text-emerald-400">
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

    return (
      <div className="w-full rounded-md bg-slate-950/80 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-xl space-y-3 sm:space-y-4">
        <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamAName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Games Won</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-3">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{tt.gamesWonTeamA}</span>
            <span className="text-lg sm:text-xl text-slate-600 font-light">:</span>
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{tt.gamesWonTeamB}</span>
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamBName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Games Won</span>
          </div>
        </div>

        <div className="rounded-md bg-slate-900 border border-slate-800 p-2 sm:p-3 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Game {tt.currentGame} Points
          </span>
          <div className="font-mono text-lg sm:text-2xl font-extrabold text-emerald-400">
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
      <div className="w-full rounded-md bg-slate-950/80 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-xl space-y-3 sm:space-y-4">
        <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamAName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Points</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-3">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{bk.teamA}</span>
            <span className="text-lg sm:text-xl text-slate-600 font-light">:</span>
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{bk.teamB}</span>
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamBName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Points</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300 bg-slate-900 py-1.5 px-3 rounded-md border border-slate-800 w-max mx-auto">
          <span>Quarter {bk.quarter > 4 ? `OT ${bk.quarter - 4}` : bk.quarter}</span>
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
      <div className="w-full rounded-md bg-slate-950/80 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-xl space-y-3 sm:space-y-4">
        <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamAName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Points</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-3">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{kb.teamA}</span>
            <span className="text-lg sm:text-xl text-slate-600 font-light">:</span>
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{kb.teamB}</span>
          </div>

          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamBName}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Points</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. DEFAULT / FOOTBALL SCOREBOARD DISPLAY (Goals / Standard)
  return (
    <div className="w-full rounded-md bg-slate-950/80 border border-slate-800 p-3 sm:p-5 md:p-6 shadow-xl">
      <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2">
        <div className="min-w-0">
          <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamAName}</h3>
          <span className="text-[10px] sm:text-xs text-slate-400">Home</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-4">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{scoreA}</span>
          <span className="text-lg sm:text-2xl font-light text-slate-600">:</span>
          <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-400">{scoreB}</span>
        </div>

        <div className="min-w-0">
          <h3 className="font-extrabold text-white text-xs sm:text-lg md:text-xl truncate">{teamBName}</h3>
          <span className="text-[10px] sm:text-xs text-slate-400">Away</span>
        </div>
      </div>
    </div>
  );
}
