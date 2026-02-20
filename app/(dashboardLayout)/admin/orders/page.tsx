"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  orderId: string;
  mealId: string;
  quantity: number;
  price: number;
  createdAt: string;
  meal: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
  };
}

interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PLACED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  READY:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

type StatusFilter = "ALL" | "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<StatusFilter>("ALL");
  const [search, setSearch]         = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backend/admin/orders", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
        return res.json() as Promise<Order[]>;
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "ALL" || o.status === filter;
    const matchSearch = !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(search.toLowerCase()) ||
      o.customerId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading orders…</p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {orders.length} total &middot; £{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })} delivered revenue
        </p>
      </div>


      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by order number, address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-12 shrink-0">
            Status
          </span>
          <div className="flex gap-1 flex-wrap">
            {(["ALL", "PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as StatusFilter[]).map((s) => {
              const count = s === "ALL" ? orders.length : orders.filter((o) => o.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    filter === s
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No orders match the current filters.</p>
        </div>
      )}


      <div className="flex flex-col gap-3">
        {filtered.map((order) => {
          const isExpanded = expandedId === order.id;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
            >

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
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
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                    &nbsp;&middot;&nbsp;
                    {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    £{order.totalAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {order.deliveryAddress || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        Delivery Phone
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {order.deliveryPhone || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {new Date(order.updatedAt).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Items
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.meal?.name ?? "—"}
                          <span className="text-gray-400 dark:text-gray-500 ml-1.5">×{item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          £{(item.price * item.quantity).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>£{order.totalAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
}