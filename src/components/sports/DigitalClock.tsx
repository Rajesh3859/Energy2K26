"use client";

interface DigitalClockProps {
  seconds: number;
  status?: string;
}

export default function DigitalClock({ seconds, status = "live" }: DigitalClockProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3">
      <div className="font-mono text-xl font-extrabold tracking-wider text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-cyan-500/30 shadow-inner">
        ⏱️ {formattedTime}
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase border ${
          status === "live"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
            : status === "half_time"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : status === "completed"
            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
            : "bg-slate-800 text-slate-400 border-slate-700"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
