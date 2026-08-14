"use client";

interface MatchCardProps {
  sportName?: string;
  status: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  eventsCount?: number;
  onClick?: () => void;
}

export default function MatchCard({
  sportName = "Football",
  status,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  eventsCount = 0,
  onClick,
}: MatchCardProps) {
  const isLive = status === "live" || status === "half_time";

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
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

      <div className="grid grid-cols-3 items-center text-center my-4">
        <div>
          <p className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
            {teamAName}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-black font-mono text-cyan-400">
            {scoreA}
          </span>
          <span className="text-xl font-light text-slate-600">:</span>
          <span className="text-4xl font-black font-mono text-cyan-400">
            {scoreB}
          </span>
        </div>

        <div>
          <p className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
            {teamBName}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>{eventsCount} Live Events</span>
        <span className="font-semibold text-cyan-400 group-hover:underline">
          View Details →
        </span>
      </div>
    </div>
  );
}
