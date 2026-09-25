import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Send, MessageSquare, Mail, Webhook, Code2, MessageCircle } from 'lucide-react';

const SOURCE_MAP = {
  telegram: { label: 'Telegram', icon: Send, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  discord: { label: 'Discord', icon: MessageSquare, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  email: { label: 'Email', icon: Mail, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  tradingview: { label: 'TradingView', icon: Webhook, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rest_api: { label: 'REST API', icon: Code2, color: 'bg-violet-50 text-violet-700 border-violet-200' },
  api: { label: 'API', icon: Code2, color: 'bg-violet-50 text-violet-700 border-violet-200' },
  manual: { label: 'Manual', icon: MessageSquare, color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const SignalSourceBadge = forwardRef(function SignalSourceBadge(
  {
    source,
    label,
    size = 'sm',
    showIcon = true,
    showLabel = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const key = String(source || '').toLowerCase().replace(/[\s-]/g, '_');
  const config = SOURCE_MAP[key] || SOURCE_MAP.manual;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center font-semibold',
        bordered ? 'border' : '',
        config.color,
        sizeConfig.container,
        'rounded-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
      {showLabel ? label || config.label : null}
    </span>
  );
});

SignalSourceBadge.propTypes = {
  source: PropTypes.oneOf([
    'telegram',
    'discord',
    'whatsapp',
    'email',
    'tradingview',
    'rest_api',
    'api',
    'manual',
  ]),
  label: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalSourceBadge;
export { SOURCE_MAP as SIGNAL_SOURCE_MAP };