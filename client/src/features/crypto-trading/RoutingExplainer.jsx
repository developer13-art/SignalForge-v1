import React, { useMemo } from 'react';
import { Route, Shield, Zap, CheckCircle2, Info } from 'lucide-react';
import DexBadge from '../../components/domain/crypto/DexBadge';
import { DEX_REGISTRY } from '../../../../shared/src/constants/crypto-pairs/dex-registry';

export default function RoutingExplainer({ canonicalSymbol, resolvedGateway, instrumentClass }) {
  const isPerp = String(canonicalSymbol || '').toUpperCase().endsWith('-PERP');
  const isCrypto = instrumentClass?.startsWith('crypto');

  const candidates = useMemo(() => {
    if (isPerp) {
      return Object.values(DEX_REGISTRY).filter((entry) => entry.type === 'perp');
    }
    return Object.values(DEX_REGISTRY).filter((entry) => entry.type === 'dex');
  }, [isPerp]);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex items-center gap-2">
        <Route size={16} className="text-slate-600" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-900">Routing Explanation</h2>
      </header>

      <p className="text-xs text-slate-500">
        SignalForge routes every crypto order automatically based on the instrument class, your
        routing policy, and gateway availability. No action is required on your side.
      </p>

      <div className="space-y-2">
        <Row
          icon={Info}
          iconClass="text-sky-600"
          label="Instrument"
          value={
            isCrypto
              ? isPerp
                ? 'Crypto Perpetual'
                : 'Crypto Spot'
              : 'Traditional Instrument'
          }
        />

        <Row
          icon={Route}
          iconClass="text-indigo-600"
          label="Selected gateway"
          value={resolvedGateway ? <DexBadge gateway={resolvedGateway} size="sm" /> : '—'}
        />

        <Row
          icon={Shield}
          iconClass="text-emerald-600"
          label="Risk gating"
          value="Every order passes risk and KYC checks before submission"
        />

        <Row
          icon={Zap}
          iconClass="text-amber-600"
          label="Fallback strategy"
          value={
            isPerp
              ? 'Hyperliquid → Drift'
              : 'Jupiter → Raydium → Orca'
          }
        />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Candidate gateways for this instrument
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((entry) => (
            <div
              key={entry.key}
              className={[
                'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs',
                entry.key === resolvedGateway
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-white text-slate-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {entry.key === resolvedGateway ? (
                <CheckCircle2 size={12} className="text-indigo-600" />
              ) : null}
              <span className="font-medium">{entry.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span
        className={[
          'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white',
          iconClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon size={12} aria-hidden="true" />
      </span>
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-800">{value}</span>
      </div>
    </div>
  );
}