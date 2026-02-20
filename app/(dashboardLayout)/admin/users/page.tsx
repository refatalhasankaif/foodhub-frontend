"use client";

import { useEffect, useState, useTransition } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  phone?: string | null;
  address?: string | null;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  PROVIDER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CUSTOMER: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/backend/admin/users", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
  return res.json();
}

async function updateUserStatus(id: string, status: "ACTIVE" | "SUSPENDED"): Promise<User> {
  const res = await fetch(`/api/backend/admin/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to update user (${res.status})`);
  }
  return res.json();
}

type FilterRole = "ALL" | "CUSTOMER" | "PROVIDER" | "ADMIN";
type FilterStatus = "ALL" | "ACTIVE" | "SUSPENDED";

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<FilterRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch]         = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast]           = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleToggleStatus(user: User) {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(user.id);
    startTransition(async () => {
      try {
        const updated = await updateUserStatus(user.id, next);
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
        showToast(`${updated.name} is now ${updated.status.toLowerCase()}.`, "success");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Update failed", "error");
      } finally {
        setUpdatingId(null);
      }
    });
  }

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter   === "ALL" || u.role   === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading users…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {users.length} total users
        </p>
      </div>


      {toast && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
          toast.type === "success"
            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
            : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
        }`}>
          {toast.text}
        </div>
      )}


      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <div className="flex flex-wrap gap-4">

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-12">Role</span>
            <div className="flex gap-1">
              {(["ALL", "CUSTOMER", "PROVIDER", "ADMIN"] as FilterRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    roleFilter === r
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

      <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-12">Status</span>
            <div className="flex gap-1">
              {(["ALL", "ACTIVE", "SUSPENDED"] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    statusFilter === s
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        <div className="hidden sm:grid grid-cols-[1fr_180px_90px_90px_100px] gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span>User</span>
          <span>Contact</span>
          <span>Role</span>
          <span>Status</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
            No users match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_180px_90px_90px_100px] gap-2 sm:gap-4 px-6 py-4 items-center"
              >

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>


                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.phone ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {user.address ?? "—"}
                  </p>
                </div>

                <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[user.role]}`}>
                  {user.role}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{user.status}</span>
                </div>

                <div>
                  {user.role !== "ADMIN" ? (
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isPending && updatingId === user.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        user.status === "ACTIVE"
                          ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                          : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                      }`}
                    >
                      {isPending && updatingId === user.id
                        ? "…"
                        : user.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  );
}