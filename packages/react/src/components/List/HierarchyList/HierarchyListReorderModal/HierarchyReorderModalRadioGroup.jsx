import React from 'react';
import PropTypes from 'prop-types';
import { RadioButton } from '@carbon/react';

import { settings } from '../../../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  /**
   *  array of items to be moved
   */
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  /**
   *  callback that sets the selectedItem
   */
  setSelectedItem: PropTypes.func,
  /**
   *  string representing the selected item
   */
  selectedItem: PropTypes.string,
  /**
   *  array of ids that will be moved to selected location
   */
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  /**
   * Callback to handle list item click - will call setSelectedItems and set the breadcrumbs
   */
  handleLineItemClicked: PropTypes.func,
};

/* istanbul ignore next */
const noop = () => {};

const defaultProps = {
  selectedItems: [],
  setSelectedItem: noop,
  selectedItem: null,
  selectedIds: [],
  handleLineItemClicked: noop,
};

const HierarchyReorderModalRadioGroup = ({
  selectedItems,
  setSelectedItem,
  selectedItem,
  selectedIds,
  handleLineItemClicked,
}) => (
  <div className={`${iotPrefix}--hierarchy-list-bulk-modal--list`}>
    {selectedItems
      .filter((item) => selectedIds.find((id) => id === item.id) !== item.id)
      .map((item) => (
        <div
          className={`${iotPrefix}--hierarchy-list-bulk-modal--list-item`}
          key={`${item.id}-bulk-reorder-list-item-${item.content.value}`}
        >
          <RadioButton
            className={`${iotPrefix}--hierarchy-list-bulk-modal--radio`}
            name={item.id}
            key={`radio-${item.content.value}`}
            value={item.content.value}
            hideLabel
            labelText={item.content.value}
            onChange={() => {
              setSelectedItem(item.id);
            }}
            tabIndex={0}
            checked={item.id === selectedItem}
          />

          <div
            role="button"
            className={`${iotPrefix}--hierarchy-list-bulk-modal--list-item-button`}
            tabIndex={0}
            onClick={() => handleLineItemClicked(item)}
            onKeyPress={({ key }) => key === 'Enter' && handleLineItemClicked(item)}
          >
            <div className={`${iotPrefix}--hierarchy-list-bulk-modal--list-item-value`}>
              {item.content.value}
            </div>
          </div>
        </div>
      ))}
  </div>
);

HierarchyReorderModalRadioGroup.propTypes = propTypes;
HierarchyReorderModalRadioGroup.defaultProps = defaultProps;
export default HierarchyReorderModalRadioGroup;
