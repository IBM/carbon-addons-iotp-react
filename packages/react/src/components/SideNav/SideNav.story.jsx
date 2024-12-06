import React, { useState, createElement, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import {
  Switcher,
  Chip,
  Dashboard,
  Group,
  ParentChild,
  Home,
  RecentlyViewed,
  Apps,
} from '@carbon/react/icons';
import { HeaderContainer } from '@carbon/react';
import { boolean } from '@storybook/addon-knobs';
import { partition } from 'lodash-es';

import Header from '../Header';
import PageTitleBar from '../PageTitleBar/PageTitleBar';
import { settings } from '../../constants/Settings';
import FullWidthWrapper from '../../internal/FullWidthWrapper';
// import './SideNav.story.scss'; carbon 11
import StatefulTable from '../Table/StatefulTable';
import { getInitialState } from '../Table/Table.story.helpers';

import SideNav from './SideNav';

const { prefix, iotPrefix } = settings;
const initialTableState = getInitialState();

React.Fragment = ({ children }) => children;

const RouterComponent = ({ children, ...rest }) => <div {...rest}>{children}</div>;

const mostRecentLinks = [
  {
    icon: RecentlyViewed,
    isEnabled: true,
    metaData: {
      onClick: action('menu click'),
      tabIndex: 0,
      label: 'My recent links',
      element: RouterComponent,
    },
    linkContent: 'My recent links',
    childContent: [
      {
        metaData: {
          label: 'App 1',
          title: 'App 1',
          onClick: action('inner menu click'),
          element: 'button',
        },
        content: 'App 1',
      },
      {
        metaData: {
          label: 'App 2',
          title: 'App 2',
          onClick: action('inner menu click'),
          element: 'button',
        },
        content: 'App 2',
      },
    ],
  },
];

const links = (isActive = false) => [
  {
    icon: Switcher,
    isEnabled: true,
    metaData: {
      onClick: action('menu click'),
      tabIndex: 0,
      label: 'Boards',
      element: RouterComponent,
    },
    linkContent: 'Boards',
    childContent: [
      {
        metaData: {
          label: 'Yet another link',
          title: 'Yet another link',
          onClick: action('inner menu click'),
          element: 'button',
        },
        content: 'Yet another link',
      },
    ],
  },
  {
    isEnabled: true,
    icon: Chip,
    metaData: {
      label: 'Devices',
      href: 'https://google.com',
      element: 'a',
      target: '_blank',
    },
    linkContent: 'Devices',
  },
  {
    isEnabled: true,
    icon: Dashboard,
    metaData: {
      label: 'Dashboards',
      href: 'https://google.com',
      element: 'a',
      target: '_blank',
    },
    linkContent: 'Dashboards',
    childContent: [
      {
        metaData: {
          label: 'Link 1',
          title: 'Link 1',
          onClick: action('inner menu click'),
          element: 'button',
        },
        content: 'Link 1',
      },
      {
        metaData: {
          label: 'Link 2',
          title: 'Link 2',
          href: '/?path=/story/watson-iot-sidenav--sidenav-component',
          onClick: action('inner menu click'),
        },
        content: 'Link 2',
      },
    ],
  },
  {
    isEnabled: true,
    icon: Group,
    metaData: {
      label: 'Members',
      element: 'button',
    },
    linkContent: 'Members',
    childContent: [
      {
        metaData: {
          label: 'Yet another link',
          title: 'Yet another link',
          onClick: action('inner menu click'),
          element: 'button',
        },
        content: 'Link 3',
        isActive,
      },
    ],
  },
];

const HeaderProps = {
  user: 'JohnDoe@ibm.com',
  tenant: 'TenantId: Acme',
  className: 'custom-class-name',
  appName: 'Watson IoT Platform ',
  actionItems: [
    {
      label: 'user',
      onClick: action('click'),
      btnContent: (
        <Group
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
    },
  ],
};

export default {
  title: '1 - Watson IoT/UI shell/SideNav',

  parameters: {
    component: SideNav,
    docs: {
      inlineStories: false,
    },
  },
};

export const SideNavComponent = () => {
  const showDeepNesting = boolean('show deep nesting example', false);
  const enableSearch = boolean('Enable searching (hasSearch)', true);
  const demoPinnedLink = boolean('Demo pinned link during search', true);
  const demoMostRecentLinks = boolean('Demo most recent links', true);
  const pinnedLinks = demoPinnedLink
    ? [
        {
          icon: Home,
          isEnabled: true,
          isPinned: true,
          metaData: {
            onClick: action('menu click'),
            tabIndex: 0,
            label: 'Home',
            element: RouterComponent,
          },
          linkContent: 'Home',
          isActive: true,
        },
      ]
    : [];

  const shallowLinks = [...links(!demoPinnedLink), ...pinnedLinks];

  const deepLinks = [
    ...links(),
    ...pinnedLinks,
    {
      isEnabled: true,
      icon: ParentChild,
      metaData: {
        label: 'Nested Levels',
        element: 'button',
      },
      linkContent: 'Nested Levels',
      childContent: [
        {
          metaData: {
            label: 'Co-Parent Link',
            title: 'Co-Parent Link',
            element: 'a',
            href: 'https://www.ibm.com',
          },
          content: 'Co-Parent Link',
        },
        {
          metaData: {
            label: 'Parent',
            title: 'Parent',
            element: 'button',
          },
          content: 'Parent',
          linkContent: 'Parent',
          childContent: [
            {
              metaData: {
                label: 'Sibling 1 Link',
                title: 'Sibling 1 Link',
                element: 'a',
                href: 'https://www.ibm.com',
              },
              content: 'Sibling 1 Link',
            },
            {
              isEnabled: true,
              metaData: {
                label: 'Child',
                element: 'button',
              },
              linkContent: 'Child',
              childContent: [
                {
                  metaData: {
                    label: 'Grandchild Button',
                    title: 'Grandchild Button',
                    onClick: action('grandchild-button'),
                    element: 'button',
                  },
                  content: 'Grandchild Button',
                  isActive: !demoPinnedLink,
                },
                {
                  metaData: {
                    label: 'Grandchild Link with long label',
                    title: 'Grandchild Link with long label',
                    href: 'https://www.ibm.com',
                    element: 'a',
                  },
                  content: 'Grandchild Link with long label',
                },
              ],
            },
            {
              metaData: {
                label: 'Sibling 2 Button',
                title: 'Sibling 2 Button',
                element: 'button',
                onClick: action('sibling-2-click'),
              },
              content: 'Sibling 2 Button',
            },
          ],
        },
        {
          metaData: {
            label: 'Co-Parent Button',
            title: 'Co-Parent Button',
            element: 'button',
            onClick: action('co-parent-click'),
          },
          content: 'Co-Parent Button',
        },
      ],
    },
  ];

  return (
    <FullWidthWrapper withPadding={false}>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header
              {...HeaderProps}
              isSideNavExpanded={isSideNavExpanded}
              onClickSideNavExpand={onClickSideNavExpand}
            />
            <SideNav
              links={showDeepNesting ? deepLinks : shallowLinks}
              isSideNavExpanded={isSideNavExpanded}
              hasSearch={enableSearch}
              recentLinks={demoMostRecentLinks ? mostRecentLinks : []}
            />
            <div className={`${iotPrefix}--main-content`}>
              <PageTitleBar title="Title" description="Description" />

              <div style={{ padding: '2rem' }}>
                <StatefulTable {...initialTableState} />
              </div>
            </div>
          </>
        )}
      />
    </FullWidthWrapper>
  );
};

