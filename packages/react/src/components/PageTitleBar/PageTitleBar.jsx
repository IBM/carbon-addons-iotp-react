import PropTypes from 'prop-types';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import classnames from 'classnames';
import { Information, Edit } from '@carbon/react/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  SkeletonText,
  Tabs,
  unstable_FeatureFlags as FeatureFlags,
} from '@carbon/react';
import { throttle } from 'lodash-es';

import { ToggleTip } from '../ToggleTip';
import { settings } from '../../constants/Settings';
import deprecate from '../../internal/deprecate';
import Button from '../Button';

const { iotPrefix } = settings;
const HEADER_MODES = {
  STATIC: 'STATIC',
  STICKY: 'STICKY',
  DYNAMIC: 'DYNAMIC',
  CONDENSED: 'CONDENSED',
};

const BREADCRUMB_CONDENSED_HEIGHT = 40;

const PageTitleBarPropTypes = {
  /** Title of the page  */
  title: PropTypes.node.isRequired,
  /** Details about what the page shows */
  description: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  /** How the header should react to scrolling */
  headerMode: PropTypes.oneOf(Object.values(HEADER_MODES)),
  /** offset for the 'top' attribute on the sticky header. Number will be converted to px */
  stickyHeaderOffset: PropTypes.number,

  /** Optional node to render in the right side of the PageTitleBar
   *  NOTE: Deprecated in favor of extraContent
   */
  rightContent: deprecate(
    PropTypes.node,
    '\nThe prop `rightContent` for PageTitleBar has been deprecated in favor of `extraContent`'
  ),
  /** Optional node to render to the side of the PageTitleBar */
  extraContent: PropTypes.node,
  /** Optional node to render actions/text above the main actions area */
  upperActions: PropTypes.node,
  /** Breadcrumbs to show */
  breadcrumb: PropTypes.arrayOf(PropTypes.node),
  /** Should page description be collapsed into tooltip. Should be `true` when using in conjunction with tabs. */
  collapsed: PropTypes.bool,
  /** Is the title editable, will display edit icon with callback */
  editable: PropTypes.bool,
  /** Is the page actively loading */
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func,
  i18n: PropTypes.shape({
    editIconDescription: PropTypes.string,
    tooltipIconDescription: PropTypes.string,
  }),
  className: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),

  /* Force the content element to be outside the page title component element
     Normally this is automatically detected, i.e. if the header is dynamic and if tabs are present
     the content must render outside in order for sticky positioning to work correctly on the tabs
  */
  forceContentOutside: PropTypes.bool,

  /** Tabs should be a Tabs component */
  tabs: deprecate(
    PropTypes.oneOfType([
      PropTypes.shape({
        type: PropTypes.oneOf([Tabs]),
      }),
    ]),
    '\nThe prop `tabs` for PageTitleBar has been deprecated in favor of `content`'
  ),

  /** Content rendered beneath title bar */
  content: PropTypes.node,
  /** Callback to allow custom rendering of the title, it is called back with the title property */
  renderTitleFunction: PropTypes.func,

  testId: PropTypes.string,
  /**
   * In dynamic or condensed modes, when true keep both the breadcrumbs and tabs on the screen
   * If false, only keep tabs after scrolling passed breadcrumbs
   */
  stackBreadcrumbsWithTabs: PropTypes.bool,
};

const defaultProps = {
  description: null,
  className: null,
  rightContent: undefined,
  extraContent: undefined,
  upperActions: undefined,
  breadcrumb: null,
  collapsed: undefined,
  editable: false,
  forceContentOutside: false,
  onEdit: null,
  i18n: {
    editIconDescription: 'Edit page title',
    tooltipIconDescription: 'More information',
  },
  style: null,
  isLoading: false,
  tabs: undefined,
  content: undefined,
  renderTitleFunction: undefined,
  headerMode: HEADER_MODES.STATIC,
  stackBreadcrumbsWithTabs: false,
  stickyHeaderOffset: 48, // default to 3rem to stick to the bottom of the suite header
  testId: 'page-title-bar',
};

