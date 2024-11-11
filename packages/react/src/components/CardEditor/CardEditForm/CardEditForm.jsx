import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';

import { CARD_DIMENSIONS, CARD_TYPES } from '../../../constants/LayoutConstants';
import { settings } from '../../../constants/Settings';
import {
  DashboardEditorActionsPropTypes,
  DataItemsPropTypes,
} from '../../DashboardEditor/editorUtils';

import CardEditFormContent from './CardEditFormContent';
import CardEditFormSettings from './CardEditFormSettings';

const { iotPrefix } = settings;

/* istanbul ignore next */
const noop = () => {};

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    openEditorButton: PropTypes.string,
    contentTabLabel: PropTypes.string,
    settingsTabLabel: PropTypes.string,
    cardSize_SMALL: PropTypes.string,
    cardSize_SMALLWIDE: PropTypes.string,
    cardSize_SMALLFULL: PropTypes.string,
    cardSize_MEDIUM: PropTypes.string,
    cardSize_MEDIUMTHIN: PropTypes.string,
    cardSize_MEDIUMWIDE: PropTypes.string,
    cardSize_LARGE: PropTypes.string,
    cardSize_LARGETHIN: PropTypes.string,
    cardSize_LARGEWIDE: PropTypes.string,
    chartType_BAR: PropTypes.string,
    chartType_LINE: PropTypes.string,
    barChartType_SIMPLE: PropTypes.string,
    barChartType_GROUPED: PropTypes.string,
    barChartType_STACKED: PropTypes.string,
    barChartLayout_HORIZONTAL: PropTypes.string,
    barChartLayout_VERTICAL: PropTypes.string,

    errorTitle: PropTypes.string,
    modalTitle: PropTypes.string,
    modalLabel: PropTypes.string,
    modalHelpText: PropTypes.string,
    modalIconDescription: PropTypes.string,
  }),
  /** if provided, returns an array of strings which are the dataItems to be allowed
   * on each card
   * getValidDataItems(card, selectedTimeRange)
   */
  getValidDataItems: PropTypes.func,
  /** if provided, returns an array of strings which are the timeRanges to be allowed
   * on each card
   * getValidTimeRanges(card, selectedDataItems)
   */
  getValidTimeRanges: PropTypes.func,
  /** an array of dataItems to be included on each card
   * this prop will be ignored if getValidDataItems is defined
   */
  dataItems: DataItemsPropTypes,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  currentBreakpoint: PropTypes.string,
  isSummaryDashboard: PropTypes.bool,
  /** optional link href's for each card type that will appear in a tooltip */
  dataSeriesItemLinks: PropTypes.shape({
    simpleBar: PropTypes.string,
    groupedBar: PropTypes.string,
    stackedBar: PropTypes.string,
    timeSeries: PropTypes.string,
    value: PropTypes.string,
    custom: PropTypes.string,
    table: PropTypes.string,
    image: PropTypes.string,
  }),
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    openEditorButton: 'Open JSON editor',
    contentTabLabel: 'Content',
    settingsTabLabel: 'Settings',
    cardSize_SMALL: 'Small',
    cardSize_SMALLWIDE: 'Small wide',
    cardSize_SMALLFULL: 'Small full',
    cardSize_MEDIUM: 'Medium',
    cardSize_MEDIUMTHIN: 'Medium thin',
    cardSize_MEDIUMWIDE: 'Medium wide',
    cardSize_LARGE: 'Large',
    cardSize_LARGETHIN: 'Large thin',
    cardSize_LARGEWIDE: 'Large wide',
    chartType_BAR: 'Bar',
    chartType_LINE: 'Line',
    barChartType_SIMPLE: 'Simple',
    barChartType_GROUPED: 'Grouped',
    barChartType_STACKED: 'Stacked',
    barChartLayout_HORIZONTAL: 'Horizontal',
    barChartLayout_VERTICAL: 'Vertical',
    errorTitle: 'Error:',
    modalTitle: 'Edit card JSON configuration',
    modalLabel: 'Card editor',
    modalHelpText:
      'The JSON definition for this card is provided below.  You can modify this data directly to update the card configuration.',
    modalIconDescription: 'Close',
  },
  getValidDataItems: null,
  getValidTimeRanges: null,
  dataItems: [],
  availableDimensions: {},
  currentBreakpoint: 'xl',
  isSummaryDashboard: false,
  dataSeriesItemLinks: null,
  actions: {
    onEditDataItem: noop,
    dataSeriesFormActions: {
      hasAggregationsDropDown: noop,
      hasDataFilterDropdown: noop,
      onAddAggregations: noop,
    },
  },
};

/**
 * Returns card size and dimensions labels
 * @param {string} size
 * @param {Object<string>} i18n
 * @returns {string}
 */
export const getCardSizeText = (size, i18n) => {
  const sizeName = i18n[`cardSize_${size}`];
  const sizeDimensions = `(${CARD_DIMENSIONS[size].lg.w}x${CARD_DIMENSIONS[size].lg.h})`;
  return `${sizeName} ${sizeDimensions}`;
};

const CardEditForm = ({
  cardConfig,
  isSummaryDashboard,
  onChange,
  i18n,
  dataItems,
  getValidDataItems,
  getValidTimeRanges,
  currentBreakpoint,
  availableDimensions,
  dataSeriesItemLinks,
  // eslint-disable-next-line react/prop-types
  onFetchDynamicDemoHotspots,
  actions,
}) => {
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const baseClassName = `${iotPrefix}--card-edit-form`;

  const isCustomCardWithNoSettings =
    (cardConfig.type === CARD_TYPES.CUSTOM || !CARD_TYPES.hasOwnProperty(cardConfig.type)) &&
    !cardConfig.renderEditSettings;

  return (
    <div className={baseClassName}>
      <Tabs>
        <TabList contained fullWidth>
          <Tab>{mergedI18n.contentTabLabel}</Tab>
          {!isCustomCardWithNoSettings ? <Tab>{mergedI18n.settingsTabLabel}</Tab> : null}
        </TabList>
        <TabPanels>
          <TabPanel>
            <CardEditFormContent
              cardConfig={cardConfig}
              onChange={onChange}
              isSummaryDashboard={isSummaryDashboard}
              i18n={mergedI18n}
              dataItems={dataItems}
              availableDimensions={availableDimensions}
              getValidDataItems={getValidDataItems}
              getValidTimeRanges={getValidTimeRanges}
              currentBreakpoint={currentBreakpoint}
              dataSeriesItemLinks={dataSeriesItemLinks}
              onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
              actions={actions}
            />
          </TabPanel>
          {!isCustomCardWithNoSettings ? (
            <TabPanel>
              <CardEditFormSettings
                availableDimensions={availableDimensions}
                cardConfig={cardConfig}
                onChange={onChange}
                i18n={mergedI18n}
                getValidDataItems={getValidDataItems}
                getValidTimeRanges={getValidTimeRanges}
                currentBreakpoint={currentBreakpoint}
                dataSeriesItemLinks={dataSeriesItemLinks}
                onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
              />
            </TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>
    </div>
  );
};

CardEditForm.propTypes = propTypes;
CardEditForm.defaultProps = defaultProps;

export default CardEditForm;
