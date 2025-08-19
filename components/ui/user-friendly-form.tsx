'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertCircle, Loader2, User, Mail, 
  Building, Phone, MessageSquare, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the form schema with zod validation
export const createFormSchema = <T extends z.ZodRawShape>(fields: T) => {
  return z.object(fields);
};

// Form field interface
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number';
  placeholder?: string;
  icon?: React.ReactNode;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  description?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

// Form props interface
export interface UserFriendlyFormProps {
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  className?: string;
  formId?: string;
  successMessage?: string;
  errorMessage?: string;
  showValidationIcons?: boolean;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  showSuccessMessage?: boolean;
  autoFocusFirstField?: boolean;
  scrollToErrors?: boolean;
  layout?: 'vertical' | 'horizontal';
  columns?: 1 | 2 | 3;
}

// Field error component with enhanced animation
const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -5, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 mt-1 text-red-600 text-sm"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
      <span>{error}</span>
    </motion.div>
  );
};

// Success message component
const SuccessMessage = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"
    >
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-green-800 dark:text-green-300">Success!</h4>
        <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
      </div>
    </motion.div>
  );
};

// Error message component
const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
    >
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
      <div>
        <h4 className="font-medium text-red-800 dark:text-red-300">Error</h4>
        <p className="text-red-700 dark:text-red-400 text-sm">{message}</p>
      </div>
    </motion.div>
  );
};

// Skeleton loading component for form fields
const SkeletonField = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
    <div className="h-10 w-full bg-gray-200 rounded"></div>
  </div>
);

// Form input wrapper component
const FormInputWrapper = ({
  label,
  name,
  required,
  description,
  error,
  icon,
  showValidationIcon,
  isValid,
  children,
  isLoading = false,
}: {
  label: string;
  name: string;
  required?: boolean;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  showValidationIcon?: boolean;
  isValid?: boolean;
  children: React.ReactNode;
  isLoading?: boolean;
}) => {
  
  if (isLoading) {
    return <SkeletonField />;
  }
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-800"
      >
        {label} 
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        
        {children}
        
        {showValidationIcon && !error && isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {error && <FieldError error={error} />}
      </AnimatePresence>
    </div>
  );
};

