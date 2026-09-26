import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  FileText,
  Flag,
  BarChart3,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const ComplianceDashboard = function ComplianceDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/dashboard', {
        credentials: 'include',
      });
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const quickLinks = [
    { title: 'KYC Queue', icon: Clock, href: '/compliance/kyc-queue' },
    { title: 'Pending', icon: Clock, href: '/compliance/pending' },
    { title: 'Under Review', icon: AlertTriangle, href: '/compliance/under-review' },
    { title: 'Verified Users', icon: CheckCircle2, href: '/compliance/verified' },
    { title: 'Rejected', icon: XCircle, href: '/compliance/rejected' },
    { title: 'Suspended', icon: Ban, href: '/compliance/suspended' },
    { title: 'Document Types', icon: FileText, href: '/compliance/document-types' },
    { title: 'Verification Providers', icon: ShieldCheck, href: '/compliance/providers' },
    { title: 'Risk Flags', icon: Flag, href: '/compliance/risk-flags' },
    { title: 'Reports', icon: BarChart3, href: '/compliance/reports' },
    { title: 'KYC Audit Trail', icon: FileText, href: '/compliance/audit-trail' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Compliance Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor KYC queues, risk flags, and compliance operations
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
          label="Pending"
          value={data?.pending || 0}
          icon={Clock}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Under Review"
          value={data?.underReview || 0}
          icon={AlertTriangle}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Verified"
          value={data?.verified || 0}
          icon={CheckCircle2}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={data?.rejected || 0}
          icon={XCircle}
          variant="danger"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Suspended"
          value={data?.suspended || 0}
          icon={Ban}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Risk Flags"
          value={data?.riskFlags || 0}
          icon={Flag}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Reviewed Today"
          value={data?.reviewedToday || 0}
          icon={ShieldCheck}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Avg Review Time"
          value={data?.avgReviewTime || '—'}
          icon={Clock}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Compliance Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default ComplianceDashboard;