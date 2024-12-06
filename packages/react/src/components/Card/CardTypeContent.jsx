import React, { useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultsDeep } from 'lodash-es';
import { MeterChart, AreaChart, StackedAreaChart } from '@carbon/charts-react';

import { CARD_TYPES } from '../../constants/LayoutConstants';
import { MeterChartPropTypes, SparklineChartPropTypes } from '../../constants/ChartPropTypes';
import { settings } from '../../constants/Settings';
import { getChartOptions } from '../../utils/cardTypeUtilityFunctions';

const { iotPrefix } = settings;
const propTypes = {
  testId: PropTypes.string,
  isExpanded: PropTypes.bool,
  type: PropTypes.oneOf([
    CARD_TYPES.METER_CHART,
    CARD_TYPES.SPARKLINE_CHART,
    CARD_TYPES.STACKED_AREA_CHART,
  ]).isRequired,
  data: PropTypes.oneOf([MeterChartPropTypes.data, SparklineChartPropTypes.data]),
  content: PropTypes.oneOf([MeterChartPropTypes.content, SparklineChartPropTypes.content]),
};

const defaultProps = {
  testId: 'cart-type-content',
  isExpanded: false,
  data: [],
  content: null,
};

const CardTypeContent = ({ testId, isExpanded, type, data, content }) => {
  const listRef = useRef(null);
  const [listHeight, setListHeight] = useState();

  const contentWithDefaults = useMemo(
    () => defaultsDeep({}, content, defaultProps.content),
    [content]
  );

  const options = getChartOptions(type, data.length > 1, contentWithDefaults);

  useEffect(() => {
    setListHeight(listRef.current?.clientHeight);
  }, [listRef.current?.clientHeight]);

  const Chart =
    type === CARD_TYPES.METER_CHART
      ? MeterChart
      : type === CARD_TYPES.SPARKLINE_CHART
      ? AreaChart
      : type === CARD_TYPES.STACKED_AREA_CHART
      ? StackedAreaChart
      : null;
  return (
    <div
      className={classNames(`${iotPrefix}--${type.replaceAll('_', '-').toLowerCase()}--wrapper`, {
        [`${iotPrefix}--${type.replaceAll('_', '-').toLowerCase()}--wrapper__expanded`]: isExpanded,
      })}
      style={{
        '--card-list-height': content.listContent?.length > 0 ? `${listHeight}px` : '0px',
      }}
    >
      <Chart data={data} options={options} />
      {contentWithDefaults.listContent?.length > 0 ? (
        <div ref={listRef} data-testid={`${testId}-list`}>
          {contentWithDefaults.listContent.map(({ label, value }) => (
            <div className={`${iotPrefix}--${type.replace('_', '-').toLowerCase()}--wrapper--list`}>
              <p>{label}</p>
              <span>{value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

CardTypeContent.propTypes = propTypes;
CardTypeContent.defaultProps = defaultProps;
export default CardTypeContent;
