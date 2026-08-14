"use client";

import { FormEvent, useState } from "react";

export interface SportFormData {
  name: string;
  code?: string;
  category?: string;
  rules?: string;
}

interface SportFormProps {
  onSubmit: (data: SportFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function SportForm({
  onSubmit,
  onCancel,
  loading = false,
}: SportFormProps) {
  const [form, setForm] = useState<SportFormData>({
    name: "",
    code: "",
    category: "Outdoor",
    rules: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Sport Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Football"
          className="w-full rounded-lg border p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sport Code</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="FB"
          className="w-full rounded-lg border p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full rounded-lg border bg-white p-2.5 text-sm"
        >
          <option value="Outdoor">Outdoor</option>
          <option value="Indoor">Indoor</option>
          <option value="Track & Field">Track & Field</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Sport"}
        </button>
      </div>
    </form>
  );
}
