/**
 * useKyc Hook
 *
 * Access and mutate the current user's KYC application. Provides
 * helpers for each step of the verification workflow.
 *
 * @module client/src/hooks/useKyc
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycApi } from '../api/kyc.api.js';
import { useAuth } from './useAuth.js';

export const kycKeys = {
  all: ['kyc'],
  status: () => [...kycKeys.all, 'status'],
  application: () => [...kycKeys.all, 'application'],
  documents: () => [...kycKeys.all, 'documents'],
  documentTypes: () => [...kycKeys.all, 'document-types'],
  result: () => [...kycKeys.all, 'result'],
};

export function useKyc() {
  const { isAuthenticated, isKycVerified } = useAuth();
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: kycKeys.status(),
    queryFn: () => kycApi.getStatus(),
    enabled: isAuthenticated,
  });

  const applicationQuery = useQuery({
    queryKey: kycKeys.application(),
    queryFn: () => kycApi.getApplication(),
    enabled: isAuthenticated,
    retry: false,
  });

  const documentsQuery = useQuery({
    queryKey: kycKeys.documents(),
    queryFn: () => kycApi.listDocuments(),
    enabled: isAuthenticated,
  });

  const documentTypesQuery = useQuery({
    queryKey: kycKeys.documentTypes(),
    queryFn: () => kycApi.listDocumentTypes(),
    staleTime: 60 * 60 * 1000,
  });

  const submitPersonalInfoMutation = useMutation({
    mutationFn: (payload) => kycApi.submitPersonalInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.application() });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ formData, onProgress }) => kycApi.uploadDocument(formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.documents() });
    },
  });

  const uploadSelfieMutation = useMutation({
    mutationFn: ({ formData, onProgress }) => kycApi.uploadSelfie(formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.documents() });
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: (payload) => kycApi.submitApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
      queryClient.invalidateQueries({ queryKey: kycKeys.application() });
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: (payload) => kycApi.resubmit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
      queryClient.invalidateQueries({ queryKey: kycKeys.application() });
    },
  });

  return {
    status: statusQuery.data,
    application: applicationQuery.data,
    documents: documentsQuery.data || [],
    documentTypes: documentTypesQuery.data || [],
    isVerified: isKycVerified || (statusQuery.data && statusQuery.data.status === 'VERIFIED'),
    isLoading: statusQuery.isLoading,
    error: statusQuery.error,
    submitPersonalInfo: submitPersonalInfoMutation.mutateAsync,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    uploadSelfie: uploadSelfieMutation.mutateAsync,
    submitApplication: submitApplicationMutation.mutateAsync,
    resubmit: resubmitMutation.mutateAsync,
    isSubmitting:
      submitPersonalInfoMutation.isPending ||
      uploadDocumentMutation.isPending ||
      uploadSelfieMutation.isPending ||
      submitApplicationMutation.isPending ||
      resubmitMutation.isPending,
  };
}

export default useKyc;