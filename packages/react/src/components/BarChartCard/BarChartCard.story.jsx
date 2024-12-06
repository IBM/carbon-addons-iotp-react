import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, object, boolean, number } from '@storybook/addon-knobs';

import { CARD_SIZES, BAR_CHART_TYPES, BAR_CHART_LAYOUTS } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import { barChartData } from '../../utils/barChartDataSample';
import { getIntervalChartData } from '../../utils/sample';

import BarChartCard from './BarChartCard';
// import BarChartCardREADME from './BarChartCard.mdx'; carbon 11 need to check

const COLORS = ['blue', 'red', 'green', 'yellow'];

const sizes = Object.keys(CARD_SIZES).filter(
  (size) => size.includes('MEDIUM') || size.includes('LARGE')
);

const layouts = Object.keys(BAR_CHART_LAYOUTS);

export default {
  // title: __DEV__ ? '1 - Watson IoT/Card/⚠️ BarChartCard' : '1 - Watson IoT/Card/BarChartCard',
  title: '1 - Watson IoT/Card/⚠️ BarChartCard',
  parameters: {
    component: BarChartCard,
    // docs: {
    //   page: BarChartCardREADME,
    // }, //carbon 11
  },
};

export const SimpleBar = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles by city')}
        id="simple-sample"
        breakpoint={breakpoint}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpandable', false)}
        content={{
          ...object('content', {
            xLabel: 'Cities',
            yLabel: 'Particles',
            series: [
              {
                dataSourceId: 'particles',
                color: COLORS,
              },
            ],
            categoryDataSourceId: 'city',
            type: BAR_CHART_TYPES.SIMPLE,
            unit: 'P',
          }),
          layout: select('content.layout', layouts, BAR_CHART_LAYOUTS.VERTICAL),
        }}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        values={
          boolean('with no data', false)
            ? []
            : barChartData.quarters.filter((a) => a.quarter === '2020-Q1')
        }
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true })}
      />
    </div>
  );
};

SimpleBar.storyName = 'with simple bar';

