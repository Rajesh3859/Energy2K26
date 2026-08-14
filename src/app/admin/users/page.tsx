"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "@/services/user.service";
import { User } from "@/types/auth";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";
import UserForm, { UserFormData } from "@/components/forms/UserForm";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(data: UserFormData) {
    try {
      setSubmitting(true);
      await createUser(data);
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(uid: string, email: string | null) {
    if (!confirm(`Are you sure you want to delete user ${email || uid}?`)) return;

    try {
      await deleteUser(uid);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  const columns: Column<User>[] = [
    {
      key: "displayName",
      label: "User",
      render: (user) => (
        <span className="font-semibold text-slate-900">
          {user.displayName || (user as any).name || user.email || "Unnamed User"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (user) => <span className="text-slate-600">{user.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
            user.role === "admin"
              ? "bg-purple-50 text-purple-700 border border-purple-200"
              : user.role === "scorer"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {user.role || "user"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (user) => (
        <button
          onClick={() => handleDeleteUser(user.uid, user.email)}
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
        title="User Management"
        subtitle="Manage system administrators, match scorers, and registered users."
        actionButton={{
          label: "+ Add User",
          onClick: () => setShowModal(true),
        }}
      />

      {loading && <LoadingSpinner message="Loading users..." />}
      {error && <ErrorAlert title="Failed to load users" message={error} />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={users}
          keyField="uid"
          emptyMessage='No users found. Click "+ Add User" to register a user.'
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New User"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
