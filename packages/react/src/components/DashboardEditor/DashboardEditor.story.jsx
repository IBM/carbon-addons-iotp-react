import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text, object, array } from '@storybook/addon-knobs';

import { DataScientistIcon } from '../../icons/components';
import { EmptystateDefaultIcon } from '../../icons/static';
import { NumberInput } from '../NumberInput';
import { TextInput } from '../TextInput';
import Card from '../Card/Card';
import { Link } from '../Link';
import { InlineNotification } from '../Notification';
import { OverflowMenu } from '../OverflowMenu';
import { OverflowMenuItem } from '../OverflowMenuItem';
import { Toggle } from '../Toggle';
import { Dropdown } from '../Dropdown';
import assemblyline from '../ImageGalleryModal/images/assemblyline.jpg';
import floow_plan from '../ImageGalleryModal/images/floow_plan.png'; // eslint-disable-line camelcase
import manufacturing_plant from '../ImageGalleryModal/images/Manufacturing_plant.png'; // eslint-disable-line camelcase
import extra_wide_image from '../ImageGalleryModal/images/extra-wide-image.png'; // eslint-disable-line camelcase
import robot_arm from '../ImageGalleryModal/images/robot_arm.png'; // eslint-disable-line camelcase
import tankmodal from '../ImageGalleryModal/images/tankmodal.png';
import turbines from '../ImageGalleryModal/images/turbines.png';
import large from '../ImageGalleryModal/images/large.png';
import large_portrait from '../ImageGalleryModal/images/large_portrait.png'; // eslint-disable-line camelcase
import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';
import SimpleList from '../List/SimpleList/SimpleList';
import { CARD_TYPES } from '../../constants/LayoutConstants';

import DashboardEditorDefaultCardRenderer from './DashboardEditorDefaultCardRenderer';
import DashboardEditor from './DashboardEditor';

export const Experimental = () => <StoryNotice componentName="DashboardEditor" experimental />;
Experimental.storyName = experimentalStoryTitle;

const commonActions = {
  onEditDataItem: (cardConfig, dataItem) =>
    dataItem.hasStreamingMetricEnabled
      ? [
          { id: 'none', text: 'None' },
          { id: 'last', text: 'Last' },
        ]
      : [],
  dataSeriesFormActions: {
    hasAggregationsDropDown: (editDataItem) =>
      editDataItem?.dataItemType !== 'DIMENSION' && editDataItem?.type !== 'TIMESTAMP',
    onAddAggregations: action('onAddAggregations'),
    hasDataFilterDropdown: (card) =>
      card.type !== CARD_TYPES.TABLE && card.type !== CARD_TYPES.IMAGE,
  },
};

export const images = [
  {
    id: 'assemblyline',
    src: assemblyline,
    alt: 'assemblyline',
    title: `custom title assemblyline that is very long a and must be managed.
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
      ad minim veniam.`,
  },
  { id: 'floow_plan', src: floow_plan, alt: 'floow plan' },
  {
    id: 'manufacturing_plant',
    src: manufacturing_plant,
    alt: 'manufacturing plant',
  },
  { id: 'robot_arm', src: robot_arm, alt: 'robot arm' },
  { id: 'tankmodal', src: tankmodal, alt: 'tankmodal' },
  { id: 'turbines', src: turbines, alt: 'turbines' },
  { id: 'extra-wide-image', src: extra_wide_image, alt: 'extra wide image' },
  { id: 'large', src: large, alt: 'large image' },
  { id: 'large_portrait', src: large_portrait, alt: 'large image portrait' },
];

const mockDataItems = [
  {
    dataItemId: 'torque_max',
    dataSourceId: 'torque_max',
    label: 'Torque Max',
    aggregationMethod: 'max',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
    grain: 'hourly',
  },
  {
    dataItemId: 'torque_min',
    dataSourceId: 'torque_min',
    label: 'Torque Min',
    aggregationMethod: 'min',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
    grain: 'hourly',
  },
  {
    dataItemId: 'torque_mean',
    dataSourceId: 'torque_mean',
    label: 'Torque Mean',
    aggregationMethod: 'mean',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
    grain: 'hourly',
  },
  {
    dataItemId: 'torque',
    dataSourceId: 'torque',
    label: 'Torque',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  },
  {
    dataItemId: 'temperature',
    dataSourceId: 'temperature',
    label: 'Temperature',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  },
  {
    dataItemId: 'pressure',
    dataSourceId: 'pressure',
    label: 'Pressure',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  },
  {
    dataItemId: 'firmware',
    dataItemType: 'DIMENSION',
    dataSourceId: 'firmware',
    label: 'firmware',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
    ],
  },
  {
    dataItemId: 'manufacturer',
    dataItemType: 'DIMENSION',
    dataSourceId: 'manufacturer',
    label: 'manufacturer',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
    ],
  },
  {
    dataItemId: 'v2pressure',
    dataSourceId: 'v2pressure',
    label: 'V2 Pressure',
    hasStreamingMetricEnabled: true,
  },
];

export default {
  title: '2 - Watson IoT Experimental/☢️ DashboardEditor',
  decorators: [withKnobs],

  parameters: {
    component: DashboardEditor,
  },
  excludeStories: ['images'],
};

export const Default = () => (
  <DashboardEditor
    title={text('title', 'My dashboard')}
    getValidDataItems={() => mockDataItems}
    dataItems={mockDataItems}
    availableImages={images}
    i18n={{
      headerEditTitleButton: 'Edit title updated',
    }}
    onAddImage={action('onAddImage')}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    actions={commonActions}
    onImageDelete={action('onImageDelete')}
    onLayoutChange={action('onLayoutChange')}
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    availableDimensions={{
      deviceid: ['73000', '73001', '73002'],
      manufacturer: ['rentech', 'GHI Industries'],
    }}
    supportedCardTypes={array('supportedCardTypes', [
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
      'CUSTOM',
    ])}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    isLoading={boolean('isLoading', false)}
    onCardSelect={action('onCardSelect')}
  />
);

