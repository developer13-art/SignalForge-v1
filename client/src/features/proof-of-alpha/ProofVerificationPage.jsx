import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Search, CheckCircle2, XCircle } from 'lucide-react';

import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { verifyProof, verifyOnChain } from '../../api/proof-of-alpha.api';

export default function ProofVerificationPage() {
  const { signature: routeSignature } = useParams();
  const [signature, setSignature] = useState(routeSignature || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback(
    async (value) => {
      if (!value) {
        setError('Please enter a transaction signature');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await verifyProof(value);
        setResult(data);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Verification failed');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const verifyRaw = useCallback(async (value) => {
    if (!value) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOnChain(value);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'On-chain lookup failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeSignature) {
      verify(routeSignature);
    }
  }, [routeSignature, verify]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      verify(signature);
    },
    [signature, verify],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck size={24} className="text-emerald-600" />
          <h1 className="text-xl font-semibold text-slate-900">Verify a Proof</h1>
        </div>
        <p className="text-sm text-slate-500">
          Enter a transaction signature to verify that it matches the SignalForge on-chain proof
          record.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={signature}
            onChange={(event) => setSignature(event.target.value)}
            placeholder="Paste a Solana transaction signature"
            className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          Verify
        </button>
      </form>

      <button
        type="button"
        onClick={() => verifyRaw(signature)}
        disabled={!signature || loading}
        className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline disabled:opacity-50"
      >
        Or check on-chain without matching an internal proof
      </button>

      {loading ? (
        <LoadingState label="Verifying" />
      ) : error ? (
        <ErrorState description={error} />
      ) : result ? (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.valid && result.matches ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <XCircle size={20} className="text-rose-600" />
              )}
              <p className="text-base font-semibold text-slate-900">
                {result.valid && result.matches ? 'Verified' : 'Not Verified'}
              </p>
            </div>
            <VerifiedOnChainBadge
              level={result.level || (result.valid ? 'verified' : 'partial')}
            />
          </div>

          {result.signature ? (
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Signature</p>
              <MemoTransactionLink signature={result.signature} showCopy />
            </div>
          ) : null}

          {result.reason ? (
            <p className="text-sm text-slate-600">
              <span className="font-medium">Reason: </span>
              {result.reason}
            </p>
          ) : null}

          {result.parsed ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                Parsed Payload
              </p>
              <pre className="max-h-72 overflow-auto rounded-md bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
                {JSON.stringify(result.parsed, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}