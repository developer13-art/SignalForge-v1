import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Dna, Brain, Languages, TrendingUp, BookOpen } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

const ProviderDnaCard = forwardRef(function ProviderDnaCard(
  {
    dna,
    compact = false,
    showRules = true,
    showConfidence = true,
    showLanguage = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!dna) {
    return null;
  }

  const {
    confidence,
    language,
    preferredSymbols = [],
    abbreviations = [],
    managementRules = [],
    version,
    lastUpdated,
  } = dna;

  return (
    <Card ref={ref} padding={compact ? 'sm' : 'lg'} className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Dna size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Provider DNA
            </h3>
            {version ? (
              <p className="text-[11px] text-slate-400">Version {version}</p>
            ) : null}
          </div>
        </div>

        {showConfidence && confidence !== undefined ? (
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Confidence
            </p>
            <p className="text-base font-bold text-indigo-600">
              {Math.round(confidence <= 1 ? confidence * 100 : confidence)}%
            </p>
          </div>
        ) : null}
      </div>

      {showConfidence && confidence !== undefined ? (
        <div className="mt-3">
          <ProgressBar
            value={confidence <= 1 ? confidence * 100 : confidence}
            max={100}
            variant="primary"
            size="sm"
          />
        </div>
      ) : null}

      <Separator spacing="md" />

      {showLanguage && language ? (
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <Languages size={14} className="text-slate-400" aria-hidden="true" />
          <span className="font-medium">Language:</span>
          <span>{language}</span>
        </div>
      ) : null}

      {preferredSymbols.length > 0 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Preferred Symbols
            </p>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {preferredSymbols.map((symbol, index) => (
              <span
                key={index}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {symbol}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {abbreviations.length > 0 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <BookOpen size={14} className="text-slate-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Learned Abbreviations
            </p>
          </div>
          <ul className="mb-4 space-y-1.5">
            {abbreviations.slice(0, 6).map((rule, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5"
              >
                <span className="text-xs font-medium text-slate-700">
                  &quot;{rule.term}&quot;
                </span>
                <span className="text-xs text-slate-500">→ {rule.meaning}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {showRules && managementRules.length > 0 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <Brain size={14} className="text-slate-400" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trade Management Rules
            </p>
          </div>
          <ul className="space-y-1.5">
            {managementRules.slice(0, 6).map((rule, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5"
              >
                <span className="text-xs font-medium text-slate-700">
                  &quot;{rule.phrase}&quot;
                </span>
                <span className="text-xs text-slate-500">→ {rule.action}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {lastUpdated ? (
        <p className="mt-4 text-[11px] text-slate-400">Last updated: {lastUpdated}</p>
      ) : null}
    </Card>
  );
});

ProviderDnaCard.propTypes = {
  dna: PropTypes.shape({
    confidence: PropTypes.number,
    language: PropTypes.string,
    preferredSymbols: PropTypes.arrayOf(PropTypes.string),
    abbreviations: PropTypes.arrayOf(
      PropTypes.shape({ term: PropTypes.string, meaning: PropTypes.string })
    ),
    managementRules: PropTypes.arrayOf(
      PropTypes.shape({ phrase: PropTypes.string, action: PropTypes.string })
    ),
    version: PropTypes.string,
    lastUpdated: PropTypes.string,
  }),
  compact: PropTypes.bool,
  showRules: PropTypes.bool,
  showConfidence: PropTypes.bool,
  showLanguage: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderDnaCard;