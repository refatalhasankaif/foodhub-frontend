
"use client";


import { useCartStore } from "@/lib/cartStore";
import { useState } from "react";

interface AddToCartButtonProps {
  meal: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
}

export default function AddToCartButton({ meal }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    addItem(meal);
    
    // Show "Added ✓" feedback
    setJustAdded(true);
    
    // Revert back to normal text after 1.8–2 seconds
    setTimeout(() => {
      setJustAdded(false);
    }, 1800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={justAdded}
      className={`
        font-bold py-4 px-10 rounded-xl text-xl transition-all shadow-lg w-full md:w-auto
        ${
          justAdded
            ? "bg-green-800 text-white cursor-default"
            : "bg-green-600 hover:bg-green-700 text-white"
        }
      `}
    >
      {justAdded ? "Added ✓" : `Add to Cart • £${meal.price.toFixed(2)}`}
    </button>
  );
}