SideNavComponent.storyName = 'SideNav component';

SideNavComponent.parameters = {
  info: {
    text: `
  When implementing the Header and SideNav components you must utilized the HeaderContainer component

  <br/>

  ~~~js
  <HeaderContainer
  render={({ isSideNavExpanded, onClickSideNavExpand }) => (
    <>
      <Header
        {...HeaderProps}
        isSideNavExpanded={isSideNavExpanded}
        onClickSideNavExpand={onClickSideNavExpand}
      />
      <SideNav
        links={links}
        isSideNavExpanded={isSideNavExpanded}
      />
    </>
  )}
/>

  ~~~

  <br/>

  If you want to style your main content to "push over" instead of being overlayed by the sidenav you can use the ".${iotPrefix}--side-nav--expanded" class. It could look something like this.

  <br/>

  ~~~scss
  .${iotPrefix}--main-content {
    width: calc(100% - 3rem);
    transform: translateX(3rem);
    transition: all .2s ease-in;
  }

  .${iotPrefix}--side-nav--expanded + .${iotPrefix}--main-content {
    width: calc(100% - 16rem);
    transform: translateX(16rem);
  }

  html[dir='rtl'] {
    .${iotPrefix}--main-content,
    .${iotPrefix}--side-nav--expanded + .${iotPrefix}--main-content {
      transform: translateX(0);
    }

  }

  ~~~

  `,
  },
};

