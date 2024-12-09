import React, { useEffect, useRef, useState, useMemo } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { SettingsAdjust } from '@carbon/react/icons';

import Button from '../Button/Button';
import { ToggleTip } from '../ToggleTip';
import { settings } from '../../constants/Settings';
import { usePopoverPositioning } from '../../hooks/usePopoverPositioning';

const { iotPrefix } = settings;

export const FlyoutMenuDirection = {
  BottomStart: 'bottom-start',
  BottomEnd: 'bottom-end',
  TopStart: 'top-start',
  TopEnd: 'top-end',
  LeftStart: 'left-start',
  LeftEnd: 'left-end',
  RightStart: 'right-start',
  RightEnd: 'right-end',
};

const getTooltipDirection = (direction) => {
  switch (direction) {
    case FlyoutMenuDirection.TopStart:
    case FlyoutMenuDirection.TopEnd:
      return 'top';
    case FlyoutMenuDirection.RightStart:
    case FlyoutMenuDirection.RightEnd:
      return 'right';
    case FlyoutMenuDirection.LeftStart:
    case FlyoutMenuDirection.LeftEnd:
      return 'left';
    default:
      return 'bottom';
  }
};

const getTooltipPosition = (menuDirection) => {
  switch (menuDirection) {
    case FlyoutMenuDirection.TopStart:
    case FlyoutMenuDirection.TopEnd:
      return 'bottom';
    case FlyoutMenuDirection.RightStart:
    case FlyoutMenuDirection.RightEnd:
      return 'left';
    case FlyoutMenuDirection.LeftStart:
    case FlyoutMenuDirection.LeftEnd:
      return 'right';
    default:
      return 'top';
  }
};

// No need to do prop checks since these are alredy done in flyout

/* eslint-disable react/prop-types */
const DefaultFooter = ({ setIsOpen, onCancel, onApply, i18n }) => (
  <>
    <Button
      className={`${iotPrefix}--flyout-menu__cancel`}
      kind="secondary"
      // TODO: in v3 pass testId from parent and insert here to allow it to be configurable
      // ie. `${testId}-menu-cancel`
      testId="flyout-menu-cancel"
      onClick={() => {
        setIsOpen(false);

        if (onCancel) {
          onCancel();
        }
      }}
      aria-label={i18n.cancelButtonText}
    >
      {i18n.cancelButtonText}
    </Button>
    <Button
      className={`${iotPrefix}--flyout-menu__submit`}
      aria-label={i18n.applyButtonText}
      // TODO: in v3 pass testId from parent and insert here to allow it to be configurable
      // ie. `${testId}-menu-cancel`
      testId="flyout-menu-apply"
      onClick={() => {
        setIsOpen(false);
        if (onApply) {
          onApply();
        }
      }}
    >
      {i18n.applyButtonText}
    </Button>
  </>
);
/* eslint-enable react/prop-types */

