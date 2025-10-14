import React from 'react';
import { SurveyQuestion, SurveyOption } from './agentSurvey';

interface AgentFormProps {
    question: SurveyQuestion;
    value: string | number | string[] | undefined;
    onChange: (value: string | number | string[]) => void;
    onNext: () => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    questionNumber: number;
    totalQuestions: number;
}

export default function AgentForm({
    question,
    value,
    onChange,
    onNext,
    onPrevious,
    isFirst,
    isLast,
    questionNumber,
    totalQuestions
}: AgentFormProps) {

    const handleOptionChange = (optionValue: string | number) => {
        if (question.type === 'single') {
            onChange(optionValue);
        } else if (question.type === 'multiple') {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter((v: string | number) => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = e.target.value === '' ? '' : Number(e.target.value);
        onChange(numValue);
    };

    const isValueValid = () => {
        if (question.required && (value === undefined || value === null || value === '')) {
            return false;
        }

        if (question.type === 'number' && question.validation) {
            const numValue = Number(value);
            if (question.validation.min !== undefined && numValue < question.validation.min) {
                return false;
            }
            if (question.validation.max !== undefined && numValue > question.validation.max) {
                return false;
            }
        }

        return true;
    };

    const canProceed = isValueValid();

    const renderQuestionInput = () => {
        switch (question.type) {
            case 'single':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option: SurveyOption) => (
                            <label
                                key={option.id}
                                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${value === option.value
                                    ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                                    : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={() => handleOptionChange(option.value)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${value === option.value
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-400'
                                    }`}>
                                    {value === option.value && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-white">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'multiple':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option: SurveyOption) => (
                            <label
                                key={option.id}
                                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${Array.isArray(value) && value.includes(option.value)
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    name={question.id}
                                    value={option.value}
                                    checked={Array.isArray(value) && value.includes(option.value)}
                                    onChange={() => handleOptionChange(option.value)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${Array.isArray(value) && value.includes(option.value)
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300'
                                    }`}>
                                    {Array.isArray(value) && value.includes(option.value) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-white">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={value || ''}
                            onChange={handleTextChange}
                            placeholder="Escriba su respuesta aquí..."
                            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            rows={4}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="space-y-2">
                        <input
                            type="number"
                            value={value || ''}
                            onChange={handleNumberChange}
                            placeholder="Ingrese el valor..."
                            min={question.validation?.min}
                            max={question.validation?.max}
                            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        />
                        {question.validation && (
                            <div className="text-sm text-gray-400">
                                {question.validation.min && question.validation.max &&
                                    `Rango: ${question.validation.min.toLocaleString()} - ${question.validation.max.toLocaleString()}`
                                }
                                {question.validation.min && !question.validation.max &&
                                    `Mínimo: ${question.validation.min.toLocaleString()}`
                                }
                                {!question.validation.min && question.validation.max &&
                                    `Máximo: ${question.validation.max.toLocaleString()}`
                                }
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Pregunta {questionNumber} de {totalQuestions}</span>
                    <span>{Math.round((questionNumber / totalQuestions) * 100)}% completado</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {question.question}
                </h2>
                {question.description && (
                    <p className="text-gray-300 mb-6">
                        {question.description}
                    </p>
                )}
            </div>

            {/* Input */}
            <div className="mb-8">
                {renderQuestionInput()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onPrevious}
                    disabled={isFirst}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isFirst
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
                            {question.required ? 'Esta pregunta es obligatoria' : 'Respuesta inválida'}
                        </span>
                    )}
                </div>

                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${canProceed
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <div className="flex items-center">
                        {isLast ? 'Finalizar' : 'Siguiente'}
                        {!isLast && (
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
