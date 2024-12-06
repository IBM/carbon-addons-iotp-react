import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Search,
  // SideNavSwitcher,
} from '@carbon/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import classnames from 'classnames';
import { partition } from 'lodash-es';

import { settings } from '../../constants/Settings';
import { CarbonIconPropType } from '../../constants/SharedPropTypes';
import { handleSpecificKeyDown } from '../../utils/componentUtilityFunctions';

import { SideNavMetaDataPropType } from './sideNavPropTypes';
import FilterableSideNavMenu from './FilterableSideNavMenu';

const { iotPrefix, prefix } = settings;

const markText = (allText, substringToMark) => {
  const regex = new RegExp(`(.*)(${substringToMark})(.*)`, 'i');
  const regexResult = regex.exec(allText);

  if (regexResult !== null) {
    const [textInFront, markedText, textBehind] = regexResult.slice(1, 4);
    return (
      <>
        <span>{textInFront}</span>
        <mark>{markedText}</mark>
        <span>{textBehind}</span>
      </>
    );
  }

  return allText;
};

const filterLinks = (items, searchValue) => {
  const filteredItems = [];
  items.forEach((link) => {
    const isLeaf = !link.childContent;
    const content = link.linkContent || link.content;

    if (isLeaf && content.toLowerCase().includes(searchValue)) {
      filteredItems.push(link);
    } else if (!isLeaf) {
      const matchingChildren = filterLinks(link.childContent, searchValue);
      if (matchingChildren.length) {
        filteredItems.push({ ...link, childContent: matchingChildren });
      }
    }
  });
  return filteredItems;
};

export const SideNavPropTypes = {
  /** Specify whether the side navigation is expanded or collapsed */
  defaultExpanded: PropTypes.bool,
  /** Enables search functionality for the links */
  hasSearch: PropTypes.bool,
  /** array of link item objects */
  links: PropTypes.arrayOf(
    PropTypes.shape({
      /** is current link active */
      isActive: PropTypes.bool,
      /** bot show/hide link */
      isEnabled: PropTypes.bool,
      /** pins the link to the top if hasSearch is true */
      isPinned: PropTypes.bool,
      /** extra props to pass to link component */
      /** Example:
          // What to render for link
          element: PropTypes.any,
          // trigger something instead of follow link
          onClick: PropTypes.func,
          // url to link to
          href: PropTypes.string,
      */
      metaData: SideNavMetaDataPropType,
      /** the icon component to render */
      icon: CarbonIconPropType.isRequired,
      /** string for the title of overall submenu */
      linkContent: PropTypes.string,
      /** array of child links to render in a subnav */
      childContent: PropTypes.arrayOf(
        PropTypes.shape({
          /** props to pass to link component */
          /** Example:
            // What to render for link
            element: PropTypes.any,
            // trigger something instead of follow link
            onClick: PropTypes.func,
            // url to link to
            href: PropTypes.string,
          */
          metaData: SideNavMetaDataPropType,
          /** content to render inside sub menu link */
          content: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node,
            PropTypes.bool,
            PropTypes.func,
          ]).isRequired,
          /** is current link active */
          isActive: PropTypes.bool,
        })
      ),
    })
  ).isRequired,
  recentLinks: PropTypes.arrayOf(
    PropTypes.shape({
      /** is current link active */
      isActive: PropTypes.bool,
      /** bot show/hide link */
      isEnabled: PropTypes.bool,
      /** pins the link to the top if hasSearch is true */
      isPinned: PropTypes.bool,
      /** extra props to pass to link component */
      /** Example:
          // What to render for link
          element: PropTypes.any,
          // trigger something instead of follow link
          onClick: PropTypes.func,
          // url to link to
          href: PropTypes.string,
      */
      metaData: SideNavMetaDataPropType,
      /** the icon component to render */
      icon: CarbonIconPropType.isRequired,
      /** string for the title of overall submenu */
      linkContent: PropTypes.string,
      /** array of child links to render in a subnav */
      childContent: PropTypes.arrayOf(
        PropTypes.shape({
          /** props to pass to link component */
          /** Example:
            // What to render for link
            element: PropTypes.any,
            // trigger something instead of follow link
            onClick: PropTypes.func,
            // url to link to
            href: PropTypes.string,
          */
          metaData: SideNavMetaDataPropType,
          /** content to render inside sub menu link */
          content: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node,
            PropTypes.bool,
            PropTypes.func,
          ]).isRequired,
          /** is current link active */
          isActive: PropTypes.bool,
        })
      ),
    })
  ),
  isSideNavExpanded: PropTypes.bool,
  i18n: PropTypes.shape({
    closeText: PropTypes.string,
    openText: PropTypes.string,
    sideNavLabelText: PropTypes.string,
    submenuLabel: PropTypes.string,
    emptySearchText: PropTypes.string,
    searchCloseButtonLabelText: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    searchLabelText: PropTypes.string,
  }),

  testId: PropTypes.string,
};

