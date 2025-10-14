import { useCallback, useEffect } from 'react';
import { useForm } from '../../../hooks/useForm';
import { useNotification } from '../../../contexts/NotificationContext';
import { permissionsService } from '../../../services/permissions.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

interface CreatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPermissionCreated: () => void;
}

interface CreatePermissionFormData {
    name: string;
    description: string;
    [key: string]: string;
}

export default function CreatePermissionModal({ isOpen, onClose, onPermissionCreated }: CreatePermissionModalProps) {
    const { showSuccess, showError } = useNotification();

    const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit, resetForm } = useForm({
        initialValues: {
            name: '',
            description: '',
        } as CreatePermissionFormData,
        validationRules: {
            name: {
                required: true,
                custom: (value) => {
                    const pattern = /^[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z][a-zA-Z0-9]*$/;
                    if (!pattern.test(value)) {
                        return 'El nombre debe seguir el patrón <entidad>:<acción> (ej: user:create)';
                    }
                    return null;
                }
            },
            description: { required: false },
        },
        onSubmit: async (values) => {
            try {
                await permissionsService.createPermission({
                    name: values.name,
                    description: values.description || undefined,
                });

                showSuccess('Permiso creado exitosamente');
                resetForm(); // Limpiar el formulario
                onPermissionCreated();
                onClose();
            } catch (error) {
                console.error('Error al crear permiso:', error);
                showError('Error al crear permiso');
            }
        },
    });

    const handleResetForm = useCallback(() => {
        resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Limpiar formulario cuando se cierre el modal
    useEffect(() => {
        handleResetForm();
    }, [isOpen, handleResetForm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Crear Nuevo Permiso</h3>
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
                        {/* Permission Name */}
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
                                Nombre del Permiso
                            </label>
                            <div className="mb-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
                                <p className="text-xs text-blue-300 mb-1">
                                    <strong>Patrón requerido:</strong> <code className="bg-blue-800/50 px-1 rounded">&lt;entidad&gt;:&lt;acción&gt;</code>
                                </p>
                                <p className="text-xs text-blue-200">
                                    <strong>Ejemplo:</strong> <code className="bg-blue-800/50 px-1 rounded">user:create</code> - Permiso para crear usuarios
                                </p>
                            </div>
                            <input
                                type="text"
                                id="name"
                                value={formState.name.value}
                                onChange={(e) => setValue('name', e.target.value)}
                                onBlur={() => setTouched('name')}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="ej: user:create, role:update, permission:delete"
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
                                placeholder="Ingresa una descripción del permiso (opcional)"
                            />
                            {formState.description.touched && formState.description.error && (
                                <ErrorMessage message={formState.description.error} />
                            )}
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
                                    'Crear Permiso'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
