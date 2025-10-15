import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Fact } from './types';
import FactsTable from './FactsTable';

export default function FactsPanel() {
    const [facts] = useState<Fact[]>([
        {
            id: 1,
            name: "Ingreso Mensual",
            description: "Ingreso mensual del cliente",
            category: "Financiero",
            value: ">= 500000",
            status: 'active',
            createdAt: "2024-01-15",
            updatedAt: "2024-01-20"
        },
        {
            id: 2,
            name: "Antigüedad Laboral",
            description: "Tiempo trabajando en la empresa actual",
            category: "Laboral",
            value: ">= 12 meses",
            status: 'active',
            createdAt: "2024-01-10",
            updatedAt: "2024-01-18"
        },
        {
            id: 3,
            name: "Score Crediticio",
            description: "Puntuación de crédito del cliente",
            category: "Crediticio",
            value: ">= 700",
            status: 'active',
            createdAt: "2024-01-12",
            updatedAt: "2024-01-22"
        }
    ]);

    const handleCreateFact = () => {
        // TODO: Implement create fact functionality
        console.log('Create fact clicked');
    };

    const handleEditFact = (fact: Fact) => {
        // TODO: Implement edit fact functionality
        console.log('Edit fact:', fact);
    };

    const handleDeleteFact = (fact: Fact) => {
        // TODO: Implement delete fact functionality
        console.log('Delete fact:', fact);
    };

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
                        <button
                            onClick={handleCreateFact}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Crear Hecho
                        </button>
                    </div>
                </div>

                {/* Facts Table */}
                <FactsTable
                    facts={facts}
                    onEdit={handleEditFact}
                    onDelete={handleDeleteFact}
                />
            </div>
        </div>
    );
}
