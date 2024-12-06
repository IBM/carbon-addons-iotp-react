import React, { useCallback, useState } from 'react';
import { OverflowMenuItem } from '@carbon/react';

import { renderTableOverflowItemText } from '../components/Table/tableUtilities';

/**
 * A helper hook to render overflow menu items from an array of pre-defined actions,
 * or to render them dynamically from a callback on open. This can be used in the TableToolbar or
 * eventually added to rowActions to render options dynamically there.
 * @param {object} An object containing the follow properties
 *     className To applied to the OverflowMenuItem
 *     testId The testId prepended to the OverflowMenuItem
 *     isDisabled The isDisabled boolean for the whole toolbar
 *     onClick The callback to fire when the action is clicked
 *     actions The array of objects used to supply props to the OverflowMenuItem
 * @returns Array An array containing the isOpen state, setIsOpen function and renderOverflowMenuItems function
 */
const useDynamicOverflowMenuItems = ({ className, actions, testId, isDisabled, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * allow dynamically rendering the extra items from a callback when the overflow menu is opened.
   */
  const renderOverflowMenuItems = useCallback(() => {
    const actionsArray = typeof actions === 'function' ? actions() : actions;

    if (!actionsArray?.length) {
      return null;
    }

    return actionsArray
      .filter(({ hidden, isOverflow }) => hidden !== true && isOverflow === true)
      .map((action) => (
        <OverflowMenuItem
          data-testid={`${testId}-toolbar-overflow-menu-item-${action.id}`}
          itemText={renderTableOverflowItemText({ action, className })}
          key={`table-aggregations-overflow-item-${action.id}`}
          onClick={() => {
            setIsOpen(false);
            onClick(action);
          }}
          requireTitle={!action.renderIcon}
          disabled={isDisabled || action.disabled}
          hasDivider={action.hasDivider}
          isDelete={action.isDelete}
          aria-label={action.labelText}
        />
      ));
  }, [actions, className, isDisabled, onClick, testId]);

  return [isOpen, setIsOpen, renderOverflowMenuItems];
};

export default useDynamicOverflowMenuItems;
