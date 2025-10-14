import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import PrivateRoutes from './routes/privateRoutes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/*"
                element={<PrivateRoutes />}
              />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
