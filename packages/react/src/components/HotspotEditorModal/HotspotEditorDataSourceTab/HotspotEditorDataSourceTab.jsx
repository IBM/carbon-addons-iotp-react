import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Edit } from '@carbon/react/icons';
import { MultiSelect } from '@carbon/react';
import { isEmpty } from 'lodash-es';

import DataSeriesFormItemModal from '../../CardEditor/CardEditForm/CardEditFormItems/DataSeriesFormItemModal';
import List from '../../List/List';
import Button from '../../Button/Button';
import { settings } from '../../../constants/Settings';
import deprecate from '../../../internal/deprecate';
import {
  DashboardEditorActionsPropTypes,
  defaultDashboardEditorActionsProps,
} from '../../DashboardEditor/editorUtils';

const { iotPrefix } = settings;

const propTypes = {
  /** The hotspot for which the data source settings should be changed. */
  hotspot: PropTypes.shape({
    content: PropTypes.shape({
      attributes: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  /** This prop is mainly needed since the HotspotEditorDataSourceTab internally makes
   * use of DataSeriesFormItemModal which has its API designed around the card config */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.shape({
      alt: PropTypes.string,
      src: PropTypes.string,
      image: PropTypes.string,
      hideMinimap: PropTypes.bool,
      hideHotspots: PropTypes.bool,
      hideZoomControls: PropTypes.bool,
      id: PropTypes.string,
    }),
    description: PropTypes.string,
    values: PropTypes.shape({
      hotspots: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  i18n: PropTypes.shape({
    selectDataItemsText: PropTypes.string,
    dataItemText: PropTypes.string,
    editText: PropTypes.string,
    dataItemEditorDataItemTitle: PropTypes.string,
    dataItemEditorDataItemCustomLabel: PropTypes.string,
    dataItemEditorDataItemUnit: PropTypes.string,
    dataItemEditorDataItemFilter: PropTypes.string,
    dataItemEditorDataItemThresholds: PropTypes.string,
    dataItemEditorDataItemAddThreshold: PropTypes.string,
    primaryButtonLabelText: PropTypes.string,
    secondaryButtonLabelText: PropTypes.string,
  }),
  /** Callback i18n function for translating ListBoxMenuIcon SVG title in the MultiSelect component */
  translateWithId: PropTypes.func.isRequired,
  /** callback when image input value changes */
  onChange: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  /** Id that can be used for testing */
  testId: PropTypes.string,
  /** An array of data source items that can be selected for the specified hotspot */
  dataItems: PropTypes.arrayOf(
    PropTypes.shape({
      dataSourceId: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  /** An object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] } */
  availableDimensions: PropTypes.shape({}),
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  i18n: {
    selectDataItemsText: 'Select data items',
    dataItemText: 'Data items',
    editText: 'Edit',
    dataItemEditorDataItemTitle: 'Data items',
    dataItemEditorDataItemCustomLabel: 'Custom label',
    dataItemEditorDataItemUnit: 'Unit',
    dataItemEditorDataItemFilter: 'Data filter',
    dataItemEditorDataItemThresholds: 'Thresholds',
    dataItemEditorDataItemAddThreshold: 'Add threshold',
    primaryButtonLabelText: 'Update',
    secondaryButtonLabelText: 'Cancel',
  },
  dataItems: [],
  availableDimensions: {},
  testId: 'HotspotEditorDataSourceTab',
  actions: defaultDashboardEditorActionsProps,
};

export const formatDataItemsForDropdown = (dataItems) =>
  dataItems?.map(({ dataSourceId, label }) => ({
    id: dataSourceId,
    label,
  }));

const HotspotEditorDataSourceTab = ({
  hotspot,
  cardConfig,
  dataItems,
  i18n,
  onChange,
  availableDimensions,
  // TODO: remove the deprecated testID prop in v3.
  testID,
  testId,
  translateWithId,
  actions,
}) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };

  const [showEditor, setShowEditor] = useState(false);
  const [editDataItem, setEditDataItem] = useState({});
  const selectedItemsArray = hotspot.content?.attributes || [];

  const baseClassName = `${iotPrefix}--card-edit-form`;
  const initialSelectedItems = formatDataItemsForDropdown(selectedItemsArray);
  const { onEditDataItem } = actions;

  const handleSelectionChange = ({ selectedItems }) => {
    const newArray = [];
    // loop through  selected Items and find their selectedItemsArray object or the dataItem object with same id
    selectedItems.forEach((item) => {
      const containedItem = selectedItemsArray.find(
        (selectedItem) => selectedItem.dataItemId === item.id
      );
      const containedDataItem = dataItems.find(
        (selectedItem) => selectedItem.dataItemId === item.id
      );
      if (containedItem) {
        newArray.push(containedItem);
      } else if (containedDataItem) {
        newArray.push(containedDataItem);
      }
    });
    onChange({ attributes: newArray });
  };

  // MultiSelect
  // For the initial selection to work the objects in prop "initialSelectedItems"
  // must be identical to the objects in prop "items". It is not enough that the
  // ids are the same. Therefore, we must adjust the labels in "items" if they have
  // been modified in the "initialSelectedItems".
  const multiSelectItems = formatDataItemsForDropdown(dataItems).map((item) => ({
    ...item,
    label: initialSelectedItems.find((selected) => selected.id === item.id)?.label ?? item.label,
  }));

  const handleEditButton = useCallback(
    async (dataItem) => {
      const dataItemWithMetaData = dataItems?.find(
        ({ dataItemId }) => dataItemId === dataItem.dataSourceId
      );
      // Call back function for on click of edit button
      /* istanbul ignore else */
      if (onEditDataItem) {
        const aggregationMethods = await onEditDataItem(cardConfig, dataItem, dataItemWithMetaData);
        if (!isEmpty(aggregationMethods)) {
          dataItemWithMetaData.aggregationMethods = aggregationMethods;
        }
      }
      // need to reset the card to include the latest dataSection
      setEditDataItem({
        ...dataItemWithMetaData,
        ...dataItem,
      });
      setShowEditor(true);
    },
    [cardConfig, onEditDataItem, dataItems]
  );

  return (
    <div data-testid={testID || testId}>
      <DataSeriesFormItemModal
        isLarge
        cardConfig={cardConfig}
        showEditor={showEditor}
        setShowEditor={setShowEditor}
        editDataItem={editDataItem}
        setEditDataItem={setEditDataItem}
        setEditDataSeries={setEditDataItem}
        availableDimensions={availableDimensions}
        onChange={onChange}
        i18n={mergedI18n}
        actions={actions}
        options={{
          hasColorDropdown: false,
          hasUnit: true,
          hasDecimalPlacesDropdown: true,
          hasThresholds: true,
          hasTooltip: false,
        }}
      />
      <div className={`${baseClassName}--input`}>
        <MultiSelect
          // need to re-gen if multiSelectItems changes (i.e. the label)
          key={`${multiSelectItems.map((item) => item.label).join('')}`}
          id={`${cardConfig.id}_dataSourceIds`}
          label={mergedI18n.selectDataItemsText}
          direction="bottom"
          initialSelectedItems={initialSelectedItems}
          items={multiSelectItems}
          light
          onChange={handleSelectionChange}
          titleText={mergedI18n.dataItemText}
          translateWithId={translateWithId}
          data-testid={`${testId}-multiselect`}
        />
      </div>
      <List
        // need to force an empty "empty state"
        emptyState={<div />}
        testId={`${testId}-data-source-list`}
        title=""
        items={selectedItemsArray?.map((dataItem) => ({
          id: dataItem.dataSourceId,
          content: {
            value: dataItem.label,
            rowActions: () => [
              <Button
                key={`data-item-${dataItem.dataSourceId}`}
                renderIcon={Edit}
                hasIconOnly
                kind="ghost"
                size="sm"
                onClick={() => handleEditButton(dataItem)}
                iconDescription={mergedI18n.editText}
              />,
            ],
          },
        }))}
      />
    </div>
  );
};

HotspotEditorDataSourceTab.propTypes = propTypes;
HotspotEditorDataSourceTab.defaultProps = defaultProps;

export default HotspotEditorDataSourceTab;
