import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormData {
  [key: string]: any;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): string => {
    const rule = rules[name];
    if (!rule) return '';

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${name} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${name} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${name} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message || `${name} is invalid`;
    }

    return '';
  }, [rules]);

  const validateForm = useCallback((data: FormData): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingleField = useCallback((name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    return error === '';
  }, [validateField]);

  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((name: string): string => {
    return errors[name] || '';
  }, [errors]);

  const isFieldTouched = useCallback((name: string): boolean => {
    return touched[name] || false;
  }, [touched]);

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).some(key => errors[key] !== '');
  }, [errors]);

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearErrors,
    getFieldError,
    isFieldTouched,
    hasErrors
  };
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  number: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  name: /^[a-zA-Z\s]+$/,
};

// Predefined validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: validationPatterns.email,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: validationPatterns.password,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
  },
  confirmPassword: (passwordField: string) => ({
    required: true,
    custom: (value: string, formData?: FormData) => {
      return formData ? value === formData[passwordField] : false;
    },
    message: 'Passwords do not match'
  }),
  phone: {
    pattern: validationPatterns.phone,
    message: 'Please enter a valid phone number'
  },
  url: {
    pattern: validationPatterns.url,
    message: 'Please enter a valid URL starting with http:// or https://'
  },
  required: (fieldName: string) => ({
    required: true,
    message: `${fieldName} is required`
  }),
  minLength: (length: number, fieldName: string) => ({
    minLength: length,
    message: `${fieldName} must be at least ${length} characters`
  }),
  maxLength: (length: number, fieldName: string) => ({
    maxLength: length,
    message: `${fieldName} must be no more than ${length} characters`
  })
};
