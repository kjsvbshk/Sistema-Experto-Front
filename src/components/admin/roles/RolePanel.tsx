import { useCallback, useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import type { RoleWithPermissions } from '../../../services/roles.service';
import { rolesService } from '../../../services/roles.service';
import RolesTable from './RolesTable';
import RolesStatsCards from './RolesStatsCards';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';
import { hasPermission } from '../../../utils/hasPermission';
import { useAuth } from '../../../contexts/AuthContext';

export default function RolePanel() {
    const { showError } = useNotification();
    const { user } = useAuth();

    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);

    const handleGetRoles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await rolesService.getRolesWithPermissions();
            setRoles(response.data);
            console.log('📊 RolePanel: Roles loaded successfully:', response.data);
        } catch (error) {
            console.error('📊 RolePanel: Error loading roles:', error);
            showError('Error al cargar los roles');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        handleGetRoles();
    }, [handleGetRoles]);

    const handleEditRole = (role: RoleWithPermissions) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleCreateRole = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedRole(null);
    };

    const handleRoleCreated = async () => {
        // Recargar la lista de roles
        try {
            setLoading(true);
            const response = await rolesService.getRolesWithPermissions();
            setRoles(response.data);
        } catch (error) {
            console.error('Error reloading roles:', error);
            showError('Error al recargar roles');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdated = async () => {
        // Recargar la lista de roles
        try {
            setLoading(true);
            const response = await rolesService.getRolesWithPermissions();
            setRoles(response.data);
        } catch (error) {
            console.error('Error reloading roles:', error);
            showError('Error al recargar roles');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-4 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Gestión de Roles
                            </h1>
                            <p className="text-sm text-gray-300">
                                Administra los roles del sistema y sus permisos asociados
                            </p>
                        </div>
                        {hasPermission('role:create', user?.permissions) && (
                            <button
                                onClick={handleCreateRole}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Rol
                            </button>
                        )}
                    </div>
                </div>

                {/* Roles Table */}
                <RolesTable
                    roles={roles}
                    loading={loading}
                    onEditRole={handleEditRole}
                />

                {/* Stats Cards */}
                <RolesStatsCards roles={roles} />
            </div>

            {/* Create Role Modal */}
            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onRoleCreated={handleRoleCreated}
            />

            {/* Edit Role Modal */}
            {selectedRole && (
                <EditRoleModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onRoleUpdated={handleRoleUpdated}
                    role={selectedRole}
                />
            )}
        </div>
    );
}
