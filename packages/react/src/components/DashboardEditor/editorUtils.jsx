import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { isNil, uniqBy, isEmpty } from 'lodash-es';
import {
  purple70,
  cyan50,
  teal70,
  magenta70,
  red60,
  red50,
  orange40,
  green60,
  blue80,
  blue60,
  red90,
  green50,
  yellow30,
  magenta50,
  purple50,
  teal50,
  cyan90,
} from '@carbon/colors';
import {
  Checkmark,
  CheckmarkFilled,
  CheckmarkOutline,
  Error,
  ErrorFilled,
  ErrorOutline,
  Help,
  HelpFilled,
  Information,
  InformationFilled,
  Misuse,
  MisuseOutline,
  Undefined,
  UndefinedFilled,
  Unknown,
  UnknownFilled,
  Warning,
  WarningAlt,
  WarningAltFilled,
  WarningAltInverted,
  WarningAltInvertedFilled,
  WarningFilled,
  WarningSquare,
  WarningSquareFilled,
  User,
  Location,
  Temperature,
  Flag,
  Tag,
  Alarm,
} from '@carbon/react/icons';

import {
  CARD_SIZES,
  CARD_TYPES,
  BAR_CHART_TYPES,
  BAR_CHART_LAYOUTS,
  DASHBOARD_EDITOR_CARD_TYPES,
} from '../../constants/LayoutConstants';

export const validHotspotIcons = [
  { id: 'User', icon: User, text: 'User' },
  { id: 'Location', icon: Location, text: 'Location' },
  { id: 'Temperature', icon: Temperature, text: 'Temperature' },
  { id: 'Flag', icon: Flag, text: 'Flag' },
  { id: 'Tag', icon: Tag, text: 'Tag' },
  { id: 'Alarm', icon: Alarm, text: 'Alarm' },
];

export const DataItemsPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    /** This is needed to keep track of the original dataItem name
     * because the dataSourceId is subject to change */
    dataItemId: PropTypes.string.isRequired,
    dataSourceId: PropTypes.string.isRequired,
    /** Maps to data item columnType */
    type: PropTypes.string,
    /** Maps to data item type */
    dataItemType: PropTypes.string,
    label: PropTypes.string,
    aggregationMethod: PropTypes.string,
    aggregationMethods: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string, text: PropTypes.string })
    ),

    /** Grain is needed in summary dashboard editors */
    grain: PropTypes.string,
    // Used for streming dataItems
    hasStreamingMetricEnabled: PropTypes.bool,
  })
);

/**
 * Returns a duplicate card configuration
 * @param {Object} cardConfig, card JSON configuration
 * @returns {Object} duplicated card JSON
 */
export const getDuplicateCard = (cardConfig) => ({
  ...cardConfig,
  id: uuidv4(),
});

/**
 * Returns a default card configuration
 * @param {string} type, card type
 * @returns {Object} default card JSON
 */
