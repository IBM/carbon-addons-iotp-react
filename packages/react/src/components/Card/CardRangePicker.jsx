import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EventSchedule } from '@carbon/react/icons';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
// import {ToolbarItem} from '@carbon/react'; need to find the correct component
import classnames from 'classnames';
import { isNil } from 'lodash-es';

import { TimeRangeOptionsPropTypes } from '../../constants/CardPropTypes';
import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

export const CardRangePickerPropTypes = {
  /** Optional selected range to pass at the card level */
  timeRange: PropTypes.string,
  /** Generates the available time range selection options. Each option should include 'this' or 'last'.
   * i.e. { thisWeek: 'This week', lastWeek: 'Last week'}
   */
  timeRangeOptions: TimeRangeOptionsPropTypes, // eslint-disable-line react/require-default-props
  /** callback to handle interactions with the range picker */
  onCardAction: PropTypes.func.isRequired,
  /** set of internationalized labels */
  i18n: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.element])
  ).isRequired,
  cardWidth: PropTypes.number,
  testId: PropTypes.string,
};

const defaultProps = {
  timeRange: null,
  cardWidth: undefined,
  testId: 'card-range-picker',
};

const CardRangePicker = ({
  i18n,
  timeRange: timeRangeProp,
  timeRangeOptions,
  onCardAction,
  cardWidth,
  testId,
}) => {
  const [timeRange, setTimeRange] = useState(timeRangeProp);

  const handleTimeRange = useCallback(
    (value) => {
      onCardAction('CHANGE_TIME_RANGE', { range: value });
      setTimeRange(value);
    },
    [setTimeRange, onCardAction]
  );

  useEffect(() => {
    setTimeRange(timeRangeProp);
  }, [timeRangeProp]);

  const getTimeRangeText = (key, defaultText = '') => {
    return typeof timeRangeOptions[key] === 'string'
      ? timeRangeOptions[key]
      : timeRangeOptions[key]?.label || defaultText;
  };

  return (
    <div className={`${iotPrefix}--card--toolbar-date-range-wrapper`}>
      <div
        id="timeRange"
        className={classnames(`${iotPrefix}--card--toolbar-timerange-label`, {
          [`${iotPrefix}--card--toolbar-timerange-label--hidden`]: cardWidth < 400,
        })}
      >
        {getTimeRangeText(timeRange, i18n.defaultLabel)}
      </div>

      <OverflowMenu
        size="md"
        className={classnames(`${iotPrefix}--card--toolbar-date-range-action`)}
        flipped
        title={i18n.selectTimeRangeLabel}
        iconDescription={i18n.selectTimeRangeLabel}
        menuOptionsClass={`${iotPrefix}--card--overflow`}
        renderIcon={EventSchedule}
        data-testid={testId}
      >
        <OverflowMenuItem
          key="default"
          onClick={() => handleTimeRange('default')}
          itemText={i18n.defaultLabel}
          className={classnames({
            [`${iotPrefix}--card--overflow-menuitem-active`]: timeRange === '' || isNil(timeRange),
          })}
        />
        {Object.keys(timeRangeOptions)
          .filter((i) => i.includes('last'))
          .map((i, index) => (
            <OverflowMenuItem
              key={i}
              hasDivider={index === 0}
              onClick={() => handleTimeRange(i)}
              itemText={getTimeRangeText(i)}
              className={classnames({
                [`${iotPrefix}--card--overflow-menuitem-active`]: timeRange === i,
              })}
            />
          ))}
        {Object.keys(timeRangeOptions)
          .filter((i) => i.includes('this'))
          .map((i, index) => (
            <OverflowMenuItem
              key={i}
              hasDivider={index === 0}
              onClick={() => handleTimeRange(i)}
              itemText={getTimeRangeText(i)}
              className={classnames({
                [`${iotPrefix}--card--overflow-menuitem-active`]: timeRange === i,
              })}
            />
          ))}
      </OverflowMenu>
    </div>
  );
};

CardRangePicker.propTypes = CardRangePickerPropTypes;
CardRangePicker.defaultProps = defaultProps;
export default CardRangePicker;
