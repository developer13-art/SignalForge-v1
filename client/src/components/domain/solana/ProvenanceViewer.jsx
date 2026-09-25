import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Copy, ExternalLink, FileCode2, Hash, Shield } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const ProvenanceViewer = forwardRef(function ProvenanceViewer(
  {
    provenance,
    onVerify,
    onViewExplorer,
    onCopyHash,
    verifying = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!provenance) {
    return null;
  }

  const {
    signalId,
    provider,
    processingHash,
    aiVersion,
    processingVersion,
    anchoredAt,
    txSignature,
    slot,
  } = provenance;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <FileCode2 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Signal Provenance</p>
            {signalId ? (
              <p className="mt-0.5 text-xs text-slate-500">
                Signal <span className="font-mono font-medium text-slate-700">#{signalId}</span>
              </p>
            ) : null}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700">
          <Shield size={12} aria-hidden="true" />
          Anchored
        </span>
      </div>

      <Separator spacing="md" />

      <div className="space-y-3">
        {provider ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">Provider</span>
            <span className="font-semibold text-slate-800">{provider}</span>
          </div>
        ) : null}

        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <Hash size={10} aria-hidden="true" />
            Processing Hash
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
              {processingHash}
            </code>
            {onCopyHash ? (
              <button
                type="button"
                onClick={() => onCopyHash(processingHash)}
                aria-label="Copy hash"
                className="shrink-0 rounded-md border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <Copy size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {aiVersion ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                AI Version
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{aiVersion}</p>
            </div>
          ) : null}

          {processingVersion ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Processing Version
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{processingVersion}</p>
            </div>
          ) : null}

          {slot !== undefined ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Solana Slot
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-800">{slot}</p>
            </div>
          ) : null}

          {anchoredAt ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Anchored At
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{anchoredAt}</p>
            </div>
          ) : null}
        </div>
      </div>

      <Separator spacing="md" />

      <div className="flex flex-wrap items-center gap-2">
        {onVerify ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan-700 disabled:opacity-60"
          >
            <CheckCircle2 size={12} aria-hidden="true" />
            {verifying ? 'Verifying...' : 'Verify On-Chain'}
          </button>
        ) : null}

        {txSignature && onViewExplorer ? (
          <button
            type="button"
            onClick={() => onViewExplorer(txSignature)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ExternalLink size={12} aria-hidden="true" />
            View on Explorer
          </button>
        ) : null}
      </div>
    </Card>
  );
});

ProvenanceViewer.propTypes = {
  provenance: PropTypes.shape({
    signalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    provider: PropTypes.string,
    processingHash: PropTypes.string,
    aiVersion: PropTypes.string,
    processingVersion: PropTypes.string,
    anchoredAt: PropTypes.string,
    txSignature: PropTypes.string,
    slot: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onVerify: PropTypes.func,
  onViewExplorer: PropTypes.func,
  onCopyHash: PropTypes.func,
  verifying: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProvenanceViewer;