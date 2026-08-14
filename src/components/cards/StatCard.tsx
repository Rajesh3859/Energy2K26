"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  accentColor?: string;
  borderColor?: string;
  badgeColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  accentColor = "from-blue-50 to-indigo-50/50",
  borderColor = "border-blue-200",
  badgeColor = "text-blue-700 bg-blue-100",
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-white bg-gradient-to-br ${accentColor} p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-base shadow-sm ${badgeColor}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}
