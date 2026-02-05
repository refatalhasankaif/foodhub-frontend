
import { 
  Search, 
  ShoppingBag, 
  Bike, 
  CheckCircle 
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Search className="w-10 h-10 text-orange-600" />,
    title: "Browse & Search",
    description: "Explore thousands of restaurants, cuisines, and dishes near you. Use filters to find exactly what you are craving.",
  },
  {
    number: "02",
    icon: <ShoppingBag className="w-10 h-10 text-orange-600" />,
    title: "Add to Cart",
    description: "Pick your favorites, customize your order, apply promo codes, and get ready for deliciousness.",
  },
  {
    number: "03",
    icon: <Bike className="w-10 h-10 text-orange-600" />,
    title: "Fast Delivery",
    description: "Our riders pick up your order and bring it straight to your door — hot and fresh every time.",
  },
  {
    number: "04",
    icon: <CheckCircle className="w-10 h-10 text-orange-600" />,
    title: "Enjoy & Rate",
    description: "Eat, enjoy, and let us know how we did. Your feedback helps us serve you better next time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How Foodhub Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ordering your favorite food is simple, fast, and reliable — just 4 easy steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
            >
              <div className="absolute -top-5 left-6 bg-orange-600 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                {step.number}
              </div>
              <div className="mb-6 mt-4">{step.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 w-10 h-0.5 bg-orange-200 dark:bg-orange-900" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}