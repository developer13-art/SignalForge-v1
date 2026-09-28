'use strict';

/**
 * SignalForge - Proof of Alpha Memo Version Constants
 */

const PROOF_MEMO_VERSION = 1;

const PROOF_SUPPORTED_MEMO_VERSIONS = Object.freeze([1]);

const PROOF_MEMO_PREFIX = 'SFA-PROOF';

const PROOF_MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

const PROOF_MAX_MEMO_BYTES = 566;

function isSupportedMemoVersion(version) {
  return PROOF_SUPPORTED_MEMO_VERSIONS.includes(Number(version));
}

module.exports = Object.freeze({
  PROOF_MEMO_VERSION,
  PROOF_SUPPORTED_MEMO_VERSIONS,
  PROOF_MEMO_PREFIX,
  PROOF_MEMO_PROGRAM_ID,
  PROOF_MAX_MEMO_BYTES,
  isSupportedMemoVersion,
});