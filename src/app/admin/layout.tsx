"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">

          <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Sports Platform
              </h1>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                Admin Panel
              </p>
            </div>

            <nav className="p-4 space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>👥</span>
                <span>Users</span>
              </Link>

              <Link
                href="/admin/teams"
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>🏆</span>
                <span>Teams</span>
              </Link>

              <Link
                href="/admin/matches"
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>⚡</span>
                <span>Matches</span>
              </Link>

              <Link
                href="/admin/sports"
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>⚽</span>
                <span>Sports</span>
              </Link>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link
                  href="/live"
                  className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                >
                  <span>View Live Scores</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </Link>
              </div>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">

            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">
                Admin Dashboard
              </h2>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                <span>Administrator</span>
              </div>
            </header>

            <main className="flex-1 p-6 md:p-8">
              {children}
            </main>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}