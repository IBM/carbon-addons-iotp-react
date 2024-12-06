import React from 'react';
import { mount } from 'enzyme';
import { SkeletonText, Tabs, Tab } from '@carbon/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom/extend-expect';
import { settings } from '../../constants/Settings';
import Button from '../Button';

import PageTitleBar from './PageTitleBar';
import { commonPageTitleBarProps, pageTitleBarBreadcrumb } from './PageTitleBar.story';

const { prefix } = settings;

describe('PageTitleBar', () => {
  it('should be selectable via testId', () => {
    render(<PageTitleBar {...commonPageTitleBarProps} testId="PAGE_TITLE_BAR" />);
    expect(screen.getByTestId('PAGE_TITLE_BAR')).toBeDefined();
  });
  it('Renders common props as expected', () => {
    const wrapper = mount(<PageTitleBar {...commonPageTitleBarProps} />);
    expect(wrapper.find('.page-title-bar-title--text h2')).toHaveLength(1);
    expect(wrapper.find('.page-title-bar-description')).toHaveLength(1);
    expect(wrapper.find(Button)).toHaveLength(1);
  });

  it('renders breadcrumbs without current in default layout', () => {
    const wrapper = mount(
      <PageTitleBar {...commonPageTitleBarProps} breadcrumb={pageTitleBarBreadcrumb} />
    );
    expect(wrapper.find('.page-title-bar-breadcrumb')).toHaveLength(1);
    expect(wrapper.find('.page-title-bar-breadcrumb-current')).toHaveLength(0);
  });

  it('renders current breadcrumb if header is dynamic or condensed', () => {
    const { container, rerender } = render(
      <PageTitleBar
        {...commonPageTitleBarProps}
        breadcrumb={pageTitleBarBreadcrumb}
        headerMode="CONDENSED"
      />
    );

    expect(container.querySelectorAll('.page-title-bar-breadcrumb')).toHaveLength(1);
    expect(container.querySelectorAll('.page-title-bar-breadcrumb-current')).toHaveLength(1);

    rerender(
      <PageTitleBar
        {...commonPageTitleBarProps}
        breadcrumb={pageTitleBarBreadcrumb}
        headerMode="DYNAMIC"
      />
    );
    expect(container.querySelectorAll('.page-title-bar-breadcrumb')).toHaveLength(1);
    expect(container.querySelectorAll('.page-title-bar-breadcrumb-current')).toHaveLength(1);
  });

  it('renders tooltip node if collapsed', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        description={commonPageTitleBarProps.description}
        breadcrumb={pageTitleBarBreadcrumb}
        collapsed
      />
    );
    expect(wrapper.find(`.${prefix}--tooltip__label`)).toHaveLength(1);
    expect(wrapper.find('.page-title-bar-description')).toHaveLength(0);
  });

  it('renders content and tooltip as expected', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        description={commonPageTitleBarProps.description}
        breadcrumb={pageTitleBarBreadcrumb}
        collapsed
        content={
          <div>
            <h3>Some content for the page</h3>
            <p>More text</p>
          </div>
        }
      />
    );
    expect(wrapper.find(`.${prefix}--tooltip__label`)).toHaveLength(1);
    expect(wrapper.find('.page-title-bar-description')).toHaveLength(0);
    expect(wrapper.find('.page-title-bar-content')).toHaveLength(1);
  });

  it('Does not render tooltip when no description', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        headerMode="STICKY"
        breadcrumb={pageTitleBarBreadcrumb}
        collapsed
      />
    );
    expect(wrapper.find(`.${prefix}--tooltip__label`)).toHaveLength(0);
    expect(wrapper.find('.page-title-bar-description')).toHaveLength(0);
  });

  it('renders dynamic content containing tabs outside of the header element to allow proper sticky behavior', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        breadcrumb={pageTitleBarBreadcrumb}
        headerMode="DYNAMIC"
        content={
          <Tabs>
            <Tab label="Tab 1">
              <div>Content for first tab.</div>
            </Tab>
            <Tab label="Tab 2">
              <div>Content for second tab.</div>
            </Tab>
            <Tab label="Tab 3">
              <div>Content for third tab.</div>
            </Tab>
          </Tabs>
        }
      />
    );
    expect(wrapper.find('.page-title-bar > .page-title-bar-content')).toHaveLength(1);
    expect(wrapper.find('.page-title-bar-header > .page-title-bar-content')).toHaveLength(0);
  });

  it('renders dynamic content containing tabs inside of the header element to allow proper sticky behavior', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        breadcrumb={pageTitleBarBreadcrumb}
        headerMode="DYNAMIC"
        content={<div>other content</div>}
      />
    );
    expect(wrapper.find('.page-title-bar > .page-title-bar-content')).toHaveLength(0);
    expect(wrapper.find('.page-title-bar-header > .page-title-bar-content')).toHaveLength(1);
  });

  it('Does not render tooltip when no description with content', () => {
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        breadcrumb={pageTitleBarBreadcrumb}
        headerMode="CONDENSED"
        content={
          <Tabs>
            <Tab label="Tab 1">
              <div>Content for first tab.</div>
            </Tab>
            <Tab label="Tab 2">
              <div>Content for second tab.</div>
            </Tab>
            <Tab label="Tab 3">
              <div>Content for third tab.</div>
            </Tab>
          </Tabs>
        }
      />
    );
    expect(wrapper.find(`.${prefix}--tooltip__label`)).toHaveLength(0);
    expect(wrapper.find('.page-title-bar-description')).toHaveLength(0);
    expect(wrapper.find('.page-title-bar-content')).toHaveLength(1);
  });

  describe('Renders editable title as expected', () => {
    const onEdit = jest.fn();
    const wrapper = mount(
      <PageTitleBar
        title={commonPageTitleBarProps.title}
        description={commonPageTitleBarProps.description}
        editable
        onEdit={onEdit}
      />
    );

    it('Renders edit icon button', () => {
      expect(wrapper.find(Button)).toHaveLength(1);
    });

    it('Calls callback when edit is clicked', () => {
      wrapper.find(Button).simulate('click');
      expect(onEdit.mock.calls).toHaveLength(1);
    });
  });

  it('Renders loading state as expected', () => {
    const wrapper = mount(<PageTitleBar title={commonPageTitleBarProps.title} isLoading />);
    expect(wrapper.find(SkeletonText)).toHaveLength(1);
  });

  it('i18n string test', () => {
    const i18nTest = {
      editIconDescription: 'edit-icon-description',
      tooltipIconDescription: 'tooltip-icon-description',
    };

    const i18nDefault = PageTitleBar.defaultProps.i18n;
    render(
      <PageTitleBar title="testTitle" i18n={i18nTest} editable description="test" collapsed />
    );

    expect(screen.getByText(i18nTest.editIconDescription)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nTest.tooltipIconDescription)).toBeInTheDocument();

    expect(screen.queryByText(i18nDefault.editIconDescription)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(i18nDefault.tooltipIconDescription)).not.toBeInTheDocument();
  });

  it('renders upperActions and descriptions as react nodes', () => {
    render(
      <div style={{ paddingTop: '10rem', height: '200vh' }}>
        <PageTitleBar
          breadcrumb={[<a href="/">Home</a>, <a href="/">Type</a>, <span>Instance</span>]}
          title="testTitle"
          headerMode="DYNAMIC"
          collapsed
          description={<span data-testid="test-description">test</span>}
          testId="page-title-bar"
          upperActions={
            <button data-testid="upper-action-delete" type="button">
              Delete
            </button>
          }
        />
      </div>
    );
    userEvent.click(screen.getAllByLabelText('More information')[1]); // Click the tooltip from the collapsed description instead of the one from the breadcrumb item
    expect(screen.getByTestId('test-description')).toBeVisible();
    expect(screen.getByTestId('upper-action-delete')).toBeVisible();
  });

  it('does not render breadcrumbs when no given', () => {
    render(
      <div style={{ paddingTop: '10rem', height: '200vh' }}>
        <PageTitleBar breadcrumb={undefined} title="testTitle" headerMode="DYNAMIC" />
      </div>
    );
    expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent('testTitle');
    // the current page is rendered as a breadcrumb (even though not supplied) when in DYNAMIC mode
    // (so that it can be made visible in the collapsed view, so there will be one LI tag.
    expect(screen.getByLabelText('Breadcrumb').querySelectorAll('li')).toHaveLength(1);
    expect(screen.getByLabelText('Breadcrumb').querySelector('li')).toHaveClass(
      `page-title-bar-breadcrumb-current`
    );
  });

  it('checks if description tooltip is rendered next to current breadcrumb item when PageTitleBar is collapsed', async () => {
    render(
      <PageTitleBar
        breadcrumb={[
          <a href="/">BreadcrumbItem1</a>,
          <a href="/">BreadcrumbItem2</a>,
          <span>BreadcrumbItem3</span>,
        ]}
        description="Generic page title bar description"
        title="Page title"
        headerMode="CONDENSED"
        testId="breadcrumb-description-test"
      />
    );
    // Get current breadcrumb item and check its text content
    const currentBreadcrumbItem = within(screen.getByLabelText('Breadcrumb')).getAllByRole(
      'listitem'
    )[3];
    expect(currentBreadcrumbItem).toHaveTextContent('Page title');

    // Check if tooltip exists
    const descriptionTooltip = within(currentBreadcrumbItem).getAllByRole('button')[0];
    expect(descriptionTooltip).toHaveClass('bx--tooltip__trigger');

    // Click tooltip and check if description is displayed
    userEvent.click(within(currentBreadcrumbItem).getAllByRole('button')[0]);
    expect(screen.getByTestId('breadcrumb-description-test-tooltip')).toBeInTheDocument();
    expect(screen.getByText('Generic page title bar description')).toBeInTheDocument();
  });
});
