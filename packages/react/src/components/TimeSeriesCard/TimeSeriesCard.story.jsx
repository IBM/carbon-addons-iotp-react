import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, object, boolean, number } from '@storybook/addon-knobs';
import { spacing05 } from '@carbon/layout';

import { COLORS, CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import { getIntervalChartData, chartData } from '../../utils/sample';

import TimeSeriesCard from './TimeSeriesCard';
// import TimeSeriesCardREADME from './TimeSeriesCard.mdx'; //carbon 11

const commonProps = {
  id: 'facility-temperature',
  availableActions: { range: true, expand: true },
};

export default {
  // title: __DEV__ ? '1 - Watson IoT/Card/⚠️ TimeSeriesCard' : '1 - Watson IoT/Card/TimeSeriesCard', //carbon 11
  title: '1 - Watson IoT/Card/⚠️ TimeSeriesCard',
  parameters: {
    component: TimeSeriesCard,
    // docs: {
    //   page: TimeSeriesCardREADME,
    // }, //carbon 11
  },
};

export const SinglePoint = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature {a-variable}')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        cardVariables={object('cardVariables', {
          'a-variable': 'with variables',
        })}
        content={object('content', {
          series: [
            {
              label: 'Temperature {a-variable}',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time {a-variable}',
          yLabel: 'Temperature {a-variable} (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
          decimalPrecision: 1,
          showLegend: true,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData(interval, 1, { min: 10, max: 100 }, 100)}
        interval={interval}
        breakpoint={breakpoint}
        size={size}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        onCardAction={action('onCardAction')}
        tooltipDateFormatPattern={text('tooltipDateFormatPattern', 'L HH:mm:ss')}
      />
    </div>
  );
};

SinglePoint.storyName = 'with single point and variables';

export const SingleLineIntervalDataChoices = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const interval = select(
    'interval',
    ['minute', 'hour', 'day', 'week', 'quarter', 'month', 'year'],
    'minute'
  );
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={{
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature',
          includeZeroOnXaxis: false,
          includeZeroOnYaxis: false,
          unit: text('content.unit', '˚F'),
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', true),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
          addSpaceOnEdges: 1,
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={boolean('content.zoomBar.enabled', true) ? 'with zoombar' : 'without zoom bar'}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData(
          interval,
          number('numberOfDataPoints', 15),
          {
            min: number('minimumDataPointRange', 470000),
            max: number('maximumDataPointRange', 480000),
          },
          100
        )}
        interval={interval}
        breakpoint={breakpoint}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

SingleLineIntervalDataChoices.storyName =
  'with single line, intervals, configurable data points, and zoomBar';

export const MultiLineIntervalDataChoices = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const interval = select(
    'interval',
    ['minute', 'hour', 'day', 'week', 'quarter', 'month', 'year'],
    'minute'
  );
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature, Humidity, eCount, and Pressure')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        tooltipShowTotals={boolean('tooltipShowTotals', true)}
        content={{
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
            {
              label: 'Ecount',
              dataSourceId: 'ecount',
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
            },
          ],
          xLabel: text('content.xLabel', 'Time'),
          yLabel: text('content.yLabel', ''),
          includeZeroOnXaxis: false,
          includeZeroOnYaxis: false,
          unit: text('content.unit', ''),
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', true),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
          addSpaceOnEdges: 1,
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={
          boolean('content.zoomBar.enabled', true)
            ? `with zoombar-${size}`
            : `without zoom bar-${size}`
        }
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData(
          interval,
          number('numberOfDataPoints', 15),
          {
            min: number('minimumDataPointRange', 10),
            max: number('maximumDataPointRange', 100),
          },
          10
        )}
        interval={interval}
        breakpoint={breakpoint}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

MultiLineIntervalDataChoices.storyName =
  'with multiple lines, intervals, configurable data points, and zoomBar';

export const CustomColors = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.MAGENTA,
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: COLORS.TEAL,
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData(interval, 12, { min: 10, max: 100 }, 100)}
        interval={interval}
        breakpoint={breakpoint}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

CustomColors.storyName = 'with custom colors';

export const DomainRange = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const data = getIntervalChartData('day', 50, { min: 10, max: 100 }, 100);
  const timestamps = data.map((d) => d.timestamp);
  const minDate = new Date(Math.min(...timestamps));
  const day = minDate.getDay();
  minDate.setDate(day + 10);

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time t',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={data}
        availableActions={{ range: true }}
        interval="hour"
        breakpoint={breakpoint}
        size={size}
        onCardAction={action('onCardAction')}
        domainRange={[minDate.valueOf(), Math.max(...timestamps)]}
      />
    </div>
  );
};

DomainRange.storyName = 'with domainRange';

