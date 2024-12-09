import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LineChart, StackedBarChart } from '@carbon/charts-react';
import { isNil, isEmpty, omit, capitalize, defaultsDeep, isEqual } from 'lodash-es';

import { csvDownloadHandler } from '../../utils/componentUtilityFunctions';
import {
  CardPropTypes,
  ZoomBarPropTypes,
  TruncationPropTypes,
} from '../../constants/CardPropTypes';
import {
  CARD_SIZES,
  TIME_SERIES_TYPES,
  ZOOM_BAR_ENABLED_CARD_SIZES,
} from '../../constants/LayoutConstants';
import Card from '../Card/Card';
import StatefulTable from '../Table/StatefulTable';
import { settings } from '../../constants/Settings';
import {
  getUpdatedCardSize,
  handleCardVariables,
  chartValueFormatter,
  getResizeHandles,
  handleTooltip,
} from '../../utils/cardUtilityFunctions';
import deprecate from '../../internal/deprecate';
import dayjs, { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';
import { usePrevious } from '../../hooks/usePrevious';

import {
  generateSampleValues,
  formatGraphTick,
  formatColors,
  formatChartData,
  applyStrokeColor,
  applyFillColor,
  applyIsFilled,
} from './timeSeriesUtils';

const { iotPrefix } = settings;

const TimeSeriesDatasetPropTypes = PropTypes.shape({
  label: PropTypes.string.isRequired,
  /** the attribute in values to map to */
  dataSourceId: PropTypes.string.isRequired,
  /** optional filter to apply to this particular line */
  dataFilter: PropTypes.objectOf(PropTypes.any),
  /** optional param to set the colors */
  color: PropTypes.string,
});

const TimeSeriesCardPropTypes = {
  content: PropTypes.shape({
    series: PropTypes.oneOfType([
      TimeSeriesDatasetPropTypes,
      PropTypes.arrayOf(TimeSeriesDatasetPropTypes),
    ]).isRequired,
    /** Custom X-axis label */
    xLabel: PropTypes.string,
    /** Custom Y-axis label */
    yLabel: PropTypes.string,
    /** the number of decimals to show in the legend and on the y-axis */
    decimalPrecision: PropTypes.number,
    /** Optionally hide zero. Useful when chart values are not close to zero, giving a better view of the meaningful data */
    includeZeroOnXaxis: PropTypes.bool,
    /** Optionally hide zero. Useful when chart values are not close to zero, giving a better view of the meaningful data */
    includeZeroOnYaxis: PropTypes.bool,
    /** Which attribute is the time attribute i.e. 'timestamp' */
    timeDataSourceId: PropTypes.string,
    /** should it be a line chart or bar chart, default is line chart */
    chartType: deprecate(
      PropTypes.oneOf(Object.values(TIME_SERIES_TYPES)),
      '\nThe prop `chartType` for Card has been deprecated. BarChartCard now handles all bar chart functionality including time-based bar charts.'
    ),
    /** optional units to put in the legend */
    unit: PropTypes.string,
    /** Optionally adds a zoom bar to the chart */
    zoomBar: ZoomBarPropTypes,
    /** Number of grid-line spaces to the left and right of the chart to add white space to. Defaults to 1 */
    addSpaceOnEdges: PropTypes.number,
    /** whether or not to show a legend at the bottom of the card
     * if not explicitly stated, the card will show based on the length of the series
     */
    showLegend: PropTypes.bool,
    /** Where to place the chart legend */
    legendPosition: PropTypes.string,
    /** carbon charts legend truncation options */
    truncation: TruncationPropTypes,
    /** if there are alerts associated with this chart (used to markup datapoints), this is a start/end set of alert ranges for each alert */
    alertRanges: PropTypes.arrayOf(
      PropTypes.shape({
        endTimestamp: PropTypes.number,
        startTimestamp: PropTypes.number,
        /** color of the alert */
        color: PropTypes.string,
        /** more information about the alert */
        details: PropTypes.string,
      })
    ),
    /** set of thresholds these render dotted lines on the graph to indicate that the line values might be crossing logical thresholds */
    thresholds: PropTypes.arrayOf(
      PropTypes.shape({
        axis: PropTypes.oneOf(['x', 'y']),
        value: PropTypes.number,
        label: PropTypes.string,
        fillColor: PropTypes.string,
      })
    ),
  }).isRequired,
  i18n: PropTypes.shape({
    alertDetected: PropTypes.string,
    noData: PropTypes.string,
    tooltipGroupLabel: PropTypes.string,
    defaultFilterStringPlaceholdText: PropTypes.string,
  }),
  /** array of data from the backend for instance [{timestamp: Date object || ms timestamp, temperature: 35, humidity: 10}, ...] */
  values: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
    })
  ),
  cardVariables: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.number, PropTypes.bool])
  ),
  /** Interval for time series configuration used for formatting the x-axis */
  interval: PropTypes.oneOf(['minute', 'hour', 'day', 'week', 'quarter', 'month', 'year']),
  /** optional domain to graph from. First value is the beginning of the range. Second value is the end of the range
   * can be date instance or timestamp
   */
  domainRange: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.object])),
  /** Region for value and text formatting */
  locale: PropTypes.string,
  /** Show timestamp in browser local time or GMT */
  showTimeInGMT: PropTypes.bool,
  size: (props, propName, componentName) => {
    let error;
    if (!Object.keys(CARD_SIZES).includes(props[propName])) {
      error = new Error(
        `\`${componentName}\` prop \`${propName}\` must be one of ${Object.keys(CARD_SIZES).join(
          ','
        )}.`
      );
    }
    // If the size
    if (
      props[propName] === CARD_SIZES.SMALL ||
      props[propName] === CARD_SIZES.SMALLWIDE ||
      props[propName] === CARD_SIZES.SMALLFULL
    ) {
      error = new Error(
        `Deprecation notice: \`${componentName}\` prop \`${propName}\` cannot be \`${props[propName]}\` as the charts will not render correctly. Minimum size is \`MEDIUM\``
      );
    }
    return error;
  },
  /** tooltip format pattern that follows the dayjs formatting patterns */
  tooltipDateFormatPattern: PropTypes.string,
  /** should the tooltip total the line chart values? */
  tooltipShowTotals: PropTypes.bool,
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** default date format pattern that follows the dayjs formatting patterns */
  defaultDateFormatPattern: PropTypes.string,
};

