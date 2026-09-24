import React, { forwardRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';

const SIZES = {
  sm: { text: 'text-xs', icon: 12, gap: 'gap-1.5', chevron: 12 },
  md: { text: 'text-sm', icon: 14, gap: 'gap-2', chevron: 14 },
  lg: { text: 'text-base', icon: 16, gap: 'gap-2', chevron: 16 },
};

const SEPARATORS = {
  chevron: ChevronRight,
  slash: null,
};

const Breadcrumb = forwardRef(function Breadcrumb(
  {
    items = [],
    separator = 'chevron',
    size = 'md',
    maxItems,
    showHome = false,
    homeHref = '/',
    homeLabel = 'Home',
    onItemClick,
    LinkComponent = 'a',
    className = '',
    itemClassName = '',
    activeItemClassName = '',
    separatorClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  const composedItems = React.useMemo(() => {
    const home = showHome
      ? [
          {
            key: '__home__',
            label: homeLabel,
            href: homeHref,
            icon: Home,
          },
        ]
      : [];

    return [...home, ...items];
  }, [showHome, homeLabel, homeHref, items]);

  const shouldCollapse =
    typeof maxItems === 'number' && maxItems > 0 && composedItems.length > maxItems;

  const visibleItems = React.useMemo(() => {
    if (!shouldCollapse) {
      return composedItems;
    }

    const firstItems = composedItems.slice(0, 1);
    const lastItems = composedItems.slice(-(maxItems - 2));

    return [...firstItems, { key: '__ellipsis__', isEllipsis: true }, ...lastItems];
  }, [composedItems, shouldCollapse, maxItems]);

  const SeparatorIcon = SEPARATORS[separator];

  const renderSeparator = (index) => {
    if (index === visibleItems.length - 1) {
      return null;
    }

    if (SeparatorIcon) {
      const Icon = SeparatorIcon;
      return (
        <li
          role="presentation"
          aria-hidden="true"
          className={['flex items-center text-slate-300', separatorClassName]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon size={sizeConfig.chevron} />
        </li>
      );
    }

    return (
      <li
        role="presentation"
        aria-hidden="true"
        className={['flex items-center text-slate-300', separatorClassName]
          .filter(Boolean)
          .join(' ')}
      >
        /
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
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          if (item.isEllipsis) {
            return (
              <Fragment key={item.key}>
                <li
                  className={[
                    'flex items-center text-slate-400',
                    sizeConfig.text,
                  ]
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

          const ItemIcon = item.icon;

          const content = (
            <span className="flex items-center gap-1.5">
              {ItemIcon ? <ItemIcon size={sizeConfig.icon} aria-hidden="true" /> : null}
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

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node.isRequired,
      href: PropTypes.string,
      icon: PropTypes.elementType,
    }),
  ),
  separator: PropTypes.oneOf(['chevron', 'slash']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  maxItems: PropTypes.number,
  showHome: PropTypes.bool,
  homeHref: PropTypes.string,
  homeLabel: PropTypes.string,
  onItemClick: PropTypes.func,
  LinkComponent: PropTypes.elementType,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  activeItemClassName: PropTypes.string,
  separatorClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Breadcrumb;
export { SIZES as BREADCRUMB_SIZES };