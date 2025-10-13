import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserEditModal from './UserEditModal';

// Tipos basados en la estructura del backend
interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'desactive';
  role_id: number;
  role_name?: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'desactive';
}

// Datos mock basados en la estructura del backend
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@sistema.com',
    status: 'active',
    role_id: 1,
    role_name: 'Administrador',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'usuario1',
    email: 'usuario1@empresa.com',
    status: 'active',
    role_id: 2,
    role_name: 'Usuario',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    username: 'editor',
    email: 'editor@empresa.com',
    status: 'active',
    role_id: 3,
    role_name: 'Editor',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: 4,
    username: 'lector',
    email: 'lector@empresa.com',
    status: 'desactive',
    role_id: 4,
    role_name: 'Lector',
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  }
];

const mockRoles: Role[] = [
  { id: 1, name: 'Administrador', description: 'Acceso completo al sistema', status: 'active' },
  { id: 2, name: 'Usuario', description: 'Usuario estándar', status: 'active' },
  { id: 3, name: 'Editor', description: 'Puede editar contenido', status: 'active' },
  { id: 4, name: 'Lector', description: 'Solo lectura', status: 'active' }
];

const mockPermissions: Permission[] = [
  { id: 1, name: 'users.create', description: 'Crear usuarios', status: 'active' },
  { id: 2, name: 'users.read', description: 'Ver usuarios', status: 'active' },
  { id: 3, name: 'users.update', description: 'Editar usuarios', status: 'active' },
  { id: 4, name: 'users.delete', description: 'Eliminar usuarios', status: 'active' },
  { id: 5, name: 'roles.manage', description: 'Gestionar roles', status: 'active' },
  { id: 6, name: 'permissions.manage', description: 'Gestionar permisos', status: 'active' },
  { id: 7, name: 'reports.view', description: 'Ver reportes', status: 'active' },
  { id: 8, name: 'settings.edit', description: 'Editar configuración', status: 'active' }
];

export default function AdminPanel() {
  const [users] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

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
              <Link
                to="/login"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-300">
              Administra los usuarios del sistema, sus roles y permisos
            </p>
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.role_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                          title="Editar usuario"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <p className="text-2xl font-bold text-blue-400">{mockRoles.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          roles={mockRoles}
          permissions={mockPermissions}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
