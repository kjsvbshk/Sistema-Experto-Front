import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading, isAuthenticated } = useAuthorization();
  const location = useLocation();

  console.log('🔐 AdminRoute:', { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    path: location.pathname 
  });

  // Mostrar loading mientras se verifica el rol
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-300">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no es admin, redirigir al main
  if (!isAdmin) {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
}
