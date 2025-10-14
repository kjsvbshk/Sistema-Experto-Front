
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import MainPage from '../pages/MainPage';
import AdminPage from '../pages/AdminPage';
import AgentPage from '../pages/AgentPage';
import RulesAgentPage from '../pages/RulesAgentPage';

export default function PrivateRoutes() {
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

  // Rutas internas para administradores
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/rules-agent" element={<RulesAgentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
