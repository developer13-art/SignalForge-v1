import React, { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Activity, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';

const RuleTestPanel = forwardRef(function RuleTestPanel(
  {
    rule,
    testCases = [],
    onRunTest,
    onReset,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const runTest = useCallback(async () => {
    if (!onRunTest) {
      return;
    }

    setRunning(true);
    setError(null);
    setResults([]);

    try {
      const nextResults = await onRunTest(rule, testCases);
      setResults(nextResults || []);
    } catch (err) {
      setError(err?.message || 'Test execution failed');
    } finally {
      setRunning(false);
    }
  }, [onRunTest, rule, testCases]);

  const reset = () => {
    setResults([]);
    setError(null);
    if (onReset) {
      onReset();
    }
  };

  const totalTests = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = totalTests - passed;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Activity size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Rule Test Panel
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Simulate this rule against test cases before enabling it
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {results.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={reset} leadingIcon={RotateCcw}>
              Reset
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            onClick={runTest}
            disabled={running || !onRunTest}
            leadingIcon={running ? Loader2 : Activity}
          >
            {running ? 'Running...' : 'Run Test'}
          </Button>
        </div>
      </div>

      {error ? (
        <>
          <Separator spacing="md" />
          <Alert variant="danger" size="sm">
            {error}
          </Alert>
        </>
      ) : null}

      {results.length > 0 ? (
        <>
          <Separator spacing="md" />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Total Tests
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">{totalTests}</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                Passed
              </p>
              <p className="mt-1 text-base font-semibold text-emerald-700">{passed}</p>
            </div>
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-rose-700">
                Failed
              </p>
              <p className="mt-1 text-base font-semibold text-rose-700">{failed}</p>
            </div>
          </div>

          <Separator spacing="md" />

          <ul className="space-y-2">
            {results.map((result, index) => {
              const Icon = result.passed ? CheckCircle2 : XCircle;
              const color = result.passed ? 'text-emerald-600' : 'text-rose-600';
              const bg = result.passed ? 'bg-emerald-50' : 'bg-rose-50';

              return (
                <li
                  key={result.key || index}
                  className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                >
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      bg,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Icon size={14} className={color} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {result.name || `Test case ${index + 1}`}
                    </p>
                    {result.input ? (
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        Input: {typeof result.input === 'string' ? result.input : JSON.stringify(result.input)}
                      </p>
                    ) : null}
                    {result.output ? (
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        Output: {typeof result.output === 'string' ? result.output : JSON.stringify(result.output)}
                      </p>
                    ) : null}
                    {result.message ? (
                      <p
                        className={[
                          'mt-1 text-xs font-medium',
                          color,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {result.message}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : !running ? (
        <>
          <Separator spacing="md" />
          <p className="text-center text-xs text-slate-400">
            No test results yet. Click &quot;Run Test&quot; to simulate this rule.
          </p>
        </>
      ) : null}
    </Card>
  );
});

RuleTestPanel.propTypes = {
  rule: PropTypes.object,
  testCases: PropTypes.arrayOf(PropTypes.object),
  onRunTest: PropTypes.func,
  onReset: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RuleTestPanel;