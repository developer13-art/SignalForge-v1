import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycPersonalInfoForm from '../../components/domain/kyc/KycPersonalInfoForm';
import { kycApi } from '../../api/kyc.api.js';
import Button from '../../components/common/Button';

const KycPersonalInfo = function KycPersonalInfo() {
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    kycApi.getStatus().then((status) => {
      const personalInfo = status?.application?.personalInfo;
      if (!cancelled) {
        setDefaultValues(personalInfo ? {
          ...personalInfo,
          phone: personalInfo.phone || personalInfo.phoneNumber || '',
        } : {});
      }
    }).catch(() => {
      if (!cancelled) {
        setLoadError('Could not load your saved information.');
        setDefaultValues({});
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

const handleSubmit = useCallback(
  async (values) => {
    const payload = {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
      country: values.country,
      address: values.address,
      phoneNumber: values.phone,
    };
    await kycApi.submitPersonalInfo(payload);
    navigate('/kyc/document-selection');
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
          {defaultValues ? (
            <KycPersonalInfoForm
              key="saved-personal-info-loaded"
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onBack={handleBack}
              error={loadError}
            />
          ) : (
            <p className="text-sm text-slate-500">Loading saved information...</p>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default KycPersonalInfo;