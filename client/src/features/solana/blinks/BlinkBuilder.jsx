import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';

import { createBlink } from '../../../api/solana-blinks.api';
import BlinkTemplateSelector from './BlinkTemplateSelector';
import BlinkPreview from './BlinkPreview';
import { BLINK_TEMPLATE_METADATA } from '../../../../../shared/src/constants/solana-actions/blink-templates';
import { SUPPORTED_TOKENS } from '../../../../../shared/src/constants/solana-actions/supported-tokens';

const INITIAL_FORM = {
  templateType: 'subscribe',
  title: '',
  description: '',
  label: '',
  message: '',
  iconUrl: '',
  website: '',
  planId: '',
  referralCode: '',
  providerId: '',
  tokenSymbol: 'USDC',
  amount: '',
  amountDecimals: '',
  metadata: {},
};

const FIELD_CLASS =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50';
const LABEL_CLASS = 'mb-1 block text-xs font-medium text-slate-700';

function validateForm(form) {
  const errors = {};
  const definition = BLINK_TEMPLATE_METADATA[form.templateType];

  if (!form.title || form.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (form.title.length > 80) {
    errors.title = 'Title must be 80 characters or fewer';
  }

  if (!form.description || form.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (form.description.length > 300) {
    errors.description = 'Description must be 300 characters or fewer';
  }

  if (!form.label || form.label.trim().length === 0) {
    errors.label = 'Button label is required';
  } else if (form.label.length > 40) {
    errors.label = 'Button label must be 40 characters or fewer';
  }

  if (form.message && form.message.length > 200) {
    errors.message = 'Message must be 200 characters or fewer';
  }

  if (form.website && !/^https?:\/\//i.test(form.website)) {
    errors.website = 'Website must start with http:// or https://';
  }

  if (definition && definition.requiresAmount) {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
  }

  if (form.templateType === 'subscribe' && !form.planId) {
    errors.planId = 'Plan is required for subscription blinks';
  }

  if (form.templateType === 'referral' && !form.referralCode) {
    errors.referralCode = 'Referral code is required for referral blinks';
  }

  if (form.templateType === 'tip' && !form.providerId) {
    errors.providerId = 'Provider is required for tip blinks';
  }

  return errors;
}

export default function BlinkBuilder() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const definition = useMemo(
    () => BLINK_TEMPLATE_METADATA[form.templateType] || {},
    [form.templateType],
  );

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleTemplateChange = useCallback((templateType) => {
    const templateDef = BLINK_TEMPLATE_METADATA[templateType];
    setForm((prev) => ({
      ...prev,
      templateType,
      label: prev.label || templateDef.defaultLabel,
      title: prev.title || templateDef.defaultTitle,
      description: prev.description || templateDef.defaultDescription,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Please correct the highlighted fields');
        return;
      }

      setSubmitting(true);

      try {
        const payload = {
          templateType: form.templateType,
          title: form.title.trim(),
          description: form.description.trim(),
          label: form.label.trim(),
          message: form.message.trim() || undefined,
          iconUrl: form.iconUrl.trim() || undefined,
          website: form.website.trim() || undefined,
          planId: form.planId.trim() || undefined,
          referralCode: form.referralCode.trim() || undefined,
          providerId: form.providerId.trim() || undefined,
          tokenSymbol: form.tokenSymbol,
          amount: form.amount !== '' ? Number(form.amount) : undefined,
          amountDecimals:
            form.amountDecimals !== '' ? Number.parseInt(form.amountDecimals, 10) : undefined,
          metadata: form.metadata,
        };

        const blink = await createBlink(payload);
        toast.success('Blink created successfully');
        navigate(`/solana/blinks/${blink.id}`);
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to create the Blink';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [form, navigate],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Create a Blink</h1>
            <p className="text-sm text-slate-500">
              Publish a Solana Action that anyone can interact with directly from X or a wallet.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Eye size={14} />
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <div className={['grid gap-6', showPreview ? 'lg:grid-cols-3' : ''].filter(Boolean).join(' ')}>
        <form
          onSubmit={handleSubmit}
          className={['space-y-6', showPreview ? 'lg:col-span-2' : ''].filter(Boolean).join(' ')}
          noValidate
        >
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Template</h2>
            <BlinkTemplateSelector value={form.templateType} onChange={handleTemplateChange} />
          </section>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Presentation</h2>

            <div>
              <label className={LABEL_CLASS} htmlFor="blink-title">
                Title
              </label>
              <input
                id="blink-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                maxLength={80}
                className={FIELD_CLASS}
                placeholder={definition.defaultTitle || 'Enter a title'}
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  {form.title.length}/80 characters
                </p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="blink-description">
                Description
              </label>
              <textarea
                id="blink-description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                maxLength={300}
                rows={3}
                className={FIELD_CLASS}
                placeholder={definition.defaultDescription || 'Describe what this Blink does'}
              />
              {errors.description ? (
                <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  {form.description.length}/300 characters
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="blink-label">
                  Button label
                </label>
                <input
                  id="blink-label"
                  type="text"
                  value={form.label}
                  onChange={(event) => updateField('label', event.target.value)}
                  maxLength={40}
                  className={FIELD_CLASS}
                  placeholder={definition.defaultLabel || 'Continue'}
                />
                {errors.label ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.label}</p>
                ) : null}
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="blink-icon">
                  Icon URL (optional)
                </label>
                <input
                  id="blink-icon"
                  type="url"
                  value={form.iconUrl}
                  onChange={(event) => updateField('iconUrl', event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="blink-message">
                Short message (optional)
              </label>
              <input
                id="blink-message"
                type="text"
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                maxLength={200}
                className={FIELD_CLASS}
                placeholder="A short note shown to the user before they sign"
              />
              {errors.message ? (
                <p className="mt-1 text-xs text-rose-600">{errors.message}</p>
              ) : null}
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="blink-website">
                Website (optional)
              </label>
              <input
                id="blink-website"
                type="url"
                value={form.website}
                onChange={(event) => updateField('website', event.target.value)}
                className={FIELD_CLASS}
                placeholder="https://signalforge.ai"
              />
              {errors.website ? (
                <p className="mt-1 text-xs text-rose-600">{errors.website}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Context</h2>

            {form.templateType === 'subscribe' || form.templateType === 'upgrade' ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="blink-plan">
                  Plan identifier
                </label>
                <input
                  id="blink-plan"
                  type="text"
                  value={form.planId}
                  onChange={(event) => updateField('planId', event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="PLAN_MONTHLY"
                />
                {errors.planId ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.planId}</p>
                ) : null}
              </div>
            ) : null}

            {form.templateType === 'referral' || form.templateType === 'subscribe' ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="blink-referral">
                  Referral code (optional)
                </label>
                <input
                  id="blink-referral"
                  type="text"
                  value={form.referralCode}
                  onChange={(event) =>
                    updateField('referralCode', event.target.value.toUpperCase())
                  }
                  className={FIELD_CLASS}
                  placeholder="SF123ABC"
                />
                {errors.referralCode ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.referralCode}</p>
                ) : null}
              </div>
            ) : null}

            {form.templateType === 'tip' ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="blink-provider">
                  Provider identifier
                </label>
                <input
                  id="blink-provider"
                  type="text"
                  value={form.providerId}
                  onChange={(event) => updateField('providerId', event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Provider identifier"
                />
                {errors.providerId ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.providerId}</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Payment</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="blink-token">
                  Token
                </label>
                <select
                  id="blink-token"
                  value={form.tokenSymbol}
                  onChange={(event) => updateField('tokenSymbol', event.target.value)}
                  className={FIELD_CLASS}
                >
                  {SUPPORTED_TOKENS.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} — {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {definition.requiresAmount ? (
                <div>
                  <label className={LABEL_CLASS} htmlFor="blink-amount">
                    Amount
                  </label>
                  <input
                    id="blink-amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={form.amount}
                    onChange={(event) => updateField('amount', event.target.value)}
                    className={FIELD_CLASS}
                    placeholder="0.00"
                  />
                  {errors.amount ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label className={LABEL_CLASS} htmlFor="blink-decimals">
                  Decimals (optional)
                </label>
                <input
                  id="blink-decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={form.amountDecimals}
                  onChange={(event) => updateField('amountDecimals', event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Auto"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={14} />
              {submitting ? 'Creating...' : 'Create Blink'}
            </button>
          </div>
        </form>

        {showPreview ? (
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <BlinkPreview
                title={form.title || definition.defaultTitle}
                description={form.description || definition.defaultDescription}
                label={form.label || definition.defaultLabel}
                iconUrl={form.iconUrl}
                amount={form.amount}
                tokenSymbol={form.tokenSymbol}
                website={form.website}
              />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}