Default.storyName = 'default';

export const WithInitialValue = () => (
  <DashboardEditor
    title="Custom dashboard"
    dataItems={mockDataItems.filter((item) => !item.aggregationMethod)}
    initialValue={{
      cards: [
        {
          id: 'Table',
          title: 'Table card',
          size: 'LARGE',
          type: 'TABLE',
          content: {
            columns: [
              {
                dataItemId: 'temperature',
                dataSourceId: 'temperature',
                label: 'Temperature',
              },
              {
                dataItemId: 'pressure',
                dataSourceId: 'pressure',
                label: 'Pressure',
              },
            ],
          },
        },
        {
          id: 'Custom',
          title: 'Custom rendered card',
          type: 'CUSTOM',
          size: 'MEDIUM',
          content: () => 'custom content function',
          value: 35,
        },
        {
          id: 'Standard',
          title: 'Default rendered card',
          type: 'VALUE',
          size: 'MEDIUM',
          content: {
            attributes: [
              {
                dataItemId: 'torque',
                dataSourceId: 'torque',
                unit: '%',
                label: 'Torque',
              },
              {
                dataItemId: 'pressure',
                dataSourceId: 'pressure',
                unit: 'lb',
                label: 'Pressure',
              },
            ],
          },
        },
        {
          id: 'Timeseries',
          title: 'Timeseries',
          size: 'MEDIUM',
          type: 'TIMESERIES',
          content: {
            series: [
              {
                dataItemId: 'temperature',
                label: 'Temperature',
                dataSourceId: 'temperature',
              },
              {
                dataItemId: 'pressure',
                label: 'Pressure',
                dataSourceId: 'pressure',
              },
            ],
            xLabel: 'Time',
            yLabel: 'Temperature (˚F)',
            includeZeroOnXaxis: true,
            includeZeroOnYaxis: true,
            timeDataSourceId: 'timestamp',
            addSpaceOnEdges: 1,
          },
          timeRange: 'thisWeek',
          dataSource: {
            range: {
              interval: 'week',
              count: -1,
              type: 'periodToDate',
            },
          },
        },
        {
          id: 'Bar',
          title: 'Bar',
          size: 'MEDIUM',
          type: 'BAR',
          content: {
            type: 'SIMPLE',
            layout: 'VERTICAL',
            series: [
              {
                dataItemId: 'pressure',
                dataSourceId: 'pressure',
                label: 'Pressure',
                color: '#6929c4',
              },
            ],
            timeDataSourceId: 'timestamp',
          },
        },
        {
          id: 'Custom-2',
          title: 'Custom rendered card',
          type: 'CUSTOM',
          size: 'MEDIUM',
          content: <div>custom react element content</div>,
          value: 35,
        },
      ],
      layouts: {
        lg: [
          { i: 'Table', x: 0, y: 0 },
          { i: 'Custom', x: 8, y: 0 },
          {
            i: 'Standard',
            x: 12,
            y: 0,
          },
          {
            i: 'Timeseries',
            x: 1,
            y: 4,
          },
          {
            i: 'Bar',
            x: 1,
            y: 8,
          },
          {
            i: 'Custom-2',
            x: 0,
            y: 12,
          },
        ],
        md: [
          { i: 'Table', x: 0, y: 0 },
          { i: 'Custom', x: 0, y: 4 },
          {
            i: 'Standard',
            x: 0,
            y: 6,
          },
          {
            i: 'Timeseries',
            x: 0,
            y: 8,
          },
          {
            i: 'Bar',
            x: 0,
            y: 10,
          },
          {
            i: 'Custom-2',
            x: 0,
            y: 12,
          },
        ],
        sm: [
          { i: 'Table', x: 0, y: 0 },
          { i: 'Custom', x: 4, y: 0 },
          {
            i: 'Standard',
            x: 4,
            y: 2,
          },
          {
            i: 'Timeseries',
            x: 1,
            y: 4,
          },
          {
            i: 'Bar',
            x: 1,
            y: 6,
          },
          {
            i: 'Custom-2',
            x: 0,
            y: 8,
          },
        ],
      },
    }}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    onLayoutChange={action('onLayoutChange')}
    hasAggregationsDropDown={action('hasAggregationsDropDown')}
    supportedCardTypes={[
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
    ]}
    i18n={{
      CUSTOM: 'Custom',
    }}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    isLoading={boolean('isLoading', false)}
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    actions={commonActions}
  />
);

WithInitialValue.storyName = 'with initialValue';

export const WithEditableTitle = () => <DashboardEditor title="Custom dashboard" isTitleEditable />;

WithEditableTitle.namd = 'with editable title';

