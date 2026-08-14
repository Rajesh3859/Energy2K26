"use client";

import { FormEvent, useState } from "react";

export interface UserFormData {
  displayName: string;
  email: string;
  password: string;
  role: "admin" | "scorer" | "viewer";
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function UserForm({
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    displayName: "",
    email: "",
    password: "",
    role: "scorer",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          type="text"
          required
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="John Doe"
          className="w-full rounded-lg border p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="scorer@energy.com"
          className="w-full rounded-lg border p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password (Min 6 characters)</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          className="w-full rounded-lg border p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">System Role</label>
        <select
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value as "admin" | "scorer" | "viewer",
            })
          }
          className="w-full rounded-lg border bg-white p-2.5 text-sm"
        >
          <option value="scorer">Scorer</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-all"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
