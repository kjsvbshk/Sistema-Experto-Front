// Estructura de datos para la encuesta del agente de análisis crediticio

export interface SurveyOption {
    id: string;
    text: string;
    value: string | number;
    score?: number; // Puntuación para el cálculo del score crediticio
}

export interface SurveyQuestion {
    id: string;
    type: "single" | "multiple" | "text" | "number";
    question: string;
    description?: string;
    required: boolean;
    options?: SurveyOption[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
    category: "personal" | "financial" | "employment" | "credit_history";
    weight: number; // Peso de la pregunta en el cálculo final
}

export interface SurveySection {
    id: string;
    title: string;
    description: string;
    questions: SurveyQuestion[];
}

export interface SurveyData {
    id: string;
    title: string;
    description: string;
    sections: SurveySection[];
    totalQuestions: number;
    estimatedTime: number; // en minutos
}

// Datos de la encuesta de análisis crediticio
export const creditAnalysisSurvey: SurveyData = {
    id: "credit-analysis-2024",
    title: "Evaluación Crediticia Integral",
    description:
        "Encuesta para evaluar el perfil crediticio y recomendar productos financieros adecuados",
    totalQuestions: 15,
    estimatedTime: 10,
    sections: [
        {
            id: "personal-info",
            title: "Información Personal",
            description: "Datos básicos del solicitante",
            questions: [
                {
                    id: "age",
                    type: "number",
                    question: "¿Cuál es su edad?",
                    description: "Ingrese su edad actual",
                    required: true,
                    validation: {
                        min: 18,
                        max: 80,
                        message: "La edad debe estar entre 18 y 80 años",
                    },
                    category: "personal",
                    weight: 1,
                },
                {
                    id: "marital_status",
                    type: "single",
                    question: "¿Cuál es su estado civil?",
                    required: true,
                    options: [
                        {
                            id: "single",
                            text: "Soltero(a)",
                            value: "single",
                            score: 1,
                        },
                        {
                            id: "married",
                            text: "Casado(a)",
                            value: "married",
                            score: 2,
                        },
                        {
                            id: "divorced",
                            text: "Divorciado(a)",
                            value: "divorced",
                            score: 1,
                        },
                        {
                            id: "widowed",
                            text: "Viudo(a)",
                            value: "widowed",
                            score: 1,
                        },
                    ],
                    category: "personal",
                    weight: 1,
                },
            ],
        },
        {
            id: "employment-info",
            title: "Información Laboral",
            description: "Datos sobre su situación laboral actual",
            questions: [
                {
                    id: "employment_status",
                    type: "single",
                    question: "¿Cuál es su situación laboral actual?",
                    required: true,
                    options: [
                        {
                            id: "employed",
                            text: "Empleado",
                            value: "employed",
                            score: 3,
                        },
                        {
                            id: "self_employed",
                            text: "Trabajador independiente",
                            value: "self_employed",
                            score: 2,
                        },
                        {
                            id: "unemployed",
                            text: "Desempleado",
                            value: "unemployed",
                            score: 0,
                        },
                        {
                            id: "retired",
                            text: "Jubilado",
                            value: "retired",
                            score: 1,
                        },
                    ],
                    category: "employment",
                    weight: 3,
                },
                {
                    id: "job_tenure",
                    type: "single",
                    question: "¿Cuánto tiempo lleva en su trabajo actual?",
                    required: true,
                    options: [
                        {
                            id: "less_6_months",
                            text: "Menos de 6 meses",
                            value: "less_6_months",
                            score: 1,
                        },
                        {
                            id: "6_12_months",
                            text: "6 meses a 1 año",
                            value: "6_12_months",
                            score: 2,
                        },
                        {
                            id: "1_3_years",
                            text: "1 a 3 años",
                            value: "1_3_years",
                            score: 3,
                        },
                        {
                            id: "more_3_years",
                            text: "Más de 3 años",
                            value: "more_3_years",
                            score: 4,
                        },
                    ],
                    category: "employment",
                    weight: 2,
                },
                {
                    id: "monthly_income",
                    type: "number",
                    question: "¿Cuál es su ingreso mensual neto?",
                    description: "Ingrese el monto en pesos colombianos",
                    required: true,
                    validation: {
                        min: 500000,
                        max: 50000000,
                        message:
                            "El ingreso debe estar entre $500,000 y $50,000,000",
                    },
                    category: "employment",
                    weight: 4,
                },
            ],
        },
        {
            id: "financial-info",
            title: "Información Financiera",
            description: "Datos sobre su situación financiera",
            questions: [
                {
                    id: "monthly_expenses",
                    type: "number",
                    question: "¿Cuáles son sus gastos mensuales aproximados?",
                    description:
                        "Incluya vivienda, alimentación, transporte, etc.",
                    required: true,
                    validation: {
                        min: 200000,
                        max: 30000000,
                        message:
                            "Los gastos deben estar entre $200,000 y $30,000,000",
                    },
                    category: "financial",
                    weight: 3,
                },
                {
                    id: "savings",
                    type: "single",
                    question: "¿Tiene ahorros o inversiones?",
                    required: true,
                    options: [
                        {
                            id: "no_savings",
                            text: "No tengo ahorros",
                            value: "no_savings",
                            score: 0,
                        },
                        {
                            id: "less_1_month",
                            text: "Menos de 1 mes de ingresos",
                            value: "less_1_month",
                            score: 1,
                        },
                        {
                            id: "1_3_months",
                            text: "1 a 3 meses de ingresos",
                            value: "1_3_months",
                            score: 2,
                        },
                        {
                            id: "more_3_months",
                            text: "Más de 3 meses de ingresos",
                            value: "more_3_months",
                            score: 3,
                        },
                    ],
                    category: "financial",
                    weight: 2,
                },
                {
                    id: "other_loans",
                    type: "single",
                    question: "¿Tiene otros créditos o préstamos activos?",
                    required: true,
                    options: [
                        {
                            id: "no_loans",
                            text: "No tengo otros créditos",
                            value: "no_loans",
                            score: 3,
                        },
                        {
                            id: "one_loan",
                            text: "Tengo 1 crédito",
                            value: "one_loan",
                            score: 2,
                        },
                        {
                            id: "two_loans",
                            text: "Tengo 2 créditos",
                            value: "two_loans",
                            score: 1,
                        },
                        {
                            id: "more_loans",
                            text: "Tengo 3 o más créditos",
                            value: "more_loans",
                            score: 0,
                        },
                    ],
                    category: "financial",
                    weight: 2,
                },
            ],
        },
        {
            id: "credit-history",
            title: "Historial Crediticio",
            description: "Información sobre su historial crediticio",
            questions: [
                {
                    id: "credit_score",
                    type: "single",
                    question: "¿Conoce su puntaje crediticio?",
                    required: true,
                    options: [
                        {
                            id: "excellent",
                            text: "Excelente (700-850)",
                            value: "excellent",
                            score: 4,
                        },
                        {
                            id: "good",
                            text: "Bueno (650-699)",
                            value: "good",
                            score: 3,
                        },
                        {
                            id: "fair",
                            text: "Regular (600-649)",
                            value: "fair",
                            score: 2,
                        },
                        {
                            id: "poor",
                            text: "Bajo (300-599)",
                            value: "poor",
                            score: 1,
                        },
                        {
                            id: "unknown",
                            text: "No lo conozco",
                            value: "unknown",
                            score: 1,
                        },
                    ],
                    category: "credit_history",
                    weight: 4,
                },
                {
                    id: "payment_history",
                    type: "single",
                    question: "¿Cómo calificaría su historial de pagos?",
                    required: true,
                    options: [
                        {
                            id: "always_on_time",
                            text: "Siempre pago a tiempo",
                            value: "always_on_time",
                            score: 4,
                        },
                        {
                            id: "mostly_on_time",
                            text: "Casi siempre pago a tiempo",
                            value: "mostly_on_time",
                            score: 3,
                        },
                        {
                            id: "sometimes_late",
                            text: "A veces me atraso",
                            value: "sometimes_late",
                            score: 2,
                        },
                        {
                            id: "often_late",
                            text: "Frecuentemente me atraso",
                            value: "often_late",
                            score: 1,
                        },
                    ],
                    category: "credit_history",
                    weight: 3,
                },
                {
                    id: "credit_purpose",
                    type: "single",
                    question: "¿Para qué necesita el crédito?",
                    required: true,
                    options: [
                        {
                            id: "home",
                            text: "Compra de vivienda",
                            value: "home",
                            score: 3,
                        },
                        {
                            id: "vehicle",
                            text: "Compra de vehículo",
                            value: "vehicle",
                            score: 2,
                        },
                        {
                            id: "education",
                            text: "Educación",
                            value: "education",
                            score: 3,
                        },
                        {
                            id: "business",
                            text: "Negocio/Inversión",
                            value: "business",
                            score: 2,
                        },
                        {
                            id: "debt_consolidation",
                            text: "Consolidación de deudas",
                            value: "debt_consolidation",
                            score: 1,
                        },
                        {
                            id: "personal",
                            text: "Gastos personales",
                            value: "personal",
                            score: 1,
                        },
                    ],
                    category: "credit_history",
                    weight: 2,
                },
            ],
        },
    ],
};

// Función para calcular el score crediticio basado en las respuestas
export const calculateCreditScore = (
    answers: Record<string, string | number | string[]>
): number => {
    let totalScore = 0;
    let totalWeight = 0;

    creditAnalysisSurvey.sections.forEach((section) => {
        section.questions.forEach((question) => {
            const answer = answers[question.id];
            if (answer !== undefined && answer !== null && answer !== "") {
                if (question.type === "single" && question.options) {
                    const selectedOption = question.options.find(
                        (opt) => opt.value === answer
                    );
                    if (selectedOption && selectedOption.score !== undefined) {
                        totalScore += selectedOption.score * question.weight;
                        totalWeight += question.weight;
                    }
                } else if (question.type === "number") {
                    // Para preguntas numéricas, normalizar el valor
                    const value = Number(answer);
                    if (question.id === "monthly_income") {
                        // Normalizar ingreso (0-4 puntos)
                        const normalizedScore = Math.min(
                            4,
                            Math.max(0, (value - 500000) / 1000000)
                        );
                        totalScore += normalizedScore * question.weight;
                        totalWeight += question.weight;
                    } else if (question.id === "age") {
                        // Normalizar edad (1-3 puntos)
                        const normalizedScore =
                            value >= 25 && value <= 55
                                ? 3
                                : value >= 18 && value <= 65
                                ? 2
                                : 1;
                        totalScore += normalizedScore * question.weight;
                        totalWeight += question.weight;
                    }
                }
            }
        });
    });

    // Convertir a escala 300-850
    const maxPossibleScore = totalWeight * 4; // Asumiendo que el score máximo por pregunta es 4
    const normalizedScore = (totalScore / maxPossibleScore) * 550 + 300;

    return Math.round(Math.min(850, Math.max(300, normalizedScore)));
};

// Función para recomendar productos basado en el score
export const recommendProducts = (score: number) => {
    if (score >= 700) {
        return {
            category: "excellent",
            products: [
                {
                    name: "Tarjeta de Crédito Premium",
                    amount: 15000000,
                    rate: 1.2,
                },
                { name: "Crédito de Vivienda", amount: 200000000, rate: 0.8 },
                { name: "Crédito de Vehículo", amount: 80000000, rate: 1.0 },
            ],
        };
    } else if (score >= 650) {
        return {
            category: "good",
            products: [
                {
                    name: "Tarjeta de Crédito Clásica",
                    amount: 10000000,
                    rate: 1.5,
                },
                { name: "Crédito de Vivienda", amount: 150000000, rate: 1.0 },
                { name: "Crédito de Vehículo", amount: 60000000, rate: 1.2 },
            ],
        };
    } else if (score >= 600) {
        return {
            category: "fair",
            products: [
                {
                    name: "Tarjeta de Crédito Básica",
                    amount: 5000000,
                    rate: 2.0,
                },
                { name: "Crédito de Consumo", amount: 30000000, rate: 1.8 },
            ],
        };
    } else {
        return {
            category: "poor",
            products: [
                {
                    name: "Crédito de Consumo Básico",
                    amount: 2000000,
                    rate: 2.5,
                },
            ],
        };
    }
};