export const HighlightAlertRanges = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature and Pressure',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          alertRanges: [
            {
              startTimestamp: 1572313622000,
              endTimestamp: 1572486422000,
              color: '#FF0000',
              details: 'Alert name',
              inputSource: {
                dataSourceIds: ['pressure'],
              },
            },
            {
              startTimestamp: 1572313622000,
              endTimestamp: 1572824320000,
              color: '#FFCC00',
              details: 'Less severe',
              inputSource: {
                dataSourceIds: ['temperature'],
              },
            },
            {
              startTimestamp: 1572651520000,
              endTimestamp: 1572651520000,
              color: '#00FF00',
              details: 'Check humidity Alert',
              inputSource: {
                dataSourceIds: ['humidity'],
              },
            },
          ],
          addSpaceOnEdges: 1,
          zoomBar: {
            enabled: true,
            axes: 'top',
            view: 'graph_view',
          },
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData('day', 7, { min: 10, max: 100 }, 100, 1572824320000)}
        interval="hour"
        breakpoint={breakpoint}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

HighlightAlertRanges.storyName = 'with highlight alert ranges';

export const EmptyForARange = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.PURPLE,
            },
          ],
          timeDataSourceId: 'timestamp',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        range="day"
        interval="hour"
        breakpoint={breakpoint}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        values={chartData.events.slice(0, 20)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

EmptyForARange.storyName = 'with empty for a range';

export const IsEditable = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', true)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.PURPLE,
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: COLORS.MAGENTA,
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
              color: COLORS.TEAL,
            },
          ],
          xLabel: 'Time',

          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        interval={select('interval', ['hour', 'day', 'week', 'month', 'year'], 'hour')}
        breakpoint={breakpoint}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

IsEditable.storyName = 'with isEditable';

export const IsExpanded = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  // needs static data so that the snapshot will always retain the same values
  const staticData = [
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 20,
      humidity: 5.51,
      ecount: 6,
      devname: '6ctgim0Qcq',
      pressure: 7.4,
      status: true,
      timestamp: 1569945252000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 19,
      humidity: 7.36,
      ecount: 58,
      devname: '6ctgim0Qcq',
      pressure: 9.21,
      status: true,
      timestamp: 1567353252000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 29,
      humidity: 3.32,
      ecount: 32,
      devname: '6ctgim0Qcq',
      pressure: 9.58,
      status: true,
      timestamp: 1564674852000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 86,
      humidity: 2.98,
      ecount: 45,
      devname: '6ctgim0Qcq',
      pressure: 8.72,
      status: true,
      timestamp: 1561996452000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 11,
      humidity: 9.25,
      ecount: 38,
      devname: '6ctgim0Qcq',
      pressure: 9.57,
      status: true,
      timestamp: 1559404452000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 35,
      humidity: 8.15,
      ecount: 18,
      devname: '6ctgim0Qcq',
      pressure: 8.3,
      status: true,
      timestamp: 1556726052000,
    },
  ];
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', true)}
        content={object('content', {
          series: [
            {
              label: 'Temp',
              dataSourceId: 'temperature',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
            {
              label: 'Electricity',
              dataSourceId: 'ecount',
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
          decimalPrecision: 2,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
          },
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={staticData}
        interval="month"
        breakpoint={breakpoint}
        size={size}
      />
    </div>
  );
};

IsExpanded.storyName = 'with isExpanded';

export const DataFilter = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        key="dataFilter"
        isEditable={boolean('isEditable', false)}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature Device 1',
              dataSourceId: 'temperature',
              dataFilter: {
                ENTITY_ID: 'Sensor2-1',
              },
              color: text('color1', COLORS.MAGENTA),
            },
            {
              label: 'Temperature Device 2',
              dataSourceId: 'temperature',
              dataFilter: {
                ENTITY_ID: 'Sensor2-3',
              },
              color: text('color2', COLORS.BLUE),
            },
          ],
          unit: '˚F',
          xLabel: 'Time',
          yLabel: 'Temperature',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={getIntervalChartData('day', 12, { min: 10, max: 100 }, 100).reduce(
          (acc, dataPoint) => {
            // make "two devices worth of data" so that we can filter
            acc.push(dataPoint);
            acc.push({
              ...dataPoint,
              temperature: dataPoint.temperature / 2,
              ENTITY_ID: 'Sensor2-3',
            });
            return acc;
          },
          []
        )}
        interval="day"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        breakpoint={breakpoint}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

DataFilter.storyName = 'with dataFilter';

export const Thresholds = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  const values = getIntervalChartData(interval, 20, { min: 10, max: 100 }, 100);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Pressure')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        isEditable
        content={object('content', {
          series: [
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: text('color', COLORS.MAGENTA),
            },
          ],
          unit: 'm/sec',
          xLabel: 'Time',
          yLabel: 'Pressure',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
          thresholds: [
            { axis: 'y', value: values[0].pressure, fillColor: 'red', label: 'Alert 1' },
            { axis: 'x', value: values[0].timestamp, fillColor: '#ffcc00', label: 'Alert 2' },
          ],
        })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        values={values}
        interval={interval}
        breakpoint={breakpoint}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
        i18n={{
          tooltipGroupLabel: 'Translated Group',
        }}
      />
    </div>
  );
};

Thresholds.storyName = 'with thresholds';
