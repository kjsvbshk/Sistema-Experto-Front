import { api } from "./api";
import type { ApiResponse } from "./api";

// Interfaces para el motor de inferencia
export interface StartEvaluationRequest {
  user_id?: number;
  input_data: {
    age: number;
    monthly_income: number;
    credit_score: number;
    employment_status: string;
    credit_purpose: string;
    requested_amount: number;
    debt_to_income_ratio?: number;
    max_days_delinquency?: number;
    employment_tenure_months?: number;
    payment_to_income_ratio?: number;
    down_payment_percentage?: number;
    has_co_borrower?: boolean;
    co_borrower_income?: number;
    is_microenterprise?: boolean;
    economic_activity?: string;
    is_pep?: boolean;
    pep_committee_approval?: boolean;
    recent_inquiries?: number;
    customer_tenure_months?: number;
    historical_compliance?: number;
    is_convention_employee?: boolean;
    payroll_discount_authorized?: boolean;
    employment_type?: string;
    pension_amount?: number;
    is_legal_pension?: boolean;
  };
  session_id?: string;
}

export interface ProductRecommendation {
  name: string;
  description: string;
  max_amount: number;
  max_term_months: number;
  interest_rate: number;
  special_conditions: string[];
  confidence: number;
}

export interface RuleExecution {
  rule_code: string;
  rule_name: string;
  category: string;
  result: string;
  explanation: string;
  execution_time_ms: number;
}

export interface EvaluationResult {
  session_id: string;
  final_decision: string;
  risk_profile: string;
  confidence_score: number;
  explanation: string;
  facts_detected: string[];
  failures_detected: string[];
  recommended_products: ProductRecommendation[];
  rule_executions: RuleExecution[];
  total_execution_time_ms: number;
  evaluated_at: string;
}

