import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { Draggable } from '@carbon/react/icons';
import classnames from 'classnames';

import Button from '../../../Button';
import { settings } from '../../../../constants/Settings';

const { iotPrefix } = settings;

const ColumnHeaderSelect = ({
  connectDragSource,
  connectDropTarget,
  columnId,
  isHidden,
  children,
  onClick,
  isOver,
  isDisabled,
}) => {
  return (
    <Button
      className={classnames(
        'column-header__btn',
        `${iotPrefix}--column-header`,
        'column-header__select',
        {
          'column-header__select--hidden': isHidden,
          'column-header__select--isOver': isOver,
        }
      )}
      disabled={isDisabled}
      kind="secondary"
      key={columnId}
      onClick={() => onClick()}
      role="button"
      data-ishidden={isHidden}
      renderIcon={Draggable}
      size="sm"
      ref={(instance) => {
        if (!isDisabled) {
          connectDragSource(instance);
          connectDropTarget(instance);
        }
      }}
    >
      {children}
    </Button>
  );
};

ColumnHeaderSelect.propTypes = {
  columnId: PropTypes.string.isRequired,
  isHidden: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node]),
  onClick: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  /* these props come from react-dnd */
  index: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  isOver: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
  moveItem: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

ColumnHeaderSelect.defaultProps = {
  isHidden: false,
  isDisabled: false,
  children: [],
};

const cardSource = {
  /**
   * Implements the drag source contract.
   */
  beginDrag(props) {
    return {
      id: props.columnId,
      index: props.index,
    };
  },
};

const cardTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveItem(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex; // eslint-disable-line no-param-reassign
  },
};

const ds = DragSource('ColumnHeaderSelect', cardSource, (connect) => ({
  connectDragSource: connect.dragSource(),
}));

const dt = DropTarget('ColumnHeaderSelect', cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}));

ColumnHeaderSelect.displayName = 'ColumnHeaderSelect';

export { ColumnHeaderSelect as UnconnectedColumnHeaderSelect };
export default ds(dt(ColumnHeaderSelect));