export const SimpleBarTimeSeriesCustomDomainRange = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles over 4 days')}
        id="simple-time-sample"
        breakpoint={breakpoint}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        content={{
          ...object('content', {
            xLabel: 'Date',
            yLabel: 'Particles',
            series: [
              {
                dataSourceId: 'particles',

                label: 'Particles really long label to check trunc',
              },
            ],
            timeDataSourceId: 'timestamp',
            type: 'SIMPLE',
          }),
          layout: select('content.layout', layouts, BAR_CHART_LAYOUTS.VERTICAL),
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', false),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={`${boolean('content.zoomBar.enabled', false)}-${select(
          'content.layout',
          layouts,
          BAR_CHART_LAYOUTS.VERTICAL
        )}`}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        domainRange={object('domainRange', [1581251825000, 1581524625000])}
        values={
          boolean('with no data', false)
            ? []
            : barChartData.timestamps.filter((t) => t.city === 'Amsterdam')
        }
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true, range: true })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
      />
    </div>
  );
};

SimpleBarTimeSeriesCustomDomainRange.storyName =
  'with simple bar of time series data and custom domainRange';

export const SimpleBarTimeSeries = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const interval = select(
    'interval',
    ['minute', 'hour', 'day', 'week', 'quarter', 'month', 'year'],
    'minute'
  );
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Temperature over time')}
        id="simple-time-sample"
        breakpoint={breakpoint}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        content={{
          ...object('content', {
            xLabel: 'Date',
            yLabel: 'Temperature',
            series: [
              {
                dataSourceId: 'temperature',

                label: 'Temperature really long label to check trunc',
              },
            ],
            timeDataSourceId: 'timestamp',
            type: 'SIMPLE',
          }),
          layout: select('content.layout', layouts, BAR_CHART_LAYOUTS.VERTICAL),
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', false),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={`${boolean('content.zoomBar.enabled', false)}-${select(
          'content.layout',
          layouts,
          BAR_CHART_LAYOUTS.VERTICAL
        )}`}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
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
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
      />
    </div>
  );
};

SimpleBarTimeSeries.storyName = 'with simple bar of time series data and intervals';

export const GroupedBar = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles and temperature in cities')}
        id="grouped-sample"
        breakpoint={breakpoint}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpandable', false)}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        content={{
          ...object('content', {
            type: BAR_CHART_TYPES.GROUPED,
            xLabel: 'Cities',
            yLabel: 'Total',
            series: [
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
            ],
            categoryDataSourceId: 'city',
          }),
          layout: select('content.layout', layouts, BAR_CHART_LAYOUTS.VERTICAL),
        }}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        values={
          boolean('with no data', false)
            ? []
            : barChartData.quarters.filter((a) => a.quarter === '2020-Q1')
        }
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true })}
      />
    </div>
  );
};

GroupedBar.storyName = 'with grouped bar';

export const StackedBar = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles and temperature in cities')}
        id="stacked-sample"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpandable', false)}
        breakpoint={breakpoint}
        content={{
          ...object('content', {
            type: BAR_CHART_TYPES.STACKED,
            xLabel: 'Cities',
            yLabel: 'Total',
            series: [
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
            ],
            categoryDataSourceId: 'city',
          }),
          layout: select('content.layout', layouts, BAR_CHART_LAYOUTS.VERTICAL),
        }}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        values={
          boolean('with no data', false)
            ? []
            : barChartData.quarters.filter((a) => a.quarter === '2020-Q3')
        }
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
      />
    </div>
  );
};

StackedBar.storyName = 'with stacked bar';

export const StackedBarTimeSeries = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles / emissions over 4 days')}
        id="stacked-horizontal-sample"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpandable', false)}
        breakpoint={breakpoint}
        content={{
          type: BAR_CHART_TYPES.STACKED,
          xLabel: 'Dates',
          yLabel: 'Total',
          series: [
            {
              dataSourceId: 'particles',
              label: 'Particles',
            },
            {
              dataSourceId: 'emissions',
              label: 'Emissions',
            },
          ],
          timeDataSourceId: 'timestamp',
          layout: select(`content.layout`, layouts, BAR_CHART_LAYOUTS.VERTICAL),
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', false),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={boolean('content.zoomBar.enabled', false) ? 'with zoombar' : 'without zoom bar'}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        values={boolean('with no data', false) ? [] : barChartData.timestamps}
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true, range: true })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
      />
    </div>
  );
};

StackedBarTimeSeries.storyName = 'with stacked bar of time series data';

export const StackedBarTimeSeriesWithCategories = () => {
  const size = select('size', sizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <BarChartCard
        title={text('title', 'Particles by city over time')}
        id="stacked-horizontal-sample"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpandable', false)}
        breakpoint={breakpoint}
        content={{
          type: BAR_CHART_TYPES.STACKED,
          xLabel: 'Dates',
          yLabel: 'Total',
          series: [
            {
              dataSourceId: 'particles',
            },
          ],
          timeDataSourceId: 'timestamp',
          categoryDataSourceId: select('content.categoryDataSourceId', ['city'], 'city'),
          layout: select(`content.layout`, layouts, BAR_CHART_LAYOUTS.VERTICAL),
          zoomBar: {
            enabled: boolean('content.zoomBar.enabled', false),
            axes: 'top',
            view: select('content.zoomBar.view', ['slider_view', 'graph_view'], 'slider_view'),
          },
        }}
        // key is a simple storybook hack to force the chart to re-render when zoomBar changes,
        // otherwise carbon-charts won't automatically re-render it (even in their own stories).
        key={boolean('content.zoomBar.enabled', false) ? 'with zoombar' : 'without zoom bar'}
        i18n={object('i18n', {
          noDataLabel: 'No data for this card.',
        })}
        values={boolean('with no data', false) ? [] : barChartData.timestamps}
        size={size}
        onCardAction={action('onCardAction')}
        availableActions={object('availableActions', { expand: true, range: true })}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
      />
    </div>
  );
};

StackedBarTimeSeriesWithCategories.storyName =
  'with stacked bar of time series data and categories';
