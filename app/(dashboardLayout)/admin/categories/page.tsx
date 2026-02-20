"use client";

import { useEffect, useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    fetch("/api/backend/admin/categories", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
        return res.json() as Promise<Category[]>;
      })
      .then(setCategories)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return showToast("Please enter a category name", "error");

    startTransition(async () => {
      try {
        const res = await fetch("/api/backend/admin/categories", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });

        if (!res.ok) throw new Error("Could not create category");

        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        setNewName("");
        showToast(`Category "${created.name}" created`, "success");
      } catch {
        showToast("Failed to create category", "error");
      }
    });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return showToast("Name cannot be empty", "error");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/backend/admin/categories/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });

        if (!res.ok) throw new Error("Could not update category");

        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setEditingId(null);
        setEditName("");
        showToast(`Category updated to "${updated.name}"`, "success");
      } catch {
        showToast("Failed to update category", "error");
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingId(id);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/backend/admin/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("cannot-delete-used");
        }

        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(`Category "${name}" deleted`, "success");
      } catch {
        showToast(
          `Cannot delete "${name}" — some meals are still using this category`,
          "error"
        );
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {categories.length} total
        </p>
      </div>
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
          }`}
        >
          {toast.text}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-8">
        <h2 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Add New Category
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Desserts, Drinks, Breakfast..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isPending}
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !newName.trim()}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_160px_140px] gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          <span>Name</span>
          <span>Created</span>
          <span></span>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No categories yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isDeleting = deletingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_160px_140px] gap-4 px-6 py-4 items-center"
                >
                  <div>
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cat.name}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(cat.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <div className="flex gap-3 justify-end sm:justify-start">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={isPending}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          disabled={isPending || isDeleting}
                          className="text-blue-600 dark:text-blue-400 text-xs hover:underline disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={isPending || isDeleting}
                          className="text-red-600 dark:text-red-400 text-xs hover:underline disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-right">
        Showing {categories.length} categories
      </p>
    </div>
  );
}