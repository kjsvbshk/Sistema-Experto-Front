import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { factsFailureService } from '../../services/facts-failure.service';
import type { FactsFailure } from '../../services/facts-failure.service';
import LoadingSpinner from '../LoadingSpinner';

interface DeleteFactFailureModalProps {
    relation: FactsFailure | null;
    isOpen: boolean;
    onClose: () => void;
    onRelationDeleted: () => void;
}

export default function DeleteFactFailureModal({ 
    relation, 
    isOpen, 
    onClose, 
    onRelationDeleted 
}: DeleteFactFailureModalProps) {
    const { showSuccess, showError } = useNotification();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!relation) return;
        
        try {
            setIsDeleting(true);
            await factsFailureService.deleteRelation(relation.id);
            showSuccess('Relación eliminada exitosamente');
            onRelationDeleted();
            onClose();
        } catch (error) {
            console.error('Error al eliminar relación:', error);
            showError('Error al eliminar relación');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !relation) return null;

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Confirmar Eliminación</h3>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-white">
                                    ¿Estás seguro de que quieres eliminar esta relación?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                            <div className="text-sm space-y-3">
                                <div>
                                    <span className="font-medium text-gray-300">Hecho:</span>
                                    <div className="mt-1 flex items-center">
                                        <div className="flex-shrink-0 h-6 w-6">
                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">F</span>
                                            </div>
                                        </div>
                                        <div className="ml-2">
                                            <span className="text-white font-medium">{relation.fact.code}</span>
                                            <span className="text-gray-400 ml-2">{relation.fact.description}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-300">Falla:</span>
                                    <div className="mt-1 flex items-center">
                                        <div className="flex-shrink-0 h-6 w-6">
                                            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-red-600">E</span>
                                            </div>
                                        </div>
                                        <div className="ml-2">
                                            <span className="text-white font-medium">{relation.failure.name}</span>
                                            <span className="text-gray-400 ml-2">{relation.failure.description || 'Sin descripción'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-md">
                            <p className="text-sm text-red-300">
                                <strong>Advertencia:</strong> Esta acción no se puede deshacer. La relación será eliminada permanentemente.
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center"
                        >
                            {isDeleting ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Eliminando...</span>
                                </>
                            ) : (
                                'Eliminar Relación'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
