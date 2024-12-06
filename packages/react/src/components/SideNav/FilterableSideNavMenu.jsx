import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { SideNavMenu } from '@carbon/react';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  children: PropTypes.node.isRequired,
  isFiltering: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  className: '',
};

const FilterableSideNavMenu = ({ children, isFiltering, testId, className, ...myProps }) => {
  // Unfortunately there is other way to set tabindex
  // without modifying the Carbon SideNavMenu source code.
  // TODO: create carbon issue for that
  const callbackRef = useCallback(
    (menuElement) => {
      if (menuElement !== null && isFiltering) {
        menuElement.setAttribute('tabIndex', -1);
      }
    },
    [isFiltering]
  );

  const sideNavMenu = (
    <SideNavMenu
      data-testid={testId}
      ref={callbackRef}
      defaultExpanded={isFiltering}
      isSideNavExpanded
      className={classnames(className, {
        [`${iotPrefix}--side-nav__item--is-filtering`]: isFiltering,
      })}
      {...myProps}
    >
      {children}
    </SideNavMenu>
  );
  return sideNavMenu;
};

FilterableSideNavMenu.propTypes = propTypes;
FilterableSideNavMenu.defautProps = defaultProps;
export default FilterableSideNavMenu;
