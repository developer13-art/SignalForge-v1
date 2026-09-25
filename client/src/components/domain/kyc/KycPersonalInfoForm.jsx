import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { User, Calendar, Globe, MapPin, Phone } from 'lucide-react';
import Form from '../../forms/Form';
import FormField from '../../forms/FormField';
import PhoneInput from '../../forms/PhoneInput';
import Button from '../../common/Button';

const COUNTRIES = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'KE', label: 'Kenya' },
  { value: 'GH', label: 'Ghana' },
  { value: 'EG', label: 'Egypt' },
  { value: 'IN', label: 'India' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AU', label: 'Australia' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'TR', label: 'Turkey' },
];

const KycPersonalInfoForm = forwardRef(function KycPersonalInfoForm(
  {
    defaultValues,
    onSubmit,
    onBack,
    submitting = false,
    error,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const validate = (values) => {
    const errors = {};

    if (!values.firstName || !values.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!values.lastName || !values.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!values.nationality) {
      errors.nationality = 'Nationality is required';
    }
    if (!values.country) {
      errors.country = 'Country of residence is required';
    }
    if (!values.address || !values.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!values.phone) {
      errors.phone = 'Phone number is required';
    }

    return errors;
  };

  return (
    <Form
      ref={ref}
      initialValues={
        defaultValues || {
          firstName: '',
          middleName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          country: '',
          address: '',
          phone: '',
        }
      }
      validate={validate}
      onSubmit={onSubmit}
      className={['space-y-4', className].filter(Boolean).join(' ')}
      testId={testId}
      {...rest}
    >
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {typeof error === 'string' ? error : error.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField name="firstName" label="First Name" required>
          {({ value, onChange, name, id }) => (
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id={id}
                name={name}
                type="text"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </FormField>

        <FormField name="middleName" label="Middle Name">
          {({ value, onChange, name, id }) => (
            <input
              id={id}
              name={name}
              type="text"
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </FormField>
      </div>

      <FormField name="lastName" label="Last Name" required>
        {({ value, onChange, name, id }) => (
          <input
            id={id}
            name={name}
            type="text"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        )}
      </FormField>

      <FormField name="dateOfBirth" label="Date of Birth" required>
        {({ value, onChange, name, id }) => (
          <div className="relative">
            <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id={id}
              name={name}
              type="date"
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField name="nationality" label="Nationality" required>
          {({ value, onChange, name, id }) => (
            <div className="relative">
              <Globe size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
              <select
                id={id}
                name={name}
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select nationality</option>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FormField>

        <FormField name="country" label="Country of Residence" required>
          {({ value, onChange, name, id }) => (
            <div className="relative">
              <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
              <select
                id={id}
                name={name}
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FormField>
      </div>

      <FormField name="address" label="Residential Address" required>
        {({ value, onChange, name, id }) => (
          <div className="relative">
            <MapPin size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" />
            <textarea
              id={id}
              name={name}
              rows={3}
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <FormField name="phone" label="Phone Number" required>
        {({ value, onChange, name, id }) => (
          <div className="relative">
            <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
            <PhoneInput
              id={id}
              name={name}
              value={value || ''}
              onChange={(nextValue) => onChange(nextValue)}
              defaultCountry="NG"
              className="pl-0"
            />
          </div>
        )}
      </FormField>

      <div className="flex items-center justify-between gap-3 pt-4">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </Form>
  );
});

KycPersonalInfoForm.propTypes = {
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onBack: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycPersonalInfoForm;