import Link from 'next/link';

interface Provider {
  id: string;
  restaurantName: string;
  address: string;
  phone: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

async function fetchProviders(): Promise<Provider[]> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/providers`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch providers: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    return data as Provider[];
  } catch (err) {
    console.error('Providers fetch error:', err);
    return [];
  }
}

export default async function ProvidersPage() {
  const providers = await fetchProviders();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        All Restaurants on Foodhub
      </h1>

      {providers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-xl">
            No restaurants available at the moment.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please check back later or contact support.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative w-full h-48 bg-linear-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-3xl font-bold text-green-700 dark:text-green-300">
                    {provider.restaurantName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Restaurant</p>
                </div>
              </div>

              <div className="p-6 flex flex-col grow">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1">
                  {provider.restaurantName}
                </h2>

                <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                  <p>Address: {provider.address}</p>
                  <p>Phone: {provider.phone}</p>
                  <p className="opacity-80">Owner: {provider.user.name}</p>
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/providers/${provider.id}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center transition-colors"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}