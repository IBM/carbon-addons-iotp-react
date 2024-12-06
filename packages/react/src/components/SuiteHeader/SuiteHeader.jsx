/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { UserAvatar, Settings, Help } from '@carbon/react/icons';
import {
  ButtonSkeleton,
  HeaderContainer,
  ActionableNotification,
  Link,
  SkeletonText,
} from '@carbon/react';
import classnames from 'classnames';
import { get, set, cloneDeep } from 'lodash-es';

import SideNav, { SideNavPropTypes } from '../SideNav/SideNav';
import Header from '../Header/Header';
import { HeaderActionItemPropTypes, ChildContentPropTypes } from '../Header/HeaderPropTypes';
import { settings } from '../../constants/Settings';
import Walkme from '../Walkme/Walkme';

import SuiteHeaderProfile from './SuiteHeaderProfile/SuiteHeaderProfile';
import SuiteHeaderAppSwitcher from './SuiteHeaderAppSwitcher/SuiteHeaderAppSwitcher';
import SuiteHeaderAppSwitcherLoading from './SuiteHeaderAppSwitcher/SuiteHeaderAppSwitcherLoading';
import MultiWorkspaceSuiteHeaderAppSwitcher from './SuiteHeaderAppSwitcher/MultiWorkspaceSuiteHeaderAppSwitcher';
import SuiteHeaderLogoutModal from './SuiteHeaderLogoutModal/SuiteHeaderLogoutModal';
import IdleLogoutConfirmationModal, {
  IdleLogoutConfirmationModalIdleTimeoutPropTypes,
} from './IdleLogoutConfirmationModal/IdleLogoutConfirmationModal';
import SuiteHeaderI18N from './i18n';
import { shouldOpenInNewWindow } from './suiteHeaderUtils';
import {
  SuiteHeaderApplicationPropTypes,
  SuiteHeaderWorkspacePropTypes,
  SuiteHeaderI18NPropTypes,
  SuiteHeaderRoutePropTypes,
  SuiteHeaderSurveyDataPropTypes,
} from './SuiteHeaderPropTypes';
import { SUITE_HEADER_ROUTE_TYPES } from './suiteHeaderConstants';

const defaultProps = {
  className: null,
  appName: null,
  extraContent: null,
  userDisplayName: null,
  username: null,
  isAdminView: false,
  hasSideNav: false,
  routes: null,
  applications: null,
  workspaces: null,
  globalApplications: [],
  sideNavProps: null,
  surveyData: null,
  idleTimeoutData: null,
  onStayLoggedIn: () => {},
  onSideNavToggled: async () => Promise.resolve(true),
  onRouteChange: async () => Promise.resolve(true),
  i18n: SuiteHeaderI18N.en,
  customActionItems: [],
  customHelpLinks: [],
  customProfileLinks: [],
  customApplications: [],
  walkmePath: null,
  walkmeLang: 'en',
  testId: 'suite-header',
  isActionItemVisible: () => true,
  handleHeaderNameClick: null,
  hideMenuButton: false,
  closeSideNavOnNavigation: false,
};

