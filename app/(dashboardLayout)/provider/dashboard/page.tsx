"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalMenuItems: number;
  totalOrders: number;
  totalRevenue: number;
  orderStatusBreakdown: {
    PLACED: number;
    PREPARING: number;
    READY: number;
    DELIVERED: number;
    CANCELLED: number;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  meal: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  customer: { name: string; email: string };
  orderItems: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PLACED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  READY:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function ProviderDashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/backend/providers/dashboard", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error(`Dashboard fetch failed (${r.status})`);
        return r.json() as Promise<DashboardStats>;
      }),
      fetch("/api/backend/orders/provider/orders", { credentials: "include" }).then((r) => {
        if (!r.ok) return [] as Order[];
        return r.json().then((d) => (Array.isArray(d) ? d : [])) as Promise<Order[]>;
      }),
    ])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o.slice(0, 5));
      })
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

  const { orderStatusBreakdown: b } = stats;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your restaurant performance.
        </p>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue"  value={`£${stats.totalRevenue.toFixed(2)}`} sub="All delivered orders" />
        <StatCard label="Total Orders"   value={stats.totalOrders}    sub="All time" />
        <StatCard label="Menu Items"     value={stats.totalMenuItems} sub="On your menu" />
        <StatCard label="Placed"         value={b.PLACED}    sub="Awaiting preparation" />
        <StatCard label="Preparing"      value={b.PREPARING} sub="In kitchen" />
        <StatCard label="Ready"          value={b.READY}     sub="For delivery" />
        <StatCard label="Delivered"      value={b.DELIVERED} sub="Completed" />
        <StatCard label="Cancelled"      value={b.CANCELLED} sub="All time" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link
            href="/provider/orders"
            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      #{order.orderNumber}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {order.customer?.name} &middot; {order.customer?.email}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    £{order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}