import { isNil, isEmpty, capitalize, omit } from 'lodash-es';

import dayjs from '../../utils/dayjs';
import { BAR_CHART_TYPES, BAR_CHART_LAYOUTS, CARD_SIZES } from '../../constants/LayoutConstants';
import { CHART_COLORS } from '../../constants/CardPropTypes';
import { convertStringsToDOMElement } from '../../utils/componentUtilityFunctions';

/**
 * Generate fake, sample values for isEditable preview state
 * @param {Array<Object>} series dataSourceId declarations
 * @param {string} timeDataSourceId, time-based attribute to group by
 * @param {string} timeGrain time interval to make sample data for
 * @param {string} categoryDataSourceId, in case of grouped/stacked charts, the field to group by
 */
export const generateSampleValues = (
  series,
  timeDataSourceId,
  timeGrain = 'day',
  timeRange,
  categoryDataSourceId
) => {
  // determine interval type
  const timeRangeType = timeRange?.includes('this') ? 'periodToDate' : 'rolling';
  // for month timeGrains, we need to determine whether to show 3 for a quarter or 12 for a year
  const timeRangeInterval = timeRange?.includes('Quarter') ? 'quarter' : timeRange;
  let count = 7;
  switch (timeGrain) {
    case 'hour':
      count = 24;
      break;
    case 'day':
      count = 7;
      break;
    case 'week':
      count = 4;
      break;
    case 'month':
      count = timeRangeInterval === 'quarter' ? 3 : 12;
      break;
    case 'year':
      count = 5;
      break;
    default:
      count = 7;
      break;
  }

  if (timeDataSourceId) {
    return series.reduce((sampleData, { dataSourceId }) => {
      const now =
        timeRangeType === 'periodToDate' // handle "this" intervals like "this week"
          ? dayjs().startOf(timeRangeInterval).subtract(1, timeGrain)
          : dayjs().subtract(count, timeGrain);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < count; i++) {
        const nextTimeStamp = now.add(1, timeGrain).valueOf();
        if (categoryDataSourceId) {
          // 4 random datasets
          // eslint-disable-next-line no-plusplus
          for (let k = 0; k < 4; k++) {
            const value = { [categoryDataSourceId]: `Sample ${k + 1}` };
            series.forEach((datasource) => {
              value[timeDataSourceId] = nextTimeStamp;
              value[datasource.dataSourceId] = Math.random() * 100;
            });
            sampleData.push(value);
          }
        } else {
          // otherwise we need explicit row
          sampleData.push({
            [timeDataSourceId]: nextTimeStamp,
            [dataSourceId]: Math.random() * 100,
          });
        }
      }
      return sampleData;
    }, []);
  }
  const sampleData = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 4; i++) {
    const value = { [categoryDataSourceId]: `Sample ${i + 1}` };
    series.forEach((datasource) => {
      value[datasource.dataSourceId] = Math.random() * 100;
    });
    sampleData.push(value);
  }
  return sampleData;
};

/**
 * Generate fake, sample values for isDashboardPreview state. This is needed to preview
 * data grouped by the categoryDataSourceId prop
 * @param {Array<Object>} values a list of metrics and the dimension values to group them by
 *
 * @returns {Array} array of value objects to show in the chart
 *
 * TODO: this should probably get refactored to be one generateSampleValues function
 */
