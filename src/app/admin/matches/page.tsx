"use client";

import { useEffect, useState } from "react";
import { getMatches, createMatch, updateMatch, deleteMatch } from "@/services/match.service";
import { getLiveScore } from "@/services/liveScore.service";
import { getTeams } from "@/services/team.service";
import { getSports, Sport } from "@/services/sport.service";
import { getUsers } from "@/services/user.service";
import { Match } from "@/types/match";
import { Team } from "@/types/team";
import { User } from "@/types/auth";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import { exportMatchReportCSV } from "@/utils/reportExporter";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [createForm, setCreateForm] = useState({
    sportId: "",
    sportName: "",
    teamAId: "",
    teamAName: "",
    teamBId: "",
    teamBName: "",
    scorerId: "",
    scorerName: "",
    scorerEmail: "",
    scheduledDateTime: new Date().toISOString().slice(0, 16),
    venue: "Main Stadium",
    halfDurationMinutes: 45,
  });

  const [editForm, setEditForm] = useState({
    venue: "",
    status: "scheduled",
    teamAId: "",
    teamBId: "",
    scorerId: "",
    scorerName: "",
    scorerEmail: "",
    scheduledDateTime: new Date().toISOString().slice(0, 16),
    halfDurationMinutes: 45,
  });

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
      loadData(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData(showSpinner = true) {
    try {
      if (showSpinner) setLoading(true);
      setError("");

      const [matchesRes, teamsRes, sportsRes, usersRes] = await Promise.all([
        getMatches(),
        getTeams(),
        getSports(),
        getUsers(),
      ]);

      const fetchedMatches = matchesRes.data || [];
      const fetchedTeams = teamsRes.data || [];
      const fetchedSports = sportsRes.data || [];
      const fetchedUsers = usersRes.data || [];

      setMatches(fetchedMatches);
      setTeams(fetchedTeams);
      setSports(fetchedSports);
      setUsers(fetchedUsers);

      setCreateForm((prev) => {
        if (prev.sportId) return prev;
        const defaultSport = fetchedSports[0];
        const defaultTeamA = fetchedTeams[0];
        const defaultTeamB = fetchedTeams.length > 1 ? fetchedTeams[1] : undefined;

        return {
          ...prev,
          sportId: defaultSport?.id || "",
          sportName: defaultSport?.name || "Football",
          teamAId: defaultTeamA?.id || "",
          teamAName: defaultTeamA?.name || defaultTeamA?.teamName || "",
          teamBId: defaultTeamB?.id || "",
          teamBName: defaultTeamB?.name || defaultTeamB?.teamName || "",
          halfDurationMinutes: (defaultSport as any)?.halfDurationMinutes || 45,
        };
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();

    if (!createForm.teamAId || !createForm.teamBId) {
      alert("Please select both Team A and Team B.");
      return;
    }

    if (createForm.teamAId === createForm.teamBId) {
      alert("A team cannot play against itself.");
      return;
    }

    const [matchDate, startTime] = createForm.scheduledDateTime.split("T");

    try {
      setSubmitting(true);
      await createMatch({
        sportId: createForm.sportId,
        sportName: createForm.sportName,
        teamAId: createForm.teamAId,
        teamAName: createForm.teamAName,
        teamBId: createForm.teamBId,
        teamBName: createForm.teamBName,
        scorerId: createForm.scorerId || undefined,
        scorerName: createForm.scorerName || undefined,
        scorerEmail: createForm.scorerEmail || undefined,
        matchDate: matchDate || new Date().toISOString().slice(0, 10),
        startTime: startTime || "10:00",
        venue: createForm.venue,
        halfDurationMinutes: Number(createForm.halfDurationMinutes) || 45,
        status: "scheduled",
      } as any);

      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to schedule match");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditMatch(match: Match) {
    const extractedTeamAId = (match as any).teamAId || match.teamA?.id || "";
    const extractedTeamBId = (match as any).teamBId || match.teamB?.id || "";
    const existingDate = (match as any).matchDate || new Date().toISOString().slice(0, 10);
    const existingTime = (match as any).startTime || "10:00";

    setEditingMatch(match);
    setEditForm({
      venue: match.venue || "Main Stadium",
      status: match.status?.toLowerCase() || "scheduled",
      teamAId: extractedTeamAId,
      teamBId: extractedTeamBId,
      scorerId: match.scorerId || "",
      scorerName: match.scorerName || "",
      scorerEmail: match.scorerEmail || "",
      scheduledDateTime: `${existingDate}T${existingTime}`,
      halfDurationMinutes: (match as any).halfDurationMinutes || 45,
    });
  }

  async function handleUpdateMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMatch) return;

    const [matchDate, startTime] = editForm.scheduledDateTime.split("T");

    const payload: any = {
      venue: editForm.venue,
      status: editForm.status,
      halfDurationMinutes: Number(editForm.halfDurationMinutes) || 45,
    };

    if (matchDate) payload.matchDate = matchDate;
    if (startTime) payload.startTime = startTime;
    if (editForm.teamAId) payload.teamAId = editForm.teamAId;
    if (editForm.teamBId) payload.teamBId = editForm.teamBId;
    payload.scorerId = editForm.scorerId || null;
    payload.scorerName = editForm.scorerName || null;
    payload.scorerEmail = editForm.scorerEmail || null;

    try {
      setSubmitting(true);
      await updateMatch(editingMatch.id, payload);
      setEditingMatch(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update match");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMatch(id: string) {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      setDeletingId(id);
      await deleteMatch(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete match");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownloadResult(match: Match) {
    try {
      setDownloadingId(match.id);
      let liveData: any = null;
      try {
        const res = await getLiveScore(match.id);
        liveData = res?.data || null;
      } catch (e) {
        console.warn("Could not fetch live score details:", e);
      }

      await exportMatchReportCSV(match, liveData);
    } catch (err) {
      console.error("Error downloading match result:", err);
      alert("Failed to generate match result download.");
    } finally {
      setDownloadingId(null);
    }
  }

  const filteredMatches = matches.filter((m) => {
    if (filterStatus === "ALL") return true;
    return m.status?.toUpperCase() === filterStatus;
  });

  const columns: Column<Match>[] = [
    {
      key: "fixture",
      label: "Match Fixture",
      render: (match) => (
        <span className="font-semibold text-slate-900">
          {match.teamA?.name || (match as any).teamAName}{" "}
          <span className="text-slate-400 font-normal">vs</span>{" "}
          {match.teamB?.name || (match as any).teamBName}
        </span>
      ),
    },
    {
      key: "sport",
      label: "Sport",
      render: (match) => (
        <span className="text-slate-600">
          {match.sportName || match.sport}
        </span>
      ),
    },
    {
      key: "scorer",
      label: "Assigned Scorer",
      render: (match) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
          👤 {match.scorerName || match.scorerEmail || "Unassigned"}
        </span>
      ),
    },
    {
      key: "venue",
      label: "Venue",
      render: (match) => (
        <span className="text-slate-500">{match.venue || "Main Grounds"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (match) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase border ${
            match.status?.toUpperCase() === "LIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
              : match.status?.toUpperCase() === "COMPLETED"
              ? "bg-slate-100 text-slate-600 border-slate-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {match.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (match) => {
        const isCompleted = match.status?.toUpperCase() === "COMPLETED";
        return (
          <div className="flex items-center justify-end gap-2">
            {isCompleted && (
              <button
                onClick={() => handleDownloadResult(match)}
                disabled={downloadingId === match.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all disabled:opacity-50 shadow-xs"
                title="Download Official Match Result Report"
              >
                <span>📥</span>
                <span>{downloadingId === match.id ? "Preparing..." : "Download Result"}</span>
              </button>
            )}
            <button
              onClick={() => startEditMatch(match)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteMatch(match.id)}
              disabled={deletingId === match.id}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              {deletingId === match.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        );
      },
    },
  ];

  const eligibleScorers = users.filter((u) => u.role === "scorer" || u.role === "admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Match Schedule & Assignments"
        subtitle="Schedule fixtures, assign match scorers, and track real-time match statuses."
        actionButton={{
          label: "+ Schedule Match",
          onClick: () => setShowCreateModal(true),
        }}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {["ALL", "SCHEDULED", "LIVE", "COMPLETED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              filterStatus === st
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner message="Loading match schedule..." />}
      {error && <ErrorAlert title="Failed to load matches" message={error} />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={filteredMatches}
          keyField="id"
          emptyMessage='No matches found. Click "+ Schedule Match" to add a new fixture.'
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Match"
      >
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sport Category</label>
            <select
              value={createForm.sportId}
              onChange={(e) => {
                const selectedSport = sports.find((s) => s.id === e.target.value);
                setCreateForm({
                  ...createForm,
                  sportId: e.target.value,
                  sportName: selectedSport ? selectedSport.name : "Football",
                  teamAId: "",
                  teamAName: "",
                  teamBId: "",
                  teamBName: "",
                });
              }}
              className="w-full rounded-lg border bg-white p-2.5 text-sm font-medium text-slate-900"
            >
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Sport-Filtered Teams Selection */}
          {(() => {
            const availableTeams = teams.filter((t) => !t.sportId || t.sportId === createForm.sportId);

            return (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team A</label>
                  <select
                    value={createForm.teamAId}
                    onChange={(e) => {
                      const selected = teams.find((t) => t.id === e.target.value);
                      setCreateForm({
                        ...createForm,
                        teamAId: e.target.value,
                        teamAName: selected ? selected.name || selected.teamName || "" : "",
                      });
                    }}
                    className="w-full rounded-lg border bg-white p-2.5 text-sm font-medium text-slate-900"
                    required
                  >
                    <option value="">Select Team A</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.teamName}
                      </option>
                    ))}
                  </select>
                  {availableTeams.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">
                      ⚠️ No teams registered for this sport yet.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team B</label>
                  <select
                    value={createForm.teamBId}
                    onChange={(e) => {
                      const selected = teams.find((t) => t.id === e.target.value);
                      setCreateForm({
                        ...createForm,
                        teamBId: e.target.value,
                        teamBName: selected ? selected.name || selected.teamName || "" : "",
                      });
                    }}
                    className="w-full rounded-lg border bg-white p-2.5 text-sm font-medium text-slate-900"
                    required
                  >
                    <option value="">Select Team B</option>
                    {availableTeams
                      .filter((t) => t.id !== createForm.teamAId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || t.teamName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            );
          })()}

          {/* Assigned Scorer Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Assign Scorer</label>
            <select
              value={createForm.scorerId}
              onChange={(e) => {
                const u = eligibleScorers.find((x) => x.uid === e.target.value);
                setCreateForm({
                  ...createForm,
                  scorerId: e.target.value,
                  scorerName: u ? u.displayName || (u as any).name || u.email || "" : "",
                  scorerEmail: u ? u.email || "" : "",
                });
              }}
              className="w-full rounded-lg border bg-white p-2.5 text-sm font-medium text-slate-900"
            >
              <option value="">-- Unassigned (Any Scorer) --</option>
              {eligibleScorers.map((sc) => (
                <option key={sc.uid} value={sc.uid}>
                  {sc.displayName || (sc as any).name || sc.email} ({sc.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                required
                value={createForm.venue}
                onChange={(e) => setCreateForm({ ...createForm, venue: e.target.value })}
                placeholder="Main Stadium"
                className="w-full rounded-lg border p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Half Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={createForm.halfDurationMinutes}
                onChange={(e) => setCreateForm({ ...createForm, halfDurationMinutes: parseInt(e.target.value) || 45 })}
                placeholder="45"
                className="w-full rounded-lg border p-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={createForm.scheduledDateTime}
              onChange={(e) => setCreateForm({ ...createForm, scheduledDateTime: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Scheduling..." : "Schedule Match"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingMatch}
        onClose={() => setEditingMatch(null)}
        title="Edit Match Details"
      >
        <form onSubmit={handleUpdateMatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full rounded-lg border bg-white p-2.5 text-sm uppercase font-semibold"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assign Scorer</label>
            <select
              value={editForm.scorerId}
              onChange={(e) => {
                const u = eligibleScorers.find((x) => x.uid === e.target.value);
                setEditForm({
                  ...editForm,
                  scorerId: e.target.value,
                  scorerName: u ? u.displayName || (u as any).name || u.email || "" : "",
                  scorerEmail: u ? u.email || "" : "",
                });
              }}
              className="w-full rounded-lg border bg-white p-2.5 text-sm font-medium text-slate-900"
            >
              <option value="">-- Unassigned (Any Scorer) --</option>
              {eligibleScorers.map((sc) => (
                <option key={sc.uid} value={sc.uid}>
                  {sc.displayName || (sc as any).name || sc.email} ({sc.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                required
                value={editForm.venue}
                onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Half Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={editForm.halfDurationMinutes}
                onChange={(e) => setEditForm({ ...editForm, halfDurationMinutes: parseInt(e.target.value) || 45 })}
                placeholder="45"
                className="w-full rounded-lg border p-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={editForm.scheduledDateTime}
              onChange={(e) => setEditForm({ ...editForm, scheduledDateTime: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setEditingMatch(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
