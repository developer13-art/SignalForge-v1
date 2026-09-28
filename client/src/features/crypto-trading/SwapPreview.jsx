import React, { useMemo } from 'react';
import { ArrowDown, Info } from 'lucide-react';
import TokenIcon from '../../components/domain/crypto/TokenIcon';
import DexBadge from '../../components/domain/crypto/DexBadge';
import SlippageBadge from '../../components/domain/crypto/SlippageBadge';
import PriorityFeeBadge from '../../components/domain/crypto/PriorityFeeBadge';

export default function SwapPreview({ quote, gateway, slippageBps, priorityFee }) {
  if (!quote) {
    return null;
  }

  const priceImpactPct = useMemo(() => {
    const raw = quote.priceImpactPct || quote.price_impact_pct;
    if (raw === undefined || raw === null) {
      return 0;
    }
    const numeric = Number(raw);
    return Math.abs(numeric) > 1 ? Math.abs(numeric) : Math.abs(numeric) * 100;
  }, [quote]);

  const impactTone =
    priceImpactPct > 3
      ? 'text-rose-600'
      : priceImpactPct > 1
      ? 'text-amber-600'
      : 'text-emerald-600';

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Swap Preview</h2>
        {gateway ? <DexBadge gateway={gateway} size="sm" /> : null}
      </header>

      <div className="space-y-2">
        <Row
          label="You pay"
          symbol={quote.inputSymbol || quote.input_symbol}
          amount={quote.inAmount || quote.in_amount}
        />
        <div className="flex justify-center">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ArrowDown size={14} />
          </span>
        </div>
        <Row
          label="You receive"
          symbol={quote.outputSymbol || quote.output_symbol}
          amount={quote.outAmount || quote.out_amount}
          highlight
        />
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
        <InfoRow label="Price impact" value={`${priceImpactPct.toFixed(2)}%`} valueClass={impactTone} />
        {quote.minOutAmount || quote.min_out_amount ? (
          <InfoRow
            label="Minimum received"
            value={`${quote.minOutAmount || quote.min_out_amount} ${quote.outputSymbol || ''}`}
          />
        ) : null}
        <InfoRow label="Slippage" value={<SlippageBadge slippageBps={slippageBps} />} />
        {priorityFee ? (
          <InfoRow label="Priority fee" value={<PriorityFeeBadge level={priorityFee} />} />
        ) : null}
        {quote.routes && quote.routes.length > 0 ? (
          <InfoRow
            label="Route"
            value={`${quote.routes.length} hop${quote.routes.length > 1 ? 's' : ''}`}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded-md bg-sky-50 p-3 text-[11px] text-sky-800">
        <Info size={12} aria-hidden="true" />
        Prices update in real time. Your final amount may vary slightly due to slippage.
      </div>
    </div>
  );
}

function Row({ label, symbol, amount, highlight = false }) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-3 rounded-md border px-3 py-3',
        highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2">
        <TokenIcon symbol={symbol} size="sm" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-sm font-semibold text-slate-900">{symbol || '—'}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-900">{amount || '—'}</p>
    </div>
  );
}

function InfoRow({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={['font-medium text-slate-800', valueClass].filter(Boolean).join(' ')}>
        {value}
      </span>
    </div>
  );
}