/* eslint-disable @typescript-eslint/no-explicit-any */
// Configuración base de la API
const API_BASE_URL = "http://localhost:3000/api/v1";

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
    message: string;
    data: T;
    status: number;
}

export interface ApiError {
    message: string;
    status: number;
    error?: string;
}

// Clase para manejar errores de la API
export class ApiErrorHandler extends Error {
    public status: number;
    public error?: string;

    constructor(message: string, status: number, error?: string) {
        super(message);
        this.name = "ApiErrorHandler";
        this.status = status;
        this.error = error;
    }
}

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Función para refrescar el token
async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            const data = await response.json();
            const newAccessToken = data.data?.accessToken || data.accessToken;
            
            if (newAccessToken) {
                tokenManager.setAccessToken(newAccessToken);
                if (data.data?.refreshToken || data.refreshToken) {
                    tokenManager.setRefreshToken(data.data?.refreshToken || data.refreshToken);
                }
                return newAccessToken;
            }

            throw new Error("No access token in refresh response");
        } catch (error) {
            // Si falla el refresh, limpiar tokens y redirigir al login
            tokenManager.clearTokens();
            window.location.href = "/login";
            throw error;
        } finally {
            refreshPromise = null;
            isRefreshing = false;
        }
    })();

    return refreshPromise;
}

// Función para hacer peticiones HTTP
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Obtener token del localStorage
    let token = localStorage.getItem("accessToken");

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Agregar token de autorización si existe
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: "include", // Para cookies
    };

    // Log de la petición
    console.log(`🚀 API Request: ${options.method || "GET"} ${url}`, {
        body: options.body ? JSON.parse(options.body as string) : undefined,
        hasToken: !!token,
    });

    try {
        const response = await fetch(url, config);

        // Si la respuesta es 401 y no es un endpoint de auth, intentar refrescar el token
        if (response.status === 401 && !endpoint.includes("/auth/") && retryCount === 0) {
            console.log("🔄 Token expirado, intentando refrescar...");
            
            try {
                const newToken = await refreshAccessToken();
                // Reintentar la petición con el nuevo token
                return apiRequest<T>(endpoint, options, retryCount + 1);
            } catch (refreshError) {
                console.error("❌ Error al refrescar token:", refreshError);
                // Si falla el refresh, lanzar el error original
                const errorData = await response.json().catch(() => ({}));
                throw new ApiErrorHandler(
                    errorData.message || "Token expirado y no se pudo refrescar",
                    response.status,
                    errorData.error
                );
            }
        }

        // Si la respuesta no es exitosa, lanzar error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Log del error
            console.log(`❌ API Error: ${response.status} ${url}`, {
                error: errorData.message || `HTTP Error: ${response.status}`,
                status: response.status,
            });

            throw new ApiErrorHandler(
                errorData.message || `HTTP Error: ${response.status}`,
                response.status,
                errorData.error
            );
        }

        const data = await response.json();

        // Log de la respuesta exitosa
        console.log(`✅ API Response: ${response.status} ${url}`, {
            success: true,
            data: data,
        });

        return data;
    } catch (error) {
        if (error instanceof ApiErrorHandler) {
            throw error;
        }

        // Error de red u otro error
        throw new ApiErrorHandler(
            "Error de conexión con el servidor",
            0,
            error instanceof Error ? error.message : "Unknown error"
        );
    }
}

// Funciones helper para diferentes métodos HTTP
export const api = {
    get: <T = any>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: "GET" }),

    post: <T = any>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T = any>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T = any>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: "DELETE" }),
};

// Función para manejar tokens
export const tokenManager = {
    setAccessToken: (token: string) => {
        localStorage.setItem("accessToken", token);
    },

    getAccessToken: () => {
        return localStorage.getItem("accessToken");
    },

    removeAccessToken: () => {
        localStorage.removeItem("accessToken");
    },

    setRefreshToken: (token: string) => {
        localStorage.setItem("refreshToken", token);
    },

    getRefreshToken: () => {
        return localStorage.getItem("refreshToken");
    },

    removeRefreshToken: () => {
        localStorage.removeItem("refreshToken");
    },

    clearTokens: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },
};
