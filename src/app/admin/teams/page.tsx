"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Team } from "@/types/team";

export default function TeamsPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);

      const response =
        await apiRequest("/teams");

      setTeams(response.data || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Teams Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Create, manage, and assign sports teams across all events.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-95">
          <span>+ Add Team</span>
        </button>
      </div>

      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
            <span className="text-sm font-medium">Loading teams...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-300">
          <h3 className="font-semibold text-red-200">Failed to load teams</h3>
          <p className="mt-1 text-sm text-red-300/80">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Sport</th>
                  <th className="px-6 py-4">Department / School</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No teams found. Click "+ Add Team" to register a team.
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr
                      key={team.id}
                      className="transition-colors hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {team.name || team.teamName || "Unnamed Team"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-cyan-400 border border-slate-700/60">
                          {team.shortName || team.teamCode || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {team.sportName || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {team.department || team.schoolName || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {team.location || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          {team.status || "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition-all">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}