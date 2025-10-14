import { useCallback, useEffect, useState } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import { permissionsService, type Permission } from "../../../services/permissions.service";
import PermissionsTable from "./PermissionsTable";
import PermissionsStatsCards from "./PermissionsStatsCards";
import CreatePermissionModal from "./CreatePermissionModal";
import EditPermissionModal from "./EditPermissionModal";
import { hasPermission } from "../../../utils/hasPermission";
import { useAuth } from "../../../contexts/AuthContext";

export default function PermissionsPanel() {
    const { showError } = useNotification();
    const { user } = useAuth();

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleGetPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await permissionsService.getAllPermissions();
            setPermissions(response.data || []);
            console.log('📊 PermissionsPanel: Permissions loaded successfully:', response.data);
        } catch (error) {
            console.error('📊 PermissionsPanel: Error loading permissions:', error);
            showError('Error al cargar los permisos');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        handleGetPermissions();
    }, [handleGetPermissions]);

    const handleEditPermission = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPermission(null);
    };

    const handleCreatePermission = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handlePermissionCreated = async () => {
        // Recargar la lista de permisos
        try {
            setLoading(true);
            const response = await permissionsService.getAllPermissions();
            setPermissions(response.data || []);
        } catch (error) {
            console.error('Error reloading permissions:', error);
            showError('Error al recargar permisos');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionUpdated = async () => {
        // Recargar la lista de permisos
        try {
            setLoading(true);
            const response = await permissionsService.getAllPermissions();
            setPermissions(response.data || []);
        } catch (error) {
            console.error('Error reloading permissions:', error);
            showError('Error al recargar permisos');
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
                                Gestión de Permisos
                            </h1>
                            <p className="text-sm text-gray-300">
                                Administra los permisos del sistema y sus configuraciones
                            </p>
                        </div>
                        {hasPermission('permission:create', user?.permissions) && (
                            <button
                                onClick={handleCreatePermission}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Permiso
                            </button>
                        )}
                    </div>
                </div>

                {/* Permissions Table */}
                <PermissionsTable
                    permissions={permissions}
                    loading={loading}
                    onEditPermission={handleEditPermission}
                />

                {/* Stats Cards */}
                <PermissionsStatsCards permissions={permissions} />
            </div>

            {/* Create Permission Modal */}
            <CreatePermissionModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onPermissionCreated={handlePermissionCreated}
            />

            {/* Edit Permission Modal */}
            {selectedPermission && (
                <EditPermissionModal
                    permission={selectedPermission}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onPermissionUpdated={handlePermissionUpdated}
                />
            )}
        </div>
    );
}
