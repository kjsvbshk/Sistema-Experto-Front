import { useState, useEffect } from 'react';
import { hasPermission } from '../../../utils/hasPermission';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthorization } from '../../../hooks/useAuthorization';

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

interface UserEditModalProps {
  user: User;
  roles: Role[];
  permissions: Permission[];
  onClose: () => void;
}

export default function UserEditModal({ user, roles, permissions, onClose }: UserEditModalProps) {
  const { user: userAuth } = useAuth();
  const { isAdmin } = useAuthorization();

  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    status: user.status,
    role_id: user.role_id,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Simular permisos asignados al usuario (en una implementación real vendría del backend)
  useEffect(() => {
    // Mock: asignar algunos permisos basados en el rol
    const mockUserPermissions = user.role_id === 1 ? [1, 2, 3, 4, 5, 6, 7, 8] : [2, 7]; // Admin tiene todos, otros solo algunos
    setSelectedPermissions(mockUserPermissions);
  }, [user.role_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviarían los datos al backend
    console.log('Datos del usuario actualizados:', formData);
    console.log('Permisos seleccionados:', selectedPermissions);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-200 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Editar Usuario: {user.username}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Información Básica */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-white mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-300 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="desactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label htmlFor="role_id" className="block text-xs font-medium text-gray-300 mb-1">
                  Rol
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-white mb-3">Permisos del Usuario</h3>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor={`permission-${permission.id}`} className="ml-2.5 text-xs text-gray-300">
                      <div className="font-medium">{permission.name}</div>
                      {permission.description && (
                        <div className="text-gray-400 text-xs">{permission.description}</div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-white mb-3">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  ID de Usuario
                </label>
                <div className="px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                  {user.id}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Fecha de Creación
                </label>
                <div className="px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                  {new Date(user.created_at).toLocaleString('es-ES')}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Última Actualización
                </label>
                <div className="px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                  {new Date(user.updated_at).toLocaleString('es-ES')}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Permisos Seleccionados
                </label>
                <div className="px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                  {selectedPermissions.length} de {permissions.length}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            {hasPermission('user:update', userAuth?.permissions, isAdmin) && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Guardar Cambios
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
