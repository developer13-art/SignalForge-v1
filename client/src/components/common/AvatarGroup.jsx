import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

const SIZES = {
  xs: { avatar: 'xs', overlap: '-ml-1.5', text: 'text-[10px]' },
  sm: { avatar: 'sm', overlap: '-ml-2', text: 'text-xs' },
  md: { avatar: 'md', overlap: '-ml-3', text: 'text-xs' },
  lg: { avatar: 'lg', overlap: '-ml-3.5', text: 'text-sm' },
  xl: { avatar: 'xl', overlap: '-ml-4', text: 'text-sm' },
};

/**
 * Normalizes an entry from the `users` prop into a consistent shape.
 */
function normalizeMember(member, index) {
  if (!member) {
    return { id: `member-${index}`, name: 'Unknown' };
  }
  if (typeof member === 'string') {
    return { id: `member-${index}`, name: member };
  }
  return {
    id: member.id || member.userId || `member-${index}`,
    name: member.name || member.displayName || member.username || 'Unknown',
    src: member.src || member.avatarUrl || member.avatar,
    status: member.status,
  };
}

const AvatarGroup = forwardRef(function AvatarGroup(
  {
    users = [],
    max = 4,
    size = 'md',
    shape = 'circle',
    showOverflowTooltip = true,
    ringColor = 'ring-white',
    className = '',
    onOverflowClick,
    testId,
    ...rest
  },
  ref,
) {
  const sizeStyles = SIZES[size] || SIZES.md;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const members = useMemo(
    () => users.map((user, index) => normalizeMember(user, index)),
    [users],
  );

  const visibleMembers = members.slice(0, max);
  const overflowCount = members.length - visibleMembers.length;

  const containerClassName = [
    'inline-flex items-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={containerClassName}
      data-testid={testId}
      role="group"
      aria-label={`Avatar group with ${members.length} members`}
      {...rest}
    >
      {visibleMembers.map((member, index) => {
        const isFirst = index === 0;
        const overlapClass = isFirst ? '' : sizeStyles.overlap;

        return (
          <div
            key={member.id}
            className={[
              'relative transition-transform duration-150 hover:z-10 hover:scale-105',
              overlapClass,
            ]
              .filter(Boolean)
              .join(' ')}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Avatar
              size={sizeStyles.avatar}
              shape={shape}
              src={member.src}
              name={member.name}
              alt={member.name}
              status={member.status}
              ringColor={ringColor}
              bordered
            />
            {showOverflowTooltip && hoveredIndex === index ? (
              <div
                role="tooltip"
                className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
              >
                {member.name}
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            ) : null}
          </div>
        );
      })}

      {overflowCount > 0 ? (
        <div
          className={[
            sizeStyles.overlap,
            'relative flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 ring-2',
            ringColor,
            onOverflowClick ? 'cursor-pointer hover:bg-slate-300' : '',
            `h-${size === 'xs' ? 6 : size === 'sm' ? 8 : size === 'md' ? 10 : size === 'lg' ? 12 : 16}`,
            sizeStyles.text,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={onOverflowClick}
          role={onOverflowClick ? 'button' : undefined}
          tabIndex={onOverflowClick ? 0 : undefined}
          onKeyDown={
            onOverflowClick
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOverflowClick(event);
                  }
                }
              : undefined
          }
          aria-label={`${overflowCount} more members`}
        >
          +{overflowCount}
        </div>
      ) : null}
    </div>
  );
});

AvatarGroup.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        displayName: PropTypes.string,
        username: PropTypes.string,
        src: PropTypes.string,
        avatarUrl: PropTypes.string,
        avatar: PropTypes.string,
        status: PropTypes.string,
      }),
    ]),
  ),
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  shape: PropTypes.oneOf(['circle', 'square', 'rounded']),
  showOverflowTooltip: PropTypes.bool,
  ringColor: PropTypes.string,
  className: PropTypes.string,
  onOverflowClick: PropTypes.func,
  testId: PropTypes.string,
};

export default AvatarGroup;