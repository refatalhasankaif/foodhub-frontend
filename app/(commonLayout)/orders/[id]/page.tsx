"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  meal: {
    id: string;
    name: string;
    imageUrl?: string | null;
    description: string;
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
  updatedAt: string;
  orderItems: OrderItem[];
}

const STATUS_STEPS: Order["status"][] = ["PLACED", "PREPARING", "READY", "DELIVERED"];

const STATUS_STYLES: Record<Order["status"], string> = {
  PLACED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  READY:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_LABEL: Record<Order["status"], string> = {
  PLACED:    "Order Placed",
  PREPARING: "Preparing",
  READY:     "Ready for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function StatusTracker({ status }: { status: Order["status"] }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between gap-2">
      {STATUS_STEPS.map((step, i) => {
        const done    = i < currentIndex;
        const active  = i === currentIndex;
        const pending = i > currentIndex;

        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex items-center justify-center">
              {i > 0 && (
                <div className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${done || active ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done    ? "bg-green-500 border-green-500 text-white" :
                active  ? "bg-white dark:bg-gray-800 border-green-500 text-green-600 dark:text-green-400" :
                          "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
              }`}>
                {done ? "Done" : i + 1}
              </div>
            </div>
            <span className={`text-xs text-center font-medium ${
              active  ? "text-green-600 dark:text-green-400" :
              done    ? "text-gray-600 dark:text-gray-400" :
                        "text-gray-400 dark:text-gray-600"
            } ${pending ? "opacity-50" : ""}`}>
              {STATUS_LABEL[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/backend/orders/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Order not found (${res.status})`);
        return res.json() as Promise<Order>;
      })
      .then(setOrder)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-xl mb-2">Could not load this order.</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <Link href="/orders" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Back to Orders
        </Link>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-8"
      >
        Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Order Status
            </h2>
            <StatusTracker status={order.status} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Items Ordered
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-linear-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xl font-bold text-green-600 dark:text-green-400 overflow-hidden">
                    {item.meal.imageUrl ? (

                      <Image src={item.meal.imageUrl} alt={item.meal.name} className="w-full h-full object-cover" />
                    ) : (
                      item.meal.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.meal.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                      {item.meal.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      £{item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h2>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400">
                  £{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delivery Details
              </h2>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Address</p>
                <p>{order.deliveryAddress}</p>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Phone</p>
                <p>{order.deliveryPhone}</p>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Last Updated</p>
                <p>{new Date(order.updatedAt).toLocaleDateString("en-US", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}