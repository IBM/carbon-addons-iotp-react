import React, { Fragment, useState, createElement } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import FullWidthWrapper from '../../internal/FullWidthWrapper';
import Card from '../Card/Card';
import {
  CARD_DIMENSIONS,
  CARD_SIZES,
  CARD_TYPES,
  CARD_ACTIONS,
} from '../../constants/LayoutConstants';
import { chartData, tableColumns, tableData } from '../../utils/sample';
import PieChartCard from '../PieChartCard/PieChartCard';
import ValueCard from '../ValueCard/ValueCard';
import BarChartCard from '../BarChartCard/BarChartCard';
import TableCard from '../TableCard/TableCard';
import ImageCard from '../ImageCard/ImageCard';
import TimeSeriesCard from '../TimeSeriesCard/TimeSeriesCard';
import GaugeCard from '../GaugeCard/GaugeCard';
import ListCard from '../ListCard/ListCard';
import MapboxCard from '../MapCard/storyFiles/MapboxExample';
import data from '../MapCard/storyFiles/data.json';
import options from '../MapCard/storyFiles/mapOptions';

import DashboardGrid from './DashboardGrid';
import DashboardGridREADME from './DashboardGrid.mdx';

const MapboxExample = ({ ...props }) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleOnCardAction = (id, actionType) => {
    if (actionType === CARD_ACTIONS.CLOSE_EXPANDED_CARD) {
      setIsExpanded(false);
    } else if (actionType === CARD_ACTIONS.OPEN_EXPANDED_CARD) {
      setIsExpanded(true);
    } else if (actionType === CARD_ACTIONS.ON_SETTINGS_CLICK) {
      setSettingsOpen((oldSettingsState) => !oldSettingsState);
    }
  };
  return (
    <MapboxCard
      data={data}
      options={options}
      isLegendFullWidth={boolean('isLegendFullWidth', false)}
      onCardAction={handleOnCardAction}
      availableActions={{ expand: true, settings: true }}
      isSettingPanelOpen={settingsOpen}
      isExpanded={isExpanded}
      {...props}
    />
  );
};

const Cards = [
  <Card
    title="Facility Metrics"
    key="facility"
    id="facility"
    size={CARD_SIZES.MEDIUM}
    type={CARD_TYPES.VALUE}
    availableActions={{
      delete: true,
    }}
    content="My Facility Metrics"
  />,
  <Card
    title="Humidity"
    key="humidity"
    id="humidity"
    size={CARD_SIZES.SMALL}
    type={CARD_TYPES.VALUE}
    availableActions={{
      delete: true,
    }}
    content="My Humidity Values"
  />,
  <Card
    title="Utilization"
    id="utilization"
    key="utilization"
    size={CARD_SIZES.SMALL}
    type={CARD_TYPES.VALUE}
    availableActions={{
      delete: true,
    }}
    content="My utilization chart"
  />,
];

const commonGridProps = {
  onBreakpointChange: action('onBreakpointChange'),
  onLayoutChange: action('onLayoutChange'),
};

export default {
  title: '1 - Watson IoT/Dashboard',
  parameters: {
    docs: {
      page: DashboardGridREADME,
    },
  },
};

export const DashboardDefaultLayouts = () => {
  return (
    <Fragment>
      Resize your window to see the callback handlers get triggered in the Actions tab.
      <FullWidthWrapper>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '200px' }}>Sample sidebar</div>
          <DashboardGrid {...commonGridProps}>{Cards}</DashboardGrid>
        </div>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardDefaultLayouts.storyName = 'dashboard, default layouts';

DashboardDefaultLayouts.parameters = {
  info: {
    text: `
  This is the simplest way to use the dashboard grid, just pass it a set of cards and let it figure out it's own layout to use.
  # Component Overview
  `,
  },
};

