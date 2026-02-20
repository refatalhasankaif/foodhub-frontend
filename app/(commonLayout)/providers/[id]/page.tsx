'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProviderDetail {
  id: string;
  userId: string;
  restaurantName: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  meals: Meal[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid restaurant URL');
      return;
    }

    async function loadProvider() {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setError('API base URL is not configured');
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/providers/${id}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load restaurant: ${res.status} ${text}`);
        }

        const data = await res.json();
        setProvider(data);
      } catch (err) {
        console.error('Provider detail fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      }
    }

    loadProvider();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-6">
          {error.includes('404') ? 'Restaurant Not Found' : 'Error'}
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">{error}</p>
        <Link
          href="/providers"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
        >
          Back to All Restaurants
        </Link>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-linear-to-br from-green-100 to-green-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0">
            <span className="text-5xl md:text-7xl font-bold text-green-700 dark:text-green-300">
              {provider.restaurantName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {provider.restaurantName}
            </h1>

            <div className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
              <p>Address: {provider.address}</p>
              <p>Phone: {provider.phone}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Joined: {new Date(provider.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Menu ({provider.meals?.length || 0} items)
      </h2>

      {provider.meals?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            This restaurant has no meals listed yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {provider.meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                {meal.imageUrl ? (
                  <Image
                    src={meal.imageUrl}
                    alt={meal.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col grow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {meal.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 min-h-18">
                  {meal.description || 'No description available'}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    £{meal.price.toFixed(2)}
                  </p>
                  <Link
                    href={`/meals/${meal.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded text-sm transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/providers"
          className="text-green-600 dark:text-green-400 hover:underline font-medium text-lg"
        >
          Back to All Restaurants
        </Link>
      </div>
    </div>
  );
}