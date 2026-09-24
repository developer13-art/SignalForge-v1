/**
 * FileUpload
 *
 * Drag-and-drop file input with click-to-browse fallback, per-file
 * validation (accept, max size, max count), progress placeholders,
 * and file list management. Controlled via `files` / `onFilesChange`.
 *
 * @module client/src/components/common/FileUpload
 */

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function FileUpload({
  id,
  name,
  label,
  hint,
  error,
  accept,
  multiple = false,
  maxSizeBytes = 10 * 1024 * 1024,
  maxFiles = 10,
  files = [],
  onFilesChange,
  onError,
  disabled = false,
  required = false,
  className,
  dropzoneClassName,
  variant = 'default',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const validateFile = useCallback(
    (file) => {
      if (accept) {
        const allowed = accept.split(',').map((entry) => entry.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const isAllowed = allowed.some((entry) => {
          if (entry.startsWith('.')) return fileName.endsWith(entry);
          if (entry.endsWith('/*')) return fileType.startsWith(entry.slice(0, -1));
          return fileType === entry;
        });
        if (!isAllowed) {
          return `File type not allowed: ${file.name}`;
        }
      }
      if (file.size > maxSizeBytes) {
        return `File exceeds maximum size: ${file.name} (${formatBytes(file.size)})`;
      }
      return null;
    },
    [accept, maxSizeBytes],
  );

  const handleFiles = useCallback(
    (incomingFiles) => {
      const list = Array.from(incomingFiles || []);
      if (list.length === 0) return;

      const accepted = [];
      let firstError = null;

      for (const file of list) {
        if (files.length + accepted.length >= maxFiles) {
          firstError = `Maximum of ${maxFiles} files allowed`;
          break;
        }
        const message = validateFile(file);
        if (message) {
          firstError = message;
          continue;
        }
        accepted.push(file);
      }

      setInternalError(firstError);

      if (firstError && typeof onError === 'function') {
        onError(firstError);
      }

      if (accepted.length > 0 && typeof onFilesChange === 'function') {
        onFilesChange(multiple ? [...files, ...accepted] : [accepted[0]]);
      }
    },
    [files, maxFiles, multiple, onError, onFilesChange, validateFile],
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (event.dataTransfer && event.dataTransfer.files) {
        handleFiles(event.dataTransfer.files);
      }
    },
    [disabled, handleFiles],
  );

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) setDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = useCallback(
    (index) => {
      if (typeof onFilesChange !== 'function') return;
      const next = files.filter((_, i) => i !== index);
      onFilesChange(next);
    },
    [files, onFilesChange],
  );

  const openBrowser = useCallback(() => {
    if (!disabled && inputRef.current) inputRef.current.click();
  }, [disabled]);

  const message = error || internalError;

  return (
    <div className={clsx('w-full', className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-small font-medium text-text-secondary">
          {label}
          {required ? <span className="ml-1 text-error">*</span> : null}
        </label>
      ) : null}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openBrowser}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openBrowser();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
          dragActive
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-surface-border bg-surface hover:border-primary-500/60',
          disabled && 'cursor-not-allowed opacity-60',
          variant === 'compact' && 'py-5',
          dropzoneClassName,
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-primary-400 transition group-hover:bg-primary-500/15">
          <UploadCloud className="h-5 w-5" />
        </span>
        <div>
          <p className="text-small font-medium text-text-primary">
            Drag &amp; drop files here, or <span className="text-primary-400">browse</span>
          </p>
          <p className="mt-1 text-caption text-text-tertiary">
            {accept ? `Allowed: ${accept}` : 'Any file type'} · Max {formatBytes(maxSizeBytes)}
            {multiple ? ` · Up to ${maxFiles} files` : ''}
          </p>
        </div>
        <input
          id={id}
          name={name}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-3 py-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-text-secondary">
                <FileIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small text-text-primary">{file.name}</p>
                <p className="text-caption text-text-tertiary">{formatBytes(file.size)}</p>
              </div>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition hover:text-error"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p className="mt-2 flex items-center gap-1.5 text-caption text-error">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      ) : hint ? (
        <p className="mt-2 text-caption text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}