import { useState, useCallback } from "react";

export interface FormField {
    value: string;
    error: string | null;
    touched: boolean;
}

export interface FormState {
    [key: string]: FormField;
}

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    custom?: (value: string) => string | null;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface UseFormOptions {
    initialValues: Record<string, string>;
    validationRules?: ValidationRules;
    onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

export function useForm({
    initialValues,
    validationRules = {},
    onSubmit,
}: UseFormOptions) {
    const [formState, setFormState] = useState<FormState>(() => {
        const state: FormState = {};
        Object.keys(initialValues).forEach((key) => {
            state[key] = {
                value: initialValues[key],
                error: null,
                touched: false,
            };
        });
        return state;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Validar un campo individual
    const validateField = useCallback(
        (name: string, value: string): string | null => {
            const rules = validationRules[name];
            if (!rules) return null;

            // Required
            if (rules.required && (!value || value.trim() === "")) {
                return "Este campo es requerido";
            }

            // Min length
            if (rules.minLength && value.length < rules.minLength) {
                return `Mínimo ${rules.minLength} caracteres`;
            }

            // Max length
            if (rules.maxLength && value.length > rules.maxLength) {
                return `Máximo ${rules.maxLength} caracteres`;
            }

            // Email
            if (rules.email && value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    return "Formato de email inválido";
                }
            }

            // Pattern
            if (rules.pattern && value && !rules.pattern.test(value)) {
                return "Formato inválido";
            }

            // Custom validation
            if (rules.custom) {
                return rules.custom(value);
            }

            return null;
        },
        [validationRules]
    );

    // Actualizar valor de campo
    const setValue = useCallback(
        (name: string, value: string) => {
            setFormState((prev) => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    value,
                    error: prev[name].touched
                        ? validateField(name, value)
                        : null,
                },
            }));
        },
        [validateField]
    );

    // Marcar campo como tocado
    const setTouched = useCallback(
        (name: string) => {
            setFormState((prev) => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    touched: true,
                    error: validateField(name, prev[name].value),
                },
            }));
        },
        [validateField]
    );

    // Validar todo el formulario
    const validateForm = useCallback((): boolean => {
        let isValid = true;
        const newState = { ...formState };

        Object.keys(formState).forEach((name) => {
            const error = validateField(name, formState[name].value);
            if (error) {
                isValid = false;
                newState[name] = {
                    ...newState[name],
                    error,
                    touched: true,
                };
            }
        });

        setFormState(newState);
        return isValid;
    }, [formState, validateField]);

    // Manejar envío del formulario
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setSubmitError(null);

            if (!validateForm()) {
                return;
            }

            setIsSubmitting(true);
            try {
                const values: Record<string, string> = {};
                Object.keys(formState).forEach((key) => {
                    values[key] = formState[key].value;
                });

                await onSubmit(values);
            } catch (error) {
                if (error instanceof Error) {
                    setSubmitError(error.message);
                } else {
                    setSubmitError("Error inesperado");
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [formState, validateForm, onSubmit]
    );

    // Resetear formulario
    const resetForm = useCallback(() => {
        const newState: FormState = {};
        Object.keys(initialValues).forEach((key) => {
            newState[key] = {
                value: initialValues[key],
                error: null,
                touched: false,
            };
        });
        setFormState(newState);
        setSubmitError(null);
    }, [initialValues]);

    // Obtener valores del formulario
    const getValues = useCallback((): Record<string, string> => {
        const values: Record<string, string> = {};
        Object.keys(formState).forEach((key) => {
            values[key] = formState[key].value;
        });
        return values;
    }, [formState]);

    // Verificar si el formulario es válido
    const isValid = Object.values(formState).every((field) => !field.error);

    return {
        formState,
        isSubmitting,
        submitError,
        isValid,
        setValue,
        setTouched,
        handleSubmit,
        resetForm,
        getValues,
    };
}
