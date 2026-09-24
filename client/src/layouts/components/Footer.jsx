/**
 * Footer
 *
 * Marketing footer with platform links, marketplace links, resources,
 * company links, and a newsletter subscription form. Also used as a
 * compact variant on internal pages.
 *
 * @module client/src/layouts/components/Footer
 */

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube, Send, ArrowRight } from 'lucide-react';
import logo from '@assets/icons/svg/logo.svg';
import { routes } from '@config/routes.config.js';
import { appConfig } from '@config/app.config.js';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', to: routes.public.features },
      { label: 'How It Works', to: routes.public.howItWorks },
      { label: 'Pricing', to: routes.public.pricing },
      { label: 'AI Technology', to: routes.public.featuresAi },
      { label: 'Integrations', to: routes.public.apiPlatform },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Providers', to: routes.user.providerMarketplace.browse },
      { label: 'Traders', to: routes.user.traderMarketplace.browse },
      { label: 'Leaderboards', to: routes.user.traderMarketplace.browse },
      { label: 'Market Overview', to: routes.user.providerMarketplace.browse },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: routes.public.about },
      { label: 'Documentation', to: routes.public.apiPlatform },
      { label: 'Help Center', to: routes.support.helpCenter },
      { label: 'API', to: routes.public.apiPlatform },
      { label: 'Status', to: routes.public.security },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: routes.public.about },
      { label: 'Careers', to: routes.public.about },
      { label: 'Partners', to: routes.public.enterprise },
      { label: 'Contact Us', to: routes.public.contact },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-background-subtle">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Link to={routes.public.home} className="inline-flex items-center gap-3">
              <img src={logo} alt="SignalForge" className="h-9 w-9" />
              <p className="text-small font-semibold">SignalForge</p>
            </Link>
            <p className="mt-4 max-w-xs text-small text-text-secondary">
              The most advanced AI trading intelligence platform for modern
              traders and investors.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialIcon icon={Facebook} href={appConfig.social.github} />
              <SocialIcon icon={Twitter} href={appConfig.social.twitter} />
              <SocialIcon icon={Send} href={appConfig.social.telegram} />
              <SocialIcon icon={Youtube} href={appConfig.social.github} />
              <SocialIcon icon={Linkedin} href={appConfig.social.linkedin} />
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-small font-semibold text-text-primary">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-small text-text-secondary transition hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-6 border-t border-surface-border py-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-small font-semibold">Newsletter</p>
            <p className="mt-1 text-caption text-text-secondary">
              Stay updated with market insights and platform updates.
            </p>
          </div>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex w-full items-center gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-small text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow-primary transition hover:opacity-90"
              aria-label="Subscribe"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4 border-t border-surface-border py-6 text-caption text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SignalForge. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to={routes.public.privacy} className="transition hover:text-text-secondary">
              Privacy Policy
            </Link>
            <Link to={routes.public.terms} className="transition hover:text-text-secondary">
              Terms of Service
            </Link>
            <Link to={routes.public.legal} className="transition hover:text-text-secondary">
              Risk Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition hover:border-primary-500 hover:text-text-primary"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}