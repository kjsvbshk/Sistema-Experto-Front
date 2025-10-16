import { useCallback, useEffect, useState } from 'react';
import { Plus, Link } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { factService } from '../../services/fact.service';
import { factsFailureService, type FactsFailure } from '../../services/facts-failure.service';
import type { Fact } from './types';
import FactsTable from './FactsTable';
import CreateFactModal from './CreateFactModal';
import EditFactModal from './EditFactModal';
import DeleteFactModal from './DeleteFactModal';
import CreateFactFailureModal from './CreateFactFailureModal';
import FactFailureRelationsTable from './FactFailureRelationsTable';
import DeleteFactFailureModal from './DeleteFactFailureModal';

export default function FactsPanel() {
    const { showError } = useNotification();

    const [facts, setFacts] = useState<Fact[]>([]);
    const [relations, setRelations] = useState<FactsFailure[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [factToDelete, setFactToDelete] = useState<Fact | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateRelationModalOpen, setIsCreateRelationModalOpen] = useState(false);
    const [relationToDelete, setRelationToDelete] = useState<FactsFailure | null>(null);
    const [isDeleteRelationModalOpen, setIsDeleteRelationModalOpen] = useState(false);
    const [loadingRelations, setLoadingRelations] = useState(false);

    const handleGetFacts = useCallback(async () => {
        try {
            const facts = await factService.getAllFacts();
            setFacts(facts || []);
            console.log('📊 FactsPanel: Facts loaded successfully:', facts);
        } catch (error) {
            console.error('📊 FactsPanel: Error loading facts:', error);
            showError('Error al cargar los hechos');
        }
    }, [showError]);

    const handleGetRelations = useCallback(async () => {
        try {
            setLoadingRelations(true);
            const relations = await factsFailureService.getAllRelations();
            setRelations(relations || []);
            console.log('📊 FactsPanel: Relations loaded successfully:', relations);
        } catch (error) {
            console.error('📊 FactsPanel: Error loading relations:', error);
            showError('Error al cargar las relaciones');
        } finally {
            setLoadingRelations(false);
        }
    }, [showError]);

    useEffect(() => {
        handleGetFacts();
        handleGetRelations();
    }, [handleGetFacts, handleGetRelations]);

    const handleCreateFact = () => {
        console.log('🔍 FactsPanel: handleCreateFact called');
        console.log('🔍 FactsPanel: isCreateModalOpen before:', isCreateModalOpen);
        setIsCreateModalOpen(true);
        console.log('🔍 FactsPanel: isCreateModalOpen set to true');
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleFactCreated = () => {
        handleGetFacts(); // Recargar la lista de hechos
    };

    const handleEditFact = (fact: Fact) => {
        console.log('🔍 FactsPanel: handleEditFact called with fact:', fact);
        console.log('🔍 FactsPanel: selectedFact before:', selectedFact);
        console.log('🔍 FactsPanel: isEditModalOpen before:', isEditModalOpen);
        setSelectedFact(fact);
        setIsEditModalOpen(true);
        console.log('🔍 FactsPanel: selectedFact and isEditModalOpen set');
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedFact(null);
    };

    const handleFactUpdated = () => {
        handleGetFacts(); // Recargar la lista de hechos
    };

    const handleDeleteFact = (fact: Fact) => {
        setFactToDelete(fact);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setFactToDelete(null);
    };

    const handleFactDeleted = () => {
        handleGetFacts(); // Recargar la lista de hechos
    };

    // Funciones para manejar relaciones
    const handleCreateRelation = () => {
        setIsCreateRelationModalOpen(true);
    };

    const handleCloseCreateRelationModal = () => {
        setIsCreateRelationModalOpen(false);
    };

    const handleRelationCreated = () => {
        handleGetRelations(); // Recargar la lista de relaciones
    };

    const handleDeleteRelation = (relation: FactsFailure) => {
        setRelationToDelete(relation);
        setIsDeleteRelationModalOpen(true);
    };

    const handleCloseDeleteRelationModal = () => {
        setIsDeleteRelationModalOpen(false);
        setRelationToDelete(null);
    };

    const handleRelationDeleted = () => {
        handleGetRelations(); // Recargar la lista de relaciones
    };

    // Logs de depuración
    console.log('🔍 FactsPanel: Render state - isCreateModalOpen:', isCreateModalOpen, 'isEditModalOpen:', isEditModalOpen, 'selectedFact:', selectedFact);

    return (
        <div className="py-4 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-1">
                                        Gestión de Hechos
                                    </h1>
                                    <p className="text-sm text-gray-300">
                                        Administra los hechos utilizados por el sistema experto
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleCreateRelation}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                                    >
                                        <Link className="h-4 w-4 mr-1.5" />
                                        Relacionar
                                    </button>
                                    <button
                                        onClick={handleCreateFact}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-1.5" />
                                        Crear Hecho
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Facts Table */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Hechos</h2>
                            <FactsTable
                                facts={facts}
                                onEdit={handleEditFact}
                                onDelete={handleDeleteFact}
                            />
                        </div>

                        {/* Relations Table */}
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">Relaciones Hecho-Falla</h2>
                            <FactFailureRelationsTable
                                relations={relations}
                                onDelete={handleDeleteRelation}
                                loading={loadingRelations}
                            />
                        </div>
            </div>

            {/* Create Fact Modal */}
            <CreateFactModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onFactCreated={handleFactCreated}
            />

            {/* Edit Fact Modal */}
            {selectedFact && (
                <EditFactModal
                    fact={selectedFact}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onFactUpdated={handleFactUpdated}
                />
            )}

                    {/* Delete Fact Modal */}
                    {factToDelete && (
                        <DeleteFactModal
                            fact={factToDelete}
                            isOpen={isDeleteModalOpen}
                            onClose={handleCloseDeleteModal}
                            onFactDeleted={handleFactDeleted}
                        />
                    )}

                    {/* Create Relation Modal */}
                    <CreateFactFailureModal
                        isOpen={isCreateRelationModalOpen}
                        onClose={handleCloseCreateRelationModal}
                        onRelationCreated={handleRelationCreated}
                    />

                    {/* Delete Relation Modal */}
                    {relationToDelete && (
                        <DeleteFactFailureModal
                            relation={relationToDelete}
                            isOpen={isDeleteRelationModalOpen}
                            onClose={handleCloseDeleteRelationModal}
                            onRelationDeleted={handleRelationDeleted}
                        />
                    )}
                </div>
            );
        }
