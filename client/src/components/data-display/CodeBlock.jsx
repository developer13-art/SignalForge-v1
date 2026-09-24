import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Copy } from 'lucide-react';

const SIZES = {
  sm: { container: 'text-xs p-3', lineHeight: 'leading-5' },
  md: { container: 'text-sm p-4', lineHeight: 'leading-6' },
  lg: { container: 'text-base p-5', lineHeight: 'leading-7' },
};

const VARIANTS = {
  default: 'bg-slate-900 text-slate-100 border border-slate-800',
  light: 'bg-slate-50 text-slate-800 border border-slate-200',
  primary: 'bg-indigo-950 text-indigo-100 border border-indigo-900',
  dark: 'bg-black text-slate-100 border border-slate-800',
};

const CodeBlock = forwardRef(function CodeBlock(
  {
    code,
    language,
    filename,
    size = 'md',
    variant = 'default',
    showLineNumbers = false,
    showCopy = true,
    wrap = false,
    maxHeight,
    highlightLines = [],
    className = '',
    preClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  const lines = String(code || '').split('\n');

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      // silent
    }
  };

  return (
    <div
      ref={ref}
      className={['relative overflow-hidden rounded-md', variantClass, className]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {filename || language || showCopy ? (
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-3 py-1.5">
          <div className="flex items-center gap-2 text-xs font-medium">
            {filename ? <span className="text-slate-300">{filename}</span> : null}
            {language ? (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                {language}
              </span>
            ) : null}
          </div>

          {showCopy ? (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-slate-100 hover:bg-white/20"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check size={12} aria-hidden="true" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} aria-hidden="true" /> Copy
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={['overflow-auto', sizeConfig.container, sizeConfig.lineHeight]
          .filter(Boolean)
          .join(' ')}
        style={{ maxHeight: maxHeight || undefined }}
      >
        <pre
          className={[
            'font-mono',
            wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
            preClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showLineNumbers ? (
            <code className="block">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className={[
                    'table-row',
                    highlightLines.includes(index + 1)
                      ? 'bg-yellow-500/20'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="table-cell select-none pr-4 text-right text-slate-500 opacity-60">
                    {index + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
});

CodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string,
  filename: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'light', 'primary', 'dark']),
  showLineNumbers: PropTypes.bool,
  showCopy: PropTypes.bool,
  wrap: PropTypes.bool,
  maxHeight: PropTypes.number,
  highlightLines: PropTypes.arrayOf(PropTypes.number),
  className: PropTypes.string,
  preClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default CodeBlock;
export { VARIANTS as CODE_BLOCK_VARIANTS, SIZES as CODE_BLOCK_SIZES };