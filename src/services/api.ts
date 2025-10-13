// Configuración base de la API
const API_BASE_URL = 'http://localhost:3000/api/v1';

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
    this.name = 'ApiErrorHandler';
    this.status = status;
    this.error = error;
  }
}

// Función para hacer peticiones HTTP
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obtener token del localStorage
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
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
    credentials: 'include', // Para cookies
  };

  // Log de la petición
  console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`, {
    body: options.body ? JSON.parse(options.body as string) : undefined,
    hasToken: !!token
  });

  try {
    const response = await fetch(url, config);
    
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Log del error
      console.log(`❌ API Error: ${response.status} ${url}`, {
        error: errorData.message || `HTTP Error: ${response.status}`,
        status: response.status
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
      data: data
    });
    
    return data;
  } catch (error) {
    if (error instanceof ApiErrorHandler) {
      throw error;
    }
    
    // Error de red u otro error
    throw new ApiErrorHandler(
      'Error de conexión con el servidor',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Funciones helper para diferentes métodos HTTP
export const api = {
  get: <T = any>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'GET' }),
  
  post: <T = any>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Función para manejar tokens
export const tokenManager = {
  setAccessToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },
  
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
  
  removeAccessToken: () => {
    localStorage.removeItem('accessToken');
  },
  
  setRefreshToken: (token: string) => {
    localStorage.setItem('refreshToken', token);
  },
  
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },
  
  removeRefreshToken: () => {
    localStorage.removeItem('refreshToken');
  },
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
