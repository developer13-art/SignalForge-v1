import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import TxSignatureLink from '../../components/domain/solana/TxSignatureLink';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';

const PublicVerification = function PublicVerification() {
  const { hash } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/verify/${hash}`, { credentials: 'omit' });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Verification record not found');
        return;
      }

      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    if (hash) {
      fetchVerification();
    }
  }, [hash, fetchVerification]);

  return (
    <Container size="lg" className="py-12">
      <Card padding="lg" variant="elevated" className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <Heading level={1} size="text-2xl" className="mt-4">
          SignalForge Verification
        </Heading>
        <Text color="muted" className="mt-2">
          Public, verifiable on-chain records for signals and providers
        </Text>
      </Card>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Verification failed" description={error} onRetry={fetchVerification} />
          </Card>
        ) : data ? (
          <Card padding="lg">
            <div className="flex flex-col items-center text-center">
              {data.verified ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={32} aria-hidden="true" />
                  </div>
                  <Badge variant="success" size="md" className="mt-4">
                    Verified On-Chain
                  </Badge>
                  <Heading level={2} size="text-xl" className="mt-3">
                    This record is verified on Solana
                  </Heading>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertTriangle size={32} aria-hidden="true" />
                  </div>
                  <Badge variant="warning" size="md" className="mt-4">
                    Verification Pending
                  </Badge>
                  <Heading level={2} size="text-xl" className="mt-3">
                    This record has not been anchored
                  </Heading>
                </>
              )}
            </div>

            <Separator spacing="md" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Record Type
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{data.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Provider
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{data.providerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Anchored At
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{data.anchoredAt}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Slot
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                  {data.slot}
                </p>
              </div>
            </div>

            {data.txSignature ? (
              <>
                <Separator spacing="md" />
                <div className="flex flex-col items-center gap-3">
                  <TxSignatureLink
                    signature={data.txSignature}
                    size="md"
                    network="mainnet"
                    label="Transaction:"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`https://explorer.solana.com/tx/${data.txSignature}`, '_blank')
                    }
                    trailingIcon={ExternalLink}
                  >
                    View on Solana Explorer
                  </Button>
                </div>
              </>
            ) : null}

            <Separator spacing="md" />

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-600">
                This record is publicly verifiable. The hash and transaction signature can be
                independently confirmed on Solana.
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default PublicVerification;