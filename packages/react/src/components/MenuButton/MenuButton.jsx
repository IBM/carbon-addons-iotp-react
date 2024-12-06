import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import classnames from 'classnames';
import { useLangDirection } from 'use-lang-direction';

import { settings } from '../../constants/Settings';
import deprecate from '../../internal/deprecate';

import { SplitMenuButton } from './SplitMenuButton';
import { SingleMenuButton } from './SingleMenuButton';
import { getMenuPosition, getShadowBlockerConfig } from './utils';

const { iotPrefix } = settings;
const GHOST = 'ghost';

const propTypes = {
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,

  /**
   * Use by a split menu button to fire the event for clicking on the main button,
   * not the chevron to open the additional menu actions
   */
  onPrimaryActionClick: PropTypes.func,

  /**
   * The label on the primary button in a split button, or the whole button on a single menu button
   */
  label: PropTypes.string,

  /**
   * Optional prop to change the open icon on the button
   * Can be a React component class
   */
  renderOpenIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * Optional prop to change the closed state icon on the button
   * Can be a React component class
   */
  renderCloseIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   * If specifying the `renderIcon` prop, provide a description for that icon that can
   * be read by screen readers
   */
  closeIconDescription: (props) => {
    if (props.renderCloseIcon && !props.closeIconDescription) {
      return new Error(
        'renderCloseIcon property specified without also providing an closeIconDescription property.'
      );
    }
    return undefined;
  },

  /**
   * If specifying the `renderIcon` prop, provide a description for that icon that can
   * be read by screen readers
   */
  openIconDescription: (props) => {
    if (props.renderOpenIcon && !props.openIconDescription) {
      return new Error(
        'renderOpenIcon property specified without also providing an openIconDescription property.'
      );
    }
    return undefined;
  },

  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,

  /**
   * The size of the button and the dropdown items
   */
  size: PropTypes.oneOf(['sm', 'md', 'default']),

  /**
   * The kind of button.
   */
  kind: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'ghost']),
};

const defaultProps = {
  testId: 'menu-button',
  onPrimaryActionClick: null,
  label: null,
  openIconDescription: 'open menu button',
  closeIconDescription: 'close menu button',
  renderOpenIcon: ChevronDown,
  renderCloseIcon: ChevronUp,
  size: 'default',
  kind: 'primary',
};

