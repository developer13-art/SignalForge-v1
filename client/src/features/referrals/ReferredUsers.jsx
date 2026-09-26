import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';

const ReferredUsers = function ReferredUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/users', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setUsers(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBack = useCallback(() => navigate('/referrals'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referred Users
            </Heading>
            <Text color="muted" className="text-xs">
              Users who joined through your referral link
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No referred users yet"
              description="Share your referral link to start building your network."
            />
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="md" src={user.avatar} name={user.name} alt={user.name} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Joined {user.joinedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Performance
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        ${user.performance || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Your Reward
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-violet-600">
                        ${user.reward || 0}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default ReferredUsers;