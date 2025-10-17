import { useCallback, useEffect, useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { useNotification } from '../../../contexts/NotificationContext';
import { rolesService } from '../../../services/roles.service';
import { type Permission } from '../../../services/permissions.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import { permissionsService } from '../../../services/permissions.service';
import { hasPermission } from '../../../utils/hasPermission';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthorization } from '../../../hooks/useAuthorization';

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoleCreated: () => void;
}

interface CreateRoleFormData {
    name: string;
    description: string;
    [key: string]: string;
}

export default function CreateRoleModal({ isOpen, onClose, onRoleCreated }: CreateRoleModalProps) {
    const { showSuccess, showError } = useNotification();
    const { user: userAuth } = useAuth();
    const { isAdmin } = useAuthorization();

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

    const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit, resetForm } = useForm({
        initialValues: {
            name: '',
            description: '',
        } as CreateRoleFormData,
        validationRules: {
            name: { required: true },
            description: { required: false },
        },
        onSubmit: async (values) => {
            try {
                await rolesService.createRoleWithPermissions({
                    name: values.name,
                    description: values.description || undefined,
                    permissions: selectedPermissionIds,
                });

                showSuccess('Rol creado exitosamente');
                resetForm();
                setSelectedPermissionIds([]); // Limpiar permisos seleccionados
                onRoleCreated();
                onClose();
            } catch (error) {
                console.error('Error al crear rol:', error);
                showError('Error al crear rol');
            }
        },
    });

    const handleGetAllPermissions = useCallback(async () => {
        setLoadingPermissions(true);
        const response = await permissionsService.getAllPermissions();
        setPermissions(response?.data || []);
        setLoadingPermissions(false);
    }, []);

    const handleResetForm = useCallback(() => {
        resetForm();
        setSelectedPermissionIds([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    useEffect(() => {
        handleGetAllPermissions();
    }, [handleGetAllPermissions]);

    // Limpiar formulario cuando se cierre el modal
    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        }
    }, [isOpen, handleResetForm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Crear Nuevo Rol</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Name */}
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
                                Nombre del Rol
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formState.name.value}
                                onChange={(e) => setValue('name', e.target.value)}
                                onBlur={() => setTouched('name')}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="Ingresa el nombre del rol"
                            />
                            {formState.name.touched && formState.name.error && (
                                <ErrorMessage message={formState.name.error} className='mt-2' />
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                value={formState.description.value}
                                onChange={(e) => setValue('description', e.target.value)}
                                onBlur={() => setTouched('description')}
                                rows={3}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                                placeholder="Ingresa una descripción del rol (opcional)"
                            />
                            {formState.description.touched && formState.description.error && (
                                <ErrorMessage message={formState.description.error} />
                            )}
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-2">
                                Permisos del Rol
                            </label>
                            <div className="bg-gray-700 rounded-lg p-4">
                                {loadingPermissions ? (
                                    <div className="flex items-center justify-center p-4">
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2 text-xs text-gray-300">Cargando permisos...</span>
                                    </div>
                                ) : permissions.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-400">No hay permisos disponibles</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    checked={selectedPermissionIds.includes(permission.id)}
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
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                {selectedPermissionIds.length} de {permissions.length} permisos seleccionados
                            </div>
                        </div>

                        {/* Submit Error */}
                        {submitError && <ErrorMessage message={submitError} />}

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            {hasPermission('role:create', userAuth?.permissions, isAdmin) && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Creando...</span>
                                        </>
                                    ) : (
                                        'Crear Rol'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
