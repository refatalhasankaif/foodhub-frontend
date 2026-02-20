"use client";

import { useEffect, useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  category: Category;
  createdAt: string;
}

interface MealForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
}

const EMPTY_FORM: MealForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  isAvailable: true,
};


async function fetchMeals(): Promise<Meal[]> {
  const res = await fetch("/api/backend/meals", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch meals (${res.status})`);
  return res.json();
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/backend/categories", { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function createMeal(data: MealForm): Promise<Meal> {
  const res = await fetch("/api/backend/meals/create", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      price: parseFloat(data.price),
      imageUrl: data.imageUrl || null,
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to create meal (${res.status})`);
  }
  return res.json();
}

async function updateMeal(id: string, data: MealForm): Promise<Meal> {
  const res = await fetch(`/api/backend/meals/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      price: parseFloat(data.price),
      imageUrl: data.imageUrl || null,
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to update meal (${res.status})`);
  }
  return res.json();
}

async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`/api/backend/meals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to delete meal (${res.status})`);
  }
}



function InputField({
  label, value, onChange, placeholder, disabled, required, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; required?: boolean; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 text-sm"
      />
    </div>
  );
}


function MealFormPanel({
  form, setForm, onSave, onCancel, isPending, isEdit, categories,
}: {
  form: MealForm;
  setForm: React.Dispatch<React.SetStateAction<MealForm>>;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit: boolean;
  categories: Category[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Meal" : "Add New Meal"}
        </h2>
      </div>
      <form onSubmit={onSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Meal Name" value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder="e.g. Chicken Burger" required disabled={isPending}
        />
        <InputField
          label="Price (£)" value={form.price} type="number"
          onChange={(v) => setForm((f) => ({ ...f, price: v }))}
          placeholder="0.00" required disabled={isPending}
        />
        <div className="sm:col-span-2">
          <InputField
            label="Description" value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Short description of the meal" required disabled={isPending}
          />
        </div>
        <InputField
          label="Image URL (optional)" value={form.imageUrl}
          onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
          placeholder="https://..." disabled={isPending}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            id="isAvailable" type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
            disabled={isPending}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="isAvailable" className="text-sm text-gray-700 dark:text-gray-300">
            Available for ordering
          </label>
        </div>
        <div className="sm:col-span-2 flex gap-3 pt-2">
          <button
            type="submit" disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Meal"}
          </button>
          <button
            type="button" onClick={onCancel} disabled={isPending}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProviderMenuPage() {
  const [meals, setMeals]             = useState<Meal[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [form, setForm]               = useState<MealForm>(EMPTY_FORM);
  const [isPending, startTransition]  = useTransition();
  const [toast, setToast]             = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    Promise.all([fetchMeals(), fetchCategories()])
      .then(([m, c]) => { setMeals(m); setCategories(c); })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingMeal(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(meal: Meal) {
    setEditingMeal(meal);
    setForm({
      name: meal.name,
      description: meal.description,
      price: meal.price.toString(),
      imageUrl: meal.imageUrl ?? "",
      categoryId: meal.category?.id ?? "",
      isAvailable: meal.isAvailable,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingMeal) {
          const updated = await updateMeal(editingMeal.id, form);
          setMeals((prev) => prev.map((m) => m.id === updated.id ? updated : m));
          showToast("Meal updated.", "success");
        } else {
          const created = await createMeal(form);
          setMeals((prev) => [created, ...prev]);
          showToast("Meal added.", "success");
        }
        setShowForm(false);
        setEditingMeal(null);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Save failed", "error");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteMeal(id);
        setMeals((prev) => prev.filter((m) => m.id !== id));
        setDeleteId(null);
        showToast("Meal deleted.", "success");
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading menu…</p>
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
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Menu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {meals.length} {meals.length === 1 ? "meal" : "meals"} on your menu
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
          >
            Add Meal
          </button>
        )}
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

      {showForm && (
        <MealFormPanel
          form={form} setForm={setForm}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingMeal(null); }}
          isPending={isPending}
          isEdit={!!editingMeal}
          categories={categories}
        />
      )}

      {meals.length === 0 && !showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            No meals on your menu yet. Add your first meal to get started.
          </p>
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
          >
            Add First Meal
          </button>
        </div>
      )}

      {meals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_100px_120px_90px_90px] gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <span>Meal</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span></span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {meals.map((meal) => (
              <div key={meal.id}>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_90px_90px] gap-2 sm:gap-4 px-6 py-4 items-center">

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {meal.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {meal.description}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {meal.category?.name ?? "—"}
                  </span>

                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    £{meal.price.toFixed(2)}
                  </span>

                  <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    meal.isAvailable
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    {meal.isAvailable ? "Available" : "Hidden"}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(meal)}
                      className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(meal.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>


                {deleteId === meal.id && (
                  <div className="mx-6 mb-4 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Delete <span className="font-semibold">{meal.name}</span>? This cannot be undone.
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleDelete(meal.id)}
                        disabled={isPending}
                        className="text-xs font-medium px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors"
                      >
                        {isPending ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        disabled={isPending}
                        className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}