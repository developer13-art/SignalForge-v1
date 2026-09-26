import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  RefreshCw,
  Loader2,
  ArrowRight,
  Upload,
  CheckCircle2,
  BarChart3,
  Shield,
  TrendingUp,
  FileText,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';

const CertificationDashboard = function CertificationDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/dashboard', {
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
  }, [fetchData]);

  const quickLinks = [
    { title: 'Import Historical Messages', icon: Upload, href: '/provider/certification/import' },
    { title: 'Training Dataset', icon: FileText, href: '/provider/certification/training' },
    { title: 'Parsing Accuracy', icon: BarChart3, href: '/provider/certification/accuracy' },
    { title: 'Backtesting', icon: TrendingUp, href: '/provider/certification/backtesting' },
    { title: 'Expected Performance', icon: TrendingUp, href: '/provider/certification/performance' },
    { title: 'Risk Assessment', icon: Shield, href: '/provider/certification/risk' },
    { title: 'Consistency Score', icon: CheckCircle2, href: '/provider/certification/consistency' },
    { title: 'Quality Score', icon: Award, href: '/provider/certification/quality' },
    { title: 'Certification Result', icon: Award, href: '/provider/certification/result' },
    { title: 'Certification History', icon: FileText, href: '/provider/certification/history' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Certification
            </Heading>
            <Text color="muted" className="text-xs">
              Validate your signal quality and build verifiable reputation
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

      {data?.level ? (
        <Card padding="lg" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Current Certification
              </p>
              <div className="mt-2">
                <ProviderCertificationBadge level={data.level} size="md" />
              </div>
            </div>
            {data?.overallScore !== undefined ? (
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Overall Quality Score
                </p>
                <p className="text-3xl font-bold text-indigo-600">{data.overallScore}</p>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Messages Imported"
          value={data?.messagesImported || 0}
          icon={FileText}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Parsing Accuracy"
          value={data?.parseAccuracy !== undefined ? `${data.parseAccuracy}%` : '—'}
          icon={BarChart3}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Consistency Score"
          value={data?.consistencyScore !== undefined ? `${data.consistencyScore}%` : '—'}
          icon={CheckCircle2}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Risk Score"
          value={data?.riskScore !== undefined ? `${data.riskScore}/100` : '—'}
          icon={Shield}
          variant={data?.riskScore >= 70 ? 'danger' : 'warning'}
          loading={loading}
        />
      </div>

      {data?.progress !== undefined ? (
        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Certification Progress</span>
            <span className="font-semibold text-slate-900">{data.progress}%</span>
          </div>
          <ProgressBar
            value={data.progress}
            max={100}
            size="md"
            variant="primary"
            className="mt-2"
          />
          {data.progressNote ? (
            <p className="mt-2 text-xs text-slate-500">{data.progressNote}</p>
          ) : null}
        </Card>
      ) : null}

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Certification Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

export default CertificationDashboard;