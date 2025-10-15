import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { failureService } from '../../services/failure.service';
import type { Failure } from './types';
import FailuresTable from './FailuresTable';
import CreateFailureModal from './CreateFailureModal';
import EditFailureModal from './EditFailureModal';
import DeleteFailureModal from './DeleteFailureModal';

export default function FailuresPanel() {
    const { showError } = useNotification();

    const [failures, setFailures] = useState<Failure[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFailure, setSelectedFailure] = useState<Failure | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [failureToDelete, setFailureToDelete] = useState<Failure | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Function to transform API failure to component failure
    const transformApiFailureToFailure = (apiFailure: Failure): Failure => {
        return {
            id: apiFailure.id,
            name: apiFailure.name,
            description: apiFailure.description || '',
        };
    };

    const handleGetFailures = useCallback(async () => {
        try {
            setLoading(true);
            const response = await failureService.getAllFailures();
            setFailures(response.data || []);
            console.log('📊 FailuresPanel: Failures loaded successfully:', response.data);
        } catch (error) {
            console.error('📊 FailuresPanel: Error loading failures:', error);
            showError('Error al cargar las fallas');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        handleGetFailures();
    }, [handleGetFailures]);

    const handleCreateFailure = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleFailureCreated = async () => {
        // Recargar la lista de fallas
        try {
            setLoading(true);
            const response = await failureService.getAllFailures();
            setFailures(response.data || []);
        } catch (error) {
            console.error('Error reloading failures:', error);
            showError('Error al recargar fallas');
        } finally {
            setLoading(false);
        }
    };

    const handleEditFailure = (failure: Failure) => {
        setSelectedFailure(failure);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedFailure(null);
    };

    const handleFailureUpdated = async () => {
        // Recargar la lista de fallas
        try {
            setLoading(true);
            const response = await failureService.getAllFailures();
            const transformedFailures = (response.data || []).map(transformApiFailureToFailure);
            setFailures(transformedFailures);
        } catch (error) {
            console.error('Error reloading failures:', error);
            showError('Error al recargar fallas');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFailure = (failure: Failure) => {
        setFailureToDelete(failure);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setFailureToDelete(null);
    };

    const handleFailureDeleted = async () => {
        // Recargar la lista de fallas
        try {
            setLoading(true);
            const response = await failureService.getAllFailures();
            const transformedFailures = (response.data || []).map(transformApiFailureToFailure);
            setFailures(transformedFailures);
        } catch (error) {
            console.error('Error reloading failures:', error);
            showError('Error al recargar fallas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-4 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Gestión de Fallas
                            </h1>
                            <p className="text-sm text-gray-300">
                                Administra las fallas y errores del sistema experto
                            </p>
                        </div>
                        <button
                            onClick={handleCreateFailure}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Crear Falla
                        </button>
                    </div>
                </div>

                {/* Failures Table */}
                <FailuresTable
                    failures={failures}
                    loading={loading}
                    onEdit={handleEditFailure}
                    onDelete={handleDeleteFailure}
                />
            </div>

            {/* Create Failure Modal */}
            <CreateFailureModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onFailureCreated={handleFailureCreated}
            />

            {/* Edit Failure Modal */}
            {selectedFailure && (
                <EditFailureModal
                    failure={selectedFailure}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onFailureUpdated={handleFailureUpdated}
                />
            )}

            {/* Delete Failure Modal */}
            {failureToDelete && (
                <DeleteFailureModal
                    failure={failureToDelete}
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onFailureDeleted={handleFailureDeleted}
                />
            )}
        </div>
    );
}
