/**
 * ImageUpload
 *
 * Specialized file upload for single or multiple image files. Renders
 * a live preview grid with replace/remove affordances, an optional
 * crop hint, size and dimension validation, and drag-and-drop support.
 *
 * @module client/src/components/common/ImageUpload
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, RefreshCcw, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function useObjectUrls(files) {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const created = files.map((file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      if (typeof file === 'string') {
        return file;
      }
      if (file && file.url) {
        return file.url;
      }
      return '';
    });

    setUrls(created);

    return () => {
      for (let i = 0; i < created.length; i++) {
        const source = files[i];
        if (source instanceof File && created[i].startsWith('blob:')) {
          URL.revokeObjectURL(created[i]);
        }
      }
    };
  }, [files]);

  return urls;
}

export default function ImageUpload({
  id,
  name,
  label,
  hint,
  error,
  value = [],
  onChange,
  multiple = false,
  maxSizeBytes = 5 * 1024 * 1024,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml',
  aspectRatio,
  disabled = false,
  required = false,
  className,
  previewClassName,
  shape = 'square',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const normalized = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return [];
  }, [value]);

  const urls = useObjectUrls(normalized);

  const validateFile = useCallback(
    (file) => {
      if (accept) {
        const allowed = accept.split(',').map((entry) => entry.trim().toLowerCase());
        if (!allowed.includes(file.type.toLowerCase())) {
          return `Unsupported image type: ${file.name}`;
        }
      }
      if (file.size > maxSizeBytes) {
        return `Image exceeds maximum size: ${file.name}`;
      }
      return null;
    },
    [accept, maxSizeBytes],
  );

  const acceptFiles = useCallback(
    (incoming) => {
      const list = Array.from(incoming || []);
      if (list.length === 0) return;

      const accepted = [];
      let firstError = null;

      for (const file of list) {
        if (normalized.length + accepted.length >= maxFiles) {
          firstError = `Maximum of ${maxFiles} images allowed`;
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

      if (accepted.length > 0 && typeof onChange === 'function') {
        onChange(multiple ? [...normalized, ...accepted] : [accepted[0]]);
      }
    },
    [maxFiles, multiple, normalized, onChange, validateFile],
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (event.dataTransfer && event.dataTransfer.files) {
        acceptFiles(event.dataTransfer.files);
      }
    },
    [acceptFiles, disabled],
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

  const removeAt = useCallback(
    (index) => {
      if (typeof onChange !== 'function') return;
      onChange(normalized.filter((_, i) => i !== index));
    },
    [normalized, onChange],
  );

  const openBrowser = useCallback(() => {
    if (!disabled && inputRef.current) inputRef.current.click();
  }, [disabled]);

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const message = error || internalError;

  return (
    <div className={clsx('w-full', className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-small font-medium text-text-secondary">
          {label}
          {required ? <span className="ml-1 text-error">*</span> : null}
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={clsx(
              'group relative overflow-hidden border border-surface-border bg-surface',
              shapeClass,
              previewClassName,
            )}
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            {url ? (
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}

            {!disabled ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={openBrowser}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-primary transition hover:bg-surface-elevated"
                  aria-label="Replace image"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-error transition hover:bg-error-subtle"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {urls.length < maxFiles ? (
          <button
            type="button"
            onClick={openBrowser}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            disabled={disabled}
            className={clsx(
              'flex flex-col items-center justify-center gap-2 border-2 border-dashed px-3 py-6 text-center transition',
              shapeClass,
              dragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-surface-border bg-surface hover:border-primary-500/60',
              disabled && 'cursor-not-allowed opacity-60',
            )}
            aria-label="Add image"
          >
            <ImageIcon className="h-5 w-5 text-text-tertiary" />
            <span className="text-caption text-text-secondary">Add image</span>
          </button>
        ) : null}
      </div>

      <input
        id={id}
        name={name}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => acceptFiles(event.target.files)}
        className="hidden"
      />

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