const propTypes = {
  /** Add class name to the rendered Header component */
  className: PropTypes.string,
  /** Name of suite (maps to appName in Header) */
  suiteName: PropTypes.string.isRequired,
  /** Application name in suite (maps to subtitle in Header) */
  appName: PropTypes.string,
  /** Extra content (a Tag, for example) */
  extraContent: PropTypes.element,
  /** Display name of current user */
  userDisplayName: PropTypes.string,
  /** Username of current user */
  username: PropTypes.string,
  /** If true, renders the admin button in Header as selected */
  isAdminView: PropTypes.bool,
  /** If true, will render the hamburger icon even if no sideNavProps are provided */
  hasSideNav: PropTypes.bool,
  /** URLs for various routes on Header buttons and submenus */
  routes: PropTypes.shape(SuiteHeaderRoutePropTypes),
  /** Applications to render in AppSwitcher (not used anymore, only kept here for backwards compatibility) */
  applications: PropTypes.arrayOf(PropTypes.shape(SuiteHeaderApplicationPropTypes)),
  /** Workspaces and applications to render in AppSwitcher */
  workspaces: PropTypes.arrayOf(PropTypes.shape(SuiteHeaderWorkspacePropTypes)),
  /** Applications that are not tied to workspaces */
  globalApplications: PropTypes.arrayOf(PropTypes.shape(SuiteHeaderApplicationPropTypes)),
  /** side navigation component */
  sideNavProps: PropTypes.shape(SideNavPropTypes),
  /** If surveyData is present, show an ActionableNotification */
  surveyData: PropTypes.shape(SuiteHeaderSurveyDataPropTypes),
  /** If idleTimeoutData is present, instantiate IdleLogoutConfirmationModal */
  idleTimeoutData: PropTypes.shape(IdleLogoutConfirmationModalIdleTimeoutPropTypes),
  /** Function called when idle timer is restarted */
  onStayLoggedIn: PropTypes.func,
  /** Function called when side nav button is toggled */
  onSideNavToggled: PropTypes.func,
  /** Function called before any route change. Returns a Promise<Boolean>. False means the redirect will not happen. This function should never throw an error. */
  onRouteChange: PropTypes.func,
  /** I18N strings */
  i18n: PropTypes.shape(SuiteHeaderI18NPropTypes),
  /** Array of custom header action items */
  customActionItems: PropTypes.arrayOf(PropTypes.shape(HeaderActionItemPropTypes)),
  /** Array of custom help menu links */
  customHelpLinks: PropTypes.arrayOf(PropTypes.shape(ChildContentPropTypes)),
  /** Array of custom profile menu links */
  customProfileLinks: PropTypes.arrayOf(PropTypes.shape(ChildContentPropTypes)),
  /** Array of custom applications */
  customApplications: PropTypes.arrayOf(PropTypes.shape(SuiteHeaderApplicationPropTypes)),
  /** Path to Walkme entry point */
  walkmePath: PropTypes.string,
  /** Walkme language code */
  walkmeLang: PropTypes.string,
  testId: PropTypes.string,
  /** Optional callback when user clicks on header name */
  handleHeaderNameClick: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
  /** a function that will be passed the actionItem object and returns a boolean to determine if that item should be shown */
  // eslint-disable-next-line react/forbid-foreign-prop-types
  isActionItemVisible: Header.propTypes.isActionItemVisible,
  /** Force menu button to hide regardless of side nav props */
  hideMenuButton: PropTypes.bool,
  /** Force side nav to close upon item click */
  closeSideNavOnNavigation: PropTypes.bool,
};

