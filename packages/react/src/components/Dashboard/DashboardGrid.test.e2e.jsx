import React, { Fragment } from 'react';
import { mount } from '@cypress/react';
import { onlyOn } from '@cypress/skip-test';
import { omit } from 'lodash-es';
import { Bee, Close } from '@carbon/react/icons';
import PropTypes from 'prop-types';
import { gray20 } from '@carbon/colors';
import MockDate from 'mockdate';

import Button from '../Button';
import { actions1, chartData, tableColumns, tableData } from '../../utils/sample';
import PieChartCard from '../PieChartCard/PieChartCard';
import ValueCard from '../ValueCard/ValueCard';
import BarChartCard from '../BarChartCard/BarChartCard';
import TableCard from '../TableCard/TableCard';
import ImageCard from '../ImageCard/ImageCard';
import TimeSeriesCard from '../TimeSeriesCard/TimeSeriesCard';
import GaugeCard from '../GaugeCard/GaugeCard';
import ListCard from '../ListCard/ListCard';
import {
  CARD_SIZES,
  BAR_CHART_TYPES,
  COLORS,
  BAR_CHART_LAYOUTS,
} from '../../constants/LayoutConstants';
import Card from '../Card/Card';
import FullWidthWrapper from '../../internal/FullWidthWrapper';
import landscape from '../ImageCard/landscape.jpg';
import { barChartData } from '../../utils/barChartDataSample';

import DashboardGrid from './DashboardGrid';

const commonGridProps = {
  onBreakpointChange: () => {},
  onLayoutChange: () => {},
};