export const SummaryDashboardWithInitialValue = () => (
  <div style={{ height: 'calc(100vh - 6rem)' }}>
    <DashboardEditor
      title="Custom dashboard"
      // summary dashboards need to pass their grain to the items
      dataItems={mockDataItems.map((item) => ({ ...item, grain: 'Weekly' }))}
      availableDimensions={{
        firmware: ['1.2', '1.3'],
        axes: [1, 2, 3],
        deviceid: ['73004', '73000', '73001'],
        manufacturer: ['Rentech', 'Manu Inc'],
      }}
      isSummaryDashboard
      initialValue={{
        cards: [
          {
            id: 'Table',
            title: 'Table card',
            size: 'LARGE',
            type: 'TABLE',
            content: {
              columns: [
                {
                  dataItemId: 'temperature',
                  dataSourceId: 'temperature',
                  label: 'Temperature',
                },
                {
                  dataItemId: 'pressure',
                  dataSourceId: 'pressure',
                  label: 'Pressure',
                },
              ],
            },
          },
          {
            id: 'Custom',
            title: 'Custom rendered card',
            type: 'CUSTOM',
            size: 'MEDIUM',
            value: 35,
          },
          {
            id: 'Standard',
            title: 'Value card',
            type: 'VALUE',
            size: 'MEDIUM',
            content: {
              attributes: [
                {
                  dataItemId: 'torque_min',
                  dataSourceId: 'torque_min',
                  label: 'Torque Min',
                },
              ],
            },
          },
          {
            id: 'Timeseries',
            title: 'Timeseries',
            size: 'MEDIUM',
            type: 'TIMESERIES',
            content: {
              series: [
                {
                  dataItemId: 'temperature',
                  label: 'Temperature',
                  dataSourceId: 'temperature',
                },
                {
                  dataItemId: 'pressure',
                  label: 'Pressure',
                  dataSourceId: 'pressure',
                },
              ],
              xLabel: 'Time',
              yLabel: 'Temperature (˚F)',
              includeZeroOnXaxis: true,
              includeZeroOnYaxis: true,
              timeDataSourceId: 'timestamp',
              addSpaceOnEdges: 1,
            },
            timeRange: 'thisWeek',
            dataSource: {
              range: {
                interval: 'week',
                count: -1,
                type: 'periodToDate',
              },
            },
          },
          {
            id: 'Bar',
            title: 'Bar',
            size: 'MEDIUM',
            type: 'BAR',
            content: {
              type: 'SIMPLE',
              layout: 'VERTICAL',
              series: [
                {
                  dataItemId: 'pressure',
                  dataSourceId: 'pressure',
                  label: 'Pressure',
                  color: '#6929c4',
                },
              ],
              timeDataSourceId: 'timestamp',
            },
          },
        ],
        layouts: {
          lg: [
            { i: 'Table', x: 0, y: 0 },
            { i: 'Custom', x: 8, y: 0 },
            {
              i: 'Standard',
              x: 8,
              y: 2,
            },
            {
              i: 'Timeseries',
              x: 0,
              y: 4,
            },
            {
              i: 'Bar',
              x: 0,
              y: 6,
            },
          ],
          md: [
            { i: 'Table', x: 0, y: 0 },
            { i: 'Custom', x: 0, y: 4 },
            {
              i: 'Standard',
              x: 0,
              y: 6,
            },
            {
              i: 'Timeseries',
              x: 0,
              y: 8,
            },
            {
              i: 'Bar',
              x: 0,
              y: 10,
            },
          ],
          sm: [
            { i: 'Table', x: 0, y: 0 },
            { i: 'Custom', x: 4, y: 0 },
            {
              i: 'Standard',
              x: 4,
              y: 2,
            },
            {
              i: 'Timeseries',
              x: 0,
              y: 4,
            },
            {
              i: 'Bar',
              x: 4,
              y: 4,
            },
          ],
        },
      }}
      onImport={action('onImport')}
      onExport={action('onExport')}
      onDelete={action('onDelete')}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
      onLayoutChange={action('onLayoutChange')}
      onEditDataItems={action('onEditDataItems')}
      supportedCardTypes={[
        'TIMESERIES',
        'SIMPLE_BAR',
        'GROUPED_BAR',
        'STACKED_BAR',
        'VALUE',
        'IMAGE',
        'TABLE',
      ]}
      i18n={{
        cardType_CUSTOM: 'Custom',
      }}
      headerBreadcrumbs={[
        <Link href="www.ibm.com">Dashboard library</Link>,
        <Link href="www.ibm.com">Favorites</Link>,
      ]}
      isLoading={boolean('isLoading', false)}
      isSubmitDisabled={boolean('isSubmitDisabled', false)}
      isSubmitLoading={boolean('isSubmitLoading', false)}
      actions={commonActions}
    />
  </div>
);

SummaryDashboardWithInitialValue.storyName = 'Summary Dashboard with initialValue';

export const WithCustomOnCardChange = () => (
  <DashboardEditor
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    title="Custom dashboard"
    dataItems={mockDataItems}
    initialValue={{
      cards: [
        {
          id: 'Timeseries',
          title: 'Untitled',
          size: 'MEDIUMWIDE',
          type: 'TIMESERIES',
          content: {
            series: [
              {
                label: 'Temperature',
                dataSourceId: 'temperature',
              },
              {
                label: 'Pressure',
                dataSourceId: 'pressure',
              },
            ],
            xLabel: 'Time',
            yLabel: 'Temperature (˚F)',
            includeZeroOnXaxis: true,
            includeZeroOnYaxis: true,
            timeDataSourceId: 'timestamp',
            addSpaceOnEdges: 1,
          },
          interval: 'day',
        },
      ],
      layouts: {},
    }}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    onCardChange={(card) => {
      action('onCardChange');
      return card;
    }}
    onLayoutChange={action('onLayoutChange')}
    supportedCardTypes={[
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
    ]}
    i18n={{
      CUSTOM: 'Custom',
    }}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    isLoading={boolean('isLoading', false)}
    actions={commonActions}
  />
);

WithCustomOnCardChange.storyName = 'with custom onCardChange';

