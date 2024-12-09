import React, { useRef } from 'react';
import { ComboChart } from '@carbon/charts-react';
import classnames from 'classnames';
import { isEmpty, defaultsDeep } from 'lodash-es';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import {
  getResizeHandles,
  handleCardVariables,
  increaseSmallCardSize,
} from '../../utils/cardUtilityFunctions';
import Card from '../Card/Card';
import { CardPropTypes, ComboChartPropTypes } from '../../constants/CardPropTypes';
import { settings } from '../../constants/Settings';
import StatefulTable from '../Table/StatefulTable';
import { csvDownloadHandler } from '../../utils/componentUtilityFunctions';
import { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';

import { useTableData, useTableColumns, useChartData, useChartOptions } from './comboChartHelpers';

const { iotPrefix } = settings;

const propTypes = {
  ...CardPropTypes,
  ...ComboChartPropTypes,
};

const defaultProps = {
  size: CARD_SIZES.MEDIUMWIDE,
  locale: 'en',
  title: '',
  isLoading: false,
  isExpanded: false,
  i18n: {
    noDataLabel: 'No data',
    defaultFilterStringPlaceholdText: 'type and hit enter to apply',
  },
  values: [],
  content: {
    includeZeroOnXaxis: false,
    includeZeroOnYaxis: false,
    showLegend: true,
  },
  showTimeInGMT: false,
  domainRange: null,
  tooltipDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
  defaultDateFormatPattern: DAYJS_INPUT_FORMATS.SECONDS,
};

const ComboChartCard = ({
  className,
  children,
  content: contentProp,
  title: titleProp,
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
  domainRange,
  showTimeInGMT,
  timeRange,
  tooltipDateFormatPattern,
  // TODO: remove deprecated testID in v3.
  testID,
  testId,
  defaultDateFormatPattern,
  ...others
}) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const { noDataLabel } = mergedI18n;

  const { content, title, values } = handleCardVariables(
    titleProp,
    defaultsDeep({}, contentProp, defaultProps.content),
    initialValues,
    others
  );

  const { timeDataSourceId } = content;

  const previousTick = useRef();

  const chartOptions = useChartOptions({
    previousTick,
    isEditable,
    interval,
    isLoading,
    showTimeInGMT,
    tooltipDateFormatPattern,
    defaultDateFormatPattern,
    chartTitle: content.title,
    values,
    i18n: mergedI18n,
    ...content,
  });
  const chartData = useChartData(values, {
    series: chartOptions.series,
    timeDataSourceId,
    type: chartOptions.type,
  });

  const tableColumns = useTableColumns(values, chartOptions);
  const tableData = useTableData(values, chartOptions);

  return (
    <Card
      isEmpty={isEmpty(chartData)}
      className={classnames(className, `${iotPrefix}--combo-chart-card`)}
      title={title}
      isLazyLoading={isLazyLoading}
      isExpanded={isExpanded}
      isEditable={isEditable}
      isResizable={isResizable}
      i18n={mergedI18n}
      resizeHandles={isResizable ? getResizeHandles(children) : []}
      timeRange={timeRange}
      size={increaseSmallCardSize(sizeProp, 'ComboChartCard')}
      testId={testID || testId}
      locale={locale}
      {...others}
    >
      <div className={`${iotPrefix}--combo-chart-card__container`}>
        <ComboChart
          key="combo-chart"
          data={chartData}
          options={chartOptions}
          width="100%"
          height="100%"
        />
        {isExpanded && !isLoading ? (
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
                  message: noDataLabel,
                },
              },
            }}
            i18n={mergedI18n}
          />
        ) : null}
      </div>
    </Card>
  );
};

ComboChartCard.propTypes = propTypes;
ComboChartCard.defaultProps = defaultProps;

export default ComboChartCard;
