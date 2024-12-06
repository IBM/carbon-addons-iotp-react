import { Draggable } from '@carbon/react/icons';
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { settings } from '../../../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  /**
   * Callback when a user mouse downs on the handle. That can start a DnD operation. The
   * `useTableDnd` does the real work of tracking the drag.
   */
  onStartDrag: PropTypes.func.isRequired,

  /**
   * The ID of the table row this handle is it. This is the row that will be dragged by this handle.
   */
  rowId: PropTypes.string.isRequired,
};

/**
 * Drag handle image the user needs to click and drag to start a drag and drop operation.
 */
const TableDragHandle = forwardRef(function TableDragHandle({ onStartDrag, rowId }, ref) {
  return (
    <div
      className={`${iotPrefix}--table-drag-handle`}
      ref={ref}
      role="presentation"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStartDrag(e, rowId);
      }}
    >
      <Draggable />
    </div>
  );
});

TableDragHandle.propTypes = propTypes;

export { TableDragHandle };
