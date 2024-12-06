import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash-es';
import { TextArea, TextInput } from '@carbon/react';

import {
  CARD_SIZES,
  CARD_DIMENSIONS,
  ALLOWED_CARD_SIZES_PER_TYPE,
} from '../../../constants/LayoutConstants';
import { settings } from '../../../constants/Settings';
import { Dropdown } from '../../Dropdown';
import { timeRangeToJSON } from '../../DashboardEditor/editorUtils';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    timeRange: PropTypes.string,
    dataSource: PropTypes.shape({
      attributes: PropTypes.arrayOf(
        PropTypes.shape({
          aggregator: PropTypes.string,
          attribute: PropTypes.string,
          id: PropTypes.string,
        })
      ),
    }),
    content: PropTypes.oneOfType([
      PropTypes.shape({
        series: PropTypes.arrayOf(
          PropTypes.shape({
            label: PropTypes.string,
            dataSourceId: PropTypes.string,
            color: PropTypes.string,
          })
        ),
        xLabel: PropTypes.string,
        yLabel: PropTypes.string,
        unit: PropTypes.string,
        includeZeroOnXaxis: PropTypes.bool,
        includeZeroOnYaxis: PropTypes.bool,
        timeDataSourceId: PropTypes.string,
        showLegend: PropTypes.bool,
      }),
      PropTypes.shape({
        id: PropTypes.string,
        src: PropTypes.string,
        zoomMax: PropTypes.number,
      }),
    ]),
  }),
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    cardTitle: PropTypes.string,
    description: PropTypes.string,
    size: PropTypes.string,
    selectASize: PropTypes.string,
    timeRange: PropTypes.string,
    selectATimeRange: PropTypes.string,
    last24HoursLabel: PropTypes.string,
    last7DaysLabel: PropTypes.string,
    lastMonthLabel: PropTypes.string,
    lastQuarterLabel: PropTypes.string,
    lastYearLabel: PropTypes.string,
    thisWeekLabel: PropTypes.string,
    thisMonthLabel: PropTypes.string,
    thisQuarterLabel: PropTypes.string,
    thisYearLabel: PropTypes.string,
  }),
  /** if provided, returns an array of strings which are the timeRanges to be allowed
   * on each card
   * getValidTimeRanges(card, selectedDataItems)
   */
  getValidTimeRanges: PropTypes.func,
  currentBreakpoint: PropTypes.string,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  selectedDataItems: PropTypes.arrayOf(PropTypes.string),
  setSelectedTimeRange: PropTypes.func.isRequired,
  translateWithId: PropTypes.func.isRequired,
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    cardTitle: 'Card title',
    description: 'Description (Optional)',
    size: 'Size',
    selectASize: 'Select a size',
    timeRange: 'Time range',
    selectATimeRange: 'Select a time range',
    last24HoursLabel: 'Last 24 hours',
    last7DaysLabel: 'Last 7 days',
    lastMonthLabel: 'Last month',
    lastQuarterLabel: 'Last quarter',
    lastYearLabel: 'Last year',
    thisWeekLabel: 'This week',
    thisMonthLabel: 'This month',
    thisQuarterLabel: 'This quarter',
    thisYearLabel: 'This year',
  },
  selectedDataItems: [],
  getValidTimeRanges: null,
  currentBreakpoint: 'xl',
  availableDimensions: {},
};

const defaultTimeRangeOptions = [
  'last24Hours',
  'last7Days',
  'lastMonth',
  'lastQuarter',
  'lastYear',
  'thisWeek',
  'thisMonth',
  'thisQuarter',
  'thisYear',
];

/**
 * Returns card size and dimensions labels
 * @param {string} size
 * @param {Object<string>} i18n
 * @returns {string}
 */
export const getCardSizeText = (size, i18n, breakpoint) => {
  const sizeName = i18n[`cardSize_${size}`];
  const sizeDimensions = `(${CARD_DIMENSIONS[size][breakpoint].w}x${CARD_DIMENSIONS[size][breakpoint].h})`;
  return `${sizeName} ${sizeDimensions}`;
};

const CommonCardEditFormFields = ({
  cardConfig,
  onChange,
  i18n,
  getValidTimeRanges,
  currentBreakpoint,
  selectedDataItems,
  setSelectedTimeRange,
  translateWithId,
}) => {
  const { title, description, size, type, id } = cardConfig;
  const mergedI18n = { ...defaultProps.i18n, ...i18n };

  const baseClassName = `${iotPrefix}--card-edit-form`;

  const validTimeRanges = getValidTimeRanges
    ? getValidTimeRanges(cardConfig, selectedDataItems)
    : defaultTimeRangeOptions;

  const validTimeRangeOptions = validTimeRanges.map((range) => ({
    id: range,
    text: mergedI18n[`${range}Label`] || range,
  }));

  return (
    <>
      <div className={`${baseClassName}--input`}>
        <TextInput
          id={`${id}_title`}
          labelText={mergedI18n.cardTitle}
          light
          onChange={(evt) => onChange({ ...cardConfig, title: evt.target.value })}
          value={title}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <TextArea
          id={`${id}_description`}
          labelText={mergedI18n.description}
          light
          onChange={(evt) => onChange({ ...cardConfig, description: evt.target.value })}
          value={description}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <Dropdown
          id={`${id}_size`}
          label={mergedI18n.selectASize}
          direction="bottom"
          itemToString={(item) => item.text}
          items={(ALLOWED_CARD_SIZES_PER_TYPE[type] ?? Object.keys(CARD_SIZES)).map((cardSize) => {
            return {
              id: cardSize,
              text: getCardSizeText(cardSize, mergedI18n, currentBreakpoint),
            };
          })}
          light
          translateWithId={translateWithId}
          selectedItem={{
            id: size,
            text: getCardSizeText(size, mergedI18n, currentBreakpoint),
          }}
          onChange={({ selectedItem }) => {
            onChange({ ...cardConfig, size: selectedItem.id });
          }}
          titleText={mergedI18n.size}
        />
      </div>
      {isEmpty(validTimeRangeOptions) ? null : (
        <div className={`${baseClassName}--input`}>
          <Dropdown
            key={`card_${id}`}
            id={`${id}_time_range`}
            label={mergedI18n.selectATimeRange}
            title={mergedI18n.selectATimeRange}
            direction="bottom"
            itemToString={(item) => item.text}
            items={validTimeRangeOptions}
            selectedItem={validTimeRangeOptions.find(
              // This is a hacky workaround for a carbon issue
              (validTimeRangeOption) => validTimeRangeOption.id === cardConfig.timeRange
            )}
            light
            translateWithId={translateWithId}
            onChange={({ selectedItem }) => {
              const timeRangeInterval = selectedItem.id;
              const { range } = timeRangeToJSON[timeRangeInterval];
              setSelectedTimeRange(timeRangeInterval);
              onChange({
                ...cardConfig,
                timeRange: timeRangeInterval,
                dataSource: { ...cardConfig.dataSource, range },
              });
            }}
            titleText={mergedI18n.timeRange}
          />
        </div>
      )}
    </>
  );
};

CommonCardEditFormFields.propTypes = propTypes;
CommonCardEditFormFields.defaultProps = defaultProps;

export default CommonCardEditFormFields;
