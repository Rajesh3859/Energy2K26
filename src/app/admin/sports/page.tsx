"use client";

import { useEffect, useState } from "react";
import { getSports, createSport, deleteSport, Sport } from "@/services/sport.service";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";
import SportForm, { SportFormData } from "@/components/forms/SportForm";

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  async function loadSports() {
    try {
      setLoading(true);
      setError("");
      const response = await getSports();
      setSports(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load sports");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSport(data: SportFormData) {
    try {
      setSubmitting(true);
      await createSport(data);
      setShowModal(false);
      await loadSports();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create sport");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSport(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete sport "${name}"?`)) return;

    try {
      await deleteSport(id);
      await loadSports();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete sport");
    }
  }

  const columns: Column<Sport>[] = [
    {
      key: "name",
      label: "Sport Name",
      render: (sport) => (
        <span className="font-semibold text-slate-900">{sport.name}</span>
      ),
    },
    {
      key: "code",
      label: "Code",
      render: (sport) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200">
          {sport.code || "-"}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (sport) => (
        <span className="text-slate-600">{sport.category || "General"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (sport) => (
        <button
          onClick={() => handleDeleteSport(sport.id, sport.name)}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sports Management"
        subtitle="Register and manage sports disciplines and competition rules."
        actionButton={{
          label: "+ Add Sport",
          onClick: () => setShowModal(true),
        }}
      />

      {loading && <LoadingSpinner message="Loading sports..." />}
      {error && <ErrorAlert title="Failed to load sports" message={error} />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={sports}
          keyField="id"
          emptyMessage='No sports found. Click "+ Add Sport" to register a sport.'
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Sport"
      >
        <SportForm
          onSubmit={handleCreateSport}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