const DashboardAllCardsAsResizable = ({ breakpoint, type }) => {
  const barChartCardValues = (index) => {
    switch (index) {
      case 1:
        return barChartData.quarters.filter((a) => a.quarter === '2020-Q3');
      case 2:
        return barChartData.quarters.filter((a) => a.quarter === '2020-Q1');
      default:
        return barChartData.timestamps;
    }
  };

  const getBarChartCardContent = (index) => {
    const isStacked = index === 5;
    const isGrouped = index === 2;
    const isHorizontal = index === 4;
    const isStackedWithoutCustomColor = index === 1;
    return {
      categoryDataSourceId: isStacked ? undefined : 'city',
      timeDataSourceId: isStacked ? 'timestamp' : undefined,
      type: isGrouped
        ? BAR_CHART_TYPES.GROUPED
        : isStackedWithoutCustomColor || isStacked
        ? BAR_CHART_TYPES.STACKED
        : BAR_CHART_TYPES.SIMPLE,
      layout: isHorizontal ? BAR_CHART_LAYOUTS.HORIZONTAL : BAR_CHART_LAYOUTS.VERTICAL,
      series: isGrouped
        ? [
            {
              dataSourceId: 'particles',
              label: 'Particles',
              color: 'blue',
            },
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
            },
            {
              dataSourceId: 'emissions',
              label: 'Emissions',
            },
          ]
        : isStackedWithoutCustomColor
        ? [
            {
              dataSourceId: 'particles',
              label: 'Particles',
            },
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
            },
            {
              dataSourceId: 'emissions',
              label: 'Emission',
            },
          ]
        : isStacked
        ? [
            {
              dataSourceId: 'particles',
              label: 'Particles',
            },
            {
              dataSourceId: 'emissions',
              label: 'Emissions',
            },
          ]
        : [
            {
              dataSourceId: 'particles',
            },
          ],
      unit: 'P',
      xLabel: isStacked || isHorizontal ? 'Dates' : 'Cities',
      yLabel: isStackedWithoutCustomColor || isStacked ? 'Total' : 'Particles',
      zoomBar: isStacked
        ? {
            enabled: true,
            axes: 'top',
            view: 'slider_view',
          }
        : undefined,
    };
  };

  const getPieChartCardContent = (index) => {
    const hasCustomColors = index === 2;
    const hasCustomTooltip = index === 4;
    const hasLabelFormatter = index === 3;
    const hasLegendOnTop = index === 0;

    return {
      colors: hasCustomColors
        ? {
            A: 'red',
            B: 'green',
            C: 'blue',
            D: 'yellow',
            E: 'purple',
            F: 'orange',
          }
        : undefined,
      customTooltip: hasCustomTooltip
        ? ([pieData] = [], html) => {
            return pieData ? `label: ${pieData.label} - Value: ${pieData.value}` : html;
          }
        : undefined,
      labelsFormatter: hasLabelFormatter
        ? (wrapper) => {
            return `${wrapper.data.category} (${wrapper.value})`;
          }
        : undefined,
      groupDataSourceId: 'category',
      legendPosition: hasLegendOnTop ? 'top' : 'bottom',
    };
  };
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

  const getTableCardColumns = (index) => {
    const hasLinks = index === 4;
    const hasSort = index === 1;
    const hasThresholds = index === 2;
    const hasExpandedRows = index === 3;
    return {
      columns: hasLinks
        ? tableColumns.map((col) => {
            if (col.dataSourceId === 'pressure') {
              return {
                ...col,
                linkTemplate: {
                  href: 'https://www.{company}.com?pressure={pressureId}',
                  target: '_blank',
                },
              };
            }

            return col;
          })
        : hasSort
        ? tableColumns.map((col) => {
            if (col.dataSourceId === 'count') {
              return {
                ...col,
                sort: 'DESC',
                width: 100,
              };
            }
            return col;
          })
        : tableColumns,
      thresholds: hasThresholds
        ? [
            {
              dataSourceId: 'pressure',
              comparison: '>=',
              value: 1,
              severity: 1,
              icon: 'bee',
              color: 'red',
              label: 'Custom Pressure Severity Header',
              showSeverityLabel: true,
              severityLabel: <span style={{ color: 'red' }}>critical</span>,
            },
          ]
        : undefined,
      expandedRows: hasExpandedRows
        ? [
            {
              id: 'long_description',
              label: 'Description',
              linkTemplate: {
                href: 'http://ibm.com/{pressure}',
              },
            },
            {
              id: 'other_description',
              label: 'Other content to show',
            },
            {
              id: 'hour',
              label: 'Time',
              type: 'TIMESTAMP',
            },
          ]
        : undefined,
    };
  };

  const timeSeriesCardContent = (index) => ({
    includeZeroOnXaxis: true,
    includeZeroOnYaxis: true,
    series:
      index === 1
        ? [
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: COLORS.TEAL,
            },
          ]
        : [
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
            },
          ],
    alertRanges:
      index === 4
        ? [
            {
              startTimestamp: 1559071754226,
              endTimestamp: 1559071814227,
              color: '#FF0000',
              details: 'Alert name',
            },
            {
              startTimestamp: 1559071574225,
              endTimestamp: 1559071694226,
              color: '#FFCC00',
              details: 'Less severe',
            },
          ]
        : undefined,
    timeDataSourceId: 'timestamp',
    xLabel: 'Time',
    yLabel: 'Temperature (˚F)',
    zoomBar:
      index === 5
        ? {
            enabled: true,
            axes: 'top',
            view: 'graph_view',
          }
        : false,
    thresholds:
      index === 1
        ? [
            { axis: 'y', value: chartData.events[0].pressure, fillColor: 'red', label: 'Alert 1' },
            {
              axis: 'x',
              value: chartData.events[0].timestamp,
              fillColor: '#ffcc00',
              label: 'Alert 2',
            },
          ]
        : undefined,
  });

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

  const getMultipleGaugeContent = () => ({
    gauges: [
      {
        dataSourceId: 'usage',
        units: '%',
        minimumValue: 0,
        maximumValue: 100,
        color: 'orange',
        backgroundColor: gray20,
        shape: 'circle',
        trend: {
          /** the key to load the trend value from the values object. */
          dataSourceId: 'usageTrend',
          color: '',
          trend: 'up',
        },
        thresholds: [
          {
            comparison: '>',
            value: 0,
            color: 'red', // red
            label: 'Poor',
          },
          {
            comparison: '>',
            value: 60,
            color: 'yellow',
            label: 'Fair',
          },
          {
            comparison: '>',
            value: 80,
            color: 'green',
            label: 'Good',
          },
        ],
      },
      {
        dataSourceId: 'gaugeTwo',
        units: '%',
        minimumValue: 0,
        maximumValue: 100,
        color: 'orange',
        backgroundColor: gray20,
        shape: 'circle',
        trend: {
          /** the key to load the trend value from the values object. */
          dataSourceId: 'gaugeTwoTrend',
          color: '',
          trend: 'down',
        },
        thresholds: [
          {
            comparison: '>',
            value: 0,
            color: 'red',
            label: 'Poor',
          },
          {
            comparison: '>',
            value: 60,
            color: 'yellow',
            label: 'Fair',
          },
          {
            comparison: '>',
            value: 80,
            color: 'green',
            label: 'Good',
          },
        ],
      },
      {
        dataSourceId: 'gaugeThree',
        units: '%',
        minimumValue: 0,
        maximumValue: 100,
        color: 'orange',
        backgroundColor: gray20,
        shape: 'circle',
        trend: {
          /** the key to load the trend value from the values object. */
          dataSourceId: 'gaugeThreeTrend',
          color: '',
          trend: 'up',
        },
        thresholds: [
          {
            comparison: '>',
            value: 0,
            color: 'red',
            label: 'Poor',
          },
          {
            comparison: '>',
            value: 60,
            color: 'yellow',
            label: 'Fair',
          },
          {
            comparison: '>',
            value: 80,
            color: 'green',
            label: 'Good',
          },
        ],
      },
    ],
  });

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
          color: 'green',
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
      extraContent: (
        <svg height="10" width="30">
          <circle cx="5" cy="5" r="3" stroke="none" strokeWidth="1" fill="red" />
        </svg>
      ),
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
        <span>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid cumque in quam qui ut
          vero facilis autem. Laudantium enim accusantium facere nemo aspernatur repudiandae at,
          incidunt adipisci consequuntur ut, non, sint delectus labore id quaerat debitis quia
          veritatis autem aliquid voluptates? Quam perspiciatis aperiam perferendis incidunt rerum
          magni ratione iusto porro natus cumque omnis velit dolores, ipsa veniam! Maiores libero
          quam nam fugiat, voluptatum fuga ex architecto, enim similique quod, voluptates qui
          voluptas blanditiis tempora dolor assumenda quos numquam temporibus.
        </span>
      ),
    },
    {
      id: 'row-5',
      value: 'Row content 5',
    },
    { id: 'row-6', value: 'Row content 6' },
    { id: 'row-7', value: 'Row content 7' },
    { id: 'row-8', value: 'Row content 8' },
  ];

  const getValueCardPointsAndThresholdContent = () => ({
    attributes: [
      {
        label: 'Comfort Level',
        dataSourceId: 'comfortLevel',
        unit: '%',
        thresholds: [
          {
            comparison: '>',
            value: 80,
            color: '#F00',
            icon: 'warning',
          },
          {
            comparison: '<',
            value: 80,
            color: '#5aa700',
            icon: 'checkmark',
          },
        ],
      },
      {
        label: 'Average Temperature',
        dataSourceId: 'averageTemp',
        unit: '˚F',
        precision: 1,
        thresholds: [
          {
            comparison: '>',
            value: 80,
            color: '#F00',
            icon: 'warning',
          },
          {
            comparison: '<',
            value: 80,
            color: '#5aa700',
            icon: 'checkmark',
          },
        ],
      },
      {
        label: 'Air Flow',
        dataSourceId: 'airflow',
        precision: 4,
        thresholds: [
          {
            comparison: '>',
            value: 80,
            color: '#F00',
            icon: 'warning',
          },
          {
            comparison: '<',
            value: 80,
            color: '#5aa700',
            icon: 'checkmark',
          },
        ],
      },
      {
        label: 'Humidity',
        dataSourceId: 'humidity',
        unit: '˚F',
        precision: 0,
        thresholds: [
          {
            comparison: '>',
            value: 80,
            color: '#F00',
            icon: 'warning',
          },
          {
            comparison: '<',
            value: 80,
            color: '#5aa700',
            icon: 'checkmark',
          },
        ],
      },
    ],
  });

  const isResizable = true;

  let CARDS_TO_RENDER = [];
  switch (type) {
    case 'Card':
      CARDS_TO_RENDER = [
        ...Object.values(CARD_SIZES).map((size, index) => (
          <Card
            title={
              index === 0
                ? `Card - ${size} with a very long title that should truncate`
                : `Card - ${size}`
            }
            id={`card-${size}`}
            isResizable={isResizable}
            key={`card-${size}`}
            size={size}
            isEditable={index === 6}
            availableActions={{
              delete: index === 6,
              clone: index === 6,
              expand: index === 7,
              settings: index === 7,
              range: index === 4 ? 'iconOnly' : index === 2,
            }}
            timeRange={index === 2 ? 'last24Hours' : undefined}
            breakpoint={breakpoint}
            timeRangeOptions={
              index === 4
                ? {
                    last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
                    last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
                    last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
                    last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
                    last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
                    lastHour: { label: 'Last Hour', offset: 60 * 60 },
                  }
                : undefined
            }
            footerContent={
              index === 8
                ? () => (
                    <Button size="sm" kind="ghost">
                      Footer Content
                    </Button>
                  )
                : undefined
            }
            tooltip={index === 1 ? <p>this is the external tooltip content</p> : undefined}
          >
            {index === 4 ? (
              <p>This is a basic card with DateTimeRange picker</p>
            ) : index === 2 ? (
              <p>This is a basic card with CardRangePicker</p>
            ) : index === 3 ? (
              (childSize) => (
                <p>
                  Card with a renderprop. The content width is {childSize.width} and height is{' '}
                  {childSize.height}
                </p>
              )
            ) : index === 6 ? (
              <p>This is an editable card</p>
            ) : (
              <p>This is a basic card</p>
            )}
          </Card>
        )),
      ];
      break;
    case 'ValueCard':
      CARDS_TO_RENDER = [
        ...Object.values(CARD_SIZES).map((size) => (
          <ValueCard
            title={`ValueCard - ${size}`}
            id={`valueCard-${size}`}
            key={`valueCard-${size}`}
            size={size}
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
            breakpoint={breakpoint}
          />
        )),
        <ValueCard
          title="ValueCard - Truncation"
          id="valueCard-truncation"
          key="valueCard-truncation"
          size={CARD_SIZES.SMALL}
          isResizable={isResizable}
          content={{
            attributes: [
              {
                label: 'Tagpath',
                dataSourceId: 'footTraffic',
              },
            ],
          }}
          values={{
            footTraffic:
              'rutherford/rooms/northadd/ah2/ft_supflow/eurutherford/rooms/northadd/ah2/ft_supflow/eu',
          }}
          breakpoint={breakpoint}
        />,
        <ValueCard
          title="ValueCard - Trends and {a-variable}"
          id="valueCard-Trends-and-Variables"
          key="valueCard-Trends-and-Variables"
          cardVariables={{ 'a-variable': 'working' }}
          size={CARD_SIZES.SMALL}
          isResizable={isResizable}
          breakpoint={breakpoint}
          content={{
            attributes: [
              {
                dataSourceId: 'footTraffic',
                label: 'Walkers',
                secondaryValue: {
                  dataSourceId: 'trend',
                  trend: 'down',
                  color: 'red',
                },
              },
            ],
          }}
          values={{
            footTraffic: 13572,
            trend: '22%',
          }}
        />,
        <ValueCard
          title="ValueCard - Thresholds"
          id="valueCard-Thresholds"
          key="valueCard-Thresholds"
          size={CARD_SIZES.SMALL}
          isResizable={isResizable}
          breakpoint={breakpoint}
          renderIconByName={(name, theProps = {}) =>
            name === 'bee' ? (
              <Bee {...theProps}>
                <title>{theProps.title}</title>
              </Bee>
            ) : (
              <span>Unknown</span>
            )
          }
          content={{
            attributes: [
              {
                dataSourceId: 'alertCount',
                thresholds: [
                  {
                    comparison: '>',
                    value: 5,
                    icon: 'bee',
                    color: 'green',
                  },
                ],
              },
            ],
          }}
          values={{ alertCount: 70 }}
        />,
        <ValueCard
          title="ValueCard - String Thresholds"
          id="valueCard-String Thresholds"
          key="valueCard-String Thresholds"
          size={CARD_SIZES.SMALL}
          isResizable={isResizable}
          breakpoint={breakpoint}
          renderIconByName={(name, theProps = {}) =>
            name === 'close' ? (
              <Close {...theProps}>
                <title>{theProps.title}</title>
              </Close>
            ) : (
              <span>Unknown</span>
            )
          }
          content={{
            attributes: [
              {
                dataSourceId: 'status',
                thresholds: [
                  {
                    comparison: '=',
                    value: 'Healthy',
                    icon: 'checkmark',
                    color: 'green',
                  },
                  {
                    comparison: '=',
                    value: 'Unhealthy',
                    icon: 'close',
                    color: 'red',
                  },
                ],
              },
            ],
          }}
          values={{ status: 'Unhealthy' }}
        />,
        <ValueCard
          title="ValueCard - Multiple Data Points and Thresholds"
          key="ValueCard - Multiple Data Points and Thresholds"
          id="ValueCard - Multiple Data Points and Thresholds"
          breakpoint={breakpoint}
          content={getValueCardPointsAndThresholdContent()}
          size={CARD_SIZES.LARGETHIN}
          values={{
            comfortLevel: 345678234234234234,
            averageTemp: 456778234234234234,
            humidity: 50,
            airflow: 10000.4569,
          }}
          isNumberValueCompact={false}
          locale="fr"
          fontSize={42}
          onAttributeClick={() => {}}
        />,
        <ValueCard
          title="ValueCard - Horizontal Card with onAttributeClick and Two"
          key="ValueCard - Horizontal Card with onAttributeClick and Two"
          id="ValueCard - Horizontal Card with onAttributeClick and Two"
          content={{
            attributes: [
              {
                label: 'Device 1 Comfort',
                dataSourceId: 'comfortLevel',
                unit: '%',
                dataFilter: { deviceid: '73000' },
              },
              {
                label: 'Device 2 Comfort',
                dataSourceId: 'comfortLevel',
                unit: '%',
                dataFilter: { deviceid: '73001' },
              },
            ],
          }}
          breakpoint={breakpoint}
          size={CARD_SIZES.MEDIUMWIDE}
          values={[
            { deviceid: '73000', comfortLevel: '100', unit: '%' },
            { deviceid: '73001', comfortLevel: '50', unit: '%' },
          ]}
          fontSize={42}
          onAttributeClick={() => {}}
        />,
      ];
      break;
    case 'GaugeCard':
      CARDS_TO_RENDER = [
        ...Object.values(CARD_SIZES).map((size) => (
          <GaugeCard
            id={`gaugeCard-${size}`}
            key={`gaugeCard-${size}`}
            isResizable={isResizable}
            size={size}
            title={`GaugeCard - ${size}`}
            content={gaugeCardContent}
            tooltip={<p>Health - of floor 8</p>}
            breakpoint={breakpoint}
            values={{
              usage: 81,
              usageTrend: '12%',
            }}
          />
        )),
        <GaugeCard
          id="gaugeCard-loading"
          key="gaugeCard-loading"
          isResizable={isResizable}
          size={CARD_SIZES.SMALL}
          title="GaugeCard - loading"
          content={gaugeCardContent}
          tooltip={<p>Health - of floor 8</p>}
          breakpoint={breakpoint}
          values={{
            usage: 81,
            usageTrend: '12%',
          }}
          isLoading
        />,
        <GaugeCard
          tooltip={<p>Health - of floor 8</p>}
          id="GaugeCard - Multiple Thresholds"
          key="GaugeCard - Multiple Thresholds"
          title="GaugeCard - MediumThin with Multiple Gauges"
          size={CARD_SIZES.MEDIUMTHIN}
          breakpoint={breakpoint}
          values={{
            usage: 81,
            usageTrend: '12%',
            gaugeTwo: 32,
            gaugeTwoTrend: '23%',
            gaugeThree: 74,
            gaugeThreeTrend: '9%',
          }}
          content={getMultipleGaugeContent()}
        />,
      ];
      break;
    case 'PieChartCard':
      CARDS_TO_RENDER = [
        ...Object.values(omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL')).map((size, index) => (
          <PieChartCard
            content={getPieChartCardContent(index)}
            title={`PieChartCard - ${size}`}
            key={`pieChartCard-${size}`}
            id={`pieChartCard-${size}`}
            size={size}
            isResizable={isResizable}
            values={pieChartCardValues}
            breakpoint={breakpoint}
            testId={`pieChartCard-${size}`}
          />
        )),
        <PieChartCard
          content={{
            groupDataSourceId: 'category',
            legendPosition: 'bottom',
            legendAlignment: 'center',
          }}
          title="PieChartCard - CenterAligned"
          key="pieChartCard-CenterAligned"
          id="pieChartCard-CenterAligned"
          size={CARD_SIZES.MEDIUM}
          isResizable={isResizable}
          values={pieChartCardValues}
          breakpoint={breakpoint}
        />,
        <PieChartCard
          content={{
            groupDataSourceId: 'category',
            legendPosition: 'bottom',
            legendAlignment: 'right',
          }}
          title="PieChartCard - RightAligned"
          key="pieChartCard-RightAligned"
          id="pieChartCard-RightAligned"
          size={CARD_SIZES.MEDIUM}
          isResizable={isResizable}
          values={pieChartCardValues}
          breakpoint={breakpoint}
        />,
      ];
      break;
    case 'TableCard':
      CARDS_TO_RENDER = [
        ...Object.values(
          omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL', 'SMALLTHICK', 'MEDIUMTHICK')
        ).map((size, index) => (
          <TableCard
            title={`TableCard - ${size}`}
            id={`tableCard-${size}`}
            key={`tableCard-${size}`}
            cardVariables={{
              company: 'ibm',
              pressureId: '012345',
            }}
            testId={`tableCard-${size}`}
            content={getTableCardColumns(index)}
            values={
              index === 5
                ? tableData.map((row) => {
                    return {
                      ...row,
                      actions: actions1,
                    };
                  })
                : tableData
            }
            onCardAction={() => {}}
            size={size}
            isResizable={isResizable}
            breakpoint={breakpoint}
            filters={index === 0 ? [{ columnId: 'alert', value: 'failure' }] : undefined}
            i18n={
              index === 0
                ? {
                    clearAllFilters: '__Clear all filters__',
                  }
                : undefined
            }
            renderIconByName={(name, theProps = {}) =>
              name === 'bee' ? (
                <Bee {...theProps}>
                  <title>{theProps.title}</title>
                </Bee>
              ) : (
                <span>Unknown</span>
              )
            }
          />
        )),
      ];
      break;
    case 'ImageCard':
      CARDS_TO_RENDER = [
        ...Object.values(omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL', 'LARGETHIN')).map(
          (size) => (
            <ImageCard
              title={`ImageCard - ${size}`}
              id={`imageCard-${size}`}
              isResizable={isResizable}
              key={`imageCard-${size}`}
              size={size}
              content={{
                alt: 'Sample image',
                src: landscape,
                zoomMax: 10,
              }}
              values={imageCardValues}
              breakpoint={breakpoint}
              testId={`imageCard-${size}`}
            />
          )
        ),
        <ImageCard
          title="ImageCard - Loading"
          id="imageCard-Loading"
          isResizable={isResizable}
          key="imageCard-Loading"
          size={CARD_SIZES.MEDIUM}
          content={{
            alt: 'Sample image',
            src: landscape,
            zoomMax: 10,
          }}
          isLoading
          values={imageCardValues}
          breakpoint={breakpoint}
        />,
        <ImageCard
          title="ImageCard - Error"
          id="imageCard-Error"
          isResizable={isResizable}
          key="imageCard-Error"
          size={CARD_SIZES.MEDIUM}
          content={{
            alt: 'Sample image',
            src: landscape,
            zoomMax: 10,
          }}
          values={imageCardValues}
          breakpoint={breakpoint}
          error="API threw Nullpointer"
        />,
      ];
      break;
    case 'TimeSeriesCard':
      CARDS_TO_RENDER = [
        ...Object.values(omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL')).map((size, index) => (
          <TimeSeriesCard
            id={`timeSeriesCard-${size}`}
            isResizable={isResizable}
            size={size}
            title={`TimeSeriesCard - ${size}`}
            chartType="LINE"
            content={timeSeriesCardContent(index)}
            key={`timeSeriesCard-${size}`}
            interval="hour"
            values={chartData.events.slice(0, 5)}
            breakpoint={breakpoint}
            locale={index === 5 ? 'fr' : 'en'}
            testId={`timeSeriesCard-${size}`}
          />
        )),
      ];
      break;
    case 'ListCard':
      CARDS_TO_RENDER = [
        ...Object.values(omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL')).map((size) => (
          <ListCard
            id={`listCard-${size}`}
            isResizable={isResizable}
            key={`listCard-${size}`}
            title={`ListCard - ${size}`}
            size={size}
            data={listCardData}
            hasMoreData={false}
            loadData={() => {}}
            breakpoint={breakpoint}
          />
        )),
      ];
      break;
    case 'BarChartCard':
      CARDS_TO_RENDER = [
        ...Object.values(omit(CARD_SIZES, 'SMALL', 'SMALLWIDE', 'SMALLFULL')).map((size, index) => (
          <BarChartCard
            id={`barChartCard-${size}`}
            key={`barChartCard-${size}`}
            size={size}
            isResizable={isResizable}
            title={`BarChartCard - ${size}`}
            content={getBarChartCardContent(index)}
            values={barChartCardValues(index)}
            locale={index === 5 ? 'fr' : 'en'}
            breakpoint={breakpoint}
            testId={`barChartCard-${size}`}
          />
        )),
      ];
      break;
    default:
      CARDS_TO_RENDER = [];
  }

  return (
    <Fragment>
      <p>
        All cards are resizable by dragging and the card size prop is automatically updated to match
        the new size during the drag process. Some cards have a minimal size defined.
      </p>
      <FullWidthWrapper>
        <DashboardGrid {...commonGridProps} breakpoint={breakpoint}>
          {CARDS_TO_RENDER}
        </DashboardGrid>
      </FullWidthWrapper>
    </Fragment>
  );
};

