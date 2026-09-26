import React, { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, Loader2, Search } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import AuditLogTable from '../../components/domain/admin/AuditLogTable';

const AuditLogs = function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    search: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.severity) {
        params.append('severity', filters.severity);
      }
      if (filters.search) {
        params.append('q', filters.search);
      }

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setLogs(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Audit Logs
            </Heading>
            <Text color="muted" className="text-xs">
              Immutable record of every sensitive action
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Category</label>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, category: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="trade">Trade</option>
              <option value="signal">Signal</option>
              <option value="payment">Payment</option>
              <option value="kyc">KYC</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Severity</label>
            <select
              value={filters.severity}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, severity: event.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Search</label>
            <div className="relative mt-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
                placeholder="Search logs"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AuditLogTable logs={logs} loading={loading} />
        </div>
      </Card>
    </Container>
  );
};

export default AuditLogs;