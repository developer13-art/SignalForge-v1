import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  RefreshCw,
  Loader2,
  ArrowRight,
  Palette,
  Globe,
  Users,
  Wallet,
  BarChart3,
  Settings2,
  DollarSign,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const WhiteLabelDashboard = function WhiteLabelDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/dashboard', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const quickLinks = [
    { title: 'Brand Configuration', icon: Palette, href: '/white-label/brand' },
    { title: 'Logo & Branding', icon: Palette, href: '/white-label/logo' },
    { title: 'Domain Configuration', icon: Globe, href: '/white-label/domain' },
    { title: 'Theme Configuration', icon: Palette, href: '/white-label/theme' },
    { title: 'Custom Pricing', icon: DollarSign, href: '/white-label/pricing' },
    { title: 'Analytics', icon: BarChart3, href: '/white-label/analytics' },
    { title: 'Users', icon: Users, href: '/white-label/users' },
    { title: 'Revenue', icon: Wallet, href: '/white-label/revenue' },
    { title: 'Settings', icon: Settings2, href: '/white-label/settings' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              White-Label Platform
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your branded instance of SignalForge AI
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={data?.totalUsers || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Monthly Revenue"
          value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
          icon={Wallet}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Active Providers"
          value={data?.activeProviders || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Status"
          value={data?.status || 'Active'}
          icon={Layers}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          White-Label Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>

      {data?.domain ? (
        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Branded Domain
          </Heading>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium text-slate-600">Custom Domain</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {data.domain}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/white-label/domain')}>
              Manage
            </Button>
          </div>
        </Card>
      ) : null}
    </Container>
  );
};

export default WhiteLabelDashboard;