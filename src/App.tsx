import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import MainPage from './components/MainPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/main"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Layout>
                      <MainPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Layout>
                      <AdminPage />
                    </Layout>
                  </AdminRoute>
                }
              />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
