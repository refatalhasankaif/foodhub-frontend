"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV: Record<string, { title: string; url: string }[]> = {
    PROVIDER: [
        { title: "Profile",   url: "/provider" },
        { title: "Dashboard", url: "/provider/dashboard" },
        { title: "My Menu",   url: "/provider/menu" },
        { title: "Orders",    url: "/provider/orders" },
    ],
    ADMIN: [
        { title: "Dashboard",  url: "/admin" },
        { title: "Users",      url: "/admin/users" },
        { title: "Orders",     url: "/admin/orders" },
        { title: "Categories", url: "/admin/categories" },
    ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();

    const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
    const role = user?.role ?? "PROVIDER";
    const navItems = NAV[role] ?? NAV.PROVIDER;

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg font-bold text-sidebar-foreground">FoodHub</span>
                </Link>
                <p className="text-xs font-semibold text-sidebar-foreground/50 mt-0.5 uppercase tracking-wider">
                    {role === "ADMIN" ? "Admin Dashboard" : "Provider Dashboard"}
                </p>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>{item.title}</Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="text-red-500 font-black border-2 border-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-950/30"
                                >
                                    Log out
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border px-4 py-8 gap-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {role}
                            </span>
                        </div>
                        <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}