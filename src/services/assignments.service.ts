import { api } from './api';
import type { ApiResponse } from './api';

// Tipos para asignaciones
export interface AssignPermissionToRoleRequest {
  roleId: number;
  permissionId: number;
}

export interface RevokePermissionFromRoleRequest {
  roleId: number;
  permissionId: number;
}

export interface AssignRoleToUserRequest {
  userId: number;
  roleId: number;
}

export interface RevokeRoleFromUserRequest {
  userId: number;
  roleId: number;
}

export interface CheckPermissionRequest {
  userId: number;
  permissionName: string;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
}

class AssignmentsService {
  // Asignar permiso a rol
  async assignPermissionToRole(data: AssignPermissionToRoleRequest): Promise<ApiResponse<void>> {
    return await api.post<void>('/assignments/permission-to-role', data);
  }

  // Revocar permiso de rol
  async revokePermissionFromRole(data: RevokePermissionFromRoleRequest): Promise<ApiResponse<void>> {
    return await api.post<void>('/assignments/permission-from-role', data);
  }

  // Asignar rol a usuario
  async assignRoleToUser(data: AssignRoleToUserRequest): Promise<ApiResponse<void>> {
    return await api.post<void>('/assignments/role-to-user', data);
  }

  // Revocar rol de usuario
  async revokeRoleFromUser(data: RevokeRoleFromUserRequest): Promise<ApiResponse<void>> {
    return await api.post<void>('/assignments/role-from-user', data);
  }

  // Obtener roles de un usuario
  async getUserRoles(userId: number): Promise<ApiResponse<any[]>> {
    return await api.get<any[]>(`/assignments/user/${userId}/roles`);
  }

  // Obtener permisos de un rol
  async getRolePermissions(roleId: number): Promise<ApiResponse<any[]>> {
    return await api.get<any[]>(`/assignments/role/${roleId}/permissions`);
  }

  // Verificar si un usuario tiene un permiso específico
  async checkPermission(data: CheckPermissionRequest): Promise<ApiResponse<CheckPermissionResponse>> {
    return await api.post<CheckPermissionResponse>('/assignments/check-permission', data);
  }
}

export const assignmentsService = new AssignmentsService();
