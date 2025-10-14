import { Home, Shield } from "lucide-react";

export interface MenuItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    permission?: string | string[];
}

export const menuItems: MenuItem[] = [
    {
        name: "Dashboard",
        href: "/",
        icon: <Home className="h-4 w-4" />,

    },
    {
        name: "Administración",
        href: "/admin",
        icon: <Shield className="h-4 w-4" />,
        permission: ["user:read", "role:read", "permission:read"],
    },
];
