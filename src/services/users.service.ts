import type { StatusEnum } from "../types/general";
import { api, type ApiResponse } from "./api";

export interface User {
    id: number;
    username: string;
    email: string;
    status: StatusEnum;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface UserWithRole {
    id: number;
    user_id: number;
    role_id: number;
    status: StatusEnum;
    created_at: string;
    updated_at: string;
    user: User;
    role: Role;
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    status: StatusEnum;
    created_at: string;
    updated_at: string;
}

export interface CreateUserAdminRequest {
    username: string;
    email: string;
    password: string;
    role_id: number;
}

export interface UpdateUserRequest {
    id: number;
    username?: string;
    email?: string;
    status?: StatusEnum;
}

export const usersService = {
    // Obtener todos los usuarios (solo usuarios activos) - Solo Administradores
    async getAllUsers(): Promise<ApiResponse<User[]>> {
        return await api.get<User[]>("/users/all");
    },

    // Obtener solo clientes - Expertos y Administradores
    async getClientes(): Promise<ApiResponse<User[]>> {
        return await api.get<User[]>("/users/clientes");
    },

    // Obtener usuarios con sus roles
    async getUsersWithRoles(): Promise<ApiResponse<UserWithRole[]>> {
        return await api.get<UserWithRole[]>("/users/get-all-with-roles");
    },

    async getRolesByUserId(userId: number): Promise<ApiResponse<Role[]>> {
        const response = await api.get<UserWithRole[]>(
            `/assignments/user/${userId}/roles`
        );

        // Extraer solo los roles de la respuesta
        const roles = response.data?.map((item) => item.role) || [];

        return {
            ...response,
            data: roles,
        };
    },

    // Obtener usuario por ID
    async getUserById(id: number): Promise<ApiResponse<User>> {
        return await api.get<User>(`/users/get-by-id/${id}`);
    },

    // Obtener usuario por username
    async getUserByUsername(username: string): Promise<ApiResponse<User>> {
        return await api.get<User>(`/users/get-by-username/${username}`);
    },

    // Crear usuario (solo administradores)
    async createUserByAdmin(
        data: CreateUserAdminRequest
    ): Promise<ApiResponse<User>> {
        return await api.post<User>("/users/create-by-admin", data);
    },

    // Actualizar usuario
    async updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
        return await api.put<User>("/users/update", data);
    },

    // Eliminar usuario (soft delete)
    async deleteUser(id: number): Promise<ApiResponse<void>> {
        return await api.delete<void>(`/users/delete/${id}`);
    },
};
