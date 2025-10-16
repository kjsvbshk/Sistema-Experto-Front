import { Edit, Trash2 } from 'lucide-react';
import { Fact } from './types';

interface FactsTableProps {
    facts: Fact[];
    onEdit?: (fact: Fact) => void;
    onDelete?: (fact: Fact) => void;
}

export default function FactsTable({ facts, onEdit, onDelete }: FactsTableProps) {

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
                                Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {facts.map((fact) => (
                            <tr key={fact.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {fact.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {fact.code}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {fact.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onEdit?.(fact)}
                                        className="text-indigo-400 hover:text-indigo-300 mr-3 flex items-center"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(fact)}
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
