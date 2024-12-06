import React, { useRef } from 'react';
import { Add, Draggable, Subtract } from '@carbon/react/icons';
import { Select, SelectItem } from '@carbon/react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classnames from 'classnames';

import { settings } from '../../../constants/Settings';
import Button from '../../Button/Button';

const { iotPrefix } = settings;

const propTypes = {
  columnId: PropTypes.string.isRequired,
  defaultColumnId: PropTypes.string.isRequired,
  defaultDirectionId: PropTypes.string.isRequired,
  i18n: PropTypes.shape({
    multiSortSelectColumnSortByTitle: PropTypes.stirng,
    multiSortSelectColumnThenByTitle: PropTypes.string,
    multiSortDragHandle: PropTypes.string,
    multiSortSelectColumnLabel: PropTypes.string,
    multiSortDirectionLabel: PropTypes.string,
    multiSortDirectionTitle: PropTypes.string,
    multiSortAddColumn: PropTypes.string,
    multiSortRemoveColumn: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  multiSortColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  numSelectedColumns: PropTypes.number.isRequired,
  onAddMultiSortColumn: PropTypes.func.isRequired,
  onMoveRow: PropTypes.func.isRequired,
  onRemoveMultiSortColumn: PropTypes.func.isRequired,
  onSelectMultiSortColumn: PropTypes.func.isRequired,
  onSelectMultiSortColumnDirection: PropTypes.func.isRequired,
  sortDirections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  testId: PropTypes.string.isRequired,
};

export const TableMultiSortRow = ({
  columnId,
  defaultColumnId,
  defaultDirectionId,
  i18n,
  index,
  multiSortColumns,
  numSelectedColumns,
  onAddMultiSortColumn,
  onMoveRow,
  onRemoveMultiSortColumn,
  onSelectMultiSortColumn,
  onSelectMultiSortColumnDirection,
  sortDirections,
  testId,
}) => {
  const dragRef = useRef(null);
  const previewRef = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: 'TableMultiSortRow',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!previewRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = previewRef.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      onMoveRow(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex; // eslint-disable-line no-param-reassign
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TableMultiSortRow',
    item: () => {
      return { columnId, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(dragRef);
  drop(preview(previewRef));

  return (
    <div
      ref={previewRef}
      className={classnames(`${iotPrefix}--table-multi-sort-row`, {
        [`${iotPrefix}--table-multi-sort-row--dragging`]: isDragging,
      })}
      data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0 : 1 }}
    >
      <div
        ref={dragRef}
        className={`${iotPrefix}--table-multi-sort-row__handle`}
        title={i18n.multiSortDragHandle}
        data-testid={`drag-handle-${columnId}`}
      >
        <Draggable />
      </div>
      <Select
        data-testid={`${testId}-column-select`}
        id={`${columnId}-select-sort-column`}
        helperText={i18n.multiSortSelectColumnLabel}
        onChange={onSelectMultiSortColumn}
        labelText={
          index === 0
            ? i18n.multiSortSelectColumnSortByTitle
            : i18n.multiSortSelectColumnThenByTitle
        }
        defaultValue={defaultColumnId}
      >
        {multiSortColumns.map((col) => (
          <SelectItem
            key={`${col.id}-${col.name}`}
            text={col.name}
            value={col.id}
            disabled={col.disabled}
          />
        ))}
      </Select>
      <Select
        data-testid={`${testId}-direction-select`}
        id={`${columnId}-select-sort-direction`}
        helperText={i18n.multiSortDirectionLabel}
        labelText={i18n.multiSortDirectionTitle}
        defaultValue={defaultDirectionId}
        onChange={onSelectMultiSortColumnDirection}
      >
        {sortDirections.map((dir) => (
          <SelectItem key={`${dir.id}-${dir.label}`} text={dir.label} value={dir.id} />
        ))}
      </Select>
      <Button
        hasIconOnly
        renderIcon={Add}
        kind="ghost"
        tooltipPosition="top"
        iconDescription={i18n.multiSortAddColumn}
        onClick={onAddMultiSortColumn}
        testId={`${columnId}-add-sort-button`}
        disabled={numSelectedColumns >= multiSortColumns.length}
      />
      <Button
        hasIconOnly
        renderIcon={Subtract}
        kind="ghost"
        tooltipPosition="top"
        iconDescription={i18n.multiSortRemoveColumn}
        onClick={onRemoveMultiSortColumn}
        testId={`${columnId}-remove-sort-button`}
        disabled={numSelectedColumns === 1}
      />
    </div>
  );
};

TableMultiSortRow.propTypes = propTypes;
