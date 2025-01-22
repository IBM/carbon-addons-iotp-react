import React from 'react';
import { action } from '@storybook/addon-actions';
import { select, text, boolean, number, withKnobs, optionsKnob } from '@storybook/addon-knobs';
import { Add, TrashCan, SettingsAdjust, Warning } from '@carbon/react/icons';
import { spacing05 } from '@carbon/layout';
import {
  Tabs,
  Tab,
  Search,
  Select,
  SelectItem,
  InlineLoading,
  TabList,
  TabPanels,
  TabPanel,
} from '@carbon/react';

import FullWidthWrapper from '../../internal/FullWidthWrapper';
import TileCatalogNew from '../TileCatalogNew/TileCatalogNew';
import { getTiles } from '../TileCatalogNew/TileCatalogNew.story';
import Button from '../Button';
import StatefulTable from '../Table/StatefulTable';
import { settings } from '../../constants/Settings';
import { getInitialState } from '../Table/Table.story.helpers';

import PageTitleBar from './PageTitleBar';
// import PageTitleBarREADME from './PageTitleBar.mdx'; carbon 11

const { prefix } = settings;
const initialTableState = getInitialState();

export const commonPageTitleBarProps = {
  title: 'Page title',
  description: 'Descriptive text about this page and what the user can or should do on it',
  extraContent: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ marginRight: spacing05 }}>
        <b>Last updated:</b> yesterday
      </span>
      <Button
        className="some-right-content"
        size="md"
        renderIcon={(props) => <Add {...props} />}
        onClick={action('click')}
      >
        Take an action
      </Button>
    </div>
  ),
};

export const PageTitleBarNodeTooltip = () => (
  <div>
    <p>Descriptive text about this page and what the user can or should do on it </p>
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        'padding-top': spacing05,
      }}
    >
      <a href="/">Link one</a>
      <Button renderIcon={(props) => <Add size={24} {...props} />} onClick={action('click')}>
        Take an action
      </Button>
    </div>
  </div>
);

export const pageTitleBarBreadcrumb = [
  <a href="/">Home</a>,
  <a href="/">Type</a>,
  <span>Instance</span>,
];
const breadcrumbKnobOptions = {
  none: undefined,
  breadcrumb: pageTitleBarBreadcrumb,
};
const breadcrumbDefaultValue = pageTitleBarBreadcrumb;

export default {
  title: '1 - Watson IoT/Page header/PageTitleBar',
  decorators: [withKnobs, (storyFn) => <FullWidthWrapper>{storyFn()}</FullWidthWrapper>],

  parameters: {
    component: PageTitleBar,
    // docs: {
    //   page: PageTitleBarREADME,
    // }, //carbon 11
  },

  excludeStories: ['commonPageTitleBarProps', 'pageTitleBarBreadcrumb', 'PageTitleBarNodeTooltip'],
};

export const Base = () => {
  return (
    <div style={{ minHeight: '200vh' }}>
      <PageTitleBar
        title={text('title', commonPageTitleBarProps.title)}
        headerMode={select('headerMode', ['CONDENSED', 'DYNAMIC', 'STATIC', 'STICKY'], 'STATIC')}
        description={text('description', '')}
        breadcrumb={optionsKnob('breadcrumb', breadcrumbKnobOptions, breadcrumbDefaultValue, {
          display: 'select',
        })}
        stickyHeaderOffset={number('stickyHeaderOffset', 0)}
        collapsed={boolean('collapsed', false)}
        editable={boolean('editable', false)}
        isLoading={boolean('isLoading', false)}
        forceContentOutside={boolean('forceContentOutside', false)}
        content={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StatefulTable {...initialTableState} data={initialTableState.data.slice(0, 5)} />
            <StatefulTable {...initialTableState} data={initialTableState.data.slice(0, 5)} />
          </div>
        }
        stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
      />
    </div>
  );
};

Base.storyName = 'base';

