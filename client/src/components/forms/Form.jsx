import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const FormContext = React.createContext(null);

export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
}

const Form = forwardRef(function Form(
  {
    children,
    initialValues = {},
    onSubmit,
    onReset,
    validate,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    resetOnSubmit = false,
    className = '',
    noValidate = true,
    testId,
    ...rest
  },
  ref,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const runValidation = useCallback(
    (nextValues = values) => {
      if (!validate) {
        return {};
      }
      const nextErrors = validate(nextValues) || {};
      setErrors(nextErrors);
      return nextErrors;
    },
    [validate, values],
  );

  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (validateOnChange) {
          runValidation(next);
        }
        return next;
      });
    },
    [validateOnChange, runValidation],
  );

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback(
    (name, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));
      if (isTouched && validateOnBlur) {
        runValidation();
      }
    },
    [validateOnBlur, runValidation],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitError(null);

      const nextErrors = validateOnSubmit ? runValidation() : {};
      const hasErrors = Object.values(nextErrors).some(Boolean);

      if (hasErrors) {
        return;
      }

      if (!onSubmit) {
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit(values, { setErrors, setSubmitError, setFieldValue, setFieldError });
        if (resetOnSubmit) {
          setValues(initialValues);
          setTouched({});
          setErrors({});
        }
      } catch (error) {
        setSubmitError(error?.message || 'Submission failed');
      } finally {
        setSubmitting(false);
      }
    },
    [
      runValidation,
      validateOnSubmit,
      onSubmit,
      values,
      resetOnSubmit,
      initialValues,
      setFieldValue,
      setFieldError,
    ],
  );

  const handleReset = useCallback(
    (event) => {
      event.preventDefault();
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setSubmitError(null);
      if (onReset) {
        onReset(event);
      }
    },
    [initialValues, onReset],
  );

  const contextValue = useMemo(
    () => ({
      values,
      errors,
      touched,
      submitting,
      submitError,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      runValidation,
      setValues,
      setErrors,
      setTouched,
    }),
    [
      values,
      errors,
      touched,
      submitting,
      submitError,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      runValidation,
    ],
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={ref}
        onSubmit={handleSubmit}
        onReset={handleReset}
        noValidate={noValidate}
        className={className}
        data-testid={testId}
        {...rest}
      >
        {typeof children === 'function'
          ? children({ values, errors, touched, submitting, submitError })
          : children}
      </form>
    </FormContext.Provider>
  );
});

Form.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  validate: PropTypes.func,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnSubmit: PropTypes.bool,
  resetOnSubmit: PropTypes.bool,
  className: PropTypes.string,
  noValidate: PropTypes.bool,
  testId: PropTypes.string,
};

export default Form;