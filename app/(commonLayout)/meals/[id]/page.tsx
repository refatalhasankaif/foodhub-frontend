import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";
import Link from "next/link";

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: { name: string } | null;
  provider?: {
    restaurantName: string;
    address: string;
    phone: string;
  } | null;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: Date;
    user?: { name: string | null } | null;
  }> | null;
}

async function fetchMeal(id: string): Promise<Meal | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/meals/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch meal: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching meal:", error);
    return null;
  }
}

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const meal = await fetchMeal(id);

  if (!meal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Meal Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          The requested meal could not be found or is no longer available.
        </p>
        <Link
          href="/meals"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
        >
          Back to All Meals
        </Link>
      </div>
    );
  }

  const reviews = meal.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "No reviews";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link
        href="/meals"
        className="inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mb-8"
      >
        ← Back to All Meals
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative w-full h-96 md:h-125">
          {meal.imageUrl ? (
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-2xl font-medium">
              No Image Available
            </div>
          )}

          {!meal.isAvailable && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Currently Unavailable
            </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {meal.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-4 py-1 rounded-full text-sm font-medium">
                  {meal.category?.name || "Uncategorized"}
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  £{meal.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-500">
                ★ {averageRating}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {meal.description || "No description provided."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Restaurant / Provider
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> {meal.provider?.restaurantName || "Unknown"}
                </p>
                <p>
                  <strong>Address:</strong> {meal.provider?.address || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {meal.provider?.phone || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Availability
              </h3>
              <p className="text-lg">
                {meal.isAvailable ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    ✓ Available for order
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    × Currently unavailable
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Last updated: {new Date(meal.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Customer Reviews
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No reviews yet. Be the first to leave one!
              </p>
            ) : (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="text-yellow-500 text-lg">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {meal.isAvailable && (
  <div className="mt-12 text-center">
    <AddToCartButton
      meal={{
        id: meal.id,
        name: meal.name,
        price: meal.price,
        imageUrl: meal.imageUrl,
      }}
    />
  </div>
)}
        </div>
      </div>
    </div>
  );
}