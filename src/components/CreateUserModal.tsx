import { useState, useEffect } from 'react';
import { useForm } from '../hooks/useForm';
import { useNotification } from '../contexts/NotificationContext';
import { usersService } from '../services/users.service';
import { authorizationService, type Role } from '../services/authorization.service';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role_id: number;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const { showSuccess, showError } = useNotification();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const { formState, isSubmitting, submitError, setValue, setTouched, handleSubmit } = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role_id: 0,
    } as CreateUserFormData,
    validationRules: {
      username: { required: true },
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      confirmPassword: {
        required: true,
        custom: (value) =>
          value !== formState.password.value ? 'Las contraseñas no coinciden.' : undefined,
      },
      role_id: {
        required: true,
        custom: (value) => value === 0 ? 'Debe seleccionar un rol.' : undefined,
      },
    },
    onSubmit: async (values) => {
      try {
        await usersService.createUserByAdmin({
          username: values.username,
          email: values.email,
          password: values.password,
          role_id: values.role_id,
        });
        
        showSuccess('Usuario creado exitosamente');
        onUserCreated();
        onClose();
      } catch (error: any) {
        showError(error.message || 'Error al crear usuario');
      }
    },
  });

  // Cargar roles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadRoles = async () => {
        try {
          setLoadingRoles(true);
          const response = await authorizationService.getRoles();
          setRoles(response.data);
        } catch (error) {
          console.error('Error loading roles:', error);
          showError('Error al cargar roles');
        } finally {
          setLoadingRoles(false);
        }
      };

      loadRoles();
    }
  }, [isOpen, showError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Crear Nuevo Usuario</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={formState.username.value}
                onChange={(e) => setValue('username', e.target.value)}
                onBlur={() => setTouched('username')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingresa el nombre de usuario"
              />
              {formState.username.touched && formState.username.error && (
                <ErrorMessage message={formState.username.error} />
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formState.email.value}
                onChange={(e) => setValue('email', e.target.value)}
                onBlur={() => setTouched('email')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingresa el email"
              />
              {formState.email.touched && formState.email.error && (
                <ErrorMessage message={formState.email.error} />
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={formState.password.value}
                onChange={(e) => setValue('password', e.target.value)}
                onBlur={() => setTouched('password')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingresa la contraseña"
              />
              {formState.password.touched && formState.password.error && (
                <ErrorMessage message={formState.password.error} />
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formState.confirmPassword.value}
                onChange={(e) => setValue('confirmPassword', e.target.value)}
                onBlur={() => setTouched('confirmPassword')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirma la contraseña"
              />
              {formState.confirmPassword.touched && formState.confirmPassword.error && (
                <ErrorMessage message={formState.confirmPassword.error} />
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-300 mb-1">
                Rol
              </label>
              {loadingRoles ? (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-gray-300">Cargando roles...</span>
                </div>
              ) : (
                <select
                  id="role_id"
                  value={formState.role_id.value}
                  onChange={(e) => setValue('role_id', parseInt(e.target.value))}
                  onBlur={() => setTouched('role_id')}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              )}
              {formState.role_id.touched && formState.role_id.error && (
                <ErrorMessage message={formState.role_id.error} />
              )}
            </div>

            {/* Submit Error */}
            {submitError && <ErrorMessage message={submitError} />}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creando...</span>
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
