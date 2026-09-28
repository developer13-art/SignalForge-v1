import React from 'react';
import PropTypes from 'prop-types';
import {
  CreditCard,
  ArrowUpCircle,
  Users,
  Heart,
} from 'lucide-react';
import { BLINK_TEMPLATE_LIST } from '../../../../../shared/src/constants/solana-actions/blink-templates';

const ICONS = {
  'credit-card': CreditCard,
  'arrow-up-circle': ArrowUpCircle,
  users: Users,
  heart: Heart,
};

const COLOR_CLASSES = {
  indigo: {
    selected: 'border-indigo-500 bg-indigo-50',
    icon: 'text-indigo-600',
  },
  violet: {
    selected: 'border-violet-500 bg-violet-50',
    icon: 'text-violet-600',
  },
  emerald: {
    selected: 'border-emerald-500 bg-emerald-50',
    icon: 'text-emerald-600',
  },
  rose: {
    selected: 'border-rose-500 bg-rose-50',
    icon: 'text-rose-600',
  },
};

export default function BlinkTemplateSelector({ value, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {BLINK_TEMPLATE_LIST.map((template) => {
        const Icon = ICONS[template.icon] || CreditCard;
        const colors = COLOR_CLASSES[template.color] || COLOR_CLASSES.indigo;
        const selected = template.key === value;

        return (
          <button
            key={template.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(template.key)}
            className={[
              'flex flex-col gap-2 rounded-lg border-2 p-4 text-left transition-colors',
              selected
                ? colors.selected
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={selected}
          >
            <Icon
              size={20}
              className={selected ? colors.icon : 'text-slate-500'}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-slate-900">{template.shortName}</span>
            <span className="text-xs leading-relaxed text-slate-500">{template.description}</span>
          </button>
        );
      })}
    </div>
  );
}

BlinkTemplateSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};