import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HeaderGlobalBar, OverflowMenuItem } from '@carbon/react';
import PropTypes from 'prop-types';
import { Close, OverflowMenuVertical } from '@carbon/react/icons';
import ReactDOM from 'react-dom';
import { useLangDirection } from 'use-lang-direction';

import { OverflowMenu } from '../OverflowMenu';
import { settings } from '../../constants/Settings';

import HeaderAction from './HeaderAction/HeaderAction';
import { HeaderActionItemPropTypes } from './HeaderPropTypes';

const { iotPrefix, prefix } = settings;

const propTypes = {
  actionItems: PropTypes.arrayOf(PropTypes.shape(HeaderActionItemPropTypes)).isRequired,

  i18n: PropTypes.shape({
    closeMenu: PropTypes.string,
    openMenu: PropTypes.string,
  }),

  testId: PropTypes.string,
  /** Returns true, if the icon should be shown. (actionItem) => {} */
  isActionItemVisible: PropTypes.func.isRequired,
  showCloseIconWhenPanelExpanded: PropTypes.bool,
};

const defaultProps = {
  i18n: {
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },
  testId: 'header-action-group',
  showCloseIconWhenPanelExpanded: false,
};

const findFirstVisible = (el) => {
  if (!el || !el.childNodes.length === 0) {
    return undefined;
  }

  const visibleChildren = Array.from(el.childNodes).filter((child) => child.offsetParent !== null);

  return visibleChildren.shift();
};
/**
 * Keeps track of the state of which header menu item is currently expanded
 *
 * Renders all the actions that can be clicked to navigate, open header panels (side panels),
 * or dropdown menus, passing an onToggleExpansion to each action
 */
