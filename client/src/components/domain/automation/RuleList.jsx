import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Zap, Plus } from 'lucide-react';
import Card from '../../common/Card';
import RuleCard from './RuleCard';
import EmptyState from '../../common/EmptyState';
import Button from '../../common/Button';

const RuleList = forwardRef(function RuleList(
  {
    rules = [],
    loading = false,
    onCreate,
    onToggle,
    onEdit,
    onDelete,
    onTest,
    title = 'Automation Rules',
    description = 'Configure IF/THEN rules that run automatically after risk approval',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Zap size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>

        {onCreate ? (
          <Button variant="primary" onClick={onCreate} leadingIcon={Plus}>
            New Rule
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {rules.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No automation rules yet"
            description="Create your first IF/THEN rule to automate trade management."
            size="sm"
            action={
              onCreate ? (
                <Button variant="primary" onClick={onCreate} leadingIcon={Plus}>
                  Create Rule
                </Button>
              ) : null
            }
          />
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onTest={onTest}
            />
          ))
        )}
      </div>
    </Card>
  );
});

RuleList.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onCreate: PropTypes.func,
  onToggle: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onTest: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RuleList;