export const WithNotifications = () => (
  <DashboardEditor
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    title={text('title', 'My dashboard')}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    supportedCardTypes={array('supportedCardTypes', [
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
      'CUSTOM',
    ])}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    notification={
      <>
        <InlineNotification
          title="This is the dashboard editor"
          subtitle="Use the side panel to create or edit cards"
          kind="info"
          lowContrast
        />
        <InlineNotification
          title="Import successful"
          subtitle="The JSON import was successful"
          kind="success"
          lowContrast
        />
        <InlineNotification
          title="Data error"
          subtitle="The image provided was not able to be fetched"
          kind="error"
          lowContrast
        />
      </>
    }
    isLoading={boolean('isLoading', false)}
    actions={commonActions}
  />
);

WithNotifications.storyName = 'with notifications';

export const WithBreakpointSwitcher = () => (
  <div style={{ height: 'calc(100vh - 6rem)' }}>
    <DashboardEditor
      isSubmitDisabled={boolean('isSubmitDisabled', false)}
      isSubmitLoading={boolean('isSubmitLoading', false)}
      title={text('title', 'My dashboard')}
      onAddImage={action('onAddImage')}
      onImport={action('onImport')}
      onExport={action('onExport')}
      onDelete={action('onDelete')}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
      onLayoutChange={action('onLayoutChange')}
      supportedCardTypes={array('supportedCardTypes', [
        'TIMESERIES',
        'SIMPLE_BAR',
        'GROUPED_BAR',
        'STACKED_BAR',
        'VALUE',
        'IMAGE',
        'TABLE',
      ])}
      headerBreadcrumbs={[
        <Link href="www.ibm.com">Dashboard library</Link>,
        <Link href="www.ibm.com">Favorites</Link>,
      ]}
      breakpointSwitcher={{ enabled: true }}
      isLoading={boolean('isLoading', false)}
      actions={commonActions}
    />
  </div>
);

WithBreakpointSwitcher.storyName = 'with breakpoint switcher';

export const CustomCardPreviewRenderer = () => (
  <DashboardEditor
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    title="Custom dashboard"
    initialValue={object('initialValue', {
      cards: [
        {
          id: 'Custom',
          title: 'Custom rendered card',
          type: 'CUSTOM',
          size: 'MEDIUM',
          value: 35,
        },
        {
          id: 'Standard',
          title: 'Default rendered card',
          type: 'VALUE',
          size: 'MEDIUM',
          content: {
            attributes: [
              {
                dataSourceId: 'key1',
                unit: '%',
                label: 'Key 1',
              },
              {
                dataSourceId: 'key2',
                unit: 'lb',
                label: 'Key 2',
              },
            ],
          },
        },
      ],
      layouts: {},
    })}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    onLayoutChange={action('onLayoutChange')}
    supportedCardTypes={array('supportedCardTypes', [
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
      'CUSTOM',
    ])}
    i18n={{
      CUSTOM: 'Custom',
    }}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    renderCardPreview={(
      cardConfig, // eslint-disable-line no-unused-vars
      // the original card config, mostly useless, would remove if I could
      cardProps, // the updated card props with the correct position etc
      // These props are not used, but they could be to create your own implementation
      onSelectCard, // eslint-disable-line no-unused-vars
      onDuplicateCard, // eslint-disable-line no-unused-vars
      onRemoveCard, // eslint-disable-line no-unused-vars
      isSelected, // eslint-disable-line no-unused-vars
      onShowImageGallery, // eslint-disable-line no-unused-vars
      availableDimensions
    ) => {
      return cardProps.type === 'CUSTOM' ? (
        <Card key={cardProps.id} isEditable {...cardProps}>
          <div style={{ padding: '1rem' }}>
            This content is rendered by the renderCardPreview function. The &quot;value&quot;
            property on the card will be rendered here:
            <h3>{cardProps.value}</h3>
          </div>

          {
            // if you want the resizable handles you need to render the children
            cardProps.children
          }
        </Card>
      ) : (
        // if not a custom card you can use the default card renderer, but you can translate and add your own changes to the card JSON
        <DashboardEditorDefaultCardRenderer
          card={{ ...cardProps, title: `my custom title: ${cardProps.title}` }}
          key={cardProps.id}
          availableDimensions={availableDimensions}
        />
      );
    }}
    isLoading={boolean('isLoading', false)}
    actions={commonActions}
  />
);

CustomCardPreviewRenderer.storyName = 'custom card preview renderer';

export const CustomHeaderRenderer = () => (
  <div style={{ height: 'calc(100vh - 3rem)', marginRight: '-3rem' }}>
    <DashboardEditor
      renderHeader={() => <h1>Custom Header</h1>}
      isLoading={boolean('isLoading', false)}
    />
  </div>
);

CustomHeaderRenderer.storyName = 'custom header renderer';

export const isLoading = () => (
  <div style={{ height: 'calc(100vh - 3rem)', marginRight: '-3rem' }}>
    <DashboardEditor isLoading={boolean('isLoading', true)} />
  </div>
);

isLoading.storyName = 'isLoading';