const defaultProps = {
  size: CARD_SIZES.MEDIUM,
  values: [],
  i18n: {
    alertDetected: 'Alert detected:',
    noDataLabel: 'No data is available for this time range.',
    tooltipGroupLabel: 'Group',
    defaultFilterStringPlaceholdText: 'Filter',
  },
  chartType: TIME_SERIES_TYPES.LINE,
  locale: 'en',
  content: {
    series: [],
    timeDataSourceId: 'timestamp',
    includeZeroOnXaxis: false,
    includeZeroOnYaxis: false,
    showLegend: true,
    legendPosition: 'bottom',
    truncation: {
      type: 'end_line',
      threshold: 20,
      numCharacter: 20,
    },
  },
  interval: 'hour',
  showTimeInGMT: false,
  domainRange: null,
  tooltipDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
  tooltipShowTotals: true,
  defaultDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
};

const TimeSeriesCard = ({
  title: titleProp,
  content,
  children,
  size,
  interval,
  isEditable,
  isResizable,
  values: initialValues,
  locale,
  i18n,
  isExpanded,
  timeRange,
  isLazyLoading,
  isLoading,
  domainRange,
  tooltipDateFormatPattern,
  tooltipShowTotals,
  showTimeInGMT,
  // TODO: remove deprecated 'testID' in v3
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
      alertRanges,
      xLabel,
      yLabel,
      includeZeroOnXaxis,
      includeZeroOnYaxis,
      decimalPrecision,
      unit,
      chartType,
      zoomBar,
      showLegend,
      legendPosition,
      addSpaceOnEdges,
      truncation,
      thresholds,
    },
    values: valuesProp,
  } = handleCardVariables(titleProp, contentWithDefaults, initialValues, others);
  const chartRef = useRef(null);
  const previousTick = useRef();
  dayjs.locale(locale);

  // Workaround since downstream consumers might keep regenerating the series object and useMemo does a direct in-memory comparison for the object
  const objectAgnosticSeries = JSON.stringify(series);
  const objectAgnosticThresholds = JSON.stringify(thresholds);

  const sampleValues = useMemo(
    () =>
      isEditable
        ? generateSampleValues(series, timeDataSourceId, interval, timeRange, thresholds)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      objectAgnosticSeries,
      timeDataSourceId,
      interval,
      timeRange,
      objectAgnosticThresholds,
      isEditable,
    ]
  );

  const values = useMemo(
    () => (isEditable ? sampleValues : valuesProp),
    [isEditable, sampleValues, valuesProp]
  );

  // Unfortunately the API returns the data out of order sometimes
  const valueSort = useMemo(
    () =>
      values.sort((left, right) =>
        dayjs.utc(left[timeDataSourceId]).diff(dayjs.utc(right[timeDataSourceId]))
      ),
    [values, timeDataSourceId]
  );

  // Checks size property against new size naming convention and reassigns to closest supported size if necessary.
  const newSize = useMemo(() => getUpdatedCardSize(size), [size]);

  const maxTicksPerSize = useMemo(() => {
    switch (newSize) {
      case CARD_SIZES.MEDIUMTHIN:
        return 2;
      case CARD_SIZES.MEDIUM:
        return 4;
      case CARD_SIZES.MEDIUMWIDE:
      case CARD_SIZES.LARGE:
      case CARD_SIZES.LARGETHIN:
        return 6;
      case CARD_SIZES.LARGEWIDE:
        return 14;
      default:
        return 10;
    }
  }, [newSize]);

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

  // Set the colors for each dataset
  const colors = useMemo(() => formatColors(series), [series]);

  /** This caches the chart value */
  const chartData = useMemo(
    () => formatChartData(timeDataSourceId, series, valueSort),
    [timeDataSourceId, series, valueSort]
  );

  const previousChartData = usePrevious(chartData);

  /** This is needed to update the chart when the lines and values change */
  useEffect(() => {
    if (chartRef?.current?.chart && !isEqual(chartData, previousChartData)) {
      chartRef.current.chart.model.setData(chartData);
    }
  }, [chartData, previousChartData]);

  const isChartDataEmpty = isEmpty(chartData);

  const { tableData, columnNames } = useMemo(() => {
    let maxColumnNames = [];

    const tableValues = valueSort.map((value, index) => {
      const currentValueColumns = Object.keys(omit(value, timeDataSourceId));
      maxColumnNames =
        currentValueColumns.length > maxColumnNames.length ? currentValueColumns : maxColumnNames;
      return {
        id: `dataindex-${index}`,
        values: {
          ...omit(value, timeDataSourceId), // skip the timestamp so we can format it locally
          [timeDataSourceId]: dayjs(value[timeDataSourceId]).format(defaultDateFormatPattern),
        },
        isSelectable: false,
      };
    });
    return { tableData: tableValues, columnNames: maxColumnNames };
  }, [defaultDateFormatPattern, timeDataSourceId, valueSort]);

  // In expanded mode we show the data underneath the linechart in a table so need to build the columns
  const tableColumns = useMemo(() => {
    // First column is timestamp
    const columns = [
      {
        id: timeDataSourceId,
        name: capitalize(timeDataSourceId),
        isSortable: true,
        type: 'TIMESTAMP',
      },
    ];
    // then the rest in series order
    return columns.concat(
      columnNames.map((columnName) => {
        const matchingDataSource = Array.isArray(series)
          ? series.find((d) => d.dataSourceId === columnName)
          : series;
        return {
          id: columnName,
          // use the label if one exists as it will be the user-defined, readable name
          // UNLESS dataFilter is enabled as the matchingDataSource will only find the first match
          name: matchingDataSource
            ? matchingDataSource.dataFilter
              ? matchingDataSource.dataSourceId
              : matchingDataSource.label
            : columnName,
          isSortable: true,
          filter: { placeholderText: mergedI18n.defaultFilterStringPlaceholdText },
          renderDataFunction: ({ value }) => {
            if (typeof value === 'number' && !isNil(decimalPrecision)) {
              return chartValueFormatter(value, size, unit, locale, decimalPrecision);
            }
            return value;
          },
        };
      })
    );
  }, [
    columnNames,
    decimalPrecision,
    mergedI18n.defaultFilterStringPlaceholdText,
    locale,
    series,
    size,
    timeDataSourceId,
    unit,
  ]);

  // TODO: remove in next release
  const ChartComponent = chartType === TIME_SERIES_TYPES.BAR ? StackedBarChart : LineChart;

  const resizeHandles = isResizable ? getResizeHandles(children) : [];

  const handleStrokeColor = useMemo(() => applyStrokeColor(alertRanges), [alertRanges]);
  const handleFillColor = useMemo(() => applyFillColor(alertRanges), [alertRanges]);
  const handleIsFilled = useMemo(() => applyIsFilled(alertRanges), [alertRanges]);

  const options = useMemo(
    () => ({
      animations: false,
      accessibility: false,
      axes: {
        bottom: {
          title: xLabel || ' ',
          mapsTo: 'date',
          scaleType: 'time',
          ticks: {
            number: maxTicksPerSize,
            formatter: formatTick,
          },
          ...(thresholds?.some((threshold) => threshold.axis === 'x')
            ? { thresholds: thresholds?.filter((threshold) => threshold.axis === 'x') }
            : {}),
          includeZero: includeZeroOnXaxis,
          ...(domainRange ? { domain: domainRange } : {}),
        },
        left: {
          title: `${yLabel || ''} ${unit ? `(${unit})` : ''}`,
          mapsTo: 'value',
          ticks: {
            formatter: (axisValue) =>
              chartValueFormatter(axisValue, newSize, null, locale, decimalPrecision),
          },
          ...(thresholds?.some((threshold) => threshold.axis === 'y')
            ? { thresholds: thresholds?.filter((threshold) => threshold.axis === 'y') }
            : {}),
          stacked: chartType === TIME_SERIES_TYPES.BAR && series.length > 1,
          includeZero: includeZeroOnYaxis,
          scaleType: 'linear',
        },
      },
      legend: {
        position: legendPosition,
        clickable: !isEditable,
        enabled: showLegend ?? series.length > 1,
        truncation,
      },
      containerResizable: true,
      tooltip: {
        showTotal: tooltipShowTotals,
        truncation: {
          type: 'none',
        },
        valueFormatter: (tooltipValue) =>
          chartValueFormatter(tooltipValue, newSize, unit, locale, decimalPrecision),
        customHTML: (...args) =>
          handleTooltip(
            ...args,
            alertRanges,
            mergedI18n.alertDetected,
            showTimeInGMT,
            tooltipDateFormatPattern,
            locale
          ),
        groupLabel: mergedI18n.tooltipGroupLabel,
      },
      getStrokeColor: handleStrokeColor,
      getFillColor: handleFillColor,
      getIsFilled: handleIsFilled,
      color: colors,
      ...(zoomBar?.enabled && (ZOOM_BAR_ENABLED_CARD_SIZES.includes(size) || isExpanded)
        ? {
            zoomBar: {
              // [zoomBar.axes]: {    TODO: the top axis is the only axis supported at the moment so default to top
              top: {
                enabled: zoomBar.enabled,
                initialZoomDomain: zoomBar.initialZoomDomain,
                type: zoomBar.view || 'slider_view', // default to slider view
              },
            },
          }
        : {}),
      timeScale: {
        addSpaceOnEdges: !isNil(addSpaceOnEdges) ? addSpaceOnEdges : 1,
      },
      toolbar: {
        enabled: false,
      },
    }),
    [
      xLabel,
      maxTicksPerSize,
      formatTick,
      thresholds,
      includeZeroOnXaxis,
      domainRange,
      yLabel,
      unit,
      chartType,
      series.length,
      includeZeroOnYaxis,
      legendPosition,
      isEditable,
      showLegend,
      truncation,
      tooltipShowTotals,
      mergedI18n.tooltipGroupLabel,
      mergedI18n.alertDetected,
      handleStrokeColor,
      handleFillColor,
      handleIsFilled,
      colors,
      zoomBar,
      size,
      isExpanded,
      addSpaceOnEdges,
      newSize,
      locale,
      decimalPrecision,
      alertRanges,
      showTimeInGMT,
      tooltipDateFormatPattern,
    ]
  );

  return (
    <Card
      title={title}
      size={newSize}
      i18n={mergedI18n}
      timeRange={timeRange}
      {...others}
      locale={locale}
      isExpanded={isExpanded}
      isEditable={isEditable}
      isEmpty={isChartDataEmpty}
      isLazyLoading={isLazyLoading || (valueSort && valueSort.length > 200)}
      isLoading={isLoading}
      resizeHandles={resizeHandles}
      testId={testID || testId}
    >
      {!isChartDataEmpty ? (
        <>
          <div
            className={classNames(`${iotPrefix}--time-series-card--wrapper`, {
              [`${iotPrefix}--time-series-card--wrapper__expanded`]: isExpanded,
              [`${iotPrefix}--time-series-card--wrapper__lots-of-points`]:
                valueSort && valueSort.length > 50,
              [`${iotPrefix}--time-series-card--wrapper__editable`]: isEditable,
            })}
          >
            <ChartComponent
              ref={chartRef}
              data={chartData}
              options={options}
              width="100%"
              height="100%"
              key={`thresholds-key${thresholds?.length ? objectAgnosticThresholds : ''}`} // have to regen the component if thresholds change
            />
          </div>
          {isExpanded ? (
            <StatefulTable
              testId={`${testId}-table`}
              id="TimeSeries-table"
              className={`${iotPrefix}--time-series-card--stateful-table`}
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
        </>
      ) : null}
    </Card>
  );
};

TimeSeriesCard.propTypes = {
  ...CardPropTypes,
  ...TimeSeriesCardPropTypes,
};
TimeSeriesCard.defaultProps = defaultProps;

export default TimeSeriesCard;