export const getDefaultCard = (type, i18n) => {
  const defaultSizeForType = {
    [DASHBOARD_EDITOR_CARD_TYPES.VALUE]: CARD_SIZES.SMALL,
    [DASHBOARD_EDITOR_CARD_TYPES.SIMPLE_BAR]: CARD_SIZES.MEDIUM,
    [DASHBOARD_EDITOR_CARD_TYPES.GROUPED_BAR]: CARD_SIZES.MEDIUM,
    [DASHBOARD_EDITOR_CARD_TYPES.STACKED_BAR]: CARD_SIZES.MEDIUM,
    [DASHBOARD_EDITOR_CARD_TYPES.TIMESERIES]: CARD_SIZES.MEDIUM,
    [DASHBOARD_EDITOR_CARD_TYPES.IMAGE]: CARD_SIZES.MEDIUM,
    [DASHBOARD_EDITOR_CARD_TYPES.TABLE]: CARD_SIZES.LARGE,
  };

  const baseCardProps = {
    id: uuidv4(),
    title: i18n.defaultCardTitle,
    size: defaultSizeForType[type] ?? CARD_SIZES.MEDIUM,
    ...(type.includes(CARD_TYPES.BAR) ? { type: CARD_TYPES.BAR } : { type }),
  };

  switch (type) {
    case DASHBOARD_EDITOR_CARD_TYPES.VALUE:
      return {
        ...baseCardProps,
        content: {
          attributes: [],
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.TIMESERIES:
      return {
        ...baseCardProps,
        content: {
          series: [],
          xLabel: 'Time',
          includeZeroOnXaxis: false,
          includeZeroOnYaxis: false,
          timeDataSourceId: 'timestamp',
          showLegend: true,
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.SIMPLE_BAR:
      return {
        ...baseCardProps,
        content: {
          type: BAR_CHART_TYPES.SIMPLE,
          layout: BAR_CHART_LAYOUTS.VERTICAL,
          series: [],
          timeDataSourceId: 'timestamp',
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.GROUPED_BAR:
      return {
        ...baseCardProps,
        content: {
          type: BAR_CHART_TYPES.GROUPED,
          layout: BAR_CHART_LAYOUTS.VERTICAL,
          series: [],
          categoryDataSourceId: i18n.selectAGroupBy,
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.STACKED_BAR:
      return {
        ...baseCardProps,
        content: {
          type: BAR_CHART_TYPES.STACKED,
          layout: BAR_CHART_LAYOUTS.VERTICAL,
          series: [],
          timeDataSourceId: 'timestamp',
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.TABLE:
      return {
        ...baseCardProps,
        content: {
          columns: [],
          allowNavigation: true,
          showHeader: true,
        },
      };
    case DASHBOARD_EDITOR_CARD_TYPES.IMAGE:
      return {
        ...baseCardProps,
        content: {
          hideMinimap: true,
          hideHotspots: false,
          hideZoomControls: false,
          displayOption: 'contain',
        },
      };

    default:
      return { ...baseCardProps };
  }
};

/**
 * Color options for dataItems
 */
export const DATAITEM_COLORS_OPTIONS = [
  purple70,
  cyan50,
  teal70,
  magenta70,
  red50,
  red90,
  green60,
  blue80,
  magenta50,
  purple50,
  teal50,
  cyan90,
];

/**
 * maps a selected time range to what is expected in the dashboardJSON
 */
export const timeRangeToJSON = {
  lastHour: {
    interval: 'hour',
    range: { interval: 'hour', count: -1, type: 'rolling' },
  },
  last2Hours: {
    interval: 'hour',
    range: { interval: 'hour', count: -2, type: 'rolling' },
  },
  last4Hours: {
    interval: 'hour',
    range: { interval: 'hour', count: -4, type: 'rolling' },
  },
  last8Hours: {
    interval: 'hour',
    range: { interval: 'hour', count: -8, type: 'rolling' },
  },
  last24Hours: {
    range: { interval: 'day', count: -1, type: 'rolling' },
    interval: 'hour',
  },
  last7Days: {
    range: { interval: 'week', count: -1, type: 'rolling' },
    interval: 'day',
  },
  lastMonth: {
    range: { interval: 'month', count: -1, type: 'rolling' },
    interval: 'week',
  },
  lastQuarter: {
    range: {
      interval: 'quarter',
      count: -1,
      type: 'rolling',
    },
    interval: 'month',
  },
  lastYear: {
    range: {
      interval: 'year',
      count: -1,
      type: 'rolling',
    },
    interval: 'month',
  },
  thisWeek: {
    range: {
      interval: 'week',
      count: -1,
      type: 'periodToDate',
    },
    interval: 'day',
  },
  thisMonth: {
    range: {
      interval: 'month',
      count: -1,
      type: 'periodToDate',
    },
    interval: 'week',
  },
  thisQuarter: {
    range: {
      interval: 'quarter',
      count: -1,
      type: 'periodToDate',
    },
    interval: 'month',
  },
  thisYear: {
    range: {
      interval: 'year',
      count: -1,
      type: 'periodToDate',
    },
    interval: 'month',
  },
};

export const validThresholdIcons = [
  { carbonIcon: <Checkmark size={24} />, name: 'Checkmark' },
  { carbonIcon: <CheckmarkFilled size={24} />, name: 'Checkmark filled' },
  { carbonIcon: <CheckmarkOutline size={24} />, name: 'Checkmark outline' },
  { carbonIcon: <Error size={24} />, name: 'Error' },
  { carbonIcon: <ErrorFilled size={24} />, name: 'Error filled' },
  { carbonIcon: <ErrorOutline size={24} />, name: 'Error outline' },
  { carbonIcon: <Help size={24} />, name: 'Help' },
  { carbonIcon: <HelpFilled size={24} />, name: 'Help filled' },
  { carbonIcon: <Information size={24} />, name: 'Information' },
  { carbonIcon: <InformationFilled size={24} />, name: 'Information filled' },
  { carbonIcon: <Misuse size={24} />, name: 'Misuse' },
  { carbonIcon: <MisuseOutline size={24} />, name: 'Misuse outline' },
  { carbonIcon: <Undefined size={24} />, name: 'Undefined' },
  { carbonIcon: <UndefinedFilled size={24} />, name: 'Undefined filled' },
  { carbonIcon: <Unknown size={24} />, name: 'Unknown' },
  { carbonIcon: <UnknownFilled size={24} />, name: 'Unknown filled' },
  { carbonIcon: <Warning size={24} />, name: 'Warning' },
  { carbonIcon: <WarningAlt size={24} />, name: 'Warning alt' },
  { carbonIcon: <WarningAltFilled size={24} />, name: 'Warning alt filled' },
  { carbonIcon: <WarningAltInverted size={24} />, name: 'Warning alt inverted' },
  {
    carbonIcon: <WarningAltInvertedFilled size={24} />,
    name: 'Warning alt inverted filled',
  },
  { carbonIcon: <WarningFilled size={24} />, name: 'Warning filled' },
  { carbonIcon: <WarningSquare size={24} />, name: 'Warning square' },
  { carbonIcon: <WarningSquareFilled size={24} />, name: 'Warning square filled' },
];

export const validThresholdColors = [
  { carbonColor: red60, name: 'red60' },
  { carbonColor: green50, name: 'green50' },
  { carbonColor: orange40, name: 'orange40' },
  { carbonColor: yellow30, name: 'yellow30' },
  { carbonColor: blue60, name: 'blue60' },
];

/**
 * determines if a card JSON is valid depending on its card type
 * @param {Object} cardConfig
 * @returns {Boolean}
 */
export const isCardJsonValid = (cardConfig) => {
  switch (cardConfig.type) {
    case CARD_TYPES.VALUE:
      return !isNil(cardConfig?.content?.attributes);
    case CARD_TYPES.TIMESERIES:
      return !isNil(cardConfig?.content);
    case CARD_TYPES.BAR:
      return !isNil(cardConfig?.content);
    case CARD_TYPES.TABLE:
      return !isNil(cardConfig?.content);
    default:
      return true;
  }
};

/**
 * Selects the card if the key is 'enter' or 'space'
 * @param {Event} evt
 * @param {Function} onSelectCard
 * @param {string} id
 */
export const handleKeyDown = (evt, onSelectCard, id) => {
  if (evt.key === 'Enter' || evt.key === 'Space') {
    onSelectCard(id);
  }
};

/**
 * Selects the card
 * @param {Function} onSelectCard
 * @param {string} id
 */
export const handleOnClick = (onSelectCard, id) => {
  onSelectCard(id);
};

/**
 * Returns the correct string based off the currently selected breakpoint
 * @param {string} breakpoint One of the breakpoints we support with DashboardGrid
 * @param {Object<string>} i18n internationalization strings
 * @returns {string} translated info about the selected breakpoint
 */
export const renderBreakpointInfo = (breakpoint, i18n) => {
  switch (breakpoint) {
    case 'lg':
      return i18n.layoutInfoLg;
    case 'md':
      return i18n.layoutInfoMd;
    case 'sm':
      return i18n.layoutInfoSm;
    default:
      return i18n.layoutInfoLg;
  }
};

/**
 * returns a new series array with a generated color if needed, and in the format expected by the JSON payload
 * @param {array} selectedItems
 * @param {object} cardConfig
 * @param {ref} removedItemsCountRef ref to keep track of the number of items removed to keep the colors different and prevent collisions
 */
export const formatSeries = (selectedItems, cardConfig, removedItemsCountRef = { current: 0 }) => {
  const cardSeries = cardConfig?.content?.series;
  const series = selectedItems.map((selectedItem, i) => {
    const { label: unEditedLabel, dataSourceId } = selectedItem;
    const colorIndex = (removedItemsCountRef.current + i) % DATAITEM_COLORS_OPTIONS.length;
    const currentItem = cardSeries?.find((dataItem) => dataItem.dataSourceId === dataSourceId);
    const color = currentItem?.color ?? DATAITEM_COLORS_OPTIONS[colorIndex];
    const label = currentItem?.label || unEditedLabel || dataSourceId;

    return {
      ...currentItem,
      ...selectedItem,
      label,
      color,
    };
  });
  return series;
};

/**
 * returns a new attributes array in the format expected by the JSON payload
 * @param {array} selectedItems
 * @param {object} cardConfig
 */
export const formatAttributes = (selectedItems, cardConfig) => {
  const currentCardAttributes = cardConfig?.content?.attributes;
  const attributes = selectedItems.map((selectedItem) => {
    const { label: unEditedLabel, dataSourceId } = selectedItem;

    const currentItem = currentCardAttributes?.find(
      (dataItem) => dataItem.dataSourceId === dataSourceId
    );
    // Need to default the label to reflect the default aggregator if there isn't one set
    const label = currentItem?.label || unEditedLabel || dataSourceId;

    return {
      ...currentItem,
      ...selectedItem,
      label,
    };
  });
  return attributes;
};

export const dimensionFilterFunction = (col) =>
  col.dataItemType === 'DIMENSION' ||
  (col.destination === 'groupBy' && col.dataSourceId === 'deviceid'); // For manually added deviceId dimension

/**
 * determines how to format the dataSection based on card type
 * @param {array} selectedItems
 * @param {object} cardConfig
 * @param {function} setEditDataSeries
 * @param {number} hotspotIndex
 * @param {ref} removedItemsCountRef ref to keep track of the number of items removed from the card to keep track of colors and prevent collisions
 */
export const handleDataSeriesChange = (
  selectedItems,
  cardConfig,
  setEditDataSeries,
  hotspotIndex,
  removedItemsCountRef = { current: 0 }
) => {
  const { type, content } = cardConfig;
  let series;
  let attributes;

  switch (type) {
    case CARD_TYPES.VALUE:
      attributes = formatAttributes(selectedItems, cardConfig);
      return {
        ...cardConfig,
        content: { ...cardConfig.content, attributes },
      };
    case CARD_TYPES.TIMESERIES:
    case CARD_TYPES.BAR:
      series = formatSeries(selectedItems, cardConfig, removedItemsCountRef);
      setEditDataSeries(series);
      return {
        ...cardConfig,
        content: { ...cardConfig.content, series },
      };
    case CARD_TYPES.TABLE: {
      const columns = Array.isArray(content?.columns) ? content.columns : [];

      // in certain cases (for groupBy updates) the full set of attribute columns isn't passed
      const existingAttributeColumns = columns.filter(
        (col) => col.dataItemType !== 'DIMENSION' && col.dataSourceId !== 'timestamp'
      );

      // find the new attributes to add because we're adding dimensions later
      const attributeColumns = selectedItems.filter(
        (dataItem) => dataItem.dataItemType !== 'DIMENSION'
      );

      // start off with a default timestamp column if we don't already have one
      const timestampColumn = columns.find((col) => col.dataSourceId === 'timestamp') || {
        dataSourceId: 'timestamp',
        dataItemId: 'timestamp',
        label: 'Timestamp',
        type: 'TIMESTAMP',
        columnType: 'TIMESTAMP',
        sort: 'DESC',
      };

      const existingDimensionColumns = columns.filter(dimensionFilterFunction);

      // new dimension columns should go right after the timestamp column
      const dimensionColumns = selectedItems.filter(dimensionFilterFunction);
      const allDimensionColumns = existingDimensionColumns.concat(dimensionColumns);

      // for raw table cards, the dimensions columns go in the attributes section
      // if groupBy was selected, the dimension columns should go in the groupBy section
      const updatedGroupBy = uniqBy(allDimensionColumns, 'dataSourceId')
        .filter((item) => item.destination === 'groupBy')
        .map((item) => item.dataItemId || item.dataSourceId);

      return {
        ...cardConfig,
        content: {
          ...cardConfig.content,
          columns: uniqBy(
            [
              timestampColumn,
              // pop the dimensions up front right after the timestamp
              ...allDimensionColumns,
              ...existingAttributeColumns.concat(attributeColumns),
            ],
            'dataSourceId'
          ) // when columns are removed, their dataSourceId is cleared, we don't want to readd them
            .filter((column) => column.dataSourceId),
        },
        ...(!isEmpty(updatedGroupBy)
          ? {
              dataSource: {
                ...cardConfig.dataSource,
                ...(allDimensionColumns.find((item) => item.destination === 'groupBy')
                  ? {
                      groupBy: updatedGroupBy,
                    }
                  : {}),
              },
            }
          : {}),
      };
    }
    case CARD_TYPES.IMAGE: {
      const dataSection = [...(cardConfig.content?.hotspots || [])];
      dataSection[hotspotIndex].content = {
        ...dataSection[hotspotIndex].content,
        attributes: selectedItems,
      };
      return {
        ...cardConfig,
        content: {
          ...cardConfig.content,
          hotspots: dataSection,
        },
      };
    }
    default:
      return cardConfig;
  }
};

/**
 * updates the dataSection on edit of a dataItem based on card type.
 * TODO: refactor this into multiple functions
 * @param {object} editDataItem an object with the updated form values for this data item
 * @param {object} cardConfig the previous cardConfiguration
 * @param {string} editDataSeries only used for bar chart card forms
 * @param {int} hotspotIndex which of the hotspots in the content section should be updated (only used for image card updates)
 */
export const handleDefaultDataItemEdit = (
  editDataItem,
  cardConfig,
  editDataSeries,
  hotspotIndex
) => {
  const { type, content } = cardConfig;
  let dataSection;
  let editDataItemIndex;

  switch (type) {
    case CARD_TYPES.VALUE:
      dataSection = [...content.attributes];
      editDataItemIndex = dataSection.findIndex(
        (dataItem) =>
          dataItem.dataSourceId === editDataItem.dataSourceId ||
          (dataItem.dataItemId === editDataItem.dataItemId && dataItem.label === editDataItem.label)
      );
      // if there isn't an item found, place it at the end
      dataSection[editDataItemIndex !== -1 ? editDataItemIndex : dataSection.length] = editDataItem;
      return {
        ...cardConfig,
        content: { ...content, attributes: dataSection },
      };
    case CARD_TYPES.TIMESERIES:
    case CARD_TYPES.BAR:
      dataSection = [...content.series];
      editDataItemIndex = dataSection.findIndex(
        (dataItem) =>
          dataItem.dataSourceId === editDataItem.dataSourceId ||
          (dataItem.dataItemId === editDataItem.dataItemId && dataItem.label === editDataItem.label)
      );
      // if there isn't an item found, place it at the end
      dataSection[editDataItemIndex !== -1 ? editDataItemIndex : dataSection.length] = editDataItem;
      return {
        ...cardConfig,
        content: {
          ...content,
          series: dataSection,
        },
      };
    case CARD_TYPES.TABLE:
      dataSection = [...content.columns];
      editDataItemIndex = dataSection.findIndex(
        (dataItem) => dataItem.dataSourceId === editDataItem.dataSourceId
      );
      dataSection[editDataItemIndex] = editDataItem;
      return {
        ...cardConfig,
        content: { ...cardConfig.content, columns: dataSection },
      };
    case CARD_TYPES.IMAGE:
      dataSection = [...(content.hotspots || [])];

      if (dataSection.length) {
        editDataItemIndex = dataSection[hotspotIndex].content.attributes.findIndex(
          (dataItem) => dataItem.dataSourceId === editDataItem.dataSourceId
        );
        dataSection[hotspotIndex].content.attributes[editDataItemIndex] = editDataItem;
      }

      return {
        ...cardConfig,
        content: { ...content, hotspots: dataSection },
      };
    default:
      return cardConfig;
  }
};

export const renderDefaultIconByName = (iconName, iconProps = {}) => {
  // first search the validHotspot Icons
  const matchingHotspotIcon = validHotspotIcons.find((icon) => icon.id === iconName);

  // then search the validThresholdIcons
  const matchingThresholdIcon = validThresholdIcons.find((icon) => icon.name === iconName);
  const iconToRender = matchingHotspotIcon ? (
    React.createElement(matchingHotspotIcon.icon, {
      ...iconProps,
      title: matchingHotspotIcon.text,
    })
  ) : matchingThresholdIcon ? (
    React.cloneElement(matchingThresholdIcon.carbonIcon, {
      ...iconProps,
      title: matchingThresholdIcon.name,
    })
  ) : (
    <Warning size={24} {...iconProps} />
  );

  // otherwise default to Warning24
  // eslint-disable-next-line react/prop-types
  return <div style={{ color: iconProps.fill }}>{iconToRender}</div>;
};

export const DashboardEditorActionsPropTypes = PropTypes.shape({
  /** Call back function for on click of edit button, returns aggregationMethods for a selcted dataSource
   * onEditDataItem(cardConfig: card properties, dataItem: selected dataItem, dataItemWithMetaData: selected dataItem with meta data);
   * return {object}: returns aggregationMethods for a selcted dataSource
   * ex:
   *[
      {
          "id": "none",
          "text": "None"
      },
      {
          "id": "mean",
          "text": "Mean",
      },
      {
          "id": "min",
          "text": "Minimum",
      }
    ]
   */
  onEditDataItem: PropTypes.func,
  /** Form actions for dataSeries modal */
  dataSeriesFormActions: PropTypes.shape({
    /** callback function to determine aggregation dropdown visibility
     * hasAggregationsDropDown(editDataItem: selected dataSource)
     * return {boolean} : true or false
     */
    hasAggregationsDropDown: PropTypes.func,
    /** callback function to determine grain dropdown visibility
     * hasGrainsDropDown(cardProps: card properties, editDataItem: selected dataSource)
     * return {boolean} : true or false
     */
    hasGrainsDropDown: PropTypes.func,
    /** callback function to determine dataFilter dropdown visibility
     * hasDataFilterDropdown(cardProps: card properties)
     * return {boolean} : true or false
     */
    hasDataFilterDropdown: PropTypes.func,
  }),
});

/* istanbul ignore next */
const noop = () => {};

export const defaultDashboardEditorActionsProps = {
  onEditDataItem: noop,
  dataSeriesFormActions: {
    hasAggregationsDropDown: noop,
    hasGrainsDropDown: noop,
    hasDataFilterDropdown: noop,
  },
};
