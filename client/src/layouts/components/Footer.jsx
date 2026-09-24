/**
 * Footer
 *
 * Application footer used by the public site layout. Contains brand
 * block, four link columns, newsletter input, and legal row — matching
 * the "Footer" section from the public mockups.
 *
 * @module client/src/layouts/components/Footer
 */

import { Link } from 'react-router-dom';
import { Send, Twitter, Linkedin, Youtube, Instagram, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { appConfig } from '../../config/app.config.js';

const PLATFORM_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'AI Technology', to: '/features/ai' },
  { label: 'Integrations', to: '/api-platform' },
];

const MARKETPLACE_LINKS = [
  { label: 'Providers', to: '/marketplace/providers' },
  { label: 'Traders', to: '/marketplace/traders' },
  { label: 'Leaderboards', to: '/analytics' },
  { label: 'Market Overview', to: '/analytics/performance' },
];

const RESOURCE_LINKS = [
  { label: 'Blog', to: '/about' },
  { label: 'Documentation', to: '/api-platform' },
  { label: 'Help Center', to: '/support' },
  { label: 'API', to: '/api-platform' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Careers', to: '/about' },
  { label: 'Partners', to: '/enterprise' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Status', to: '/support' },
];

const SOCIAL_LINKS = [
  { label: 'Twitter', href: appConfig.social.twitter, icon: Twitter },
  { label: 'LinkedIn', href: appConfig.social.linkedin, icon: Linkedin },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Discord', href: appConfig.social.discord, icon: MessageCircle },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-surface-border bg-background-subtle">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
                <span className="text-small font-bold text-white">SF</span>
              </div>
              <div className="leading-tight">
                <p className="text-small font-bold tracking-tight text-text-primary">
                  SIGNALFORGE
                </p>
                <p className="text-caption font-medium text-primary-400">AI</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-small text-text-tertiary">
              The most advanced AI trading intelligence platform for modern traders and
              investors.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-border text-text-tertiary transition-colors hover:border-primary-500/40 hover:text-primary-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterColumn title="Marketplace" links={MARKETPLACE_LINKS} />
          <FooterColumn title="Resources" links={RESOURCE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />

          <div className="col-span-2">
            <p className="text-small font-semibold text-text-primary">Newsletter</p>
            <p className="mt-2 text-caption text-text-tertiary">
              Stay updated with market insights and platform updates.
            </p>
            <form onSubmit={handleSubscribe} className="mt-3 flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-10 flex-1 rounded-lg border border-surface-border bg-surface px-3 text-small text-text-primary placeholder:text-text-tertiary focus:border-primary-500/50 focus:outline-none"
                aria-label="Email address"
                required
              />
              <button
                type="submit"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-glow-primary transition-opacity hover:opacity-90"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed ? (
              <p className="mt-2 text-caption text-success">
                Thanks for subscribing.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-surface-border pt-6 text-caption text-text-tertiary md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} SignalForge AI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-text-primary">
              Terms of Service
            </Link>
            <Link to="/legal" className="transition-colors hover:text-text-primary">
              Risk Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-small font-semibold text-text-primary">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-caption text-text-tertiary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}