const PageTitleBar = ({
  title,
  renderTitleFunction,
  description,
  className,
  rightContent,
  extraContent,
  upperActions,
  breadcrumb,
  collapsed,
  forceContentOutside,
  headerMode,
  stickyHeaderOffset: stickyHeaderOffsetProp,
  editable,
  isLoading,
  i18n: { editIconDescription, tooltipIconDescription },
  onEdit,
  tabs,
  stackBreadcrumbsWithTabs: stackBreadcrumbsWithTabsProp,
  style,
  content,
  testId,
}) => {
  const titleBarContent = content || tabs;

  const [condensed, setCondensed] = useState(headerMode === HEADER_MODES.CONDENSED);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [contentActive, setContentActive] = useState(false);
  const [stackBreadcrumbsWithTabs, setStackBreadcrumbsWithTabs] = useState(
    stackBreadcrumbsWithTabsProp
  );

  const breadcrumbRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const previousScrollY = useRef(null);

  const stickyHeaderOffset = `${stickyHeaderOffsetProp}px`; // convert to px for styling

  /** We need the tabs to render outside the header so the tab stickiness will push away
     the header stickiness naturally with the scroll.

     We also want sticky mode to render outside so we can sticky the entire header element
  */
  const hasTabs =
    titleBarContent?.type === Tabs ||
    [].concat(titleBarContent?.props?.children ?? []).filter((child) => child?.type === Tabs)
      .length;

  const renderContentOutside =
    (hasTabs && headerMode === HEADER_MODES.DYNAMIC) ||
    headerMode === HEADER_MODES.STICKY ||
    forceContentOutside;

  const checkForActiveContent = useCallback(() => {
    // Detect when content area rises above sticky header offset, to set background
    // on tabs, which replaces existing sticky header. We add 40 to it, to account for
    // the height of the breadcrumbs (2.5rem) when stacking them together.
    const activeThreshold =
      stackBreadcrumbsWithTabs && hasTabs
        ? stickyHeaderOffsetProp + BREADCRUMB_CONDENSED_HEIGHT
        : stickyHeaderOffsetProp;

    setContentActive(
      contentRef.current && contentRef.current.getBoundingClientRect().top <= activeThreshold
    );
  }, [hasTabs, stackBreadcrumbsWithTabs, stickyHeaderOffsetProp]);

  const checkToShowBreadcrumbs = useCallback(() => {
    const previousY = previousScrollY.current;
    const currentY = window.scrollY;
    if (!stackBreadcrumbsWithTabsProp && currentY < previousY - BREADCRUMB_CONDENSED_HEIGHT / 2) {
      setStackBreadcrumbsWithTabs(true);
    } else if (
      !stackBreadcrumbsWithTabsProp &&
      currentY > previousY + BREADCRUMB_CONDENSED_HEIGHT / 2
    ) {
      setStackBreadcrumbsWithTabs(false);
    }
    previousScrollY.current = window.scrollY;
  }, [stackBreadcrumbsWithTabsProp]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      let isCondensed;
      let percentComplete;

      // Detect when sticky overlap begins to start fading out/fading in
      // content based on scroll position
      /* istanbul ignore else */
      if (breadcrumbRef.current && titleRef.current) {
        const breadcrumbDims = breadcrumbRef.current.getBoundingClientRect();
        const titleDims = titleRef.current.getBoundingClientRect();

        if (titleDims.top < breadcrumbDims.bottom) {
          isCondensed = true;
          const distanceLeftToGo = breadcrumbDims.top - titleDims.top;
          const total = breadcrumbDims.height;
          percentComplete = (total - Math.abs(distanceLeftToGo)) / total;

          if (percentComplete < 0.06) {
            percentComplete = 0;
          }

          if (titleDims.top <= breadcrumbDims.top) {
            percentComplete = 1;
          }
        } else if (window.scrollY < breadcrumbDims.bottom) {
          isCondensed = false;
          percentComplete = 0;
        } else {
          isCondensed = condensed;
          percentComplete = transitionProgress;
        }
        setCondensed(isCondensed);
        setTransitionProgress(percentComplete);
      }

      checkForActiveContent();
      checkToShowBreadcrumbs();
    }, 50);

    if (headerMode === HEADER_MODES.DYNAMIC) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    checkForActiveContent,
    condensed,
    checkToShowBreadcrumbs,
    headerMode,
    stackBreadcrumbsWithTabs,
    stickyHeaderOffsetProp,
    transitionProgress,
  ]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      checkForActiveContent();
    }, 50);

    if (stackBreadcrumbsWithTabs && headerMode === HEADER_MODES.CONDENSED) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkForActiveContent, headerMode, stackBreadcrumbsWithTabs]);

  useEffect(() => {
    setStackBreadcrumbsWithTabs(stackBreadcrumbsWithTabsProp);
  }, [stackBreadcrumbsWithTabsProp]);

  useEffect(() => {
    setContentActive(false);
  }, [headerMode]);

  const titleActions = useMemo(
    () => (
      <>
        {description && (collapsed || condensed) ? (
          <FeatureFlags enableV12DynamicFloatingStyles>
            <ToggleTip
              tabIndex={0}
              iconDescription={tooltipIconDescription}
              data-testid={`${testId}-tooltip`}
              showIcon
              content={typeof description === 'string' ? <p>{description}</p> : <>{description}</>}
            />
          </FeatureFlags>
        ) : null}
        {editable ? (
          <Button
            className="page-title-bar-title--edit"
            kind="ghost"
            size="md"
            hasIconOnly
            renderIcon={Edit}
            title={editIconDescription}
            iconDescription={editIconDescription}
            tooltipAlignment="center"
            tooltipPosition="bottom"
            onClick={onEdit}
            // TODO: pass testId in v3 to override defaults
            // testId={`${testId}-edit-button`}
          />
        ) : null}
      </>
    ),
    [
      description,
      collapsed,
      condensed,
      tooltipIconDescription,
      testId,
      editable,
      editIconDescription,
      onEdit,
    ]
  );

  const headerOffsetCssVar =
    stackBreadcrumbsWithTabs &&
    (headerMode === HEADER_MODES.DYNAMIC || headerMode === HEADER_MODES.CONDENSED)
      ? `${stickyHeaderOffsetProp + BREADCRUMB_CONDENSED_HEIGHT}px`
      : stickyHeaderOffset;
  return (
    <div
      data-testid={testId}
      className={classnames(className, 'page-title-bar', {
        'page-title-bar--sticky': headerMode === HEADER_MODES.STICKY,
        'page-title-bar--condensed-static': headerMode === HEADER_MODES.CONDENSED,
        'page-title-bar--dynamic--before': headerMode === HEADER_MODES.DYNAMIC && !condensed,
        'page-title-bar--dynamic--during':
          headerMode === HEADER_MODES.DYNAMIC &&
          condensed &&
          transitionProgress < 1 &&
          transitionProgress > 0,
        'page-title-bar--dynamic--after':
          headerMode === HEADER_MODES.DYNAMIC && condensed && transitionProgress === 1,
        'page-title-bar--dynamic': headerMode === HEADER_MODES.DYNAMIC,
        'page-title-bar--with-actions': upperActions && headerMode === HEADER_MODES.DYNAMIC,
        [`${iotPrefix}--page-title-bar--stack-tabs`]: stackBreadcrumbsWithTabs,
        [`${iotPrefix}--page-title-bar--stack-tabs-override-show`]:
          headerMode === HEADER_MODES.DYNAMIC &&
          stackBreadcrumbsWithTabs &&
          !stackBreadcrumbsWithTabsProp,
        [`${iotPrefix}--page-title-bar--stack-tabs-override-hide`]:
          headerMode === HEADER_MODES.DYNAMIC &&
          !stackBreadcrumbsWithTabs &&
          !stackBreadcrumbsWithTabsProp,
      })}
      style={{
        '--header-offset': headerOffsetCssVar,
        '--negative-header-offset': `-${headerOffsetCssVar}`,
        '--scroll-transition-progress':
          headerMode !== HEADER_MODES.DYNAMIC ? 1 : transitionProgress,
        ...style,
      }}
    >
      {isLoading ? (
        <SkeletonText className="page-title-bar-loading" heading width="30%" />
      ) : (
        <>
          <div className="page-title-bar-header">
            <div className="page-title-bar-breadcrumb-bg" />
            {breadcrumb ||
            upperActions ||
            headerMode === HEADER_MODES.DYNAMIC ||
            headerMode === HEADER_MODES.CONDENSED ? (
              <div className="page-title-bar-breadcrumb breadcrumb--container" ref={breadcrumbRef}>
                <Breadcrumb>
                  {breadcrumb
                    ? breadcrumb.map((crumb, index) => (
                        <BreadcrumbItem key={`breadcrumb-${index}`}>{crumb}</BreadcrumbItem>
                      ))
                    : null}
                  {headerMode === HEADER_MODES.DYNAMIC || headerMode === HEADER_MODES.CONDENSED ? (
                    <BreadcrumbItem
                      key="breadcrumb-current"
                      className="page-title-bar-breadcrumb-current"
                      isCurrentPage
                      title={title}
                    >
                      <>
                        {title}
                        {description ? (
                          <FeatureFlags enableV12DynamicFloatingStyles>
                            <ToggleTip
                              tabIndex={0}
                              showIcon
                              iconDescription={tooltipIconDescription}
                              data-testid={`${testId}-tooltip`}
                              content={
                                typeof description === 'string' ? (
                                  <p>{description}</p>
                                ) : (
                                  <>{description}</>
                                )
                              }
                            >
                              <Information />
                            </ToggleTip>
                          </FeatureFlags>
                        ) : null}
                      </>
                    </BreadcrumbItem>
                  ) : null}
                </Breadcrumb>
              </div>
            ) : null}
            {upperActions ? (
              <div className="page-title-bar-actions-upper">{upperActions}</div>
            ) : null}
            <div className="page-title-bar-title" ref={titleRef}>
              <div className="page-title-bar-title--text">
                {!renderTitleFunction ? <h2 title={title}>{title}</h2> : renderTitleFunction(title)}
                {titleActions}
              </div>
            </div>
            {description && !collapsed && !condensed ? (
              <p className="page-title-bar-description">{description}</p>
            ) : null}
            <div className="page-title-bar-header-right">{extraContent || rightContent}</div>
            {titleBarContent && !renderContentOutside ? (
              <div
                className={classnames('page-title-bar-content', {
                  'page-title-bar-content--active': contentActive,
                })}
                ref={contentRef}
              >
                {titleBarContent}
              </div>
            ) : null}
          </div>

          {titleBarContent && renderContentOutside ? (
            <div
              className={classnames('page-title-bar-content', {
                'page-title-bar-content--active': contentActive,
              })}
              ref={contentRef}
            >
              {titleBarContent}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

PageTitleBar.propTypes = PageTitleBarPropTypes;
PageTitleBar.defaultProps = defaultProps;

export default PageTitleBar;
