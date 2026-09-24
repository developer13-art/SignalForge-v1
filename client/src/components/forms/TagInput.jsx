import React, { forwardRef, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SIZES = {
  sm: { container: 'min-h-8 px-2 py-1 text-xs', tag: 'text-[10px] px-1.5 py-0.5', icon: 12 },
  md: { container: 'min-h-10 px-3 py-1.5 text-sm', tag: 'text-xs px-2 py-0.5', icon: 14 },
  lg: { container: 'min-h-12 px-4 py-2 text-base', tag: 'text-sm px-2.5 py-1', icon: 16 },
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-indigo-500',
  error: 'border-rose-400 bg-white focus-within:border-rose-500 focus-within:ring-rose-500',
};

function validateTag(tag, rules) {
  if (rules.required && (!tag || tag.trim() === '')) {
    return false;
  }
  if (rules.pattern && !rules.pattern.test(tag)) {
    return false;
  }
  if (rules.maxLength && tag.length > rules.maxLength) {
    return false;
  }
  if (rules.minLength && tag.length < rules.minLength) {
    return false;
  }
  if (rules.validate && !rules.validate(tag)) {
    return false;
  }
  return true;
}

const TagInput = forwardRef(function TagInput(
  {
    value = [],
    onChange,
    placeholder = 'Type and press Enter',
    size = 'md',
    variant = 'default',
    error = false,
    disabled = false,
    maxTags,
    minTags,
    allowDuplicates = false,
    splitKeys = ['Enter', 'Comma'],
    validationRules,
    validationMessage,
    tagClassName = '',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const tags = Array.isArray(value) ? value : [];

  const addTag = useCallback(
    (rawTag) => {
      const tag = String(rawTag || '').trim();
      if (!tag) {
        return;
      }

      if (maxTags && tags.length >= maxTags) {
        setErrorMessage(`Maximum of ${maxTags} tags allowed`);
        return;
      }

      if (!allowDuplicates && tags.includes(tag)) {
        setErrorMessage('Tag already added');
        return;
      }

      if (validationRules && !validateTag(tag, validationRules)) {
        setErrorMessage(validationMessage || 'Invalid tag format');
        return;
      }

      setErrorMessage('');
      const next = [...tags, tag];
      if (onChange) {
        onChange(next);
      }
      setInputValue('');
    },
    [tags, maxTags, allowDuplicates, validationRules, validationMessage, onChange],
  );

  const removeTag = useCallback(
    (index) => {
      if (disabled) {
        return;
      }
      const next = tags.filter((_, i) => i !== index);
      setErrorMessage('');
      if (onChange) {
        onChange(next);
      }
    },
    [tags, disabled, onChange],
  );

  const handleKeyDown = (event) => {
    if (splitKeys.includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Enter' && inputValue.trim() === '' && tags.length > 0) {
        return;
      }
      addTag(inputValue);
      return;
    }

    if (event.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (event) => {
    const paste = event.clipboardData?.getData('text') || '';
    if (!paste) {
      return;
    }
    const parts = paste.split(/[,\n;]+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) {
      event.preventDefault();
      parts.forEach((part) => addTag(part));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = variant === 'error' || error ? VARIANTS.error : VARIANTS.default;

  const reachedMax = maxTags && tags.length >= maxTags;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <div
        ref={ref}
        onClick={() => inputRef.current?.focus()}
        className={[
          'flex w-full flex-wrap items-center gap-1 rounded-md border transition-colors focus-within:ring-1',
          sizeConfig.container,
          variantClass,
          disabled ? 'cursor-not-allowed bg-slate-50 opacity-60' : 'cursor-text',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={[
              'inline-flex items-center gap-1 rounded bg-indigo-50 font-medium text-indigo-700',
              sizeConfig.tag,
              tagClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {tag}
            {!disabled ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeTag(index);
                }}
                aria-label={`Remove ${tag}`}
                className="rounded-full text-indigo-500 hover:bg-indigo-200 hover:text-indigo-900"
              >
                <X size={sizeConfig.icon - 2} aria-hidden="true" />
              </button>
            ) : null}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled || reachedMax}
          className="min-w-[80px] flex-1 bg-transparent py-0.5 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px]">
        {errorMessage ? (
          <span className="font-medium text-rose-600">{errorMessage}</span>
        ) : (
          <span className="text-slate-400">
            {minTags ? `Minimum ${minTags} tags` : ''}
          </span>
        )}
        {maxTags ? (
          <span className="text-slate-400">
            {tags.length}/{maxTags}
          </span>
        ) : null}
      </div>
    </div>
  );
});

TagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'error']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  maxTags: PropTypes.number,
  minTags: PropTypes.number,
  allowDuplicates: PropTypes.bool,
  splitKeys: PropTypes.arrayOf(PropTypes.string),
  validationRules: PropTypes.shape({
    required: PropTypes.bool,
    pattern: PropTypes.instanceOf(RegExp),
    maxLength: PropTypes.number,
    minLength: PropTypes.number,
    validate: PropTypes.func,
  }),
  validationMessage: PropTypes.string,
  tagClassName: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TagInput;