const BREAKPOINTS = ['max', 'xl', 'lg', 'md', 'sm', 'xs'];
const CARD_TYPES = [
  'BarChartCard',
  'Card',
  'GaugeCard',
  'ListCard',
  'PieChartCard',
  'TableCard',
  'TimeSeriesCard',
  'ValueCard',
];

DashboardAllCardsAsResizable.propTypes = {
  breakpoint: PropTypes.oneOf(BREAKPOINTS).isRequired,
  type: PropTypes.oneOf(CARD_TYPES).isRequired,
};

describe('DashboardGrid-lg-Card', () => {
  beforeEach(() => {
    MockDate.set(1537538254000);
    cy.viewport(1024, 900);
  });
  afterEach(() => {
    MockDate.reset();
  });

  it('Renders default date range picker in a card', () => {
    const size = CARD_SIZES.SMALLFULL;

    mount(
      <div data-testid="visual-regression-test" style={{ padding: '3rem', height: '700px' }}>
        <Card
          title={`Card - ${size}`}
          id={`card-${size}`}
          isResizable
          key={`card-${size}`}
          size={size}
          isEditable={false}
          availableActions={{
            range: true,
          }}
          timeRange="last24Hours"
          breakpoint="lg"
          timeRangeOptions={undefined}
          footerContent={undefined}
        >
          <p>This is a basic card with CardRangePicker</p>
        </Card>
      </div>
    );

    cy.findByTestId('visual-regression-test').should('be.visible');
    cy.findByTestId('Card-toolbar-range-picker').click();

    onlyOn('headless', () => {
      cy.findByTestId('visual-regression-test').compareSnapshot(
        `DashboardGrid-lg-Card--with-range-picker`
      );
    });
  });

  it('Renders date range picker with presets in a card', () => {
    const size = CARD_SIZES.MEDIUMTHIN;

    mount(
      <div data-testid="visual-regression-test" style={{ padding: '3rem', height: '700px' }}>
        <Card
          title={`Card - ${size}`}
          id={`card-${size}`}
          isResizable
          key={`card-${size}`}
          size={size}
          isEditable={false}
          availableActions={{
            range: 'iconOnly',
          }}
          timeRange={undefined}
          breakpoint="lg"
          timeRangeOptions={{
            last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
            last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
            last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
            last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
            last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
            lastHour: { label: 'Last Hour', offset: 60 * 60 },
          }}
          footerContent={undefined}
          tooltip={undefined}
        >
          <p>This is a basic card with DateTimeRange picker</p>
        </Card>
      </div>
    );

    cy.findByTestId('visual-regression-test').should('be.visible');
    cy.findByTestId('date-time-picker-datepicker-flyout-button').click();
    onlyOn('headless', () => {
      cy.findByTestId('visual-regression-test').compareSnapshot(
        `DashboardGrid-lg-Card--with-datetimerange-picker`
      );
    });
  });
});

