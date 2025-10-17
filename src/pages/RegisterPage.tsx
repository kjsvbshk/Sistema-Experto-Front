import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useForm } from '../hooks/useForm';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function RegisterPage() {
  const { register, error, clearError } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit } = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      username: {
        required: true,
        minLength: 3,
      },
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minLength: 8,
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== formState.password.value) {
            return 'Las contraseñas no coinciden';
          }
          return null;
        },
      },
    },
    onSubmit: async (values) => {
      try {
        await register({
          username: values.username,
          email: values.email,
          password: values.password,
        });
        showSuccess('¡Registro exitoso! Redirigiendo al login...');
        navigate('/login');
      } catch {
        // El error ya se maneja en el AuthContext
        showError('Error al registrar usuario. Intenta nuevamente.');
      }
    },
  });

  const handleInputChange = (name: string, value: string) => {
    setValue(name, value);
    if (error || submitError) {
      clearError();
    }
  };

  const handleInputBlur = (name: string) => {
    setTouched(name);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Sistema de Expertos"
          src="/logo.svg"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">
              Nombre de usuario
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formState.username.value}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                className="block w-full rounded-lg border-0 px-4 py-3 text-white bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-gray-800/70 transition-all duration-200 sm:text-sm"
                placeholder="Ingresa tu nombre de usuario"
              />
              {formState.username.touched && formState.username.error && (
                <p className="mt-1 text-sm text-red-400">{formState.username.error}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formState.email.value}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className="block w-full rounded-lg border-0 px-4 py-3 text-white bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-gray-800/70 transition-all duration-200 sm:text-sm"
                placeholder="Ingresa tu correo electrónico"
              />
              {formState.email.touched && formState.email.error && (
                <p className="mt-1 text-sm text-red-400">{formState.email.error}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
              Contraseña
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formState.password.value}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                className="block w-full rounded-lg border-0 px-4 py-3 text-white bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-gray-800/70 transition-all duration-200 sm:text-sm"
                placeholder="Ingresa tu contraseña"
              />
              {formState.password.touched && formState.password.error && (
                <p className="mt-1 text-sm text-red-400">{formState.password.error}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-100">
              Confirmar contraseña
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formState.confirmPassword.value}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                className="block w-full rounded-lg border-0 px-4 py-3 text-white bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-gray-800/70 transition-all duration-200 sm:text-sm"
                placeholder="Confirma tu contraseña"
              />
              {formState.confirmPassword.touched && formState.confirmPassword.error && (
                <p className="mt-1 text-sm text-red-400">{formState.confirmPassword.error}</p>
              )}
            </div>
          </div>

          {(error || submitError) && (
            <ErrorMessage message={error || submitError || ''} />
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}