export const SideNavComponentWithState = () => {
  const demoPinnedLink = boolean('Demo pinned link', true);
  const demoMostRecentLinks = boolean('Demo most recent links', true);
  const pinnedLinks = demoPinnedLink
    ? [
        {
          icon: Home,
          isEnabled: true,
          isPinned: true,
          metaData: {
            onClick: action('menu click'),
            tabIndex: 0,
            label: 'Home',
          },
          linkContent: 'Home',
          isActive: false,
        },
      ]
    : [];
  const [linksState, setLinksState] = useState([]);
  const [recentLinksState, setRecentLinksState] = useState([]);

  const onSideNavMenuItemClick = (linkLabel) => {
    let activeLink;
    setLinksState((currentLinks) =>
      currentLinks.map((group) => {
        if (group.childContent) {
          return {
            ...group,
            childContent: group.childContent.map((child) => {
              if (linkLabel === child.metaData.label) {
                activeLink = {
                  ...child,
                  isActive: false,
                };
              }
              return {
                ...child,
                isActive: linkLabel === child.metaData.label,
              };
            }),
          };
        }

        return group;
      })
    );

    setRecentLinksState((currentLinks) => {
      return currentLinks.map((group) => {
        const recentLinks =
          activeLink &&
          group.childContent.filter((child) => child.metaData.label === linkLabel).length === 0
            ? [activeLink, ...group.childContent]
            : group.childContent;

        const [firstChild, restChildren] = partition(
          recentLinks,
          (child) => child.content === linkLabel
        );

        if (group.childContent) {
          return {
            ...group,
            isActive: false,
            childContent: [...firstChild, ...restChildren],
          };
        }
        return group;
      });
    });
  };

  useEffect(() => {
    setLinksState([
      ...pinnedLinks,
      {
        isEnabled: true,
        icon: Dashboard,
        metaData: {
          label: 'Dashboards',
          element: 'button',
        },
        linkContent: 'Dashboards',
        childContent: [
          {
            metaData: {
              label: 'Link 1',
              title: 'Link 1',
              onClick: () => onSideNavMenuItemClick('Link 1'),
              element: 'button',
            },
            content: 'Link 1',
          },
          {
            metaData: {
              label: 'Link 2',
              title: 'Link 2',
              onClick: () => onSideNavMenuItemClick('Link 2'),
            },
            content: 'Link 2',
          },
        ],
      },
      {
        isEnabled: true,
        icon: Group,
        metaData: {
          label: 'Members',
          element: 'button',
        },
        linkContent: 'Members',
        childContent: [
          {
            metaData: {
              label: 'Link 3',
              title: 'Link 3',
              onClick: () => onSideNavMenuItemClick('Link 3'),
              element: 'button',
            },
            content: 'Link 3',
            isActive: true,
          },
          {
            metaData: {
              label: 'Link 4',
              title: 'Link 4',
              onClick: () => onSideNavMenuItemClick('Link 4'),
              element: 'button',
            },
            content: 'Link 4',
            isActive: false,
          },
        ],
      },
      demoMostRecentLinks
        ? {
            icon: Apps,
            isEnabled: true,
            metaData: {
              onClick: action('menu click'),
              tabIndex: 0,
              label: 'Apps',
              element: RouterComponent,
            },
            linkContent: 'Apps',
            childContent: [
              {
                metaData: {
                  label: 'App 1',
                  title: 'App 1',
                  onClick: () => onSideNavMenuItemClick('App 1'),
                  element: 'button',
                },
                content: 'App 1',
              },
              {
                metaData: {
                  label: 'App 2',
                  title: 'App 2',
                  onClick: () => onSideNavMenuItemClick('App 2'),
                  element: 'button',
                },
                content: 'App 2',
              },
              {
                metaData: {
                  label: 'App 3',
                  title: 'App 3',
                  onClick: () => onSideNavMenuItemClick('App 3'),
                  element: 'button',
                },
                content: 'App 3',
              },
            ],
          }
        : {},
    ]);

    setRecentLinksState([
      {
        icon: RecentlyViewed,
        isEnabled: true,
        metaData: {
          onClick: action('menu click'),
          tabIndex: 0,
          label: 'My recent links',
          element: RouterComponent,
        },
        linkContent: 'My recent links',
        childContent: [
          {
            metaData: {
              label: 'App 1',
              title: 'App 1',
              onClick: () => onSideNavMenuItemClick('App 1'),
              element: 'button',
            },
            content: 'App 1',
          },
          {
            metaData: {
              label: 'App 2',
              title: 'App 2',
              onClick: () => onSideNavMenuItemClick('App 2'),
              element: 'button',
            },
            content: 'App 2',
          },
          {
            metaData: {
              label: 'App 3',
              title: 'App 3',
              onClick: () => onSideNavMenuItemClick('App 3'),
              element: 'button',
            },
            content: 'App 3',
          },
        ],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullWidthWrapper withPadding={false}>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header
              {...HeaderProps}
              isSideNavExpanded={isSideNavExpanded}
              onClickSideNavExpand={onClickSideNavExpand}
            />
            <SideNav
              hasSearch={demoPinnedLink}
              links={linksState}
              isSideNavExpanded={isSideNavExpanded}
              recentLinks={demoMostRecentLinks ? recentLinksState : []}
            />
            <div className={`${iotPrefix}--main-content`}>
              <PageTitleBar title="Title" description="Description" />
            </div>
          </>
        )}
      />
    </FullWidthWrapper>
  );
};

SideNavComponentWithState.decorators = [createElement];
SideNavComponentWithState.storyName = 'SideNav component with state';
