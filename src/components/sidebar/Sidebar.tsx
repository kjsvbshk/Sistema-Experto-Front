import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Menu, X } from 'lucide-react';
import { menuItems } from './menuItems';
import { hasPermission } from '../../utils/hasPermission';
import { useState, useEffect } from 'react';
import { useAuthorization } from '../../hooks/useAuthorization';

export default function Sidebar() {
    const { isOpen, closeSidebar, toggleSidebar, openSidebar } = useSidebar();
    const { user } = useAuth();
    const { isAdmin } = useAuthorization();

    const [isManualToggle, setIsManualToggle] = useState(false);

    const filteredMenuItems = menuItems.filter((menu) => {
        if (menu.permission && menu.permission.length > 0) {
            return hasPermission(menu.permission, user?.permissions, isAdmin);
        }

        return true;
    });

    const handleMouseEnter = () => {
        // Solo expandir en desktop (lg y superior) y si está colapsado
        if (window.innerWidth >= 1024 && !isOpen && !isManualToggle) {
            openSidebar();
        }
    };

    const handleMouseLeave = () => {
        // Solo colapsar en desktop (lg y superior) y si está expandido por hover
        if (window.innerWidth >= 1024 && isOpen && !isManualToggle) {
            closeSidebar();
        }
    };

    const handleManualToggle = () => {
        setIsManualToggle(!isManualToggle);
        toggleSidebar();
    };

    // Reset manual toggle cuando se cambia el tamaño de ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsManualToggle(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



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
            <div
                className={`
        fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-50 transition-all duration-500 ease-out
        ${isOpen ? 'w-64' : 'w-16'}
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Header del Sidebar */}
                <div className="flex items-center justify-between h-12 px-4 border-b border-gray-700">
                    {isOpen && (
                        <div className="flex items-center transition-all duration-500 ease-out opacity-100">
                            <img
                                alt="Sistema de Expertos"
                                src="/logo.svg"
                                className="h-5 w-auto transition-all duration-500 ease-out"
                            />
                            <span className="ml-2 text-sm font-semibold text-white transition-all duration-500 ease-out">
                                Sistema
                            </span>
                        </div>
                    )}

                    {/* Botón de toggle - visible siempre */}
                    <button
                        onClick={handleManualToggle}
                        className="text-gray-400 hover:text-white transition-all duration-300 ease-out"
                    >
                        {isOpen ? <X className="h-4 w-4 transition-all duration-300 ease-out" /> : <Menu className="h-4 w-4 transition-all duration-300 ease-out" />}
                    </button>
                </div>

                {/* Información del Usuario */}
                {user && isOpen && (
                    <div className="px-4 py-3 border-b border-gray-700 transition-all duration-500 ease-out opacity-100">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center transition-all duration-500 ease-out">
                                <span className="text-sm font-medium text-white transition-all duration-500 ease-out">
                                    {user.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 transition-all duration-500 ease-out">
                                <p className="text-sm font-medium text-white truncate transition-all duration-500 ease-out">
                                    {user.username}
                                </p>
                                <p className="text-xs text-gray-400 truncate transition-all duration-500 ease-out">
                                    Usuario
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menú de Navegación */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {filteredMenuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                                // Solo cerrar en móviles, en desktop mantener abierto
                                if (window.innerWidth < 1024) {
                                    closeSidebar();
                                }
                            }}
                            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 ease-out"
                            title={!isOpen ? item.name : undefined}
                        >
                            <span className="flex-shrink-0">
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="ml-3 truncate transition-all duration-500 ease-out opacity-100">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer del Sidebar */}
                {isOpen && (
                    <div className="px-4 py-3 border-t border-gray-700 transition-all duration-500 ease-out opacity-100">
                        <div className="text-xs text-gray-400 text-center transition-all duration-500 ease-out">
                            Sistema Experto v1.0
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
