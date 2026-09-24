import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ALIGNMENTS = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

const FormActions = forwardRef(function FormActions(
  {
    children,
    align = 'right',
    spacing = 'md',
    bordered = false,
    sticky = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const gapClass =
    spacing === 'sm' ? 'gap-2' : spacing === 'lg' ? 'gap-4' : spacing === 'xl' ? 'gap-6' : 'gap-3';

  return (
    <div
      ref={ref}
      className={[
        'flex flex-wrap items-center',
        ALIGNMENTS[align] || ALIGNMENTS.right,
        gapClass,
        bordered ? 'border-t border-slate-200 pt-4' : '',
        sticky
          ? 'sticky bottom-0 z-10 -mx-6 mt-6 border-t border-slate-200 bg-white px-6 py-3'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
});

FormActions.propTypes = {
  children: PropTypes.node,
  align: PropTypes.oneOf(['left', 'center', 'right', 'between']),
  spacing: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  bordered: PropTypes.bool,
  sticky: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default FormActions;
export { ALIGNMENTS as FORM_ACTIONS_ALIGNMENTS };