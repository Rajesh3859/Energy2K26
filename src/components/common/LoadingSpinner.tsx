"use client";

interface LoadingSpinnerProps {
  message?: string;
  dark?: boolean;
}

export default function LoadingSpinner({
  message = "Loading...",
  dark = false,
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className={`flex items-center gap-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