const MenuButton = ({
  // TODO: remove deprecated 'testID' in v3.
  testID,
  testId,
  onPrimaryActionClick,
  label,
  openIconDescription,
  closeIconDescription,
  renderOpenIcon,
  renderCloseIcon,
  children,
  size: buttonSize,
  kind,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shadowBlockerConf, setShadowBlockerConf] = useState({});

  const buttonRef = useRef(null);
  const langDir = useLangDirection();
  const handleResize = useCallback(() => {
    /* istanbul ignore else */
    if (buttonRef.current) {
      const { x, y } = getMenuPosition({ label, buttonRef, onPrimaryActionClick, langDir });
      setPosition({
        x,
        y,
      });
      setShadowBlockerConf(getShadowBlockerConfig(buttonRef));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, langDir, onPrimaryActionClick, isMenuOpen, buttonSize]);

  /**
   * This is a hacky work-around, because the current Menu (7.42.1) won't allow us
   * to set classNames or a target for where the menu should be placed via the portal
   * So, to fix the autopositioning, I have to open it, hide it with a property, check
   * the positioning, reposition it, and then show it. ugh. They are adding these other
   * features. Hopefully they'll be released soon, and we can use the `target` prop to open
   * the menu in this container div where it used to be...
   */
  useEffect(() => {
    document
      .querySelector(':root')
      .style.setProperty('--iot-menu-button-menu-opacity', isMenuOpen ? 0 : 1);

    setTimeout(() => {
      document.querySelector(':root').style.setProperty('--iot-menu-button-menu-opacity', 1);
    }, 0);
  }, [isMenuOpen]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    window.addEventListener('scroll', handleResize);
    return () => window.removeEventListener('scroll', handleResize);
  }, [handleResize]);

  useLayoutEffect(() => {
    handleResize();
  }, [handleResize]);

  const handlePrimaryClick = useCallback(
    (e) => {
      if (typeof onPrimaryActionClick === 'function') {
        onPrimaryActionClick(e);
      } else {
        setIsMenuOpen((prev) => {
          handleResize();
          return !prev;
        });
      }
    },
    [handleResize, onPrimaryActionClick]
  );

  const handleSecondaryClick = useCallback(() => {
    setIsMenuOpen((prev) => {
      handleResize();
      return !prev;
    });
  }, [handleResize]);

  const handleChildClick = useCallback(
    (onClick) => (e) => {
      /* istanbul ignore else */
      if (typeof onClick === 'function') {
        setIsMenuOpen((prev) => {
          handleResize();
          return !prev;
        });
        onClick(e);
      }
    },
    [handleResize]
  );

  /**
   * Wrap the children onClick handlers to also close the menu when an
   * action is triggered.
   */
  const contextMenuItems = useMemo(
    () =>
      React.Children.map(children, (child) => {
        return React.cloneElement(
          child,
          Object.assign({}, child.props, {
            onClick:
              typeof child.props?.onClick === 'function'
                ? handleChildClick(child.props.onClick)
                : undefined,
          })
        );
      }),
    [children, handleChildClick]
  );

  const menuSize = buttonSize === 'default' ? 'lg' : buttonSize;
  const buttonKind = !label ? GHOST : kind;

  /**
   * This shadow-blocker is needed to remove the menu shadow covering the button.
   * We can't use a pure CSS solution (like ::after) for this since the shadow-blocker styling
   * needs to get the position and dimensions of the menu and it is not possible to
   * pass that info as css attributes (vars) to the menu since the component internally use
   * the style attribute to set the x & y attributes.
   */
  const { menuHeight, flippedX, flippedY, opensHorizontally } = shadowBlockerConf;
  const shadowBlockerButtonClasses = {
    [`${iotPrefix}--menu-button--flip-y`]: flippedY,
    [`${iotPrefix}--menu-button--flip-x`]: flippedX,
    [`${iotPrefix}--menu-button--opens-horizontally`]: opensHorizontally,
  };
  const showShadowBlocker = buttonKind === GHOST && isMenuOpen && !label;
  const shadowBlocker = showShadowBlocker ? (
    <div
      style={{ [`--menu-height`]: `${menuHeight}px` }}
      className={classnames(
        {
          [`${iotPrefix}--menu__shadow-blocker--flip-y`]: flippedY,
          [`${iotPrefix}--menu__shadow-blocker--flip-x`]: flippedX,
          [`${iotPrefix}--menu__shadow-blocker--opens-horizontally`]: opensHorizontally,
        },
        `${iotPrefix}--menu__shadow-blocker`,
        `${iotPrefix}--menu__shadow-blocker--${menuSize}`
      )}
    />
  ) : null;

  const ButtonComponent =
    typeof onPrimaryActionClick === 'function' && label ? SplitMenuButton : SingleMenuButton;
  return (
    <div
      // TODO: remove deprecated 'testID' in v3.
      data-testid={`${testID || testId}-wrapper`}
      className={classnames(`${iotPrefix}--menu-button`, {
        [`${iotPrefix}--menu-button--open`]: isMenuOpen,
        ...shadowBlockerButtonClasses,
      })}
    >
      <ButtonComponent
        ref={buttonRef}
        onPrimaryActionClick={handlePrimaryClick}
        onSecondaryActionClick={handleSecondaryClick}
        iconDescription={isMenuOpen ? closeIconDescription : openIconDescription}
        renderIcon={isMenuOpen ? renderCloseIcon : renderOpenIcon}
        label={label}
        // TODO: remove deprecated 'testID' in v3.
        testId={testID || testId}
        size={buttonSize}
        kind={buttonKind}
      />
      <Menu
        className={classnames(
          {
            [`${iotPrefix}--menu-button--icon-only`]: buttonKind === GHOST,
          },
          `${iotPrefix}--menu-button__menu`
        )}
        size={menuSize}
        open={isMenuOpen}
        {...position}
      >
        {contextMenuItems}
        {shadowBlocker}
      </Menu>
    </div>
  );
};

MenuButton.propTypes = propTypes;
MenuButton.defaultProps = defaultProps;

export default MenuButton;
