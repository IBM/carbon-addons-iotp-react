import {
  Header as CarbonHeader,
  HeaderMenuButton,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  HeaderMenuItem,
  HeaderPanel,
} from 'carbon-components-react/lib/components/UIShell';
import AppSwitcher from '@carbon/icons-react/lib/app-switcher/20';
import PropTypes from 'prop-types';
import React, { useState, createRef, useEffect } from 'react';
import { settings } from 'carbon-components';
import cn from 'classnames';

import HeaderMenu from './HeaderMenu';
// import HeaderPanel from './HeaderPanel';

const { prefix: carbonPrefix } = settings;

const propTypes = {
  /** Add a prefix other than IBM */
  prefix: PropTypes.string,
  /** Name to follow the IBM prefix up top, left */
  appName: PropTypes.string.isRequired,
  /** Add a class name to Header */
  className: PropTypes.string,
  /** Provide ID for the skip to content functionality */
  skipto: PropTypes.string,
  /** href optional url to file if you click on title */
  url: PropTypes.string,
  /** Object of action items */
  actionItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      /** declare control of header panel from this action item.  */
      headerPanel: PropTypes.bool,
      btnContent: PropTypes.any.isRequired,
      childContent: PropTypes.arrayOf(
        PropTypes.shape({
          /** extra data to pass to HeaderMenuLink (aria-*, href, target, etc.) */
          metaData: PropTypes.object,
          /** Optionally pass in an onClick handler to trigger action  */
          onClick: PropTypes.func,
          content: PropTypes.any.isRequired,
        })
      ),
    })
  ).isRequired,
  /** Bit to flip that tells header to render the nav toggle button */
  hasSideNav: PropTypes.bool,
  onClickSideNavExpand: PropTypes.func,
  /** Main app switcher Header panel props */
  headerPanel: PropTypes.shape({
    /** Optionally provide a custom class to apply to the underlying <li> node */
    className: PropTypes.string,
    /** the content of the header panel  */
    content: PropTypes.any,
  }),
};

const defaultProps = {
  onClickSideNavExpand: null,
  hasSideNav: true,
  prefix: 'IBM',
  className: 'main-header',
  skipto: '#main-content',
  headerPanel: null,
  url: '#',
};

/**
 * Clickable card that shows "Add" button
 */