const HeaderActionGroup = ({
  actionItems,
  i18n,
  testId,
  isActionItemVisible,
  showCloseIconWhenPanelExpanded,
}) => {
  const overFlowContainerRef = useRef(null);
  const [overflowItems, setOverflowItems] = useState([]);
  const breakpoint = useRef(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState(null);
  const mergedI18n = useMemo(
    () => ({
      ...defaultProps.i18n,
      ...i18n,
    }),
    [i18n]
  );

  const langDir = useLangDirection();
  const checkForOverflow = useCallback(() => {
    /* istanbul ignore else */
    if (overFlowContainerRef.current) {
      const firstButtonInGroupRef = findFirstVisible(
        overFlowContainerRef.current?.lastChild
      )?.getBoundingClientRect();
      const nameDivRef = overFlowContainerRef.current?.previousSibling?.getBoundingClientRect();

      /* istanbul ignore else */
      if (firstButtonInGroupRef && nameDivRef) {
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        // check that it's also greater than zero to prevent collapsing in jest where all the values are 0.
        const tooBig =
          langDir === 'ltr'
            ? nameDivRef.right > 0 && nameDivRef.right >= firstButtonInGroupRef.left
            : firstButtonInGroupRef.right > 0 && firstButtonInGroupRef.right >= nameDivRef.left;
        const previousBreakpoint = breakpoint.current;

        if (tooBig && actionItems.length > 0 && overflowItems.length === 0) {
          breakpoint.current = windowWidth;
          setOverflowItems(actionItems);
        } else if (windowWidth > previousBreakpoint) {
          setOverflowItems([]);
        }
      }
    }
  }, [actionItems, langDir, overflowItems.length]);

  useLayoutEffect(() => {
    // Check for SSR
    if (typeof window !== 'undefined') {
      checkForOverflow();
      window.addEventListener('resize', checkForOverflow);
    }

    return () => {
      // Check for SSR
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkForOverflow);
      }
    };
  }, [checkForOverflow]);

  return (
    // added extra div here, because HeaderGlobalBar doesn't support refs
    <div ref={overFlowContainerRef} className={`${prefix}--header__global`}>
      <HeaderGlobalBar data-testid={testId}>
        {
          // if we have overflow items and are not showing a header action submenu
          // then render the overflow menu
          overflowItems.length > 0 && !showMenu ? (
            <div
              className={`${iotPrefix}--header__overflow-menu-container`}
              data-floating-menu-container
            >
              <OverflowMenu
                useAutoPositioning
                onClick={({ target }) => {
                  if (target.tagName === 'BUTTON') {
                    setOverflowOpen((prev) => !prev);
                  } else {
                    /**
                     * This is a hack to get around the onClick event firing twice when clicking
                     * directly on the svg within the button instead of the button itself. A stopPropagation
                     * makes the overflow not open, so we have to resort to reading the aria-expanded value to
                     * know whether the OverflowMenu is open and adjust the icons accordingly. This double-click
                     * only occurs when changing the icon. If the same icon is always used it works as expected.
                     * My guess is this is because of the outsideClickClosing that the overflow menu does. WHen the
                     * icon is change it is "outside" of the element for a moment and causes a close--that or a re-render that
                     * is triggered when the icon changes.
                     */
                    const button = target.closest('button');
                    setTimeout(() => {
                      const expanded = button?.getAttribute('aria-expanded') === 'true';
                      setOverflowOpen(expanded);
                    }, 0);
                  }
                }}
                open={overflowOpen}
                renderIcon={(iconProps) =>
                  overflowOpen ? (
                    <Close
                      {...iconProps}
                      aria-label={mergedI18n.closeMenu}
                      description={mergedI18n.closeMenu}
                    />
                  ) : (
                    <OverflowMenuVertical
                      {...iconProps}
                      aria-label={mergedI18n.openMenu}
                      description={mergedI18n.openMenu}
                    />
                  )
                }
              >
                {overflowItems.map((child, i) => {
                  if (!isActionItemVisible(child)) {
                    return null;
                  }

                  if (
                    child.hasHeaderPanel ||
                    (Array.isArray(child.childContent) && child.childContent.length > 0)
                  ) {
                    ReactDOM.createPortal(
                      [
                        <HeaderAction
                          item={child}
                          index={i}
                          key={`header-action-item-${child.label}-${i}`}
                          testId={`header-action-item-${child.label}`}
                          // used to render only the label in the overflow menu instead of the icon
                          renderLabel
                          i18n={mergedI18n}
                        />,
                      ],
                      overFlowContainerRef.current.parentNode
                    );
                  }

                  return (
                    <OverflowMenuItem
                      title={child.label}
                      key={`${child.label}-${i}`}
                      data-testid={`${testId}-overflow-menu-item-${i}`}
                      onClick={(event) => {
                        // because these items are passed an href="#" we want to prevent the default action
                        event.preventDefault();

                        // if a header action has a submenu, we need to capture that submenu
                        // and replace the main overflow menu icon with it per design specs
                        // this saves the menu item on click, closes the overflow menu, and
                        // instead shows the header action menu.
                        /* istanbul ignore else */
                        if (Array.isArray(child.childContent) && child.childContent.length > 0) {
                          setMenu(child);
                          setOverflowOpen(false);
                          setShowMenu(true);
                        }

                        if (typeof child.onClick === 'function') {
                          child.onClick(event);
                          setOverflowOpen(false);
                        }
                      }}
                      itemText={child.label}
                    />
                  );
                })}
              </OverflowMenu>
            </div>
          ) : // if the user clicked on a header action with a menu
          // show that menu in place of the overflow menu.
          showMenu ? (
            <HeaderAction
              item={menu}
              index={0}
              key={`header-action-item-${menu.label}-${0}`}
              testId={`header-action-item-${menu.label}`}
              // force this menu menu to be open
              defaultExpanded
              // close the menu and restore the overflow menu button
              onClose={() => {
                setShowMenu(false);
                setMenu(null);
              }}
              inOverflow={overflowItems.length > 0}
            />
          ) : (
            // otherwise, if we have enough space to show all the items,
            // simple render them in the header as expected.
            actionItems
              .filter((item) => isActionItemVisible(item))
              .map((item, i) => (
                <HeaderAction
                  item={item}
                  index={i}
                  key={`header-action-item-${item.label}-${i}`}
                  testId={`header-action-item-${item.label}`}
                  showCloseIconWhenPanelExpanded={showCloseIconWhenPanelExpanded}
                />
              ))
          )
        }
      </HeaderGlobalBar>
    </div>
  );
};

HeaderActionGroup.propTypes = propTypes;
HeaderActionGroup.defaultProps = defaultProps;

export default HeaderActionGroup;