export interface EvaluationSession {
  id: number;
  session_id: string;
  user_id?: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  input_data?: any;
  facts_detected?: string[];
  evaluation_result?: any;
  final_decision: string;
  risk_profile: string;
  recommended_products?: any;
  explanation?: string;
  confidence_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AllEvaluationsResponse {
  evaluations: EvaluationSession[];
  total: number;
}

export interface EngineStats {
  total_evaluations: number;
  completed_evaluations: number;
  failed_evaluations: number;
  success_rate: number;
  average_confidence: number;
}

class InferenceEngineService {
  /**
   * Inicia una evaluación completa del usuario con el sistema experto
   */
  async evaluateUser(
    evaluationData: StartEvaluationRequest
  ): Promise<ApiResponse<EvaluationResult>> {
    console.log('🚀 Iniciando evaluación con motor de inferencia...', evaluationData);
    try {
      const response = await api.post<EvaluationResult>("/inference-engine/evaluate", evaluationData);
      console.log('✅ Respuesta del backend:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en evaluación:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de evaluaciones de un usuario
   */
  async getEvaluationHistory(userId: number): Promise<EvaluationSession[]> {
    console.log(`📊 Obteniendo historial de evaluaciones para usuario ${userId}...`);
    const response = await api.get<EvaluationSession[]>(`/inference-engine/history/${userId}`);
    return response.data || response;
  }

  /**
   * Obtiene estadísticas del motor de inferencia
   */
  async getEngineStats(): Promise<EngineStats> {
    console.log('📈 Obteniendo estadísticas del motor de inferencia...');
    const response = await api.get<EngineStats>("/inference-engine/stats");
    return response;
  }

  /**
   * Obtiene detalles de una sesión de evaluación específica
   */
  async getEvaluationSession(sessionId: string): Promise<ApiResponse<any>> {
    console.log(`🔍 Obteniendo detalles de sesión ${sessionId}...`);
    return await api.get<any>(`/inference-engine/session/${sessionId}`);
  }

  /**
   * Obtiene todas las evaluaciones (para panel administrativo)
   */
  async getAllEvaluations(limit: number = 50, offset: number = 0): Promise<AllEvaluationsResponse> {
    console.log(`📋 Obteniendo todas las evaluaciones (limit: ${limit}, offset: ${offset})...`);
    const response = await api.get<AllEvaluationsResponse>(
      `/inference-engine/evaluations?limit=${limit}&offset=${offset}`
    );
    // Si la respuesta viene envuelta en ApiResponse, extraer data, sino devolver directamente
    return response.data || response;
  }

  /**
   * Valida los datos de entrada antes de enviar al motor de inferencia
   */
  validateInputData(inputData: StartEvaluationRequest['input_data']): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validaciones requeridas
    if (!inputData.age || inputData.age < 0 || inputData.age > 120) {
      errors.push('La edad debe estar entre 0 y 120 años');
    }

    if (!inputData.monthly_income || inputData.monthly_income <= 0) {
      errors.push('Los ingresos mensuales deben ser mayores a 0');
    }

    if (!inputData.credit_score || inputData.credit_score < 0 || inputData.credit_score > 1000) {
      errors.push('El score crediticio debe estar entre 0 y 1000');
    }

    if (!inputData.employment_status || inputData.employment_status.trim() === '') {
      errors.push('El estado laboral es requerido');
    }

    if (!inputData.credit_purpose || inputData.credit_purpose.trim() === '') {
      errors.push('La finalidad del crédito es requerida');
    }

    if (!inputData.requested_amount || inputData.requested_amount <= 0) {
      errors.push('El monto solicitado debe ser mayor a 0');
    }

    // Validaciones opcionales
    if (inputData.debt_to_income_ratio !== undefined && 
        (inputData.debt_to_income_ratio < 0 || inputData.debt_to_income_ratio > 1)) {
      errors.push('La relación deuda/ingreso debe estar entre 0 y 1 (0% y 100%)');
    }

    if (inputData.max_days_delinquency !== undefined && inputData.max_days_delinquency < 0) {
      errors.push('Los días de mora no pueden ser negativos');
    }

    if (inputData.employment_tenure_months !== undefined && inputData.employment_tenure_months < 0) {
      errors.push('La antigüedad laboral no puede ser negativa');
    }

    if (inputData.payment_to_income_ratio !== undefined && 
        (inputData.payment_to_income_ratio < 0 || inputData.payment_to_income_ratio > 1)) {
      errors.push('La relación cuota/ingreso debe estar entre 0 y 1 (0% y 100%)');
    }

    if (inputData.down_payment_percentage !== undefined && 
        (inputData.down_payment_percentage < 0 || inputData.down_payment_percentage > 100)) {
      errors.push('El porcentaje de enganche debe estar entre 0 y 100%');
    }

    if (inputData.co_borrower_income !== undefined && inputData.co_borrower_income < 0) {
      errors.push('Los ingresos del codeudor no pueden ser negativos');
    }

    if (inputData.recent_inquiries !== undefined && inputData.recent_inquiries < 0) {
      errors.push('El número de consultas recientes no puede ser negativo');
    }

    if (inputData.customer_tenure_months !== undefined && inputData.customer_tenure_months < 0) {
      errors.push('La antigüedad como cliente no puede ser negativa');
    }

    if (inputData.historical_compliance !== undefined && 
        (inputData.historical_compliance < 0 || inputData.historical_compliance > 100)) {
      errors.push('El cumplimiento histórico debe estar entre 0 y 100%');
    }

    if (inputData.pension_amount !== undefined && inputData.pension_amount < 0) {
      errors.push('El monto de la pensión no puede ser negativo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea los datos de entrada para el motor de inferencia
   */
  formatInputData(formData: any): StartEvaluationRequest['input_data'] {
    return {
      age: parseInt(formData.age) || 0,
      monthly_income: parseFloat(formData.monthly_income) || 0,
      credit_score: parseInt(formData.credit_score) || 0,
      employment_status: formData.employment_status || '',
      credit_purpose: formData.credit_purpose || '',
      requested_amount: parseFloat(formData.requested_amount) || 0,
      debt_to_income_ratio: formData.debt_to_income_ratio ? parseFloat(formData.debt_to_income_ratio) : undefined,
      max_days_delinquency: formData.max_days_delinquency ? parseInt(formData.max_days_delinquency) : undefined,
      employment_tenure_months: formData.employment_tenure_months ? parseInt(formData.employment_tenure_months) : undefined,
      payment_to_income_ratio: formData.payment_to_income_ratio ? parseFloat(formData.payment_to_income_ratio) : undefined,
      down_payment_percentage: formData.down_payment_percentage ? parseFloat(formData.down_payment_percentage) : undefined,
      has_co_borrower: formData.has_co_borrower === 'true' || formData.has_co_borrower === true,
      co_borrower_income: formData.co_borrower_income ? parseFloat(formData.co_borrower_income) : undefined,
      is_microenterprise: formData.is_microenterprise === 'true' || formData.is_microenterprise === true,
      economic_activity: formData.economic_activity || '',
      is_pep: formData.is_pep === 'true' || formData.is_pep === true,
      pep_committee_approval: formData.pep_committee_approval === 'true' || formData.pep_committee_approval === true,
      recent_inquiries: formData.recent_inquiries ? parseInt(formData.recent_inquiries) : undefined,
      customer_tenure_months: formData.customer_tenure_months ? parseInt(formData.customer_tenure_months) : undefined,
      historical_compliance: formData.historical_compliance ? parseFloat(formData.historical_compliance) : undefined,
      is_convention_employee: formData.is_convention_employee === 'true' || formData.is_convention_employee === true,
      payroll_discount_authorized: formData.payroll_discount_authorized === 'true' || formData.payroll_discount_authorized === true,
      employment_type: formData.employment_type || '',
      pension_amount: formData.pension_amount ? parseFloat(formData.pension_amount) : undefined,
      is_legal_pension: formData.is_legal_pension === 'true' || formData.is_legal_pension === true
    };
  }

  /**
   * Genera un ID de sesión único
   */
  generateSessionId(): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `eval_${timestamp}_${random}`;
  }
}

export const inferenceEngineService = new InferenceEngineService();
