/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { Button as CarbonButton } from '@carbon/react';

import { settings } from '../../constants/Settings';

const { prefix, iotPrefix } = settings;

export const ICON_SWITCH_SIZES = {
  small: 'sm',
  default: 'md',
  large: 'lg',
};

const IconSwitch = React.forwardRef((props, ref) => {
  const {
    className,
    index,
    name,
    renderIcon,
    onClick,
    onKeyDown,
    selected,
    size,
    text,
    testId,
    children,
    disabled,
    ...other
  } = props;

  const handleClick = (e) => {
    e.preventDefault();
    onClick({ index, name, text });
  };

  const handleKeyDown = (e) => {
    const key = e.key || e.which;

    if (key === 'Enter' || key === 13 || key === ' ' || key === 32) {
      onKeyDown({ index, name, text });
    }
  };

  const classes = classnames(
    className,
    `${prefix}--content-switcher-btn`, // Class from carbon
    `${iotPrefix}--icon-switch`,
    {
      [`${prefix}--content-switcher--selected`]: selected, // Class from carbon
    }
  );

  const iconButtonClasses = classnames(
    `${prefix}--content-switcher-popover__wrapper`, // Class from carbon
    {
      [`${prefix}--content-switcher-popover--selected`]: selected, // Class from carbon
      [`${prefix}--content-switcher-popover--disabled`]: disabled, // Class from carbon
    }
  );

  const commonProps = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    className: classes,
    disabled,
  };

  return (
    <CarbonButton
      ref={ref}
      renderIcon={renderIcon}
      iconDescription={text}
      kind="secondary"
      hasIconOnly
      tooltipPosition="top"
      data-testid={testId}
      wrapperClasses={iconButtonClasses}
      {...other}
      {...commonProps}
    >
      {children}
    </CarbonButton>
  );
});

IconSwitch.propTypes = {
  /**
   * Specify an optional className to be added to your Switch
   */
  className: PropTypes.string,

  /**
   * The index of your Switch in your ContentSwitcher that is used for event handlers.
   * Reserved for usage in ContentSwitcher
   */
  index: PropTypes.number.isRequired,

  /**
   * Provide the name of your Switch that is used for event handlers
   */
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /**
   * A handler that is invoked when a user clicks on the control.
   * Reserved for usage in ContentSwitcher
   */
  onClick: PropTypes.func,

  /**
   * A handler that is invoked on the key down event for the control.
   * Reserved for usage in ContentSwitcher
   */
  onKeyDown: PropTypes.func,

  /**
   * Whether your Switch is selected. Reserved for usage in ContentSwitcher
   */
  selected: PropTypes.bool,

  /**
   * The tooltip text which will display when hovering over the switch
   */
  text: PropTypes.string.isRequired,

  /**
   * @deprecated The `size` prop for `IconSwitch` has been deprecated. This should now be set using the `size` prop
   * in the ContentSwitcher component. The options are 'sm', 'md', 'lg'.
   */
  size: PropTypes.oneOf(Object.values(ICON_SWITCH_SIZES)),

  /**
   * Define the icon render to be rendered.
   * Can be a React component class
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  testId: PropTypes.string,
  /** The button should be disabled */
  disabled: PropTypes.bool,

  children: PropTypes.node,
};

IconSwitch.defaultProps = {
  className: undefined,
  selected: false,
  name: '',
  size: 'default',
  onClick: undefined,
  onKeyDown: undefined,
  testId: 'icon-switch',
  disabled: false,
  children: undefined,
};

IconSwitch.displayName = 'IconSwitch';

export default IconSwitch;
