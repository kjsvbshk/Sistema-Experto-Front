import { useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../contexts/NotificationContext';
import { factService } from '../../services/fact.service';
import type { Fact } from './types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface EditFactModalProps {
    fact: Fact | null;
    isOpen: boolean;
    onClose: () => void;
    onFactUpdated: () => void;
}

interface EditFactFormData {
    code: string;
    description: string;
    [key: string]: string;
}

export default function EditFactModal({ fact, isOpen, onClose, onFactUpdated }: EditFactModalProps) {
    console.log('🔍 EditFactModal: Component rendered with fact:', fact, 'isOpen:', isOpen);
    const { showSuccess, showError } = useNotification();

    const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit, resetForm, getValues } = useForm({
        initialValues: {
            code: '',
            description: '',
        } as EditFactFormData,
        validationRules: {
            code: {
                required: true,
                minLength: 2,
                custom: (value) => {
                    if (value.length < 2) {
                        return 'El código debe tener al menos 2 caracteres';
                    }
                    return null;
                }
            },
            description: {
                required: true,
                minLength: 5,
                custom: (value) => {
                    if (value.length < 5) {
                        return 'La descripción debe tener al menos 5 caracteres';
                    }
                    return null;
                }
            },
        },
        onSubmit: async (values) => {
            if (!fact) return;
            try {
                await factService.updateFact(fact.id, {
                    code: values.code,
                    description: values.description,
                });

                showSuccess('Hecho actualizado exitosamente');
                resetForm();
                onFactUpdated();
                onClose();
            } catch (error) {
                console.error('Error al actualizar hecho:', error);
                showError('Error al actualizar hecho');
            }
        },
    });


    // Inicializar formulario cuando el modal se abra y fact esté disponible
    useEffect(() => {
        console.log('🔍 EditFactModal: useEffect triggered with isOpen:', isOpen, 'fact:', fact);
        if (isOpen && fact) {
            console.log('🔍 EditFactModal: Setting form values - code:', fact.code, 'description:', fact.description);
            setValue('code', fact.code || '');
            setValue('description', fact.description || '');
            console.log('🔍 EditFactModal: Form values set successfully');
        }
    }, [isOpen, fact, setValue]);

    // Obtener valores del formulario de manera segura
    const formValues = getValues();
    console.log('🔍 EditFactModal: formValues:', formValues);
    console.log('🔍 EditFactModal: formState:', formState);

    if (!isOpen || !fact) {
        console.log('🔍 EditFactModal: Modal not open or fact not available, returning null. isOpen:', isOpen, 'fact:', fact);
        return null;
    }

    console.log('🔍 EditFactModal: Modal is open and fact is available, rendering modal');

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Editar Hecho</h3>
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
                        {/* Fact Code */}
                        <div>
                            <label htmlFor="code" className="block text-xs font-medium text-gray-300 mb-1">
                                Código del Hecho
                            </label>
                            <div className="mb-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
                                <p className="text-xs text-blue-300 mb-1">
                                    <strong>Requerido:</strong> Código único identificador del hecho
                                </p>
                                <p className="text-xs text-blue-200">
                                    <strong>Ejemplo:</strong> "F001", "ING_MENSUAL", "SCORE_CREDIT"
                                </p>
                            </div>
                            <input
                                type="text"
                                id="code"
                                value={formValues.code}
                                onChange={(e) => setValue('code', e.target.value)}
                                onBlur={() => setTouched('code')}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="ej: F001, ING_MENSUAL, SCORE_CREDIT"
                            />
                            {formState.code?.touched && formState.code?.error && (
                                <ErrorMessage message={formState.code.error} className='mt-2' />
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                value={formValues.description}
                                onChange={(e) => setValue('description', e.target.value)}
                                onBlur={() => setTouched('description')}
                                rows={3}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                                placeholder="Describe el hecho o condición que se evaluará (opcional)"
                            />
                            {formState.description?.touched && formState.description?.error && (
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
                                        <span className="ml-2">Actualizando...</span>
                                    </>
                                ) : (
                                    'Actualizar Hecho'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}