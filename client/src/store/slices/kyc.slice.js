/**
 * KYC Slice
 *
 * Tracks the user's KYC status, active application, uploaded
 * documents, verification steps, and any outstanding review tasks.
 *
 * @module client/src/store/slices/kyc
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'NOT_STARTED',
  application: null,
  documents: [],
  currentStep: 0,
  reviewNotes: null,
  rejectionReason: null,
  isSubmitting: false,
  isLoading: false,
  error: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    kycLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    kycLoadSuccess(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.status = payload.status || 'NOT_STARTED';
      state.application = payload.application || null;
      state.documents = Array.isArray(payload.documents) ? payload.documents : [];
      state.reviewNotes = payload.reviewNotes || null;
      state.rejectionReason = payload.rejectionReason || null;
      state.error = null;
    },
    kycLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load KYC status';
    },
    kycStepChanged(state, action) {
      state.currentStep = action.payload;
    },
    kycDocumentAdded(state, action) {
      state.documents = [...state.documents, action.payload];
    },
    kycDocumentRemoved(state, action) {
      state.documents = state.documents.filter((d) => d.documentId !== action.payload);
    },
    kycSubmitRequest(state) {
      state.isSubmitting = true;
      state.error = null;
    },
    kycSubmitSuccess(state, action) {
      state.isSubmitting = false;
      state.status = 'PENDING';
      state.application = action.payload || state.application;
      state.error = null;
    },
    kycSubmitFailed(state, action) {
      state.isSubmitting = false;
      state.error = action.payload || 'Failed to submit KYC';
    },
    kycStatusUpdated(state, action) {
      state.status = action.payload;
    },
    kycReviewResult(state, action) {
      const payload = action.payload || {};
      state.status = payload.status || state.status;
      state.reviewNotes = payload.notes || null;
      state.rejectionReason = payload.reason || null;
    },
    kycReset() {
      return initialState;
    },
  },
});

export const {
  kycLoadRequest,
  kycLoadSuccess,
  kycLoadFailed,
  kycStepChanged,
  kycDocumentAdded,
  kycDocumentRemoved,
  kycSubmitRequest,
  kycSubmitSuccess,
  kycSubmitFailed,
  kycStatusUpdated,
  kycReviewResult,
  kycReset,
} = kycSlice.actions;

export default kycSlice.reducer;