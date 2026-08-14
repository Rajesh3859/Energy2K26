"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actionButton,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {children}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-95"
          >
            <span>{actionButton.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
