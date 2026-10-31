import { useState } from "react";

type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
) {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const setValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const setValues = (newValues: Partial<T>) => {
    setValuesState((currentValues) => ({
      ...currentValues,
      ...newValues,
    }));
  };

  const reset = () => {
    setValuesState(initialValues);
    setErrors({});
  };

  const setError = <K extends keyof T>(field: K, message: string) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: message,
    }));
  };

  const clearError = <K extends keyof T>(field: K) => {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    setValue,
    setValues,
    reset,
    errors,
    setError,
    clearError,
    clearErrors,
  };
}