"use client";

import { useEffect, useState, useTransition } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  meal: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  orderItems: OrderItem[];
}

type OrderStatus = Order["status"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PLACED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  READY:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PLACED:    ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY:     ["DELIVERED"],
};

const STATUS_ALL: OrderStatus[] = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/backend/orders/provider/orders", {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`/api/backend/orders/${orderId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(json.message || `Failed to update status (${res.status})`);
  }
  return res.json();
}

export default function ProviderOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [filter, setFilter]           = useState<OrderStatus | "ALL">("ALL");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();
  const [toast, setToast]             = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusUpdate(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    startTransition(async () => {
      try {
        const updated = await updateStatus(orderId, status);
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
        );
        showToast(`Order marked as ${status}.`, "success");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Update failed", "error");
      } finally {
        setUpdatingId(null);
      }
    });
  }

  const filtered = filter === "ALL"
    ? orders
    : orders.filter((o) => o.status === filter);

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

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {orders.length} total orders
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


      <div className="flex flex-wrap gap-2 mb-6">
        {(["ALL", ...STATUS_ALL] as const).map((s) => {
          const count = s === "ALL" ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                filter === s
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No orders in this category.</p>
        </div>
      )}


      <div className="flex flex-col gap-4">
        {filtered.map((order) => {
          const isExpanded = expandedId === order.id;
          const nextOptions = NEXT_STATUSES[order.status] ?? [];

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
                    {order.customer?.name ?? "Customer"} &middot;{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    £{order.totalAmount.toFixed(2)}
                  </span>

                  {nextOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(order.id, s)}
                      disabled={isPending && updatingId === order.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        s === "CANCELLED"
                          ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                          : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                      }`}
                    >
                      {isPending && updatingId === order.id ? "…" : `Mark ${s}`}
                    </button>
                  ))}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                </div>
              </div>


              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        Customer
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{order.customer?.name ?? "—"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer?.email ?? "—"}</p>
                      {order.customer?.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        Delivery
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{order.deliveryAddress}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.deliveryPhone}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Items
                    </p>
                    <div className="flex flex-col gap-1">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.meal?.name ?? "—"}
                            <span className="text-gray-400 ml-1">x{item.quantity}</span>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            £{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span>
                      <span>£{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}