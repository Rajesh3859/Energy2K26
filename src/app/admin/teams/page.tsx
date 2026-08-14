"use client";

import { useEffect, useState } from "react";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/services/team.service";
import TeamForm, { TeamFormData } from "@/components/teams/TeamForm";
import { Team } from "@/types/team";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    teamName: "",
    schoolName: "",
    location: "",
    status: "active",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      setError("");
      const response = await getTeams();
      setTeams(response.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam(data: TeamFormData) {
    try {
      setSubmitting(true);
      await createTeam(data);
      setShowCreateModal(false);
      await loadTeams();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditTeam(team: Team) {
    setEditingTeam(team);
    setEditForm({
      teamName: team.name || team.teamName || "",
      schoolName: team.department || team.schoolName || "",
      location: team.location || "",
      status: team.status || "active",
    });
  }

  async function handleUpdateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      setSubmitting(true);
      await updateTeam(editingTeam.id, {
        teamName: editForm.teamName,
        schoolName: editForm.schoolName,
        location: editForm.location,
        status: editForm.status,
      });
      setEditingTeam(null);
      await loadTeams();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDeleteTeam() {
    if (!deletingTeam) return;

    try {
      setSubmitting(true);
      await deleteTeam(deletingTeam.id);
      setDeletingTeam(null);
      await loadTeams();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<Team>[] = [
    {
      key: "name",
      label: "Team",
      render: (team) => (
        <span className="font-semibold text-slate-900">
          {team.name || team.teamName || "Unnamed Team"}
        </span>
      ),
    },
    {
      key: "shortName",
      label: "Code",
      render: (team) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200">
          {team.shortName || team.teamCode || "-"}
        </span>
      ),
    },
    {
      key: "sportName",
      label: "Sport",
      render: (team) => <span className="text-slate-600">{team.sportName || "-"}</span>,
    },
    {
      key: "department",
      label: "Department / School",
      render: (team) => (
        <span className="text-slate-600">
          {team.department || team.schoolName || "-"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (team) => <span className="text-slate-500">{team.location || "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (team) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
            team.status === "inactive"
              ? "bg-slate-100 text-slate-600 border-slate-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              team.status === "inactive" ? "bg-slate-400" : "bg-emerald-500"
            }`}
          ></span>
          {team.status || "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (team) => {
        const displayName = team.name || team.teamName || "Unnamed Team";
        return (
          <div className="space-x-2">
            <button
              onClick={() => startEditTeam(team)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => setDeletingTeam({ id: team.id, name: displayName })}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams Management"
        subtitle="Create, manage, and assign sports teams across all events."
        actionButton={{
          label: "+ Add Team",
          onClick: () => setShowCreateModal(true),
        }}
      />

      {loading && <LoadingSpinner message="Loading teams..." />}
      {error && <ErrorAlert title="Failed to load teams" message={error} />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={teams}
          keyField="id"
          emptyMessage='No teams found. Click "+ Add Team" to register a team.'
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Team"
        maxWidth="xl"
      >
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setShowCreateModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        title="Edit Team Details"
      >
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input
              type="text"
              required
              value={editForm.teamName}
              onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">School / Department</label>
            <input
              type="text"
              required
              value={editForm.schoolName}
              onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              required
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full rounded-lg border bg-white p-2.5 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setEditingTeam(null)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        title="Confirm Delete Team"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm">
              Are you sure you want to delete <strong>{deletingTeam?.name}</strong>? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setDeletingTeam(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={confirmDeleteTeam}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50 shadow-md shadow-red-500/20"
            >
              {submitting ? "Deleting..." : "Yes, Delete Team"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}