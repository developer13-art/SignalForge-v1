import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { routes } from '@config/routes.config.js';

const SETTINGS_SECTIONS = [
  { label: 'Profile', to: routes.user.settings.profile },
  { label: 'Account', to: routes.user.settings.account },
  { label: 'Security', to: routes.user.settings.security },
  { label: 'Two-factor', to: routes.user.settings.twoFactor },
  { label: 'Devices', to: routes.user.settings.devices },
  { label: 'Connected accounts', to: routes.user.settings.connectedAccounts },
  { label: 'Brokers', to: routes.user.settings.brokers },
  { label: 'Signal sources', to: routes.user.settings.signalSources },
  { label: 'Trading', to: routes.user.settings.tradingPreferences },
  { label: 'Risk', to: routes.user.settings.riskPreferences },
  { label: 'Notifications', to: routes.user.settings.notifications },
  { label: 'Privacy', to: routes.user.settings.privacy },
  { label: 'API keys', to: routes.user.settings.apiKeys },
  { label: 'Data privacy', to: routes.user.settings.dataPrivacy },
  { label: 'Delete account', to: routes.user.settings.deleteAccount },
];

export default function SettingsLayout() {
  return (
    <div>
      <nav
        aria-label="Settings sections"
        className="flex flex-wrap gap-x-1 gap-y-1 border-b border-surface-border px-4 py-3 sm:px-6 lg:px-8"
      >
        {SETTINGS_SECTIONS.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            className={({ isActive }) =>
              [
                'rounded-md px-3 py-2 text-caption font-medium transition-colors',
                isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
              ].join(' ')
            }
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}