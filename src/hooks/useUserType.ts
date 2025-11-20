import { useAuth } from '../contexts/AuthContext';
import type { UserType } from '../services/auth.service';

export const useUserType = () => {
  const { user } = useAuth();
  
  const userType: UserType | null = user?.userType || user?.type || null;
  
  const isExperto = userType === 'experto';
  const isAdministrador = userType === 'administrador';
  const isCliente = userType === 'cliente';
  
  return {
    userType,
    isExperto,
    isAdministrador,
    isCliente,
  };
};

