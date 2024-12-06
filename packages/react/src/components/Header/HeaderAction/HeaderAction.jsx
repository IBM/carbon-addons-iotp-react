import React, { useMemo, useRef, useState } from 'react';
// import { settings } from 'carbon-components';
import { HeaderGlobalAction } from '@carbon/react';
import classnames from 'classnames';
import { Close } from '@carbon/react/icons';
import { white } from '@carbon/colors';

import { keyboardKeys } from '../../../constants/KeyCodeConstants';
import { handleSpecificKeyDown } from '../../../utils/componentUtilityFunctions';
import { HeaderActionPropTypes } from '../HeaderPropTypes';

import HeaderActionMenu from './HeaderActionMenu';
import HeaderActionPanel from './HeaderActionPanel';

// const { prefix: carbonPrefix } = settings; need to upgrade carbon 11
const carbonPrefix = 'cds';
const defaultProps = {
  testId: 'header-action',
  renderLabel: false,
  defaultExpanded: false,
  onClose: null,
  i18n: {
    closeMenu: 'Close menu',
  },
  inOverflow: false,
  showCloseIconWhenPanelExpanded: false,
};

/**
 * Listens to blur events and sends state changes back to the HeaderBar to determine
 * which items should be expanded
 *
 * Determines which element to render based on item
 *
 * Consists of nav buttons that can be clicked to perform actions, open header panels (side panels),
 * or dropdown menus
 */
const HeaderAction = ({
  item,
  index,
  testID,
  testId,
  renderLabel,
  defaultExpanded,
  onClose,
  i18n,
  inOverflow,
  showCloseIconWhenPanelExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const parentContainerRef = useRef(null);
  const menuButtonRef = useRef(null);

  const actionId = item.id || `menu-item-global-action-${index}`;

  const mergedI18n = useMemo(
    () => ({
      ...defaultProps.i18n,
      ...i18n,
    }),
    [i18n]
  );

  // expanded state for HeaderAction dropdowns
  const toggleExpandedState = () => {
    setIsExpanded((state) => {
      if (state && typeof onClose === 'function') {
        onClose();
      }
      return !state;
    });
  };

  /**
   * close header panel when focus is lost as long as we didn't enter into the child panel
   * */
  const handleHeaderClose = (event) => {
    if (!parentContainerRef.current.contains(event.relatedTarget)) {
      // Only close the header if the header is already expanded
      if (isExpanded) toggleExpandedState();
    }
  };

  /**
   * Toggles expanded state and return focus to menu button
   */
  const handleHeaderKeyDown = (event) => {
    // Handle keydowns for opening and closing the menus
    if (
      (event.key === keyboardKeys.ESCAPE && isExpanded) ||
      event.key === keyboardKeys.SPACE ||
      event.key === keyboardKeys.ENTER
    ) {
      event.stopPropagation();
      event.preventDefault();
      toggleExpandedState();

      // Return focus to menu button when the user hits ESC.
      /* istanbul ignore else */
      if (menuButtonRef && menuButtonRef.current) {
        menuButtonRef.current.focus();
      }
    }
  };

  if (item.hasOwnProperty('childContent')) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        data-testid="action-btn__group"
        className={`${carbonPrefix}--header__submenu ${carbonPrefix}--header-action-btn action-btn__group`}
        key={`submenu-${index}`}
        onBlur={(e) => handleHeaderClose(e)}
        onKeyDown={handleHeaderKeyDown}
        ref={parentContainerRef}
      >
        {item.hasOwnProperty('hasHeaderPanel') ? (
          // Render a subpanel type action
          <HeaderActionPanel
            item={item}
            onToggleExpansion={toggleExpandedState}
            isExpanded={isExpanded}
            ref={menuButtonRef}
            index={index}
            renderLabel={renderLabel}
            i18n={mergedI18n}
            inOverflow={inOverflow}
            showCloseIconWhenPanelExpanded={showCloseIconWhenPanelExpanded}
            id={actionId}
          />
        ) : (
          // otherwise render a submenu type dropdown
          <HeaderActionMenu
            className={`${carbonPrefix}--header-action-btn`}
            key={`menu-item-${item.label}`}
            aria-label={item.label}
            renderMenuContent={() => {
              return isExpanded && inOverflow ? (
                <Close fill={white} description={mergedI18n.closeMenu} />
              ) : (
                item.btnContent
              );
            }}
            menuLinkName={item.menuLinkName ? item.menuLinkName : ''}
            isExpanded={isExpanded}
            ref={menuButtonRef}
            onToggleExpansion={toggleExpandedState}
            label={item.label}
            data-testid={testID || testId}
            title={item.label}
            childContent={item.childContent}
            id={actionId}
          />
        )}
      </div>
    );
  }

  const onClick = item.onClick || (() => {});
  const onKeyDown = item.onKeyDown || onClick;
  // Otherwise render a simple menu button with no wrapper div
  return (
    <HeaderGlobalAction
      className={classnames(`${carbonPrefix}--header-action-btn`, item.className)}
      key={`menu-item-${item.label}-global-${index}`}
      data-testid={`menu-item-${item.label}-global`}
      aria-label={item.label}
      onClick={onClick}
      onKeyDown={handleSpecificKeyDown(['Enter', ' '], onKeyDown)}
      href={item.href}
      rel={item.rel}
      target={item.target}
      id={actionId}
    >
      {renderLabel ? item.label : item.btnContent}
    </HeaderGlobalAction>
  );
};

HeaderAction.propTypes = HeaderActionPropTypes;
HeaderAction.defaultProps = defaultProps;

export default HeaderAction;
