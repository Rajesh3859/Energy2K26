"use client";

import MultiSportScoreDisplay from "@/components/sports/MultiSportScoreDisplay";

interface MatchCardProps {
  sportName?: string;
  sportCode?: string;
  status: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  eventsCount?: number;
  liveData?: any;
  onClick?: () => void;
}

export default function MatchCard({
  sportName = "Football",
  sportCode,
  status,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  eventsCount = 0,
  liveData,
  onClick,
}: MatchCardProps) {
  const isLive = status === "live" || status === "half_time";

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          {sportName}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
            isLive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLive ? "bg-emerald-400" : "bg-slate-500"
            }`}
          ></span>
          {status === "half_time" ? "HALF TIME" : status.toUpperCase()}
        </span>
      </div>

      <MultiSportScoreDisplay
        sportCode={sportCode}
        sportName={sportName}
        teamAName={teamAName}
        teamBName={teamBName}
        scoreA={scoreA}
        scoreB={scoreB}
        liveData={liveData}
      />

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>{eventsCount} Live Events</span>
        <span className="font-semibold text-cyan-400 group-hover:underline">
          View Details →
        </span>
      </div>
    </div>
  );
}
