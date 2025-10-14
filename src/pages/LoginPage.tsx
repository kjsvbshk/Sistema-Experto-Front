import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useForm } from '../hooks/useForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit } = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validationRules: {
      username: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minLength: 8,
      },
    },
    onSubmit: async (values) => {
      try {
        await login({
          username: values.username,
          password: values.password,
        });
        showSuccess('¡Inicio de sesión exitoso!');
        navigate('/main');
      } catch (error) {
        // El error ya se maneja en el AuthContext
        showError('Error al iniciar sesión. Verifica tus credenciales.');
        console.log(error);
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
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Inicia sesión en tu cuenta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Mostrar errores */}
        {(error || submitError) && (
          <ErrorMessage
            message={error || submitError || ''}
            onClose={clearError}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="email"
                required
                autoComplete="email"
                value={formState.username.value}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${formState.username.error
                  ? 'focus:outline-red-500 border-red-500'
                  : 'focus:outline-indigo-500'
                  }`}
                placeholder="tu@email.com"
              />
              {formState.username.error && (
                <p className="mt-1 text-sm text-red-400">{formState.username.error}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                Contraseña
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={formState.password.value}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${formState.password.error
                  ? 'focus:outline-red-500 border-red-500'
                  : 'focus:outline-indigo-500'
                  }`}
                placeholder="••••••••"
              />
              {formState.password.error && (
                <p className="mt-1 text-sm text-red-400">{formState.password.error}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
