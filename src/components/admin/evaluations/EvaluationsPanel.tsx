import { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { inferenceEngineService, type EvaluationSession } from '../../../services/inference-engine.service';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  TrendingUp,
  User
} from 'lucide-react';

export default function EvaluationsPanel() {
  const { showError } = useNotification();
  const [evaluations, setEvaluations] = useState<EvaluationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadEvaluations();
  }, [currentPage]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await inferenceEngineService.getAllEvaluations(itemsPerPage, offset);
      setEvaluations(response.evaluations || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error cargando evaluaciones:', error);
      showError('Error al cargar las evaluaciones: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (evaluation: EvaluationSession) => {
    setSelectedEvaluation(evaluation);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvaluation(null);
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APROBADO':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'RECHAZADO':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'CONDICIONADO':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'PENDIENTE':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APROBADO':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'RECHAZADO':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'CONDICIONADO':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'PENDIENTE':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRiskProfileColor = (risk: string) => {
    switch (risk) {
      case 'RIESGO_BAJO':
      case 'BAJO':
        return 'text-green-400';
      case 'RIESGO_MEDIO':
      case 'MEDIO':
        return 'text-yellow-400';
      case 'RIESGO_ALTO':
      case 'ALTO':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatConfidenceScore = (score: any): string => {
    if (score === null || score === undefined) return '0';
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(numScore)) return '0';
    return numScore.toFixed(1);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="py-4 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Historial de Evaluaciones
          </h1>
          <p className="text-sm text-gray-300">
            Revisa todas las evaluaciones realizadas por el sistema experto
          </p>
        </div>

        {/* Evaluations Table */}
        {loading ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <div className="text-gray-400">Cargando evaluaciones...</div>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <div className="text-gray-400">No hay evaluaciones registradas</div>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%]">
                        Sesión
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[8%]">
                        Usuario
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[12%]">
                        Decisión
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                        Riesgo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                        Confianza
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[20%]">
                        Fecha
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {evaluations.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-white truncate" title={evaluation.session_id}>
                            {evaluation.session_id}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center text-xs text-gray-300">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate" title={evaluation.user?.email || ''}>
                              {evaluation.user?.username || (evaluation.user_id ? `#${evaluation.user_id}` : 'N/A')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getDecisionColor(evaluation.final_decision)}`}>
                            {getDecisionIcon(evaluation.final_decision)}
                            <span className="truncate max-w-[80px]">{evaluation.final_decision}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className={`text-xs font-medium ${getRiskProfileColor(evaluation.risk_profile)}`}>
                            {evaluation.risk_profile?.replace('RIESGO_', '') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center text-xs text-gray-300">
                            <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                            {formatConfidenceScore(evaluation.confidence_score)}%
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-300">
                          <div className="truncate" title={formatDate(evaluation.created_at)}>
                            {formatDate(evaluation.created_at)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-medium">
                          <button
                            onClick={() => handleViewDetails(evaluation)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, total)} de {total} evaluaciones
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && selectedEvaluation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Detalles de Evaluación
                    </h2>
                    <p className="text-sm text-gray-400">
                      Sesión: {selectedEvaluation.session_id}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Información General */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Decisión Final</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getDecisionColor(selectedEvaluation.final_decision)}`}>
                        {getDecisionIcon(selectedEvaluation.final_decision)}
                        {selectedEvaluation.final_decision}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Perfil de Riesgo</div>
                      <div className={`text-lg font-semibold mt-1 ${getRiskProfileColor(selectedEvaluation.risk_profile)}`}>
                        {selectedEvaluation.risk_profile?.replace('RIESGO_', '') || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Nivel de Confianza</div>
                      <div className="text-lg font-semibold text-white mt-1">
                        {formatConfidenceScore(selectedEvaluation.confidence_score)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Estado</div>
                      <div className="text-lg font-semibold text-white mt-1">
                        {selectedEvaluation.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Fecha de Creación</div>
                      <div className="text-sm text-white mt-1">
                        {formatDate(selectedEvaluation.created_at)}
                      </div>
                    </div>
                    {selectedEvaluation.user_id && (
                      <div>
                        <div className="text-sm text-gray-400">Usuario</div>
                        <div className="flex items-center text-sm text-white mt-1">
                          <User className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{selectedEvaluation.user?.username || `ID: ${selectedEvaluation.user_id}`}</div>
                            {selectedEvaluation.user?.email && (
                              <div className="text-xs text-gray-400">{selectedEvaluation.user.email}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explicación */}
                {selectedEvaluation.explanation && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Explicación</h3>
                    <p className="text-gray-300">{selectedEvaluation.explanation}</p>
                  </div>
                )}

                {/* Datos de Entrada */}
                {selectedEvaluation.input_data && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Datos de Entrada</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedEvaluation.input_data).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-gray-400">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          <div className="text-white font-medium">
                            {typeof value === 'number' && key.includes('amount') || key.includes('income') || key.includes('pension')
                              ? formatCurrency(value as number)
                              : typeof value === 'boolean'
                              ? value ? 'Sí' : 'No'
                              : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facts Detectados */}
                {selectedEvaluation.facts_detected && selectedEvaluation.facts_detected.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Facts Detectados ({selectedEvaluation.facts_detected.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvaluation.facts_detected.map((fact, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resultado de Evaluación Detallado */}
                {selectedEvaluation.evaluation_result && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Resultado Detallado</h3>
                    
                    <div className="space-y-4">
                      {/* Failures */}
                      {selectedEvaluation.evaluation_result.failures && selectedEvaluation.evaluation_result.failures.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-red-400 mb-2">
                            Failures ({selectedEvaluation.evaluation_result.failures_count || selectedEvaluation.evaluation_result.failures.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedEvaluation.evaluation_result.failures.map((failure: string, index: number) => (
                              <div key={index} className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm text-red-300 break-words">
                                {failure}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ejecuciones de Reglas */}
                      {selectedEvaluation.evaluation_result.rule_executions && selectedEvaluation.evaluation_result.rule_executions.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-white mb-2">
                            Ejecuciones de Reglas ({selectedEvaluation.evaluation_result.rule_executions_count || selectedEvaluation.evaluation_result.rule_executions.length})
                          </h4>
                          <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-600 rounded p-2">
                            {selectedEvaluation.evaluation_result.rule_executions.map((rule: any, index: number) => (
                              <div key={index} className="bg-gray-600/50 rounded p-3 text-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white break-words">
                                      <span className="text-indigo-400">{rule.rule_code}:</span> {rule.rule_name}
                                    </div>
                                    <div className="text-gray-400 text-xs mt-1 break-words">{rule.explanation}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Tiempo: {rule.execution_time_ms}ms | Categoría: {rule.category}
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${
                                    rule.result === 'PASS' ? 'bg-green-500/20 text-green-300' :
                                    rule.result === 'FAIL' ? 'bg-red-500/20 text-red-300' :
                                    'bg-gray-500/20 text-gray-300'
                                  }`}>
                                    {rule.result}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cálculo de Confianza */}
                      {selectedEvaluation.evaluation_result.confidence_calculation && (
                        <div>
                          <h4 className="text-md font-semibold text-white mb-2">Cálculo de Confianza</h4>
                          <div className="bg-gray-600/30 rounded p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Base:</span>
                                <span className="text-white font-medium">{selectedEvaluation.evaluation_result.confidence_calculation.base}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Penalización por Failures:</span>
                                <span className="text-red-400 font-medium">{selectedEvaluation.evaluation_result.confidence_calculation.failures_penalty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Penalización por Reglas Fallidas:</span>
                                <span className="text-red-400 font-medium">{selectedEvaluation.evaluation_result.confidence_calculation.failed_rules_penalty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Bonus por Facts Positivos:</span>
                                <span className="text-green-400 font-medium">+{selectedEvaluation.evaluation_result.confidence_calculation.positive_facts_bonus}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Bonus por Reglas Exitosas:</span>
                                <span className="text-green-400 font-medium">+{selectedEvaluation.evaluation_result.confidence_calculation.successful_rules_bonus}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tiempos de Ejecución */}
                      {selectedEvaluation.evaluation_result.execution_times && (
                        <div>
                          <h4 className="text-md font-semibold text-white mb-2">Tiempos de Ejecución</h4>
                          <div className="bg-gray-600/30 rounded p-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Tiempo Total:</span>
                              <span className="text-white font-medium">{selectedEvaluation.evaluation_result.execution_times.total_time_ms}ms</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Productos Recomendados */}
                {selectedEvaluation.recommended_products && selectedEvaluation.recommended_products.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Productos Recomendados ({selectedEvaluation.recommended_products.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedEvaluation.recommended_products.map((product: any, index: number) => (
                        <div key={index} className="bg-gray-600/50 rounded p-3">
                          <div className="font-medium text-white mb-1">{product.name}</div>
                          <div className="text-sm text-gray-300 mb-2">{product.description}</div>
                          {product.max_amount && (
                            <div className="text-sm text-gray-400">
                              Monto máximo: {formatCurrency(product.max_amount)}
                            </div>
                          )}
                          {product.interest_rate && (
                            <div className="text-sm text-gray-400">
                              Tasa de interés: {product.interest_rate}% EA
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

