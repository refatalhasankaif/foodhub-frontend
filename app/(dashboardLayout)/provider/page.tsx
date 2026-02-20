"use client";

import { useEffect, useState, useTransition } from "react";

interface ProviderProfile {
  id: string;
  restaurantName: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  restaurantName: string;
  address: string;
  phone: string;
}

const EMPTY_FORM: FormState = { restaurantName: "", address: "", phone: "" };

async function fetchProfile(): Promise<ProviderProfile | null> {
  const res = await fetch("/api/backend/providers/me", { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
  return res.json();
}

async function createProfile(data: FormState): Promise<ProviderProfile> {
  const res = await fetch("/api/backend/providers/create", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to create profile (${res.status})`);
  }
  return res.json();
}

async function updateProfile(data: FormState): Promise<ProviderProfile> {
  const res = await fetch("/api/backend/providers/update", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to update profile (${res.status})`);
  }
  return res.json();
}

async function deleteProfile(): Promise<void> {
  const res = await fetch("/api/backend/providers/delete", {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to delete profile (${res.status})`);
  }
}


function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 wrap-break-word">{value}</p>
      </div>
    </div>
  );
}


export default function ProviderPage() {
  const [profile, setProfile]       = useState<ProviderProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [editing, setEditing]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [toast, setToast]           = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing(true);
  }

  function openEdit() {
    if (!profile) return;
    setForm({
      restaurantName: profile.restaurantName,
      address: profile.address,
      phone: profile.phone,
    });
    setEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const saved = profile
          ? await updateProfile(form)
          : await createProfile(form);
        setProfile(saved);
        setEditing(false);
        showToast(profile ? "Restaurant updated." : "Restaurant created.", "success");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Save failed", "error");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProfile();
        setProfile(null);
        setConfirmDelete(false);
        showToast("Restaurant profile deleted.", "success");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Delete failed", "error");
      }
    });
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading restaurant profile…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {profile
              ? "Manage your restaurant details visible to customers."
              : "Set up your restaurant to start receiving orders."}
          </p>
        </div>

        {profile && !editing && (
          <div className="flex gap-2">
            <button
              onClick={openEdit}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
          toast.type === "success"
            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
            : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
        }`}>
          {toast.text}
        </div>
      )}


      {confirmDelete && (
        <div className="mb-6 p-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
            Delete restaurant profile?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            This will remove your restaurant and all associated meals. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors"
            >
              {isPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">

        {!profile && !editing && (
          <div className="p-10 flex flex-col items-center text-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs">
              You have not set up a restaurant profile yet. Create one to list your meals and start receiving orders.
            </p>
            <button
              onClick={openCreate}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              Create Restaurant Profile
            </button>
          </div>
        )}

        {editing && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {profile ? "Update Restaurant" : "Create Restaurant"}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <InputField
                label="Restaurant Name"
                value={form.restaurantName}
                onChange={(v) => setForm((f) => ({ ...f, restaurantName: v }))}
                placeholder="e.g. The Burger Place"
                required
                disabled={isPending}
              />
              <InputField
                label="Address"
                value={form.address}
                onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                placeholder="Full restaurant address"
                required
                disabled={isPending}
              />
              <InputField
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="+880 1X XXXX XXXX"
                required
                disabled={isPending}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg text-sm transition-colors"
                >
                  {isPending ? "Saving…" : profile ? "Save Changes" : "Create Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={isPending}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {profile && !editing && (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {profile.restaurantName}
              </h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Restaurant Name" value={profile.restaurantName} />
              <InfoRow label="Address"         value={profile.address} />
              <InfoRow label="Phone"           value={profile.phone} />
              <InfoRow
                label="Listed Since"
                value={new Date(profile.createdAt).toLocaleDateString("en-US", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              />
              <InfoRow
                label="Last Updated"
                value={new Date(profile.updatedAt).toLocaleDateString("en-US", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}