"use client";

import { useCartStore, useCartItemCount, useCartTotal, useCartItems } from "@/lib/cartStore";
import { authClient } from "@/lib/auth-client";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const items = useCartItems();
  const itemCount = useCartItemCount();
  const total = useCartTotal();
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const router = useRouter();

  // ✅ Get real user data from session — no extra fetch needed
  const { data: session } = authClient.useSession();
  const user = session?.user as {
    id?: string;
    phone?: string | null;
    address?: string | null;
  } | null | undefined;

  const [isPlacing, setIsPlacing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (!session) {
      setMessage({ text: "Please log in before placing an order.", type: "error" });
      return;
    }

    setIsPlacing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/backend/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: total,
          deliveryAddress: user?.address ?? "",
          deliveryPhone: user?.phone ?? "",
          orderItems: items.map((item) => ({
            mealId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message || `Failed to place order (${res.status})`);
      }

      const createdOrder = await res.json();
      clearCart();
      router.push(`/orders/${createdOrder.id}`);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Unknown error occurred.",
        type: "error",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Your Cart is Empty
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Add some delicious meals to get started!
        </p>
        <Link
          href="/meals"
          className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-md text-lg font-medium transition-colors"
        >
          Browse Meals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900 dark:text-white">
        Your Cart
      </h1>

      {message && (
        <div
          className={`mb-8 p-5 rounded-xl text-center font-medium shadow-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-800/50"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800/50"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-10 divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-6 first:pt-0 last:pb-0"
          >
            <div className="flex items-start sm:items-center gap-5 flex-1">
              {item.imageUrl && (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <NextImage
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 112px"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg md:text-xl text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                  £{item.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors px-3 py-1"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>



      <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          <span>Total ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-green-600 dark:text-green-400">£{total.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing || items.length === 0}
          className={`w-full py-5 px-8 text-white font-bold text-xl rounded-xl transition-all shadow-lg ${
            isPlacing || items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-2xl active:scale-[0.98]"
          }`}
        >
          {isPlacing ? "Placing Order..." : "Place Order →"}
        </button>
      </div>
    </div>
  );
}