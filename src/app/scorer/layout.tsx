"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ScorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleSignOut = () => {
    signOut(auth).then(() => {
      window.location.href = "/";
    });
  };

  return (
    <ProtectedRoute allowedRoles={["scorer", "admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Scorer Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                Energy 2026 Scorer Console
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Official Match Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-300 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
