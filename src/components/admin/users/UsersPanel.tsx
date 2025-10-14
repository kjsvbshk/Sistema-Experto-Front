import { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { usersService, type UserWithRole } from '../../../services/users.service';
import { authorizationService, type Role, type Permission } from '../../../services/authorization.service';
import UserEditModal from './UserEditModal';
import CreateUserModal from './CreateUserModal';
import { hasPermission } from '../../../utils/hasPermission';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminPanel() {

    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

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
                } else {
                    console.error('📊 AdminPanel: Error loading users:', usersResponse.reason);
                    showError('Error al cargar usuarios');
                }

                if (rolesResponse.status === 'fulfilled') {
                    setRoles(rolesResponse.value.data);
                } else {
                    console.error('📊 AdminPanel: Error loading roles:', rolesResponse.reason);
                    showError('Error al cargar roles');
                }

                if (permissionsResponse.status === 'fulfilled') {
                    setPermissions(permissionsResponse.value.data);
                } else {
                    console.error('📊 AdminPanel: Error loading permissions:', permissionsResponse.reason);
                    showError('Error al cargar permisos');
                }
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
        <div className="py-4 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-sm text-gray-300">
                                Administra los usuarios del sistema, sus roles y permisos
                            </p>
                        </div>
                        {hasPermission('user:create', user?.permissions) && (
                            <button
                                onClick={handleCreateUser}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Usuario
                            </button>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Usuarios</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Fecha de Creación
                                    </th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Gestionar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {(() => {
                                    console.log('📊 AdminPanel: Rendering table - loading:', loading, 'users.length:', users.length);
                                    return loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                                    <span className="ml-2 text-sm text-gray-300">Cargando usuarios...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center">
                                                <div className="text-gray-400">
                                                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    <p className="mt-1 text-xs">No se han encontrado usuarios</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((userWithRole) => (
                                            <tr key={userWithRole.id} className="hover:bg-gray-700">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                                                <span className="text-xs font-medium text-white">
                                                                    {userWithRole.user.username.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-xs font-medium text-white">
                                                                {userWithRole.user.username}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                ID: {userWithRole.user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-xs text-gray-300">{userWithRole.user.email}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {userWithRole.role.name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(userWithRole.user.status)}`}>
                                                        {getStatusText(userWithRole.user.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300">
                                                    {new Date(userWithRole.user.created_at).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    {hasPermission('user:update', user?.permissions) && (
                                                        <button
                                                            onClick={() => handleEditUser(userWithRole)}
                                                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                                                            title="Editar usuario"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-white">Total Usuarios</h3>
                                <p className="text-lg font-bold text-indigo-400">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-white">Usuarios Activos</h3>
                                <p className="text-lg font-bold text-green-400">
                                    {users.filter(u => u.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-white">Roles Disponibles</h3>
                                <p className="text-lg font-bold text-blue-400">{roles.length}</p>
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
