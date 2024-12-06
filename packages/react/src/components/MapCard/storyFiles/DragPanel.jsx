import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';

// import './drag-panel.scss'; carbon 11

const propTypes = {
  id: PropTypes.string.isRequired,
  left: PropTypes.number,
  top: PropTypes.number,
  children: PropTypes.node.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

const defaultProps = {
  left: 0,
  top: 0,
};

const DragPanel = ({ id, left, top, height, width, children }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'dragPanel',
      item: { id, left, top, height, width },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top]
  );
  return isDragging ? null : (
    <div className="drag-panel" ref={drag} style={{ left, top, height, width }}>
      {children}
    </div>
  );
};

DragPanel.propTypes = propTypes;
DragPanel.defaultProps = defaultProps;
export default DragPanel;
