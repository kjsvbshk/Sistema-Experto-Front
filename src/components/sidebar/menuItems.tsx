import { Book, Bot, Home, Shield, FileText } from "lucide-react";

export interface MenuItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    permission?: string | string[];
    userType?: 'experto' | 'administrador' | 'cliente' | ('experto' | 'administrador' | 'cliente')[];
}

// Lo ideal que el permiso minimo para acceder a la ruta sea el read

export const menuItems: MenuItem[] = [
    {
        name: "Dashboard",
        href: "/",
        icon: <Home className="h-4 w-4" />,
    },
    {
        name: "Mi Historial",
        href: "/my-history",
        icon: <FileText className="h-4 w-4" />,
        userType: 'cliente',
    },
    {
        name: "Usar Sistema Experto",
        href: "/agent",
        icon: <Bot className="h-4 w-4" />,
        permission: ["agent:use"],
        userType: 'experto',
    },
    {
        name: "Reglas de Sistema Experto",
        href: "/rules-agent",
        icon: <Book className="h-4 w-4" />,
        permission: ["agent:read"],
        userType: 'experto',
    },
    {
        name: "Administración",
        href: "/admin",
        icon: <Shield className="h-4 w-4" />,
        permission: ["user:read", "role:read", "permission:read"],
        userType: 'administrador',
    },
];
