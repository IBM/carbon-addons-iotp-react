/* eslint-disable react/require-default-props */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import { OverflowMenu as CarbonOverflowMenu } from '@carbon/react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { getMenuOffset } from '@carbon/react/es/components/OverflowMenu/OverflowMenu';
// import {
//   Escape,
//   ArrowUp,
//   ArrowDown,
//   ArrowRight,
//   ArrowLeft,
// } from '@carbon/react/es/internal/keyboard/keys';
// import { matches as keyCodeMatches } from '@carbon/react/es/internal/keyboard/match';
// import ClickListener from '@carbon/react/es/internal/ClickListener';
// import { PrefixContext } from '@carbon/react/es/internal/usePrefix';
// import mergeRefs from '@carbon/react/es/tools/mergeRefs';
// import { useLangDirection } from 'use-lang-direction';
// import FloatingMenu, {
//   DIRECTION_TOP,
//   DIRECTION_BOTTOM,
// } from '@carbon/react/es/internal/FloatingMenu';
// import { OverflowMenuVertical } from '@carbon/react/icons';

import { usePopoverPositioning } from '../../hooks/usePopoverPositioning';
// import { settings } from '../../constants/Settings';
// import Button from '../Button';

export { OverflowMenuItem } from '@carbon/react';

// const { prefix: carbonPrefix, iotPrefix } = settings;

// const on = (element, ...args) => {
//   element.addEventListener(...args);
//   return {
//     release() {
//       element.removeEventListener(...args);
//       return null;
//     },
//   };
// };

// class IotOverflowMenu extends Component {
//   state = {};

//   static propTypes = {
//     /**
//      * The ARIA label.
//      */
//     ariaLabel: PropTypes.string,

//     /**
//      * The child nodes.
//      */
//     children: PropTypes.node,

//     /**
//      * The CSS class names.
//      */
//     className: PropTypes.string,

//     /**
//      * The menu direction.
//      */
//     direction: PropTypes.oneOf([DIRECTION_TOP, DIRECTION_BOTTOM]),

//     /**
//      * `true` if the menu alignment should be flipped.
//      */
//     flipped: PropTypes.bool,

//     /**
//      * Enable or disable focus trap behavior
//      */
//     focusTrap: PropTypes.bool,

//     /**
//      * The CSS class for the icon.
//      */
//     iconClass: PropTypes.string,

//     /**
//      * The icon description.
//      */
//     iconDescription: PropTypes.string.isRequired,

//     /**
//      * The element ID.
//      */
//     // eslint-disable-next-line react/require-default-props
//     id: PropTypes.string,

//     /**
//      * `true` to use the light version. For use on $ui-01/$layer-01 backgrounds only.
//      * Don't use this to make OverflowMenu background color same as container background color.
//      */
//     light: PropTypes.bool,

//     /**
//      * The adjustment in position applied to the floating menu.
//      */
//     menuOffset: PropTypes.oneOfType([
//       PropTypes.shape({
//         top: PropTypes.number,
//         left: PropTypes.number,
//       }),
//       PropTypes.func,
//     ]),

//     /**
//      * The adjustment in position applied to the floating menu.
//      */
//     menuOffsetFlip: PropTypes.oneOfType([
//       PropTypes.shape({
//         top: PropTypes.number,
//         left: PropTypes.number,
//       }),
//       PropTypes.func,
//     ]),

//     /**
//      * The class to apply to the menu options
//      */
//     menuOptionsClass: PropTypes.string,

//     /**
//      * The event handler for the `click` event.
//      */
//     onClick: PropTypes.func,

//     /**
//      * Function called when menu is closed
//      */
//     onClose: PropTypes.func,

//     /**
//      * The event handler for the `focus` event.
//      */
//     onFocus: PropTypes.func,

//     /**
//      * The event handler for the `keydown` event.
//      */
//     onKeyDown: PropTypes.func,

//     /**
//      * Function called when menu is opened
//      */
//     onOpen: PropTypes.func,

//     /**
//      * `true` if the menu should be open.
//      */
//     open: PropTypes.bool,

//     /**
//      * Function called to override icon rendering.
//      */
//     renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

//     /**
//      * Specify a CSS selector that matches the DOM element that should
//      * be focused when the OverflowMenu opens
//      */
//     selectorPrimaryFocus: PropTypes.string,

//     /**
//      * Specify the size of the OverflowMenu. Currently supports either `sm`, 'md' (default) or 'lg` as an option.
//      */
//     size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),

//     /**
//      * Test id for the trigger component
//      */
//     'data-testid': PropTypes.string.isRequired,

//     /**
//      * Specify the alignment of the tooltip to the icon-only button.
//      * Can be one of: start, center, or end.
//      */
//     tooltipAlignment: PropTypes.oneOf(['start', 'center', 'end']),

