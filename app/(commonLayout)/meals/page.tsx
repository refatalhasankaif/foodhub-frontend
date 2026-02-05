
import Image from "next/image";
import Link from "next/link";

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  category?: { name: string } | null;
  provider?: { restaurantName: string } | null;
}

async function fetchMeals(): Promise<Meal[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/meals`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch meals");
  }
  return res.json();
}

export default async function MealsPage() {
  const meals = await fetchMeals();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        All Meals on Foodhub
      </h1>

      {meals.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl mt-12">
          No meals available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                {meal.imageUrl ? (
                  <Image
                    src={meal.imageUrl}
                    alt={meal.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Image unavailable
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {meal.name}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">
                  Category: {meal.category?.name || "Uncategorized"}
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Provider: {meal.provider?.restaurantName || "Unknown"}
                </p>

                <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-6 mt-auto">
                  £{meal.price.toFixed(2)}
                </p>

                <Link
                  href={`/meals/${meal.id}`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}