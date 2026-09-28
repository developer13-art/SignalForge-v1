import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';

const VerifiedBadge = forwardRef(function VerifiedBadge(
  { level = 'on_chain_confirmed', size = 'md', compact = false, ...rest },
  ref,
) {
  return <VerifiedOnChainBadge ref={ref} level={level} size={size} compact={compact} {...rest} />;
});

VerifiedBadge.propTypes = {
  level: PropTypes.oneOf(['unverified', 'partial', 'verified', 'on_chain_confirmed', 'broken']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  compact: PropTypes.bool,
};

export default VerifiedBadge;