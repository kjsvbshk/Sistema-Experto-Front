import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuthorization } from '../hooks/useAuthorization';
import { Menu, X, Home, Shield, Settings } from 'lucide-react';

export default function Sidebar() {
    const { isOpen, closeSidebar, toggleSidebar } = useSidebar();
    const { user } = useAuth();
    const { isAdmin } = useAuthorization();

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/',
            icon: <Home className="h-4 w-4" />,
            show: true
        },
        {
            name: 'Administración',
            href: '/admin',
            icon: <Shield className="h-4 w-4" />,
            show: isAdmin
        },
        {
            name: 'Configuración',
            href: '/admin',
            icon: <Settings className="h-4 w-4" />,
            show: isAdmin
        }
    ];

    return (
        <>
            {/* Overlay para móviles */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Header del Sidebar */}
                <div className="flex items-center justify-between h-12 px-4 border-b border-gray-700">
                    {isOpen && (
                        <div className="flex items-center">
                            <img
                                alt="Sistema de Expertos"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="h-5 w-auto"
                            />
                            <span className="ml-2 text-sm font-semibold text-white">
                                Sistema
                            </span>
                        </div>
                    )}

                    {/* Botón de toggle - visible siempre */}
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                {/* Información del Usuario */}
                {user && isOpen && (
                    <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                    {user.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.username}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    Usuario
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menú de Navegación */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {menuItems.filter(item => item.show).map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                                // Solo cerrar en móviles, en desktop mantener abierto
                                if (window.innerWidth < 1024) {
                                    closeSidebar();
                                }
                            }}
                            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            title={!isOpen ? item.name : undefined}
                        >
                            <span className="flex-shrink-0">
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="ml-3 truncate">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer del Sidebar */}
                {isOpen && (
                    <div className="px-4 py-3 border-t border-gray-700">
                        <div className="text-xs text-gray-400 text-center">
                            Sistema de Expertos v1.0
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
