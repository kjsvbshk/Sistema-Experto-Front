import { useEffect, useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../contexts/NotificationContext';
import { factsFailureService } from '../../services/facts-failure.service';
import { factService } from '../../services/fact.service';
import { failureService } from '../../services/failure.service';
import type { Fact } from './types';
import type { Failure } from './types';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface CreateFactFailureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRelationCreated: () => void;
    preselectedFact?: Fact | null;
}

interface CreateFactFailureFormData {
    fact_id: string;
    failure_id: string;
    [key: string]: string;
}

export default function CreateFactFailureModal({ 
    isOpen, 
    onClose, 
    onRelationCreated, 
    preselectedFact 
}: CreateFactFailureModalProps) {
    const { showSuccess, showError } = useNotification();
    const [facts, setFacts] = useState<Fact[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);
    const [loading, setLoading] = useState(false);

    const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit, resetForm, getValues } = useForm({
        initialValues: {
            fact_id: preselectedFact?.id.toString() || '',
            failure_id: '',
        } as CreateFactFailureFormData,
        validationRules: {
            fact_id: {
                required: true,
                custom: (value) => {
                    if (!value || value === '') {
                        return 'Debe seleccionar un hecho';
                    }
                    return null;
                }
            },
            failure_id: {
                required: true,
                custom: (value) => {
                    if (!value || value === '') {
                        return 'Debe seleccionar una falla';
                    }
                    return null;
                }
            },
        },
        onSubmit: async (values) => {
            try {
                await factsFailureService.createRelation({
                    fact_id: parseInt(values.fact_id),
                    failure_id: parseInt(values.failure_id),
                });

                showSuccess('Relación creada exitosamente');
                resetForm();
                onRelationCreated();
                onClose();
            } catch (error) {
                console.error('Error al crear relación:', error);
                showError('Error al crear relación');
            }
        },
    });

    // Cargar datos cuando se abra el modal
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    // Actualizar fact_id cuando cambie preselectedFact
    useEffect(() => {
        if (preselectedFact) {
            setValue('fact_id', preselectedFact.id.toString());
        }
    }, [preselectedFact, setValue]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [factsData, failuresData] = await Promise.all([
                factService.getAllFacts(),
                failureService.getAllFailures()
            ]);
            setFacts(factsData);
            setFailures(failuresData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            showError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleResetForm = () => {
        resetForm();
        if (preselectedFact) {
            setValue('fact_id', preselectedFact.id.toString());
        }
    };

    // Limpiar formulario cuando se cierre el modal
    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        }
    }, [isOpen]);

    // Obtener valores del formulario de manera segura
    const formValues = getValues();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Crear Relación Hecho-Falla</h3>
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
                        {/* Fact Selection */}
                        <div>
                            <label htmlFor="fact_id" className="block text-xs font-medium text-gray-300 mb-1">
                                Hecho
                            </label>
                            <div className="mb-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
                                <p className="text-xs text-blue-300 mb-1">
                                    <strong>Requerido:</strong> Seleccione el hecho a relacionar
                                </p>
                                <p className="text-xs text-blue-200">
                                    <strong>Descripción:</strong> Un hecho puede estar relacionado con múltiples fallas
                                </p>
                            </div>
                            {loading ? (
                                <div className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-400 text-sm flex items-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Cargando hechos...</span>
                                </div>
                            ) : (
                                <select
                                    id="fact_id"
                                    value={formValues.fact_id}
                                    onChange={(e) => setValue('fact_id', e.target.value)}
                                    onBlur={() => setTouched('fact_id')}
                                    className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    disabled={!!preselectedFact}
                                >
                                    <option value="">Seleccionar hecho...</option>
                                    {facts.map((fact) => (
                                        <option key={fact.id} value={fact.id}>
                                            {fact.code} - {fact.description}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formState.fact_id?.touched && formState.fact_id?.error && (
                                <ErrorMessage message={formState.fact_id.error} className='mt-2' />
                            )}
                        </div>

                        {/* Failure Selection */}
                        <div>
                            <label htmlFor="failure_id" className="block text-xs font-medium text-gray-300 mb-1">
                                Falla
                            </label>
                            <div className="mb-2 p-3 bg-red-900/20 border border-red-700/30 rounded-md">
                                <p className="text-xs text-red-300 mb-1">
                                    <strong>Requerido:</strong> Seleccione la falla a relacionar
                                </p>
                                <p className="text-xs text-red-200">
                                    <strong>Descripción:</strong> Una falla puede estar relacionada con múltiples hechos
                                </p>
                            </div>
                            {loading ? (
                                <div className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-gray-400 text-sm flex items-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Cargando fallas...</span>
                                </div>
                            ) : (
                                <select
                                    id="failure_id"
                                    value={formValues.failure_id}
                                    onChange={(e) => setValue('failure_id', e.target.value)}
                                    onBlur={() => setTouched('failure_id')}
                                    className="w-full px-2.5 py-1.5 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">Seleccionar falla...</option>
                                    {failures.map((failure) => (
                                        <option key={failure.id} value={failure.id}>
                                            {failure.name} - {failure.description}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formState.failure_id?.touched && formState.failure_id?.error && (
                                <ErrorMessage message={formState.failure_id.error} className='mt-2' />
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
                                disabled={isSubmitting || loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Creando...</span>
                                    </>
                                ) : (
                                    'Crear Relación'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
