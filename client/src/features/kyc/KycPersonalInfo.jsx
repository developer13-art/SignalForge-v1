import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycPersonalInfoForm from '../../components/domain/kyc/KycPersonalInfoForm';

const KycPersonalInfo = function KycPersonalInfo() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values) => {
      try {
        const response = await fetch('/api/kyc/personal-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.error?.message || 'Failed to save personal information');
        }

        navigate('/kyc/document-selection');
      } catch (error) {
        throw error;
      }
    },
    [navigate],
  );

  const handleBack = useCallback(() => {
    navigate('/kyc');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={1} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <Heading level={1} size="text-2xl">
          Personal information
        </Heading>
        <Text color="muted" className="mt-2">
          Please provide the information exactly as it appears on your identity document.
        </Text>

        <div className="mt-6">
          <KycPersonalInfoForm onSubmit={handleSubmit} onBack={handleBack} />
        </div>
      </Card>
    </Container>
  );
};

export default KycPersonalInfo;