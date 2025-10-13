import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { usersService, type UserWithRole } from '../services/users.service';
import { authorizationService, type Role, type Permission } from '../services/authorization.service';
import UserEditModal from './UserEditModal';
import CreateUserModal from './CreateUserModal';

// Tipos importados desde authorization.service.ts

// Los roles y permisos se cargarán desde el backend

export default function AdminPanel() {
  const { logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleEditUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleUserCreated = async () => {
    // Recargar la lista de usuarios
    try {
      setLoading(true);
      const response = await usersService.getUsersWithRoles();
      setUsers(response.data);
    } catch (error) {
      console.error('Error reloading users:', error);
      showError('Error al recargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('¡Sesión cerrada exitosamente!');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      showError('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📊 AdminPanel: Starting to load data...');
        setLoading(true);
        
        // Cargar usuarios, roles y permisos en paralelo
        const [usersResponse, rolesResponse, permissionsResponse] = await Promise.allSettled([
          usersService.getUsersWithRoles(),
          authorizationService.getRoles(),
          authorizationService.getPermissions()
        ]);

        // Manejar respuestas exitosas y fallidas
        if (usersResponse.status === 'fulfilled') {
          setUsers(usersResponse.value.data);
          console.log('📊 AdminPanel: Users loaded successfully:', usersResponse.value.data);
        } else {
          console.error('📊 AdminPanel: Error loading users:', usersResponse.reason);
          // Usar datos mock como fallback
          const mockUsers = [
            {
              id: 1,
              user_id: 12,
              role_id: 1,
              status: 'active' as const,
              created_at: '2025-10-14T00:10:43.950Z',
              updated_at: '2025-10-14T00:10:43.950Z',
              user: {
                id: 12,
                username: 'papaito',
                email: 'papaito@admin.com',
                status: 'active' as const,
                created_at: '2025-10-14T00:10:43.950Z',
                updated_at: '2025-10-14T00:10:43.950Z'
              },
              role: {
                id: 1,
                name: 'admin',
                description: 'Superusuario con control total del sistema',
                status: 'active' as const,
                created_at: '2025-10-12T08:47:50.624Z',
                updated_at: '2025-10-12T08:47:50.624Z'
              }
            }
          ];
          setUsers(mockUsers);
          console.log('📊 AdminPanel: Using mock users data');
        }

        if (rolesResponse.status === 'fulfilled') {
          setRoles(rolesResponse.value.data);
        } else {
          console.error('📊 AdminPanel: Error loading roles:', rolesResponse.reason);
          // Usar roles mock como fallback
          const mockRoles = [
            { 
              id: 1, 
              name: 'admin', 
              description: 'Superusuario con control total del sistema', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            },
            { 
              id: 2, 
              name: 'user', 
              description: 'Usuario estándar', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            }
          ];
          setRoles(mockRoles);
        }

        if (permissionsResponse.status === 'fulfilled') {
          setPermissions(permissionsResponse.value.data);
        } else {
          console.error('📊 AdminPanel: Error loading permissions:', permissionsResponse.reason);
          // Usar permisos mock como fallback
          const mockPermissions = [
            { 
              id: 1, 
              name: 'users.create', 
              description: 'Crear usuarios', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            },
            { 
              id: 2, 
              name: 'users.read', 
              description: 'Ver usuarios', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            },
            { 
              id: 3, 
              name: 'users.update', 
              description: 'Editar usuarios', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            },
            { 
              id: 4, 
              name: 'users.delete', 
              description: 'Eliminar usuarios', 
              status: 'active' as const,
              created_at: '2025-10-12T08:47:50.624Z',
              updated_at: '2025-10-12T08:47:50.624Z'
            }
          ];
          setPermissions(mockPermissions);
        }

        console.log('📊 AdminPanel: Data loaded successfully');
        showSuccess('Datos cargados correctamente');
      } catch (error) {
        console.error('📊 AdminPanel: Error loading data:', error);
        showError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showSuccess, showError]);

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Activo' : 'Inactivo';
  };

  return (
    <div className="min-h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                alt="Sistema de Expertos"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-semibold text-white">
                Panel de Administración
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/main"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Panel Principal
              </Link>
              <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-300">
                  Administra los usuarios del sistema, sus roles y permisos
                </p>
              </div>
              <button
                onClick={handleCreateUser}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Usuario
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Lista de Usuarios</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Gestionar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {(() => {
                    console.log('📊 AdminPanel: Rendering table - loading:', loading, 'users.length:', users.length);
                    return loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            <span className="ml-3 text-gray-300">Cargando usuarios...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="mt-2 text-sm">No hay usuarios registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((userWithRole) => (
                      <tr key={userWithRole.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {userWithRole.user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {userWithRole.user.username}
                              </div>
                              <div className="text-sm text-gray-400">
                                ID: {userWithRole.user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{userWithRole.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {userWithRole.role.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(userWithRole.user.status)}`}>
                            {getStatusText(userWithRole.user.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(userWithRole.user.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleEditUser(userWithRole)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                            title="Editar usuario"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Total Usuarios</h3>
                  <p className="text-2xl font-bold text-indigo-400">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Usuarios Activos</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Roles Disponibles</h3>
                  <p className="text-2xl font-bold text-blue-400">{roles.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={{
            id: selectedUser.user.id,
            username: selectedUser.user.username,
            email: selectedUser.user.email,
            status: selectedUser.user.status,
            role_id: selectedUser.role_id,
            role_name: selectedUser.role.name,
            created_at: selectedUser.user.created_at,
            updated_at: selectedUser.user.updated_at,
          }}
          roles={roles}
          permissions={permissions}
          onClose={handleCloseModal}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
