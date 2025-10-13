import { api } from './api';
import type { ApiResponse } from './api';

// Tipos para roles
export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  id: number;
  name?: string;
  description?: string;
}

class RolesService {
  // Crear rol
  async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<Role>> {
    return await api.post<Role>('/roles', roleData);
  }

  // Obtener todos los roles
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return await api.get<Role[]>('/roles');
  }

  // Actualizar rol
  async updateRole(roleData: UpdateRoleRequest): Promise<ApiResponse<Role>> {
    return await api.put<Role>('/roles', roleData);
  }

  // Eliminar rol
  async deleteRole(roleId: number): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/roles/${roleId}`);
  }
}

export const rolesService = new RolesService();
