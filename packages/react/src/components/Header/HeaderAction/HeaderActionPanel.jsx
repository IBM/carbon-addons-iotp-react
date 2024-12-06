import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
// import { settings } from 'carbon-components';
import classnames from 'classnames';
import { HeaderGlobalAction, HeaderPanel } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { white } from '@carbon/colors';

import { APP_SWITCHER } from '../headerConstants';
import { handleSpecificKeyDown } from '../../../utils/componentUtilityFunctions';
import { HeaderActionPropTypes } from '../HeaderPropTypes';
import { isSafari } from '../../SuiteHeader/suiteHeaderUtils';

// const { prefix: carbonPrefix } = settings; // need to upgrade carbon 11
const carbonPrefix = 'bx';
const propTypes = {
  ...HeaderActionPropTypes,
  /** unique id for the action panel */
  id: PropTypes.string.isRequired,
  /** Ref object to be attached to the parent that should receive focus when a menu is closed */
  focusRef: PropTypes.oneOfType([
    // Either a function
    PropTypes.func,
    // Or the instance of a DOM native element (see the note about SSR)
    PropTypes.shape({
      current: typeof Element === 'undefined' ? PropTypes.any : PropTypes.instanceOf(Element),
    }),
  ]).isRequired,
};

const defaultProps = {
  // disabled b/c these are pulled in via the HeaderActionPropTypes above.
  /* eslint-disable react/default-props-match-prop-types */
  isExpanded: false,
  renderLabel: false,
  i18n: {
    closeMenu: 'close menu',
  },
  showCloseIconWhenPanelExpanded: false,
  /* eslint-enable react/default-props-match-prop-types */
};

/**
 * This component renders both a Header Action and it's child Header Panel
 * It has no local state.
 * It calls the onToggleExpansion when it should be opened or closed
 */
const HeaderActionPanel = ({
  item,
  index,
  onToggleExpansion,
  isExpanded,
  focusRef,
  renderLabel,
  i18n,
  inOverflow,
  showCloseIconWhenPanelExpanded,
  id,
}) => {
  const panelRef = useRef();

  const mergedI18n = useMemo(
    () => ({
      ...defaultProps.i18n,
      ...i18n,
    }),
    [i18n]
  );

  /**
   * This workaround is needed because blur event is not triggered
   * on button in Safari. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
   */
  useEffect(() => {
    if (!isSafari()) {
      return;
    }

    const handleOutsidePanelClick = (event) => {
      if (
        (panelRef.current && panelRef.current.contains(event.target)) ||
        (focusRef.current && focusRef.current.contains(event.target))
      ) {
        return;
      }

      if (isExpanded) {
        onToggleExpansion();
      }
    };

    document.addEventListener('click', handleOutsidePanelClick, { capture: true });

    // eslint-disable-next-line consistent-return
    return () => document.removeEventListener('click', handleOutsidePanelClick, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, onToggleExpansion]);

  return (
    <>
      <HeaderGlobalAction
        className={`${carbonPrefix}--header-action-btn action-btn__trigger`}
        key={`menu-item-${item.label}-global`}
        aria-label={item.label}
        aria-haspopup="menu"
        aria-expanded={isExpanded}
        onClick={() => onToggleExpansion()}
        ref={focusRef}
        id={id}
      >
        {renderLabel ? (
          item.label
        ) : isExpanded && (inOverflow || showCloseIconWhenPanelExpanded) ? (
          <Close fill={white} description={mergedI18n.closeMenu} />
        ) : (
          item.btnContent
        )}
      </HeaderGlobalAction>
      <HeaderPanel
        data-testid="action-btn__panel"
        ref={panelRef}
        tabIndex="-1"
        key={`panel-${index}`}
        className={
          item.label !== APP_SWITCHER
            ? classnames('action-btn__headerpanel', {
                'action-btn__headerpanel--closed': !isExpanded,
              })
            : classnames(`${carbonPrefix}--app-switcher`, {
                [item.childContent[0].className]: item.childContent[0].className,
                [item.childContent[0].metaData.className]: item.childContent[0].metaData.className,
              })
        }
        expanded={isExpanded}
      >
        <ul aria-label={item.label}>
          {item.childContent.map((childItem, k) => {
            const { element, ...metaData } = childItem?.metaData ?? {};
            const ChildElement = element || 'a';
            const onKeyDownClick = (e) => e.target.click();

            // if the item is an A and doesn't have an onClick event
            // do nothing. An A tag doesn't need an onClick handler.
            const onClick =
              ChildElement === 'a' && !metaData?.onClick
                ? undefined
                : // otherwise, if an onClick exists use that, or fallback to a noop.
                  metaData?.onClick || (() => {});

            // if item has onKeyDown use that otherwise, fallback to onClick if it exists
            // or create a custom handler to trigger the click
            const onKeyDown = metaData?.onKeyDown ? metaData.onKeyDown : onClick || onKeyDownClick;

            return (
              <li key={`listitem-${item.label}-${k}`} className="action-btn__headerpanel-li">
                <ChildElement
                  key={`headerpanelmenu-item-${item.label}-${index}-child-${k}`}
                  {...metaData}
                  onClick={onClick}
                  onKeyDown={handleSpecificKeyDown(['Enter', ' '], onKeyDown)}
                >
                  {
                    // if we're working with an actual react component (not an html element) pass
                    // the isExpanded prop, so we can control tab-navigation on the closed AppSwitcher
                    React.isValidElement(childItem.content) &&
                    typeof childItem.content.type !== 'string'
                      ? React.cloneElement(childItem.content, {
                          isExpanded,
                        })
                      : childItem.content
                  }
                </ChildElement>
              </li>
            );
          })}
        </ul>
      </HeaderPanel>
    </>
  );
};

HeaderActionPanel.propTypes = propTypes;
HeaderActionPanel.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => {
  return <HeaderActionPanel {...props} focusRef={ref} />;
});
