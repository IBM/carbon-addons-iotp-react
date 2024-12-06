import React, { useState, useEffect, useRef, Children } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { OverflowMenuHorizontal } from '@carbon/react/icons';
import { Breadcrumb as CarbonBreadcrumb, OverflowMenuItem } from '@carbon/react';

import { OverflowMenu } from '../OverflowMenu';
import { useResize } from '../../internal/UseResizeObserver';
import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  /**
   * Specify the label for the breadcrumb container
   */
  'aria-label': PropTypes.string,

  /**
   * Pass in the BreadcrumbItem's for your Breadcrumb
   */
  children: PropTypes.node,

  /**
   * Specify an optional className to be applied to the container node
   */
  className: PropTypes.string,

  /**
   * Optional prop to omit the trailing slash for the breadcrumbs
   */
  noTrailingSlash: PropTypes.bool,

  /**
   * Allow for collapse of breadcrumbs into overflow menu when not enough space, this implies
   * the use of ResizeObserver
   */
  hasOverflow: PropTypes.bool,

  /**
   * Disable truncation on the first or last breadcrumb item.
   */
  disableTruncation: PropTypes.oneOf(['first', 'last', 'none']),

  testId: PropTypes.string,
};

const defaultProps = {
  className: null,
  noTrailingSlash: false,
  children: null,
  hasOverflow: false,
  'aria-label': null,
  testId: 'breadcrumb',
  disableTruncation: 'none',
};

const Breadcrumb = ({ children, className, hasOverflow, testId, disableTruncation, ...other }) => {
  const childrenItems = Children.map(children, (child) => child);

  const breakingWidth = useRef([]);

  const [overflowItems, setOverflowItems] = useState([]);
  const [afterOverflowItems, setAfterOverflowItems] = useState(childrenItems.slice(1));
  const [prevChildren, setPrevChildren] = useState([]);

  const breadcrumbRef = useResize(useRef(null));

  useEffect(
    () => {
      if (hasOverflow && breadcrumbRef) {
        setOverflowItems([]);
        setAfterOverflowItems(childrenItems.slice(1));
        setPrevChildren(children);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [children]
  );
  /** update breadcrumbs  */
  useEffect(
    () => {
      if (hasOverflow && breadcrumbRef && breadcrumbRef.current) {
        // The visible list is overflowing
        if (breadcrumbRef.current.clientWidth < breadcrumbRef.current.scrollWidth) {
          // Record the width of the list
          breakingWidth.current.push(breadcrumbRef.current.scrollWidth);
          if (afterOverflowItems.length > 1) {
            // Move item to the hidden list
            setOverflowItems([...overflowItems, afterOverflowItems.shift()]);
            setAfterOverflowItems([...afterOverflowItems]);
          }
          // The visible list is not overflowing
        } else if (
          breakingWidth.current[breakingWidth.current.length - 1] >= 0 &&
          breadcrumbRef.current.clientWidth >
            breakingWidth.current[breakingWidth.current.length - 1] &&
          overflowItems.length > 0
        ) {
          // Move the item to the visible list
          setAfterOverflowItems([overflowItems.pop(), ...afterOverflowItems]);
          setOverflowItems([...overflowItems]);
          breakingWidth.current.pop();
        }
      }
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [breadcrumbRef?.current?.clientWidth, breadcrumbRef?.current?.scrollWidth, prevChildren]
    /* eslint-enable react-hooks/exhaustive-deps */
  );

  return (
    <div
      className={classnames('breadcrumb--container', {
        'breadcrumb--container__overflowfull': afterOverflowItems.length === 1,
        [`${iotPrefix}--breadcrumb-expand--${disableTruncation}`]: disableTruncation !== 'none',
      })}
      ref={breadcrumbRef}
      // TODO: fix in v3
      data-testid="overflow"
    >
      {breadcrumbRef && hasOverflow ? (
        <CarbonBreadcrumb data-testid={testId} className={className} {...other}>
          {childrenItems[0]}
          {overflowItems.length > 0 && (
            <span className="breadcrumb--overflow">
              <OverflowMenu
                data-testid={`${testId}-overflow-menu`}
                renderIcon={(props) => <OverflowMenuHorizontal size={20} {...props} />}
                menuOptionsClass="breadcrumb--overflow-items"
              >
                {overflowItems.map((child, i) => (
                  <OverflowMenuItem
                    {...child.props}
                    data-testid={`${testId}-overflow-menu-item-${i}`}
                    title={child.props.children}
                    key={`${child.props.children}-${i}`}
                    itemText={child.props.children}
                  />
                ))}
              </OverflowMenu>
            </span>
          )}
          {afterOverflowItems}
        </CarbonBreadcrumb>
      ) : (
        <CarbonBreadcrumb data-testid={testId} className={className} {...other}>
          {children}
        </CarbonBreadcrumb>
      )}
    </div>
  );
};

Breadcrumb.propTypes = propTypes;
Breadcrumb.defaultProps = defaultProps;

export default Breadcrumb;