export const WithTooltipDescriptionWithNode = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      description={<PageTitleBarNodeTooltip />}
      title={text('title', commonPageTitleBarProps.title)}
      headerMode={select('headerMode', ['CONDENSED', 'DYNAMIC', 'STATIC', 'STICKY'], 'STATIC')}
      breadcrumb={optionsKnob('breadcrumb', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      stickyHeaderOffset={number('stickyHeaderOffset', 0)}
      collapsed={boolean('collapsed', false)}
      editable={boolean('editable', false)}
      isLoading={boolean('isLoading', false)}
      forceContentOutside={boolean('forceContentOutside', false)}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithTooltipDescriptionWithNode.storyName = 'with tooltip description with node';

export const WithStatusDescriptionAndCrumbs = () => (
  <div style={{ height: '150vh' }}>
    <style>
      {`
      .${prefix}--tooltip__content .${prefix}--inline-loading__text {
        color: white
      }

      .${prefix}--tooltip__content .${prefix}--inline-loading__checkmark-container path + path {
        fill: white;
        opacity: 1
      }
    `}
    </style>
    <PageTitleBar
      title={text('title', 'ZH002')}
      description={<InlineLoading status="finished" description="Running" />}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      collapsed={boolean('collapse description', false)}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'STATIC')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithStatusDescriptionAndCrumbs.storyName = 'with status description and breadcrumbs';

export const WithEditableTitleBar = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      title={text('title', commonPageTitleBarProps.title)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, undefined, {
        display: 'select',
      })}
      description={text('description', commonPageTitleBarProps.description)}
      collapsed={boolean('collapse description', false)}
      editable={boolean('editable', true)}
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithEditableTitleBar.storyName = 'with editable title bar and subtitle';

export const WithSelect = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      stickyHeaderOffset={number('sticky header offset', 0)}
      title={text('title', 'A page title could be really long, you never know')}
      description={text('description', commonPageTitleBarProps.description)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      collapsed={boolean('collapse description', false)}
      editable={boolean('editable', false)}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'DYNAMIC')}
      extraContent={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            renderIcon={(props) => <SettingsAdjust {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Select hideLabel id="select-1" defaultValue="placeholder-item">
            <SelectItem disabled hidden value="placeholder-item" text="Choose an option" />
            <SelectItem value="option-3" text="Option 3" />
            <SelectItem value="option-4" text="Option 4" />
          </Select>
          <Button
            renderIcon={(props) => <Add {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button
            renderIcon={(props) => <TrashCan {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Remove"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button onClick={action('click')} size="md">
            Take an action
          </Button>
        </div>
      }
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithSelect.storyName = 'with select action and an overflowing page title';

export const WithEverything = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      stickyHeaderOffset={number('sticky header offset', 0)}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'STATIC')}
      title={text('title', commonPageTitleBarProps.title)}
      description={text('description', commonPageTitleBarProps.description)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      collapsed={boolean('collapse description', false)}
      editable={boolean('editable', true)}
      extraContent={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            renderIcon={(props) => <SettingsAdjust {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Search
            id="search-1"
            placeholder="Search"
            onChange={action('search')}
            size="md"
            labelText="Search"
          />
          <Button
            renderIcon={(props) => <Add {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button
            renderIcon={(props) => <TrashCan {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Remove"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button onClick={action('click')} size="md">
            Take an action
          </Button>
        </div>
      }
      content={
        <Tabs style={{ marginLeft: '-16px', marginRight: '-16px' }}>
          <TabList aria-label="List of tabs">
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div>Content for first tab.</div>
            </TabPanel>
            <TabPanel>
              <div>Content for second tab.</div>
            </TabPanel>
            <TabPanel>
              <div>Content for third tab.</div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      }
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithEverything.storyName = 'with breadcrumbs, actions, and tabs';

export const WithCondensedHeader = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      stickyHeaderOffset={number('sticky header offset', 0)}
      title={text('title', commonPageTitleBarProps.title)}
      description={text('description', commonPageTitleBarProps.description)}
      collapsed={boolean('collapse description', true)}
      editable={boolean('editable', false)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'CONDENSED')}
      extraContent={
        <div style={{ display: 'flex' }}>
          <Button size="md" kind="secondary">
            Secondary button
          </Button>
          <Button size="md" kind="primary">
            Primary button
          </Button>
        </div>
      }
      content={
        <div
          style={{
            height: '100rem',
            marginLeft: '-16px',
            marginRight: '-16px',
            marginTop: '-16px',
          }}
        >
          <TileCatalogNew tiles={getTiles(3)} numColumns={2} numRows={2} />
        </div>
      }
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithCondensedHeader.storyName = 'with condensed with primary + secondary buttons';

export const WithCustomRenderFunction = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      title={commonPageTitleBarProps.title}
      renderTitleFunction={(title) => (
        <h2>
          {title} <Warning size={24} color="red" />
        </h2>
      )}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      extraContent={commonPageTitleBarProps.extraContent}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithCustomRenderFunction.storyName = 'with custom render function';

export const WithDynamicScrolling = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      stickyHeaderOffset={number('sticky header offset', 0)}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'DYNAMIC')}
      title={text('title', commonPageTitleBarProps.title)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      description={text('description', commonPageTitleBarProps.description)}
      collapsed={boolean('collapse description', false)}
      editable={boolean('editable')}
      extraContent={
        <div style={{ display: 'flex' }}>
          <Button
            renderIcon={(props) => <Add {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button
            renderIcon={(props) => <TrashCan {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Remove"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button onClick={action('click')} size="md">
            Take an action
          </Button>
        </div>
      }
      content={
        <div
          style={{
            height: '100rem',
            marginLeft: '-16px',
            marginRight: '-16px',
            marginTop: '-16px',
          }}
        >
          <TileCatalogNew tiles={getTiles(3)} numColumns={2} numRows={2} />
        </div>
      }
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithDynamicScrolling.storyName = 'with dynamic with breadcrumbs, actions, and content';

WithDynamicScrolling.info = {
  text: `with dynamic scrolling, upper actions, and buttons the buttons should transition and sit next to the actions when the page header is condensed`,
};

export const WithDynamicScrollingAndTabs = () => (
  <div style={{ height: '150vh' }}>
    <PageTitleBar
      stickyHeaderOffset={number('sticky header offset', 0)}
      headerMode={select('headerMode', ['DYNAMIC', 'STATIC', 'STICKY', 'CONDENSED'], 'DYNAMIC')}
      title={text('title', commonPageTitleBarProps.title)}
      breadcrumb={optionsKnob('breadcrumbs', breadcrumbKnobOptions, breadcrumbDefaultValue, {
        display: 'select',
      })}
      description={text('description', commonPageTitleBarProps.description)}
      collapsed={boolean('collapse description', false)}
      editable={boolean('editable', true)}
      extraContent={
        <div style={{ display: 'flex' }}>
          <Button
            renderIcon={(props) => <Add {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Add"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button
            renderIcon={(props) => <TrashCan {...props} />}
            onClick={action('click')}
            size="md"
            hasIconOnly
            iconDescription="Remove"
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="center"
          />
          <Button onClick={action('click')} size="md">
            Take an action
          </Button>
        </div>
      }
      content={
        <Tabs>
         <TabList aria-label="List of tabs">
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{ height: '100rem', marginTop: '-16px' }}>
                <TileCatalogNew tiles={getTiles(3)} numColumns={2} numRows={2} />
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{ height: '100rem', marginTop: '-16px' }}>
                <TileCatalogNew tiles={getTiles(5)} numColumns={2} numRows={2} />
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{ height: '100rem', marginTop: '-16px' }}>
                <TileCatalogNew tiles={getTiles(5)} numColumns={2} numRows={2} />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      }
      onEdit={action('edit')}
      stackBreadcrumbsWithTabs={boolean('stackBreadcrumbsWithTabs', false)}
    />
  </div>
);

WithDynamicScrollingAndTabs.storyName = 'with dynamic with breadcrumbs, actions, and tabs';

WithDynamicScrollingAndTabs.parameters = {
  info: {
    text: `Note: We need to set the sticky offset here to 0 (from the default 3rem) because storybook sets everything relative to their container with 3rem padding.
      The dynamicTransitionOffset isn't needed here, because the default 3rem is relative to the overall window scrollY and handles the storybook padding`,
  },
};