//     /**
//      * Specify the direction of the tooltip for icon-only buttons.
//      * Can be either top, right, bottom, or left.
//      */
//     tooltipPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),

//     /**
//      * Language direction
//      */
//     langDir: PropTypes.oneOf(['ltr', 'rtl']),

//     /**
//      * Label for the overflow menu button
//      */
//     buttonLabel: PropTypes.string,
//   };

//   // eslint-disable-next-line react/sort-comp
//   static contextType = PrefixContext;

//   static defaultProps = {
//     ariaLabel: 'Open and close list of options',
//     children: [],
//     className: '',
//     direction: DIRECTION_BOTTOM,
//     flipped: false,
//     focusTrap: true,
//     iconClass: '',
//     open: false,
//     menuOffset: getMenuOffset,
//     menuOffsetFlip: getMenuOffset,
//     menuOptionsClass: '',
//     light: false,
//     renderIcon: OverflowMenuVertical,
//     selectorPrimaryFocus: '[data-overflow-menu-primary-focus]',
//     tooltipAlignment: 'center',
//     tooltipPosition: 'top',
//     size: 'md',
//     langDir: 'ltr',
//     buttonLabel: '',
//   };

//   /**
//    * The handle of `onfocusin` or `focus` event handler.
//    * @private
//    */
//   // eslint-disable-next-line react/sort-comp
//   _hFocusIn = null;

//   /**
//    * The element ref of the tooltip's trigger button.
//    * @type {React.RefObject<Element>}
//    * @private
//    */
//   _triggerRef = React.createRef();

//   componentDidMount() {
//     const correctAlignment = this._getNewAlignment();
//     this._updateAlignment(correctAlignment);
//   }

//   componentDidUpdate(prevProps, prevState) {
//     const { onClose, langDir } = this.props;
//     // eslint-disable-next-line react/destructuring-assignment
//     if (!this.state.open && prevState.open && onClose) {
//       onClose();
//     }

//     if (prevProps.langDir !== langDir) {
//       const correctAlignment = this._getNewAlignment();
//       this._updateAlignment(correctAlignment);
//     }
//   }

//   static getDerivedStateFromProps({ open, tooltipAlignment }, state) {
//     const { prevOpen } = state;
//     return prevOpen === open
//       ? null
//       : {
//           open,
//           prevOpen: open,
//           tooltipAlignment,
//         };
//   }

//   handleClick = (evt) => {
//     evt.stopPropagation();
//     if (!this._menuBody || !this._menuBody.contains(evt.target)) {
//       this.setState((prevState) => ({
//         ...prevState,
//         open: !prevState.open,
//       }));
//       const { onClick } = this.props;
//       if (onClick) {
//         onClick(evt);
//       }
//     }
//   };

//   handleKeyPress = (evt) => {
//     const { onKeyDown } = this.props;
//     if (this.state.open && keyCodeMatches(evt, [ArrowUp, ArrowRight, ArrowDown, ArrowLeft])) {
//       evt.preventDefault();
//     }

//     if (onKeyDown) {
//       onKeyDown(evt);
//     }

//     // Close the overflow menu on escape
//     if (keyCodeMatches(evt, [Escape])) {
//       const wasOpen = this.state.open;
//       this.closeMenu(() => {
//         /* istanbul ignore else */
//         if (wasOpen) {
//           this.focusMenuEl();
//         }
//       });

//       // Stop the esc keypress from bubbling out and closing something it shouldn't
//       evt.stopPropagation();
//     }
//   };

//   handleClickOutside = (evt) => {
//     if (this.state.open && (!this._menuBody || !this._menuBody.contains(evt.target))) {
//       this.closeMenu();
//     }
//   };

//   closeMenu = (onCloseMenu) => {
//     this.setState(
//       (prevState) => ({
//         ...prevState,
//         open: false,
//       }),
//       () => {
//         // Optional callback to be executed after the state as been set to close
//         if (onCloseMenu) {
//           onCloseMenu();
//         }
//         const { onClose } = this.props;
//         if (onClose) {
//           onClose();
//         }
//       }
//     );
//   };

//   focusMenuEl = () => {
//     const { current: triggerEl } = this._triggerRef;
//     /* istanbul ignore else */
//     if (triggerEl) {
//       triggerEl.focus();
//     }
//   };

