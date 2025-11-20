import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserType } from '../hooks/useUserType';
import Navbar from '../components/Navbar';

export default function MainPage() {
  const { user } = useAuth();
  const { isExperto, isCliente } = useUserType();
  const [showBounce, setShowBounce] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Efecto de bounce para el chip del usuario
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsVisible(true);
      setShowBounce(true);
    }, 500); // Delay de 500ms para que se vea después del montaje

    const stopTimer = setTimeout(() => {
      setShowBounce(false);
    }, 3500); // Para después de 3 segundos (500ms + 3000ms)

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, []);

  return (
    <div className="min-h-full bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-6 py-8 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Sistema Experto de Análisis Crediticio
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Hola, <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 transition-all duration-500 ease-out ${!isVisible ? 'opacity-0 scale-95' : showBounce ? 'animate-bounce' : 'opacity-100 scale-100'}`}>{user?.username || 'Usuario'}</span>. Bienvenido a nuestra plataforma que utiliza un sistema experto
              para evaluar y recomendar los mejores productos crediticios para tus clientes.
            </p>
          </div>

          {/* What is an Expert System Section */}
          <div className="mb-12">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                ¿Qué es un Sistema Experto?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Definición</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Un sistema experto es una aplicación que simula el comportamiento y la toma de decisiones
                    de un experto humano en un dominio específico. Utiliza reglas predefinidas, heurísticas
                    y conocimiento especializado para resolver problemas complejos de manera consistente.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Para qué sirve</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Los sistemas expertos automatizan procesos de decisión basados en reglas predefinidas,
                    reducen errores humanos, proporcionan consistencia en las evaluaciones y permiten
                    escalar el conocimiento de especialistas a múltiples usuarios simultáneamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Products Section */}
          <div className="mb-12">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Productos Crediticios Disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tarjetas de Crédito */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-white">Tarjetas de Crédito</h3>
                  </div>
                  <p className="text-gray-400 text-xs">Líneas de crédito para compras y servicios</p>
                </div>

                {/* Créditos de Casa */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-white">Créditos de Casa</h3>
                  </div>
                  <p className="text-gray-400 text-xs">Financiamiento para vivienda propia</p>
                </div>

                {/* Créditos de Inversión */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-white">Créditos de Inversión</h3>
                  </div>
                  <p className="text-gray-400 text-xs">Capital para proyectos de inversión</p>
                </div>

                {/* Créditos de Emprendimiento */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-white">Créditos de Emprendimiento</h3>
                  </div>
                  <p className="text-gray-400 text-xs">Financiamiento para nuevos negocios</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section - Solo para Expertos */}
          {isExperto && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg border border-indigo-500 p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Listo para Evaluar un Cliente?
                </h2>
                <p className="text-indigo-100 text-lg mb-6">
                  Nuestro sistema experto analizará el perfil crediticio de tu cliente aplicando reglas
                  predefinidas y te recomendará los productos más adecuados basándose en su historial,
                  ingresos y capacidad de pago.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/agent"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Iniciar Evaluación
                  </Link>
                  <button className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ver Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action Section - Solo para Clientes */}
          {isCliente && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg border border-indigo-500 p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Consulta tu Historial de Evaluaciones
                </h2>
                <p className="text-indigo-100 text-lg mb-6">
                  Revisa todas las evaluaciones crediticias que se han realizado para ti. 
                  Podrás ver los resultados, recomendaciones de productos y el estado de cada evaluación.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/my-history"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ver Mi Historial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}