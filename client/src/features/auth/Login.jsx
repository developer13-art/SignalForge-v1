import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import Input from '../../components/common/Input';
import Alert from '../../components/feedback/Alert';
import Checkbox from '../../components/common/Checkbox';
import { validators } from '../../components/forms/validators';
import { useAuthContext } from '../../context/AuthContext.jsx';

const REMEMBER_KEY = 'signalforge.remember.email';

const Login = function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const [values, setValues] = useState({
    email: localStorage.getItem(REMEMBER_KEY) || '',
    password: '',
    remember: Boolean(localStorage.getItem(REMEMBER_KEY)),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateEmail = useMemo(
    () => validators.compose(validators.required(), validators.email()),
    [],
  );
  const validatePassword = useMemo(() => validators.required(), []);

  const handleChange = useCallback(
    (field, value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors],
  );

  const validate = useCallback(() => {
    const next = {};
    const emailError = validateEmail(values.email);
    const passwordError = validatePassword(values.password);

    if (emailError) {
      next.email = emailError;
    }
    if (passwordError) {
      next.password = passwordError;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values, validateEmail, validatePassword]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitError(null);

      if (!validate()) {
        return;
      }

      setSubmitting(true);
      try {
        if (values.remember) {
          localStorage.setItem(REMEMBER_KEY, values.email);
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }

        // Delegate to the auth context. It calls the API, persists the
        // access and refresh tokens in localStorage, and updates the
        // context state so that every downstream consumer sees the
        // authenticated user immediately.
        await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });

        const next = location.state?.redirect || '/dashboard';
        navigate(next, { replace: true });
      } catch (error) {
        const message =
          (error && error.message) ||
          'Unable to sign in. Please check your credentials and try again.';
        setSubmitError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, navigate, location.state, login],
  );

  const handleOauth = (provider) => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated" className="bg-surface border border-surface-border shadow-elevated">
        <div className="mb-6 text-center">
          <Heading level={1} size="text-2xl" align="center">
            Welcome back
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            Sign in to continue to SignalForge AI.
          </Text>
        </div>

        {submitError ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {submitError}
            </Alert>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Email" error={errors.email} required>
            {({ id }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="you@example.com"
                leftIcon={Mail}
                error={errors.email}
                required
              />
            )}
          </FormField>

          <FormField label="Password" error={errors.password} required>
            {({ id }) => (
              <PasswordInput
                id={id}
                value={values.password}
                onChange={(value) => handleChange('password', value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                showStrength={false}
              />
            )}
          </FormField>

          <div className="flex items-center justify-between gap-3">
            <Checkbox
              label="Remember me"
              checked={values.remember}
              onChange={(checked) => handleChange('remember', checked)}
            />
            <Link
              to="/forgot-password"
              className="text-small font-medium text-primary-400 hover:text-primary-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            trailingIcon={ArrowRight}
            className="w-full"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-border" />
          <span className="text-caption font-medium uppercase tracking-wide text-text-tertiary">
            or continue with
          </span>
          <span className="h-px flex-1 bg-surface-border" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleOauth('google')}
            className="flex items-center justify-center gap-1.5 rounded-md border border-surface-border bg-surface px-3 py-2 text-small font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOauth('discord')}
            className="flex items-center justify-center gap-1.5 rounded-md border border-surface-border bg-surface px-3 py-2 text-small font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            Discord
          </button>
          <button
            type="button"
            onClick={() => handleOauth('telegram')}
            className="flex items-center justify-center gap-1.5 rounded-md border border-surface-border bg-surface px-3 py-2 text-small font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            Telegram
          </button>
        </div>

        <div className="mt-6 text-center text-small text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-400 hover:text-primary-300 hover:underline"
          >
            Create one
          </Link>
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-caption text-text-tertiary">
        <AlertCircle size={12} aria-hidden="true" />
        <span>Protected by enterprise-grade security</span>
      </div>
    </Container>
  );
};

export default Login;