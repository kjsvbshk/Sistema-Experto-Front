import { Book, Bot, Home, Shield } from "lucide-react";

export interface MenuItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    permission?: string | string[];
}

// Lo ideal que el permiso minimo para acceder a la ruta sea el read

export const menuItems: MenuItem[] = [
    {
        name: "Dashboard",
        href: "/",
        icon: <Home className="h-4 w-4" />,
    },
    {
        name: "Usar Sistema Experto",
        href: "/agent",
        icon: <Bot className="h-4 w-4" />,
        permission: ["agent:use"],
    },
    {
        name: "Reglas de Sistema Experto",
        href: "/rules-agent",
        icon: <Book className="h-4 w-4" />,
        permission: ["agent:read"],
    },
    {
        name: "Administración",
        href: "/admin",
        icon: <Shield className="h-4 w-4" />,
        permission: ["user:read", "role:read", "permission:read"],
    },
];