export const generateSampleValuesForEditor = (
  series,
  timeDataSourceId,
  timeGrain = 'day',
  timeRange,
  categoryDataSourceId,
  availableDimensions
) => {
  // determine interval type
  const timeRangeType = timeRange?.includes('this') ? 'periodToDate' : 'rolling';
  // for month timeGrains, we need to determine whether to show 3 for a quarter or 12 for a year
  const timeRangeInterval = timeRange?.includes('Quarter') ? 'quarter' : timeRange;
  let count = 7;
  switch (timeGrain) {
    case 'hour':
      count = 24;
      break;
    case 'day':
      count = 7;
      break;
    case 'week':
      count = 4;
      break;
    case 'month':
      count = timeRangeInterval === 'quarter' ? 3 : 12;
      break;
    case 'year':
      count = 5;
      break;
    default:
      count = 7;
      break;
  }

  // need to remove the label if it is a categorized timeseries bar chart
  const dimensions = [];
  if (availableDimensions && availableDimensions[categoryDataSourceId]) {
    availableDimensions[categoryDataSourceId].forEach((value) => {
      dimensions.push({
        dimension: categoryDataSourceId,
        value,
      });
    });
  }

  if (timeDataSourceId) {
    const sampleData = [];
    series.forEach(({ dataSourceId }) => {
      const now =
        timeRangeType === 'periodToDate' // handle "this" intervals like "this week"
          ? dayjs().startOf(timeRangeInterval).subtract(1, timeGrain)
          : dayjs().subtract(count, timeGrain);
      // create 4 random dataSets
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < count; i++) {
        const nextTimeStamp = now.add(1, timeGrain).valueOf();
        // include dimension category if there is one
        if (categoryDataSourceId) {
          dimensions.forEach((dimension) => {
            sampleData.push({
              [timeDataSourceId]: nextTimeStamp,
              [dataSourceId]: Math.random() * 100,
              [dimension.dimension]: dimension.value,
            });
          });
        } else {
          // otherwise we need explicit row
          sampleData.push({
            [timeDataSourceId]: nextTimeStamp,
            [dataSourceId]: Math.random() * 100,
          });
        }
      }
    });
    return sampleData;
  }

  // for every dimension value, create a value object that contains sample data for each metric
  const valuesGeneratedByDimensions = dimensions.map((dimension) => {
    const value = { [dimension.dimension]: dimension.value };
    series.forEach((metric) => {
      value[metric.dataSourceId] = Math.random() * 100;
    });
    return value;
  });

  return valuesGeneratedByDimensions;
};

/**
 * Translates our raw data into a language the carbon-charts understand
 * @param {Array<Object>} series, the definition of the plotted series
 * @param {string} series.dataSourceId, the numeric field that identifies the value to display in the main axis
 * @param {string} series.label, the displayed name of the dataset
 * @param {array} values, the array of values from our data layer
 * @param {string} categoryDataSourceId, in case of grouped/stacked charts, the field to group by
 * @param {string} timeDataSourceId, time-based attribute to group by
 * @param {string} type of chart i.e. simple, grouped, stacked
 *
 * @returns {array} of formatted values: [group: string, value: number, key: string, date: date]
 */
