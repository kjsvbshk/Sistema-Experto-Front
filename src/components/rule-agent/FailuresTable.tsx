import { Edit, Trash2 } from 'lucide-react';
import type { Failure } from './types';

interface FailuresTableProps {
    failures: Failure[];
    loading?: boolean;
    onEdit?: (failure: Failure) => void;
    onDelete?: (failure: Failure) => void;
}

export default function FailuresTable({ failures, loading = false, onEdit, onDelete }: FailuresTableProps) {

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Nombre
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
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mr-2"></div>
                                        Cargando fallas...
                                    </div>
                                </td>
                            </tr>
                        ) : failures.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                    No hay fallas registradas
                                </td>
                            </tr>
                        ) : (
                            failures.map((failure) => (
                                <tr key={failure.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {failure.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {failure.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => onEdit?.(failure)}
                                            className="text-indigo-400 hover:text-indigo-300 mr-3 flex items-center"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(failure)}
                                            className="text-red-400 hover:text-red-300 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