//   /**
//    * Focuses the next enabled overflow menu item given the currently focused
//    * item index and direction to move
//    * @param {object} params
//    * @param {number} params.currentIndex - the index of the currently focused
//    * overflow menu item in the list of overflow menu items
//    * @param {number} params.direction - number denoting the direction to move
//    * focus (1 for forwards, -1 for backwards)
//    */
//   handleOverflowMenuItemFocus = ({ currentIndex, direction }) => {
//     const enabledIndices = React.Children.toArray(this.props.children).reduce((acc, curr, i) => {
//       /* istanbul ignore else */
//       if (!curr.props.disabled) {
//         acc.push(i);
//       }
//       return acc;
//     }, []);
//     const nextValidIndex = (() => {
//       const nextIndex = enabledIndices.indexOf(currentIndex) + direction;
//       switch (enabledIndices.indexOf(currentIndex) + direction) {
//         case -1:
//           return enabledIndices.length - 1;
//         case enabledIndices.length:
//           return 0;
//         default:
//           return nextIndex;
//       }
//     })();
//     const { overflowMenuItem } = this[`overflowMenuItem${enabledIndices[nextValidIndex]}`];
//     // eslint-disable-next-line no-unused-expressions
//     overflowMenuItem?.current?.focus();
//   };

//   /**
//    * Handles the floating menu being unmounted or non-floating menu being
//    * mounted or unmounted.
//    * @param {Element} menuBody The DOM element of the menu body.
//    * @private
//    */
//   _bindMenuBody = (menuBody) => {
//     if (!menuBody) {
//       this._menuBody = menuBody;
//     }
//     if (!menuBody && this._hFocusIn) {
//       this._hFocusIn = this._hFocusIn.release();
//     }
//   };

//   /**
//    * Handles the floating menu being placed.
//    * @param {Element} menuBody The DOM element of the menu body.
//    * @private
//    */
//   _handlePlace = (menuBody) => {
//     /* istanbul ignore else */
//     if (menuBody) {
//       this._menuBody = menuBody;
//       const hasFocusin = 'onfocusin' in window;
//       const focusinEventName = hasFocusin ? 'focusin' : 'focus';
//       this._hFocusIn = on(
//         menuBody.ownerDocument,
//         focusinEventName,
//         (event) => {
//           const target = ClickListener.getEventTarget(event);
//           const { current: triggerEl } = this._triggerRef;
//           /* istanbul ignore else */
//           if (typeof target.matches === 'function') {
//             /* istanbul ignore else */
//             if (
//               !menuBody.contains(target) &&
//               triggerEl &&
//               !target.matches(
//                 `.${this.context}--overflow-menu,.${this.context}--overflow-menu-options`
//               )
//             ) {
//               this.closeMenu();
//             }
//           }
//         },
//         !hasFocusin
//       );
//       const { onOpen } = this.props;
//       if (onOpen) {
//         onOpen();
//       }
//     }
//   };

//   /**
//    * @returns {Element} The DOM element where the floating menu is placed in.
//    */
//   _getTarget = () => {
//     const { current: triggerEl } = this._triggerRef;
//     return (triggerEl && triggerEl.closest('[data-floating-menu-container]')) || document.body;
//   };

//   /**
//    * Updates state for tooltip alignment.
//    * @param {string} newAlignment Correct alignment.
//    * @private
//    */
//   _updateAlignment(newAlignment) {
//     this.setState((prevState) => ({
//       ...prevState,
//       tooltipAlignment: newAlignment,
//     }));
//   }

//   /**
//    * Returns correct tooltip alignment.
//    * @return {string} Correct alignment.
//    * @private
//    */
//   _getNewAlignment() {
//     const tooltip = this._triggerRef.current.querySelector(`.${carbonPrefix}--assistive-text`);
//     const container = this._triggerRef.current.parentElement;

//     if (tooltip && container) {
//       const tooltipRect = tooltip.getBoundingClientRect();
//       const containerRect = container.getBoundingClientRect();

//       if (tooltipRect.left + tooltipRect.width > containerRect.left + containerRect.width) {
//         return 'end';
//       }

//       if (tooltipRect.left < containerRect.left) {
//         return 'start';
//       }

//       return 'center';
//     }

//     return 'center';
//   }

//   render() {
//     const prefix = this.context;
//     const {
//       id,
//       ariaLabel,
//       children,
//       iconDescription, // Not used, preserved for PropTypes compatibility
//       direction,
//       flipped,
//       focusTrap,
//       menuOffset,
//       menuOffsetFlip,
//       iconClass, // Not used, preserved for PropTypes compatibility
//       onOpen, // Not to pollute DOM
//       selectorPrimaryFocus,
//       renderIcon: IconElement,
//       // eslint-disable-next-line react/prop-types
//       innerRef: ref,
//       menuOptionsClass,
//       light,
//       size,
//       'data-testid': testId,
//       tooltipPosition,
//       className,
//       langDir, // Not to pollute DOM
//       buttonLabel,
//       ...other
//     } = this.props;

//     const { open, tooltipAlignment } = this.state;

//     const overflowMenuClasses = classNames(className, `${prefix}--overflow-menu`, {
//       [`${prefix}--overflow-menu--open`]: open,
//       [`${prefix}--overflow-menu--light`]: light,
//       [`${prefix}--overflow-menu--${size}`]: size,
//       [`${iotPrefix}--overflow-menu--with-label`]: buttonLabel,
//     });