export const formatChartData = (
  seriesArg,
  values,
  categoryDataSourceId,
  timeDataSourceId,
  type,
  isDashboardPreview
) => {
  let series = seriesArg;
  // need to remove the label if it is a categorized timeseries bar chart in the dashboard editor
  if (
    type === BAR_CHART_TYPES.STACKED &&
    timeDataSourceId &&
    categoryDataSourceId &&
    isDashboardPreview
  ) {
    series = series.map((item) => omit(item, 'label'));
  }

  let data = values ?? [];
  if (!isNil(values) && !isEmpty(series)) {
    data = [];
    // grouped or stacked
    if (type === BAR_CHART_TYPES.GROUPED || type === BAR_CHART_TYPES.STACKED) {
      let uniqueDatasetNames;
      let groupedData;
      // Get the unique values for each x-label grouping
      if (timeDataSourceId && type !== BAR_CHART_TYPES.GROUPED) {
        uniqueDatasetNames = [...new Set(values.map((val) => val[timeDataSourceId]))];
        groupedData = uniqueDatasetNames.map((name) =>
          values.filter((val) => val[timeDataSourceId] === name)
        );
      } else {
        uniqueDatasetNames = [...new Set(values.map((val) => val[categoryDataSourceId]))];
        groupedData = uniqueDatasetNames.map((group) =>
          values.filter((val) => val[categoryDataSourceId] === group)
        );
      }

      groupedData.forEach((group) => {
        group.forEach((value) => {
          series.forEach((dataset) => {
            // if value is null, don't add it to the formatted chartData
            if (
              (!isNil(value[categoryDataSourceId]) || !isNil(dataset.label)) &&
              (timeDataSourceId && type !== BAR_CHART_TYPES.GROUPED
                ? !isNil(value[timeDataSourceId])
                : !isNil(value[categoryDataSourceId]))
            ) {
              data.push({
                // if there's a dataset label, use it
                group: dataset.label ? dataset.label : value[categoryDataSourceId], // bar this data belongs to
                value: value[dataset.dataSourceId],
                // grouped charts can't be time-based
                ...(timeDataSourceId && type !== BAR_CHART_TYPES.GROUPED
                  ? {
                      date: new Date(value[timeDataSourceId]), // timestamp
                      key: value[timeDataSourceId],
                    }
                  : { key: value[categoryDataSourceId] }),
              });
            }
          });
        });
      });
    } // single bars and not time-based
    else if (categoryDataSourceId && Array.isArray(values)) {
      const uniqueDatasetNames = [...new Set(values.map((val) => val[categoryDataSourceId]))];
      const labeledData = uniqueDatasetNames.map((name) =>
        values.filter((val) => val[categoryDataSourceId] === name)
      );

      labeledData.forEach((dataset) => {
        dataset.forEach((value) => {
          // if value is null, don't add it to the formatted chartData
          if (!isNil(value[series[0].dataSourceId] && value[categoryDataSourceId])) {
            data.push({
              group: value[categoryDataSourceId], // bar this data belongs to
              value: value[series[0].dataSourceId], // there should only be one series here because its a simple bar
            });
          }
        });
      });
    } // single bars and time-based
    else if (Array.isArray(values)) {
      const uniqueDatasetNames = [...new Set(values.map((val) => val[timeDataSourceId]))];
      const labeledData = uniqueDatasetNames.map((name) =>
        values.filter((val) => val[timeDataSourceId] === name)
      );
      labeledData.forEach((dataset) => {
        dataset.forEach((value) => {
          // if value is null, don't add it to the formatted chartData
          if (!isNil(value[series[0].dataSourceId])) {
            const dataDate = new Date(value[timeDataSourceId]);
            data.push({
              // Use the label if one exists
              group: series[0].label ? series[0].label : series[0].dataSourceId, // bar this data belongs to
              value: value[series[0].dataSourceId], // there should only be one series here because its a simple bar
              date: dataDate, // timestamp
            });
          }
        });
      });
    }
  }

  return isDashboardPreview && isEmpty(series) ? [] : data;
};

/**
 * Maps values to left and bottom axes based on whether layout is vertical
 * or horizontal, and if the series is grouped or time-based
 *
 * @param {Object} series the definition of the plotted series
 * @param {string} layout vertical or horizontal
 * @param {string} categoryDataSourceId attribute to be grouped / categorized by
 * @param {string} timeDatasourceId time-based attribute
 * @param {string} type of chart i.e. simple, grouped, stacked
 *
 * @returns {object} { bottomAxesMapsTo: string, leftAxesMapsTo: string }
 */
export const mapValuesToAxes = (layout, categoryDataSourceId, timeDataSourceId, type) => {
  // Determine which values the axes map to
  let bottomAxesMapsTo;
  let leftAxesMapsTo;
  if (layout === BAR_CHART_LAYOUTS.VERTICAL) {
    // if vertical and time-based
    if (timeDataSourceId) {
      bottomAxesMapsTo = 'date';
      leftAxesMapsTo = 'value';
    } // if vertical and group-based
    else if (categoryDataSourceId && type !== BAR_CHART_TYPES.SIMPLE) {
      bottomAxesMapsTo = 'key';
      leftAxesMapsTo = 'value';
    } // if vertical and not group or time-based
    else {
      bottomAxesMapsTo = 'group';
      leftAxesMapsTo = 'value';
    }
  } // if horizontal and time-based
  else if (timeDataSourceId) {
    bottomAxesMapsTo = 'value';
    leftAxesMapsTo = 'date';
  } // if horizontal and group-based
  else if (categoryDataSourceId && type !== BAR_CHART_TYPES.SIMPLE) {
    bottomAxesMapsTo = 'value';
    leftAxesMapsTo = 'key';
  } // if horizontal, not time-based or group
  else {
    bottomAxesMapsTo = 'value';
    leftAxesMapsTo = 'group';
  }

  return {
    bottomAxesMapsTo,
    leftAxesMapsTo,
  };
};