describe('DashboardGrid', () => {
  beforeEach(() => {
    MockDate.set(1537538254000);
    cy.viewport(1920, 1080);
  });
  afterEach(() => {
    MockDate.reset();
  });
  ['lg'].forEach((breakpoint) => {
    CARD_TYPES.forEach((type) => {
      it(`matches image snapshot - ${breakpoint}, ${type}`, () => {
        switch (breakpoint) {
          case 'max':
            cy.viewport(1680, 900);
            break;
          case 'xl':
            cy.viewport(1440, 900);
            break;
          case 'lg':
            cy.viewport(1024, 900);
            break;
          case 'md':
            cy.viewport(658, 900);
            break;
          case 'sm':
            cy.viewport(470, 900);
            break;
          case 'xs':
            cy.viewport(300, 900);
            break;
          default:
            break;
        }

        mount(
          <div
            data-testid="visual-regression-test"
            style={{ padding: breakpoint === 'xs' ? 0 : '3rem' }}
          >
            <DashboardAllCardsAsResizable
              key={`${breakpoint}-${type}`}
              breakpoint={breakpoint}
              type={type}
            />
          </div>
        );

        cy.findByTestId('visual-regression-test').should('be.visible');

        if (type === 'TableCard') {
          cy.findByTestId('tableCard-LARGETHIN').within(() => {
            cy.findAllByRole('button', { name: 'Click to expand content' }).eq(2).click();
          });
        }

        if (type === 'ImageCard') {
          cy.findByTestId('imageCard-LARGE').within(() => {
            cy.findByTitle('Zoom in').click();
          });
          cy.findAllByTestId('hotspot-35-65').eq(0).click();
        }

        if (type === 'Card') {
          cy.findByTestId('Card-toolbar-range-picker').click();
        }

        onlyOn('headless', () => {
          if (type === 'GaugeCard') {
            // eslint-disable-next-line cypress/no-unnecessary-waiting, allow the gauges to fill
            cy.wait(1000);
          }
          cy.findByTestId('visual-regression-test').compareSnapshot(
            `DashboardGrid-${breakpoint}-${type}`
          );
        });
      });
    });
  });
});
