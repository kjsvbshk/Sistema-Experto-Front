import React, { useState } from 'react';
import { X, Brain } from 'lucide-react';
import { ExpertSystemEvaluation } from './ExpertSystemEvaluation';
import { inferenceEngineService, type EvaluationResult } from '../../services/inference-engine.service';
import { useNotification } from '../../contexts/NotificationContext';

interface ExpertSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

export default function ExpertSystemModal({ isOpen, onClose, agentName }: ExpertSystemModalProps) {
  const { showSuccess, showError } = useNotification();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const handleEvaluationComplete = (result: EvaluationResult) => {
    setEvaluationResult(result);
    showSuccess('✅ Evaluación completada exitosamente!');
  };

  const handleClose = () => {
    setEvaluationResult(null);
    onClose();
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
                {agentName} - Sistema Experto
              </h3>
              <p className="text-gray-300 text-sm">
                Motor de inferencia para evaluación crediticia avanzada
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div>
            <ExpertSystemEvaluation
              onEvaluationComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}