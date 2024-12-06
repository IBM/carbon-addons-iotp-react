import { act, render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { ScreenOff, NotificationOn, Chip } from '@carbon/react/icons';
import MockDate from 'mockdate';

import { settings } from '../../constants/Settings';
import { APP_SWITCHER } from '../Header/headerConstants';

import SuiteHeader from './SuiteHeader';
import SuiteHeaderI18N from './i18n';

const { prefix } = settings;

const icon =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIKICAgICB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibGltZSIKICAgICAgc3Ryb2tlPSJibGFjayIgLz4KPC9zdmc+';
const adminPageWorkspaces = [
  {
    id: 'workspace1',
    name: 'Workspace 1',
    href: 'https://www.ibm.com/1',
    adminHref: 'https://www.ibm.com/1/admin',
    isCurrent: false,
    applications: [
      {
        id: 'monitor',
        name: 'Monitor',
        href: 'https://www.ibm.com/1/monitor',
        isExternal: false,
        icon,
      },
      {
        id: 'health',
        name: 'Health',
        href: 'https://www.ibm.com/1/health',
        isExternal: false,
      },
    ],
  },
  {
    id: 'workspace2',
    name: 'Workspace 2',
    href: 'https://www.ibm.com/2',
    isCurrent: false,
    applications: [
      {
        id: 'monitor',
        name: 'Monitor',
        href: 'https://www.ibm.com/2/monitor',
        icon,
      },
      {
        id: 'manage',
        name: 'Manage',
        href: 'https://www.ibm.com/2/manage',
        isExternal: true,
        icon,
      },
    ],
  },
  {
    id: 'workspace3',
    name: 'Workspace 3',
    href: 'https://www.ibm.com/3',
    adminHref: 'https://www.ibm.com/3/admin',
    isCurrent: false,
    applications: [
      {
        id: 'health',
        name: 'Health',
        href: 'https://www.ibm.com/3/health',
        isExternal: false,
        icon,
      },
      {
        id: 'manage',
        name: 'Manage',
        href: 'https://www.ibm.com/3/manage',
        isExternal: false,
        icon,
      },
    ],
  },
  {
    id: 'workspace4',
    name: 'Workspace 4',
    href: 'https://www.ibm.com/4',
    adminHref: 'https://www.ibm.com/4/admin',
    isCurrent: false,
    applications: [],
  },
];

const nonWorkspaceBasedPageWorkspaces = [...adminPageWorkspaces];

const selectedWorkspaceId = 'workspace3';
const appId = 'manage';

const workspaceBasedPageWorkspaces = adminPageWorkspaces.map((wo) => ({
  ...wo,
  isCurrent: wo.id === selectedWorkspaceId,
  applications: wo.applications?.map((a) => ({
    ...a,
    isCurrent: wo.id === selectedWorkspaceId && a.id === appId,
  })),
}));

const adminPageCommonProps = {
  suiteName: 'Application Suite',
  appName: 'Application Name',
  userDisplayName: 'Admin User',
  username: 'adminuser',
  isAdminView: true,
  onRouteChange: async () => true,
  routes: {
    profile: 'https://www.ibm.com/profile',
    navigator: 'https://www.ibm.com/navigator',
    admin: 'https://www.ibm.com/admin',
    logout: 'https://www.ibm.com/logout',
    logoutInactivity: 'https://www.ibm.com/inactivity',
    whatsNew: 'https://www.ibm.com/whatsnew',
    gettingStarted: 'https://www.ibm.com/gettingstarted',
    documentation: 'https://www.ibm.com/documentation',
    requestEnhancement: 'https://www.ibm.com/request',
    support: 'https://www.ibm.com/support',
    about: 'https://www.ibm.com/about',
    domain: '',
  },
  workspaces: adminPageWorkspaces,
  globalApplications: [
    {
      id: 'globalapp1',
      name: 'Global App 1',
      href: 'https://www.ibm.com/globalapp1',
    },
    {
      id: 'globalapp2',
      name: 'Global App 2',
      href: 'https://www.ibm.com/globalapp2',
      isExternal: true,
    },
  ],
};

const workspaceBasedPageCommonProps = {
  ...adminPageCommonProps,
  workspaces: workspaceBasedPageWorkspaces,
  isAdminView: false,
};

const nonAdminPageCommonProps = {
  ...adminPageCommonProps,
  isAdminView: false,
};

const idleTimeoutDataProp = {
  countdown: 10,
  timeout: 10,
  cookieName: '_user_inactivity_timeout',
};

describe('SuiteHeader', () => {
  const originHref = 'https://ibm.com/';
  const expectedAdminPageLogoutRoute = `${
    adminPageCommonProps.routes.logout
  }?originHref=${encodeURIComponent(originHref)}&originIsAdmin=true`;
  const expectedWorkspaceBasedPageLogoutRoute = `${
    adminPageCommonProps.routes.logout
  }?originHref=${encodeURIComponent(
    originHref
  )}&originAppId=${appId}&originWorkspaceId=${selectedWorkspaceId}`;
  const expectedWorkspaceBasedPageLogoutInactivityRoute = `${
    adminPageCommonProps.routes.logoutInactivity
  }?originHref=${encodeURIComponent(
    originHref
  )}&originAppId=${appId}&originWorkspaceId=${selectedWorkspaceId}`;
  const expectedAdminPageLogoutInactivityRoute = `${
    adminPageCommonProps.routes.logoutInactivity
  }?originHref=${encodeURIComponent(originHref)}&originIsAdmin=true`;
  let originalWindowLocation;
  let originalWindowDocumentCookie;
  beforeEach(() => {
    jest.useFakeTimers();
    originalWindowLocation = { ...window.location };
    originalWindowDocumentCookie = window.document.cookie;
    delete window.location;
    window.location = {
      href: 'https://ibm.com/',
      protocol: 'https:',
      host: 'ibm.com',
      pathname: '/',
    };
    window.open = jest.fn();
  });

  afterEach(() => {
    window.location = { ...originalWindowLocation };
    window.document.cookie = originalWindowDocumentCookie;
    jest.useRealTimers();
    MockDate.reset();
  });

  it('should be selectable with testId', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        sideNavProps={{
          links: [
            {
              isEnabled: true,
              icon: <Chip size={24} />,
              metaData: {
                label: 'Devices',
                href: 'https://google.com',
                element: 'a',
                target: '_blank',
              },
              linkContent: 'Devices',
            },
          ],
        }}
        testId="suite_header"
      />
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Warning: A future version of React will block javascript: URLs as a security precaution.'
      ),
      `"javascript:void(0)"`,
      expect.stringContaining('SuiteHeader')
    );
    console.error.mockReset();
    expect(screen.getByTestId('suite_header')).toBeDefined();
    expect(screen.getByTestId('suite_header-name')).toBeDefined();
    expect(screen.getByTestId('suite_header-menu-button')).toBeDefined();
    expect(screen.getByTestId('suite_header-action-group')).toBeDefined();
    expect(screen.getByTestId('suite_header-app-switcher')).toBeDefined();
    expect(screen.getByTestId('suite_header-logout-modal')).toBeDefined();
    expect(screen.getByTestId('suite_header-profile')).toBeDefined();
  });
  it('renders with sidenav', () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        sideNavProps={{
          links: [
            {
              isEnabled: true,
              icon: <Chip size={24} />,
              metaData: {
                label: 'Devices',
                href: 'https://google.com',
                element: 'a',
                target: '_blank',
              },
              linkContent: 'Devices',
            },
          ],
        }}
      />
    );
    expect(screen.getByRole('banner', { name: 'main header' })).toBeInTheDocument();
  });
  it('renders with left sidenav toggle button (custom side nav support)', () => {
    const mockOnSideNavToggled = jest.fn();
    render(
      <SuiteHeader {...adminPageCommonProps} hasSideNav onSideNavToggled={mockOnSideNavToggled} />
    );
    expect(screen.getByTitle('Open menu')).toBeInTheDocument();
    userEvent.click(screen.getByTitle('Open menu'));
    expect(mockOnSideNavToggled).toHaveBeenCalled();
  });
  it('opens and closes logout modal', () => {
    render(<SuiteHeader {...adminPageCommonProps} />);
    expect(screen.getByRole('banner', { name: 'main header' })).toBeInTheDocument();
    userEvent.click(screen.getByTestId('suite-header-profile--logout'));
    expect(screen.getByRole('presentation')).toHaveClass('is-visible');
    userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('presentation')).not.toHaveClass('is-visible');
  });
  it('clicks logout link (admin page)', async () => {
    render(<SuiteHeader {...adminPageCommonProps} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
    expect(window.location.href).toBe(expectedAdminPageLogoutRoute);
  });
  it('clicks logout link (workspace-based page)', async () => {
    render(<SuiteHeader {...workspaceBasedPageCommonProps} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
    expect(window.location.href).toBe(expectedWorkspaceBasedPageLogoutRoute);
  });
  it('clicks logout link (no originHref, no originIsAdmin, no originWorkspaceId and no originAppId)', async () => {
    window.location = { href: '' };
    render(<SuiteHeader {...nonAdminPageCommonProps} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
    expect(window.location.href).toBe(nonAdminPageCommonProps.routes.logout);
  });
  it('clicks logout link (but no redirect)', async () => {
    render(<SuiteHeader {...workspaceBasedPageCommonProps} onRouteChange={async () => false} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
    expect(window.location.href).not.toBe(expectedWorkspaceBasedPageLogoutRoute);
  });
  it('clicks a documentation link', async () => {
    render(<SuiteHeader {...adminPageCommonProps} />);
    await userEvent.click(screen.getByTestId('suite-header-help--whatsNew'));
    expect(window.open).toHaveBeenCalledWith(
      adminPageCommonProps.routes.whatsNew,
      '_blank',
      'noopener noreferrer'
    );
  });
  it('clicks a documentation link (but no redirect)', async () => {
    render(<SuiteHeader {...adminPageCommonProps} onRouteChange={async () => false} />);
    await userEvent.click(screen.getByTestId('suite-header-help--whatsNew'));
    expect(window.open).not.toHaveBeenCalled();
  });
  it('clicks about link', async () => {
    render(<SuiteHeader {...adminPageCommonProps} />);
    await userEvent.click(screen.getByTestId('suite-header-help--about'));
    expect(window.location.href).toBe(adminPageCommonProps.routes.about);
  });
  it('clicks about link (but no redirect)', async () => {
    render(<SuiteHeader {...adminPageCommonProps} onRouteChange={async () => false} />);
    await userEvent.click(screen.getByTestId('suite-header-help--about'));
    expect(window.open).not.toHaveBeenCalled();
  });
  it('renders all i18n', () => {
    Object.keys(SuiteHeaderI18N).forEach((language) => {
      render(
        <SuiteHeader {...adminPageCommonProps} i18n={SuiteHeaderI18N[language]} isAdminView />
      );
      expect(screen.getByRole('banner', { name: 'main header' })).toBeInTheDocument();
    });
  });
  it('renders all i18n, including props that were functions (backwards compatibility)', () => {
    Object.keys(SuiteHeaderI18N).forEach((language) => {
      render(
        <SuiteHeader
          {...adminPageCommonProps}
          i18n={{
            ...SuiteHeaderI18N[language],
            surveyTitle: (solutionName) =>
              SuiteHeaderI18N[language].surveyTitle.replace('{solutionName}', solutionName),
            profileLogoutModalBody: (solutionName, userName) =>
              SuiteHeaderI18N[language].profileLogoutModalBody
                .replace('{solutionName}', solutionName)
                .replace('{userName}', userName),
          }}
          isAdminView
        />
      );
      expect(screen.getByRole('banner', { name: 'main header' })).toBeInTheDocument();
    });
  });
  it('user clicks survey link', async () => {
    const surveyLink = 'https://www.ibm.com/';
    const privacyLink = 'https://google.com';
    const surveyData = { surveyLink, privacyLink };
    render(<SuiteHeader {...adminPageCommonProps} appName={undefined} surveyData={surveyData} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByText(SuiteHeader.defaultProps.i18n.surveyText));
    expect(window.open).toHaveBeenCalledWith(surveyLink, '_blank', 'noopener noreferrer');
  });
  it('user clicks survey link (but no redirect)', async () => {
    const surveyLink = 'https://www.ibm.com/';
    const privacyLink = 'https://google.com';
    const surveyData = { surveyLink, privacyLink };
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        appName={undefined}
        surveyData={surveyData}
        onRouteChange={async () => false}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByText(SuiteHeader.defaultProps.i18n.surveyText));
    expect(window.open).not.toHaveBeenCalled();
  });
  it('user clicks privacy policy link', async () => {
    const surveyLink = 'https://www.ibm.com/';
    const privacyLink = 'https://google.com';
    const surveyData = { surveyLink, privacyLink };
    render(<SuiteHeader {...adminPageCommonProps} appName={undefined} surveyData={surveyData} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByText(SuiteHeader.defaultProps.i18n.surveyPrivacyPolicy));
    expect(window.open).toHaveBeenCalledWith(privacyLink, '_blank', 'noopener noreferrer');
  });
  it('user clicks privacy policy link (but no redirect)', async () => {
    const surveyLink = 'https://www.ibm.com/';
    const privacyLink = 'https://google.com';
    const surveyData = { surveyLink, privacyLink };
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        appName={undefined}
        surveyData={surveyData}
        onRouteChange={async () => false}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByText(SuiteHeader.defaultProps.i18n.surveyPrivacyPolicy));
    expect(window.open).not.toHaveBeenCalled();
  });
  it('user closes survey notification', () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        surveyData={{
          surveyLink: 'https://www.ibm.com/',
          privacyLink: 'https://www.ibm.com/',
        }}
      />
    );
    userEvent.click(screen.getByRole('button', { name: 'closes notification' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('active user does not see idle logout confirmation dialog', () => {
    render(<SuiteHeader {...adminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the future
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() + 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByTestId('idle-logout-confirmation')).not.toHaveClass('is-visible');
  });
  it('inactive user sees idle logout confirmation dialog', () => {
    render(<SuiteHeader {...adminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByTestId('idle-logout-confirmation')).toHaveClass('is-visible');
  });
  it('inactive user does not see idle logout confirmation dialog if timeout is set to 0', () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        idleTimeoutData={{ ...adminPageCommonProps.idleTimeoutData, timeout: 0 }}
      />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByTestId('idle-logout-confirmation')).not.toHaveClass('is-visible');
  });
  it('clicking Stay Logged In on the idle logout confirmation dialog triggers onStayLoggedIn callback', () => {
    const mockOnStayLoggedIn = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        idleTimeoutData={idleTimeoutDataProp}
        onStayLoggedIn={mockOnStayLoggedIn}
      />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalStayLoggedInButton = screen.getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalStayLoggedInButton
    );
    userEvent.click(modalStayLoggedInButton);
    expect(mockOnStayLoggedIn).toHaveBeenCalled();
  });
  it('user clicks Log Out on the idle logout confirmation dialog (admin page)', async () => {
    render(<SuiteHeader {...adminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalLogoutButton = within(screen.getByTestId('idle-logout-confirmation')).getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalLogoutButton
    );
    await userEvent.click(modalLogoutButton);
    expect(window.location.href).toBe(expectedAdminPageLogoutRoute);
  });
  it('user clicks Log Out on the idle logout confirmation dialog (workspace-based page)', async () => {
    render(
      <SuiteHeader {...workspaceBasedPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalLogoutButton = within(screen.getByTestId('idle-logout-confirmation')).getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalLogoutButton
    );
    await userEvent.click(modalLogoutButton);
    expect(window.location.href).toBe(expectedWorkspaceBasedPageLogoutRoute);
  });
  it('user clicks Log Out on the idle logout confirmation dialog (no originHref, no originIsAdmin, no originWorkspaceId and no originAppId)', async () => {
    window.location = { href: '' };
    render(<SuiteHeader {...nonAdminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalLogoutButton = within(screen.getByTestId('idle-logout-confirmation')).getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalLogoutButton
    );
    await userEvent.click(modalLogoutButton);
    expect(window.location.href).toBe(nonAdminPageCommonProps.routes.logout);
  });
  it('user clicks Log Out on the idle logout confirmation dialog (but no redirect)', async () => {
    render(
      <SuiteHeader
        {...workspaceBasedPageCommonProps}
        onRouteChange={async () => false}
        idleTimeoutData={idleTimeoutDataProp}
      />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalLogoutButton = within(screen.getByTestId('idle-logout-confirmation')).getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalLogoutButton
    );
    await userEvent.click(modalLogoutButton);
    expect(window.location.href).not.toBe(expectedWorkspaceBasedPageLogoutRoute);
  });
  it('idle user waits for the logout confirmation dialog countdown to finish (admin page)', async () => {
    render(<SuiteHeader {...adminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    // Go to the future by a little more than idleTimeoutDataProp.countdown seconds
    MockDate.set(Date.now() + (idleTimeoutDataProp.countdown + 1) * 1000);
    await act(async () => {
      await jest.runOnlyPendingTimers();
    });
    await waitFor(() => expect(window.location.href).toBe(expectedAdminPageLogoutInactivityRoute));
  });
  it('idle user waits for the logout confirmation dialog countdown to finish', async () => {
    render(
      <SuiteHeader {...workspaceBasedPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    // Go to the future by a little more than idleTimeoutDataProp.countdown seconds
    MockDate.set(Date.now() + (idleTimeoutDataProp.countdown + 1) * 1000);
    await act(async () => {
      await jest.runOnlyPendingTimers();
    });
    await waitFor(() =>
      expect(window.location.href).toBe(expectedWorkspaceBasedPageLogoutInactivityRoute)
    );
  });
  it('idle user waits for the logout confirmation dialog countdown to finish (no originHref, no originIsAdmin, no originWorkspaceId and no originAppId)', async () => {
    window.location = { href: '' };
    render(<SuiteHeader {...nonAdminPageCommonProps} idleTimeoutData={idleTimeoutDataProp} />);
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    // Go to the future by a little more than idleTimeoutDataProp.countdown seconds
    MockDate.set(Date.now() + (idleTimeoutDataProp.countdown + 1) * 1000);
    await act(async () => {
      await jest.runOnlyPendingTimers();
    });
    await waitFor(() =>
      expect(window.location.href).toBe(adminPageCommonProps.routes.logoutInactivity)
    );
  });
  it('idle user waits for the logout confirmation dialog countdown to finish (but no redirect)', async () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={async () => false}
        idleTimeoutData={idleTimeoutDataProp}
      />
    );
    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    // Go to the future by a little more than idleTimeoutDataProp.countdown seconds
    MockDate.set(Date.now() + (idleTimeoutDataProp.countdown + 1) * 1000);
    await act(async () => {
      await jest.runOnlyPendingTimers();
    });
    await waitFor(() =>
      expect(window.location.href).not.toBe(expectedWorkspaceBasedPageLogoutInactivityRoute)
    );
  });
  it('renders Walkme', async () => {
    render(<SuiteHeader {...adminPageCommonProps} walkmePath="/some/test/path" walkmeLang="en" />);
    // Make sure the scripts in Walkme component were executed
    await waitFor(() => expect(window._walkmeConfig).toEqual({ smartLoad: true }));
  });

  it('default prop test', async () => {
    jest.spyOn(SuiteHeader.defaultProps, 'onRouteChange');
    jest.spyOn(SuiteHeader.defaultProps, 'onSideNavToggled');
    jest.spyOn(SuiteHeader.defaultProps, 'onStayLoggedIn');
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        sideNavProps={{
          links: [
            {
              isEnabled: true,
              icon: <Chip size={24} />,
              metaData: {
                label: 'Devices',
                href: 'https://google.com',
                element: 'a',
                target: '_blank',
              },
              linkContent: 'Devices',
            },
          ],
        }}
        idleTimeoutData={idleTimeoutDataProp}
        onRouteChange={undefined}
        onSideNavToggled={undefined}
        onStayLoggedIn={undefined}
      />
    );

    await userEvent.click(screen.getByTitle(`What's new`));
    expect(SuiteHeader.defaultProps.onRouteChange).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(SuiteHeader.defaultProps.onSideNavToggled).toHaveBeenCalled();

    // Simulate a timestamp cookie that is in the past
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${idleTimeoutDataProp.cookieName}=${Date.now() - 1000}`,
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const modalStayLoggedInButton = screen.getByText(
      SuiteHeaderI18N.en.sessionTimeoutModalStayLoggedInButton
    );
    userEvent.click(modalStayLoggedInButton);
    expect(SuiteHeader.defaultProps.onStayLoggedIn).toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('function i18n props should fallback to suiteName if appName is not given', async () => {
    const surveyTitle = jest.fn();
    const profileLogoutModalBody = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        appName={undefined}
        suiteName="PAL"
        surveyData={{
          surveyLink: 'https://www.ibm.com',
          privacyLink: 'https://www.ibm.com',
        }}
        i18n={{
          surveyTitle,
          profileLogoutModalBody,
        }}
      />
    );
    expect(surveyTitle).toHaveBeenCalledWith('PAL');
    userEvent.click(screen.getByTitle('Logout'));
    expect(profileLogoutModalBody).toHaveBeenCalledWith('PAL', 'Admin User');
  });

  it('clicking manage profile should call onRouteChange', async () => {
    const originalHref = window.location.href;
    const onRouteChange = jest.fn().mockImplementation(() => false);
    render(<SuiteHeader {...adminPageCommonProps} onRouteChange={onRouteChange} />);
    userEvent.click(screen.getByRole('button', { name: 'user', label: 'user' }));
    await userEvent.click(screen.getByTestId('suite-header-profile--profile'));
    expect(onRouteChange).toHaveBeenCalledWith('PROFILE', adminPageCommonProps.routes.profile);
    expect(window.location.href).toEqual(originalHref);

    onRouteChange.mockImplementation(() => true);
    userEvent.click(screen.getByRole('button', { name: 'user', label: 'user' }));
    await userEvent.click(screen.getByTestId('suite-header-profile--profile'));
    expect(onRouteChange).toHaveBeenCalledWith('PROFILE', adminPageCommonProps.routes.profile);
    expect(window.location.href).toBe(adminPageCommonProps.routes.profile);
  });

  it('should handle keyboard navigation for actionItems and panel links', async () => {
    const onRouteChange = jest.fn().mockImplementation(() => true);
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={onRouteChange}
        customActionItems={[
          {
            label: 'chip',
            hasHeaderPanel: true,
            btnContent: (
              <span id="chip-icon">
                <Chip
                  fill="white"
                  size={24}
                  description="chip-icon"
                  className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
                />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is a title',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                },
                content: <span id="a-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip' }), '{enter}', { skipClick: true });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is a title'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(onRouteChange).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and panel button with onClick', async () => {
    const onRouteChange = jest.fn().mockImplementation(() => true);
    const onClick = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={onRouteChange}
        customActionItems={[
          {
            label: 'chip',
            hasHeaderPanel: true,
            btnContent: (
              <span id="chip-icon">
                <Chip
                  fill="white"
                  description="chip-icon"
                  size={24}
                  className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
                />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is a title',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'button',
                  onClick,
                },
                content: <span id="a-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip' }), '{enter}', { skipClick: true });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLButtonElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is a title'), { key: 'Enter' });
    expect(HTMLButtonElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRouteChange).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and panel button without onClick', async () => {
    const onRouteChange = jest.fn().mockImplementation(() => true);
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={onRouteChange}
        customActionItems={[
          {
            label: 'chip',
            hasHeaderPanel: true,
            btnContent: (
              <span id="chip-icon">
                <Chip
                  fill="white"
                  description="chip-icon"
                  size={24}
                  className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
                />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is a title',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'button',
                },
                content: <span id="a-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip' }), '{enter}', { skipClick: true });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLButtonElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is a title'), { key: 'Enter' });
    expect(HTMLButtonElement.prototype.click).not.toHaveBeenCalled();
    expect(onRouteChange).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and panel links with onClick', async () => {
    const onRouteChange = jest.fn().mockImplementation(() => true);
    const onClick = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={onRouteChange}
        customActionItems={[
          {
            label: 'chip',
            hasHeaderPanel: true,
            btnContent: (
              <span id="chip-icon">
                <Chip
                  fill="white"
                  description="chip-icon"
                  size={24}
                  className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
                />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is a title',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                  onClick,
                },
                content: <span id="a-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip' }), '{enter}', { skipClick: true });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is a title'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRouteChange).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and menu links', async () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: 'chip',
            btnContent: (
              <span id="chip-icon">
                <Chip fill="white" size={24} description="chip-icon" />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is my message to you',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                },
                content: <span id="another-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip', label: 'chip' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is my message to you'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and menu buttons', async () => {
    const onClick = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: 'chip',
            btnContent: (
              <span id="chip-icon">
                <Chip fill="white" size={24} description="chip-icon" />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is my message to you',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'button',
                  onClick,
                },
                content: <span id="another-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip', label: 'chip' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLButtonElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is my message to you'), { key: 'Enter' });
    expect(HTMLButtonElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and menu buttons without an onClick', async () => {
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: 'chip',
            btnContent: (
              <span id="chip-icon">
                <Chip fill="white" size={24} description="chip-icon" />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is my message to you',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'button',
                },
                content: <span id="another-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip', label: 'chip' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLButtonElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is my message to you'), { key: 'Enter' });
    expect(HTMLButtonElement.prototype.click).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and menu links with onClick', async () => {
    const onClick = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: 'chip',
            btnContent: (
              <span id="chip-icon">
                <Chip fill="white" size={24} description="chip-icon" />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is my message to you',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                  onClick,
                },
                content: <span id="another-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip', label: 'chip' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is my message to you'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and menu links with onClick and onKeyDown', async () => {
    const onClick = jest.fn();
    const onKeyDown = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: 'chip',
            btnContent: (
              <span id="chip-icon">
                <Chip fill="white" size={24} description="chip-icon" />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is my message to you',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                  onClick,
                  onKeyDown,
                },
                content: <span id="another-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip', label: 'chip' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is my message to you'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    jest.resetAllMocks();
  });

  it('should handle keyboard navigation for actionItems and panel links with onClick and onKeyDown', async () => {
    const onRouteChange = jest.fn().mockImplementation(() => true);
    const onClick = jest.fn();
    const onKeyDown = jest.fn();
    render(
      <SuiteHeader
        {...adminPageCommonProps}
        onRouteChange={onRouteChange}
        customActionItems={[
          {
            label: 'chip',
            hasHeaderPanel: true,
            btnContent: (
              <span id="chip-icon">
                <Chip
                  fill="white"
                  description="chip-icon"
                  size={24}
                  className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
                />
              </span>
            ),
            childContent: [
              {
                metaData: {
                  href: 'https://www.ibm.com',
                  title: 'this is a title',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  element: 'a',
                  onClick,
                  onKeyDown,
                },
                content: <span id="a-message">this is my message to you</span>,
              },
            ],
          },
        ]}
      />
    );

    userEvent.type(screen.getByRole('button', { name: 'chip' }), '{enter}', { skipClick: true });
    expect(screen.getByText('this is my message to you')).toBeVisible();
    jest.spyOn(HTMLAnchorElement.prototype, 'click');
    fireEvent.keyDown(screen.getByTitle('this is a title'), { key: 'Enter' });
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(onRouteChange).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalled();
    jest.resetAllMocks();
  });

  describe('opening in new window', () => {
    let fakeUserAgent = '';
    beforeAll(() => {
      const { userAgent } = global.navigator;
      Object.defineProperty(global.navigator, 'userAgent', {
        get() {
          return fakeUserAgent === '' ? userAgent : fakeUserAgent;
        },
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
      fakeUserAgent = '';
    });

    it('should open built-in routes in new window when holding cmd', async () => {
      const onRouteChange = jest.fn().mockImplementation(() => true);
      fakeUserAgent = 'Mac';
      render(<SuiteHeader {...workspaceBasedPageCommonProps} onRouteChange={onRouteChange} />);
      await userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('All applications'), { metaKey: true });
      const currentWorkspace = workspaceBasedPageCommonProps.workspaces.find((wo) => wo.isCurrent);
      expect(onRouteChange).toHaveBeenCalledWith('NAVIGATOR', currentWorkspace.href, {
        workspaceId: currentWorkspace.id,
      });
      expect(window.open).toHaveBeenCalledWith(
        currentWorkspace.href,
        '_blank',
        'noopener noreferrer'
      );
    });

    it('should open built-in routes in new window when holding ctrl', async () => {
      const onRouteChange = jest.fn().mockImplementation(() => true);
      fakeUserAgent = 'Win';
      render(<SuiteHeader {...workspaceBasedPageCommonProps} onRouteChange={onRouteChange} />);
      await userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('All applications'), { ctrlKey: true });
      const currentWorkspace = workspaceBasedPageCommonProps.workspaces.find((wo) => wo.isCurrent);
      expect(onRouteChange).toHaveBeenCalledWith('NAVIGATOR', currentWorkspace.href, {
        workspaceId: currentWorkspace.id,
      });
      expect(window.open).toHaveBeenCalledWith(
        currentWorkspace.href,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(1);
      userEvent.click(screen.getByRole('button', { name: 'user', label: 'user' }));
      await userEvent.click(screen.getByTestId('suite-header-profile--profile'), {
        ctrlKey: true,
      });
      expect(window.open).toHaveBeenLastCalledWith(
        workspaceBasedPageCommonProps.routes.profile,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(2);

      userEvent.click(screen.getByRole('button', { name: 'Help', label: 'Help' }));
      await userEvent.click(screen.getByTitle('About'), { ctrlKey: true });
      expect(window.open).toHaveBeenLastCalledWith(
        workspaceBasedPageCommonProps.routes.about,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(3);

      userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('All applications'), { ctrlKey: true });
      expect(window.open).toHaveBeenLastCalledWith(
        currentWorkspace.href,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(4);

      userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('Health'), { ctrlKey: true });
      expect(window.open).toHaveBeenLastCalledWith(
        currentWorkspace.applications[0].href,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(5);

      userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('Manage'), { ctrlKey: true });
      expect(window.open).toHaveBeenLastCalledWith(
        currentWorkspace.applications[1].href,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(6);

      userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
      await userEvent.click(screen.getByText('Workspace administration'), { ctrlKey: true });
      expect(window.open).toHaveBeenLastCalledWith(
        currentWorkspace.adminHref,
        '_blank',
        'noopener noreferrer'
      );
      expect(window.open).toHaveBeenCalledTimes(7);
    });
  });

  it('should not allow tabbing to application switcher panel items when it is closed', async () => {
    render(<SuiteHeader {...workspaceBasedPageCommonProps} />);
    expect(screen.getByTestId('action-btn__panel')).toHaveAttribute('tabindex', '-1');
    // not tab-able when closed.
    expect(screen.getByTestId('suite-header-app-switcher--all-applications')).toHaveAttribute(
      'tabindex',
      '-1'
    );
    const currentWorkspace = workspaceBasedPageCommonProps.workspaces.find((wo) => wo.isCurrent);
    currentWorkspace.applications.forEach((app) =>
      expect(
        screen.getByTestId(`suite-header-app-switcher--application-${app.id}`)
      ).toHaveAttribute('tabindex', '-1')
    );

    expect(screen.getByTestId('suite-header-app-switcher--admin-workspace')).toHaveAttribute(
      'tabindex',
      '-1'
    );

    userEvent.click(screen.getByRole('button', { name: APP_SWITCHER }));
    expect(screen.getByTestId('action-btn__panel')).toHaveClass(
      `${prefix}--header-panel--expanded`
    );
    // tab-able when open
    expect(screen.getByTestId('suite-header-app-switcher--all-applications')).toHaveAttribute(
      'tabindex',
      '0'
    );
    currentWorkspace.applications.forEach((app) =>
      expect(
        screen.getByTestId(`suite-header-app-switcher--application-${app.id}`)
      ).toHaveAttribute('tabindex', '0')
    );
    expect(screen.getByTestId('suite-header-app-switcher--admin-workspace')).toHaveAttribute(
      'tabindex',
      '0'
    );
  });

  it('should show current workspace in the main header bar for workspace-based page with more than one workspace available', async () => {
    render(<SuiteHeader {...workspaceBasedPageCommonProps} />);
    expect(screen.getByTestId('suite-header--current-workspace')).toBeVisible();
  });

  it('should not show current workspace in the main header bar for workspace-based page with only one workspace available', async () => {
    render(
      <SuiteHeader
        {...workspaceBasedPageCommonProps}
        workspaces={[workspaceBasedPageWorkspaces.find((wo) => wo.isCurrent)]}
      />
    );
    expect(screen.queryByTestId('suite-header--current-workspace')).not.toBeInTheDocument();
  });

  it('should not show current workspace in the main header bar for non-workspace-based page with only one workspace available', async () => {
    render(
      <SuiteHeader
        {...workspaceBasedPageCommonProps}
        workspaces={[nonWorkspaceBasedPageWorkspaces[0]]}
      />
    );
    expect(screen.queryByTestId('suite-header--current-workspace')).not.toBeInTheDocument();
  });

  it('should not show current workspace in the main header bar for admin page with more than one workspace available', async () => {
    render(<SuiteHeader {...adminPageCommonProps} />);
    expect(screen.queryByTestId('suite-header--current-workspace')).not.toBeInTheDocument();
  });

  it('should assign unique id to action items', () => {
    const firstActionLabel = 'Label one';
    const secondActionLabel = 'Label two';
    const { container } = render(
      <SuiteHeader
        {...adminPageCommonProps}
        customActionItems={[
          {
            label: firstActionLabel,
            btnContent: (
              <ScreenOff id="hidden-button" fill="white" description="hidden-button-icon" />
            ),
          },
          {
            label: secondActionLabel,
            btnContent: (
              <span id="bell-icon">
                <NotificationOn
                  id="notification-button"
                  size={24}
                  fill="white"
                  description="Icon"
                />
              </span>
            ),
          },
        ]}
      />
    );

    expect(container.querySelectorAll('#menu-item-global-action-0')).toHaveLength(1);
    expect(container.querySelectorAll('#menu-item-global-action-1')).toHaveLength(1);
    expect(container.querySelector('#menu-item-global-action-0')).toHaveTextContent(
      firstActionLabel
    );
    expect(container.querySelector('#menu-item-global-action-1')).toHaveTextContent(
      secondActionLabel
    );
  });
});
