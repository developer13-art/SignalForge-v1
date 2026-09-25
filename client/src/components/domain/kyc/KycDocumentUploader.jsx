import React, { forwardRef, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

const ACCEPT_DEFAULT = 'image/jpeg,image/jpg,image/png,application/pdf';
const MAX_SIZE_DEFAULT = 10 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const KycDocumentUploader = forwardRef(function KycDocumentUploader(
  {
    label = 'Upload Document',
    description = 'Upload a clear photo or scan of your identity document',
    accept = ACCEPT_DEFAULT,
    maxSize = MAX_SIZE_DEFAULT,
    value,
    onChange,
    onError,
    disabled = false,
    error,
    required = false,
    multiple = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const files = Array.isArray(value) ? value : value ? [value] : [];

  const validateFile = useCallback(
    (file) => {
      if (maxSize && file.size > maxSize) {
        return `File exceeds ${formatSize(maxSize)} limit`;
      }
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const typeMatch = acceptedTypes.some(
        (type) =>
          type === file.type ||
          (type.endsWith('/*') && file.type.startsWith(type.replace('/*', '/')))
      );
      if (!typeMatch) {
        return 'File type not supported';
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const newFiles = Array.from(fileList || []);
      const validFiles = [];
      let hasError = null;

      for (const file of newFiles) {
        const err = validateFile(file);
        if (err) {
          hasError = err;
          break;
        }
        validFiles.push(file);
      }

      if (hasError) {
        setInternalError(hasError);
        if (onError) {
          onError(hasError);
        }
        return;
      }

      setInternalError(null);

      if (onChange) {
        onChange(multiple ? [...files, ...validFiles] : validFiles[0]);
      }
    },
    [files, multiple, validateFile, onChange, onError]
  );

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) {
      return;
    }
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index) => {
    if (disabled) {
      return;
    }
    const next = files.filter((_, i) => i !== index);
    if (onChange) {
      onChange(multiple ? next : next[0] || null);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const displayError = error || internalError;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <div className="mb-2">
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-disabled={disabled}
        className={[
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : displayError
            ? 'border-rose-400 bg-rose-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Upload
          size={32}
          className={[
            'mb-2',
            dragOver ? 'text-indigo-600' : displayError ? 'text-rose-500' : 'text-slate-400',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-700">
          {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          JPG, JPEG, PNG, PDF up to {formatSize(maxSize)}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => {
            const isImage = file.type && file.type.startsWith('image/');
            const Icon = isImage ? ImageIcon : FileText;
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <Icon size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-400">{formatSize(file.size)}</p>
                </div>
                <CheckCircle2 size={14} className="shrink-0 text-emerald-500" aria-hidden="true" />
                {!disabled ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label="Remove file"
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {displayError ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle size={12} aria-hidden="true" />
          {displayError}
        </p>
      ) : null}
    </div>
  );
});

KycDocumentUploader.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func,
  onError: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycDocumentUploader;