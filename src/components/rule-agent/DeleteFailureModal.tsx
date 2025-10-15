import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { failureService } from '../../services/failure.service';
import type { Failure } from './types';
import LoadingSpinner from '../LoadingSpinner';

interface DeleteFailureModalProps {
    failure: Failure;
    isOpen: boolean;
    onClose: () => void;
    onFailureDeleted: () => void;
}

export default function DeleteFailureModal({ failure, isOpen, onClose, onFailureDeleted }: DeleteFailureModalProps) {
    const { showSuccess, showError } = useNotification();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await failureService.deleteFailure(failure.id);

            showSuccess('Falla eliminada exitosamente');
            onFailureDeleted();
            onClose();
        } catch (error) {
            console.error('Error al eliminar falla:', error);
            showError('Error al eliminar falla');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

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
                                    ¿Estás seguro de que quieres eliminar esta falla?
                                </h4>
                            </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                            <div className="text-sm">
                                <div className="mb-2">
                                    <span className="font-medium text-gray-300">Nombre:</span>
                                    <span className="ml-2 text-white">{failure.name}</span>
                                </div>
                                {failure.description && (
                                    <div>
                                        <span className="font-medium text-gray-300">Descripción:</span>
                                        <span className="ml-2 text-white">{failure.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-md">
                            <p className="text-sm text-red-300">
                                <strong>Advertencia:</strong> Esta acción no se puede deshacer. La falla será eliminada permanentemente.
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
                                'Eliminar Falla'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
