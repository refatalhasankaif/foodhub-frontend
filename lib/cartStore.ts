
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (meal: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (meal) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === meal.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === meal.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...meal, quantity: 1 }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "foodhub-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─────────────────────────────────────────────
// Helper selectors (use these in components!)
export const useCartItemCount = () =>
  useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

export const useCartItems = () => useCartStore((state) => state.items);