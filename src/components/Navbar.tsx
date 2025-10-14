import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSidebar } from '../contexts/SidebarContext';

export default function Navbar() {
    const { logout, user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const { openSidebar } = useSidebar();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            showSuccess('¡Sesión cerrada exitosamente!');
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            showError('Error al cerrar sesión. Intenta nuevamente.');
        }
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-12">
                    <div className="flex items-center space-x-3">
                        {/* Botón para abrir sidebar - solo en móviles */}
                        <button
                            onClick={openSidebar}
                            className="text-gray-400 hover:text-white transition-colors lg:hidden"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center">
                            <img
                                alt="Sistema de Expertos"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="h-6 w-auto"
                            />
                            <span className="ml-2 text-lg font-semibold text-white">
                                Sistema de Expertos
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Información del Usuario */}
                        {user && (
                            <div className="flex items-center space-x-3 bg-gray-700 rounded-lg px-3 py-1.5">
                                {/* Avatar del Usuario */}
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Información del Usuario */}
                                <div className="flex items-center space-x-2">
                                    {/* Username */}
                                    <div className="flex items-center space-x-1">
                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-xs font-medium text-white">
                                            {user.username}
                                        </span>
                                    </div>

                                    {/* Separador */}
                                    <div className="h-3 w-px bg-gray-500"></div>

                                    {/* Rol */}
                                    <div className="flex items-center space-x-1">
                                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="text-xs text-gray-300">
                                            {'Usuario'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1.5 rounded-md text-xs font-medium"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