const defaultProps = {
  defaultExpanded: false,
  hasSearch: false,
  isSideNavExpanded: false,
  i18n: {
    closeText: 'Close',
    openText: 'Open',
    sideNavLabelText: 'Side navigation',
    submenuLabel: 'dropdown',
    emptySearchText: 'No matches found',
    searchCloseButtonLabelText: 'Clear search input',
    searchPlaceholder: 'Find navigation item...',
    searchLabelText: 'Find navigation item',
  },
  testId: 'side-nav',
  recentLinks: [],
};

/**
 * Simply recursive check for active children, so that a grandparent
 * can also be marked as active when necessary.
 *
 * @param {Object} link
 * @returns boolean
 */
const isAnyChildActive = (link) => {
  if (link.isActive) {
    return true;
  }

  if (link.hasOwnProperty('childContent')) {
    return link.childContent.some((childLink) => {
      return isAnyChildActive(childLink);
    });
  }

  return false;
};
/**
 * Side Navigation. part of UI shell
 */
const SideNav = ({
  links,
  defaultExpanded,
  hasSearch,
  isSideNavExpanded,
  i18n,
  testId,
  recentLinks,
  ...props
}) => {
  /**
   * Recursive function for rendering all the nested children nav items
   *
   * @param {Object} link a single link object
   * @param {Number} index The index of the item in the array
   * @param {Number} level The number of levels deep this link is
   * @returns ReactElement
   */
  const renderLinkMenu = (link, index, level = 0, searchValue) => {
    const isFiltering = searchValue !== undefined;
    let parentActive = false;
    const children = link.childContent.map((childLink, childIndex) => {
      if (isAnyChildActive(childLink)) {
        parentActive = true;
      }

      if (childLink.hasOwnProperty('childContent')) {
        return renderLinkMenu(childLink, childIndex, level + 1, searchValue);
      }

      const preventSideNavMenuFromClosingOnBublingEsc = isFiltering;
      const onKeyDown = preventSideNavMenuFromClosingOnBublingEsc
        ? handleSpecificKeyDown(['Escape'], (evt) => evt.stopPropagation())
        : undefined;
      const content = searchValue ? markText(childLink.content, searchValue) : childLink.content;

      return (
        <SideNavMenuItem
          onKeyDown={onKeyDown}
          key={`menu-link-${link.childContent.indexOf(childLink)}-child`}
          isActive={childLink.isActive}
          data-testid={`${testId}-menu-item-${index}`}
          {...childLink.metaData}
        >
          {content}
        </SideNavMenuItem>
      );
    });
    return (
      <FilterableSideNavMenu
        isFiltering={isFiltering}
        isActive={parentActive}
        renderIcon={link.icon}
        aria-label={i18n.submenuLabel}
        key={`menu-link-${link.linkContent.replace(/\s/g, '')}-dropdown`}
        title={link.linkContent}
        testId={`${testId}-menu-${index}`}
        className={`${iotPrefix}--side-nav__item--depth-${level}`}
      >
        {children}
      </FilterableSideNavMenu>
    );
  };

  const renderLinks = (linkConfigurations, searchValue) =>
    linkConfigurations
      .map((link, index) => {
        if (!link.isEnabled) {
          return null;
        }

        if (link.hasOwnProperty('childContent')) {
          return renderLinkMenu(link, index, 0, searchValue);
        }

        const isFiltering = searchValue !== undefined;
        const content = searchValue ? markText(link.linkContent, searchValue) : link.linkContent;

        return (
          <SideNavLink
            key={`menu-link-${link.metaData.label.replace(/\s/g, '')}-global`}
            aria-label={link.metaData.label}
            onClick={link.metaData.onClick}
            href={link.metaData.href}
            renderIcon={link.icon}
            isActive={link.isActive}
            data-testid={`${testId}-link-${index}`}
            className={classnames(link.metaData.className, {
              [`${iotPrefix}--side-nav__item--is-filtering`]: isFiltering,
            })}
            {...link.metaData}
          >
            {content}
          </SideNavLink>
        );
      })
      .filter((i) => i);

  const [pinnedLinks, filterableLinks] = hasSearch
    ? partition([...recentLinks, ...links], (link) => link.isPinned)
    : [[], [...recentLinks, ...links]];
  const renderedPinnedLinks = renderLinks(pinnedLinks);
  const [renderedFilterableLinks, setRenderedFilterableLinks] = useState(
    renderLinks(filterableLinks)
  );
  const [isFiltering, setIsFiltering] = useState(false);

  const handleSearchChange = (event) => {
    const isSearching = 'value' in event.target && event.target?.value !== '';
    const newSearchValue = isSearching ? event.target.value.toLowerCase() : undefined;
    setIsFiltering(isSearching);
    const linksToRender = isSearching
      ? filterLinks(filterableLinks, newSearchValue)
      : filterableLinks;
    setRenderedFilterableLinks(renderLinks(linksToRender, newSearchValue));
  };

  const search = hasSearch
    ? [
        <Search
          key="sidenav-search"
          id="sidenav-search"
          data-testid={`${testId}-search`}
          closeButtonLabelText={i18n.searchCloseButtonLabelText}
          placeholder={i18n.searchPlaceholder}
          labelText={i18n.searchLabelText}
          onChange={handleSearchChange}
          size="md"
        />,
      ]
    : [];

  const staticSideNavContent =
    hasSearch && pinnedLinks.length
      ? [
          <SideNavItems
            className={`${iotPrefix}--side-nav__pinned-items`}
            key="pinned-side-nav-content"
          >
            {renderedPinnedLinks}
          </SideNavItems>,
        ]
      : [];

  const dynamicSideNavContent =
    isFiltering && renderedFilterableLinks.length === 0 ? (
      <div key="empty-search" className={`${iotPrefix}--side-nav__empty-search-msg`}>
        {i18n.emptySearchText}
      </div>
    ) : (
      // The key needed to pick up the change of `defaultExpanded` in the SideNavMenuItems
      <SideNavItems key={`dynamic-side-nav-content-${isFiltering}`}>
        {renderedFilterableLinks}
      </SideNavItems>
    );

  // TODO: Will be added back in when footer is added for rails.
  // see: https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/UIShell/SideNav.js#L143
  // const translateById = (id) =>
  //   id !== 'carbon.sidenav.state.closed' ? i18n.closeText : i18n.openText;

  return (
    <CarbonSideNav
      data-testid={testId}
      className={classnames(`${iotPrefix}--side-nav`, {
        [`${iotPrefix}--side-nav--expanded`]: isSideNavExpanded,
        [`${prefix}--side-nav--expanded`]: isSideNavExpanded,
      })}
      expanded={isSideNavExpanded}
      // TODO: Will be added back in when footer is added for rails.
      // see: https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/UIShell/SideNav.js#L143
      // translateById={translateById}
      aria-label={i18n.sideNavLabelText}
      defaultExpanded={defaultExpanded}
      isRail
      {...props} // spreading here as base component does not pass to DOM element.
    >
      {
        // We use an array for the children since CarbonSideNav can't handle null or
        // undefined being passed as a child so if hasSearch is false we don't pass anything.
        [...search, ...staticSideNavContent, dynamicSideNavContent]
      }
    </CarbonSideNav>
  );
};

SideNav.propTypes = SideNavPropTypes;
SideNav.defaultProps = defaultProps;

CarbonSideNav.displayName = 'SideNav';
SideNavItems.displayName = 'SideNavItems';
SideNavLink.displayName = 'SideNavLink';
SideNavMenu.displayName = 'SideNavMenu';
SideNavMenuItem.displayName = 'SideNavMenuItem';
FilterableSideNavMenu.displayName = 'SideNavMenu';

export default SideNav;
