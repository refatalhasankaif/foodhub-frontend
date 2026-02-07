
"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { title: "Home", href: "/" },
  { title: "Meals", href: "/meals" },
  { title: "Providers", href: "/providers" },
  { title: "Cart", href: "/cart" },
  { title: "Orders", href: "/orders" },
  { title: "Profile", href: "/profile" },
];

const authLinks = {
  login: { title: "Login", href: "/login" },
  signup: { title: "Sign Up", href: "/register" },
};

export default function Navbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border bg-linear-to-br from-orange-400 to-red-500">
            <Image
              src="/logo.png"
              alt="FoodHub Logo"
              fill
              className="object-cover p-1.5"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            FoodHub
          </span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-10">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      "data-active:bg-accent/70 data-active:text-accent-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm font-medium">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  size="sm" 
                  variant="ghost"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={authLinks.login.href}>
                    {authLinks.login.title}
                  </Link>
                </Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href={authLinks.signup.href}>
                    {authLinks.signup.title}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] sm:w-95 pr-0">
              <SheetHeader className="border-b pb-5">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border bg-linear-to-br from-orange-400 to-red-500">
                      <Image
                        src="/logo.png"
                        alt="FoodHub Logo"
                        fill
                        className="object-cover p-1.5"
                      />
                    </div>
                    <span className="text-xl font-bold">FoodHub</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center px-2 py-3 text-base font-medium transition-colors hover:bg-accent rounded-md"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-3 px-2">
                  {session?.user ? (
                    <>
                      <div className="px-2 py-3 text-base  font-medium">
                        {session.user.name || session.user.email}
                      </div>
                      <Button 
                        variant="outline"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href={authLinks.login.href}>
                          {authLinks.login.title}
                        </Link>
                      </Button>
                      <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                        <Link href={authLinks.signup.href}>
                          {authLinks.signup.title}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}