const FlyoutMenu = ({
  buttonProps,
  buttonSize,
  direction,
  menuOffset,
  defaultOpen,
  iconDescription,
  children,
  disabled,
  i18n,
  light,
  renderIcon,
  testId,
  tooltipId,
  tabIndex,
  className,
  tooltipClassName,
  tooltipContentClassName,
  passive,
  hideTooltip,
  customFooter: CustomFooter,
  onApply,
  onCancel,
  useAutoPositioning,
  isOpen,
  renderInPortal,
  style,
}) => {
  const [isControlledOpen, setIsOpen] = useState(defaultOpen);
  const [tooltipDirection, setTooltipDirection] = useState(getTooltipDirection(direction));
  const buttonRef = useRef(null);
  const updatedStyle = useMemo(
    () => ({
      ...style,
      '--zIndex': style.zIndex ?? 0,
      '--top': style.scrollTop,
      '--left': style.scrollLeft,
    }),
    [style]
  );

  const getFlyoutMenuOffset = React.useCallback(
    (tooltipElement, flyoutDirection, tooltipButtonElement, flipped) => {
      let topOffset = 0;
      let leftOffset = -2;

      const caretWidth = 16;
      const caretHeight = 12;
      const borderWidth = 2;

      const tooltipContent = tooltipElement.querySelector('[role="dialog"]');
      const tooltipWidth = tooltipContent ? tooltipContent.getBoundingClientRect().width : 0;
      const tooltipHeight = tooltipContent ? tooltipContent.getBoundingClientRect().height : 0;
      const buttonWidth = buttonRef.current ? buttonRef.current.getBoundingClientRect().width : 0;

      let rtlOffset = buttonWidth;

      switch (flyoutDirection) {
        case FlyoutMenuDirection.LeftStart:
          topOffset = tooltipHeight / 2 - 2 * borderWidth - borderWidth;
          rtlOffset = 0;
          break;

        // off
        case FlyoutMenuDirection.LeftEnd:
          topOffset =
            -tooltipHeight / 2 + 2 * caretHeight + caretWidth - (48 - buttonWidth) + borderWidth;
          leftOffset = -caretWidth / 2;
          rtlOffset = 0;
          break;
        case FlyoutMenuDirection.RightStart:
          topOffset = tooltipHeight / 2 - caretHeight - 2 * borderWidth;
          rtlOffset = -rtlOffset;
          break;

        // off
        case FlyoutMenuDirection.RightEnd:
          topOffset = -tooltipHeight / 2 + 2 * caretWidth + borderWidth;
          rtlOffset = -rtlOffset;
          break;
        case FlyoutMenuDirection.TopStart:
          leftOffset = tooltipWidth / 2;
          topOffset = caretHeight;
          break;
        case FlyoutMenuDirection.TopEnd:
          leftOffset = -tooltipWidth / 2 + buttonWidth;
          topOffset = caretHeight - 2 * borderWidth;
          break;
        case FlyoutMenuDirection.BottomEnd:
          topOffset = -caretHeight + 2 * borderWidth;
          leftOffset = -tooltipWidth / 2 + buttonWidth;
          break;
        default:
          // Bottom Start
          leftOffset = tooltipWidth / 2;
          topOffset = -caretHeight - 2 * borderWidth;
      }

      if (document.dir === 'rtl') {
        leftOffset -= rtlOffset;
      }

      let propTop = 0;
      let propLeft = 0;

      if (typeof menuOffset === 'function') {
        const { top, left } = menuOffset(
          tooltipElement,
          flyoutDirection,
          tooltipButtonElement,
          flipped
        );

        propTop = top;
        propLeft = left;
      } else if (
        typeof menuOffset === 'object' &&
        (menuOffset.hasOwnProperty('top') || menuOffset.hasOwnProperty('left'))
      ) {
        const { top = 0, left = 0 } = menuOffset;

        propTop = top;
        propLeft = left;
      }

      return {
        top: topOffset + propTop,
        left: leftOffset + propLeft,
      };
    },
    [menuOffset]
  );

  const [, { adjustedDirection }] = usePopoverPositioning({
    direction,
    menuOffset: getFlyoutMenuOffset,
    useAutoPositioning,
    parenElementTop: menuOffset?.inputTop,
    parentElementBottom: menuOffset?.inputBottom,
  });

  useEffect(() => {
    if (useAutoPositioning) {
      setTooltipDirection(getTooltipDirection(adjustedDirection));
    } else {
      setTooltipDirection(getTooltipDirection(direction));
    }
  }, [adjustedDirection, direction, useAutoPositioning]);

  const Footer = CustomFooter ? (
      <CustomFooter setIsOpen={setIsOpen} isOpen={isControlledOpen} /> 
  ) : (
    testId?.endsWith('-datepicker-flyout') == true ? '' : <DefaultFooter setIsOpen={setIsOpen} onCancel={onCancel} onApply={onApply} i18n={i18n} />
  );


  console.log(CustomFooter)
  return (
    <div
      data-testid={`${testId}-container`}
      style={{ '--tooltip-visibility': hideTooltip ? 'hidden' : 'visible' }}
      ref={buttonRef}
      className={classnames(
        [`${iotPrefix}--flyout-menu`],
        `${iotPrefix}--flyout-menu__${tooltipDirection}`,
        {
          [`${iotPrefix}--flyout-menu__light`]: light,
          [`${iotPrefix}--flyout-menu__open`]: isControlledOpen,
          [`${iotPrefix}--flyout-menu__hide-icon-btn-tooltip`]: !iconDescription,
          [className]: !!className,
        }
      )}
    >
      {
        <div
          className={`${iotPrefix}--flyout-menu--tooltip-anchor`}
          {...(!renderInPortal ? { 'data-floating-menu-container': true } : {})}
        >
          <ToggleTip
            disabled={disabled}
            className={classnames(
              tooltipClassName,
              `${iotPrefix}--flyout-menu--body`,
              `${iotPrefix}--flyout-menu--body__${
                useAutoPositioning ? adjustedDirection : direction
              }`,
              {
                [`${iotPrefix}--flyout-menu--body__light`]: light,
                [`${iotPrefix}--flyout-menu--body__open`]:
                  typeof isOpen === 'boolean' ? isOpen : isControlledOpen,
                [`${iotPrefix}--flyout-menu--body__${buttonSize}`]: buttonSize !== 'default',
              }
            )}
            align={useAutoPositioning ? direction : undefined}
            iconDescription={iconDescription}
            data-testid={testId}
            open={typeof isOpen === 'boolean' ? isOpen : isControlledOpen}
            direction={tooltipDirection}
            tooltipId={tooltipId}
            id={tooltipId} // https://github.com/carbon-design-system/carbon/pull/6744
            tabIndex={tabIndex}
            useAutoPositioning={useAutoPositioning}
            action={!passive ? Footer : null}
            triggerBtn={
              <Button
                {...buttonProps}
                aria-label={iconDescription}
                iconDescription={iconDescription}
                className={classnames(
                  `${iotPrefix}--flyout-menu--trigger-button`,
                  buttonProps?.className
                )}
                tooltipPosition={getTooltipPosition(direction)}
                disabled={disabled}
                hasIconOnly
                kind="ghost"
                testId={`${testId}-button`}
                size={buttonSize}
                renderIcon={renderIcon}
                onClick={() => {
                  if (typeof buttonProps.onClick === 'function') {
                    buttonProps.onClick();
                  }
                  setIsOpen(!isControlledOpen);
                }}
              />
            }
            content={
              <div
                className={classnames(
                  `${iotPrefix}--flyout-menu--content`,
                  tooltipContentClassName
                )}
                style={updatedStyle}
              >
                {children}
              </div>
            }
          />
        </div>
      }
    </div>
  );
};

