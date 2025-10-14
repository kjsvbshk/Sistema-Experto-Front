import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/hasPermission';
import { useAuthorization } from '../hooks/useAuthorization';
import { FileText, ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';

type TabType = 'facts' | 'rules';

interface Tab {
    id: TabType;
    name: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    permissionRequired?: string;
}

// Datos quemados para Hechos
interface Fact {
    id: number;
    name: string;
    description: string;
    category: string;
    value: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// Datos quemados para Reglas
interface Rule {
    id: number;
    name: string;
    condition: string;
    action: string;
    priority: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// Componente para el tab de Hechos
function FactsPanel() {
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

    const getStatusColor = (status: Fact['status']) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: Fact['status']) => {
        return status === 'active' ? 'Activo' : 'Inactivo';
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
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Crear Hecho
                        </button>
                    </div>
                </div>

                {/* Facts Table */}
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
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Fecha Creación
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
                                            {fact.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {fact.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {fact.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {fact.value}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(fact.status)}`}>
                                                {getStatusText(fact.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {fact.createdAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-400 hover:text-indigo-300 mr-3 flex items-center">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Editar
                                            </button>
                                            <button className="text-red-400 hover:text-red-300 flex items-center">
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
            </div>
        </div>
    );
}

// Componente para el tab de Reglas
function RulesPanel() {
    const [rules] = useState<Rule[]>([
        {
            id: 1,
            name: "Regla de Aprobación Básica",
            condition: "Ingreso Mensual >= 500000 AND Antigüedad Laboral >= 12 meses",
            action: "APROBAR crédito hasta $2,000,000",
            priority: 1,
            status: 'active',
            createdAt: "2024-01-15",
            updatedAt: "2024-01-20"
        },
        {
            id: 2,
            name: "Regla de Score Alto",
            condition: "Score Crediticio >= 700",
            action: "APROBAR crédito hasta $5,000,000",
            priority: 2,
            status: 'active',
            createdAt: "2024-01-10",
            updatedAt: "2024-01-18"
        },
        {
            id: 3,
            name: "Regla de Rechazo",
            condition: "Score Crediticio < 500 OR Ingreso Mensual < 300000",
            action: "RECHAZAR solicitud de crédito",
            priority: 3,
            status: 'active',
            createdAt: "2024-01-12",
            updatedAt: "2024-01-22"
        }
    ]);

    const getStatusColor = (status: Rule['status']) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: Rule['status']) => {
        return status === 'active' ? 'Activo' : 'Inactivo';
    };

    const getPriorityColor = (priority: number) => {
        if (priority === 1) return 'bg-red-100 text-red-800 border-red-200';
        if (priority === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    return (
        <div className="py-4 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Gestión de Reglas
                            </h1>
                            <p className="text-sm text-gray-300">
                                Administra las reglas de decisión del sistema experto
                            </p>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-colors">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Crear Regla
                        </button>
                    </div>
                </div>

                {/* Rules Table */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
                    <table className="w-full divide-y divide-gray-700">

                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Condición
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Acción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Prioridad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {rule.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div className="truncate" title={rule.condition}>
                                            {rule.condition}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div className="truncate" title={rule.action}>
                                            {rule.action}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                                            {rule.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(rule.status)}`}>
                                            {getStatusText(rule.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-400 hover:text-indigo-300 mr-3 flex items-center">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </button>
                                        <button className="text-red-400 hover:text-red-300 flex items-center">
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
        </div >
    );
}

export default function RulesAgentPage() {
    const { user } = useAuth();
    const { isAdmin } = useAuthorization();
    const [activeTab, setActiveTab] = useState<TabType>('rules');

    const tabs: Tab[] = [
        {
            id: 'rules',
            name: 'Reglas',
            icon: <ClipboardList className="w-5 h-5" />,
            component: <RulesPanel />,
            permissionRequired: 'rules:read'
        },
        {
            id: 'facts',
            name: 'Hechos',
            icon: <FileText className="w-5 h-5" />,
            component: <FactsPanel />,
            permissionRequired: 'facts:read'
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
                        <h1 className="text-2xl font-bold text-white">Reglas del Agente</h1>
                        <p className="mt-1 text-sm text-gray-300">Gestiona hechos y reglas del sistema experto</p>
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
