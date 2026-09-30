import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import KycStatusBadge from '../../components/domain/kyc/KycStatusBadge';

async function readPayload(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed');
  }
  return payload.data || payload;
}

const KycApplicationReview = function KycApplicationReview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminResponse, reviewResponse] = await Promise.all([
        fetch(`/api/admin/kyc/${applicationId}`),
        fetch(`/api/compliance/review/${applicationId}`),
      ]);
      const [adminPayload, reviewPayload] = await Promise.all([
        readPayload(adminResponse),
        readPayload(reviewResponse),
      ]);
      const record = adminPayload.application || {};
      const review = reviewPayload.application || {};
      const userId = record.user_id || review.userId;
      const userPayload = userId
        ? await readPayload(await fetch(`/api/admin/users/${userId}`))
        : {};

      setApplication({
        ...record,
        applicationId: record.id || review.applicationId || applicationId,
        status: record.status || review.status,
        user: userPayload.user || null,
        documents: review.documents || [],
        riskScore: review.riskScore,
        personalInfo:
          typeof record.personal_info === 'string'
            ? JSON.parse(record.personal_info)
            : record.personal_info,
        documentType: record.document_type,
        submittedAt: record.submitted_at || review.submittedAt,
        rejectionReason: record.rejection_reason,
        reviewNotes: record.review_notes || review.reviewNotes,
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load this KYC application.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleDecision = useCallback(
    async (decision) => {
      setSaving(true);
      setError(null);
      setNotice(null);
      try {
        const response = await fetch(
          `/api/kyc/applications/${applicationId}/${decision}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              decision === 'approve' ? { notes } : { reason: notes },
            ),
          },
        );
        await readPayload(response);
        setApplication((current) => ({
          ...current,
          status: decision === 'approve' ? 'VERIFIED' : 'REJECTED',
        }));
        setNotice(decision === 'approve' ? 'KYC application approved.' : 'KYC application rejected.');
      } catch (requestError) {
        setError(requestError.message || 'Unable to submit the review decision.');
      } finally {
        setSaving(false);
      }
    },
    [applicationId, notes],
  );

  const user = application?.user;
  const personalInfo = application?.personalInfo || {};
  const fullName = [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(' ');
  const reviewable = ['PENDING', 'UNDER_REVIEW'].includes(
    String(application?.status || '').toUpperCase(),
  );

  return (
    <Container size="lg" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/kyc')}
          leadingIcon={ArrowLeft}
        >
          KYC Queue
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchApplication}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card padding="lg" className="mt-4">
          <div className="flex justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        </Card>
      ) : error && !application ? (
        <Card padding="lg" className="mt-4">
          <div role="alert" className="text-sm text-rose-700">{error}</div>
        </Card>
      ) : application ? (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <Heading level={1} size="text-2xl">KYC Application Review</Heading>
              <Text color="muted" className="mt-1">
                {fullName || user?.username || user?.email || application.user_id}
                {user?.email && fullName ? ` · ${user.email}` : ''}
              </Text>
            </div>
            <KycStatusBadge status={String(application.status || '').toLowerCase()} size="md" />
          </div>

          {error || notice ? (
            <div
              role={error ? 'alert' : 'status'}
              className={`mt-4 rounded-md border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
            >
              {error || notice}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card padding="lg">
              <Heading level={2} size="text-base">Applicant details</Heading>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-1 text-slate-900">{user?.email || '—'}</dd></div>
                <div><dt className="text-xs text-slate-500">Document type</dt><dd className="mt-1 text-slate-900">{application.documentType || '—'}</dd></div>
                <div><dt className="text-xs text-slate-500">Submitted</dt><dd className="mt-1 text-slate-900">{application.submittedAt ? new Date(application.submittedAt).toLocaleString() : '—'}</dd></div>
                {Object.entries(personalInfo).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ')}</dt>
                    <dd className="mt-1 break-words text-slate-900">{String(value ?? '—')}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card padding="lg">
              <Heading level={2} size="text-base">Submitted documents</Heading>
              {application.documents.length ? (
                <ul className="mt-4 divide-y divide-slate-200">
                  {application.documents.map((document) => (
                    <li key={document.documentId} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="font-medium text-slate-800">{document.documentType}</span>
                      <span className="text-xs text-slate-500">
                        {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text color="muted" className="mt-4 text-sm">No document records were returned for this application.</Text>
              )}
              {application.riskScore !== null && application.riskScore !== undefined ? (
                <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-700">
                  Risk score: <strong>{application.riskScore}</strong>
                </p>
              ) : null}
              {application.rejectionReason ? (
                <p className="mt-3 text-sm text-rose-700">Previous rejection: {application.rejectionReason}</p>
              ) : null}
            </Card>
          </div>

          {reviewable ? (
            <Card padding="lg" className="mt-4">
              <label htmlFor="review-notes" className="text-sm font-medium text-slate-800">
                Review notes or rejection reason
              </label>
              <textarea
                id="review-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add notes for the applicant or reviewer record"
              />
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDecision('reject')}
                  disabled={saving || !notes.trim()}
                  leadingIcon={saving ? Loader2 : XCircle}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecision('approve')}
                  disabled={saving}
                  leadingIcon={saving ? Loader2 : CheckCircle2}
                >
                  Approve
                </Button>
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </Container>
  );
};

export default KycApplicationReview;