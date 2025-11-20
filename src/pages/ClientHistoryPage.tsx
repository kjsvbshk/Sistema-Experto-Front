import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { inferenceEngineService, type EvaluationSession } from '../services/inference-engine.service';
import Navbar from '../components/Navbar';
import { 
  CheckCircle, 
  XCircle, 
  X,
  AlertCircle, 
  Clock, 
  Eye,
  FileText,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function ClientHistoryPage() {
  const { showError } = useNotification();
  const [evaluations, setEvaluations] = useState<EvaluationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadMyHistory();
  }, []);

  const loadMyHistory = async () => {
    try {
      setLoading(true);
      const history = await inferenceEngineService.getMyEvaluationHistory();
      setEvaluations(Array.isArray(history) ? history : []);
    } catch (error: any) {
      console.error('Error cargando historial:', error);
      showError('Error al cargar tu historial: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (evaluation: EvaluationSession) => {
    try {
      const session = await inferenceEngineService.getMyEvaluationSession(evaluation.session_id);
      setSelectedEvaluation(session.data || evaluation);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error('Error cargando detalles:', error);
      showError('Error al cargar los detalles de la evaluación');
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvaluation(null);
  };

  const getDecisionColor = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'APROBADO':
        return 'text-green-400';
      case 'RECHAZADO':
        return 'text-red-400';
      case 'PENDIENTE':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'APROBADO':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'RECHAZADO':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'PENDIENTE':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'BAJO':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'MEDIO':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'ALTO':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidenceScore = (score: any): string => {
    if (score === null || score === undefined) return '0';
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(numScore)) return '0';
    return numScore.toFixed(1);
  };

  return (
    <div className="min-h-full bg-gray-900">
      <Navbar />
      <div className="py-4 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Mi Historial de Evaluaciones
            </h1>
            <p className="text-sm text-gray-300">
              Revisa todas las evaluaciones crediticias realizadas para ti
            </p>
          </div>

          {/* Evaluations Table */}
          {loading ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-gray-400">Cargando tu historial...</div>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay evaluaciones registradas
              </h3>
              <p className="text-sm text-gray-400">
                Aún no se han realizado evaluaciones crediticias para tu cuenta.
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Sesión
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Decisión
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Perfil de Riesgo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Confianza
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {evaluations.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(evaluation.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-300">
                            {evaluation.session_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getDecisionIcon(evaluation.final_decision)}
                            <span className={`ml-2 text-sm font-medium ${getDecisionColor(evaluation.final_decision)}`}>
                              {evaluation.final_decision || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(evaluation.risk_profile)}`}>
                            {evaluation.risk_profile || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-300">
                            <TrendingUp className="h-4 w-4 mr-1 text-indigo-400" />
                            {formatConfidenceScore(evaluation.confidence_score)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(evaluation)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Detalles de la Evaluación
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información General */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Sesión ID</p>
                      <p className="text-sm font-mono text-white">{selectedEvaluation.session_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fecha</p>
                      <p className="text-sm text-white">{formatDate(selectedEvaluation.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Decisión Final</p>
                      <div className="flex items-center mt-1">
                        {getDecisionIcon(selectedEvaluation.final_decision)}
                        <span className={`ml-2 text-sm font-medium ${getDecisionColor(selectedEvaluation.final_decision)}`}>
                          {selectedEvaluation.final_decision || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Perfil de Riesgo</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getRiskColor(selectedEvaluation.risk_profile)}`}>
                        {selectedEvaluation.risk_profile || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nivel de Confianza</p>
                      <p className="text-sm text-white">{formatConfidenceScore(selectedEvaluation.confidence_score)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estado</p>
                      <p className="text-sm text-white">{selectedEvaluation.status || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Explicación */}
                {selectedEvaluation.explanation && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Explicación</h3>
                    <p className="text-sm text-gray-300">{selectedEvaluation.explanation}</p>
                  </div>
                )}

                {/* Productos Recomendados */}
                {selectedEvaluation.recommended_products && 
                 Array.isArray(selectedEvaluation.recommended_products) && 
                 selectedEvaluation.recommended_products.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Productos Recomendados</h3>
                    <div className="space-y-3">
                      {selectedEvaluation.recommended_products.map((product: any, index: number) => (
                        <div key={index} className="bg-gray-600/50 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-white">{product.name || `Producto ${index + 1}`}</h4>
                          {product.description && (
                            <p className="text-xs text-gray-300 mt-1">{product.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

