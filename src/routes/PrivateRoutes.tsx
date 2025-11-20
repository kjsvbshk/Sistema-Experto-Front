
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import MainPage from '../pages/MainPage';
import AdminPage from '../pages/AdminPage';
import AgentPage from '../pages/AgentPage';
import RulesAgentPage from '../pages/RulesAgentPage';
import ClientHistoryPage from '../pages/ClientHistoryPage';
import { useUserType } from '../hooks/useUserType';

export default function PrivateRoutes() {
  const { isLoading, isAuthenticated } = useAuthorization();
  const { isExperto, isCliente } = useUserType();
  const location = useLocation();

  // Mostrar loading mientras se verifica el rol
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-300">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rutas internas
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/my-history" element={<ClientHistoryPage />} />
        <Route 
          path="/agent" 
          element={isExperto ? <AgentPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/rules-agent" 
          element={isExperto ? <RulesAgentPage /> : <Navigate to="/" replace />} 
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
