
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const quickLinks = [
  { text: "Home", href: "/" },
  { text: "Browse Meals", href: "/meals" },
  { text: "All Providers", href: "/providers" },
  { text: "My Cart", href: "/cart" },
  { text: "My Orders", href: "/orders" },
  { text: "Profile", href: "/profile" },
];

export default function Footer({
  className,
}: {
  className?: string;
}) {
  return (
    <footer className={cn("bg-muted/40 border-t", className)}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-gradient-to-br from-orange-400 to-red-500">
                <Image
                  src="/logo.png"
                  alt="FoodHub Logo"
                  fill
                  className="object-cover p-1.5"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">FoodHub</span>
            </Link>

            <p className="text-muted-foreground leading-relaxed max-w-md">
              FoodHub is your go-to platform for discovering and ordering delicious meals from the best local restaurants in your area. Browse menus, place orders with ease, track deliveries in real-time, and enjoy hot, fresh food delivered right to your door — fast and convenient with cash on delivery.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FoodHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}