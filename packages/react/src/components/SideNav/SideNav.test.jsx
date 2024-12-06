import React from 'react';
import { Switcher, Chip, Group, ParentChild, Home, RecentlyViewed } from '@carbon/react/icons';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { settings } from '../../constants/Settings';

import SideNav from './SideNav';

const { prefix, iotPrefix } = settings;

React.Fragment = ({ children }) => children;

describe('SideNav', () => {
  const links = [
    {
      icon: () => (
        <Switcher
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      isEnabled: true,
      metaData: {
        onClick: jest.fn(),
        tabIndex: 0,
        label: 'Boards',
        element: 'a',
      },
      linkContent: 'Boards',
    },
    {
      current: true,
      isEnabled: true,
      icon: () => (
        <Chip
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
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
      icon: () => (
        <Group
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      metaData: {
        label: 'Members',
        element: 'button',
      },
      linkContent: 'Members',
      childContent: [
        {
          metaData: {
            label: 'Members sub menu',
            onClick: jest.fn(),
            element: 'button',
          },
          content: 'Members sub menu',
          isActive: true,
        },
      ],
    },
  ];

  const links2 = [
    {
      icon: () => (
        <Switcher
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      isEnabled: true,
      metaData: {
        onClick: jest.fn(),
        tabIndex: 0,
        label: 'Boards',
        element: 'a',
      },
      linkContent: 'Boards',
    },
  ];

  const mostRecentLinks = [
    {
      icon: RecentlyViewed,
      isEnabled: true,
      metaData: {
        onClick: jest.fn(),
        tabIndex: 0,
        label: 'My recent applications',
        element: 'a',
      },
      linkContent: 'My recent applications',
      childContent: [
        {
          metaData: {
            label: 'App 1',
            title: 'App 1',
            onClick: jest.fn(),
            element: 'button',
          },
          content: 'App 1',
        },
        {
          metaData: {
            label: 'App 2',
            title: 'App 2',
            onClick: jest.fn(),
            element: 'button',
          },
          content: 'App 2',
        },
      ],
    },
  ];

  const linksDisabled = [
    {
      icon: () => (
        <Switcher
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      isEnabled: false,
      metaData: {
        onClick: jest.fn(),
        tabIndex: 0,
        label: 'Boards',
        element: 'a',
      },
      linkContent: 'Boards',
    },
    {
      current: true,
      isEnabled: true,
      icon: () => (
        <Chip
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
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
      icon: () => (
        <Group
          size={24}
          fill="white"
          description="Icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      metaData: {
        label: 'Members',
        element: 'button',
      },
      linkContent: 'Members',
    },
  ];

  const getDeeplyNestedlinks = (onClick) => [
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
                    onClick,
                    element: 'button',
                  },
                  content: 'Grandchild Button',
                  isActive: true,
                },
                {
                  metaData: {
                    label: 'Grandchild Link',
                    title: 'Grandchild Link',
                    href: 'https://www.ibm.com',
                    element: 'a',
                  },
                  content: 'Grandchild Link',
                },
              ],
            },
            {
              metaData: {
                label: 'Sibling 2 Button',
                title: 'Sibling 2 Button',
                element: 'button',
                onClick,
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
            onClick,
          },
          content: 'Co-Parent Button',
        },
      ],
    },
  ];

  let mockProps;

  const { i18n } = SideNav.defaultProps;

  beforeAll(() => {
    // This is needed to find texts that have been split up in
    // multiple DOM nodes, like when search result item texts are using
    // the mark tag.
    screen.getByTextContent = (text) => {
      return screen.getByText((content, node) => {
        const childrenMatching = Array.from(node?.children || []).some(
          (child) => child.textContent === text
        );
        return node.textContent === text && !childrenMatching;
      });
    };
  });

  afterAll(() => {
    delete screen.getByTextContent;
  });

  beforeEach(() => {
    mockProps = {
      links,
      'aria-label': 'Side navigation',
    };
  });

  it('should be selectable by testId', () => {
    render(<SideNav {...mockProps} testId="side_nav" />);
    expect(screen.getByTestId('side_nav')).toBeDefined();
    expect(screen.getByTestId('side_nav-link-0')).toBeDefined();
    expect(screen.getByTestId('side_nav-menu-item-2')).toBeDefined();
  });

  it('should render two levels of navigation links', () => {
    const { container } = render(<SideNav {...mockProps} />);
    expect(container.querySelectorAll('ul')).toHaveLength(2);
  });

  it('should render an button tag for a subNav', () => {
    render(<SideNav {...mockProps} />);
    expect(screen.getByTestId('side-nav-menu-item-2').nodeName).toEqual('BUTTON');
  });

  it('should render one level of navigation links', () => {
    mockProps = {
      links: links2,
      'aria-label': 'Side navigation',
    };
    const { container } = render(<SideNav {...mockProps} />);
    expect(container.querySelectorAll('ul')).toHaveLength(1);
  });

  it('should still render an a tag', () => {
    mockProps = {
      links: links2,
      'aria-label': 'Side navigation',
    };
    render(<SideNav {...mockProps} />);
    expect(screen.getByLabelText('Boards').nodeName).toEqual('A');
  });

  it('should not render a subNav or its button', () => {
    mockProps = {
      links: links2,
      'aria-label': 'Side navigation',
    };
    render(<SideNav {...mockProps} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('disabled item should not render', () => {
    mockProps = {
      links: linksDisabled,
    };
    render(<SideNav {...mockProps} />);
    expect(screen.queryByText('Boards')).toBeNull();
    expect(screen.queryByText('Devices')).toBeDefined();
    expect(screen.queryByText('Members')).toBeDefined();
  });

  it('parent item with active child should be active', () => {
    render(<SideNav {...mockProps} />);
    expect(screen.getByText('Members').closest('li')).toHaveClass(
      `${prefix}--side-nav__item--active`
    );
  });

  it('should render nested levels of children', () => {
    const onClick = jest.fn();
    render(<SideNav {...mockProps} links={getDeeplyNestedlinks(onClick)} />);

    const expectToBeVisible = (text) => {
      expect(screen.getByText(text)).toBeVisible();
    };

    const clickText = (text) => {
      userEvent.click(screen.getByText(text));
    };

    const expectToBeActive = (text) => {
      expect(screen.getByText(text).closest(`.${prefix}--side-nav__item`)).toHaveClass(
        `${prefix}--side-nav__item--active`
      );
    };

    const expectToHaveDepth = (text, depth) => {
      expect(screen.getByText(text).closest(`.${prefix}--side-nav__item`)).toHaveClass(
        `${iotPrefix}--side-nav__item--depth-${depth}`
      );
    };

    expectToBeVisible('Nested Levels');
    expectToBeActive('Nested Levels');
    expectToHaveDepth('Nested Levels', 0);

    clickText('Nested Levels');
    expectToBeVisible('Co-Parent Link');
    expectToBeVisible('Parent');
    expectToBeVisible('Co-Parent Button');
    clickText('Co-Parent Button');
    expect(onClick).toHaveBeenCalledTimes(1);
    expectToBeActive('Parent');
    expectToHaveDepth('Parent', 1);

    clickText('Parent');
    expectToBeVisible('Sibling 1 Link');
    expectToBeVisible('Child');
    expectToBeVisible('Sibling 2 Button');
    clickText('Sibling 2 Button');
    expect(onClick).toHaveBeenCalledTimes(2);
    expectToBeActive('Child');
    expectToHaveDepth('Child', 2);

    clickText('Child');
    expectToBeVisible('Grandchild Button');
    expectToBeVisible('Grandchild Link');
    clickText('Grandchild Button');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('should render search field when hasSearch is true', () => {
    const { rerender } = render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByTestId('side-nav-search')).toBeVisible();

    rerender(<SideNav {...mockProps} />);
    expect(screen.queryByTestId('side-nav-search')).toBeNull();
  });

  it('filters to show matched child leaf nodes and their parents when user types in the search field', () => {
    render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Devices')).toBeVisible();
    expect(screen.getByText('Members')).toBeVisible();
    expect(screen.getByText('Members sub menu')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'ers sub');
    expect(screen.queryByLabelText('Boards')).toBeNull();
    expect(screen.queryByLabelText('Devices')).toBeNull();
    // This is the parent of matched "Members sub menu"
    expect(screen.getByText('Members')).toBeVisible();
    expect(screen.getByText('Members')).toHaveClass('bx--side-nav__submenu-title');
    // The original item text is split in multiple tags so we
    // have to use a textContent search
    expect(screen.getByTextContent('Members sub menu')).toBeVisible();
  });

  it('filters to show matched leaf nodes at top level when user types in the search field', () => {
    render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Devices')).toBeVisible();
    expect(screen.getByText('Members')).toBeVisible();
    expect(screen.getByText('Members sub menu')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'Boa');
    expect(screen.getByTextContent('Boards')).toBeVisible();
    expect(screen.queryByLabelText('Devices')).toBeNull();
    expect(screen.queryByText('Members')).toBeNull();
    expect(screen.queryByText('Members sub menu')).toBeNull();
  });

  it('filters on deeply nested leaf nodes when user types in the search field', () => {
    render(<SideNav {...mockProps} hasSearch links={getDeeplyNestedlinks(jest.fn())} />);
    expect(screen.getByText('Grandchild Button')).toBeVisible();
    expect(screen.getByText('Grandchild Link')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'Grandchild Butt');
    expect(screen.getByTextContent('Grandchild Button')).toBeVisible();
    expect(screen.queryByText('Grandchild Link')).toBeNull();
  });

  it('filters using case insensitive search', () => {
    render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Devices')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'boards');
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.queryByLabelText('Devices')).toBeNull();
  });

  it('marks searched string in the filtered result', () => {
    const { container } = render(<SideNav {...mockProps} hasSearch />);

    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Devices')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'oard');

    expect(container.querySelector('mark').innerHTML).toEqual('oard');
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.queryByLabelText('Devices')).toBeNull();
  });

  it('shows "No matches found" message and no links when search result is empty', () => {
    render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Devices')).toBeVisible();
    expect(screen.getByText('Members')).toBeVisible();

    userEvent.type(screen.getByTestId('side-nav-search'), 'xxx');
    expect(screen.getByText(i18n.emptySearchText)).toBeVisible();
    expect(screen.queryByLabelText('Boards')).toBeNull();
    expect(screen.queryByLabelText('Devices')).toBeNull();
    expect(screen.queryByText('Members')).toBeNull();
  });

  it('removes parents from tab order in the search result', () => {
    render(<SideNav {...mockProps} hasSearch />);
    expect(screen.getByText('Members').closest('button')).not.toHaveAttribute('tabindex', '-1');

    userEvent.type(screen.getByTestId('side-nav-search'), 'ers sub');
    // This is the parent of matched "Members sub menu"
    expect(screen.getByText('Members').closest('button')).toHaveAttribute('tabindex', '-1');
  });

  it('it always renders pinned links in a separate list when hasSearch is true', () => {
    const homeClicked = jest.fn();
    const myLinks = [
      ...links,
      {
        icon: Home,
        isEnabled: true,
        isPinned: true,
        metaData: {
          onClick: homeClicked,
          tabIndex: 0,
          label: 'Home',
          element: 'button',
        },
        linkContent: 'Home',
        isActive: true,
      },
      {
        icon: Home,
        isEnabled: true,
        isPinned: true,
        metaData: {
          onClick: homeClicked,
          tabIndex: 0,
          label: 'Another pinned',
          element: 'a',
        },
        linkContent: 'Another pinned',
        isActive: true,
      },
    ];
    render(<SideNav links={myLinks} hasSearch />);
    expect(screen.getByLabelText('Home')).toBeVisible();
    expect(screen.getByLabelText('Home').closest('ul')).toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.getByLabelText('Another pinned')).toBeVisible();
    expect(screen.getByLabelText('Another pinned').closest('ul')).toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Boards').closest('ul')).not.toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );

    userEvent.type(screen.getByTestId('side-nav-search'), 'xxxx');
    expect(screen.getByLabelText('Home')).toBeVisible();
    expect(screen.getByLabelText('Home').closest('ul')).toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.getByLabelText('Another pinned')).toBeVisible();
    expect(screen.getByLabelText('Another pinned').closest('ul')).toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.queryByLabelText('Boards')).toBeNull();
  });

  it('it does not render pinned links in a separate list when hasSearch is false', () => {
    const homeClicked = jest.fn();
    const myLinks = [
      ...links,
      {
        icon: Home,
        isEnabled: true,
        isPinned: true,
        metaData: {
          onClick: homeClicked,
          tabIndex: 0,
          label: 'Home',
          element: 'button',
        },
        linkContent: 'Home',
        isActive: true,
      },
      {
        icon: Home,
        isEnabled: true,
        isPinned: true,
        metaData: {
          onClick: homeClicked,
          tabIndex: 0,
          label: 'Another pinned',
          element: 'a',
        },
        linkContent: 'Another pinned',
        isActive: true,
      },
    ];
    render(<SideNav links={myLinks} />);
    expect(screen.getByLabelText('Home')).toBeVisible();
    expect(screen.getByLabelText('Home').closest('ul')).not.toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.getByLabelText('Another pinned')).toBeVisible();
    expect(screen.getByLabelText('Another pinned').closest('ul')).not.toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
    expect(screen.getByLabelText('Boards')).toBeVisible();
    expect(screen.getByLabelText('Boards').closest('ul')).not.toHaveClass(
      `${iotPrefix}--side-nav__pinned-items`
    );
  });

  it('should show mostRecentLinks', () => {
    render(<SideNav {...mockProps} recentLinks={mostRecentLinks} />);

    expect(screen.queryByText('My recent applications')).toBeDefined();
    fireEvent.click(screen.getByText('My recent applications'));
    expect(screen.queryByText('App 1')).toBeDefined();
    expect(screen.queryByText('App 2')).toBeDefined();
  });
});
