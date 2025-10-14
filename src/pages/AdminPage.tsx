import { useState } from 'react';
import Navbar from '../components/Navbar';
import UsersPanel from '../components/admin/users/UsersPanel';
import RolePanel from '../components/admin/roles/RolePanel';
import { User } from 'lucide-react';
import PermissionsPanel from '../components/admin/permissions/PermissionsPanel';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/hasPermission';

type TabType = 'users' | 'roles' | 'permissions' | 'settings';

interface Tab {
    id: TabType;
    name: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    permissionRequired?: string | string[];
}

export default function AdminPage() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('users');

    const tabs: Tab[] = [
        {
            id: 'users',
            name: 'Usuarios',
            icon: (
                <User className="h-5 w-5" />
            ),
            component: <UsersPanel />,
            permissionRequired: ['user:create', 'user:read', 'user:update', 'user:delete']
        },
        {
            id: 'roles',
            name: 'Roles',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            component: (
                <RolePanel />
            ),
            permissionRequired: ['role:create', 'role:read', 'role:update', 'role:delete']
        },
        {
            id: 'permissions',
            name: 'Permisos',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            component: (
                <PermissionsPanel />
            ),
            permissionRequired: ['permission:create', 'permission:read', 'permission:update', 'permission:delete']
        },
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    const tabWithPermission = tabs.filter(tab => hasPermission(tab.permissionRequired, user?.permissions));

    return (
        <div className="min-h-full bg-gray-900">
            <Navbar />

            {/* Admin Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                        <p className="mt-1 text-sm text-gray-300">Gestiona usuarios, roles, permisos y configuración del sistema</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-6" aria-label="Tabs">
                        {tabWithPermission.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-400'
                                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors duration-200`}
                            >
                                <span className="mr-1.5">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto">
                {activeTabData?.component}
            </div>
        </div>
    );
}