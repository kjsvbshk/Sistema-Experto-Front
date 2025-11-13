import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, CreditCard, Home, Car, Briefcase, Users } from 'lucide-react';
import { 
  inferenceEngineService, 
  type StartEvaluationRequest, 
  type EvaluationResult
} from '../../services/inference-engine.service';
import { useNotification } from '../../contexts/NotificationContext';

interface ExpertSystemEvaluationProps {
  onEvaluationComplete?: (result: EvaluationResult) => void;
}

export const ExpertSystemEvaluation: React.FC<ExpertSystemEvaluationProps> = ({
  onEvaluationComplete
}) => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Función para formatear valores monetarios
  const formatCurrency = (value: number | string | undefined): string => {
    if (!value || value === 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Función para parsear valores monetarios
  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remover símbolos y espacios
    const cleanValue = value.replace(/[$\s.,]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  // Componente helper para labels con tooltip
  const LabelWithTooltip: React.FC<{ 
    htmlFor?: string; 
    text: string; 
    tooltip: string;
    required?: boolean;
  }> = ({ htmlFor, text, tooltip, required = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
      <label 
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
      >
        <span>{text}{required && ' *'}</span>
        <div className="relative inline-block group">
          <HelpCircle 
            className="h-4 w-4 text-gray-400 hover:text-indigo-400 cursor-help transition-colors flex-shrink-0"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            tabIndex={0}
            role="button"
            aria-label="Información de ayuda"
          />
          {showTooltip && (
            <div className="absolute z-50 left-0 bottom-full mb-2 w-72 max-w-[calc(100vw-2rem)] p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-200 leading-relaxed">
              {tooltip}
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </label>
    );
  };

  // Función para determinar créditos recomendados basados en facts detectados
  const getRecommendedCredits = (facts: string[], inputData: any, riskProfile: string) => {
    const recommendations: Array<{
      id: string;
      name: string;
      description: string;
      icon: React.ReactNode;
      maxAmount: number;
      interestRate: number;
      termMonths: number;
      conditions: string[];
      eligibility: number; // 0-100
      color: string;
    }> = [];

    const smmlv = 1300000;
    const monthlyIncome = inputData.monthly_income || 0;
    const creditPurpose = inputData.credit_purpose || '';

    // Crédito Hipotecario
    if (facts.includes('FACT_FINALIDAD_VIVIENDA') || creditPurpose === 'vivienda') {
      const hasLowRisk = facts.includes('FACT_PERFIL_RIESGO_BAJO') || riskProfile.includes('BAJO');
      const hasMediumRisk = facts.includes('FACT_PERFIL_RIESGO_MEDIO') || riskProfile.includes('MEDIO');
      const hasIncome4 = facts.includes('FACT_INGRESOS_MIN_4_SMMLV');
      const hasIncome3 = facts.includes('FACT_INGRESOS_MIN_3_SMMLV');
      const hasIncome2 = facts.includes('FACT_INGRESOS_MIN_2_SMMLV');
      const hasPayment30 = facts.includes('FACT_CUOTA_MAX_30_INGRESOS');
      const hasPayment40 = facts.includes('FACT_CUOTA_MAX_40_INGRESOS');
      const hasCodeudor = facts.includes('FACT_INGRESOS_CODEUDOR_2_SMMLV') || inputData.co_borrower_income >= 2 * smmlv;
      
      let eligibility = 0;
      let conditions: string[] = [];
      
      if (hasLowRisk && hasIncome4 && hasPayment30) {
        eligibility = 95;
        conditions = ['Enganche mínimo 20%', 'Seguro de vida obligatorio'];
      } else if (hasIncome4 && hasPayment30) {
        eligibility = 80;
        conditions = ['Enganche mínimo 20%', 'Seguro de vida obligatorio', 'Tasa preferencial'];
      } else if (hasIncome3 && hasPayment40) {
        eligibility = 70;
        conditions = ['Enganche mínimo 30%', 'Seguro de vida obligatorio', 'Tasa estándar'];
      } else if (hasIncome2 && hasCodeudor) {
        eligibility = 65;
        conditions = ['Enganche mínimo 30%', 'Codeudor requerido', 'Seguro de vida obligatorio'];
      } else if (monthlyIncome >= 2 * smmlv) {
        eligibility = 50;
        conditions = ['Enganche mínimo 30%', 'Codeudor recomendado', 'Tasa preferencial'];
      } else {
        eligibility = 35;
        conditions = ['Enganche mínimo 40%', 'Codeudor obligatorio', 'Revisión especial'];
      }

      // Ajustar tasa según riesgo
      let interestRate = 2.0;
      if (hasLowRisk) interestRate = 1.2;
      else if (hasMediumRisk) interestRate = 1.5;
      else if (riskProfile.includes('ALTO')) interestRate = 2.5;

      recommendations.push({
        id: 'hipotecario',
        name: 'Crédito Hipotecario',
        description: 'Para adquisición de vivienda',
        icon: <Home className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 15, 200000000),
        interestRate,
        termMonths: 240,
        conditions,
        eligibility,
        color: 'blue'
      });
    }

    // Crédito Vehículo
    if (facts.includes('FACT_FINALIDAD_VEHICULO') || creditPurpose === 'vehiculo') {
      const hasLowRisk = facts.includes('FACT_PERFIL_RIESGO_BAJO') || riskProfile.includes('BAJO');
      const hasMediumRisk = facts.includes('FACT_PERFIL_RIESGO_MEDIO') || riskProfile.includes('MEDIO');
      const hasIncome3 = facts.includes('FACT_INGRESOS_MIN_3_SMMLV');
      const hasIncome2 = facts.includes('FACT_INGRESOS_MIN_2_SMMLV');
      const hasPayment40 = facts.includes('FACT_CUOTA_MAX_40_INGRESOS');
      const hasPayment30 = facts.includes('FACT_CUOTA_MAX_30_INGRESOS');
      const hasDownPayment = facts.includes('FACT_PORCENTAJE_INICIAL_30');
      const hasCodeudor = facts.includes('FACT_INGRESOS_CODEUDOR_2_SMMLV') || inputData.co_borrower_income >= 2 * smmlv;
      
      let eligibility = 0;
      let conditions: string[] = [];
      
      if (hasLowRisk && hasIncome3 && hasPayment40) {
        eligibility = 90;
        conditions = ['Seguro vehicular obligatorio', 'Hipoteca sobre el vehículo'];
      } else if (hasIncome3 && hasDownPayment) {
        eligibility = 75;
        conditions = ['Enganche mínimo 30%', 'Seguro vehicular obligatorio', 'Hipoteca sobre el vehículo'];
      } else if (hasIncome3 && hasPayment40) {
        eligibility = 70;
        conditions = ['Enganche recomendado 30%', 'Seguro vehicular obligatorio'];
      } else if (hasIncome2 && hasCodeudor) {
        eligibility = 65;
        conditions = ['Codeudor requerido', 'Enganche mínimo 30%', 'Seguro vehicular obligatorio'];
      } else if (monthlyIncome >= 2 * smmlv) {
        eligibility = 50;
        conditions = ['Enganche mínimo 30%', 'Codeudor recomendado', 'Tasa preferencial'];
      } else {
        eligibility = 35;
        conditions = ['Enganche mínimo 40%', 'Codeudor obligatorio', 'Revisión especial'];
      }

      // Ajustar tasa según riesgo
      let interestRate = 1.8;
      if (hasLowRisk) interestRate = 1.0;
      else if (hasMediumRisk) interestRate = 1.2;
      else if (riskProfile.includes('ALTO')) interestRate = 2.2;

      recommendations.push({
        id: 'vehiculo',
        name: 'Crédito Vehículo',
        description: 'Para adquisición de vehículo',
        icon: <Car className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 10, 80000000),
        interestRate,
        termMonths: 60,
        conditions,
        eligibility,
        color: 'green'
      });
    }

    // Crédito Libre Inversión
    const hasIncome3 = facts.includes('FACT_INGRESOS_MIN_3_SMMLV');
    const hasEmployment12 = facts.includes('FACT_ANTIGUEDAD_LABORAL_12_MESES');
    
    if (hasIncome3 && hasEmployment12) {
      let eligibility = 85;
      if (facts.includes('FACT_PERFIL_RIESGO_BAJO')) eligibility = 95;
      else if (riskProfile.includes('MEDIO')) eligibility = 75;
      else eligibility = 60;

      recommendations.push({
        id: 'libre_inversion',
        name: 'Crédito Libre Inversión',
        description: 'Para gastos personales y proyectos',
        icon: <Briefcase className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 15, 50000000),
        interestRate: riskProfile.includes('BAJO') ? 1.8 : riskProfile.includes('MEDIO') ? 2.2 : 2.8,
        termMonths: 60,
        conditions: ['Antigüedad laboral mínima 12 meses'],
        eligibility,
        color: 'purple'
      });
    }

    // Crédito con Codeudor
    if (facts.includes('FACT_INGRESOS_CODEUDOR_2_SMMLV') || inputData.co_borrower_income >= 2 * smmlv) {
      recommendations.push({
        id: 'codeudor',
        name: 'Crédito con Codeudor',
        description: 'Con codeudor solidario',
        icon: <Users className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 12, 30000000),
        interestRate: 2.0,
        termMonths: 48,
        conditions: ['Codeudor con ingresos mínimos 2 SMMLV', 'Evaluación conjunta'],
        eligibility: 80,
        color: 'orange'
      });
    }

    // Tarjeta de Crédito
    if (facts.includes('FACT_INGRESOS_MIN_2_SMMLV')) {
      let eligibility = 70;
      if (facts.includes('FACT_PERFIL_RIESGO_BAJO')) eligibility = 92;
      else if (riskProfile.includes('MEDIO')) eligibility = 75;

      recommendations.push({
        id: 'tarjeta',
        name: 'Tarjeta de Crédito',
        description: 'Cupo de crédito aprobado',
        icon: <CreditCard className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 3, 15000000),
        interestRate: 2.8,
        termMonths: 0, // Revolving
        conditions: ['Cupo inicial según perfil', 'Seguro de protección'],
        eligibility,
        color: 'pink'
      });
    }

    // Crédito de Nómina
    if (inputData.is_convention_employee && inputData.payroll_discount_authorized) {
      recommendations.push({
        id: 'nomina',
        name: 'Crédito de Nómina',
        description: 'Con descuento automático por nómina',
        icon: <DollarSign className="h-6 w-6" />,
        maxAmount: Math.min(monthlyIncome * 8, 40000000),
        interestRate: 1.5,
        termMonths: 36,
        conditions: ['Descuento automático por nómina', 'Tasa preferencial'],
        eligibility: 95,
        color: 'teal'
      });
    }

    // Microcrédito
    if (inputData.is_microenterprise) {
      recommendations.push({
        id: 'microcredito',
        name: 'Microcrédito',
        description: 'Para microempresarios',
        icon: <TrendingUp className="h-6 w-6" />,
        maxAmount: 25000000,
        interestRate: 2.5,
        termMonths: 36,
        conditions: ['Actividad microempresarial comprobada', 'Capacitación financiera'],
        eligibility: 75,
        color: 'yellow'
      });
    }

    // Si no hay recomendaciones específicas, sugerir según perfil de riesgo general
    if (recommendations.length === 0) {
      // Crédito Libre Inversión (siempre disponible si cumple requisitos básicos)
      if (monthlyIncome >= 2 * smmlv && facts.includes('FACT_ANTIGUEDAD_LABORAL_MINIMA')) {
        let eligibility = 60;
        if (riskProfile.includes('BAJO')) eligibility = 85;
        else if (riskProfile.includes('MEDIO')) eligibility = 70;

        recommendations.push({
          id: 'libre_inversion',
          name: 'Crédito Libre Inversión',
          description: 'Para gastos personales y proyectos',
          icon: <Briefcase className="h-6 w-6" />,
          maxAmount: Math.min(monthlyIncome * 12, 40000000),
          interestRate: riskProfile.includes('BAJO') ? 1.8 : riskProfile.includes('MEDIO') ? 2.2 : 2.8,
          termMonths: 60,
          conditions: ['Antigüedad laboral mínima 6 meses'],
          eligibility,
          color: 'purple'
        });
      }

      // Tarjeta de Crédito (siempre disponible si cumple requisitos básicos)
      if (monthlyIncome >= 2 * smmlv) {
        let eligibility = 65;
        if (riskProfile.includes('BAJO')) eligibility = 90;
        else if (riskProfile.includes('MEDIO')) eligibility = 75;

        recommendations.push({
          id: 'tarjeta',
          name: 'Tarjeta de Crédito',
          description: 'Cupo de crédito aprobado',
          icon: <CreditCard className="h-6 w-6" />,
          maxAmount: Math.min(monthlyIncome * 3, 15000000),
          interestRate: 2.8,
          termMonths: 0,
          conditions: ['Cupo inicial según perfil', 'Seguro de protección'],
          eligibility,
          color: 'pink'
        });
      }
    }

    // Ordenar por elegibilidad (mayor a menor)
    return recommendations.sort((a, b) => b.eligibility - a.eligibility);
  };

  // Función para formatear moneda
  const formatCurrencyDisplay = (value: number): string => {
    if (!value || value === 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para obtener color según decisión
  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APROBADO':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'CONDICIONADO':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'RECHAZADO':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PENDIENTE':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Función para obtener icono según decisión
  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APROBADO':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'CONDICIONADO':
        return <AlertCircle className="h-8 w-8 text-yellow-400" />;
      case 'RECHAZADO':
        return <XCircle className="h-8 w-8 text-red-400" />;
      case 'PENDIENTE':
        return <AlertCircle className="h-8 w-8 text-blue-400" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-400" />;
    }
  };

  // Función para humanizar mensajes de falla
  const humanizeFailureMessage = (failure: string): string => {
    const failureMap: { [key: string]: string } = {
      'FALLA_EDAD_FUERA_RANGO': 'Edad fuera del rango permitido (18-75 años)',
      'FALLA_INGRESOS_INSUFICIENTES': 'Ingresos insuficientes, mínimo requerido 1 SMMLV',
      'FALLA_SCORE_INSUFICIENTE': 'Score crediticio insuficiente, mínimo requerido 300 puntos',
      'FALLA_ENDEUDAMIENTO_EXCESIVO': 'Nivel de endeudamiento excesivo, máximo permitido 50%',
      'FALLA_MORA_RECIENTE_SIGNIFICATIVA': 'Mora reciente significativa superior a 90 días',
      'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT': 'Actividad económica de alto riesgo LA/FT',
      'FALLA_PEP_SIN_APROBACION': 'Requiere aprobación de comité especial para PEP',
      'FALLA_MULTIPLES_CONSULTAS': 'Múltiples consultas simultáneas detectadas',
      'FALLA_DOCUMENTOS_INCOMPLETOS': 'Documentación incompleta o inválida',
      'FALLA_REFERENCIAS_NEGATIVAS': 'Referencias comerciales negativas',
      'FALLA_GARANTIAS_INSUFICIENTES': 'Garantías insuficientes o no avaluadas',
      'FALLA_HISTORIAL_CREDITICIO_NEGATIVO': 'Historial crediticio negativo',
      'FALLA_CAPACIDAD_PAGO_INSUFICIENTE': 'Capacidad de pago insuficiente',
      'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE': 'Estabilidad laboral insuficiente'
    };
    
    return failureMap[failure] || failure.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para obtener recomendaciones basadas en fallas
  const getRecommendationForFailure = (failure: string): string => {
    const recommendationMap: { [key: string]: string } = {
      'FALLA_EDAD_FUERA_RANGO': 'Verifique que su edad esté entre 18 y 75 años',
      'FALLA_INGRESOS_INSUFICIENTES': 'Aumente sus ingresos mensuales a al menos $1.300.000 (1 SMMLV)',
      'FALLA_SCORE_INSUFICIENTE': 'Mejore su historial crediticio para alcanzar al menos 300 puntos',
      'FALLA_ENDEUDAMIENTO_EXCESIVO': 'Reduzca sus obligaciones mensuales a máximo 50% de sus ingresos',
      'FALLA_MORA_RECIENTE_SIGNIFICATIVA': 'Regularice sus pagos pendientes y evite moras superiores a 90 días',
      'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT': 'Considere cambiar a una actividad económica de menor riesgo',
      'FALLA_PEP_SIN_APROBACION': 'Obtenga la aprobación del comité especial para personas políticamente expuestas',
      'FALLA_MULTIPLES_CONSULTAS': 'Espere al menos 90 días antes de realizar nuevas consultas crediticias',
      'FALLA_DOCUMENTOS_INCOMPLETOS': 'Complete toda la documentación requerida y verifique su validez',
      'FALLA_REFERENCIAS_NEGATIVAS': 'Mejore sus referencias comerciales y mantenga un buen historial',
      'FALLA_GARANTIAS_INSUFICIENTES': 'Proporcione garantías adicionales o mejore las existentes',
      'FALLA_HISTORIAL_CREDITICIO_NEGATIVO': 'Regularice su historial crediticio y mantenga pagos puntuales',
      'FALLA_CAPACIDAD_PAGO_INSUFICIENTE': 'Aumente sus ingresos o reduzca sus gastos para mejorar su capacidad de pago',
      'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE': 'Mantenga estabilidad laboral por al menos 12 meses consecutivos'
    };
    
    return recommendationMap[failure] || 'Consulte con un asesor financiero para mejorar su perfil crediticio';
  };

  // Función para validar campos según reglas del sistema
  const validateField = (field: string, value: any): { isValid: boolean; message: string } => {
    switch (field) {
      case 'age':
        if (value < 18 || value > 75) {
          return { isValid: false, message: 'La edad debe estar entre 18 y 75 años' };
        }
        break;
      
      case 'monthly_income':
        if (value < 1300000) { // 1 SMMLV
          return { isValid: false, message: 'Los ingresos deben ser al menos $1.300.000 (1 SMMLV)' };
        }
        break;
      
      case 'credit_score':
        if (value < 300) {
          return { isValid: false, message: 'El score crediticio debe ser al menos 300 puntos' };
        }
        if (value > 1000) {
          return { isValid: false, message: 'El score crediticio no puede ser mayor a 1000 puntos' };
        }
        break;
      
      case 'debt_to_income_ratio':
        if (value > 50) {
          return { isValid: false, message: 'El endeudamiento no puede ser mayor al 50% de los ingresos' };
        }
        break;
      
      case 'max_days_delinquency':
        if (value > 90) {
          return { isValid: false, message: 'Los días de mora no pueden ser mayores a 90 días' };
        }
        break;
      
      case 'recent_inquiries':
        if (value > 3) {
          return { isValid: false, message: 'No puede tener más de 3 consultas en los últimos 30 días' };
        }
        break;
      
      case 'down_payment_percentage':
        if (value > 100) {
          return { isValid: false, message: 'El porcentaje de enganche no puede ser mayor al 100%' };
        }
        break;
      
      case 'payment_to_income_ratio':
        if (value > 100) {
          return { isValid: false, message: 'La relación cuota/ingreso no puede ser mayor al 100%' };
        }
        break;
      
      case 'historical_compliance':
        if (value > 100) {
          return { isValid: false, message: 'El cumplimiento histórico no puede ser mayor al 100%' };
        }
        break;
    }
    
    return { isValid: true, message: '' };
  };
  const [formData, setFormData] = useState<StartEvaluationRequest['input_data']>({
    age: 0,
    monthly_income: 0,
    credit_score: 0,
    employment_status: '',
    credit_purpose: '',
    requested_amount: 0,
    debt_to_income_ratio: 0,
    max_days_delinquency: 0,
    employment_tenure_months: 0,
    payment_to_income_ratio: 0,
    economic_activity: '',
    is_pep: false,
    pep_committee_approval: false,
    recent_inquiries: 0,
    // Campos adicionales para completar validaciones
    co_borrower_income: 0,
    is_microenterprise: false,
    customer_tenure_months: 0,
    historical_compliance: 0,
    is_convention_employee: false,
    payroll_discount_authorized: false,
    employment_type: '',
    pension_amount: 0,
    is_legal_pension: false,
    down_payment_percentage: 0
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof StartEvaluationRequest['input_data'], value: any) => {
    // Validar el campo
    const validation = validateField(field, value);
    
    // Actualizar errores
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.message
    }));
    
    // Actualizar datos del formulario
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      showError('Todos los campos son obligatorios para continuar');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.age > 0 && formData.monthly_income > 0 && formData.credit_score > 0 && formData.employment_status);
      case 2:
        return !!(formData.credit_purpose && formData.requested_amount > 0);
      case 3:
      case 4:
        return true;
    }
    return true;
  };

  const canProceed = validateCurrentStep();

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      showError('Todos los campos son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      // Limpiar valores por defecto antes de enviar
      // Solo excluir undefined, null y strings vacíos (0 puede ser un valor válido)
      const cleanedFormData: StartEvaluationRequest['input_data'] = {
        age: formData.age,
        monthly_income: formData.monthly_income,
        credit_score: formData.credit_score,
        employment_status: formData.employment_status,
        credit_purpose: formData.credit_purpose,
        requested_amount: formData.requested_amount,
        // Solo incluir campos opcionales si tienen valores válidos (no undefined, null o string vacío)
        ...(formData.debt_to_income_ratio !== undefined && formData.debt_to_income_ratio !== null ? { debt_to_income_ratio: formData.debt_to_income_ratio } : {}),
        ...(formData.max_days_delinquency !== undefined && formData.max_days_delinquency !== null ? { max_days_delinquency: formData.max_days_delinquency } : {}),
        ...(formData.employment_tenure_months !== undefined && formData.employment_tenure_months !== null ? { employment_tenure_months: formData.employment_tenure_months } : {}),
        ...(formData.payment_to_income_ratio !== undefined && formData.payment_to_income_ratio !== null ? { payment_to_income_ratio: formData.payment_to_income_ratio } : {}),
        ...(formData.down_payment_percentage !== undefined && formData.down_payment_percentage !== null ? { down_payment_percentage: formData.down_payment_percentage } : {}),
        ...(formData.has_co_borrower !== undefined && formData.has_co_borrower !== null ? { has_co_borrower: formData.has_co_borrower } : {}),
        ...(formData.co_borrower_income !== undefined && formData.co_borrower_income !== null ? { co_borrower_income: formData.co_borrower_income } : {}),
        ...(formData.is_microenterprise !== undefined && formData.is_microenterprise !== null ? { is_microenterprise: formData.is_microenterprise } : {}),
        ...(formData.economic_activity && formData.economic_activity.trim() !== '' ? { economic_activity: formData.economic_activity } : {}),
        ...(formData.is_pep !== undefined && formData.is_pep !== null ? { is_pep: formData.is_pep } : {}),
        ...(formData.pep_committee_approval !== undefined && formData.pep_committee_approval !== null ? { pep_committee_approval: formData.pep_committee_approval } : {}),
        ...(formData.recent_inquiries !== undefined && formData.recent_inquiries !== null ? { recent_inquiries: formData.recent_inquiries } : {}),
        ...(formData.customer_tenure_months !== undefined && formData.customer_tenure_months !== null ? { customer_tenure_months: formData.customer_tenure_months } : {}),
        ...(formData.historical_compliance !== undefined && formData.historical_compliance !== null ? { historical_compliance: formData.historical_compliance } : {}),
        ...(formData.is_convention_employee !== undefined && formData.is_convention_employee !== null ? { is_convention_employee: formData.is_convention_employee } : {}),
        ...(formData.payroll_discount_authorized !== undefined && formData.payroll_discount_authorized !== null ? { payroll_discount_authorized: formData.payroll_discount_authorized } : {}),
        ...(formData.employment_type && formData.employment_type.trim() !== '' ? { employment_type: formData.employment_type } : {}),
        ...(formData.pension_amount !== undefined && formData.pension_amount !== null ? { pension_amount: formData.pension_amount } : {}),
        ...(formData.is_legal_pension !== undefined && formData.is_legal_pension !== null ? { is_legal_pension: formData.is_legal_pension } : {}),
      };

      const evaluationRequest: StartEvaluationRequest = {
        input_data: cleanedFormData,
        session_id: inferenceEngineService.generateSessionId()
      };

      console.log('📤 Enviando datos de evaluación:', JSON.stringify(evaluationRequest, null, 2));

      const response = await inferenceEngineService.evaluateUser(evaluationRequest);
      
      if (response && (response as any).session_id) {
        const result = response as any;
        setEvaluationResult(result);
        showSuccess(`✅ Evaluación completada exitosamente!`);
        
        if (onEvaluationComplete) {
          onEvaluationComplete(result);
        }
      } else {
        showError('❌ Error en la evaluación del sistema experto');
      }
    } catch (error) {
      console.error('❌ Error en evaluación:', error);
      showError('❌ Error al procesar la evaluación');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Información Personal y Financiera</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            htmlFor="age"
            text="Edad"
            tooltip="Ingrese su edad actual. Debe estar entre 18 y 75 años para ser elegible para créditos."
            required
          />
          <input
            type="number"
            min="18"
            max="75"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
               <div className="text-sm text-gray-400">
                 Ejemplo: 35 (edad entre 18 y 75 años)
               </div>
               {fieldErrors.age && (
                 <div className="text-sm text-red-400 mt-1">
                   {fieldErrors.age}
                 </div>
               )}
        </div>

             <div>
               <LabelWithTooltip
                 htmlFor="monthly_income"
                 text="Ingresos Mensuales Netos"
                 tooltip="Ingrese sus ingresos mensuales netos (después de descuentos). El mínimo requerido es 1 SMMLV ($1.300.000). Incluya salario, honorarios, rentas u otros ingresos regulares."
                 required
               />
               <input
                 type="text"
                 value={formatCurrency(formData.monthly_income)}
                 onChange={(e) => handleInputChange('monthly_income', parseCurrency(e.target.value))}
                 className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                 placeholder="Ingrese un valor"
               />
               <div className="text-sm text-gray-400">
                 Ejemplo: $4.000.000 (mínimo 1 SMMLV = $1.300.000)
               </div>
               {fieldErrors.monthly_income && (
                 <div className="text-sm text-red-400 mt-1">
                   {fieldErrors.monthly_income}
                 </div>
               )}
             </div>

        <div>
          <LabelWithTooltip
            htmlFor="credit_score"
            text="Score Crediticio"
            tooltip="Ingrese su puntaje crediticio (score). Este valor va de 300 a 1,000 puntos. Puede consultarlo en centrales de riesgo como Datacrédito o TransUnion. El mínimo requerido es 300 puntos."
            required
          />
          <input
            type="number"
            min="0"
            max="1000"
            value={formData.credit_score || ''}
            onChange={(e) => handleInputChange('credit_score', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
               <div className="text-sm text-gray-400">
                 Ejemplo: 750 (score entre 300 y 1,000 puntos)
               </div>
               {fieldErrors.credit_score && (
                 <div className="text-sm text-red-400 mt-1">
                   {fieldErrors.credit_score}
                 </div>
               )}
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="employment_status"
            text="Estado Laboral"
            tooltip="Seleccione su situación laboral actual: Empleado (tiene contrato laboral), Independiente (trabaja por cuenta propia), Pensionado (recibe pensión) o Desempleado."
            required
          />
          <select
            value={formData.employment_status}
            onChange={(e) => handleInputChange('employment_status', e.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="">Seleccione...</option>
            <option value="employed">Empleado</option>
            <option value="independent">Independiente</option>
            <option value="pensioned">Pensionado</option>
            <option value="unemployed">Desempleado</option>
          </select>
               <div className="text-sm text-gray-400">
                 Ejemplo: Empleado (estado laboral actual)
               </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Información del Crédito</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            htmlFor="credit_purpose"
            text="Finalidad del Crédito"
            tooltip="Seleccione para qué necesita el crédito: Vivienda (compra o construcción), Vehículo (compra de automotor), Libre Inversión (uso general), Educación (estudios) o Negocio (capital de trabajo)."
            required
          />
          <select
            value={formData.credit_purpose}
            onChange={(e) => handleInputChange('credit_purpose', e.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="">Seleccione...</option>
            <option value="vivienda">Vivienda</option>
            <option value="vehiculo">Vehículo</option>
            <option value="libre_inversion">Libre Inversión</option>
            <option value="educacion">Educación</option>
            <option value="negocio">Negocio</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="requested_amount"
            text="Monto Solicitado"
            tooltip="Ingrese el monto total que desea solicitar en pesos colombianos. Este valor será evaluado según su capacidad de pago y el propósito del crédito."
            required
          />
          <input
            type="text"
            value={formatCurrency(formData.requested_amount)}
            onChange={(e) => handleInputChange('requested_amount', parseCurrency(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
          <div className="text-sm text-gray-400">
            Ejemplo: $50.000.000 (monto que desea solicitar)
          </div>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="down_payment_percentage"
            text="Porcentaje de Enganche (%)"
            tooltip="Ingrese el porcentaje del valor total que pagará como enganche o cuota inicial. Por ejemplo, si el bien cuesta $100.000.000 y pagará $30.000.000 de enganche, ingrese 30. Un mayor enganche puede mejorar las condiciones del crédito."
          />
          <input
            type="number"
            min="0"
            max="100"
            value={formData.down_payment_percentage || ''}
            onChange={(e) => handleInputChange('down_payment_percentage', parseFloat(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
          <div className="text-sm text-gray-400">
            Ejemplo: 30% (porcentaje de enganche inicial)
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Información Laboral y Adicional</h3>
      <p className="text-gray-300">Esta información es opcional pero puede mejorar la evaluación.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            htmlFor="debt_to_income_ratio"
            text="Relación Deuda/Ingreso (%)"
            tooltip="Ingrese el porcentaje que representa el total de sus deudas mensuales sobre sus ingresos. Por ejemplo, si gana $5.000.000 y paga $2.000.000 en deudas, ingrese 40. El máximo recomendado es 50%."
          />
          <input
            type="number"
            min="0"
            max="100"
            value={formData.debt_to_income_ratio || ''}
            onChange={(e) => handleInputChange('debt_to_income_ratio', parseFloat(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="max_days_delinquency"
            text="Días Máximos de Mora"
            tooltip="Ingrese el número máximo de días de mora que ha tenido en los últimos 12 meses. Si nunca ha estado en mora, ingrese 0. Valores superiores a 90 días pueden afectar negativamente la evaluación."
          />
          <input
            type="number"
            min="0"
            value={formData.max_days_delinquency || ''}
            onChange={(e) => handleInputChange('max_days_delinquency', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="employment_type"
            text="Tipo de Vinculación"
            tooltip="Seleccione su tipo de vinculación laboral: Empleado (contrato laboral), Independiente (trabaja por cuenta propia), Pensionado (recibe pensión) o Desempleado (sin empleo actual)."
          />
          <select
            value={formData.employment_type}
            onChange={(e) => handleInputChange('employment_type', e.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="">Seleccione...</option>
            <option value="empleado">Empleado</option>
            <option value="independiente">Independiente</option>
            <option value="pensionado">Pensionado</option>
            <option value="desempleado">Desempleado</option>
          </select>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="is_microenterprise"
            text="¿Actividad Microempresarial?"
            tooltip="Seleccione 'Sí' si su actividad económica corresponde a una microempresa según la clasificación del Ministerio de Comercio (hasta 10 empleados y activos hasta 500 SMMLV)."
          />
          <select
            value={formData.is_microenterprise ? 'true' : 'false'}
            onChange={(e) => handleInputChange('is_microenterprise', e.target.value === 'true')}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Información Adicional y Validaciones Normativas</h3>
      <p className="text-gray-300">Información adicional y validaciones requeridas por normativa.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            htmlFor="employment_tenure_months"
            text="Antigüedad Laboral (meses)"
            tooltip="Ingrese cuántos meses lleva trabajando en su empleo actual o como independiente. Una mayor antigüedad laboral indica estabilidad y puede mejorar la evaluación. Mínimo recomendado: 6 meses."
          />
          <input
            type="number"
            min="0"
            value={formData.employment_tenure_months || ''}
            onChange={(e) => handleInputChange('employment_tenure_months', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="payment_to_income_ratio"
            text="Relación Cuota/Ingreso (%)"
            tooltip="Ingrese el porcentaje que representará la cuota mensual del crédito sobre sus ingresos. Por ejemplo, si gana $5.000.000 y la cuota será $1.500.000, ingrese 30. Se recomienda que no supere el 40%."
          />
          <input
            type="number"
            min="0"
            max="100"
            value={formData.payment_to_income_ratio || ''}
            onChange={(e) => handleInputChange('payment_to_income_ratio', parseFloat(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="economic_activity"
            text="Actividad Económica (SARLAFT)"
            tooltip="Seleccione su actividad económica principal según el código CIIU. Algunas actividades como juegos de azar, casinos, casas de cambio y remesas son consideradas de alto riesgo según SARLAFT (Sistema de Administración de Riesgo de Lavado de Activos y Financiación del Terrorismo)."
          />
          <select
            value={formData.economic_activity}
            onChange={(e) => handleInputChange('economic_activity', e.target.value)}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="">Seleccione...</option>
            <option value="comercio">Comercio</option>
            <option value="servicios">Servicios</option>
            <option value="manufactura">Manufactura</option>
            <option value="agricultura">Agricultura</option>
            <option value="tecnologia">Tecnología</option>
            <option value="juegos">Juegos de Azar</option>
            <option value="casinos">Casinos</option>
            <option value="cambios">Casas de Cambio</option>
            <option value="remesas">Remesas</option>
          </select>
          <div className="text-sm text-gray-400">
            Actividades marcadas son de alto riesgo SARLAFT
          </div>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="is_pep"
            text="¿Es Persona Políticamente Expuesta (PEP)?"
            tooltip="Seleccione 'Sí' si es una Persona Políticamente Expuesta (PEP), es decir, si ocupa o ha ocupado cargos públicos de alto nivel, es familiar directo o asociado cercano de un PEP. Esto requiere aprobación del comité PEP."
          />
          <select
            value={formData.is_pep ? 'true' : 'false'}
            onChange={(e) => handleInputChange('is_pep', e.target.value === 'true')}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        {formData.is_pep && (
          <div>
            <LabelWithTooltip
              htmlFor="pep_committee_approval"
              text="¿Tiene Aprobación del Comité PEP?"
              tooltip="Si es PEP, seleccione 'Sí' si ya cuenta con la aprobación del comité de Personas Políticamente Expuestas de la entidad. Esta aprobación es necesaria para procesar su solicitud."
            />
            <select
              value={formData.pep_committee_approval ? 'true' : 'false'}
              onChange={(e) => handleInputChange('pep_committee_approval', e.target.value === 'true')}
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        )}

        <div>
          <LabelWithTooltip
            htmlFor="recent_inquiries"
            text="Consultas en Últimos 30 Días"
            tooltip="Ingrese el número de consultas crediticias que se han realizado sobre su historial crediticio en los últimos 30 días. Múltiples consultas (más de 3) pueden indicar necesidad financiera y afectar la evaluación."
          />
          <input
            type="number"
            min="0"
            value={formData.recent_inquiries || ''}
            onChange={(e) => handleInputChange('recent_inquiries', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
          <div className="text-sm text-gray-400">
            Ejemplo: 2 (consultas en últimos 30 días, máximo 3)
          </div>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="co_borrower_income"
            text="Ingresos del Codeudor"
            tooltip="Si tiene codeudor, ingrese los ingresos mensuales netos del codeudor. Un codeudor con ingresos suficientes (mínimo 2 SMMLV) puede mejorar las condiciones del crédito y aumentar la probabilidad de aprobación."
          />
          <input
            type="text"
            value={formatCurrency(formData.co_borrower_income)}
            onChange={(e) => handleInputChange('co_borrower_income', parseCurrency(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
          <div className="text-sm text-gray-400">
            Ejemplo: $3.000.000 (ingresos mensuales del codeudor)
          </div>
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="customer_tenure_months"
            text="Antigüedad como Cliente (meses)"
            tooltip="Ingrese cuántos meses lleva siendo cliente de esta entidad financiera. Una mayor antigüedad como cliente puede otorgar beneficios y mejores condiciones crediticias."
          />
          <input
            type="number"
            min="0"
            value={formData.customer_tenure_months || ''}
            onChange={(e) => handleInputChange('customer_tenure_months', parseInt(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="historical_compliance"
            text="Cumplimiento Histórico (%)"
            tooltip="Ingrese el porcentaje de cumplimiento histórico de pago de sus obligaciones crediticias. Por ejemplo, si ha pagado 95 de 100 cuotas a tiempo, ingrese 95. Un cumplimiento superior al 95% es muy favorable."
          />
          <input
            type="number"
            min="0"
            max="100"
            value={formData.historical_compliance || ''}
            onChange={(e) => handleInputChange('historical_compliance', parseFloat(e.target.value))}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="Ingrese un valor"
          />
        </div>

        <div>
          <LabelWithTooltip
            htmlFor="is_convention_employee"
            text="¿Empleado Empresa Convenio?"
            tooltip="Seleccione 'Sí' si trabaja para una empresa que tiene un convenio con esta entidad financiera. Los empleados de empresas convenio pueden acceder a condiciones preferenciales y descuento por nómina."
          />
          <select
            value={formData.is_convention_employee ? 'true' : 'false'}
            onChange={(e) => handleInputChange('is_convention_employee', e.target.value === 'true')}
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        {formData.is_convention_employee && (
          <div>
            <LabelWithTooltip
              htmlFor="payroll_discount_authorized"
              text="¿Descuento Nómina Autorizado?"
              tooltip="Si es empleado de empresa convenio, seleccione 'Sí' si ha autorizado el descuento de la cuota del crédito directamente de su nómina. Esto puede mejorar las condiciones y facilitar el pago."
            />
            <select
              value={formData.payroll_discount_authorized ? 'true' : 'false'}
              onChange={(e) => handleInputChange('payroll_discount_authorized', e.target.value === 'true')}
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        )}

        {formData.employment_type === 'pensionado' && (
          <>
            <div>
              <LabelWithTooltip
                htmlFor="pension_amount"
                text="Monto de Pensión"
                tooltip="Si es pensionado, ingrese el monto mensual de su pensión en pesos colombianos. Una pensión de al menos 2 SMMLV puede mejorar las condiciones del crédito."
              />
              <input
                type="text"
                value={formatCurrency(formData.pension_amount)}
                onChange={(e) => handleInputChange('pension_amount', parseCurrency(e.target.value))}
                className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                placeholder="Ingrese un valor"
              />
              <div className="text-sm text-gray-400">
                Ejemplo: $2.500.000 (monto mensual de pensión)
              </div>
            </div>

            <div>
              <LabelWithTooltip
                htmlFor="is_legal_pension"
                text="¿Pensión Legal?"
                tooltip="Seleccione 'Sí' si su pensión es legal, es decir, si proviene del sistema de seguridad social (Colpensiones o AFP) y cumple con los requisitos legales. Las pensiones legales son más estables y confiables."
              />
              <select
                value={formData.is_legal_pension ? 'true' : 'false'}
                onChange={(e) => handleInputChange('is_legal_pension', e.target.value === 'true')}
                className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderEvaluationResult = () => {
    if (!evaluationResult) return null;

    const recommendedCredits = getRecommendedCredits(
      evaluationResult.facts_detected || [],
      formData,
      evaluationResult.risk_profile || ''
    );

    return (
      <div className="space-y-6">
        {/* Título Principal */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Resultado de la Evaluación</h2>
          <p className="text-gray-400 text-lg">Análisis crediticio completado</p>
        </div>

        {/* Tarjeta de Decisión Principal */}
        <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 ${getDecisionColor(evaluationResult.final_decision)}`}>
          <div className="flex items-center justify-center mb-6">
            {getDecisionIcon(evaluationResult.final_decision)}
          </div>
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-white mb-2">{evaluationResult.final_decision}</h3>
            <p className="text-gray-300 text-lg">{evaluationResult.explanation}</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-2">
                {evaluationResult.risk_profile?.replace('RIESGO_', '') || 'NO_DETERMINADO'}
              </div>
              <div className="text-gray-300">Perfil de Riesgo</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {evaluationResult.confidence_score?.toFixed(1)}%
              </div>
              <div className="text-gray-300">Nivel de Confianza</div>
            </div>
          </div>
        </div>

        {/* Créditos Recomendados */}
        {recommendedCredits.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-indigo-400" />
              Créditos Disponibles para Ti
            </h3>
            <p className="text-gray-400 mb-6">Basado en tu perfil y condiciones, estos son los créditos a los que puedes aplicar:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCredits.map((credit) => {
                const getColorClasses = (color: string) => {
                  switch (color) {
                    case 'blue': return { border: 'border-blue-500', bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20' };
                    case 'green': return { border: 'border-green-500', bg: 'bg-green-500/10', iconBg: 'bg-green-500/20' };
                    case 'purple': return { border: 'border-purple-500', bg: 'bg-purple-500/10', iconBg: 'bg-purple-500/20' };
                    case 'orange': return { border: 'border-orange-500', bg: 'bg-orange-500/10', iconBg: 'bg-orange-500/20' };
                    case 'pink': return { border: 'border-pink-500', bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20' };
                    case 'teal': return { border: 'border-teal-500', bg: 'bg-teal-500/10', iconBg: 'bg-teal-500/20' };
                    case 'yellow': return { border: 'border-yellow-500', bg: 'bg-yellow-500/10', iconBg: 'bg-yellow-500/20' };
                    default: return { border: 'border-gray-600', bg: 'bg-gray-600/10', iconBg: 'bg-gray-600/20' };
                  }
                };

                const colors = getColorClasses(credit.color);
                const eligibilityColor = credit.eligibility >= 80 ? 'text-green-400' : 
                                        credit.eligibility >= 60 ? 'text-yellow-400' : 'text-orange-400';

                return (
                  <div key={credit.id} className={`bg-gray-700 rounded-xl p-6 border-2 ${colors.border} ${colors.bg} hover:scale-105 transition-transform`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${colors.iconBg}`}>
                          {credit.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{credit.name}</h4>
                          <p className="text-gray-400 text-sm">{credit.description}</p>
                        </div>
                      </div>
                      <div className={`text-right ${eligibilityColor}`}>
                        <div className="text-2xl font-bold">{credit.eligibility}%</div>
                        <div className="text-xs text-gray-400">Elegibilidad</div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monto máximo:</span>
                        <span className="text-white font-semibold">{formatCurrencyDisplay(credit.maxAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Tasa de interés:</span>
                        <span className="text-white font-semibold">{credit.interest_rate}% EA</span>
                      </div>
                      {credit.termMonths > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Plazo máximo:</span>
                          <span className="text-white font-semibold">{credit.termMonths} meses</span>
                        </div>
                      )}
                      {credit.termMonths === 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Tipo:</span>
                          <span className="text-white font-semibold">Revolving</span>
                        </div>
                      )}
                    </div>

                    {credit.conditions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <p className="text-sm text-gray-400 mb-2">Condiciones:</p>
                        <ul className="space-y-1">
                          {credit.conditions.map((condition, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Razones de Rechazo */}
        {evaluationResult.failures_detected && evaluationResult.failures_detected.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-8 border-2 border-red-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <XCircle className="h-7 w-7 text-red-400" />
              Aspectos a Mejorar
            </h3>
            
            <div className="space-y-4 mb-6">
              {evaluationResult.failures_detected.map((failure: string, index: number) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{humanizeFailureMessage(failure)}</p>
                      <p className="text-gray-400 text-sm">{getRecommendationForFailure(failure)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos Recomendados del Backend (si existen) */}
        {evaluationResult.recommended_products && evaluationResult.recommended_products.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="h-7 w-7 text-green-400" />
              Productos Específicos Recomendados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationResult.recommended_products.map((product: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-xl p-6 border-2 border-green-500/30">
                  <h4 className="text-xl font-bold text-white mb-2">{product.name}</h4>
                  <p className="text-gray-300 mb-4">{product.description}</p>
                  {product.max_amount && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monto máximo:</span>
                        <span className="text-white font-semibold">{formatCurrencyDisplay(product.max_amount)}</span>
                      </div>
                      {product.interest_rate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tasa:</span>
                          <span className="text-white font-semibold">{product.interest_rate}% EA</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Botón Nueva Evaluación */}
        <div className="flex justify-center pt-6">
          <button
            onClick={() => {
              setEvaluationResult(null);
              setCurrentStep(1);
              setFormData({
                age: 0,
                monthly_income: 0,
                credit_score: 0,
                employment_status: '',
                credit_purpose: '',
                requested_amount: 0,
                debt_to_income_ratio: 0,
                max_days_delinquency: 0,
                employment_tenure_months: 0,
                payment_to_income_ratio: 0,
                economic_activity: '',
                is_pep: false,
                pep_committee_approval: false,
                recent_inquiries: 0,
                co_borrower_income: 0,
                is_microenterprise: false,
                customer_tenure_months: 0,
                historical_compliance: 0,
                is_convention_employee: false,
                payroll_discount_authorized: false,
                employment_type: '',
                pension_amount: 0,
                is_legal_pension: false,
                down_payment_percentage: 0
              });
            }}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:scale-105 text-lg shadow-lg"
          >
            Realizar Nueva Evaluación
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Sistema Experto de Evaluación Crediticia
        </h2>
      </div>

      {!evaluationResult ? (
        <>
          {/* Progress Bar - COPIADO EXACTAMENTE DEL ORIGINAL */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% completado</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation - COPIADO EXACTAMENTE DEL ORIGINAL */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentStep === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </div>
            </button>

            <div className="flex items-center space-x-2">
              {!canProceed && (
                <span className="text-sm text-red-500">
                  Esta pregunta es obligatoria
                </span>
              )}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${canProceed
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center">
                  Siguiente
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !canProceed}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isLoading || !canProceed
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                <div className="flex items-center">
                  {isLoading ? 'Evaluando...' : 'Evaluar con Sistema Experto'}
                  {!isLoading && (
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            )}
          </div>
        </>
      ) : (
        renderEvaluationResult()
      )}
    </div>
  );
};