import { api, ApiResponse } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserWithRole {
  id: number;
  user_id: number;
  role_id: number;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
  user: User;
  role: {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'desactive';
    created_at: string;
    updated_at: string;
  };
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
  status?: 'active' | 'desactive';
}

export const usersService = {
  // Obtener todos los usuarios (solo usuarios activos)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return await api.get<User[]>('/users/all');
  },

  // Obtener usuarios con sus roles
  async getUsersWithRoles(): Promise<ApiResponse<UserWithRole[]>> {
    return await api.get<UserWithRole[]>('/users/get-all-with-roles');
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
  async createUserByAdmin(data: CreateUserAdminRequest): Promise<ApiResponse<User>> {
    return await api.post<User>('/users/create-by-admin', data);
  },

  // Actualizar usuario
  async updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return await api.put<User>('/users/update', data);
  },

  // Eliminar usuario (soft delete)
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/users/delete/${id}`);
  },
};
