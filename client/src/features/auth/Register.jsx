import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Phone, ArrowRight, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import PhoneInput from '../../components/forms/PhoneInput';
import Checkbox from '../../components/common/Checkbox';
import Alert from '../../components/feedback/Alert';
import { validators } from '../../components/forms/validators';

const Register = function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const referralCode = searchParams.get('ref') || '';
  const preselectedPlan = searchParams.get('plan') || '';

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agree: false,
    referralCode,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateEmail = useMemo(() => validators.compose(validators.required(), validators.email()), []);
  const validatePhone = useMemo(() => validators.compose(validators.required(), validators.phone()), []);
  const validatePassword = useMemo(
    () =>
      validators.compose(
        validators.required(),
        validators.password({ min: 8, requireUppercase: true, requireLowercase: true, requireNumber: true }),
      ),
    [],
  );
  const validateName = useMemo(() => validators.compose(validators.required(), validators.minLength(2)), []);

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

    const firstNameError = validateName(values.firstName);
    const lastNameError = validateName(values.lastName);
    const emailError = validateEmail(values.email);
    const phoneError = validatePhone(values.phone);
    const passwordError = validatePassword(values.password);

    if (firstNameError) {
      next.firstName = 'Please enter your first name';
    }
    if (lastNameError) {
      next.lastName = 'Please enter your last name';
    }
    if (emailError) {
      next.email = emailError;
    }
    if (phoneError) {
      next.phone = phoneError;
    }
    if (passwordError) {
      next.password = passwordError;
    }
    if (!values.agree) {
      next.agree = 'You must accept the terms to continue';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values, validateName, validateEmail, validatePhone, validatePassword]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitError(null);

      if (!validate()) {
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.trim(),
            password: values.password,
            referralCode: values.referralCode || undefined,
            plan: preselectedPlan || undefined,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          const message = payload?.error?.message || 'Registration failed. Please try again.';
          setSubmitError(message);
          return;
        }

        navigate(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`, {
          replace: true,
        });
      } catch (_error) {
        setSubmitError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, navigate, preselectedPlan],
  );

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 text-center">
          <Heading level={1} size="text-2xl" align="center">
            Create your account
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            Start your 7-day free trial. No credit card required.
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First Name" error={errors.firstName} required>
              {({ id }) => (
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id={id}
                    type="text"
                    autoComplete="given-name"
                    value={values.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </FormField>

            <FormField label="Last Name" error={errors.lastName} required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(event) => handleChange('lastName', event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </FormField>
          </div>

          <FormField label="Email" error={errors.email} required>
            {({ id }) => (
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </FormField>

          <FormField label="Phone Number" error={errors.phone} required>
            {() => (
              <PhoneInput
                value={values.phone}
                onChange={(value) => handleChange('phone', value)}
                defaultCountry="NG"
                placeholder="Your phone number"
              />
            )}
          </FormField>

          <FormField label="Password" error={errors.password} required>
            {({ id }) => (
              <PasswordInput
                id={id}
                value={values.password}
                onChange={(value) => handleChange('password', value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                showStrength
                showRequirements
              />
            )}
          </FormField>

          {referralCode ? (
            <FormField label="Referral Code">
              {() => (
                <input
                  type="text"
                  value={values.referralCode}
                  readOnly
                  className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              )}
            </FormField>
          ) : null}

          <div>
            <Checkbox
              label={
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="font-medium text-indigo-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-medium text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              }
              checked={values.agree}
              onChange={(checked) => handleChange('agree', checked)}
            />
            {errors.agree ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.agree}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            trailingIcon={ArrowRight}
            className="w-full"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-500">
        <div className="flex items-start gap-1.5">
          <Check size={12} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Check size={12} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>7-day free trial</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Check size={12} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </Container>
  );
};

export default Register;