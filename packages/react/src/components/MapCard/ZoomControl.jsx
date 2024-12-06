import React from 'react';
import { ZoomIn, ZoomOut } from '@carbon/react/icons';
import PropTypes from 'prop-types';

import Button from '../Button';
import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  i18n: PropTypes.shape({
    zoomIn: PropTypes.string,
    zoomOut: PropTypes.string,
  }),
  /** callback to handle zoom in */
  onZoomIn: PropTypes.func.isRequired,
  /** callback to handle zoom out */
  onZoomOut: PropTypes.func.isRequired,
  /** set true to use button size 'small' instead of size 'field' */
  smallButtons: PropTypes.bool,
  testId: PropTypes.string,
  /** position of the control buttons tooltip */
  tooltipPosition: PropTypes.oneOf(['left', 'top', 'bottom', 'right']).isRequired,
};

const defaultProps = {
  i18n: {
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom out',
  },
  smallButtons: false,
  testId: 'map-zoom-control',
};

const Zoom = ({ onZoomIn, onZoomOut, i18n, testId, tooltipPosition, smallButtons }) => {
  const buttonSize = smallButtons ? 'sm' : 'md';
  return (
    <div className={`${iotPrefix}--map-zoom`} data-testid={testId}>
      <Button
        renderIcon={(props) => <ZoomIn size={16} {...props} />}
        hasIconOnly
        kind="ghost"
        size={buttonSize}
        onClick={onZoomIn}
        tooltipPosition={tooltipPosition}
        iconDescription={i18n.zoomIn}
        testId={`${testId}-zoom-in`}
      />
      <Button
        renderIcon={(props) => <ZoomOut size={16} {...props} />}
        hasIconOnly
        kind="ghost"
        size={buttonSize}
        onClick={onZoomOut}
        tooltipPosition={tooltipPosition}
        iconDescription={i18n.zoomOut}
        testId={`${testId}-zoom-out`}
      />
    </div>
  );
};

Zoom.defaultProps = defaultProps;
Zoom.propTypes = propTypes;
export default Zoom;
