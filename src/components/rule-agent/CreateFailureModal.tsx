import { useCallback, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../contexts/NotificationContext';
import { failureService } from '../../services/failure.service';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
// import { hasPermission } from '../../utils/hasPermission';
// import { useAuth } from '../../contexts/AuthContext';

interface CreateFailureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFailureCreated: () => void;
}

interface CreateFailureFormData {
    name: string;
    description: string;
    [key: string]: string;
}

export default function CreateFailureModal({ isOpen, onClose, onFailureCreated }: CreateFailureModalProps) {
    const { showSuccess, showError } = useNotification();
    // const { user: userAuth } = useAuth();

    const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit, resetForm } = useForm({
        initialValues: {
            name: '',
            description: '',
        } as CreateFailureFormData,
        validationRules: {
            name: {
                required: true,
                minLength: 3,
                custom: (value) => {
                    if (value.length < 3) {
                        return 'El nombre debe tener al menos 3 caracteres';
                    }
                    return null;
                }
            },
            description: { required: false },
        },
        onSubmit: async (values) => {
            try {
                await failureService.createFailure({
                    name: values.name,
                    description: values.description || undefined,
                });

                showSuccess('Falla creada exitosamente');
                resetForm(); // Limpiar el formulario
                onFailureCreated();
                onClose();
            } catch (error) {
                console.error('Error al crear falla:', error);
                showError('Error al crear falla');
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
                        <h3 className="text-lg font-semibold text-white">Crear Nueva Falla</h3>
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
                        {/* Failure Name */}
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
                                Nombre de la Falla
                            </label>
                            <div className="mb-2 p-3 bg-red-900/20 border border-red-700/30 rounded-md">
                                <p className="text-xs text-red-300 mb-1">
                                    <strong>Requerido:</strong> Nombre descriptivo de la falla
                                </p>
                                <p className="text-xs text-red-200">
                                    <strong>Ejemplo:</strong> "Error de Conexión a Base de Datos"
                                </p>
                            </div>
                            <input
                                type="text"
                                id="name"
                                value={formState.name.value}
                                onChange={(e) => setValue('name', e.target.value)}
                                onBlur={() => setTouched('name')}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="ej: Error de Conexión, Timeout de Procesamiento"
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
                                placeholder="Describe los detalles de la falla (opcional)"
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
                            {/* {hasPermission('failure:create', userAuth?.permissions) && ( */}
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
                                    'Crear Falla'
                                )}
                            </button>
                            {/* )} */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
