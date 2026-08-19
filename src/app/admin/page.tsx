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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>⚡ Live Match Broadcast Monitor</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-max flex items-center gap-1.5">
            <span className="animate-pulse">🔴 Live 1s Ticker</span> — {activeLiveMatches.length} Matches
          </span>
        </div>

        {activeLiveMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center text-slate-500 shadow-sm">
            <span className="text-3xl block mb-2">⚽</span>
            <p className="text-sm font-semibold">No matches currently initialized in live progress.</p>
            <p className="text-xs text-slate-400 mt-1">When a Scorer starts a match in their dashboard, the live score card will appear here in real time.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeLiveMatches.map((match, idx) => {
              const teamAName = match.teamA?.teamName || match.teamA?.name || match.teamAName || "Team A";
              const teamBName = match.teamB?.teamName || match.teamB?.name || match.teamBName || "Team B";
              const sportStr = (match.sportName || match.sport || "Football").toLowerCase();
              const isCricket = sportStr.includes("cricket");

              const scoreA = match.teamA?.score;
              const scoreB = match.teamB?.score;

              const events = match.events || [];
              const statusStr = (match.status || "not_started").toUpperCase().replace("_", " ");
              const matchKey = match.matchId || match.id || `live_match_${idx}`;

              // Dynamic Cricket Score Display Extraction
              const cricketSummary = (() => {
                if (!isCricket) return null;
                const eventsList = Array.isArray(events) ? events : Object.values(events);
                let rA = 0, wA = 0, legalA = 0;
                let rB = 0, wB = 0, legalB = 0;

                eventsList.forEach((ev: any) => {
                  const isA = ev.teamId === match.teamA?.teamId || ev.teamName === teamAName;
                  const runVal = ev.type === "boundary_4" ? 4 : ev.type === "boundary_6" ? 6 : (typeof ev.runs === "number" ? ev.runs : 1);
                  if (isA) {
                    if (["run", "boundary_4", "boundary_6", "wide", "no_ball", "bye", "leg_bye"].includes(ev.type)) rA += runVal;
                    if (ev.type === "wicket") wA += 1;
                    if (!["wide", "no_ball"].includes(ev.type)) legalA += 1;
                  } else {
                    if (["run", "boundary_4", "boundary_6", "wide", "no_ball", "bye", "leg_bye"].includes(ev.type)) rB += runVal;
                    if (ev.type === "wicket") wB += 1;
                    if (!["wide", "no_ball"].includes(ev.type)) legalB += 1;
                  }
                });

                const ovA = `${Math.floor(legalA / 6)}.${legalA % 6}`;
                const ovB = `${Math.floor(legalB / 6)}.${legalB % 6}`;
                return { rA, wA, ovA, rB, wB, ovB };
              })();

              return (
                <div
                  key={matchKey}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-cyan-700 uppercase tracking-wider truncate">
                      {match.sportName || match.sport || "Football"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold border shrink-0 ${
                      statusStr.includes("LIVE")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                        : statusStr.includes("HALF")
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      ● {statusStr}
                    </span>
                  </div>

                  {/* Main Score Area — Mobile Responsive Layout */}
                  <div className="grid grid-cols-3 items-center text-center gap-1 sm:gap-2 my-1">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm block truncate" title={teamAName}>
                        {teamAName}
                      </span>
                      {cricketSummary && (
                        <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-500 block">
                          {cricketSummary.ovA} ov
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      {isCricket && cricketSummary ? (
                        <div className="font-mono text-lg sm:text-2xl font-black text-cyan-600 tracking-tight leading-none">
                          {cricketSummary.rA}/{cricketSummary.wA} <span className="text-slate-400 font-light text-xs sm:text-base">:</span> {cricketSummary.rB}/{cricketSummary.wB}
                        </div>
                      ) : (
                        <div className="font-mono text-2xl sm:text-3xl font-black text-cyan-600 tracking-tight">
                          {Number(scoreA ?? 0)} : {Number(scoreB ?? 0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm block truncate" title={teamBName}>
                        {teamBName}
                      </span>
                      {cricketSummary && (
                        <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-500 block">
                          {cricketSummary.ovB} ov
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recent Timeline Micro-Feed */}
                  {events.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-100 space-y-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Recent Updates</p>
                      {events.slice(-2).map((ev: any, evIdx: number) => (
                        <div key={ev.id || `${matchKey}_ev_${evIdx}`} className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded-md gap-1">
                          <span className="font-mono font-bold text-cyan-700 text-[10px]">
                            {ev.minute ? `${ev.minute}'` : ev.type?.toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-600 truncate max-w-[150px] sm:max-w-[180px]">
                            {ev.description || ev.playerName || ev.type}
                          </span>
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