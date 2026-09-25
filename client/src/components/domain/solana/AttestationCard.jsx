import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { BadgeCheck, ExternalLink, Copy, ShieldCheck, FileSignature } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const ATTESTATION_TYPES = {
  certification: { label: 'Certification', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dna: { label: 'Provider DNA', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  reputation: { label: 'Reputation', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const AttestationCard = forwardRef(function AttestationCard(
  {
    attestation,
    onViewExplorer,
    onCopyHash,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!attestation) {
    return null;
  }

  const {
    type = 'certification',
    provider,
    attestationHash,
    txSignature,
    slot,
    verifiedAt,
    data,
  } = attestation;

  const typeConfig = ATTESTATION_TYPES[type] || ATTESTATION_TYPES.certification;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <FileSignature size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">On-Chain Attestation</p>
              <span
                className={[
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                  typeConfig.color,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {typeConfig.label}
              </span>
            </div>
            {provider ? (
              <p className="mt-0.5 text-xs text-slate-500">Provider: {provider}</p>
            ) : null}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
          <BadgeCheck size={12} aria-hidden="true" />
          Verified
        </span>
      </div>

      <Separator spacing="md" />

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Attestation Hash
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
              {attestationHash}
            </code>
            {onCopyHash ? (
              <button
                type="button"
                onClick={() => onCopyHash(attestationHash)}
                aria-label="Copy hash"
                className="shrink-0 rounded-md border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <Copy size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {slot !== undefined ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Solana Slot
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{slot}</p>
            </div>
          ) : null}

          {verifiedAt ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Anchored At
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{verifiedAt}</p>
            </div>
          ) : null}
        </div>

        {data && Object.keys(data).length > 0 ? (
          <>
            <Separator spacing="sm" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Public Attestation Data
              </p>
              <dl className="mt-2 space-y-1.5">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 text-xs">
                    <dt className="text-slate-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                    </dt>
                    <dd className="font-medium text-slate-800">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        ) : null}
      </div>

      {txSignature && onViewExplorer ? (
        <>
          <Separator spacing="md" />
          <button
            type="button"
            onClick={() => onViewExplorer(txSignature)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            <ShieldCheck size={12} aria-hidden="true" />
            Verify on Solana Explorer
            <ExternalLink size={11} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </Card>
  );
});

AttestationCard.propTypes = {
  attestation: PropTypes.shape({
    type: PropTypes.oneOf(['certification', 'dna', 'reputation']),
    provider: PropTypes.string,
    attestationHash: PropTypes.string,
    txSignature: PropTypes.string,
    slot: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    verifiedAt: PropTypes.string,
    data: PropTypes.object,
  }),
  onViewExplorer: PropTypes.func,
  onCopyHash: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default AttestationCard;