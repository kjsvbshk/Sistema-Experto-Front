import { api, tokenManager, ApiErrorHandler } from "./api";
import type { ApiResponse } from "./api";
import { StatusEnum } from "../types/general";
import { usersService, type Role } from "./users.service";
import { permissionsService } from "./permissions.service";

// Tipos para autenticación
export type UserType = 'experto' | 'administrador' | 'cliente';

export interface User {
    id: number;
    username: string;
    email: string;
    status: StatusEnum;
    created_at: string;
    updated_at: string;
    userType?: UserType;
    type?: UserType; // Alias para compatibilidad
    roles?: Role[];
    permissions?: string[];
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

export interface RefreshRequest {
    refreshToken?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

class AuthService {
    private static instance: AuthService;
    private authState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
    };
    private listeners: ((state: AuthState) => void)[] = [];

    private constructor() {
        this.initializeAuth();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Inicializar estado de autenticación
    private async initializeAuth() {
        console.log("🔐 AuthService: Initializing auth...");
        const token = tokenManager.getAccessToken();
        console.log("🔐 AuthService: Token found:", !!token);

        if (token) {
            // Obtener información del usuario desde el token JWT
            const user = this.getCurrentUserFromToken();
            console.log("🔐 AuthService: User from token:", !!user);

            if (user) {
                // Restaurar roles y permisos del usuario
                await this.restoreUserRolesAndPermissions(user);
            }

            this.setState({
                user,
                isAuthenticated: !!user,
                isLoading: false,
            });
        } else {
            console.log("🔐 AuthService: No token, setting unauthenticated");
            this.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }

    // Restaurar roles y permisos del usuario
    private async restoreUserRolesAndPermissions(user: User): Promise<void> {
        try {
            console.log(
                "🔐 AuthService: Restoring roles and permissions for user:",
                user.id
            );

            // Obtener roles del usuario
            const roles = await usersService.getRolesByUserId(user.id);

            if (roles.data && roles.data.length > 0) {
                user.roles = roles.data;
                console.log("🔐 AuthService: Roles restored:", roles.data);
            } else {
                console.log("🔐 AuthService: No roles found for user");
                user.roles = [];
            }

            // Obtener permisos del usuario
            const permissions = await permissionsService.getPermissionsByUserId(
                user.id
            );
            user.permissions = permissions?.data || [];

            console.log(
                "🔐 AuthService: Permissions restored:",
                user.permissions
            );
        } catch (error) {
            console.error(
                "🔐 AuthService: Error restoring roles and permissions:",
                error
            );
            // En caso de error, establecer arrays vacíos para evitar undefined
            user.roles = user.roles || [];
            user.permissions = user.permissions || [];
        }
    }

    // Obtener estado actual
    public getState(): AuthState {
        return { ...this.authState };
    }

    // Suscribirse a cambios de estado
    public subscribe(listener: (state: AuthState) => void) {
        this.listeners.push(listener);
        // Enviar el estado actual inmediatamente
        listener(this.authState);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    // Notificar cambios de estado
    private notifyListeners() {
        this.listeners.forEach((listener) => listener(this.authState));
    }

    // Actualizar estado
    private setState(updates: Partial<AuthState>) {
        this.authState = { ...this.authState, ...updates };
        this.notifyListeners();
    }

    private setLoading(loading: boolean) {
        this.setState({ isLoading: loading });
    }

    // Register
    public async register(
        userData: RegisterRequest
    ): Promise<ApiResponse<LoginResponse>> {
        try {
            this.setLoading(true);

            const response = await api.post<LoginResponse>(
                "/auth/register",
                userData
            );

            return response;
        } catch (error) {
            console.log("🔐 AuthService: Register failed", {
                error,
            });
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Login
    public async login(
        credentials: LoginRequest
    ): Promise<ApiResponse<LoginResponse>> {
        try {
            console.log("🔐 AuthService: Starting login process", {
                username: credentials.username,
            });
            this.setLoading(true);

            const response = await api.post<LoginResponse>(
                "/auth/login",
                credentials
            );

            console.log("🔐 AuthService: Login successful", {
                user: response.data.user,
            });

            // Guardar tokens
            tokenManager.setAccessToken(response.data.accessToken);
            tokenManager.setRefreshToken(response.data.refreshToken);

            const user = response.data.user;
            
            // Asegurar que userType esté presente
            if (user && !user.userType && !user.type) {
                // Intentar obtener del token si no está en la respuesta
                const tokenUser = this.getCurrentUserFromToken();
                if (tokenUser?.userType) {
                    user.userType = tokenUser.userType;
                    user.type = tokenUser.userType;
                }
            }

            // Obtener roles y permisos
            await this.restoreUserRolesAndPermissions(user);

            // Actualizar estado
            this.setState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });

            return response;
        } catch (error) {
            console.log("🔐 AuthService: Login failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            this.setLoading(false);
            throw error;
        }
    }

    // Logout
    public async logout(): Promise<void> {
        try {
            // Intentar hacer logout en el servidor
            await api.post("/auth/logout");
        } catch (error) {
            // Ignorar errores del servidor, limpiar tokens localmente
            console.warn("Error during logout:", error);
        } finally {
            // Limpiar tokens y estado
            tokenManager.clearTokens();
            this.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }

    // Obtener usuario actual (desde el token JWT)
    public getCurrentUserFromToken(): User | null {
        const token = tokenManager.getAccessToken();
        if (!token) return null;

        try {
            // Decodificar el token JWT para obtener información del usuario
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userType: UserType = payload.userType || 'cliente'; // Default a cliente si no está presente
            const user: User = {
                id: payload.sub,
                username: payload.username,
                email: payload.email,
                status: StatusEnum.ACTIVE, // Asumimos activo si el token es válido
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                userType: userType,
                type: userType, // Alias para compatibilidad
            };

            return user;
        } catch (error) {
            // Token inválido, limpiar tokens localmente
            tokenManager.clearTokens();
            console.log(
                "🔐 AuthService: Error getting current user from token",
                {
                    error,
                }
            );
            return null;
        }
    }

    // Refrescar token
    public async refreshToken(): Promise<ApiResponse<LoginResponse>> {
        try {
            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
                throw new ApiErrorHandler("No refresh token available", 401);
            }

            const response = await api.post<LoginResponse>("/auth/refresh", {
                refreshToken,
            });

            // Actualizar tokens
            tokenManager.setAccessToken(response.data.accessToken);
            tokenManager.setRefreshToken(response.data.refreshToken);

            const user = response.data.user;
            
            // Asegurar que userType esté presente
            if (user && !user.userType && !user.type) {
                // Intentar obtener del token si no está en la respuesta
                const tokenUser = this.getCurrentUserFromToken();
                if (tokenUser?.userType) {
                    user.userType = tokenUser.userType;
                    user.type = tokenUser.userType;
                }
            }

            // Restaurar roles y permisos
            await this.restoreUserRolesAndPermissions(user);

            // Actualizar estado
            this.setState({
                user: response.data.user,
                isAuthenticated: true,
            });

            return response;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    // Verificar si está autenticado
    public isAuthenticated(): boolean {
        return (
            this.authState.isAuthenticated && !!tokenManager.getAccessToken()
        );
    }

    // Obtener estado actual
    public getAuthState(): AuthState {
        return { ...this.authState };
    }

    // Obtener usuario actual
    public getCurrentUserSync(): User | null {
        return this.authState.user;
    }

    // Verificar si está cargando
    public isLoading(): boolean {
        return this.authState.isLoading;
    }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();