export const I18N = () => (
  <DashboardEditor
    title={text('title', 'My dashboard')}
    getValidDataItems={() => mockDataItems}
    dataItems={mockDataItems}
    availableImages={images}
    onAddImage={action('onAddImage')}
    onImport={action('onImport')}
    onExport={action('onExport')}
    onDelete={action('onDelete')}
    onCancel={action('onCancel')}
    onSubmit={action('onSubmit')}
    onImageDelete={action('onImageDelete')}
    onLayoutChange={action('onLayoutChange')}
    isSubmitDisabled={boolean('isSubmitDisabled', false)}
    isSubmitLoading={boolean('isSubmitLoading', false)}
    availableDimensions={{
      deviceid: ['73000', '73001', '73002'],
      manufacturer: ['rentech', 'GHI Industries'],
    }}
    supportedCardTypes={array('supportedCardTypes', [
      'TIMESERIES',
      'SIMPLE_BAR',
      'GROUPED_BAR',
      'STACKED_BAR',
      'VALUE',
      'IMAGE',
      'TABLE',
      'CUSTOM',
    ])}
    i18n={{
      // dashboard header
      headerEditTitleButton: 'headerEditTitleButton',
      headerImportButton: 'headerImportButton',
      headerExportButton: 'headerExportButton',
      headerCancelButton: 'headerCancelButton',
      headerSubmitButton: 'headerSubmitButton',
      headerDeleteButton: 'headerDeleteButton',
      headerFitToScreenButton: 'headerFitToScreenButton',
      headerLargeButton: 'headerLargeButton',
      headerMediumButton: 'headerMediumButton',
      headerSmallButton: 'headerSmallButton',
      layoutInfoLg: 'layoutInfoLg',
      layoutInfoMd: 'layoutInfoMd',
      layoutInfoSm: 'layoutInfoSm',

      // card strings
      noDataLabel: 'noDataLabel',
      defaultCardTitle: 'defaultCardTitle',
      cloneCardLabel: 'cloneCardLabel',
      deleteCardLabel: 'deleteCardLabel',
      titlePlaceholderText: 'titlePlaceholderText',
      titleEditableHintText: 'titleEditableHintText',

      // card gallery
      galleryHeader: 'galleryHeader',
      addCardButton: 'addCardButton',
      openGalleryButton: 'openGalleryButton',
      closeGalleryButton: 'closeGalleryButton',
      openJSONButton: 'openJSONButton',
      searchPlaceholderText: 'searchPlaceholderText',
      TIMESERIES: 'TIMESERIES',
      SIMPLE_BAR: 'SIMPLE_BAR',
      GROUPED_BAR: 'GROUPED_BAR',
      STACKED_BAR: 'STACKED_BAR',
      VALUE: 'VALUE',
      IMAGE: 'IMAGE',
      TABLE: 'TABLE',
      LIST: 'LIST',

      // card form
      openEditorButton: 'openEditorButton',
      contentTabLabel: 'contentTabLabel',
      settingsTabLabel: 'settingsTabLabel',
      cardSize_SMALL: 'cardSize_small',
      cardSize_SMALLWIDE: 'cardSize_smallwide',
      cardSize_MEDIUM: 'cardSize_medium',
      cardSize_MEDIUMTHIN: 'cardSize_mediumthin',
      cardSize_MEDIUMWIDE: 'cardSize_medium wide',
      cardSize_LARGE: 'cardSize_large',
      cardSize_LARGETHIN: 'cardSize_largethin',
      cardSize_LARGEWIDE: 'cardSize_largewide',
      chartType_BAR: 'chartType_bar',
      chartType_LINE: 'chartType_line',
      barChartType_SIMPLE: 'barChartType_simple',
      barChartType_GROUPED: 'barChartType_grouped',
      barChartType_STACKED: 'barChartType_stacked',
      barChartLayout_HORIZONTAL: 'barChartType_horizontal',
      barChartLayout_VERTICAL: 'barChartType_vertical',
      errorTitle: 'errorTitle',
      modalTitle: 'modalTitle',
      modalLabel: 'modalLabel',
      modalHelpText: 'modalHelpText',
      modalIconDescription: 'modalIconDescription',
      expandBtnLabel: 'expandBtnLabel',
      modalPrimaryButtonLabel: 'modalPrimaryButtonLabel',
      modalSecondaryButtonLabel: 'modalSecondaryButtonLabel',
      cardTitle: 'cardTitle',
      description: 'description',
      size: 'size',
      selectASize: 'selectASize',
      timeRange: 'timeRange',
      selectATimeRange: 'selectATimeRange',
      last24HoursLabel: 'Last24hours',
      last7DaysLabel: 'Last7days',
      lastMonthLabel: 'Lastmonth',
      lastQuarterLabel: 'Lastquarter',
      lastYearLabel: 'Lastyear',
      thisWeekLabel: 'Thisweek',
      thisMonthLabel: 'Thismonth',
      thisQuarterLabel: 'Thisquarter',
      thisYearLabel: 'Thisyear',
      dataItemEditorTitle: 'dataItemEditorTitle',
      dataItemEditorDataItemTitle: 'dataItemEditorDataItemTitle',
      dataItemEditorDataItemLabel: 'dataItemEditorDataItemLabel',
      dataItemEditorLegendColor: 'dataItemEditorLegendColor',
      dataSeriesTitle: 'dataSeriesTitle',
      selectDataItems: 'selectDataItems',
      selectDataItem: 'selectDataItem',
      dataItem: 'dataItem',
      edit: 'edit',
      remove: 'remove',
      customize: 'customize',
      clearSelectionText: 'clearSelectionText',
      clearAllText: 'clearAllText',
      openMenuText: 'openMenuText',
      closeMenuText: 'closeMenuText',

      dataItemEditorDataSeriesTitle: 'dataItemEditorDataSeriesTitle',
      dataItemEditorValueCardTitle: 'dataItemEditorValueCardTitle',
      dataItemEditorDataItemCustomLabel: 'dataItemEditorDataItemCustomLabel',
      dataItemEditorDataItemUnit: 'dataItemEditorDataItemUnit',
      dataItemEditorDataItemFilter: 'dataItemEditorDataItemFilter',
      dataItemEditorDataItemThresholds: 'dataItemEditorDataItemThresholds',
      dataItemEditorDataItemAddThreshold: 'dataItemEditorDataItemAddThreshold',
      dataItemEditorDataItemRemove: 'dataItemEditorDataItemRemove',
      dataItemEditorBarColor: 'dataItemEditorBarColor',
      dataItemEditorLineColor: 'dataItemEditorLineColor',
      source: 'source',
      closeButtonLabelText: 'closeButtonLabelText',
      primaryButtonLabelText: 'primaryButtonLabelText',
      secondaryButtonLabelText: 'secondaryButtonLabelText',

      // settings for Value card
      abbreviateNumbers: 'abbreviateNumbers',
      abbreviateNumbersTooltip: 'abbreviateNumbersTooltip',
      fontSize: 'fontSize',

      // Settings for Data Series
      xAxisLabel: 'xAxisLabel',
      yAxisLabel: 'yAxisLabel',
      unitLabel: 'unitLabel',
      decimalPrecisionLabel: 'decimalPrecisionLabel',
      precisionLabel: 'precisionLabel',
      showLegendLabel: 'showLegendLabel',

      // Additional fields for Bar Chart
      selectGroupBy: 'selectGroupBy',
      selectCategory: 'selectCategory',
      groupBy: 'groupBy',
      subGroup: 'subGroup',
      timeInterval: 'timeInterval',
      decimalPlacesLabel: 'decimalPlacesLabel',
      layoutLabel: 'layoutLabel',
      horizontal: 'horizontal',
      vertical: 'vertical',

      // settings for Image card form
      imageFile: 'imageFile',
      editImage: 'editImage',
      image: 'image',
      close: 'close',

      displayOptions: 'displayOptions',
      colorTitleText: 'colorTitleText',
      hideMap: 'hideMap',
      hideZoom: 'hideZoom',
      zoomLevel: 'zoomLevel',
      fit: 'fit',
      fill: 'fill',
      stretch: 'stretch',
      selectAColor: 'selectAColor',

      // image card strings
      dropContainerLabelText: 'dropContainerLabelText',
      dropContainerDescText: 'dropContainerDescText',
      uploadByURLCancel: 'uploadByURLCancel',
      uploadByURLButton: 'uploadByURLButton',
      browseImages: 'browseImages',
      insertUrl: 'insertUrl',
      urlInput: 'urlInput',
      fileTooLarge: 'fileTooLarge',
      wrongFileType: (accept) =>
        `This file is not one of the accepted file types, ${accept.join(', ')}`,
      // image gallery strings
      imageGalleryDeleteLabelText: 'imageGalleryDeleteLabelText',
      imageGalleryDeleteModalLabelText: 'imageGalleryDeleteModalLabelText',
      imageGalleryDeleteModalTitleText: (image) => `imageGalleryDeleteModalTitleText: ${image}?`,
      imageGalleryGridButtonText: 'imageGalleryGridButtonText',
      imageGalleryInstructionText: 'imageGalleryInstructionText',
      imageGalleryListButtonText: 'imageGalleryListButtonText',
      imageGalleryModalLabelText: 'imageGalleryModalLabelText',
      imageGalleryModalTitleText: 'imageGalleryModalTitleText',
      imageGalleryModalPrimaryButtonLabelText: 'imageGalleryModalPrimaryButtonLabelText',
      imageGalleryModalSecondaryButtonLabelText: 'imageGalleryModalSecondaryButtonLabelText',
      imageGalleryModalCloseIconDescriptionText: 'imageGalleryModalCloseIconDescriptionText',
      imageGallerySearchPlaceHolderText: 'imageGallerySearchPlaceHolderText',

      // table card settings
      selectGroupByDimensions: 'selectGroupByDimensions',
      dataItemEditorDimensionTitle: 'dataItemEditorDimensionTitle',
      rowsPerPage: 'rowsPerPage',
      sortBy: 'sortBy',
      sortByTitle: 'sortByTitle',
      ascending: 'ascending',
      descending: 'descending',
      showHeader: 'showHeader',
      allowNavigation: 'allowNavigation',

      // HotspotEditorModal strings
      backgroundLabelText: 'backgroundLabelText',
      boldLabelText: 'boldLabelText',
      borderLabelText: 'borderLabelText',
      borderWidthInvalidText: 'borderWidthInvalidText',
      cancelButtonLabelText: 'cancelButtonLabelText',
      colorDropdownLabelText: 'colorDropdownLabelText',
      colorDropdownTitleText: 'colorDropdownTitleText',
      deleteButtonIconDescriptionText: 'deleteButtonIconDescriptionText',
      deleteButtonLabelText: 'deleteButtonLabelText',
      descriptionTextareaLabelText: 'descriptionTextareaLabelText',
      descriptionTextareaPlaceholderText: 'descriptionTextareaPlaceholderText',
      fillOpacityInvalidText: 'fillOpacityInvalidText',
      fillOpacityLabelText: 'fillOpacityLabelText',
      fixedTypeDataSourceTabLabelText: 'fixedTypeDataSourceTabLabelText',
      fixedTypeTooltipTabLabelText: 'fixedTypeTooltipTabLabelText',
      fontSizeInvalidText: 'fontSizeInvalidText',
      hotspotsText: 'hotspotsText',
      iconDropdownLabelText: 'iconDropdownLabelText',
      iconDropdownTitleText: 'iconDropdownTitleText',
      italicLabelText: 'italicLabelText',
      labelsText: 'labelsText',
      loadingDynamicHotspotsText: 'loadingDynamicHotspotsText',
      modalHeaderTitleText: 'modalHeaderTitleText',
      modalIconDescriptionText: 'modalIconDescriptionText',
      saveButtonLabelText: 'saveButtonLabelText',
      textStyleLabelText: 'textStyleLabelText',
      textTypeDataSourceTabLabelText: 'textTypeDataSourceTabLabelText',
      titleInputLabelText: 'titleInputLabelText',
      titleInputPlaceholderText: 'titleInputPlaceholderText',
      tooManyHotspotsInfoText: 'tooManyHotspotsInfoText',
      underlineLabelText: 'underlineLabelText',
      fixedTypeTooltipInfoText: 'fixedTypeTooltipInfoText',
      clearIconDescription: 'clearIconDescription',
      xCoordinateDropdownTitleText: 'xCoordinateDropdownTitleText',
      xCoordinateDropdownLabelText: 'xCoordinateDropdownLabelText',
      yCoordinateDropdownTitleText: 'yCoordinateDropdownTitleText',
      yCoordinateDropdownLabelText: 'yCoordinateDropdownLabelText',
      selectDataItemsText: 'selectDataItemsText',
      dataItemText: 'dataItemText',
      editText: 'editText',
      // Hotspot Text Style Tab fields
      textTypeStyleInfoText: 'textTypeStyleInfoText',
      fontColorLabelText: 'fontColorLabelText',
      fontSizeLabelText: 'fontSizeLabelText',
      borderWidthLabelText: 'borderWidthLabelText',
      deleteButtonIconDescription: 'deleteButtonIconDescription',
    }}
    breakpointSwitcher={{ enabled: true }}
    headerBreadcrumbs={[
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ]}
    isLoading={boolean('isLoading', false)}
    actions={commonActions}
  />
);

