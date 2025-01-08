import React from 'react';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { Bullhorn, Checkbox, Notification, Help, UserAvatar } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import { Tag } from '../Tag';

import Header from './Header';

const { prefix, iotPrefix } = settings;

React.Fragment = ({ children }) => children;

const HeaderProps = {
  user: 'JohnDoe@ibm.com',
  tenant: 'TenantId: Acme',
  url: 'http://localhost:8989',
  className: 'custom-class-name',
  appName: 'Application Name',
  skipto: 'skip',
  i18n: {
    openMenu: 'Open the menu',
  },
  actionItems: [
    {
      label: 'alerts',
      onClick: action('click fired'),
      btnContent: <Notification fill="white" size={16} description="Icon" />,
    },
    {
      label: 'help',
      hasHeaderPanel: true,
      btnContent: (
        <Help
          fill="white"
          description="Icon"
          size={16}
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      childContent: [
        {
          metaData: {
            href: 'http://google.com',
            title: 'this is a title',
            target: '_blank',
            rel: 'noopener noreferrer',
            element: 'a',
          },
          content: 'this is my message to you',
        },
        {
          metaData: {
            onClick: action('do another action'),
            className: 'this',
            element: 'button',
          },
          content: (
            <span>
              JohnDoe@ibm.com
              <UserAvatar fill="white" size={16} description="Icon" />
            </span>
          ),
        },
      ],
    },
    {
      label: 'user',
      btnContent: <UserAvatar fill="white" size={16} description="Icon" />,
      childContent: [
        {
          metaData: {
            href: 'http://google.com',
            title: 'this is a title',
            target: '_blank',
            rel: 'noopener noreferrer',
            element: 'a',
          },
          content: 'this is my message to you',
        },
        {
          metaData: {
            onClick: action('do another action'),
            className: 'this',
            element: 'button',
          },
          content: (
            <span>
              JohnDoe@ibm.com
              <UserAvatar fill="white" size={16} description="Icon" />
            </span>
          ),
        },
      ],
    },
  ],
};

const HeaderMenuProps = {
  user: 'JohnDoe@ibm.com',
  tenant: 'TenantId: Acme',
  url: 'http://localhost:8989',
  className: 'custom-class-name',
  appName: 'Application Name',
  skipto: 'skip',
  actionItems: [
    {
      label: 'user',
      btnContent: <UserAvatar fill="white" size={16} description="Icon" />,
      childContent: [
        {
          metaData: {
            href: 'http://google.com',
            title: 'this is a title',
            target: '_blank',
            rel: 'noopener noreferrer',
            element: 'a',
          },
          content: 'this is my message to you',
        },
        {
          metaData: {
            onClick: action('do another action'),
            className: 'this',
            element: 'button',
          },
          content: (
            <span>
              JohnDoe@ibm.com
              <UserAvatar fill="white" size={16} description="Icon" />
            </span>
          ),
        },
      ],
    },
  ],
};

const headerPanel = {
  className: 'header-panel',

  content: React.forwardRef((props, ref) => (
    <button type="button" ref={ref}>
      Header panel content
    </button>
  )),
};

export default {
  title: '1 - Watson IoT/UI shell/Header',

  parameters: {
    component: Header,
    docs: {
      inlineStories: false,
    },
  },
};

export const HeaderActionButtonsWithDropdowns = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <Header
      {...HeaderProps}
      className={`${iotPrefix}--header--story-test-class`}
      headerPanel={headerPanel}
      appSwitcherLabel={text('AppSwitcher label', 'AppSwitcher')}
    />
    <div id="skip" />
  </div>
);

HeaderActionButtonsWithDropdowns.storyName = 'Header action buttons with dropdowns';

export const HeaderSubmenu = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <Header {...HeaderMenuProps} className={`${iotPrefix}--header--story-test-class`} />
  </div>
);

HeaderSubmenu.storyName = 'header submenu';

export const HeaderNoSubmenu = () => (
  <Header
    {...HeaderProps}
    className={`${iotPrefix}--header--story-test-class`}
    actionItems={[
      {
        label: 'user',
        onClick: action('click'),
        btnContent: <UserAvatar fill="white" size={16} description="Icon" />,
      },
    ]}
  />
);

HeaderNoSubmenu.storyName = 'Header no submenu';

export const HeaderSubtitle = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <Header {...HeaderMenuProps} subtitle="Monitor" />
  </div>
);

HeaderSubtitle.storyName = 'header subtitle';

export const SmallBreakpoint = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <style>{`.isReallyHidden {
      display: none !important;
    }`}</style>
    <Header
      {...HeaderProps}
      actionItems={[
        {
          label: 'A Hidden Icon',
          onClick: action('click fired'),
          btnContent: <Bullhorn fill="white" description="A Hidden Icon" />,
        },
        {
          label: 'HiddenByClass',
          onClick: action('click fired'),
          btnContent: <Bullhorn fill="white" description="A Hidden Icon" />,
          className: 'isReallyHidden',
        },
        {
          label: 'Announcements',
          onClick: action('click fired'),
          btnContent: <Bullhorn fill="white" description="Announcements" />,
        },
        {
          label: 'Custom icon 1',
          onClick: action('click fired'),
          btnContent: <Checkbox fill="white" description="icon" />,
        },
        {
          label: 'Custom icon 2',
          onClick: action('click fired'),
          btnContent: <Checkbox fill="white" description="icon" />,
        },
        {
          label: 'Custom icon 3',
          onClick: action('click fired'),
          btnContent: <Checkbox fill="white" description="icon" />,
        },
        {
          label: 'Header action with href',
          onClick: action('click fired'),
          btnContent: <Checkbox fill="white" description="icon" />,
          href: 'https://www.ibm.com',
        },

        ...HeaderProps.actionItems,
      ]}
      appName={text('appName', 'Maximo Application Suite')}
      shortAppName={text('shortAppName', 'Maximo')}
      subtitle={text('subtitle', 'Manage')}
      isActionItemVisible={(item) => {
        action('isActionItemVisible')(item);
        if (item.label === 'A Hidden Icon') {
          return false;
        }

        return true;
      }}
    />
  </div>
);

SmallBreakpoint.storyName = 'small breakpoint';

export const HeaderComponentSubtitle = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <Header
      {...HeaderMenuProps}
      className={`${iotPrefix}--header--story-test-class`}
      subtitle={
        <div>
          Monitor
          <span style={{ marginInlineStart: '1rem' }}>
            <Tag>Admin Mode</Tag>
          </span>
        </div>
      }
    />
  </div>
);

HeaderComponentSubtitle.storyName = 'header subtitle component';
