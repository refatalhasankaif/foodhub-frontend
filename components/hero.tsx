import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt="Delicious food background"
          fill
          className="object-cover brightness-[0.65] scale-105"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 md:mb-8">
            Discover & Order
            <br className="hidden sm:block" />
            <span className="text-orange-400">Delicious Meals</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 md:mb-12 max-w-3xl mx-auto">
            Browse hundreds of local restaurants and get your favorite food delivered fast — 
            fresh, hot, and straight to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-50 w-full sm:w-auto"
            >
              Create Account
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/meals"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/70 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
            >
              Browse All Meals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}