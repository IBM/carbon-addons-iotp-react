import React from 'react';
import PropTypes from 'prop-types';
import { Minimize } from '@carbon/react/icons';

import Minimap, { MinimapPropTypes } from './Minimap';

const propTypes = {
  ...MinimapPropTypes,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
  hideMinimap: PropTypes.bool,
  onZoomToFit: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    zoomIn: PropTypes.string,
    zoomOut: PropTypes.string,
    zoomToFit: PropTypes.string,
  }).isRequired,
};

const defaultProps = {
  draggable: false,
  dragging: false,
  hideMinimap: false,
};

const ImageControls = ({
  minimap,
  draggable,
  dragging,
  hideMinimap,
  onZoomToFit,
  onZoomIn,
  onZoomOut,
  i18n: { zoomToFit, zoomIn, zoomOut },
}) => {
  const bottomControlsStyle = {
    position: 'absolute',
    bottom: 10,
    right: 10,
    pointerEvents: dragging ? 'none' : 'auto',
  };

  const buttonStyle = {
    width: '25px',
    height: '25px',
    border: 'none',
    background: '#fff',
    boxShadow: '0px 0px 2px 0px rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  return (
    <>
      <div style={bottomControlsStyle}>
        {draggable && (
          <>
            <button type="button" style={buttonStyle} onClick={onZoomToFit}>
              <Minimize size={20} aria-label={zoomToFit} />
            </button>
            <br />
          </>
        )}
        <button title={zoomIn} type="button" style={buttonStyle} onClick={onZoomIn}>
          +
        </button>
        <button title={zoomOut} type="button" style={buttonStyle} onClick={onZoomOut}>
          -
        </button>
      </div>
      {!hideMinimap && <Minimap {...minimap} />}
    </>
  );
};

ImageControls.propTypes = propTypes;
ImageControls.defaultProps = defaultProps;
export default ImageControls;
