import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

const TYPES = {
  string: 'text-emerald-600',
  number: 'text-sky-600',
  boolean: 'text-amber-600',
  null: 'text-slate-400',
  key: 'text-indigo-700',
  punctuation: 'text-slate-400',
};

function getType(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

function JsonNode({ nodeKey, value, depth, expandAll, indentSize }) {
  const type = getType(value);
  const [expanded, setExpanded] = useState(expandAll !== false ? true : depth < 1);
  const indent = ' '.repeat(depth * indentSize);

  const isExpandable = type === 'object' || type === 'array';

  const toggle = () => setExpanded((prev) => !prev);

  if (!isExpandable) {
    let rendered;
    if (type === 'string') {
      rendered = <span className={TYPES.string}>&quot;{value}&quot;</span>;
    } else if (type === 'number') {
      rendered = <span className={TYPES.number}>{value}</span>;
    } else if (type === 'boolean') {
      rendered = <span className={TYPES.boolean}>{String(value)}</span>;
    } else if (type === 'null') {
      rendered = <span className={TYPES.null}>null</span>;
    } else {
      rendered = <span className={TYPES.string}>&quot;{String(value)}&quot;</span>;
    }

    return (
      <div>
        {indent}
        {nodeKey !== undefined ? (
          <>
            <span className={TYPES.key}>&quot;{nodeKey}&quot;</span>
            <span className={TYPES.punctuation}>: </span>
          </>
        ) : null}
        {rendered}
      </div>
    );
  }

  const entries = type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value);
  const isEmpty = entries.length === 0;
  const openBracket = type === 'array' ? '[' : '{';
  const closeBracket = type === 'array' ? ']' : '}';

  return (
    <div>
      <div>
        {indent}
        {nodeKey !== undefined ? (
          <>
            <span className={TYPES.key}>&quot;{nodeKey}&quot;</span>
            <span className={TYPES.punctuation}>: </span>
          </>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-0.5 align-middle hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown size={12} className={TYPES.punctuation} aria-hidden="true" />
          ) : (
            <ChevronRight size={12} className={TYPES.punctuation} aria-hidden="true" />
          )}
          <span className={TYPES.punctuation}>{openBracket}</span>
          {!expanded ? (
            <>
              <span className="text-slate-400">
                {isEmpty ? '' : `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}
              </span>
              <span className={TYPES.punctuation}>{closeBracket}</span>
            </>
          ) : null}
        </button>
      </div>

      {expanded ? (
        <>
          {entries.map(([key, val]) => (
            <JsonNode
              key={key}
              nodeKey={key}
              value={val}
              depth={depth + 1}
              expandAll={expandAll}
              indentSize={indentSize}
            />
          ))}
          <div>
            {indent}
            <span className={TYPES.punctuation}>{closeBracket}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}

const JsonViewer = forwardRef(function JsonViewer(
  {
    data,
    indentSize = 2,
    expandAll = false,
    showCopy = true,
    maxHeight,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);

  const stringified = useMemo(() => {
    try {
      return JSON.stringify(data, null, indentSize);
    } catch (error) {
      return String(error);
    }
  }, [data, indentSize]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(stringified);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = stringified;
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
      className={[
        'relative overflow-hidden rounded-md border border-slate-200 bg-slate-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          aria-label="Copy JSON"
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

      <div
        className="overflow-auto p-3 text-xs leading-relaxed"
        style={{ maxHeight: maxHeight || undefined }}
      >
        <pre className="font-mono text-slate-800">
          <JsonNode
            value={data}
            depth={0}
            expandAll={expandAll}
            indentSize={indentSize}
          />
        </pre>
      </div>
    </div>
  );
});

JsonViewer.propTypes = {
  data: PropTypes.any,
  indentSize: PropTypes.number,
  expandAll: PropTypes.bool,
  showCopy: PropTypes.bool,
  maxHeight: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default JsonViewer;