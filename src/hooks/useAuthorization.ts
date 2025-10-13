import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authorizationService } from '../services/authorization.service';
import { usersService } from '../services/users.service';

export const useAuthorization = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('🔐 useAuthorization: Checking admin role for user:', user);
      
      if (!isAuthenticated || !user) {
        console.log('🔐 useAuthorization: User not authenticated or no user data');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔐 useAuthorization: Getting users with roles to find current user');
        const response = await usersService.getUsersWithRoles();
        console.log('🔐 useAuthorization: Users with roles response:', response.data);
        
        // Buscar el usuario actual en la lista
        const currentUserWithRole = response.data.find(userRole => userRole.user.id === user.id);
        console.log('🔐 useAuthorization: Current user with role:', currentUserWithRole);
        
        if (currentUserWithRole) {
          const isAdminUser = currentUserWithRole.role.name === 'admin' && 
                             currentUserWithRole.status === 'active' &&
                             currentUserWithRole.user.status === 'active';
          console.log('🔐 useAuthorization: Is admin result:', isAdminUser);
          setIsAdmin(isAdminUser);
        } else {
          console.log('🔐 useAuthorization: User not found in roles list');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('🔐 useAuthorization: Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated, user]);

  return {
    isAdmin,
    isLoading,
    user,
    isAuthenticated,
  };
};
