import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/hasPermission';
import { useAuthorization } from '../hooks/useAuthorization';
import { FileText, AlertTriangle } from 'lucide-react';
import type { TabType, Tab } from '../components/rule-agent/types';
import FactsPanel from '../components/rule-agent/FactsPanel';
import FailuresPanel from '../components/rule-agent/FailuresPanel';


export default function RulesAgentPage() {
    const { user } = useAuth();
    const { isAdmin } = useAuthorization();
    const [activeTab, setActiveTab] = useState<TabType>('facts');

    const tabs: Tab[] = [
        {
            id: 'facts',
            name: 'Hechos',
            icon: <FileText className="w-5 h-5" />,
            component: <FactsPanel />,
            permissionRequired: 'facts:read'
        },
        {
            id: 'failures',
            name: 'Fallas',
            icon: <AlertTriangle className="w-5 h-5" />,
            component: <FailuresPanel />,
            permissionRequired: 'failures:read'
        },
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const tabWithPermission = tabs.filter(tab => hasPermission(tab.permissionRequired, user?.permissions, isAdmin));

    return (
        <div className="min-h-full bg-gray-900">
            <Navbar />

            {/* Rules Agent Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <h1 className="text-2xl font-bold text-white">Sistema Experto</h1>
                        <p className="mt-1 text-sm text-gray-300">Gestiona hechos y fallas del sistema experto</p>
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
