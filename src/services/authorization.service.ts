import { api, type ApiResponse } from './api';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    status: 'active' | 'desactive';
    created_at: string;
    updated_at: string;
  };
  role: Role;
}

export interface CheckPermissionRequest {
  user_id: number;
  permission_name: string;
}

export const authorizationService = {
  // Obtener todos los roles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return await api.get<Role[]>('/roles');
  },

  // Obtener todos los permisos
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return await api.get<Permission[]>('/permissions');
  },

  // Obtener roles de un usuario
  async getUserRoles(userId: number): Promise<ApiResponse<UserRole[]>> {
    return await api.get<UserRole[]>(`/assignments/user/${userId}/roles`);
  },

  // Verificar si un usuario tiene un permiso específico
  async checkPermission(data: CheckPermissionRequest): Promise<ApiResponse<{ hasPermission: boolean }>> {
    return await api.post<{ hasPermission: boolean }>('/assignments/check-permission', data);
  },

  // Verificar si un usuario tiene un rol específico
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    try {
      console.log('🔐 authorizationService.hasRole: Checking role', roleName, 'for user', userId);
      const response = await this.getUserRoles(userId);
      console.log('🔐 authorizationService.hasRole: User roles response:', response.data);
      
      const hasRole = response.data.some(userRole => 
        userRole.role.name === roleName && 
        userRole.status === 'active' &&
        userRole.user.status === 'active'
      );
      
      console.log('🔐 authorizationService.hasRole: Has role result:', hasRole);
      return hasRole;
    } catch (error) {
      console.error('🔐 authorizationService.hasRole: Error checking user role:', error);
      return false;
    }
  },

  // Verificar si un usuario es administrador
  async isAdmin(userId: number): Promise<boolean> {
    return await this.hasRole(userId, 'admin');
  },
};