export const DashboardIsEditable = () => {
  return (
    <Fragment>
      You can drag and drop the cards around. Watch the handler get triggered on the Actions tab.
      <FullWidthWrapper>
        <DashboardGrid {...commonGridProps} isEditable={boolean('isEditable', true)}>
          {Cards}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardIsEditable.storyName = 'dashboard, is Editable';

DashboardIsEditable.parameters = {
  info: {
    text: `
    The onLayoutChange handler is triggered as you drag and drop the cards around
    # Component Overview
    `,
  },
};

export const DashboardCustomLayout = () => {
  return (
    <Fragment>
      Passes a custom layout to the dashboard grid. Only the lg and md breakpoint have a custom
      layout defined. Resize the screen to see the cards reposition and resize themselves at
      different layouts.
      <FullWidthWrapper>
        <DashboardGrid
          {...commonGridProps}
          layouts={{
            lg: [
              { i: 'facility', x: 4, y: 4, w: 1, h: 1 },
              { i: 'humidity', x: 0, y: 0, w: 1, h: 1 },
              { i: 'utilization', x: 3, y: 0, w: 1, h: 1 },
            ],
            md: [
              { i: 'facility', x: 0, y: 0, w: 1, h: 1 },
              { i: 'humidity', x: 0, y: 1, w: 1, h: 1 },
              { i: 'utilization', x: 0, y: 2, w: 1, h: 1 },
            ],
          }}
        >
          {Cards}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardCustomLayout.storyName = 'dashboard, custom layout';

DashboardCustomLayout.parameters = {
  info: {
    text: `
    The breakpoint property tells the dashboard which
    layout to use. You should listen to the onBreakpointChange event to keep
    track of which breakpoint is currently being used in your local components state, and pass back in the breakpoint accordingly.
    # Component Overview
    `,
  },
};

export const DashboardAllCardSizes = () => {
  const titleTextTooltip = boolean('Demo titleTextTooltip', false) ? (
    <div>I am shown in tooltip that auto adjusts in position</div>
  ) : undefined;
  const CARDS_ALL_SIZES = [
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Small"
      key="Small"
      id="Small"
      size={CARD_SIZES.SMALL}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Small Wide"
      key="Small Wide"
      id="Small Wide"
      size={CARD_SIZES.SMALLWIDE}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Medium Thin"
      id="Medium Thin"
      key="Medium Thin"
      size={CARD_SIZES.MEDIUMTHIN}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Medium"
      id="Medium"
      key="Medium"
      size={CARD_SIZES.MEDIUM}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Medium Wide"
      id="Medium Wide"
      key="Medium Wide"
      size={CARD_SIZES.MEDIUMWIDE}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Large Thin"
      id="Large Thin"
      key="Large Thin"
      size={CARD_SIZES.LARGETHIN}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Large"
      id="Large"
      key="Large"
      size={CARD_SIZES.LARGE}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
    <Card
      titleTextTooltip={titleTextTooltip}
      title="Large Wide"
      id="Large Wide"
      key="Large Wide"
      size={CARD_SIZES.LARGEWIDE}
      type={CARD_TYPES.VALUE}
      availableActions={{
        delete: true,
      }}
    />,
  ];
  return (
    <Fragment>
      Resize your window to see the callback handlers get triggered in the Actions tab.
      <FullWidthWrapper>
        <DashboardGrid
          {...commonGridProps}
          layouts={{
            max: [
              { i: 'Small', x: 0, y: 0, w: 2, h: 1 },
              { i: 'Small Wide', x: 2, y: 0, w: 4, h: 1 },
              { i: 'Medium Thin', x: 0, y: 2, w: 2, h: 2 },
              { i: 'Medium', x: 2, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 6, y: 2, w: 8, h: 2 },
              { i: 'Large Thin', x: 0, y: 4, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 4, w: 8, h: 4 },
              { i: 'Large Wide', x: 8, y: 8, w: 16, h: 4 },
            ],
            xl: [
              { i: 'Small', x: 0, y: 0, w: 4, h: 1 },
              { i: 'Small Wide', x: 4, y: 0, w: 4, h: 1 },
              { i: 'Medium Thin', x: 0, y: 2, w: 4, h: 2 },
              { i: 'Medium', x: 4, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 8, y: 2, w: 8, h: 2 },
              { i: 'Large Thin', x: 0, y: 4, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 4, w: 8, h: 4 },
              { i: 'Large Wide', x: 8, y: 8, w: 16, h: 4 },
            ],
            lg: [
              { i: 'Small', x: 0, y: 0, w: 4, h: 1 },
              { i: 'Small Wide', x: 4, y: 0, w: 4, h: 1 },
              { i: 'Medium Thin', x: 0, y: 2, w: 4, h: 2 },
              { i: 'Medium', x: 4, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 8, y: 2, w: 8, h: 2 },
              { i: 'Large Thin', x: 0, y: 4, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 4, w: 8, h: 4 },
              { i: 'Large Wide', x: 8, y: 8, w: 16, h: 4 },
            ],
            md: [
              { i: 'Small', x: 0, y: 0, w: 4, h: 1 },
              { i: 'Small Wide', x: 4, y: 0, w: 4, h: 1 },
              { i: 'Medium Thin', x: 0, y: 2, w: 2, h: 2 },
              { i: 'Medium', x: 2, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 8, y: 2, w: 8, h: 2 },
              { i: 'Large Thin', x: 0, y: 4, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 4, w: 8, h: 4 },
              { i: 'Large Wide', x: 8, y: 8, w: 8, h: 4 },
            ],
            sm: [
              { i: 'Small', x: 0, y: 0, w: 2, h: 1 },
              { i: 'Small Wide', x: 4, y: 0, w: 4, h: 2 },
              { i: 'Medium Thin', x: 0, y: 0, w: 2, h: 2 },
              { i: 'Medium', x: 2, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 8, y: 0, w: 4, h: 2 },
              { i: 'Large Thin', x: 0, y: 0, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 0, w: 4, h: 4 },
              { i: 'Large Wide', x: 8, y: 0, w: 4, h: 4 },
            ],
            xs: [
              { i: 'Small', x: 0, y: 0, w: 4, h: 1 },
              { i: 'Small Wide', x: 4, y: 0, w: 4, h: 1 },
              { i: 'Medium Thin', x: 0, y: 0, w: 4, h: 2 },
              { i: 'Medium', x: 2, y: 0, w: 4, h: 2 },
              { i: 'Medium Wide', x: 8, y: 0, w: 4, h: 2 },
              { i: 'Large Thin', x: 0, y: 0, w: 4, h: 4 },
              { i: 'Large', x: 4, y: 0, w: 4, h: 4 },
              { i: 'Large Wide', x: 8, y: 0, w: 4, h: 4 },
            ],
          }}
        >
          {CARDS_ALL_SIZES}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardAllCardSizes.storyName = 'dashboard, all card sizes';

DashboardAllCardSizes.parameters = {
  info: {
    text: `
  This is the simplest way to use the dashboard grid, just pass it a set of cards and let it figure out it's own layout to use.
  # Component Overview
  `,
  },
};

export const DashboardResizableCard = () => {
  const [currentSize, setCurrentSize] = useState(CARD_SIZES.SMALL);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const isResizable = boolean('isResizable', true);
  const layouts = {
    max: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
    xl: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
    lg: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
    md: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
    sm: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
    xs: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
  };

  return (
    <Fragment>
      The card is resizable by dragging and the card size prop is automatically updated to match the
      new size during the drag process.
      <FullWidthWrapper>
        <DashboardGrid
          {...commonGridProps}
          layouts={layouts}
          breakpoint={currentBreakpoint}
          onBreakpointChange={(newBreakpoint) => setCurrentBreakpoint(newBreakpoint)}
          onCardSizeChange={(cardSizeData, gridData) => {
            const { size } = cardSizeData;
            action('onCardSizeChange')(cardSizeData, gridData);
            setCurrentSize(size);
          }}
          onResizeStop={action('onResizeStop')}
        >
          {[
            <Card
              title={`Card - ${currentSize}`}
              id="card"
              isResizable={isResizable}
              key="card"
              size={currentSize}
            />,
          ]}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardResizableCard.storyName = 'dashboard, resizable card';
DashboardResizableCard.decorators = [createElement];

DashboardResizableCard.parameters = {
  info: {
    source: true,
    text: `
    This story demonstrates how a card can be resizable by dragging. During reszie the cards' size prop is
    automatically updated to match the new size.
    See the source code for the full example.

    ~~~js
    const [currentSize, setCurrentSize] = useState(CARD_SIZES.SMALL);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    const isResizable = boolean('isResizable', false);
    const layouts = {
      max: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
      xl: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
      lg: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
      md: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
      sm: [{ i: 'card', x: 0, y: 0, w: 2, h: 1 }],
      xs: [{ i: 'card', x: 0, y: 0, w: 4, h: 1 }],
    };

    return (
      <Fragment>
        The card is resizable by dragging and the cards' size prop is
        automatically updated to match the new size during the drag process.
        <FullWidthWrapper>
          <DashboardGrid
            layouts={layouts}
            breakpoint={currentBreakpoint}
            onBreakpointChange={(newBreakpoint) =>
              setCurrentBreakpoint(newBreakpoint)
            }
            onCardSizeChange={(cardSizeData, gridData) => {
              const { size } = cardSizeData;
              setCurrentSize(size);
            }}
            onResizeStop={() => {}}>
            <Card
              title={'Card -' + currentSize}
              id="card"
              isResizable={isResizable}
              key="card"
              size={currentSize}></Card>
          </DashboardGrid>
        </FullWidthWrapper>
      </Fragment>
    );
    ~~~
  `,
  },
};

export const DashboardAllCardsAsResizable = () => {
  const titleTextTooltip = boolean('Demo titleTextTooltip', false) ? (
    <div>I am shown in tooltip that auto adjusts in position</div>
  ) : undefined;
  const withToolbarTooltips = boolean('Enable toolbar tooltips in TableCard', false);

  const barChartCardValues = [
    {
      city: 'A',
      particles: 447,
    },
    {
      city: 'B',
      particles: 528,
    },
    {
      city: 'C',
      particles: 435,
    },
    {
      city: 'D',
      particles: 388,
    },
  ];

  const pieChartCardValues = [
    {
      category: 'A',
      group: '2V2N 9KYPM',
      value: 1,
    },
    {
      category: 'B',
      group: 'L22I P66EP L22I P66EP',
      value: 10,
    },
    {
      category: 'C',
      group: 'JQAI 2M4L1',
      value: 20,
    },
  ];

  const timeSeriesCardContent = {
    includeZeroOnXaxis: true,
    includeZeroOnYaxis: true,
    series: [
      {
        dataSourceId: 'temperature',
        label: 'Temperature',
      },
    ],
    timeDataSourceId: 'timestamp',
    xLabel: 'Time',
    yLabel: 'Temperature (˚F)',
  };

  const imageCardValues = {
    hotspots: [
      {
        color: 'purple',
        content: {
          attributes: [
            {
              dataSourceId: 'temperature',
              label: 'Temp',
              precision: 2,
            },
          ],
          description: 'Description',
          title: 'My Device',
          values: {
            deviceid: '73000',
            temperature: 35.05,
          },
        },
        icon: 'arrowDown',
        x: 35,
        y: 65,
      },
    ],
  };

  const gaugeCardContent = {
    gauges: [
      {
        backgroundColor: '#e0e0e0',
        color: 'orange',
        dataSourceId: 'usage',
        maximumValue: 100,
        minimumValue: 0,
        shape: 'circle',
        thresholds: [
          {
            color: 'red',
            comparison: '>',
            label: 'Poor',
            value: 0,
          },
          {
            color: '#f1c21b',
            comparison: '>',
            label: 'Fair',
            value: 60,
          },
          {
            color: 'green',
            comparison: '>',
            label: 'Good',
            value: 80,
          },
        ],
        trend: {
          color: '',
          dataSourceId: 'usageTrend',
          trend: 'up',
        },
        units: '%',
      },
    ],
  };

  const listCardData = [
    {
      id: 'row-1',
      value: 'Row content 1',
      link: 'https://internetofthings.ibmcloud.com/',
    },
    {
      id: 'row-2',
      value: 'Row content 2',
      link: 'https://internetofthings.ibmcloud.com/',
    },
    { id: 'row-3', value: 'Row content 3' },
    {
      id: 'row-4',
      value: 'Row content 4',
      link: 'https://internetofthings.ibmcloud.com/',
      extraContent: (
        <svg height="10" width="30">
          <circle cx="5" cy="5" r="3" stroke="none" strokeWidth="1" fill="red" />
        </svg>
      ),
    },
    { id: 'row-5', value: 'Row content 5' },
    { id: 'row-6', value: 'Row content 6' },
    { id: 'row-7', value: 'Row content 7' },
    { id: 'row-8', value: 'Row content 8' },
  ];

  const [currentSizes, setCurrentSizes] = useState({
    card: CARD_SIZES.SMALL,
    valueCard: CARD_SIZES.SMALLWIDE,
    gaugeCard: CARD_SIZES.MEDIUMTHIN,
    pieChartCard: CARD_SIZES.MEDIUM,
    mapCard: CARD_SIZES.LARGEWIDE,
    tableCard: CARD_SIZES.LARGE,
    imageCard: CARD_SIZES.LARGE,
    timeSeriesCard: CARD_SIZES.LARGETHIN,
    listCard: CARD_SIZES.LARGETHIN,
    barChartCard: CARD_SIZES.LARGEWIDE,
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const isResizable = boolean('isResizable', true);

  const CARDS_ALL_SIZES = [
    <Card
      titleTextTooltip={titleTextTooltip}
      title={`Card - ${currentSizes.card}`}
      id="card"
      isResizable={isResizable}
      key="card"
      size={currentSizes.card}
      availableActions={{
        delete: true,
      }}
    >
      <p>This is a basic card</p>
    </Card>,
    <ValueCard
      titleTextTooltip={titleTextTooltip}
      title={`ValueCard - ${currentSizes.valueCard}`}
      id="valueCard"
      key="valueCard"
      size={currentSizes.valueCard}
      isResizable={isResizable}
      content={{
        attributes: [
          {
            dataSourceId: 'occupancy',
            unit: '%',
            secondaryValue: {
              dataSourceId: 'trend',
              trend: 'down',
              color: 'red',
            },
          },
        ],
      }}
      values={{ occupancy: 88 }}
    />,
    <GaugeCard
      titleTextTooltip={titleTextTooltip}
      id="gaugeCard"
      key="gaugeCard"
      isResizable={isResizable}
      size={currentSizes.gaugeCard}
      title={`GaugeCard - ${currentSizes.gaugeCard}`}
      content={gaugeCardContent}
      tooltip={!titleTextTooltip ? <p>Health - of floor 8</p> : undefined}
      values={{
        usage: 81,
        usageTrend: '12%',
      }}
    />,
    <PieChartCard
      titleTextTooltip={titleTextTooltip}
      content={{
        groupDataSourceId: 'category',
        legendPosition: 'bottom',
      }}
      title={`PieChartCard - ${currentSizes.pieChartCard}`}
      key="pieChartCard"
      id="pieChartCard"
      size={currentSizes.pieChartCard}
      isResizable={isResizable}
      values={pieChartCardValues}
    />,
    <MapboxExample
      titleTextTooltip={titleTextTooltip}
      isResizable={isResizable}
      id="mapCard"
      key="mapCard"
      title={`MapCard - ${currentSizes.mapCard}`}
      size={currentSizes.mapCard}
    />,
    <TableCard
      titleTextTooltip={titleTextTooltip}
      title={`TableCard - ${currentSizes.tableCard}`}
      id="tableCard"
      key="tableCard"
      content={{
        columns: tableColumns,
      }}
      values={tableData}
      onCardAction={() => {}}
      size={currentSizes.tableCard}
      isResizable={isResizable}
      withToolbarTooltips={withToolbarTooltips}
    />,
    <ImageCard
      titleTextTooltip={titleTextTooltip}
      title={`ImageCard - ${currentSizes.imageCard}`}
      id="imageCard"
      isResizable={isResizable}
      key="imageCard"
      size={currentSizes.imageCard}
      content={{
        alt: 'Sample image',
        src: 'static/media/src/components/ImageCard/landscape.jpg',
        zoomMax: 10,
      }}
      values={imageCardValues}
    />,
    <TimeSeriesCard
      titleTextTooltip={titleTextTooltip}
      id="timeSeriesCard"
      isResizable={isResizable}
      size={currentSizes.timeSeriesCard}
      title={`TimeSeriesCard - ${currentSizes.timeSeriesCard}`}
      chartType="LINE"
      content={timeSeriesCardContent}
      key="timeSeriesCard"
      interval="hour"
      values={chartData.events.slice(0, 5)}
    />,
    <ListCard
      titleTextTooltip={titleTextTooltip}
      id="listCard"
      isResizable={isResizable}
      key="listCard"
      title={`ListCard - ${currentSizes.listCard}`}
      size={currentSizes.listCard}
      data={listCardData}
      hasMoreData={false}
      loadData={() => {}}
    />,
    <BarChartCard
      titleTextTooltip={titleTextTooltip}
      id="barChartCard"
      key="barChartCard"
      size={currentSizes.barChartCard}
      isResizable={isResizable}
      title={`BarChartCard - ${currentSizes.barChartCard}`}
      content={{
        categoryDataSourceId: 'city',
        layout: 'VERTICAL',
        series: [
          {
            dataSourceId: 'particles',
          },
        ],
        type: 'SIMPLE',
        unit: 'P',
        xLabel: 'Cities',
        yLabel: 'Particles',
      }}
      values={barChartCardValues}
    />,
  ];

  const layouts = {
    max: [
      { i: 'card', x: 0, y: 0, w: 2, h: 1 },
      { i: 'valueCard', x: 2, y: 0, w: 4, h: 1 },
      { i: 'gaugeCard', x: 0, y: 2, w: 2, h: 2 },
      { i: 'pieChartCard', x: 2, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 6, y: 2, w: 8, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 4, w: 4, h: 4 },
      { i: 'listCard', x: 4, y: 4, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'mapCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'barChartCard', x: 8, y: 8, w: 16, h: 4 },
    ],
    xl: [
      { i: 'card', x: 0, y: 0, w: 2, h: 1 },
      { i: 'valueCard', x: 4, y: 0, w: 4, h: 1 },
      { i: 'gaugeCard', x: 0, y: 2, w: 4, h: 2 },
      { i: 'pieChartCard', x: 4, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 8, y: 2, w: 8, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 4, w: 4, h: 4 },
      { i: 'listCard', x: 4, y: 4, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'mapCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'barChartCard', x: 8, y: 8, w: 16, h: 4 },
    ],
    lg: [
      { i: 'card', x: 0, y: 0, w: 4, h: 1 },
      { i: 'valueCard', x: 4, y: 0, w: 4, h: 1 },
      { i: 'gaugeCard', x: 0, y: 2, w: 4, h: 2 },
      { i: 'pieChartCard', x: 4, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 8, y: 2, w: 8, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 4, w: 4, h: 4 },
      { i: 'listCard', x: 4, y: 4, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'mapCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'barChartCard', x: 8, y: 8, w: 16, h: 4 },
    ],
    md: [
      { i: 'card', x: 0, y: 0, w: 4, h: 1 },
      { i: 'valueCard', x: 4, y: 0, w: 4, h: 1 },
      { i: 'gaugeCard', x: 0, y: 2, w: 2, h: 2 },
      { i: 'pieChartCard', x: 2, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 8, y: 2, w: 8, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 4, w: 4, h: 4 },
      { i: 'listCard', x: 4, y: 4, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'mapCard', x: 4, y: 4, w: 8, h: 4 },
      { i: 'barChartCard', x: 8, y: 8, w: 8, h: 4 },
    ],
    sm: [
      { i: 'card', x: 0, y: 0, w: 2, h: 1 },
      { i: 'valueCard', x: 4, y: 0, w: 4, h: 2 },
      { i: 'gaugeCard', x: 0, y: 0, w: 2, h: 2 },
      { i: 'pieChartCard', x: 2, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 8, y: 0, w: 4, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 0, w: 4, h: 4 },
      { i: 'listCard', x: 0, y: 0, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 0, w: 4, h: 4 },
      { i: 'mapCard', x: 4, y: 0, w: 4, h: 4 },
      { i: 'barChartCard', x: 8, y: 0, w: 4, h: 4 },
    ],
    xs: [
      { i: 'card', x: 0, y: 0, w: 4, h: 1 },
      { i: 'valueCard', x: 4, y: 0, w: 4, h: 1 },
      { i: 'gaugeCard', x: 0, y: 0, w: 4, h: 2 },
      { i: 'pieChartCard', x: 2, y: 0, w: 4, h: 2 },
      { i: 'imageCard', x: 8, y: 0, w: 4, h: 2 },
      { i: 'timeSeriesCard', x: 0, y: 0, w: 4, h: 4 },
      { i: 'listCard', x: 0, y: 0, w: 4, h: 4 },
      { i: 'tableCard', x: 4, y: 0, w: 4, h: 4 },
      { i: 'mapCard', x: 4, y: 0, w: 4, h: 4 },
      { i: 'barChartCard', x: 8, y: 0, w: 4, h: 4 },
    ],
  };

  // Set minimum sizes for the cards that requires it
  const minWidthLayouts = {};
  Object.entries(layouts).forEach(([breakpoint, breakpointLayout]) => {
    minWidthLayouts[breakpoint] = breakpointLayout.map((cardLayout) => {
      const cardLayoutCopy = { ...cardLayout };
      switch (cardLayoutCopy.i) {
        case 'pieChartCard':
          cardLayoutCopy.minW = CARD_DIMENSIONS.MEDIUMTHIN.max.w;
          cardLayoutCopy.minH = CARD_DIMENSIONS.MEDIUMTHIN.max.h;
          break;
        case 'barChartCard':
          cardLayoutCopy.minW = CARD_DIMENSIONS.MEDIUMTHIN.max.w;
          cardLayoutCopy.minH = CARD_DIMENSIONS.MEDIUMTHIN.max.h;
          break;
        case 'tableCard':
          cardLayoutCopy.minW = CARD_DIMENSIONS.LARGE.max.w;
          cardLayoutCopy.minH = CARD_DIMENSIONS.LARGE.max.h;
          break;
        case 'mapCard':
          cardLayoutCopy.minW = CARD_DIMENSIONS.MEDIUM.max.w;
          cardLayoutCopy.minH = CARD_DIMENSIONS.MEDIUM.max.h;
          break;
        case 'imageCard':
          cardLayoutCopy.minW = CARD_DIMENSIONS.MEDIUMTHIN.max.w;
          cardLayoutCopy.minH = CARD_DIMENSIONS.MEDIUMTHIN.max.h;
          break;
        default:
          break;
      }
      return cardLayoutCopy;
    });
  });

  return (
    <Fragment>
      <p>
        All cards are resizable by dragging and the card size prop is automatically updated to match
        the new size during the drag process. Some cards have a minimal size defined.
      </p>
      <FullWidthWrapper>
        <DashboardGrid
          {...commonGridProps}
          layouts={minWidthLayouts}
          breakpoint={currentBreakpoint}
          onBreakpointChange={(newBreakpoint) => {
            action('onBreakpointChange')(newBreakpoint);
            setCurrentBreakpoint(newBreakpoint);
          }}
          onCardSizeChange={(...[{ id, size }, rest]) => {
            action('onCardSizeChange')({ id, size }, rest);
            setCurrentSizes((old) => ({ ...old, [id]: size }));
          }}
          onResizeStop={action('onResizeStop')}
        >
          {CARDS_ALL_SIZES}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

DashboardAllCardsAsResizable.storyName = 'dashboard, all cards as resizable';
DashboardAllCardsAsResizable.decorators = [createElement];

DashboardAllCardsAsResizable.parameters = {
  info: {
    source: true,
    text: `
    This story demonstrates how all cards can be resizable by dragging. During reszie the cards' size prop is
    automatically updated to match the new size. Some cards have a minimal size defined.

    See the source code for the full example.
  `,
  },
};