/**
 * Formats and maps the colors to their corresponding datasets in the carbon charts tabular data format
 * If there are no colors or incomplete colors set, carbon charts will use their default colors
 * @param {Array} series an array of dataset group classifications
 * @param {Array || string || Object} series[i].color
 * @param {Array<string>} datasetNames unique dataset bar names to be used if color is an object
 *
 * @returns {Object} colors - formatted
 */
export const formatColors = (series, datasetNames, isDashboardPreview, type) => {
  // first set the carbon charts config defaults
  const colors = { scale: {} };

  if (isDashboardPreview && type === BAR_CHART_TYPES.SIMPLE) {
    datasetNames.forEach((dataset) => {
      if (series[0].color) {
        colors.scale[dataset] = series[0].color;
      }
    });
    return colors;
  }

  // if color is an array, order doesn't matter so just map as many as possible
  if (series[0] && Array.isArray(series[0].color)) {
    series[0].color.forEach((color, index) => {
      colors.scale[datasetNames[index]] = color;
    });
  } else {
    series.forEach((dataset) => {
      if (dataset.color) {
        // if its a string, set the color to this line
        if (typeof dataset.color === 'string') {
          colors.scale[dataset.label] = dataset.color;
        } // If its an object, use it, but the keys must match the labels provided from series.label
        else {
          colors.scale = dataset.color;
        }
      }
    });
  }

  datasetNames.forEach((dataset, index) => {
    // if the colors aren't set, give them a default color
    if (!colors.scale[dataset]) {
      colors.scale[dataset] = CHART_COLORS[index % CHART_COLORS.length];
    }
  });

  return colors;
};

/**
 * Extends default tooltip with additional date information if the graph is time-based
 *
 * This function is a bit more hacky than TimeSeriesCard because carbon charts formats it differently
 * TODO: remove the hackiness once this issue is solved: https://github.com/carbon-design-system/carbon-charts/issues/657
 *
 * @param {object} data data object for this particular datapoint
 * @param {string} defaultTooltip Default HTML generated for this tooltip that needs to be marked up
 * @param {object} _datum of the hovered element
 * @param {string} timeDatasourceId time-based attribute
 * @param {bool} showTimeInGMT
 * @param {string} tooltipDataFormatPattern
 */
export const handleTooltip = (
  dataOrHoveredElement,
  defaultTooltip,
  _datum,
  timeDataSourceId,
  showTimeInGMT,
  tooltipDateFormatPattern = 'L HH:mm:ss',
  locale
) => {
  dayjs.locale(locale);
  const data = dataOrHoveredElement.__data__ // eslint-disable-line no-underscore-dangle
    ? dataOrHoveredElement.__data__ // eslint-disable-line no-underscore-dangle
    : dataOrHoveredElement;
  const typedData = Array.isArray(data) ? data[0] : data;

  const [parsedTooltip] = convertStringsToDOMElement([defaultTooltip]);

  // If theres a time attribute, add an extra list item with the formatted date
  if (timeDataSourceId) {
    // generate the formatted label
    const timestamp = typedData?.date?.getTime();
    const dateLabel = timestamp
      ? `<li class='datapoint-tooltip'>
            <p class='label'>
              ${(showTimeInGMT // show timestamp in gmt or local time
                ? dayjs.utc(timestamp)
                : dayjs(timestamp)
              ).format(tooltipDateFormatPattern)}</p>
          </li>`
      : '';

    const [parsedDateLabel] = convertStringsToDOMElement([dateLabel]);

    // First remove carbon charts default Date tooltip
    // the first <li> will always be carbon chart's Dates row in this case, replace with our date format <li>
    parsedTooltip.querySelector('li:first-child').replaceWith(parsedDateLabel.querySelector('li'));
  }

  return parsedTooltip.innerHTML;
};

/**
 * Generates table columns for the isExpanded state StatefulTable
 *
 * @param {string} timeDatasourceId time-based attribute
 * @param {string} categoryDataSourceId attribute to be grouped / categorized by
 * @param {string} type of chart i.e. simple, grouped, stacked
 * @param {Array<string>} uniqueDatasetNames  unique dataset bar names
 * @param {string} defaultFilterStringPlaceholdText i18n
 */
