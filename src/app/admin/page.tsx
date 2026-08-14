"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";
import StatCard from "@/components/cards/StatCard";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";

interface DashboardStats {
  users: number;
  teams: number;
  scheduledMatches: number;
  liveMatches: number;
  completedMatches: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    teams: 0,
    scheduledMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
  });

  const [activeLiveMatches, setActiveLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function parseAndSetLiveMatches(dataObj: any) {
    if (!dataObj) {
      setActiveLiveMatches([]);
      return;
    }
    const rawList = Object.values(dataObj).filter((m: any) => {
      const st = (m.status || "").toLowerCase();
      return st === "live" || st === "half_time" || st === "full_time" || st === "not_started";
    });

    const formattedList = rawList.map((m: any) => ({
      id: m.matchId || m.id,
      matchId: m.matchId || m.id,
      sportName: m.sportName || m.sport || "Football",
      status: (m.status || "live").toLowerCase(),
      teamA: {
        teamName: m.teamA?.teamName || m.teamA?.name || m.teamAName || "Team A",
        score: Number(m.teamA?.score ?? 0),
      },
      teamB: {
        teamName: m.teamB?.teamName || m.teamB?.name || m.teamBName || "Team B",
        score: Number(m.teamB?.score ?? 0),
      },
      events: m.events ? Object.values(m.events) : [],
      updatedAt: m.updatedAt || Date.now(),
    }));

    setActiveLiveMatches(formattedList);
  }

  // Google-Style Realtime Database Listener + 1-Second High-Frequency Ticker
  useEffect(() => {
    loadDashboard(true);

    // High-frequency 1-second ticker (Google Live Score style)
    const ticker = setInterval(async () => {
      try {
        const liveRef = ref(rtdb, "liveMatches");
        const snap = await get(liveRef);
        if (snap.exists()) {
          parseAndSetLiveMatches(snap.val());
        }
      } catch (e) {}
    }, 1000);

    let unsubscribe: () => void = () => {};

    try {
      const liveRef = ref(rtdb, "liveMatches");
      unsubscribe = onValue(liveRef, (snapshot) => {
        if (snapshot.exists()) {
          parseAndSetLiveMatches(snapshot.val());
        } else {
          setActiveLiveMatches([]);
        }
      });
    } catch (err) {
      console.error("Realtime listener error in admin dashboard", err);
    }

    return () => {
      clearInterval(ticker);
      unsubscribe();
    };
  }, []);

  async function loadDashboard(showSpinner = true) {
    try {
      if (showSpinner) setLoading(true);
      setError("");

      const [usersResponse, teamsResponse, matchesResponse] = await Promise.all([
        apiRequest("/users"),
        apiRequest("/teams"),
        apiRequest("/matches"),
      ]);

      const users = usersResponse.data || [];
      const teams = teamsResponse.data || [];
      const matches = matchesResponse.data || [];

      setStats({
        users: users.length,
        teams: teams.length,
        scheduledMatches: matches.filter(
          (match: any) => (match.status || "").toLowerCase() === "scheduled"
        ).length,
        liveMatches: matches.filter(
          (match: any) =>
            (match.status || "").toLowerCase() === "live" ||
            (match.status || "").toLowerCase() === "half_time"
        ).length,
        completedMatches: matches.filter(
          (match: any) => (match.status || "").toLowerCase() === "completed"
        ).length,
      });
    } catch (err) {
      console.error(err);
      if (showSpinner) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard metrics..." />;
  }

  if (error) {
    return <ErrorAlert title="Unable to load dashboard" message={error} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        subtitle="Real-time metrics and system activity across all sports events."
      />

      {/* Reusable Statistics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon="👥"
          accentColor="from-blue-50 to-indigo-50/50"
          borderColor="border-blue-200"
          badgeColor="text-blue-700 bg-blue-100"
        />

        <StatCard
          title="Teams"
          value={stats.teams}
          icon="🏆"
          accentColor="from-purple-50 to-pink-50/50"
          borderColor="border-purple-200"
          badgeColor="text-purple-700 bg-purple-100"
        />

        <StatCard
          title="Scheduled"
          value={stats.scheduledMatches}
          icon="📅"
          accentColor="from-amber-50 to-orange-50/50"
          borderColor="border-amber-200"
          badgeColor="text-amber-700 bg-amber-100"
        />

        <StatCard
          title="Live Now"
          value={stats.liveMatches}
          icon="⚡"
          accentColor="from-emerald-50 to-teal-50/50"
          borderColor="border-emerald-300"
          badgeColor="text-emerald-700 bg-emerald-100 animate-pulse"
        />

        <StatCard
          title="Completed"
          value={stats.completedMatches}
          icon="✅"
          accentColor="from-cyan-50 to-sky-50/50"
          borderColor="border-cyan-200"
          badgeColor="text-cyan-700 bg-cyan-100"
        />
      </div>

      {/* Admin Real-Time Live Match Monitor Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>⚡ Live Match Broadcast Monitor</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="animate-pulse">🔴 Live 1s Ticker</span> — {activeLiveMatches.length} Matches
          </span>
        </div>

        {activeLiveMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            <span className="text-3xl block mb-2">⚽</span>
            <p className="text-sm font-semibold">No matches currently initialized in live progress.</p>
            <p className="text-xs text-slate-400 mt-1">When a Scorer clicks "Initialize Match" in their dashboard, the live match score card will appear here in real time.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeLiveMatches.map((match) => {
              const teamAName = match.teamA?.teamName || match.teamA?.name || match.teamAName || "Team A";
              const teamBName = match.teamB?.teamName || match.teamB?.name || match.teamBName || "Team B";
              const scoreA = match.teamA?.score ?? 0;
              const scoreB = match.teamB?.score ?? 0;
              const events = match.events || [];
              const statusStr = (match.status || "not_started").toUpperCase().replace("_", " ");

              return (
                <div
                  key={match.matchId || match.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                      {match.sportName || match.sport || "Football"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      statusStr.includes("LIVE")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                        : statusStr.includes("HALF")
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      ● {statusStr}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-center">
                    <span className="font-extrabold text-slate-900 truncate">{teamAName}</span>
                    <div className="text-3xl font-black font-mono text-cyan-600 tracking-tight">
                      {scoreA} : {scoreB}
                    </div>
                    <span className="font-extrabold text-slate-900 truncate">{teamBName}</span>
                  </div>

                  {events.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Events</p>
                      {events.slice(-2).map((ev: any) => (
                        <div key={ev.id || ev.minute} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                          <span className="font-mono font-bold text-cyan-600">{ev.minute}'</span>
                          <span>{ev.type === "goal" ? "⚽ Goal" : ev.type === "yellow_card" ? "🟨 Card" : "🔄 Sub"}</span>
                          <span className="font-medium text-slate-500 truncate">{ev.playerName || ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}