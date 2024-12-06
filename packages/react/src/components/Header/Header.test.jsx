import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { User, Help } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import { keyboardKeys } from '../../constants/KeyCodeConstants';

import Header from './Header';
import { APP_SWITCHER } from './headerConstants';

const { prefix, iotPrefix } = settings;

React.Fragment = ({ children }) => children;

describe('Header', () => {
  const onClick = jest.fn();
  const HeaderProps = {
    user: 'JohnDoe@ibm.com',
    tenant: 'TenantId: Acme',
    url: 'http://localhost:8989',
    className: 'custom-class-name',
    appName: 'Watson IoT Platform ',
    skipto: 'skip',
    actionItems: [
      {
        label: 'help',
        hasHeaderPanel: true,
        btnContent: (
          <Help
            size={20}
            fill="white"
            description="Icon"
            className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
          />
        ),
        childContent: [
          {
            onClick: jest.fn(),
            content: <p>This is a link</p>,
          },
          {
            onClick: jest.fn(),
            content: (
              <React.Fragment>
                <span>
                  JohnDoe@ibm.com
                  <User size={20} fill="white" description="Icon" />
                </span>
              </React.Fragment>
            ),
          },
        ],
      },
      {
        label: 'user',
        btnContent: <User size={20} fill="white" description="Icon" />,
        menuLinkName: 'a menu link name',
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
              onClick,
              className: 'this',
              element: 'button',
            },
            content: (
              <span>
                JohnDoe@ibm.com
                <User size={20} fill="white" description="Icon" />
              </span>
            ),
          },
        ],
      },
    ],
  };

  const HeaderPropsWithoutOnClick = {
    user: 'JohnDoe@ibm.com',
    tenant: 'TenantId: Acme',
    url: 'http://localhost:8989',
    className: 'custom-class-name',
    appName: 'Watson IoT Platform ',
    skipto: 'skip',
    actionItems: [
      {
        label: 'user',
        onClick: undefined,
        btnContent: <User size={20} fill="white" description="Icon" />,
      },
    ],
  };

  it('should be selectable by testId', () => {
    render(<Header {...HeaderProps} hasSideNav testId="__header__" />);
    expect(screen.getByTestId('__header__')).toBeDefined();
    expect(screen.getByTestId('__header__-menu-button')).toBeDefined();
    expect(screen.getByTestId('__header__-name')).toBeDefined();
    expect(screen.getByTestId('__header__-action-group')).toBeDefined();
  });

  it('should render', () => {
    const { container } = render(<Header {...HeaderProps} />);
    expect(container).toMatchSnapshot();
  });

  it('sidepanel should not render', () => {
    render(<Header {...HeaderProps} />);
    expect(screen.queryByLabelText(APP_SWITCHER)).toBeFalsy();
  });

  it('sidepanel should render', () => {
    const headerPanel = {
      className: 'header-panel',

      content: React.forwardRef((props, ref) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <button ref={ref} type="button" {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);
    expect(screen.queryAllByLabelText(APP_SWITCHER).length).toBeGreaterThan(0);
  });

  it('children should render inside UL', () => {
    render(<Header {...HeaderProps} />);
    expect(screen.getByText('This is a link').parentElement.parentElement.nodeName).toBe('LI');
    expect(screen.getByText('This is a link').parentElement.parentElement.className).toEqual(
      'action-btn__headerpanel-li'
    );
    expect(
      screen.getByText('This is a link').parentElement.parentElement.parentNode.childElementCount
    ).toEqual(2);
  });

  it('clicking trigger button should expand the header panel', () => {
    render(<Header {...HeaderProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel ${prefix}--header-panel--expanded action-btn__headerpanel`
    );
    fireEvent.click(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel action-btn__headerpanel action-btn__headerpanel--closed`
    );
  });

  it('closes when focus leaves panel', () => {
    render(<Header {...HeaderProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'help' }));
    fireEvent.focus(screen.getByText('This is a link'));
    fireEvent.blur(screen.getByText('This is a link'));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel action-btn__headerpanel action-btn__headerpanel--closed`
    );
  });

  it('closes when focus leaves trigger', () => {
    render(<Header {...HeaderProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel ${prefix}--header-panel--expanded action-btn__headerpanel`
    );
    fireEvent.blur(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel action-btn__headerpanel action-btn__headerpanel--closed`
    );
  });

  it('closes when focus leaves the current action', () => {
    render(<Header {...HeaderProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel ${prefix}--header-panel--expanded action-btn__headerpanel`
    );
    // focus leaves the first button
    fireEvent.blur(screen.getByRole('button', { name: 'help' }));
    expect(screen.getByRole('button', { name: 'help' }).parentNode.lastChild.className).toContain(
      `${prefix}--header-panel action-btn__headerpanel action-btn__headerpanel--closed`
    );
  });

  it('App switcher opens', () => {
    const headerPanel = {
      className: 'header-panel',
      // eslint-disable-next-line react/no-multi-comp
      content: React.forwardRef((props, ref) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <button ref={ref} type="button" {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);

    fireEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
    expect(
      screen.getByRole('button', { name: APP_SWITCHER }).parentNode.lastChild.className
    ).toContain(
      `${prefix}--header-panel ${prefix}--header-panel--expanded ${prefix}--app-switcher`
    );

    fireEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
    expect(
      screen.getByRole('button', { name: APP_SWITCHER }).parentNode.lastChild.className
    ).toContain(`${prefix}--header-panel ${prefix}--app-switcher`);
  });

  it('onClick expands', () => {
    const headerPanel = {
      className: 'header-panel',
      // eslint-disable-next-line react/no-multi-comp
      content: React.forwardRef((props, ref) => (
        <button type="button" ref={ref} {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);

    const menuItem = screen.getByTestId('menuitem');
    fireEvent.click(menuItem);
    expect(menuItem.getAttribute('aria-expanded')).toBeTruthy();
  });

  it('onKeyDown expands with enter', () => {
    const headerPanel = {
      className: 'header-panel',
      // eslint-disable-next-line react/no-multi-comp
      content: React.forwardRef((props, ref) => (
        <button type="button" ref={ref} {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);
    const menuTrigger = screen.getByTestId('menuitem');
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.ENTER });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.HOME });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.SPACE });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('onKeyDown expands with space', () => {
    const headerPanel = {
      className: 'header-panel',
      // eslint-disable-next-line react/no-multi-comp
      content: React.forwardRef((props, ref) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <button type="button" ref={ref} {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);
    const menuTrigger = screen.getByRole('button', { name: 'help' });
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.SPACE });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.ENTER });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('onKeyDown esc on parent closes an open menu', () => {
    const headerPanel = {
      className: 'header-panel',
      // eslint-disable-next-line react/no-multi-comp
      content: React.forwardRef((props, ref) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <button type="button" ref={ref} {...props}>
          Header panel content
        </button>
      )),
    };
    render(<Header {...HeaderProps} headerPanel={headerPanel} />);
    const menuParent = screen.getByRole('menu');
    const menuTrigger = screen.getByTestId('menuitem');
    fireEvent.keyDown(menuTrigger, { key: keyboardKeys.ENTER });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(menuParent, { key: keyboardKeys.ESCAPE });
    expect(menuTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('onClick event on empty onClick prop', () => {
    render(<Header {...HeaderPropsWithoutOnClick} />);
    const menuItem = screen.getByLabelText('user');
    fireEvent.click(menuItem);
    expect(screen.getByLabelText('user')).toBeTruthy();
  });
  it('should not display the shortname if none given', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <Header {...HeaderPropsWithoutOnClick} shortAppName={undefined} appName={undefined} />
    );
    expect(container.querySelectorAll(`.${iotPrefix}--header__short-name`)).toHaveLength(0);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed prop type: The prop `appName` is marked as required in `Header`'
      )
    );
    console.error.mockReset();
  });

  it('should not display an action item if isActionItemVisible returns false', () => {
    const isActionItemVisible = jest.fn().mockImplementation(() => false);
    render(
      <Header
        {...HeaderPropsWithoutOnClick}
        actionItems={[...HeaderPropsWithoutOnClick.actionItems]}
        isActionItemVisible={isActionItemVisible}
      />
    );
    expect(isActionItemVisible).toHaveBeenCalledTimes(1);
    expect(isActionItemVisible).toHaveBeenCalledWith({
      btnContent: expect.anything(),
      label: 'user',
      onClick: undefined,
    });
  });
  it('should render if actionItems is empty', () => {
    render(<Header {...HeaderPropsWithoutOnClick} actionItems={[]} />);
    expect(screen.getByText('IBM')).toBeVisible();
  });
  it('should change side-nav menu button label when isSideNavExpanded change', () => {
    const { rerender } = render(<Header {...HeaderPropsWithoutOnClick} isSideNavExpanded />);
    expect(screen.getByLabelText('Close menu')).toBeVisible();
    rerender(<Header {...HeaderPropsWithoutOnClick} isSideNavExpanded={false} />);
    expect(screen.getByLabelText('Open menu')).toBeVisible();
    rerender(
      <Header
        {...HeaderPropsWithoutOnClick}
        isSideNavExpanded={false}
        i18n={{ openMenu: '__open__' }}
      />
    );
    expect(screen.getByLabelText('__open__')).toBeVisible();
    rerender(
      <Header {...HeaderPropsWithoutOnClick} isSideNavExpanded i18n={{ closeMenu: '__close__' }} />
    );
    expect(screen.getByLabelText('__close__')).toBeVisible();
  });
});