export const generateTableColumns = (
  timeDataSourceId,
  categoryDataSourceId,
  type,
  uniqueDatasetNames,
  defaultFilterStringPlaceholdText
) => {
  let tableColumns = [];
  // In expanded mode we show the data underneath the barchart in a table so need to build the columns
  // First column is timestamp if there is one
  if (timeDataSourceId) {
    tableColumns.push({
      id: timeDataSourceId,
      name: capitalize(timeDataSourceId),
      isSortable: true,
      type: 'TIMESTAMP',
    });
  } else if (categoryDataSourceId && type !== BAR_CHART_TYPES.SIMPLE) {
    tableColumns.push({
      id: categoryDataSourceId,
      name: capitalize(categoryDataSourceId),
      isSortable: true,
    });
  }

  // then the rest in series order
  tableColumns = tableColumns.concat(
    uniqueDatasetNames.map((datasetName) => ({
      id: datasetName,
      name: capitalize(datasetName),
      isSortable: true,
      ...(defaultFilterStringPlaceholdText
        ? { filter: { placeholderText: defaultFilterStringPlaceholdText } }
        : ''),
    }))
  );

  return tableColumns;
};

/**
 * Generates table data for isExpanded StatefulTable state
 * If data is time-based, the first column should be timeDataSourceId
 * If its a simple, non timebased chart, only 1 row should be returned
 * If its grouped and non timebased, the categoryDataSourceId should be the first column
 *
 * @param {string} timeDatasourceId time-based attribute
 * @param {string} categoryDataSourceId attribute to be grouped / categorized by
 * @param {string} type of chart i.e. simple, grouped, stacked
 * @param {Array<Object>} values values before they are formatted for charting
 * @param {Array<Object>} chartData values after they are formatted for charting
 */
export const formatTableData = (
  timeDataSourceId,
  categoryDataSourceId,
  type,
  values,
  chartData,
  defaultDateFormatPattern = 'L HH:mm'
) => {
  const tableData = [];
  if (!isNil(values) && !isNil(chartData)) {
    if (timeDataSourceId) {
      // First get all of the unique timestamps
      const uniqueTimestamps = [...new Set(values.map((val) => val[timeDataSourceId]))];
      // For each unique timestamp, get the unique value for each dataset group
      // Each table row will consist of 1 timestamp and the corresponding values
      // of each dataset group for that timestamp
      uniqueTimestamps.forEach((timestamp, index) => {
        const barTimeValue = {};
        const filteredData = chartData.filter((data) => data.date?.valueOf() === timestamp);
        filteredData.forEach((val) => {
          barTimeValue[val.group] = val.value;
        });

        tableData.push({
          id: `dataindex-${index}`,
          values: {
            ...barTimeValue,
            // format the date locally
            [timeDataSourceId]: dayjs(timestamp).format(defaultDateFormatPattern),
          },
          isSelectable: false,
        });
      });
    } else if (type === BAR_CHART_TYPES.SIMPLE) {
      const simpleBarValue = {};
      chartData.forEach((value) => {
        // There's only 1 row if its a simple non-timebased graph
        simpleBarValue[value.group] = value.value;
      });
      tableData.push({
        id: `dataindex-1`,
        values: {
          ...simpleBarValue,
        },
        isSelectable: false,
      });
    } // Format the tableData for grouped and stacked charts that are NOT time-based
    else {
      // First get all of the unique keys
      const uniqueKeys = [...new Set(values.map((val) => val[categoryDataSourceId]))];
      // For each unique key, get the unique value for each dataset group
      // Each table row will consist of 1 key and the corresponding values
      // of each dataset group for that key
      uniqueKeys.forEach((key, index) => {
        const groupBarValue = {};
        const filteredData = chartData.filter((data) => data.key === key);
        filteredData.forEach((val) => {
          groupBarValue[val.group] = val.value;
        });

        tableData.push({
          id: `dataindex-${index}`,
          values: {
            ...groupBarValue,
            [categoryDataSourceId]: key,
          },
          isSelectable: false,
        });
      });
    }
  }

  return tableData;
};

export const getMaxTicksPerSize = (sizeProp) => {
  switch (sizeProp) {
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
};
