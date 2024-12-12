import React, { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Edit, Subtract } from '@carbon/react/icons';
import { omit, isEmpty } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import hash from 'object-hash';
import { ComboBox } from '@carbon/react';

import { settings } from '../../../../../constants/Settings';
import {
  DATAITEM_COLORS_OPTIONS,
  handleDataSeriesChange,
  DataItemsPropTypes,
  DashboardEditorActionsPropTypes,
} from '../../../../DashboardEditor/editorUtils';
import Button from '../../../../Button';
import List from '../../../../List/List';
import { Dropdown } from '../../../../Dropdown';
import DataSeriesFormItemModal from '../DataSeriesFormItemModal';
import { CARD_TYPES, BAR_CHART_TYPES } from '../../../../../constants/LayoutConstants';
import ContentFormItemTitle from '../ContentFormItemTitle';

import BarChartDataSeriesContent from './BarChartDataSeriesContent';

const { iotPrefix } = settings;

/* istanbul ignore next */
const noop = () => {};

const propTypes = {
  /* card value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
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
      }), // custom card content is a function
      PropTypes.func,
    ]),
    interval: PropTypes.string,
  }),
  /* callback when data item input value changes */
  onChange: PropTypes.func.isRequired,
  /** if provided, returns an array of strings which are the dataItems to be allowed
   * on each card
   * getValidDataItems(card, selectedTimeRange)
   */
  getValidDataItems: PropTypes.func,
  /** an array of dataItems to be included on each card
   * this prop will be ignored if getValidDataItems is defined
   */
  dataItems: DataItemsPropTypes,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  /** list of dataItem names that have been selected to display on the card */
  selectedDataItems: PropTypes.arrayOf(PropTypes.string),
  setSelectedDataItems: PropTypes.func.isRequired,
  selectedTimeRange: PropTypes.string,
  isSummaryDashboard: PropTypes.bool,
  /** optional link href's for each card type that will appear in a tooltip */
  dataSeriesItemLinks: PropTypes.shape({
    simpleBar: PropTypes.string,
    groupedBar: PropTypes.string,
    stackedBar: PropTypes.string,
    timeSeries: PropTypes.string,
    value: PropTypes.string,
    custom: PropTypes.string,
  }),
  i18n: PropTypes.shape({
    dataItemEditorTitle: PropTypes.string,
    dataItemEditorDataItemTitle: PropTypes.string,
    dataItemEditorDataItemLabel: PropTypes.string,
    dataItemEditorLegendColor: PropTypes.string,
    dataItemEditorSectionTitle: PropTypes.string,
    dataItemEditorSectionSimpleBarTooltipText: PropTypes.string,
    dataItemEditorSectionGroupedBarTooltipText: PropTypes.string,
    dataItemEditorSectionStackedBarTooltipText: PropTypes.string,
    dataItemEditorSectionTimeSeriesTooltipText: PropTypes.string,
    dataItemEditorSectionValueTooltipText: PropTypes.string,
    dataItemEditorSectionCustomTooltipText: PropTypes.string,
    dataItemEditorSectionTooltipLinkText: PropTypes.string,
    dataSeriesTitle: PropTypes.string,
    selectDataItems: PropTypes.string,
    selectDataItem: PropTypes.string,
    dataItem: PropTypes.string,
    edit: PropTypes.string,
    remove: PropTypes.string,
    customize: PropTypes.string,
    clearAllText: PropTypes.string,
    clearSelectionText: PropTypes.string,
    openMenuText: PropTypes.string,
    closeMenuText: PropTypes.string,
    incrementNumberText: PropTypes.string,
    decrementNumberText: PropTypes.string,
  }),
  translateWithId: PropTypes.func.isRequired,
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  cardConfig: {},
  selectedTimeRange: '',
  i18n: {
    dataItemEditorTitle: 'Edit data series',
    dataItemEditorDataItemTitle: 'Data item',
    dataItemEditorDataItemLabel: 'Label',
    dataItemEditorLegendColor: 'Legend color',
    dataItemEditorSectionTitle: 'Data',
    dataItemEditorSectionSimpleBarTooltipText:
      'Display a metric using bars. Plot over time or by a dimension from Group by.',
    dataItemEditorSectionGroupedBarTooltipText:
      'Group categories side by side in bars. Show groupings of related metrics or different categories of a single metric.',
    dataItemEditorSectionStackedBarTooltipText:
      'Stack bars by categories of a single dimension or into multiple related metrics.',
    dataItemEditorSectionTimeSeriesTooltipText: 'Plot time series metrics over time.',
    dataItemEditorSectionValueTooltipText:
      'Display metric values, dimension values, or alert counts. Select from Data item. ',
    dataItemEditorSectionCustomTooltipText:
      'Show or hide alert fields. Choose dimensions to add as extra columns. ',
    dataItemEditorSectionTooltipLinkText: 'Learn more',
    selectDataItems: 'Select data items',
    selectDataItem: 'Select data item',
    dataItem: 'Data item',
    edit: 'Edit',
    remove: 'Remove',
    customize: 'Customize',
    filter: 'Filter',
    clearAllText: 'Clear all',
    clearSelectionText: 'Clear selection',
    openMenuText: 'Open menu',
    closeMenuText: 'Close menu',
    incrementNumberText: 'Increment number',
    decrementNumberText: 'Decrement number',
  },
  getValidDataItems: null,
  dataItems: [],
  selectedDataItems: [],
  availableDimensions: {},
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

export const formatDataItemsForDropdown = (dataItems) =>
  dataItems?.map(({ dataItemId, label }) => ({
    id: dataItemId,
    text: label,
  })) || [];

/**
 * Retuns card specific tooltip depending on card type
 * @param {Object} cardConfig
 * @returns {Object} tooltip definition
 */
export const defineCardSpecificTooltip = (cardConfig, dataSeriesItemLinks, i18n) => {
  switch (cardConfig.type) {
    case CARD_TYPES.BAR:
      if (cardConfig.content.type === BAR_CHART_TYPES.SIMPLE) {
        return {
          tooltipText: i18n.dataItemEditorSectionSimpleBarTooltipText,
          ...(dataSeriesItemLinks?.simpleBar
            ? {
                linkText: i18n.dataItemEditorSectionTooltipLinkText,
                href: dataSeriesItemLinks.simpleBar,
              }
            : {}),
        };
      }
      if (cardConfig.content.type === BAR_CHART_TYPES.GROUPED) {
        return {
          tooltipText: i18n.dataItemEditorSectionGroupedBarTooltipText,
          ...(dataSeriesItemLinks?.groupedBar
            ? {
                linkText: i18n.dataItemEditorSectionTooltipLinkText,
                href: dataSeriesItemLinks.groupedBar,
              }
            : {}),
        };
      }
      // STACKED
      return {
        tooltipText: i18n.dataItemEditorSectionStackedBarTooltipText,
        ...(dataSeriesItemLinks?.stackedBar
          ? {
              linkText: i18n.dataItemEditorSectionTooltipLinkText,
              href: dataSeriesItemLinks.stackedBar,
            }
          : {}),
      };

    case CARD_TYPES.TIMESERIES:
      return {
        tooltipText: i18n.dataItemEditorSectionTimeSeriesTooltipText,
        ...(dataSeriesItemLinks?.timeSeries
          ? {
              linkText: i18n.dataItemEditorSectionTooltipLinkText,
              href: dataSeriesItemLinks.timeSeries,
            }
          : {}),
      };

    case CARD_TYPES.VALUE:
      return {
        tooltipText: i18n.dataItemEditorSectionValueTooltipText,
        ...(dataSeriesItemLinks?.value
          ? {
              linkText: i18n.dataItemEditorSectionTooltipLinkText,
              href: dataSeriesItemLinks.value,
            }
          : {}),
      };

    case CARD_TYPES.CUSTOM:
    default:
      return {
        tooltipText: i18n.dataItemEditorSectionCustomTooltipText,
        ...(dataSeriesItemLinks?.custom
          ? {
              linkText: i18n.dataItemEditorSectionTooltipLinkText,
              href: dataSeriesItemLinks.custom,
            }
          : {}),
      };
  }
};

const baseClassName = `${iotPrefix}--card-edit-form`;

const DataSeriesFormItem = ({
  cardConfig,
  isSummaryDashboard,
  dataItems,
  getValidDataItems,
  onChange,
  selectedDataItems,
  setSelectedDataItems,
  selectedTimeRange,
  availableDimensions,
  i18n,
  dataSeriesItemLinks,
  translateWithId,
  actions,
}) => {
  const { onEditDataItem } = actions;
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const [showEditor, setShowEditor] = useState(false);
  const [editDataItem, setEditDataItem] = useState({});
  const [editDataSeries, setEditDataSeries] = useState(cardConfig.content?.series || []);
  const [removedDataItems, setRemovedDataItems] = useState([]);

  const canMultiSelectDataItems = cardConfig.content?.type !== BAR_CHART_TYPES.SIMPLE;
  const { type } = cardConfig;

  // determine which content section to look at
  const dataSection =
    cardConfig.type === CARD_TYPES.TIMESERIES || cardConfig.type === CARD_TYPES.BAR
      ? cardConfig?.content?.series
      : cardConfig?.content?.attributes;

  const removedItemsCountRef = useRef(0);

  const validDataItems = useMemo(
    () => (getValidDataItems ? getValidDataItems(cardConfig, selectedTimeRange) : dataItems),
    [cardConfig, dataItems, getValidDataItems, selectedTimeRange]
  );

  const cardSpecificTooltip = defineCardSpecificTooltip(
    cardConfig,
    dataSeriesItemLinks,
    mergedI18n
  );

  const handleSimpleDataSeriesChange = useCallback(
    ({ selectedItem }) => {
      // ignore the extra value added by the "enter" keypress
      if (selectedItem && !isEmpty(selectedItem.id)) {
        const itemWithMetaData = validDataItems?.find(
          ({ dataItemId }) => dataItemId === selectedItem.id
        );

        const selectedItems = [
          ...dataSection,
          {
            ...(itemWithMetaData && { ...itemWithMetaData }),
            // create a unique dataSourceId if it's going into attributes
            // if it's going into the groupBy section then just use the dataItem ID
            dataSourceId:
              itemWithMetaData?.destination === 'groupBy'
                ? selectedItem.id
                : `${selectedItem.id}_${uuidv4()}`,
          },
        ];
        // need to remove the category if the card is a stacked timeseries bar
        const card =
          cardConfig.content.type === BAR_CHART_TYPES.STACKED &&
          cardConfig.content.timeDataSourceId &&
          selectedItems.length > 1
            ? omit(cardConfig, 'content.categoryDataSourceId')
            : cardConfig;
        const newCard = handleDataSeriesChange(
          selectedItems,
          card,
          setEditDataSeries,
          undefined,
          removedItemsCountRef
        );
        setSelectedDataItems(selectedItems.map(({ dataSourceId }) => dataSourceId));
        onChange(newCard);
      }
    },
    [cardConfig, dataSection, onChange, setSelectedDataItems, validDataItems]
  );

  const handleEditButton = useCallback(
    async (dataItem, i) => {
      const dataItemWithMetaData = validDataItems?.find(
        ({ dataItemId }) => dataItemId === dataItem.dataItemId
      );
      const colorIndex = (removedItemsCountRef.current + i) % DATAITEM_COLORS_OPTIONS.length;
      // Call back function for on click of edit button
      if (onEditDataItem) {
        const aggregationMethods = await onEditDataItem(cardConfig, dataItem, dataItemWithMetaData);
        if (!isEmpty(aggregationMethods)) {
          dataItemWithMetaData.aggregationMethods = aggregationMethods;
        }
      }
      // need to reset the card to include the latest dataSection
      onChange({
        ...cardConfig,
        content: {
          ...cardConfig.content,
          ...(cardConfig.type === CARD_TYPES.VALUE
            ? { attributes: dataSection }
            : { series: dataSection }),
        },
      });
      setEditDataItem({
        ...dataItemWithMetaData,
        ...dataItem,
        ...(cardConfig.type === CARD_TYPES.TIMESERIES || cardConfig.type === CARD_TYPES.BAR
          ? {
              color: dataItem.color || DATAITEM_COLORS_OPTIONS[colorIndex],
            }
          : {}),
      });
      setShowEditor(true);
    },
    [cardConfig, dataSection, onChange, onEditDataItem, validDataItems]
  );

  const handleRemoveButton = useCallback(
    (dataItem) => {
      const filteredItems = dataSection.filter(
        (item) => item.dataSourceId !== dataItem.dataSourceId
      );
      removedItemsCountRef.current += 1;
      setSelectedDataItems(filteredItems.map((item) => item.dataSourceId));
      setRemovedDataItems([...removedDataItems, dataItem]);
      setEditDataSeries(filteredItems);
      onChange({
        ...cardConfig,
        content: {
          ...cardConfig.content,
          ...(cardConfig.type === CARD_TYPES.VALUE
            ? { attributes: filteredItems }
            : { series: filteredItems }),
        },
      });
    },
    [cardConfig, dataSection, onChange, removedDataItems, setSelectedDataItems]
  );

  const dataItemListItems = useMemo(
    () =>
      dataSection?.map((dataItem, i) => {
        const colorIndex = (i + removedItemsCountRef.current) % DATAITEM_COLORS_OPTIONS.length;
        const iconColorOption = dataItem.color || DATAITEM_COLORS_OPTIONS[colorIndex];
        return {
          id: dataItem.dataSourceId,
          content: {
            value: dataItem.label || dataItem.dataItemId,
            icon:
              cardConfig.type === CARD_TYPES.TIMESERIES || cardConfig.type === CARD_TYPES.BAR ? (
                <div
                  className={`${baseClassName}--data-item-list--item-color-icon`}
                  style={{
                    '--icon-color-option': iconColorOption,
                  }}
                />
              ) : null,
            rowActions: () => [
              <Button
                key={`data-item-${dataItem.dataSourceId}_edit`}
                renderIcon={Edit}
                hasIconOnly
                kind="ghost"
                size="sm"
                onClick={() => handleEditButton(dataItem, i)}
                iconDescription={mergedI18n.edit}
                tooltipPosition="left"
                tooltipAlignment="center"
              />,
              <Button
                key={`data-item-${dataItem.dataSourceId}_remove`}
                renderIcon={Subtract}
                hasIconOnly
                kind="ghost"
                size="sm"
                onClick={() => handleRemoveButton(dataItem)}
                iconDescription={mergedI18n.remove}
                tooltipPosition="left"
                tooltipAlignment="center"
              />,
            ],
          },
        };
      }),
    [
      cardConfig.type,
      dataSection,
      handleEditButton,
      handleRemoveButton,
      mergedI18n.edit,
      mergedI18n.remove,
    ]
  );

  return !isEmpty(validDataItems) ? (
    <>
      <DataSeriesFormItemModal
        cardConfig={cardConfig}
        isSummaryDashboard={isSummaryDashboard}
        showEditor={showEditor}
        setShowEditor={setShowEditor}
        editDataSeries={editDataSeries}
        setEditDataSeries={setEditDataSeries}
        editDataItem={editDataItem}
        setEditDataItem={setEditDataItem}
        validDataItems={validDataItems}
        availableDimensions={availableDimensions}
        dataSection={dataSection}
        onChange={onChange}
        i18n={mergedI18n}
        actions={actions}
        options={{
          hasColorDropdown: type === CARD_TYPES.TIMESERIES || type === CARD_TYPES.BAR,
          hasUnit: type === CARD_TYPES.VALUE,
          hasDecimalPlacesDropdown: type === CARD_TYPES.VALUE,
          hasThresholds: type === CARD_TYPES.VALUE,
          hasTooltip: type === CARD_TYPES.VALUE,
        }}
      />
      <ContentFormItemTitle
        title={mergedI18n.dataItemEditorSectionTitle}
        // Specific to each card type
        tooltip={{ ...cardSpecificTooltip }}
      />
      {cardConfig.type === CARD_TYPES.BAR && (
        <BarChartDataSeriesContent
          cardConfig={cardConfig}
          onChange={onChange}
          availableDimensions={availableDimensions}
          i18n={mergedI18n}
          translateWithId={translateWithId}
        />
      )}
      <div className={`${baseClassName}--input`}>
        {canMultiSelectDataItems ? (
          <ComboBox
            // need to re-gen if selected card changes or if a dataItem is removed from the list
            key={`data-item-select-${hash(validDataItems)}-selected_card-id-${cardConfig.id}`}
            data-testid="editor--data-series--combobox"
            id={`${cardConfig.id}_dataSourceIds-combobox`}
            items={formatDataItemsForDropdown(validDataItems)}
            itemToString={(item) => item?.text}
            titleText={mergedI18n.dataItemEditorDataItemTitle}
            addToList={false}
            translateWithId={translateWithId}
            shouldFilterItem={({ item, inputValue }) => {
              return (
                isEmpty(inputValue) ||
                item?.text?.toLowerCase()?.includes(inputValue?.toLowerCase())
              );
            }}
            placeholder={mergedI18n.filter}
            // clears out the input field after each selection
            selectedItem={{ id: '', text: '' }}
            onChange={handleSimpleDataSeriesChange}
            light
          />
        ) : (
          // Can't select more than one dataItem
          <Dropdown
            id={`${cardConfig.id}_dataSourceId`}
            direction="bottom"
            label={mergedI18n.selectDataItem}
            light
            translateWithId={translateWithId}
            title={mergedI18n.selectDataItem}
            titleText={mergedI18n.dataItem}
            items={validDataItems.map(({ dataSourceId }) => dataSourceId)}
            selectedItem={
              !isEmpty(cardConfig.content?.series) ? cardConfig.content?.series[0].dataItemId : null
            }
            onChange={({ selectedItem }) => {
              const itemWithMetaData = validDataItems?.find(
                ({ dataSourceId }) => dataSourceId === selectedItem
              );
              const newCard = handleDataSeriesChange(
                [
                  {
                    id: selectedItem,
                    ...(itemWithMetaData && { ...itemWithMetaData }),
                    dataSourceId: `${selectedItem}_${uuidv4()}`,
                  },
                ],
                cardConfig,
                setEditDataSeries
              );
              setSelectedDataItems([selectedItem]);
              onChange(newCard);
            }}
          />
        )}
      </div>

      <List
        className={`${baseClassName}--data-item-list`}
        key={`data-item-list${selectedDataItems.length}`}
        // need to force an empty "empty state"
        emptyState={<div />}
        title=""
        items={dataItemListItems}
      />
    </>
  ) : null;
};
DataSeriesFormItem.defaultProps = defaultProps;
DataSeriesFormItem.propTypes = propTypes;
export default DataSeriesFormItem;
