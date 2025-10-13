import { api } from './api';
import type { ApiResponse } from './api';

// Tipos para permisos
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  id: number;
  name?: string;
  description?: string;
}

class PermissionsService {
  // Crear permiso
  async createPermission(permissionData: CreatePermissionRequest): Promise<ApiResponse<Permission>> {
    return await api.post<Permission>('/permissions', permissionData);
  }

  // Obtener todos los permisos
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return await api.get<Permission[]>('/permissions');
  }

  // Actualizar permiso
  async updatePermission(permissionData: UpdatePermissionRequest): Promise<ApiResponse<Permission>> {
    return await api.put<Permission>('/permissions', permissionData);
  }

  // Eliminar permiso
  async deletePermission(permissionId: number): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/permissions/${permissionId}`);
  }
}

export const permissionsService = new PermissionsService();
