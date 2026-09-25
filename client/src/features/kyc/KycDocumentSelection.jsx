import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';

const DOCUMENT_TYPES = [
  {
    id: 'national_id',
    label: 'National Identity Card',
    description: 'The Nigerian national identity card or equivalent plastic ID card.',
    emoji: 'ID',
  },
  {
    id: 'voters_card',
    label: "Voter's Card",
    description: 'The official voter registration card (PVC).',
    emoji: 'VC',
  },
  {
    id: 'drivers_license',
    label: "Driver's Licence",
    description: 'A valid driver\'s licence from an approved jurisdiction.',
    emoji: 'DL',
  },
  {
    id: 'passport',
    label: 'International Passport',
    description: 'Any valid international passport.',
    emoji: 'PP',
  },
  {
    id: 'other',
    label: 'Other Government ID',
    description: 'Another official identity document approved by the platform.',
    emoji: 'ID',
  },
];

const KycDocumentSelection = function KycDocumentSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const handleContinue = useCallback(() => {
    if (!selected) {
      return;
    }
    navigate('/kyc/document-upload', { state: { documentType: selected } });
  }, [selected, navigate]);

  const handleBack = useCallback(() => {
    navigate('/kyc/personal-info');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={2} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <Heading level={1} size="text-2xl">
          Select your identity document
        </Heading>
        <Text color="muted" className="mt-2">
          Choose the document you will upload for verification.
        </Text>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DOCUMENT_TYPES.map((doc) => {
            const isSelected = selected === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelected(doc.id)}
                className={[
                  'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {doc.emoji}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{doc.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{doc.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack} leadingIcon={ArrowLeft}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selected}
            trailingIcon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycDocumentSelection;