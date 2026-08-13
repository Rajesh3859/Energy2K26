"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface DashboardStats {
  users: number;
  teams: number;
  scheduledMatches: number;
  liveMatches: number;
  completedMatches: number;
}

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      users: 0,
      teams: 0,
      scheduledMatches: 0,
      liveMatches: 0,
      completedMatches: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        teamsResponse,
        matchesResponse,
      ] = await Promise.all([
        apiRequest("/users"),
        apiRequest("/teams"),
        apiRequest("/matches"),
      ]);

      const users =
        usersResponse.data || [];

      const teams =
        teamsResponse.data || [];

      const matches =
        matchesResponse.data || [];

      setStats({
        users: users.length,
        teams: teams.length,

        scheduledMatches:
          matches.filter(
            (match: any) =>
              match.status === "scheduled"
          ).length,

        liveMatches:
          matches.filter(
            (match: any) =>
              match.status === "live" ||
              match.status === "half_time"
          ).length,

        completedMatches:
          matches.filter(
            (match: any) =>
              match.status === "completed"
          ).length,
      });

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <h3 className="font-semibold text-red-900">Unable to load dashboard</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Platform Overview
        </h1>

        <p className="mt-1 text-sm text-slate-600 font-medium">
          Real-time metrics and system activity across all sports events.
        </p>
      </div>

      {/* Statistics */}
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
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  accentColor,
  borderColor,
  badgeColor,
}: {
  title: string;
  value: number;
  icon: string;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-white bg-gradient-to-br ${accentColor} p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base shadow-sm ${badgeColor}`}>
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}