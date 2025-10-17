import { useAuth } from '../../../contexts/AuthContext';
import type { Permission } from '../../../services/permissions.service';
import { hasPermission } from '../../../utils/hasPermission';
import { useAuthorization } from '../../../hooks/useAuthorization';

interface PermissionsTableProps {
    permissions: Permission[];
    loading: boolean;
    onEditPermission: (permission: Permission) => void;
}

export default function PermissionsTable({ permissions, loading, onEditPermission }: PermissionsTableProps) {
    const { user } = useAuth();
    const { isAdmin } = useAuthorization();

    const getStatusBadge = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getStatusText = (status: string) => {
        return status === 'active' ? 'Activo' : 'Inactivo';
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Lista de Permisos</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Permiso
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Fecha de Creación
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Última Actualización
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Gestionar
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {(() => {
                            console.log('📊 PermissionsTable: Rendering table - loading:', loading, 'permissions.length:', permissions.length);
                            return loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                            <span className="ml-2 text-sm text-gray-300">Cargando permisos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : permissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <div className="text-gray-400">
                                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <p className="mt-1 text-xs">No se han encontrado permisos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                permissions.map((permission) => (
                                    <tr key={permission.id} className="hover:bg-gray-700">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs font-medium text-white">
                                                {permission.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-gray-300 max-w-xs truncate">
                                                {permission.description || 'Sin descripción'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(permission.status)}`}>
                                                {getStatusText(permission.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300">
                                            {new Date(permission.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300">
                                            {new Date(permission.updated_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {hasPermission('permission:update', user?.permissions, isAdmin) && (
                                                <button
                                                    onClick={() => onEditPermission(permission)}
                                                    className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                                                    title="Editar permiso"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            );
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