const SuiteHeader = ({
  className,
  suiteName,
  appName,
  extraContent,
  userDisplayName,
  username,
  hasSideNav,
  isAdminView,
  routes,
  applications, // (not used anymore, only kept here for backwards compatibility)
  workspaces,
  globalApplications,
  sideNavProps,
  surveyData,
  idleTimeoutData,
  onStayLoggedIn,
  onSideNavToggled,
  onRouteChange,
  i18n,
  customActionItems,
  customHelpLinks,
  customProfileLinks,
  customApplications,
  walkmePath,
  walkmeLang,
  testId,
  handleHeaderNameClick: handleHeaderNameClickProps,
  hideMenuButton,
  closeSideNavOnNavigation,
  ...otherHeaderProps
}) => {
  const mergedI18N = { ...defaultProps.i18n, ...i18n };
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showToast, setShowToast] = useState(surveyData !== null && surveyData !== undefined);
  const translate = useCallback(
    (string, substitutions) =>
      substitutions.reduce((acc, [key, val]) => acc.replace(key, val), string),
    []
  );
  const sideNavExpandedRef = useRef();
  // Make sure that the survey toast notification is displayed if surveyData is passed in future rerenders
  // not only at mount time
  useEffect(() => {
    if (surveyData !== null && surveyData !== undefined) {
      setShowToast(true);
    }
  }, [surveyData]);

  // Function to include close side nav functionality to items when they are clicked
  const setOnClickDecorators = useCallback((sNavProps, onClickSideNavExpand) => {
    const clickableItems = [];
    const recursivelyGetClickableItems = (propValue, parentProp) => {
      if (!parentProp) {
        // Get links and recentLinks
        Object.entries(propValue).forEach(([k, v]) => {
          if (k === 'links' || k === 'recentLinks') {
            recursivelyGetClickableItems(v, k);
          }
        });
      } else if (Array.isArray(propValue)) {
        // If the propValue is an array, check its items
        propValue.forEach((i, idx) => recursivelyGetClickableItems(i, `${parentProp}[${idx}]`));
      } else if ((propValue?.childContent ?? []).length > 0) {
        // If the propValue contains childContent, check each one of them
        recursivelyGetClickableItems(propValue.childContent, `${parentProp}.childContent`);
      } else if (propValue?.metaData) {
        // If propValue doesn't contain children and it has metaData, add it to the clickableItems array
        clickableItems.push(`${parentProp}.metaData`);
      }
    };
    recursivelyGetClickableItems(sNavProps);

    // Clone side nav props object
    const cloned = cloneDeep(sNavProps);
    clickableItems.forEach((i) => {
      const item = get(cloned, i);
      // Change onClick function to add onClickSideNavExpand call
      set(cloned, i, {
        ...item,
        onClick: (...args) => {
          if (item.onClick) {
            item.onClick(...args);
          }
          if (sideNavExpandedRef.current) {
            // Only allow toggling off the side nav expanded state
            onClickSideNavExpand(...args);
          }
        },
      });
    });
    return cloned;
  }, []);

  const isMultiWorkspace = workspaces?.length > 0;
  const currentWorkspace = workspaces?.find((wo) => wo.isCurrent);
  const appId =
    currentWorkspace?.applications?.find((a) => a.isCurrent)?.id ??
    applications?.find((a) => a.isCurrent)?.id;
  // Include the current workspace label only if we are not in an admin page and multi workspace is supported and more than one workspace is available
  const currentWorkspaceComponent =
    !isAdminView && isMultiWorkspace && workspaces?.length > 1 && currentWorkspace ? (
      <span data-testid={`${testId}--current-workspace`}>{currentWorkspace.name}</span>
    ) : null;
  const appNameComponent = appName ? (
    <span
      data-testid={`${testId}--appName`}
      className={classnames({
        [`${settings.iotPrefix}--suite-header-subtitle-appname`]: !!currentWorkspaceComponent,
      })}
    >
      {appName}
    </span>
  ) : null;
  const extraContentComponent = extraContent ? (
    <span className={`${settings.iotPrefix}--suite-header-subtitle`}>{extraContent}</span>
  ) : null;

  const navigatorRoute = currentWorkspace?.href || routes?.navigator || 'javascript:void(0)';
  const adminRoute = routes?.admin || 'javascript:void(0)';
  // Append originHref query parameter (and, optionally, originIsAdmin, originWorkspaceId and originAppId) to the logout route
  let logoutRoute = routes?.logout;
  try {
    const url = new URL(routes.logout);
    if (window.location.href) {
      url.searchParams.append(
        'originHref',
        [window.location.protocol, '//', window.location.host, window.location.pathname].join('')
      );
    }
    if (appId) {
      url.searchParams.append('originAppId', appId);
    }
    if (currentWorkspace?.id) {
      url.searchParams.append('originWorkspaceId', currentWorkspace.id);
    }
    if (isAdminView) {
      url.searchParams.append('originIsAdmin', isAdminView);
    }
    logoutRoute = url.href;
  } catch (e) {
    logoutRoute = routes?.logout;
  }

  // If there are custom help links, include an extra child content entry for the separator
  const mergedCustomHelpLinks =
    customHelpLinks.length > 0
      ? [
          ...customHelpLinks,
          {
            metaData: {
              className: `${settings.iotPrefix}--suite-header-help--separator`,
              element: 'div',
            },
            content: '',
          },
        ]
      : [];

  const handleOnClick = (routeType, href, isExternal) => async (e) => {
    e.preventDefault();
    const newWindow = isExternal ? true : shouldOpenInNewWindow(e);
    const result = await onRouteChange(routeType, href);
    if (result) {
      if (newWindow) {
        window.open(href, '_blank', 'noopener noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  const handleHeaderNameClick = useCallback(
    (evt) => {
      if (handleHeaderNameClickProps) {
        handleHeaderNameClickProps(evt, navigatorRoute);
      }
    },
    [handleHeaderNameClickProps, navigatorRoute]
  );

  return (
    <>
      {walkmePath ? <Walkme path={walkmePath} lang={walkmeLang} /> : null}
      {showToast && surveyData ? (
        <ActionableNotification
          data-testid={`${testId}-notification`}
          className={`${settings.iotPrefix}--suite-header-survey-toast`}
          kind="info"
          title={
            typeof mergedI18N.surveyTitle === 'function'
              ? mergedI18N.surveyTitle(appName || suiteName)
              : translate(mergedI18N.surveyTitle, [['{solutionName}', appName || suiteName]])
          }
          lowContrast
          caption=""
          onCloseButtonClick={() => setShowToast(false)}
        >
          <Link
            href={surveyData.surveyLink}
            rel="noopener noreferrer"
            onClick={handleOnClick(SUITE_HEADER_ROUTE_TYPES.SURVEY, surveyData.surveyLink, true)}
          >
            {mergedI18N.surveyText}
          </Link>
          <div className={`${settings.iotPrefix}--suite-header-survey-policy-link`}>
            <Link
              href={surveyData.privacyLink}
              rel="noopener noreferrer"
              onClick={handleOnClick(SUITE_HEADER_ROUTE_TYPES.SURVEY, surveyData.privacyLink, true)}
            >
              {mergedI18N.surveyPrivacyPolicy}
            </Link>
          </div>
        </ActionableNotification>
      ) : null}
      {idleTimeoutData && routes?.domain !== null && routes?.domain !== undefined ? (
        <IdleLogoutConfirmationModal
          isAdminView={isAdminView}
          appId={appId}
          workspaceId={currentWorkspace?.id}
          idleTimeoutData={idleTimeoutData}
          routes={routes}
          onRouteChange={onRouteChange}
          onStayLoggedIn={onStayLoggedIn}
          i18n={i18n}
        />
      ) : null}
      <SuiteHeaderLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleOnClick(SUITE_HEADER_ROUTE_TYPES.LOGOUT, logoutRoute)}
        i18n={{
          heading: mergedI18N.profileLogoutModalHeading,
          primaryButton: mergedI18N.profileLogoutModalPrimaryButton,
          secondaryButton: mergedI18N.profileLogoutModalSecondaryButton,
          body:
            typeof mergedI18N.profileLogoutModalBody === 'function'
              ? mergedI18N.profileLogoutModalBody(appName || suiteName, userDisplayName)
              : translate(mergedI18N.profileLogoutModalBody, [
                  ['{solutionName}', appName || suiteName],
                  ['{userName}', userDisplayName],
                ]),
        }}
        testId={`${testId}-logout-modal`}
      />
      {routes && (
        <>
          <span className={`${settings.iotPrefix}--suite-header-data`} data-type="workspaceId">
            {routes.workspaceId}
          </span>
          <span className={`${settings.iotPrefix}--suite-header-data`} data-type="domain">
            {routes.domain}
          </span>
        </>
      )}
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => {
          sideNavExpandedRef.current = isSideNavExpanded;
          return (
            <>
              <Header
                testId={testId}
                className={classnames(`${settings.iotPrefix}--suite-header`, className)}
                url={navigatorRoute}
                handleHeaderNameClick={handleHeaderNameClick}
                hasSideNav={hideMenuButton ? false : hasSideNav || sideNavProps !== null}
                onClickSideNavExpand={(evt) => {
                  onSideNavToggled(evt);
                  onClickSideNavExpand(evt);
                }}
                headerPanel={{
                  className: `${settings.iotPrefix}--suite-header-app-switcher${
                    workspaces ? '-multiworkspace' : ''
                  }`,
                  // eslint-disable-next-line react/prop-types
                  content: React.forwardRef(({ isExpanded }, ref) =>
                    workspaces ? (
                      <MultiWorkspaceSuiteHeaderAppSwitcher
                        ref={ref}
                        isAdminView={isAdminView}
                        workspaces={workspaces}
                        globalApplications={globalApplications}
                        customApplications={customApplications}
                        adminLink={routes?.admin}
                        noAccessLink={routes?.gettingStarted || 'javascript:void(0)'}
                        onRouteChange={onRouteChange}
                        i18n={{
                          workspace: mergedI18N.switcherWorkspace,
                          workspaces: mergedI18N.switcherWorkspaces,
                          workspaceAdmin: mergedI18N.switcherWorkspaceAdmin,
                          backToAppSwitcher: mergedI18N.switcherBackToAppSwitcher,
                          selectWorkspace: mergedI18N.switcherSelectWorkspace,
                          availableWorkspaces: mergedI18N.switcherAvailableWorkspaces,
                          suiteAdmin: mergedI18N.switcherSuiteAdmin,
                          global: mergedI18N.switcherGlobal,
                          myApplications: mergedI18N.switcherMyApplications,
                          allApplicationsLink: mergedI18N.switcherNavigatorLink,
                          requestAccess: mergedI18N.switcherRequestAccess,
                          learnMoreLink: mergedI18N.switcherLearnMoreLink,
                        }}
                        testId={`${testId}-app-switcher`}
                        isExpanded={isExpanded}
                      />
                    ) : applications ? (
                      <SuiteHeaderAppSwitcher
                        ref={ref}
                        applications={applications}
                        customApplications={customApplications}
                        allApplicationsLink={routes?.navigator}
                        noAccessLink={routes?.gettingStarted || 'javascript:void(0)'}
                        onRouteChange={onRouteChange}
                        i18n={{
                          myApplications: mergedI18N.switcherMyApplications,
                          allApplicationsLink: mergedI18N.switcherNavigatorLink,
                          requestAccess: mergedI18N.switcherRequestAccess,
                          learnMoreLink: mergedI18N.switcherLearnMoreLink,
                        }}
                        testId={`${testId}-app-switcher`}
                        isExpanded={isExpanded}
                      />
                    ) : (
                      <SuiteHeaderAppSwitcherLoading ref={ref} testId={`${testId}-app-switcher`} />
                    )
                  ),
                }}
                appName={suiteName}
                subtitle={
                  appNameComponent || currentWorkspaceComponent || extraContentComponent ? (
                    <div>
                      {currentWorkspaceComponent}
                      {appNameComponent}
                      {extraContentComponent}
                    </div>
                  ) : null
                }
                actionItems={[
                  ...customActionItems,
                  {
                    id: 'admin',
                    label: mergedI18N.administrationIcon,
                    className: [
                      'admin-icon',
                      !routes?.admin ? 'admin-icon__hidden' : null,
                      isAdminView ? 'admin-icon__selected' : null,
                    ]
                      .filter((i) => i)
                      .join(' '),
                    btnContent: (
                      <span id="suite-header-action-item-admin">
                        <Settings
                          size="20"
                          fill="white"
                          data-testid="admin-icon"
                          description={mergedI18N.settingsIcon}
                        />
                      </span>
                    ),
                    onClick: async (e) => {
                      e.preventDefault();
                      let href = adminRoute;
                      let routeType = SUITE_HEADER_ROUTE_TYPES.ADMIN;
                      if (isAdminView) {
                        href = navigatorRoute;
                        routeType = SUITE_HEADER_ROUTE_TYPES.NAVIGATOR;
                      }
                      handleOnClick(routeType, href)(e);
                    },
                    href: isAdminView ? navigatorRoute : adminRoute,
                  },
                  {
                    id: 'help',
                    label: mergedI18N.help,
                    onClick: () => {},
                    btnContent: (
                      <span id="suite-header-action-item-help">
                        <Help size="20" fill="white" description={mergedI18N.help} />
                      </span>
                    ),
                    childContent: routes
                      ? [
                          ...mergedCustomHelpLinks,
                          ...[
                            'whatsNew',
                            'gettingStarted',
                            'documentation',
                            'requestEnhancement',
                            'support',
                          ].map((item) => ({
                            metaData: {
                              element: 'a',
                              'data-testid': `suite-header-help--${item}`,
                              href: routes[item],
                              rel: 'noopener noreferrer',
                              title: mergedI18N[item],
                              onClick: handleOnClick(
                                SUITE_HEADER_ROUTE_TYPES.DOCUMENTATION,
                                routes[item],
                                true
                              ),
                            },
                            content: (
                              <span id={`suite-header-help-menu-${item}`}>{mergedI18N[item]}</span>
                            ),
                          })),
                          {
                            metaData: {
                              element: 'a',
                              'data-testid': 'suite-header-help--about',
                              href: routes.about,
                              rel: 'noopener noreferrer',
                              title: mergedI18N.about,
                              onClick: handleOnClick(SUITE_HEADER_ROUTE_TYPES.ABOUT, routes.about),
                            },
                            content: (
                              <span id="suite-header-help-menu-about">{mergedI18N.about}</span>
                            ),
                          },
                        ]
                      : [
                          {
                            metaData: {
                              element: 'div',
                            },
                            content: (
                              <div
                                className={`${settings.iotPrefix}--suite-header-help--loading`}
                                data-testid="suite-header-help--loading"
                              >
                                <SkeletonText paragraph lineCount={6} />
                              </div>
                            ),
                          },
                        ],
                  },
                  {
                    id: 'user',
                    label: 'user',
                    btnContent: (
                      <span id="suite-header-action-item-profile">
                        <UserAvatar
                          size="20"
                          data-testid="user-icon"
                          fill="white"
                          description={mergedI18N.userIcon}
                        />
                      </span>
                    ),
                    childContent: [
                      {
                        metaData: {
                          element: 'div',
                        },
                        content: (
                          <span id="suite-header-profile-menu-profile" style={{ width: '100%' }}>
                            <SuiteHeaderProfile
                              displayName={userDisplayName}
                              username={username}
                              profileLink={routes?.profile}
                              onProfileClick={handleOnClick(
                                SUITE_HEADER_ROUTE_TYPES.PROFILE,
                                routes?.profile
                              )}
                              i18n={{
                                profileTitle: mergedI18N.profileTitle,
                                profileButton: mergedI18N.profileManageButton,
                              }}
                              testId={`${testId}-profile`}
                            />
                          </span>
                        ),
                      },
                      ...customProfileLinks,
                      username
                        ? {
                            metaData: {
                              className: `${settings.iotPrefix}--suite-header--logout`,
                              element: 'a',
                              'data-testid': 'suite-header-profile--logout',
                              href: 'javascript:void(0)',
                              title: mergedI18N.logout,
                              onClick: () => setShowLogoutModal(true),
                            },
                            content: (
                              <span id="suite-header-profile-menu-logout">{mergedI18N.logout}</span>
                            ),
                          }
                        : {
                            metaData: {
                              element: 'div',
                            },
                            content: (
                              <div
                                className={`${settings.iotPrefix}--suite-header--logout--loading`}
                                data-testid="suite-header--logout--loading"
                              >
                                <ButtonSkeleton />
                              </div>
                            ),
                          },
                    ],
                  },
                ].filter((i) => i)}
                showCloseIconWhenPanelExpanded
                isSideNavExpanded={isSideNavExpanded}
                {...otherHeaderProps}
              />
              {sideNavProps ? (
                <SideNav
                  {...(closeSideNavOnNavigation
                    ? setOnClickDecorators(sideNavProps, onClickSideNavExpand)
                    : sideNavProps)}
                  isSideNavExpanded={isSideNavExpanded}
                  testId={`${testId}-side-nav`}
                />
              ) : null}
            </>
          );
        }}
      />
    </>
  );
};

SuiteHeader.defaultProps = defaultProps;
SuiteHeader.propTypes = propTypes;

SuiteHeader.ROUTE_TYPES = SUITE_HEADER_ROUTE_TYPES;

export default SuiteHeader;
