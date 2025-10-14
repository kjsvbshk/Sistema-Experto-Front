import type { StatusEnum } from "../types/general";
import { api } from "./api";
import type { ApiResponse } from "./api";

// Tipos para permisos
export interface Permission {
    id: number;
    name: string;
    description: string;
    status: StatusEnum;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

// Tipos para roles
export interface Role {
    id: number;
    name: string;
    description: string | null;
    status: StatusEnum;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

// Tipo para roles con permisos
export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
}

export interface CreateRoleWithPermissionsRequest extends CreateRoleRequest {
    permissions: number[];
}

export interface UpdateRoleRequest {
    id: number;
    name?: string;
    description?: string;
}

export interface UpdateRoleWithPermissionsRequest extends UpdateRoleRequest {
    permissions: number[];
}

class RolesService {
    // Crear rol
    async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<Role>> {
        return await api.post<Role>("/roles", roleData);
    }

    // Create rol con permisos
    async createRoleWithPermissions(
        roleData: CreateRoleWithPermissionsRequest
    ): Promise<ApiResponse<Role>> {
        return await api.post<Role>("/roles/create-with-permissions", roleData);
    }

    async getRolesByUserId(userId: number): Promise<ApiResponse<Role[]>> {
        return await api.get<Role[]>(`/roles/user/${userId}`);
    }

    // Obtener todos los roles
    async getRoles(): Promise<ApiResponse<Role[]>> {
        return await api.get<Role[]>("/roles");
    }

    // Obtener todos los roles con sus permisos
    async getRolesWithPermissions(): Promise<
        ApiResponse<RoleWithPermissions[]>
    > {
        return await api.get<RoleWithPermissions[]>(
            "/roles/all-with-permissions"
        );
    }

    // Actualizar rol
    async updateRole(roleData: UpdateRoleRequest): Promise<ApiResponse<Role>> {
        return await api.put<Role>("/roles", roleData);
    }

    // Actualizar rol con permisos
    async updateRoleWithPermissions(
        roleData: UpdateRoleWithPermissionsRequest
    ): Promise<ApiResponse<Role>> {
        return await api.put<Role>("/roles/update-with-permissions", roleData);
    }

    // Eliminar rol
    async deleteRole(roleId: number): Promise<ApiResponse<void>> {
        return await api.delete<void>(`/roles/${roleId}`);
    }
}

export const rolesService = new RolesService();
