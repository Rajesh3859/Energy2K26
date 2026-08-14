"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSports, Sport } from "@/services/sport.service";

export interface TeamFormData {
  teamName: string;
  teamCode: string;
  sportId: string;
  sportName: string;
  schoolName: string;
  location: string;
  status: string;
}

interface TeamFormProps {
  onSubmit: (data: TeamFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

function generateTeamCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function TeamForm({
  onSubmit,
  onCancel,
  loading = false,
}: TeamFormProps) {
  const [sportsList, setSportsList] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);

  const [form, setForm] = useState<TeamFormData>({
    teamName: "",
    teamCode: generateTeamCode(),
    sportId: "",
    sportName: "",
    schoolName: "",
    location: "",
    status: "active",
  });

  useEffect(() => {
    fetchSports();
  }, []);

  async function fetchSports() {
    try {
      setLoadingSports(true);
      const res = await getSports();
      const list = res.data || [];
      setSportsList(list);

      if (list.length > 0) {
        const first = list[0];
        setForm((prev) => ({
          ...prev,
          sportId: first.id,
          sportName: first.name,
        }));
      }
    } catch (err) {
      console.error("Failed to load sports list", err);
    } finally {
      setLoadingSports(false);
    }
  }

  function updateField(field: keyof TeamFormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSportSelect(sportId: string) {
    const found = sportsList.find((s) => s.id === sportId);
    if (found) {
      setForm((prev) => ({
        ...prev,
        sportId: found.id,
        sportName: found.name,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        sportId,
        sportName: sportId,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Team Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">Team Name</label>
          <input
            value={form.teamName}
            onChange={(e) => updateField("teamName", e.target.value)}
            placeholder="Energy Tigers"
            className="w-full rounded-lg border p-3 text-sm"
            required
          />
        </div>

        {/* Team Code */}
        <div>
          <label className="mb-2 block text-sm font-medium">Team Code</label>
          <input
            value={form.teamCode}
            readOnly
            className="w-full rounded-lg border bg-slate-100 p-3 text-sm font-mono"
          />
          <p className="mt-1 text-xs text-slate-500">
            Automatically generated 4-digit code.
          </p>
        </div>

        {/* Select Sport Dropdown */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Select Sport
          </label>
          {loadingSports ? (
            <div className="w-full rounded-lg border bg-slate-50 p-3 text-sm text-slate-400">
              Loading sports options...
            </div>
          ) : (
            <select
              value={form.sportId}
              onChange={(e) => handleSportSelect(e.target.value)}
              className="w-full rounded-lg border bg-white p-3 text-sm font-medium text-slate-900"
              required
            >
              <option value="">-- Choose a Sport --</option>
              {sportsList.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name} {sport.code ? `(${sport.code})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* School Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">School / Department Name</label>
          <input
            value={form.schoolName}
            onChange={(e) => updateField("schoolName", e.target.value)}
            placeholder="Energy Sports Academy"
            className="w-full rounded-lg border p-3 text-sm"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          <input
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Chennai"
            className="w-full rounded-lg border p-3 text-sm"
            required
          />
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full rounded-lg border bg-white p-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-all"
        >
          {loading ? "Creating..." : "Create Team"}
        </button>
      </div>
    </form>
  );
}