const propTypes = {
  tooltipId: PropTypes.string,

  /**
   * The ID of the trigger button.
   */
  triggerId: PropTypes.string,

  /**
   * Optional starting value for uncontrolled state
   */
  defaultOpen: PropTypes.bool,

  /**
   * Contents to put into the flyout menu.
   */
  children: PropTypes.node,

  /**
   * Flyout menu wrapper className
   */
  className: PropTypes.node,

  /**
   * The CSS class names of the flyout menu.
   */
  tooltipClassName: PropTypes.string,

  /**
   * The CSS class names of the tooltip content.
   */
  tooltipContentClassName: PropTypes.string,

  /**
   * whether to send focus to the tooltip when it's expanded
   */
  tooltipFocusTrap: PropTypes.bool,

  /**
   * Where to put the flyout menu, relative to the trigger UI.
   */
  direction: PropTypes.oneOf([
    FlyoutMenuDirection.BottomStart,
    FlyoutMenuDirection.BottomEnd,
    FlyoutMenuDirection.TopStart,
    FlyoutMenuDirection.TopEnd,
    FlyoutMenuDirection.LeftStart,
    FlyoutMenuDirection.LeftEnd,
    FlyoutMenuDirection.RightStart,
    FlyoutMenuDirection.RightEnd,
  ]),

  /**
   * The adjustment of the flyout position.
   */
  menuOffset: PropTypes.oneOfType([
    PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      inputTop: PropTypes.number,
      inputBottom: PropTypes.number,
    }),
    PropTypes.func,
  ]),

  /**
   * The description of the default flyout icon
   */
  iconDescription: PropTypes.string.isRequired,

  /**
   * Optional prop to specify the tabIndex of the Tooltip
   */
  tabIndex: PropTypes.number,

  /**
   * Optional prop to specify the test id of the flyout
   */
  testId: PropTypes.string,

  /**
   * Will not render a footer
   */
  passive: PropTypes.bool,

  /**
   * Whether to show the iconDescription tooltip on the trigger button
   */
  hideTooltip: PropTypes.bool,

  /**
   * Content to be rendered in place of the normal footer (ie. MyComponent).
   */
  customFooter: PropTypes.elementType,

  /**
   * On Cancel button callback
   */
  onCancel: PropTypes.func,

  /**
   * On Apply button callback
   */
  onApply: PropTypes.func,

  /** Set of internationalized button names */
  i18n: PropTypes.shape({
    cancelButtonText: PropTypes.string,
    applyButtonText: PropTypes.string,
  }),

  /**
   * Define the icon render to be rendered.
   * Can be a React component class
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  /**
   *  Disable the button and tooltip
   */
  disabled: PropTypes.bool,

  buttonSize: PropTypes.string,

  light: PropTypes.bool,

  useAutoPositioning: PropTypes.bool,
  onChange: PropTypes.func,

  /** classes that can be passed to the button used for the flyout menu */
  buttonProps: PropTypes.shape({
    className: PropTypes.string,
    onClick: PropTypes.func,
  }),

  isOpen: PropTypes.bool,

  /** by default the flyout menu will render as a child, if you set this to true it will render outside of the current DOM in a portal */
  renderInPortal: PropTypes.bool,

  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

const defaultProps = {
  buttonProps: {},
  renderIcon: SettingsAdjust,
  buttonSize: 'default',
  tooltipId: 'flyout-tooltip',
  triggerId: 'flyout-trigger-id',
  defaultOpen: false,
  children: undefined,
  className: undefined,
  tooltipClassName: '',
  tooltipContentClassName: '',
  tooltipFocusTrap: true,
  passive: false,
  hideTooltip: true,
  customFooter: null,
  tabIndex: 0,
  testId: 'flyout-menu',
  direction: FlyoutMenuDirection.BottomStart,
  menuOffset: {
    top: 0,
    left: 0,
    inputTop: null,
    inputBottom: null,
  },
  i18n: {
    cancelButtonText: 'Cancel',
    applyButtonText: 'Apply',
  },
  isOpen: null,
  onCancel: null,
  onApply: null,
  disabled: false,
  light: true,
  useAutoPositioning: false,
  onChange: () => {},
  renderInPortal: false,
  style: {},
};

FlyoutMenu.propTypes = propTypes;
FlyoutMenu.defaultProps = defaultProps;

export default FlyoutMenu;
