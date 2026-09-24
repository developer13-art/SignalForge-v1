/**
 * UserMenu
 *
 * Dropdown menu anchored to the topbar user chip. Presents account,
 * KYC, subscription, security, and logout actions.
 *
 * @module client/src/layouts/components/UserMenu
 */

import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Settings,
  LogOut,
  LifeBuoy,
  KeyRound,
} from 'lucide-react';

import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { logoutThunk } from '../../store/slices/auth.slice.js';
import { cn } from '../../lib/utils/cn.util.js';

export default function UserMenu({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ref = useRef(null);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await dispatch(logoutThunk());
    navigate('/login');
  };

  if (!open) {
    return null;
  }

  const isVerified = currentUser?.kycStatus === 'VERIFIED';

  return (
    <div
      ref={ref}
      className={cn(
        'absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-modal animate-fade-in',
      )}
      role="menu"
    >
      <div className="border-b border-surface-border p-4">
        <p className="truncate text-small font-semibold text-text-primary">
          {[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
            currentUser?.username ||
            'Account'}
        </p>
        <p className="mt-0.5 truncate text-caption text-text-tertiary">{currentUser?.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium',
              isVerified
                ? 'bg-success-subtle text-success'
                : 'bg-warning-subtle text-warning',
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            {isVerified ? 'Verified' : 'Unverified'}
          </span>
          {currentUser?.subscription?.planName ? (
            <span className="inline-flex items-center rounded-full bg-primary-500/15 px-2 py-0.5 text-caption font-medium text-primary-300">
              {currentUser.subscription.planName}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-2">
        <MenuLink to="/settings/profile" icon={UserIcon} label="Profile" onClick={onClose} />
        <MenuLink to="/settings/account" icon={Settings} label="Account settings" onClick={onClose} />
        <MenuLink to="/kyc/status" icon={ShieldCheck} label="KYC verification" onClick={onClose} />
        <MenuLink to="/subscriptions/my" icon={CreditCard} label="Subscription & billing" onClick={onClose} />
        <MenuLink to="/settings/api-keys" icon={KeyRound} label="API keys" onClick={onClose} />
        <MenuLink to="/support" icon={LifeBuoy} label="Help & support" onClick={onClose} />
      </div>

      <div className="border-t border-surface-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-error transition-colors hover:bg-error-subtle"
          role="menuitem"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
      role="menuitem"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}