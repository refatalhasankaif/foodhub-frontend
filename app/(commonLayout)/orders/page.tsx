"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
  orderItems: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  READY: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backend/orders", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
        return res.json() as Promise<Order[]>;
      })
      .then(setOrders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <p className="text-red-600 dark:text-red-400 font-medium">Failed to load orders.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 dark:text-gray-400">You have not placed any orders yet.</p>
        <Link
          href="/meals"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Meals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700 mb-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.meal.name} x {item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
              <p>Address: {order.deliveryAddress}</p>
              <p>Phone: {order.deliveryPhone}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 dark:text-white">
                £{order.totalAmount.toFixed(2)}
              </p>
              <Link
                href={`/orders/${order.id}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}