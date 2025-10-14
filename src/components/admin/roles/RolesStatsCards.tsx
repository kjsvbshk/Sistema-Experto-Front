import type { RoleWithPermissions } from '../../../services/roles.service';

interface RolesStatsCardsProps {
    roles: RoleWithPermissions[];
}

export default function RolesStatsCards({ roles }: RolesStatsCardsProps) {
    // No mostrar las cards si no hay roles
    if (roles.length === 0) {
        return null;
    }

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
                        <h3 className="text-sm font-medium text-white">Total Roles</h3>
                        <p className="text-lg font-bold text-blue-400">{roles.length}</p>
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
                        <h3 className="text-sm font-medium text-white">Roles Activos</h3>
                        <p className="text-lg font-bold text-green-400">
                            {roles.filter(r => r.status === 'active').length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-white">Total Permisos</h3>
                        <p className="text-lg font-bold text-indigo-400">
                            {roles.reduce((total, role) => total + role.permissions.length, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
