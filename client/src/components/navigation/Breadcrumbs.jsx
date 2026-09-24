import React, { forwardRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';

const SIZES = {
  sm: { text: 'text-xs', icon: 12, gap: 'gap-1.5', chevron: 12 },
  md: { text: 'text-sm', icon: 14, gap: 'gap-2', chevron: 14 },
  lg: { text: 'text-base', icon: 16, gap: 'gap-2.5', chevron: 16 },
};

const SEPARATORS = {
  chevron: 'chevron',
  slash: 'slash',
  dot: 'dot',
  arrow: 'arrow',
};

const Breadcrumbs = forwardRef(function Breadcrumbs(
  {
    items = [],
    separator = 'chevron',
    size = 'md',
    showHome = false,
    homeHref = '/',
    homeLabel = 'Home',
    maxItems,
    onItemClick,
    LinkComponent = 'a',
    className = '',
    itemClassName = '',
    activeItemClassName = '',
    separatorClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  const composed = React.useMemo(() => {
    if (!showHome) {
      return items;
    }
    return [{ key: '__home__', label: homeLabel, href: homeHref, icon: Home }, ...items];
  }, [showHome, homeLabel, homeHref, items]);

  const shouldCollapse = typeof maxItems === 'number' && maxItems > 0 && composed.length > maxItems;

  const visible = React.useMemo(() => {
    if (!shouldCollapse) {
      return composed;
    }
    const first = composed.slice(0, 1);
    const last = composed.slice(-(maxItems - 2));
    return [...first, { key: '__ellipsis__', isEllipsis: true }, ...last];
  }, [composed, shouldCollapse, maxItems]);

  const renderSeparator = (index) => {
    if (index === visible.length - 1) {
      return null;
    }

    let content;
    if (separator === 'slash') {
      content = '/';
    } else if (separator === 'dot') {
      content = '•';
    } else if (separator === 'arrow') {
      content = '→';
    } else {
      content = <ChevronRight size={sizeConfig.chevron} aria-hidden="true" />;
    }

    return (
      <li
        role="presentation"
        aria-hidden="true"
        className={['flex items-center text-slate-300', separatorClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {content}
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={[className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <ol className={['flex flex-wrap items-center', sizeConfig.gap].join(' ')}>
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;

          if (item.isEllipsis) {
            return (
              <Fragment key={item.key}>
                <li
                  className={['flex items-center text-slate-400', sizeConfig.text]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  <MoreHorizontal size={sizeConfig.icon} />
                </li>
                {renderSeparator(index)}
              </Fragment>
            );
          }

          const Icon = item.icon;
          const content = (
            <span className="flex items-center gap-1.5">
              {Icon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
              <span>{item.label}</span>
            </span>
          );

          const itemClasses = [
            'flex items-center transition-colors duration-150',
            sizeConfig.text,
            isLast
              ? ['font-medium text-slate-900', activeItemClassName].filter(Boolean).join(' ')
              : ['font-normal text-slate-500 hover:text-slate-800', itemClassName]
                  .filter(Boolean)
                  .join(' '),
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Fragment key={item.key || item.href || index}>
              <li className="flex items-center">
                {isLast || (!item.href && !item.onClick) ? (
                  <span className={itemClasses} aria-current={isLast ? 'page' : undefined}>
                    {content}
                  </span>
                ) : (
                  <LinkComponent
                    href={item.href}
                    className={itemClasses}
                    onClick={(event) => {
                      if (onItemClick) {
                        onItemClick(item, index, event);
                      }
                    }}
                  >
                    {content}
                  </LinkComponent>
                )}
              </li>
              {renderSeparator(index)}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
});

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node.isRequired,
      href: PropTypes.string,
      icon: PropTypes.elementType,
    })
  ),
  separator: PropTypes.oneOf(Object.keys(SEPARATORS)),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showHome: PropTypes.bool,
  homeHref: PropTypes.string,
  homeLabel: PropTypes.string,
  maxItems: PropTypes.number,
  onItemClick: PropTypes.func,
  LinkComponent: PropTypes.elementType,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  activeItemClassName: PropTypes.string,
  separatorClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Breadcrumbs;
export { SIZES as BREADCRUMBS_SIZES, SEPARATORS as BREADCRUMBS_SEPARATORS };