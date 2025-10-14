import type { Permission } from '../../../services/permissions.service';

interface PermissionsStatsCardsProps {
    permissions: Permission[];
}

export default function PermissionsStatsCards({ permissions }: PermissionsStatsCardsProps) {
    // No mostrar las cards si no hay permisos
    if (permissions.length === 0) {
        return null;
    }

    const activePermissions = permissions.filter(p => p.status === 'active').length;
    const inactivePermissions = permissions.filter(p => p.status === 'desactive').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-white">Total Permisos</h3>
                        <p className="text-lg font-bold text-blue-400">{permissions.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-white">Permisos Activos</h3>
                        <p className="text-lg font-bold text-green-400">{activePermissions}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-white">Permisos Inactivos</h3>
                        <p className="text-lg font-bold text-red-400">{inactivePermissions}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
