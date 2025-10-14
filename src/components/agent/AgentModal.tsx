import { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, DollarSign, Home, Car, GraduationCap } from 'lucide-react';
import AgentForm from './AgentForm';
import {
    creditAnalysisSurvey,
    calculateCreditScore,
    recommendProducts
} from './agentSurvey';

interface AgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentName: string;
}

interface SurveyAnswers {
    [questionId: string]: string | number | string[];
}

export default function AgentModal({ isOpen, onClose, agentName }: AgentModalProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<SurveyAnswers>({});
    const [creditScore, setCreditScore] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<{
        category: string;
        products: Array<{
            name: string;
            amount: number;
            rate: number;
        }>;
    } | null>(null);
    const [showResults, setShowResults] = useState(false);

    // Obtener todas las preguntas de todas las secciones
    const allQuestions = creditAnalysisSurvey.sections.flatMap(section => section.questions);
    const currentQuestion = allQuestions[currentQuestionIndex];
    const totalQuestions = allQuestions.length;

    // Resetear estado cuando se abre/cierra el modal
    useEffect(() => {
        if (isOpen) {
            setCurrentQuestionIndex(0);
            setAnswers({});
            setCreditScore(null);
            setRecommendations(null);
            setShowResults(false);
        }
    }, [isOpen]);

    const handleAnswerChange = (value: string | number | string[]) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Encuesta completada
            calculateResults();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateResults = () => {
        const score = calculateCreditScore(answers);
        const productRecommendations = recommendProducts(score);

        setCreditScore(score);
        setRecommendations(productRecommendations);
        setShowResults(true);
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setCreditScore(null);
        setRecommendations(null);
        setShowResults(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 700) return 'text-green-600';
        if (score >= 650) return 'text-blue-600';
        if (score >= 600) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 700) return 'Excelente';
        if (score >= 650) return 'Bueno';
        if (score >= 600) return 'Regular';
        return 'Bajo';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'excellent':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'good':
                return <TrendingUp className="w-6 h-6 text-blue-600" />;
            case 'fair':
                return <DollarSign className="w-6 h-6 text-yellow-600" />;
            default:
                return <DollarSign className="w-6 h-6 text-red-600" />;
        }
    };

    const getProductIcon = (productName: string) => {
        if (productName.includes('Vivienda')) return <Home className="w-5 h-5" />;
        if (productName.includes('Vehículo')) return <Car className="w-5 h-5" />;
        if (productName.includes('Educación')) return <GraduationCap className="w-5 h-5" />;
        return <DollarSign className="w-5 h-5" />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl shadow-2xl rounded-lg bg-gray-800 border border-gray-700 transform transition-all duration-200 ease-out max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {agentName}
                            </h3>
                            <p className="text-gray-300 text-sm">
                                {showResults ? 'Resultados de la Evaluación' : 'Evaluación Crediticia'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div>
                        {!showResults ? (
                            <AgentForm
                                question={currentQuestion}
                                value={answers[currentQuestion.id]}
                                onChange={handleAnswerChange}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                isFirst={currentQuestionIndex === 0}
                                isLast={currentQuestionIndex === totalQuestions - 1}
                                questionNumber={currentQuestionIndex + 1}
                                totalQuestions={totalQuestions}
                            />
                        ) : (
                            /* Results */
                            <div className="max-w-4xl mx-auto">
                                {/* Score Section */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-700 mb-4">
                                        <span className={`text-3xl font-bold ${getScoreColor(creditScore!)}`}>
                                            {creditScore}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Su Puntaje Crediticio
                                    </h2>
                                    <p className={`text-lg font-medium ${getScoreColor(creditScore!)}`}>
                                        {getScoreLabel(creditScore!)}
                                    </p>
                                    <p className="text-gray-300 mt-2">
                                        Basado en sus respuestas, hemos calculado su perfil crediticio
                                    </p>
                                </div>

                                {/* Recommendations */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-6">
                                        {recommendations && getCategoryIcon(recommendations.category)}
                                        <h3 className="text-xl font-semibold text-white ml-3">
                                            Productos Recomendados
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recommendations?.products.map((product, index: number) => (
                                            <div key={index} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                                <div className="flex items-center mb-3">
                                                    {getProductIcon(product.name)}
                                                    <h4 className="font-semibold text-white ml-2">
                                                        {product.name}
                                                    </h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-300">Monto máximo:</span>
                                                        <span className="font-medium text-white">
                                                            ${product.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-300">Tasa de interés:</span>
                                                        <span className="font-medium text-white">
                                                            {product.rate}% EA
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={handleRestart}
                                        className="px-6 py-3 bg-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                                    >
                                        Realizar Nueva Evaluación
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