I18N.storyName = 'i18n';

export const WithCustomCards = () => {
  // Render the elements to show in the content editor side panel
  const renderContentEditor1 = (onChange, cardConfig) => (
    <div style={{ marginLeft: '-1rem', marginRight: '-1rem', marginTop: '-1rem' }}>
      <SimpleList
        hasPagination={false}
        editingStyle="single"
        onListUpdated={(list) => onChange({ ...cardConfig, listOrder: list.map(({ id }) => id) })}
        items={(cardConfig.listOrder || ['1', '2', '3', '4', '5']).map((i) => ({
          id: i,
          content: {
            value: `Item ${i}`,
            rowActions: () => [
              <OverflowMenu flipped>
                <OverflowMenuItem onClick={() => action(`Menu ${i} clicked`)} itemText="Option" />
              </OverflowMenu>,
            ],
          },
          isSelectable: true,
        }))}
        actions={commonActions}
      />
    </div>
  );

  // Render the elements to show in the settings editor tab
  const renderSettingsEditor1 = (onChange, cardConfig) => (
    <div>
      <NumberInput
        light
        label="Number Input"
        onChange={(event) => {
          const numberValue = Number(event.imaginaryTarget.value);
          onChange({ ...cardConfig, numberValue });
        }}
      />
      <TextInput
        light
        value={cardConfig.textValue}
        labelText="Text Input"
        onChange={(event) => onChange({ ...cardConfig, textValue: event.target.value })}
      />
    </div>
  );

  // Render the elements to show on the actual card
  const renderCustom1Card = (cardConfig) => (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'row' }}>
      <h3 style={{ marginRight: '3rem' }}>Custom2 Card: </h3>
      <div style={{ marginRight: '3rem' }}>
        <h5>listOrder</h5>
        {cardConfig.listOrder?.map((item) => <p>{item}</p>) || '--'}
      </div>
      <div>
        <h5>numberValue</h5>
        <span>{cardConfig.numberValue || '--'}</span>
        <h5>textValue</h5>
        <span>{cardConfig.textValue || '--'}</span>
      </div>
    </div>
  );

  // Format the card payload for the dashboardJson
  const formatCustom1Card = (card) => ({
    ...card,
    content: renderCustom1Card(card),
    renderEditContent: (onChange, cardConfig) => [
      {
        header: { title: 'Columns', tooltip: { tooltipText: 'Custom tooltip' } },
        content: renderContentEditor1(onChange, cardConfig),
      },
    ],
    renderEditSettings: (onChange, cardConfig) => {
      return renderSettingsEditor1(onChange, cardConfig);
    },
  });

  // Render the elements to show in the content editor side panel
  const renderContentEditor2 = (onChange, cardConfig) => (
    <div style={{ marginBottom: '1rem' }}>
      <Dropdown
        titleText="Data item"
        onChange={({ selectedItem }) => onChange({ ...cardConfig, dataItem: selectedItem })}
        label="Select a data item"
        items={['dataItem1', 'dataItem2', 'dataItem3']}
        light
      />
    </div>
  );

  // Render the elements to show in the settings editor tab
  const renderSettingsEditor2 = (onChange, cardConfig) => (
    <div>
      <Toggle
        size="sm"
        onToggle={(toggled) => onChange({ ...cardConfig, toggled })}
        toggled={cardConfig.toggled}
      />
      <TextInput
        light
        value={cardConfig.textValue}
        labelText="Text Input"
        onChange={(event) => onChange({ ...cardConfig, textValue: event.target.value })}
      />
    </div>
  );

  // Render the elements to show on the actual card
  const renderCustom2Card = (cardConfig) => (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'row' }}>
      <h3 style={{ marginRight: '3rem' }}>Custom2 Card: </h3>
      <div style={{ marginRight: '3rem' }}>
        <h5>dataItem</h5>
        <span>{cardConfig.dataItem || '--'}</span>
        <h5>numberValue</h5>
        <span>{cardConfig.numberValue || '--'}</span>
      </div>
      <div>
        <h5>toggled</h5>
        <span>{cardConfig.toggled ? 'true' : 'false'}</span>
        <h5>textValue</h5>
        <span>{cardConfig.textValue || '--'}</span>
      </div>
    </div>
  );

  // Format the card payload for the dashboardJson
  const formatCustom2Card = (card) => ({
    ...card,
    content: renderCustom2Card(card),
    renderEditContent: (onChange, cardConfig) => [
      {
        header: { title: 'Items', tooltip: { tooltipText: 'Custom tooltip' } },
        content: renderContentEditor2(onChange, cardConfig),
      },
      {
        header: { title: 'Second section', tooltip: { tooltipText: 'Second tooltip' } },
        content: (
          <NumberInput
            light
            label="Number Input"
            onChange={(event) => {
              const numberValue = Number(event.imaginaryTarget.value);
              onChange({ ...cardConfig, numberValue });
            }}
          />
        ),
      },
    ],
    renderEditSettings: (onChange, cardConfig) => {
      return renderSettingsEditor2(onChange, cardConfig);
    },
  });

  return (
    <DashboardEditor
      initialValue={{ layouts: {}, cards: [] }}
      title={text('title', 'My dashboard')}
      getValidDataItems={() => mockDataItems}
      dataItems={mockDataItems}
      availableImages={images}
      i18n={{
        headerEditTitleButton: 'Edit title updated',
        CUSTOM1: 'My custom1 type',
        CUSTOM2: 'My custom2 type',
      }}
      icons={{ CUSTOM1: <DataScientistIcon />, CUSTOM2: <EmptystateDefaultIcon /> }}
      onAddImage={action('onAddImage')}
      onImport={action('onImport')}
      onExport={action('onExport')}
      onDelete={action('onDelete')}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
      onImageDelete={action('onImageDelete')}
      onCardChange={(cardConfig) =>
        // Format the custom cards
        cardConfig.type === 'CUSTOM1'
          ? formatCustom1Card(cardConfig)
          : cardConfig.type === 'CUSTOM2'
          ? formatCustom2Card(cardConfig)
          : cardConfig
      }
      onLayoutChange={action('onLayoutChange')}
      isSubmitDisabled={boolean('isSubmitDisabled', false)}
      isSubmitLoading={boolean('isSubmitLoading', false)}
      availableDimensions={{
        deviceid: ['73000', '73001', '73002'],
        manufacturer: ['rentech', 'GHI Industries'],
      }}
      supportedCardTypes={array('supportedCardTypes', [
        'TIMESERIES',
        'SIMPLE_BAR',
        'GROUPED_BAR',
        'STACKED_BAR',
        'VALUE',
        'IMAGE',
        'TABLE',
        'CUSTOM1',
        'CUSTOM2',
      ])}
      headerBreadcrumbs={[
        <Link href="www.ibm.com">Dashboard library</Link>,
        <Link href="www.ibm.com">Favorites</Link>,
      ]}
      isLoading={boolean('isLoading', false)}
      actions={commonActions}
    />
  );
};

