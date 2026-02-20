"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalOrders: number;
  totalRevenue: number;
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backend/admin/dashboard", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
        return res.json() as Promise<AdminStats>;
      })
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-red-500">{error ?? "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform-wide overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Revenue"
          value={`£${stats.totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          sub="All delivered orders"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          sub="All time"
          href="/admin/orders"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.totalCustomers} customers · ${stats.totalProviders} providers`}
          href="/admin/users"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers}
          href="/admin/users"
        />
        <StatCard
          label="Providers"
          value={stats.totalProviders}
          href="/admin/users"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
          {[
            { label: "Manage Users",      sub: "View, suspend or delete users",     href: "/admin/users" },
            { label: "Manage Orders",     sub: "View all platform orders",          href: "/admin/orders" },
            { label: "Manage Categories", sub: "Add or remove meal categories",     href: "/admin/categories" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-1 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}