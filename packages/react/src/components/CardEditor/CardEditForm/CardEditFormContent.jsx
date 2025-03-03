import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { CARD_TYPES } from '../../../constants/LayoutConstants';
import {
  DashboardEditorActionsPropTypes,
  DataItemsPropTypes,
  defaultDashboardEditorActionsProps,
} from '../../DashboardEditor/editorUtils';
import { settings } from '../../../constants/Settings';

import CommonCardEditFormFields from './CommonCardEditFormFields';
import DataSeriesFormContent from './CardEditFormItems/DataSeriesFormItems/DataSeriesFormContent';
import ImageCardFormContent from './CardEditFormItems/ImageCardFormItems/ImageCardFormContent';
import TableCardFormContent from './CardEditFormItems/TableCardFormItems/TableCardFormContent';
import ContentFormItemTitle from './CardEditFormItems/ContentFormItemTitle';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    timeRange: PropTypes.string,
    renderEditContent: PropTypes.func,
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
      // custom card content is a function
      PropTypes.func,
    ]),
    dataSource: PropTypes.shape({
      attributes: PropTypes.arrayOf(
        PropTypes.shape({
          aggregator: PropTypes.string,
          attribute: PropTypes.string,
          id: PropTypes.string,
        })
      ),
    }),
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
  /** if provided, returns an array of strings which are the dataItems to be allowed
   * on each card
   * getValidDataItems(card, selectedTimeRange)
   */
  getValidDataItems: PropTypes.func,
  /** an array of dataItems to be included on each card
   * this prop will be ignored if getValidDataItems is defined
   */
  dataItems: DataItemsPropTypes,
  currentBreakpoint: PropTypes.string,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
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
  i18n: {},
  getValidDataItems: null,
  getValidTimeRanges: null,
  dataItems: [],
  currentBreakpoint: 'xl',
  availableDimensions: {},
  isSummaryDashboard: false,
  dataSeriesItemLinks: null,
  actions: defaultDashboardEditorActionsProps,
};

export const handleTranslationCallback = (idToTranslate, mergedI18n) => {
  const { openMenuText, closeMenuText, clearAllText } = mergedI18n;
  switch (idToTranslate) {
    case 'clear.all':
      return clearAllText || 'Clear all';
    case 'open.menu':
      return openMenuText || 'Open menu';
    case 'close.menu':
      return closeMenuText || 'Close menu';
    default:
      return '';
  }
};

const CardEditFormContent = ({
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
  const { type, timeRange, renderEditContent } = cardConfig;
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const [selectedDataItems, setSelectedDataItems] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange || '');

  const handleTranslation = useCallback(
    (idToTranslate) => handleTranslationCallback(idToTranslate, mergedI18n),
    [mergedI18n]
  );

  const editContentSections = renderEditContent && renderEditContent(onChange, cardConfig);
  return (
    <div className={`${iotPrefix}--card-edit-form--content`}>
      <CommonCardEditFormFields
        cardConfig={cardConfig}
        key={`${cardConfig.id}-common`} // fix because I need to regenerate the form state when switching between cards
        onChange={onChange}
        i18n={mergedI18n}
        getValidTimeRanges={getValidTimeRanges}
        currentBreakpoint={currentBreakpoint}
        selectedDataItems={selectedDataItems}
        setSelectedTimeRange={setSelectedTimeRange}
        translateWithId={handleTranslation}
      />

      {type === CARD_TYPES.IMAGE ? (
        <ImageCardFormContent
          cardConfig={cardConfig}
          key={`${cardConfig.id}-image`} // fix because I need to regenerate the form state when switching between cards
          i18n={mergedI18n}
          onChange={onChange}
          dataSeriesItemLinks={dataSeriesItemLinks}
          dataItems={dataItems}
          getValidDataItems={getValidDataItems}
          availableDimensions={availableDimensions}
          translateWithId={handleTranslation}
          onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
          actions={actions}
        />
      ) : type === CARD_TYPES.TABLE ? (
        <TableCardFormContent
          cardConfig={cardConfig}
          key={`${cardConfig.id}-table`} // fix because I need to regenerate the form state when switching between cards
          i18n={mergedI18n}
          onChange={onChange}
          dataItems={dataItems}
          selectedDataItems={selectedDataItems}
          selectedTimeRange={selectedTimeRange}
          setSelectedDataItems={setSelectedDataItems}
          getValidDataItems={getValidDataItems}
          availableDimensions={availableDimensions}
          dataSeriesItemLinks={dataSeriesItemLinks}
          translateWithId={handleTranslation}
          actions={actions}
        />
      ) : type === CARD_TYPES.BAR ||
        type === CARD_TYPES.TIMESERIES ||
        type === CARD_TYPES.VALUE ||
        type === CARD_TYPES.LIST ? (
        <DataSeriesFormContent
          cardConfig={cardConfig}
          isSummaryDashboard={isSummaryDashboard}
          key={`${cardConfig.id}-data`} // fix because I need to regenerate the form state when switching between cards
          onChange={onChange}
          dataItems={dataItems}
          selectedDataItems={selectedDataItems}
          setSelectedDataItems={setSelectedDataItems}
          selectedTimeRange={selectedTimeRange}
          getValidDataItems={getValidDataItems}
          availableDimensions={availableDimensions}
          i18n={mergedI18n}
          dataSeriesItemLinks={dataSeriesItemLinks}
          translateWithId={handleTranslation}
          actions={actions}
        />
      ) : null}
      {Array.isArray(editContentSections) // render the content sections for all types of card if set
        ? editContentSections.map(({ header, content }, index) => {
            const { title, tooltip } = header || {};
            return (
              <React.Fragment key={`custom-content-section-${index}`}>
                {title || tooltip ? <ContentFormItemTitle title={title} tooltip={tooltip} /> : null}
                {content}
              </React.Fragment>
            );
          })
        : null}
    </div>
  );
};

CardEditFormContent.propTypes = propTypes;
CardEditFormContent.defaultProps = defaultProps;

export default CardEditFormContent;
