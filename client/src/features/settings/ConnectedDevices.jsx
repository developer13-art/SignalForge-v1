import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, ArrowLeft, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ConnectedDevices = function ConnectedDevices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/devices', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setDevices(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRevoke = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/users/devices/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchDevices();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchDevices]);

  const handleBack = useCallback(() => navigate('/settings/security'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDevices}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Smartphone size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connected Devices
            </Heading>
            <Text color="muted" className="text-xs">
              Manage devices with active sessions on your account
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : devices.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="No connected devices"
              description="Devices with active sessions will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {devices.map((device) => {
                const Icon = device.type === 'mobile' ? Smartphone : Monitor;
                return (
                  <li
                    key={device.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {device.name}
                          </p>
                          {device.current ? (
                            <Badge variant="success" size="xs">
                              Current
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {device.browser} · {device.os} · {device.location}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Last active {device.lastActive}
                        </p>
                      </div>
                    </div>

                    {!device.current ? (
                      <button
                        type="button"
                        onClick={() => setRemoving(device)}
                        aria-label="Revoke"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRevoke}
        variant="danger"
        title="Revoke device"
        description={
          removing
            ? `Are you sure you want to sign out ${removing.name}? This device will need to sign in again.`
            : ''
        }
        confirmLabel="Revoke Access"
      />
    </Container>
  );
};

export default ConnectedDevices;