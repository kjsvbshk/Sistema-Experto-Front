import { api, tokenManager, ApiErrorHandler } from './api';
import type { ApiResponse } from './api';

// Tipos para autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'desactive';
  created_at: string;
  updated_at: string;
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
  private initializeAuth() {
    const token = tokenManager.getAccessToken();
    if (token) {
      // Obtener información del usuario desde el token JWT
      const user = this.getCurrentUserFromToken();
      this.setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } else {
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  // Suscribirse a cambios de estado
  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar cambios de estado
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
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
  public async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      this.setLoading(true);
      
      const response = await api.post<LoginResponse>('/auth/register', userData);
      
      // Guardar tokens
      tokenManager.setAccessToken(response.data.accessToken);
      tokenManager.setRefreshToken(response.data.refreshToken);
      
      // Actualizar estado
      this.setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  // Login
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 AuthService: Starting login process', { username: credentials.username });
      this.setLoading(true);
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      console.log('🔐 AuthService: Login successful', { user: response.data.user });
      
      // Guardar tokens
      tokenManager.setAccessToken(response.data.accessToken);
      tokenManager.setRefreshToken(response.data.refreshToken);
      
      // Actualizar estado
      this.setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      console.log('🔐 AuthService: Login failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      this.setLoading(false);
      throw error;
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      // Intentar hacer logout en el servidor
      await api.post('/auth/logout');
    } catch (error) {
      // Ignorar errores del servidor, limpiar tokens localmente
      console.warn('Error during logout:', error);
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        status: 'active', // Asumimos activo si el token es válido
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return user;
    } catch (error) {
      // Token inválido, limpiar tokens localmente
      tokenManager.clearTokens();
      return null;
    }
  }

  // Refrescar token
  public async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new ApiErrorHandler('No refresh token available', 401);
      }

      const response = await api.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });

      // Actualizar tokens
      tokenManager.setAccessToken(response.data.accessToken);
      tokenManager.setRefreshToken(response.data.refreshToken);

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
    return this.authState.isAuthenticated && !!tokenManager.getAccessToken();
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