// Main UserFriendlyForm component
export function UserFriendlyForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className,
  formId = 'user-friendly-form',
  successMessage = 'Form submitted successfully!',
  errorMessage = 'There was a problem submitting the form. Please try again.',
  showValidationIcons = true,
  validationMode = 'onBlur',
  showSuccessMessage = true,
  autoFocusFirstField = true,
  scrollToErrors = true,
  layout = 'vertical',
  columns = 1,
}: UserFriendlyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>(null);

  // Build schema from fields
  const schema = z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
      let validator: any;
      
      // Handle different field types
      switch (field.type) {
        case 'email':
          validator = z.string()
            .email(`Please enter a valid email address`)
            .nonempty(`${field.label} is required`);
          break;
        
        case 'tel':
          validator = z.string()
            .regex(/^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Please enter a valid phone number');
          if (!field.required) validator = validator.optional();
          break;
        
        case 'number':
          validator = z.coerce.number();
          if (field.min !== undefined) validator = validator.min(field.min, `Must be at least ${field.min}`);
          if (field.max !== undefined) validator = validator.max(field.max, `Must be at most ${field.max}`);
          if (!field.required) validator = validator.optional();
          break;
        
        case 'checkbox':
          validator = z.boolean();
          if (field.required) validator = validator.refine((val: boolean) => val === true, `${field.label} is required`);
          break;
        
        default:
          validator = z.string();
          if (field.minLength) validator = (validator as z.ZodString).min(field.minLength, `Must be at least ${field.minLength} characters`);
          if (field.maxLength) validator = (validator as z.ZodString).max(field.maxLength, `Must be at most ${field.maxLength} characters`);
          if (field.pattern) validator = (validator as z.ZodString).regex(field.pattern, 'Please enter a valid format');
          if (field.required) validator = (validator as z.ZodString).nonempty(`${field.label} is required`);
          else validator = validator.optional();
      }
      
      return { ...acc, [field.name]: validator };
    }, {})
  );

  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid, dirtyFields }, 
    reset,
    watch,
    trigger 
  } = useForm({
    resolver: zodResolver(schema),
    mode: validationMode,
  });

  // Set autofocus on first field
  useEffect(() => {
    if (autoFocusFirstField && fields.length > 0 && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [autoFocusFirstField, fields]);

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    setFormSuccess(false);
    setFormError(false);
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      setFormSuccess(true);
      reset();
      setTouchedFields({});
      
      // Auto-hide success message after 5 seconds
      if (showSuccessMessage) {
        setTimeout(() => {
          setFormSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading skeleton state for demo purposes
  const toggleLoadingState = () => {
    setIsLoading(prev => !prev);
    if (!isLoading) {
      // Auto-disable loading state after 3 seconds
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  // Handle field blur for touched state
  const handleFieldBlur = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    trigger(name);
  };

  // Scroll to first error when there are errors
  useEffect(() => {
    if (scrollToErrors && Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`${firstErrorField}-container`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors, scrollToErrors]);

  // Generate grid class based on columns
  const gridClass = columns === 1 ? '' : 
                   columns === 2 ? 'sm:grid-cols-2' : 
                   'sm:grid-cols-3';

  return (
    <form 
      id={formId}
      ref={formRef}
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
      noValidate
    >
      <AnimatePresence mode="wait">
        {formSuccess && showSuccessMessage && (
          <SuccessMessage message={successMessage} />
        )}
        
        {formError && (
          <ErrorMessage message={errorMessage} />
        )}
      </AnimatePresence>

      <div className={cn(
        'space-y-4',
        layout === 'horizontal' && `grid gap-4 ${gridClass}`
      )}>
        {fields.map((field, index) => {
          const isFieldValid = dirtyFields[field.name] && !errors[field.name];
          const isFieldTouched = touchedFields[field.name];
          
          return (
            <div 
              key={field.name} 
              id={`${field.name}-container`}
              className={cn(
                'form-field',
                field.type === 'checkbox' && 'flex items-start space-y-0 gap-2'
              )}
            >
              {isLoading ? (
                <SkeletonField />
              ) : field.type === 'checkbox' ? (
                <>
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id={field.name}
                      type="checkbox"
                      className={cn(
                        "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500",
                        errors[field.name] && "border-red-500 focus:ring-red-500"
                      )}
                      {...register(field.name)}
                      disabled={field.disabled || isSubmitting}
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor={field.name} className="font-medium text-gray-800">
                      {field.label} 
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                    <AnimatePresence mode="wait">
                      {errors[field.name] && <FieldError error={errors[field.name]?.message as string} />}
                    </AnimatePresence>
                  </div>
                </>
              ) : field.type === 'textarea' ? (
                <FormInputWrapper
                  label={field.label}
                  name={field.name}
                  required={field.required}
                  description={field.description}
                  error={errors[field.name]?.message as string}
                  icon={field.icon}
                  showValidationIcon={showValidationIcons && isFieldTouched}
                  isValid={isFieldValid}
                  isLoading={isLoading}
                >
                  <textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4",
                      field.icon && "pl-10",
                      showValidationIcons && isFieldValid && "pr-10",
                      "transition-all duration-200 ease-in-out",
                      "hover:border-gray-400 hover:shadow",
                      "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-md",
                      errors[field.name] && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                      "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
                      "resize-y min-h-[100px]"
                    )}
                    rows={4}
                    {...register(field.name)}
                    disabled={field.disabled || isSubmitting}
                    onBlur={() => handleFieldBlur(field.name)}
                  />
                </FormInputWrapper>
              ) : field.type === 'select' ? (
                <FormInputWrapper
                  label={field.label}
                  name={field.name}
                  required={field.required}
                  description={field.description}
                  error={errors[field.name]?.message as string}
                  icon={field.icon}
                  showValidationIcon={showValidationIcons && isFieldTouched}
                  isValid={isFieldValid}
                  isLoading={isLoading}
                >
                  <select
                    id={field.name}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4",
                      field.icon && "pl-10",
                      showValidationIcons && isFieldValid && "pr-10",
                      "focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
                      errors[field.name] && "border-red-300 focus:border-red-500 focus:ring-red-500",
                      "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    )}
                    {...register(field.name)}
                    disabled={field.disabled || isSubmitting}
                    onBlur={() => handleFieldBlur(field.name)}
                    ref={index === 0 ? (ref) => { firstInputRef.current = ref; } : undefined}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormInputWrapper>
              ) : field.type === 'radio' ? (
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium text-gray-800">
                    {field.label} 
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </span>
                  
                  {field.description && (
                    <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {field.options?.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          className={cn(
                            "h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500",
                            errors[field.name] && "border-red-300 focus:ring-red-500"
                          )}
                          {...register(field.name)}
                          disabled={field.disabled || isSubmitting}
                          onBlur={() => handleFieldBlur(field.name)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {errors[field.name] && <FieldError error={errors[field.name]?.message as string} />}
                  </AnimatePresence>
                </div>
              ) : (
                <FormInputWrapper
                  label={field.label}
                  name={field.name}
                  required={field.required}
                  description={field.description}
                  error={errors[field.name]?.message as string}
                  icon={field.icon}
                  showValidationIcon={showValidationIcons && isFieldTouched}
                  isValid={isFieldValid}
                  isLoading={isLoading}
                >
                  <input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4",
                      field.icon && "pl-10",
                      showValidationIcons && isFieldValid && "pr-10",
                      "transition-all duration-200 ease-in-out",
                      "hover:border-gray-400 hover:shadow",
                      "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-md",
                      errors[field.name] && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                      "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    )}
                    {...register(field.name)}
                    disabled={field.disabled || isSubmitting}
                    onBlur={() => handleFieldBlur(field.name)}
                    ref={index === 0 ? (ref) => { firstInputRef.current = ref; } : undefined}
                  />
                </FormInputWrapper>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSubmitting || (!isValid && Object.keys(touchedFields).length > 0)}
          className={cn(
            "w-full sm:w-auto relative overflow-hidden group transition-all duration-300",
            "hover:shadow-lg hover:shadow-primary-500/20 active:scale-95"
          )}
        >
          <span className="relative z-10">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    </form>
  );
}