//     const overflowMenuOptionsClasses = classNames(
//       menuOptionsClass,
//       `${prefix}--overflow-menu-options`,
//       {
//         [`${prefix}--overflow-menu--flip`]: flipped,
//         [`${prefix}--overflow-menu-options--open`]: open,
//         [`${prefix}--overflow-menu-options--light`]: light,
//         [`${prefix}--overflow-menu-options--${size}`]: size,
//       }
//     );

//     const childrenWithProps = React.Children.toArray(children).map((child, index) =>
//       React.cloneElement(child, {
//         closeMenu: child?.props?.closeMenu || this.closeMenu,
//         handleOverflowMenuItemFocus: this.handleOverflowMenuItemFocus,
//         ref: (e) => {
//           this[`overflowMenuItem${index}`] = e;
//         },
//         index,
//       })
//     );

//     const menuBody = (
//       <ul className={overflowMenuOptionsClasses} tabIndex="-1" role="menu" aria-label={ariaLabel}>
//         {childrenWithProps}
//       </ul>
//     );

//     const wrappedMenuBody = (
//       <FloatingMenu
//         focusTrap={focusTrap}
//         triggerRef={this._triggerRef}
//         menuDirection={direction}
//         menuOffset={flipped ? menuOffsetFlip : menuOffset}
//         menuRef={this._bindMenuBody}
//         flipped={flipped}
//         target={this._getTarget}
//         onPlace={this._handlePlace}
//         selectorPrimaryFocus={selectorPrimaryFocus}
//       >
//         {React.cloneElement(menuBody, {
//           'data-floating-menu-direction': direction,
//         })}
//       </FloatingMenu>
//     );

//     return (
//       <ClickListener onClickOutside={this.handleClickOutside}>
//         <Button
//           testId={testId}
//           {...other}
//           ref={mergeRefs(this._triggerRef, ref)}
//           className={classNames(
//             overflowMenuClasses,
//             `${prefix}--btn--icon-only`,
//             `${iotPrefix}--tooltip-svg-wrapper`,
//             `${iotPrefix}--overflow-menu-icon`,
//             {
//               [`${iotPrefix}--table-toolbar-button-active`]: false, // https://github.com/carbon-design-system/carbon/issues/6160
//             }
//           )}
//           kind={buttonLabel ? 'primary' : 'icon-selection'}
//           iconDescription={ariaLabel}
//           onKeyDown={this.handleKeyPress}
//           onClick={this.handleClick}
//           renderIcon={IconElement}
//           tooltipAlignment={tooltipAlignment}
//           tooltipPosition={tooltipPosition}
//           id={id}
//           aria-haspopup
//           aria-expanded={open}
//         >
//           {buttonLabel || null}
//           {open && wrappedMenuBody}
//         </Button>
//       </ClickListener>
//     );
//   }
// }

export const OverflowMenu = ({
  direction,
  menuOffset,
  useAutoPositioning,
  flipped,
  testId,
  withCarbonTooltip,
  buttonLabel,
  ...props
}) => {
  const [calculateMenuOffset, { adjustedDirection, adjustedFlipped }] = usePopoverPositioning({
    direction,
    flipped,
    menuOffset: menuOffset || getMenuOffset,
    isOverflowMenu: true,
    useAutoPositioning,
  });

  // TODO - need to find out why not working in Table toolbar menu button.
  // const langDir = useLangDirection() || 'ltr'
  // if (withCarbonTooltip) {
  //   return (
  //     <IotOverflowMenu
  //       data-testid={testId}
  //       {...props}
  //       direction={adjustedDirection}
  //       flipped={adjustedFlipped}
  //       menuOffset={calculateMenuOffset}
  //       menuOffsetFlip={calculateMenuOffset}
  //       langDir={'ltr'}
  //       buttonLabel={buttonLabel}
  //     />
  //   );
  // }

  return (
    <CarbonOverflowMenu
      data-testid={testId}
      {...props}
      direction={adjustedDirection}
      flipped={adjustedFlipped}
      menuOffset={calculateMenuOffset}
      menuOffsetFlip={calculateMenuOffset}
    />
  );
};

OverflowMenu.propTypes = {
  ...CarbonOverflowMenu.propTypes,
  useAutoPositioning: PropTypes.bool,
  testId: PropTypes.string,
  withCarbonTooltip: PropTypes.bool,
  buttonLabel: PropTypes.string,
};

OverflowMenu.defaultProps = {
  ...CarbonOverflowMenu.defaultProps,
  useAutoPositioning: false,
  testId: 'overflow-menu',
  withCarbonTooltip: false,
  buttonLabel: '',
};

export default OverflowMenu;
