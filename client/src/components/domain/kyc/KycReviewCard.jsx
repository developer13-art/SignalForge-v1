import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Clock, FileText, Eye, User as UserIcon, Loader2 } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import KycStatusBadge from './KycStatusBadge';

const KycReviewCard = forwardRef(function KycReviewCard(
  {
    application,
    onApprove,
    onReject,
    onRequestResubmission,
    onViewDocument,
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!application) {
    return null;
  }

  const {
    applicantName,
    applicantEmail,
    submittedAt,
    status,
    documentType,
    documentNumber,
    country,
    dateOfBirth,
    automatedChecks = {},
    riskScore,
    riskFlags = [],
  } = application;

  const checks = [
    { key: 'documentReadable', label: 'Document Readable', value: automatedChecks.documentReadable },
    { key: 'fieldsDetected', label: 'Required Fields Detected', value: automatedChecks.fieldsDetected },
    { key: 'livenessCompleted', label: 'Liveness Completed', value: automatedChecks.livenessCompleted },
    { key: 'nameMatch', label: 'Name Match', value: automatedChecks.nameMatch },
    { key: 'dobMatch', label: 'Date of Birth Match', value: automatedChecks.dobMatch },
    { key: 'providerResponse', label: 'Provider Response Received', value: automatedChecks.providerResponse },
  ];

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{applicantName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{applicantEmail}</p>
        </div>
        <KycStatusBadge status={status} size="md" />
      </div>

      <Separator spacing="md" />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {submittedAt ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Submitted
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <Clock size={12} aria-hidden="true" />
              {submittedAt}
            </dd>
          </div>
        ) : null}

        {country ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Country
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{country}</dd>
          </div>
        ) : null}

        {documentType ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Document Type
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <FileText size={12} aria-hidden="true" />
              {documentType}
            </dd>
          </div>
        ) : null}

        {documentNumber ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Document Number
            </dt>
            <dd className="mt-1 font-mono text-sm font-medium text-slate-900">{documentNumber}</dd>
          </div>
        ) : null}

        {dateOfBirth ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Date of Birth
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <UserIcon size={12} aria-hidden="true" />
              {dateOfBirth}
            </dd>
          </div>
        ) : null}

        {riskScore !== undefined ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Risk Score
            </dt>
            <dd
              className={[
                'mt-1 text-sm font-semibold',
                Number(riskScore) > 70
                  ? 'text-rose-600'
                  : Number(riskScore) > 40
                  ? 'text-amber-600'
                  : 'text-emerald-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {riskScore}
            </dd>
          </div>
        ) : null}
      </dl>

      <Separator spacing="md" />

      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Automated Checks
      </h4>

      <ul className="mt-3 space-y-2">
        {checks
          .filter((check) => check.value !== undefined)
          .map((check) => (
            <li key={check.key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">{check.label}</span>
              {check.value ? (
                <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
              ) : (
                <XCircle size={16} className="text-rose-600" aria-hidden="true" />
              )}
            </li>
          ))}
      </ul>

      {riskFlags.length > 0 ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-semibold text-rose-900">Risk Flags</p>
            <ul className="mt-2 space-y-1">
              {riskFlags.map((flag, index) => (
                <li key={index} className="text-xs text-rose-800">
                  · {flag}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {onViewDocument ? (
        <>
          <Separator spacing="md" />
          <button
            type="button"
            onClick={onViewDocument}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Eye size={14} aria-hidden="true" />
            View Identity Document
          </button>
        </>
      ) : null}

      {onApprove || onReject || onRequestResubmission ? (
        <>
          <Separator spacing="md" />
          <div className="flex flex-wrap items-center gap-2">
            {onApprove ? (
              <button
                type="button"
                onClick={onApprove}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={14} aria-hidden="true" />
                )}
                Approve
              </button>
            ) : null}

            {onRequestResubmission ? (
              <button
                type="button"
                onClick={onRequestResubmission}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-60"
              >
                Request Resubmission
              </button>
            ) : null}

            {onReject ? (
              <button
                type="button"
                onClick={onReject}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                <XCircle size={14} aria-hidden="true" />
                Reject
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
});

KycReviewCard.propTypes = {
  application: PropTypes.shape({
    applicantName: PropTypes.string,
    applicantEmail: PropTypes.string,
    submittedAt: PropTypes.string,
    status: PropTypes.string,
    documentType: PropTypes.string,
    documentNumber: PropTypes.string,
    country: PropTypes.string,
    dateOfBirth: PropTypes.string,
    automatedChecks: PropTypes.shape({
      documentReadable: PropTypes.bool,
      fieldsDetected: PropTypes.bool,
      livenessCompleted: PropTypes.bool,
      nameMatch: PropTypes.bool,
      dobMatch: PropTypes.bool,
      providerResponse: PropTypes.bool,
    }),
    riskScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    riskFlags: PropTypes.arrayOf(PropTypes.string),
  }),
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onRequestResubmission: PropTypes.func,
  onViewDocument: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycReviewCard;