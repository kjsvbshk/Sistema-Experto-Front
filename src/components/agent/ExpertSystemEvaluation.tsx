import React, { useState } from 'react';
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
      const evaluationRequest: StartEvaluationRequest = {
        input_data: formData,
        session_id: inferenceEngineService.generateSessionId()
      };

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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Edad *
          </label>
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
               <label className="block text-sm font-medium text-gray-300 mb-2">
                 Ingresos Mensuales Netos *
               </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Score Crediticio *
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estado Laboral *
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Finalidad del Crédito *
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monto Solicitado *
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Porcentaje de Enganche (%)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Relación Deuda/Ingreso (%)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Días Máximos de Mora
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Vinculación
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ¿Actividad Microempresarial?
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Antigüedad Laboral (meses)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Relación Cuota/Ingreso (%)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Actividad Económica (SARLAFT)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ¿Es Persona Políticamente Expuesta (PEP)?
          </label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ¿Tiene Aprobación del Comité PEP?
            </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Consultas en Últimos 30 Días
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ingresos del Codeudor
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Antigüedad como Cliente (meses)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cumplimiento Histórico (%)
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ¿Empleado Empresa Convenio?
          </label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ¿Descuento Nómina Autorizado?
            </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monto de Pensión
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Pensión Legal?
              </label>
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

    return (
      <div className="space-y-8">
        {/* Título Principal */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Resultado de la Evaluación</h2>
          <p className="text-gray-400">Análisis crediticio completado</p>
        </div>

        {/* Tarjetas de Resultado Principal */}
        <div className="bg-gray-700 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-4">
                {evaluationResult.final_decision}
              </div>
              <div className="text-lg text-gray-300">Decisión Final</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-4">
                {evaluationResult.risk_profile}
              </div>
              <div className="text-lg text-gray-300">Perfil de Riesgo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-4">
                {evaluationResult.confidence_score}%
              </div>
              <div className="text-lg text-gray-300">Nivel de Confianza</div>
            </div>
          </div>

          {/* Explicación */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Explicación del Resultado</h3>
            <div className="bg-gray-800 rounded-lg p-8 space-y-6">
              <div className="text-gray-300 text-lg leading-relaxed">
                {evaluationResult.explanation}
              </div>
              
              {/* Razones de Rechazo en Lista */}
              {evaluationResult.failures_detected && evaluationResult.failures_detected.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Motivos de Rechazo:</h4>
                  <ul className="space-y-3">
                    {evaluationResult.failures_detected.map((failure: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-400 mr-3 mt-1 text-xl">•</span>
                        <span className="text-gray-300 text-left">{humanizeFailureMessage(failure)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones en Lista */}
              {evaluationResult.failures_detected && evaluationResult.failures_detected.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Recomendaciones para Mejorar:</h4>
                  <ul className="space-y-3">
                    {evaluationResult.failures_detected.map((failure: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-3 mt-1 text-xl">•</span>
                        <span className="text-gray-300 text-left">{getRecommendationForFailure(failure)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Productos Recomendados */}
          {evaluationResult.recommended_products && evaluationResult.recommended_products.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Productos Recomendados</h3>
              <div className="space-y-3">
                {evaluationResult.recommended_products.map((product, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="font-medium text-white text-lg">{product.name}</div>
                    <div className="text-gray-300 mt-1">{product.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Botón Nueva Evaluación */}
          <div className="flex justify-center">
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
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
            >
              Realizar Nueva Evaluación
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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