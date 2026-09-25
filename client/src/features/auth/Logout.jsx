import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const Logout = function Logout() {
  const navigate = useNavigate();
  const [state, setState] = useState('signing-out');
  const [error, setError] = useState(null);

  const performLogout = useCallback(async () => {
    setState('signing-out');
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('signalforge.auth');
      sessionStorage.clear();

      setState('signed-out');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (_err) {
      setState('error');
      setError('We encountered an issue while signing you out. Please try again.');
    }
  }, [navigate]);

  useEffect(() => {
    performLogout();
  }, [performLogout]);

  if (state === 'error') {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <LogOut size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Sign out failed
          </Heading>
          <Text color="muted" className="mt-2">
            {error}
          </Text>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="primary" onClick={performLogout}>
              Try again
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to dashboard
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  if (state === 'signed-out') {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            You have been signed out
          </Heading>
          <Text color="muted" className="mt-2">
            Redirecting to sign-in...
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated" className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        </div>
        <Heading level={2} className="mt-6">
          Signing you out
        </Heading>
        <Text color="muted" className="mt-2">
          Please wait while we safely end your session...
        </Text>
      </Card>
    </Container>
  );
};

export default Logout;