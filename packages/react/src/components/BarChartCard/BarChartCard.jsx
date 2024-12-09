import React, { useCallback, useMemo, useRef } from 'react';
import { SimpleBarChart, StackedBarChart, GroupedBarChart } from '@carbon/charts-react';
import classnames from 'classnames';
import { isEmpty, isNil, defaultsDeep } from 'lodash-es';

import { BarChartCardPropTypes, CardPropTypes } from '../../constants/CardPropTypes';
import {
  CARD_SIZES,
  BAR_CHART_TYPES,
  BAR_CHART_LAYOUTS,
  ZOOM_BAR_ENABLED_CARD_SIZES,
} from '../../constants/LayoutConstants';
import Card from '../Card/Card';
import { settings } from '../../constants/Settings';
import {
  chartValueFormatter,
  getResizeHandles,
  handleCardVariables,
  increaseSmallCardSize,
} from '../../utils/cardUtilityFunctions';
import StatefulTable from '../Table/StatefulTable';
import { csvDownloadHandler } from '../../utils/componentUtilityFunctions';
import dayjs, { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';
import { formatGraphTick } from '../TimeSeriesCard/timeSeriesUtils';

import {
  generateSampleValues,
  generateSampleValuesForEditor,
  formatChartData,
  mapValuesToAxes,
  formatColors,
  handleTooltip,
  generateTableColumns,
  formatTableData,
  getMaxTicksPerSize,
} from './barChartUtils';

const { iotPrefix } = settings;

const defaultProps = {
  size: CARD_SIZES.MEDIUMWIDE,
  i18n: {
    noDataLabel: 'No data',
    tooltipGroupLabel: 'Group',
    tooltipTotalLabel: 'Total',
    defaultFilterStringPlaceholdText: 'Filter',
  },
  domainRange: null,
  content: {
    type: BAR_CHART_TYPES.SIMPLE,
    layout: BAR_CHART_LAYOUTS.VERTICAL,
    legendPosition: 'bottom',
    truncation: {
      type: 'end_line',
      threshold: 20,
      numCharacter: 20,
    },
    series: [],
  },
  locale: 'en',
  showTimeInGMT: false,
  tooltipDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
  values: null,
  defaultDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
};

const BarChartCard = ({
  title: titleProp,
  content,
  children,
  size: sizeProp,
  values: initialValues,
  availableDimensions,
  locale,
  i18n,
  isExpanded,
  isLazyLoading,
  isEditable,
  isDashboardPreview,
  isLoading,
  isResizable,
  interval,
  className,
  domainRange,
  timeRange,
  showTimeInGMT,
  tooltipDateFormatPattern,
  // TODO: remove deprecated testID in v3.
  testID,
  testId,
  defaultDateFormatPattern,
  ...others
}) => {
  // need to deep merge the nested content default props as default props only uses a shallow merge natively
  const contentWithDefaults = useMemo(
    () => defaultsDeep({}, content, defaultProps.content),
    [content]
  );
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const {
    title,
    content: {
      series,
      timeDataSourceId,
      categoryDataSourceId,
      layout,
      xLabel,
      yLabel,
      unit,
      type,
      legendPosition,
      zoomBar,
      decimalPrecision,
      truncation,
    },
    values: valuesProp,
  } = handleCardVariables(titleProp, contentWithDefaults, initialValues, others);

  const size = useMemo(() => increaseSmallCardSize(sizeProp, 'BarChartCard'), [sizeProp]);

  const resizeHandles = useMemo(
    () => (isResizable ? getResizeHandles(children) : []),
    [children, isResizable]
  );

  const memoizedGenerateSampleValues = useMemo(
    () =>
      isEditable
        ? generateSampleValues(series, timeDataSourceId, interval, timeRange, categoryDataSourceId)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, interval, timeRange, isEditable]
  );

  const memoizedGenerateSampleValuesForEditor = useMemo(
    () =>
      isDashboardPreview
        ? generateSampleValuesForEditor(
            series,
            timeDataSourceId,
            interval,
            timeRange,
            categoryDataSourceId,
            availableDimensions
          )
        : [],
    [
      isDashboardPreview,
      series,
      timeDataSourceId,
      categoryDataSourceId,
      interval,
      timeRange,
      availableDimensions,
    ]
  );

  // If editable, show sample presentation data
  // If there is no series defined, there is no datasets to make sample data from
  const values = useMemo(
    () =>
      isDashboardPreview
        ? memoizedGenerateSampleValuesForEditor
        : isEditable && !isEmpty(series)
        ? memoizedGenerateSampleValues
        : valuesProp,
    [
      isDashboardPreview,
      isEditable,
      memoizedGenerateSampleValues,
      memoizedGenerateSampleValuesForEditor,
      series,
      valuesProp,
    ]
  );

  const chartData = useMemo(
    () =>
      formatChartData(
        series,
        values,
        categoryDataSourceId,
        timeDataSourceId,
        type,
        isDashboardPreview
      ),
    [categoryDataSourceId, isDashboardPreview, series, timeDataSourceId, type, values]
  );

  const isAllValuesEmpty = useMemo(() => isEmpty(chartData), [chartData]);

  let ChartComponent = SimpleBarChart;
  if (type === BAR_CHART_TYPES.GROUPED) {
    ChartComponent = GroupedBarChart;
  } else if (type === BAR_CHART_TYPES.STACKED) {
    ChartComponent = StackedBarChart;
  }

  const scaleType = useMemo(() => (timeDataSourceId ? 'time' : 'labels'), [timeDataSourceId]);

  const axes = useMemo(
    () => mapValuesToAxes(layout, categoryDataSourceId, timeDataSourceId, type),
    [categoryDataSourceId, layout, timeDataSourceId, type]
  );

  // Set the colors for each dataset
  const uniqueDatasets = useMemo(
    () => (!isAllValuesEmpty ? [...new Set(chartData.map((dataset) => dataset.group))] : []),
    [chartData, isAllValuesEmpty]
  );

  const colors = useMemo(
    () =>
      !isAllValuesEmpty ? formatColors(series, uniqueDatasets, isDashboardPreview, type) : null,
    [isAllValuesEmpty, isDashboardPreview, series, type, uniqueDatasets]
  );

  const tableColumns = useMemo(() => {
    return isAllValuesEmpty
      ? []
      : generateTableColumns(
          timeDataSourceId,
          categoryDataSourceId,
          type,
          uniqueDatasets,
          mergedI18n.defaultFilterStringPlaceholdText
        ).map((column) => ({
          ...column,
          renderDataFunction: ({ value }) => {
            if (typeof value === 'number' && !isNil(decimalPrecision)) {
              return chartValueFormatter(value, size, unit, locale, decimalPrecision);
            }
            return value;
          },
        }));
  }, [
    categoryDataSourceId,
    decimalPrecision,
    mergedI18n.defaultFilterStringPlaceholdText,
    isAllValuesEmpty,
    locale,
    size,
    timeDataSourceId,
    type,
    uniqueDatasets,
    unit,
  ]);

  const tableData = useMemo(
    () =>
      formatTableData(
        timeDataSourceId,
        categoryDataSourceId,
        type,
        values,
        chartData,
        defaultDateFormatPattern
      ),
    [categoryDataSourceId, chartData, defaultDateFormatPattern, timeDataSourceId, type, values]
  );

  const previousTick = useRef();
  dayjs.locale(locale);

  const maxTicksPerSize = useMemo(() => getMaxTicksPerSize(sizeProp), [sizeProp]);

  const formatTick = useCallback(
    /** *
     * timestamp of current value
     * index of current value
     * ticks: array of current ticks
     */
    (timestamp, index, ticks) => {
      const previousTimestamp = previousTick.current;
      // store current in the previous tick
      previousTick.current = timestamp;
      return formatGraphTick(
        timestamp,
        index,
        ticks,
        interval,
        locale,
        previousTimestamp,
        showTimeInGMT
      );
    },
    [interval, locale, showTimeInGMT]
  );

  const options = useMemo(
    () => ({
      animations: false,
      accessibility: true,
      axes: {
        bottom: {
          title: `${xLabel || ''} ${
            layout === BAR_CHART_LAYOUTS.HORIZONTAL ? (unit ? `(${unit})` : '') : ''
          }`,
          scaleType: layout === BAR_CHART_LAYOUTS.VERTICAL ? scaleType : null,
          stacked:
            type === BAR_CHART_TYPES.STACKED &&
            layout === BAR_CHART_LAYOUTS.HORIZONTAL &&
            timeDataSourceId,
          mapsTo: axes.bottomAxesMapsTo,
          ...(domainRange && layout === BAR_CHART_LAYOUTS.VERTICAL ? { domain: domainRange } : {}),
          ...(layout === BAR_CHART_LAYOUTS.HORIZONTAL && !isNil(decimalPrecision)
            ? {
                ticks: {
                  formatter: (axisValue) =>
                    chartValueFormatter(axisValue, size, null, locale, decimalPrecision),
                },
              }
            : scaleType === 'time' && axes.bottomAxesMapsTo === 'date'
            ? {
                ticks: {
                  number: maxTicksPerSize,
                  formatter: formatTick,
                },
              }
            : {}),
        },
        left: {
          title: `${yLabel || ''} ${
            layout === BAR_CHART_LAYOUTS.VERTICAL ? (unit ? `(${unit})` : '') : ''
          }`,
          ...(layout === BAR_CHART_LAYOUTS.VERTICAL && !isNil(decimalPrecision)
            ? {
                ticks: {
                  formatter: (axisValue) =>
                    chartValueFormatter(axisValue, size, null, locale, decimalPrecision),
                },
              }
            : {}),
          scaleType: layout === BAR_CHART_LAYOUTS.HORIZONTAL ? scaleType : null,
          stacked: type === BAR_CHART_TYPES.STACKED && layout === BAR_CHART_LAYOUTS.VERTICAL,
          mapsTo: axes.leftAxesMapsTo,
          ...(domainRange && layout === BAR_CHART_LAYOUTS.HORIZONTAL && timeDataSourceId
            ? { domain: domainRange }
            : {}),
        },
      },
      legend: {
        position: legendPosition,
        enabled: chartData.length > 1,
        clickable: !isEditable,
        truncation,
      },
      containerResizable: true,
      color: colors,
      tooltip: {
        valueFormatter: (tooltipValue) =>
          chartValueFormatter(tooltipValue, size, unit, locale, decimalPrecision),
        customHTML: (...args) =>
          handleTooltip(...args, timeDataSourceId, showTimeInGMT, tooltipDateFormatPattern, locale),
        groupLabel: mergedI18n.tooltipGroupLabel,
        totalLabel: mergedI18n.tooltipTotalLabel,
      },
      // zoomBar should only be enabled for time-based charts
      ...(zoomBar?.enabled &&
      timeDataSourceId &&
      (ZOOM_BAR_ENABLED_CARD_SIZES.includes(size) || isExpanded)
        ? {
            zoomBar: {
              // [zoomBar.axes]: {    TODO: the top axes is the only one supported at the moment so default to top
              top: {
                enabled: zoomBar.enabled,
                initialZoomDomain: zoomBar.initialZoomDomain,
                type: zoomBar.view || 'slider_view', // default to slider view
              },
            },
          }
        : {}),
      toolbar: {
        enabled: false,
      },
    }),
    [
      xLabel,
      layout,
      unit,
      scaleType,
      type,
      timeDataSourceId,
      axes.bottomAxesMapsTo,
      axes.leftAxesMapsTo,
      domainRange,
      decimalPrecision,
      maxTicksPerSize,
      formatTick,
      yLabel,
      legendPosition,
      chartData.length,
      isEditable,
      truncation,
      colors,
      mergedI18n.tooltipGroupLabel,
      mergedI18n.tooltipTotalLabel,
      zoomBar,
      size,
      isExpanded,
      locale,
      showTimeInGMT,
      tooltipDateFormatPattern,
    ]
  );

  return (
    <Card
      title={title}
      className={classnames(className, `${iotPrefix}--bar-chart-card`)}
      size={size}
      i18n={mergedI18n}
      isExpanded={isExpanded}
      isEmpty={isAllValuesEmpty}
      isLazyLoading={isLazyLoading}
      isEditable={isEditable}
      isLoading={isLoading}
      isResizable={isResizable}
      resizeHandles={resizeHandles}
      timeRange={timeRange}
      locale={locale}
      // TODO: remove deprecated testID in v3.
      testId={testID || testId}
      {...others}
    >
      {!isAllValuesEmpty ? (
        <div
          className={classnames(`${iotPrefix}--bar-chart-container`, {
            [`${iotPrefix}--bar-chart-container--expanded`]: isExpanded,
            [`${iotPrefix}--bar-chart-container--editable`]: isEditable,
          })}
        >
          <ChartComponent
            // When showing the dashboard editor preview, we need to recalculate the chart scale
            // because the data is added and removed dynamically
            key={
              isDashboardPreview
                ? `bar-chart_preview_${values.length}_${series.length}`
                : 'bar-chart'
            }
            data={chartData}
            options={options}
            width="100%"
            height="100%"
          />
          {isExpanded ? (
            <StatefulTable
              id="BarChartCard-table"
              className={`${iotPrefix}--bar-chart-card--stateful-table`}
              columns={tableColumns}
              data={tableData}
              options={{
                hasPagination: true,
                hasSearch: true,
                hasFilter: true,
              }}
              actions={{
                toolbar: {
                  onDownloadCSV: (filteredData) => csvDownloadHandler(filteredData, title),
                },
              }}
              view={{
                pagination: {
                  pageSize: 10,
                  pageSizes: [10, 20, 30],
                },
                toolbar: {
                  activeBar: null,
                },
                filters: [],
                table: {
                  sort: {
                    columnId: timeDataSourceId,
                    direction: 'DESC',
                  },
                  emptyState: {
                    message: mergedI18n.noDataLabel,
                  },
                },
              }}
              i18n={mergedI18n}
            />
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};

BarChartCard.propTypes = { ...CardPropTypes, ...BarChartCardPropTypes };
BarChartCard.defaultProps = defaultProps;
export default BarChartCard;
