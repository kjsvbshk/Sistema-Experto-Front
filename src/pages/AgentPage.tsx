import { useState } from 'react';
import Navbar from '../components/Navbar';
import AgentModal from '../components/agent/AgentModal';
import ExpertSystemModal from '../components/agent/ExpertSystemModal';

interface Agent {
    id: number;
    name: string;
    status: 'active' | 'inactive' | 'maintenance';
    description: string;
    questionsCount: number;
    lastUsed?: string;
}

export default function AgentPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpertSystemModalOpen, setIsExpertSystemModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    // Datos quemados de agentes
    const [agents] = useState<Agent[]>([
        {
            id: 1,
            name: "Agente de Análisis Crediticio",
            status: 'active',
            description: "Sistema experto especializado en evaluar el perfil crediticio de clientes y recomendar productos financieros adecuados basándose en su historial, ingresos y capacidad de pago.",
            questionsCount: 15,
            lastUsed: "Hace 2 horas"
        },
        {
            id: 2,
            name: "Motor de Inferencia Avanzado",
            status: 'active',
            description: "Sistema experto con motor de inferencia que utiliza 50+ reglas (R001-R052) para evaluación crediticia automatizada, clasificación de riesgo y recomendación de productos con explicaciones detalladas.",
            questionsCount: 25,
            lastUsed: "Hace 5 minutos"
        }
    ]);

    const getStatusColor = (status: Agent['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: Agent['status']) => {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'inactive':
                return 'Inactivo';
            case 'maintenance':
                return 'Mantenimiento';
            default:
                return 'Desconocido';
        }
    };

    const handleStartAgent = (agentId: number) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent && agent.status === 'active') {
            setSelectedAgent(agent);
            if (agentId === 2) {
                // Motor de Inferencia Avanzado
                setIsExpertSystemModalOpen(true);
            } else {
                // Agente tradicional
                setIsModalOpen(true);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAgent(null);
    };

    const handleCloseExpertSystemModal = () => {
        setIsExpertSystemModalOpen(false);
        setSelectedAgent(null);
    };

    return (
        <div className="min-h-full bg-gray-900">
            <Navbar />
            {/* Header */}
            <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-6 py-8 sm:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Agentes del Sistema Experto
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Selecciona un agente para comenzar la evaluación crediticia de tu cliente
                        </p>
                    </div>

                    {/* Agents Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {agents.map((agent) => (
                            <div key={agent.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-indigo-500 transition-all duration-200">
                                {/* Agent Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {agent.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                                                <div className={`w-2 h-2 rounded-full mr-1.5 ${agent.status === 'active' ? 'bg-green-400' : agent.status === 'inactive' ? 'bg-gray-400' : 'bg-yellow-400'}`}></div>
                                                {getStatusText(agent.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Agent Description */}
                                <div className="mb-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {agent.description}
                                    </p>
                                </div>

                                {/* Agent Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Preguntas</div>
                                        <div className="text-lg font-semibold text-white">{agent.questionsCount}</div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-xs text-gray-400 mb-1">Último uso</div>
                                        <div className="text-sm font-medium text-white">{agent.lastUsed}</div>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <button
                                    onClick={() => handleStartAgent(agent.id)}
                                    disabled={agent.status !== 'active'}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${agent.status === 'active'
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {agent.status === 'active' ? 'Iniciar Evaluación' : 'No Disponible'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {agents.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-300">No hay agentes disponibles</h3>
                            <p className="mt-1 text-sm text-gray-500">Contacta al administrador para más información.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Modal */}
            {selectedAgent && (
                <AgentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    agentName={selectedAgent.name}
                />
            )}

            {/* Expert System Modal */}
            {selectedAgent && (
                <ExpertSystemModal
                    isOpen={isExpertSystemModalOpen}
                    onClose={handleCloseExpertSystemModal}
                    agentName={selectedAgent.name}
                />
            )}
        </div>
    );
}