const Header = ({
  appName,
  className,
  actionItems,
  prefix,
  skipto,
  hasSideNav,
  onClickSideNavExpand,
  headerPanel,
  url,
}) => {
  // dynamic refs for global action dropdown
  const refs = {};
  // ref for App Switcher - only create if there is going to be one
  const appSwitch = headerPanel ? createRef() : null;
  const [expandedItem, setExpandedItem] = useState({});
  // const [openMenuItem, setOpenMenuItem] = useState();
  // useEffect(
  //   () => {
  //     // action on update of movies
  //     if (openMenuItem) {
  //       console.log(openMenuItem.classList.contains('action-btn__trigger'));
  //     }
  //   },
  //   [openMenuItem]
  // );

  // expanded state and focus for headerpanels
  const handleExpandedState = (e, index) => {
    const clicked = e.currentTarget;
    // console.log('types: ', e.type, e.relatedTarget);
    // setOpenMenuItem(clicked);

    // if (!expandedItem[index]) {
    //   ref.current.focus();
    // }
    if (index) {
      console.log('index');
      setExpandedItem({
        [index]: !expandedItem[index],
      });
    } else {
      console.log('not');
      setExpandedItem(prev => {
        const oldHeaderPanel = Object.keys(prev)[0];
        return {
          [oldHeaderPanel]: false,
        };
      });
    }
  };

  const handleTabOrder = e => {
    // console.log('blurred ', e.target);
    // if (e.target.parentNode.parentNode.parentNode.contains(e.relatedTarget)) {
    //   return;
    // }

    if (!e.target.parentNode.parentNode.contains(e.relatedTarget)) {
      setExpandedItem(prev => {
        const oldHeaderPanel = Object.keys(prev)[0];
        return {
          [oldHeaderPanel]: false,
        };
      });
    }
  };

  // create refs dynamically
  const setRefFunction = i => {
    refs[`ref${i}`] = createRef();
    return refs[`ref${i}`];
  };

  const actionBtnHeaderPanels = [];
  const actionBtnContent = actionItems.map((item, i) => {
    if (item.hasOwnProperty('childContent')) {
      if (item.hasOwnProperty('headerPanel')) {
        const panelChildren = item.childContent.map(childItem => {
          const ChildElement = childItem?.metaData?.element || 'a';
          return (
            <li key={`listitem-${i * Math.random()}`}>
              <ChildElement
                key={`headerpanelmenu-item-${item.label +
                  item.childContent.indexOf(childItem)}-child-${i}`}
                {...childItem.metaData}
              >
                {childItem.content}
              </ChildElement>
            </li>
          );
        });

        const thisRef = setRefFunction(i);
        // actionBtnHeaderPanels.push(
        //   <HeaderPanel
        //     // onBlur={e => handleTabOrder(e)}
        //     ref={thisRef}
        //     key={`panel-${i}`}
        //     aria-label="Header Panel"
        //     className={cn('action-btn__headerpanel', {
        //       'action-btn__headerpanel--closed': expandedItem[item.label],
        //     })}
        //     expanded={expandedItem[item.label]}
        //   >
        //     <ul>{panelChildren}</ul>
        //   </HeaderPanel>
        // );

        return (
          <div className={`${carbonPrefix}--header__submenu ${carbonPrefix}--header-action-btn`}>
            <HeaderGlobalAction
              // onBlur={e => handleTabOrder(e)}
              className={`${carbonPrefix}--header-action-btn action-btn__trigger`}
              key={`menu-item-${item.label}-global`}
              title={item.label}
              aria-label={item.label}
              aria-haspopup="menu"
              role="menuitem"
              onClick={e => handleExpandedState(e, item.label, thisRef)}
            >
              {item.btnContent}
            </HeaderGlobalAction>
            <HeaderPanel
              onBlur={e => handleTabOrder(e)}
              ref={thisRef}
              key={`panel-${i}`}
              aria-label="Header Panel"
              className={cn('action-btn__headerpanel', {
                'action-btn__headerpanel--closed': !expandedItem[item.label],
              })}
              expanded={expandedItem[item.label]}
            >
              <ul aria-label={item.label} role="menu">
                {panelChildren}
              </ul>
            </HeaderPanel>
          </div>
        );
      }
      const children = item.childContent.map(childItem => (
        <HeaderMenuItem
          key={`menu-item-${item.label + item.childContent.indexOf(childItem)}-child`}
          {...childItem.metaData}
        >
          {childItem.content}
        </HeaderMenuItem>
      ));
      return (
        <div onFocus={e => handleExpandedState(e)}>
          <HeaderMenu
            className={`${carbonPrefix}--header-action-btn`}
            key={`menu-item-${item.label}`}
            aria-label={item.label}
            isMenu={false}
            renderMenuContent={() => item.btnContent}
            menuLinkName={item.menuLinkName ? item.menuLinkName : ''}
          >
            {children}
          </HeaderMenu>
        </div>
      );
    }
    return (
      <HeaderGlobalAction
        className={`${carbonPrefix}--header-action-btn`}
        key={`menu-item-${item.label}-global-${i}`}
        aria-label={item.label}
        onClick={item.onClick}
      >
        {item.btnContent}
      </HeaderGlobalAction>
    );
  });
  if (headerPanel) {
    actionBtnContent.push(
      <HeaderGlobalAction
        aria-label="header-panel-trigger"
        key="AppSwitcher"
        onClick={e => handleExpandedState(e, 'AppSwitcher', appSwitch)}
      >
        <AppSwitcher fill="white" description="Icon" />
      </HeaderGlobalAction>
    );
  }

  return (
    <CarbonHeader className={className} aria-label="main header">
      <SkipToContent href={skipto} />
      {hasSideNav && <HeaderMenuButton aria-label="Open menu" onClick={onClickSideNavExpand} />}
      <HeaderName href={url} prefix={prefix}>
        {appName}
      </HeaderName>
      <HeaderGlobalBar>{actionBtnContent}</HeaderGlobalBar>
      {actionBtnHeaderPanels}
      {headerPanel && (
        <HeaderPanel
          ref={appSwitch}
          aria-label="Header Panel"
          className={cn(`${carbonPrefix}--app-switcher`, {
            [headerPanel.className]: headerPanel.className,
          })}
          expanded={expandedItem.AppSwitcher}
        >
          <div>
            <headerPanel.content />
          </div>
        </HeaderPanel>
      )}
    </CarbonHeader>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