WithCustomCards.storyName = 'With custom cards';

export const withGetDefaultCard = () => {
  const renderDefaultCard = ({ cardContent }) => <h5>{cardContent || 'My custom 1 content'}</h5>;

  return (
    <DashboardEditor
      title={text('title', 'My dashboard')}
      getValidDataItems={() => mockDataItems}
      dataItems={mockDataItems}
      availableImages={images}
      onAddImage={action('onAddImage')}
      onEditTitle={action('onEditTitle')}
      onImport={action('onImport')}
      onExport={action('onExport')}
      onDelete={action('onDelete')}
      onCancel={action('onCancel')}
      onSubmit={action('onSubmit')}
      onImageDelete={action('onImageDelete')}
      onLayoutChange={action('onLayoutChange')}
      isSubmitDisabled={boolean('isSubmitDisabled', false)}
      isSubmitLoading={boolean('isSubmitLoading', false)}
      availableDimensions={{
        deviceid: ['73000', '73001', '73002'],
        manufacturer: ['rentech', 'GHI Industries'],
      }}
      onCardChange={(cardConfig) => {
        if (cardConfig.type === 'MYCUSTOMCARD') {
          return {
            ...cardConfig,
            content: renderDefaultCard(cardConfig),
          };
        }
        return cardConfig;
      }}
      getDefaultCard={(type) => {
        switch (type) {
          case 'MYCUSTOMCARD':
            return {
              id: 'custom1Id',
              type: 'MYCUSTOMCARD',
              title: 'My custom 1',
              size: 'MEDIUM',
              content: renderDefaultCard,
              renderEditContent: (onChange, cardConfig) => [
                {
                  header: { title: 'Edit custom 1', tooltip: { tooltipText: 'tooltip' } },
                  content: (
                    <TextInput
                      onChange={(e) => onChange({ ...cardConfig, cardContent: e.target.value })}
                    />
                  ),
                },
              ],
            };
          case 'MYCUSTOMCARD2':
            return {
              id: 'custom2Id',
              type: 'MYCUSTOMCARD2',
              title: 'My custom 2',
              size: 'MEDIUMTHIN',
              content: () => <h5>My custom 2 content</h5>,
            };
          default:
            return {
              id: 'defaultId',
              title: 'defaultCard',
              size: 'MEDIUM',
              content: () => <h5>Default card</h5>,
            };
        }
      }}
      supportedCardTypes={array('supportedCardTypes', ['MYCUSTOMCARD', 'MYCUSTOMCARD2'])}
      breakpointSwitcher={{ enabled: true }}
      headerBreadcrumbs={[
        <Link href="www.ibm.com">Dashboard library</Link>,
        <Link href="www.ibm.com">Favorites</Link>,
      ]}
      isLoading={boolean('isLoading', false)}
      actions={commonActions}
    />
  );
};

withGetDefaultCard.storyName = 'With get default card';
