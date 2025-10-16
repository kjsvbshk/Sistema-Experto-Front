import { Trash2 } from 'lucide-react';
import type { FactsFailure } from '../../services/facts-failure.service';

interface FactFailureRelationsTableProps {
    relations: FactsFailure[];
    onDelete?: (relation: FactsFailure) => void;
    loading?: boolean;
}

export default function FactFailureRelationsTable({ 
    relations, 
    onDelete, 
    loading = false 
}: FactFailureRelationsTableProps) {
    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 text-center">
                    <div className="inline-flex items-center text-gray-400">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando relaciones...
                    </div>
                </div>
            </div>
        );
    }

    if (relations.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 text-center">
                    <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">No hay relaciones</h3>
                    <p className="text-xs text-gray-400">No se han creado relaciones entre hechos y fallas aún.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Hecho
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Falla
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {relations.map((relation) => (
                            <tr key={relation.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {relation.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">F</span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">
                                                {relation.fact.code}
                                            </div>
                                            <div className="text-sm text-gray-400 truncate max-w-xs">
                                                {relation.fact.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-red-600">E</span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">
                                                {relation.failure.name}
                                            </div>
                                            <div className="text-sm text-gray-400 truncate max-w-xs">
                                                {relation.failure.description || 'Sin descripción'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onDelete?.(relation)}
                                        className="text-red-400 hover:text-red-300 flex items-center"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
