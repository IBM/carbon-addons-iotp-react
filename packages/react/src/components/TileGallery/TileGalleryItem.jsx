import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ClickableTile } from '@carbon/react';

import { settings } from '../../constants/Settings';
import { SvgPropType } from '../../constants/SharedPropTypes';

const { prefix } = settings;

const propTypes = {
  /** Card title */
  title: PropTypes.string.isRequired,
  /** Card description/content */
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /** Bottom left  icon  */
  icon: PropTypes.oneOfType([
    PropTypes.shape({
      width: PropTypes.string,
      height: PropTypes.string,
      viewBox: PropTypes.string.isRequired,
      svgData: SvgPropType.isRequired,
    }),
    PropTypes.node,
  ]),
  /** Bottom right content for component */
  afterContent: PropTypes.node,
  /** Card display mode */
  mode: PropTypes.oneOf(['grid', 'list']),
  /** When grid type - thumbnail content */
  thumbnail: PropTypes.node,
  /** onClick card */
  onClick: PropTypes.func,
  /** Specify an optional className to be applied to the container node */
  className: PropTypes.string,

  testId: PropTypes.string,
};

const defaultProps = {
  description: 'Some description',
  icon: null,
  afterContent: null,
  mode: 'grid',
  thumbnail: null,
  onClick: () => {},
  className: null,
  testId: 'tile-gallery-item',
};

const TileGalleryItem = ({
  title,
  description,
  icon,
  afterContent,
  mode,
  thumbnail,
  onClick,
  className,
  testId,
}) => {
  const content = (
    <div className="content-container">
      {icon}
      <span className="title-card">{title}</span>
      {afterContent && (
        <div
          className="overflow-menu"
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
          }}
          role="presentation"
          data-testid={`${testId}-overflow-menu`}
        >
          {afterContent}
        </div>
      )}
    </div>
  );

  const tile =
    mode === 'grid' ? (
      <div key={`${title}-card`}>
        <div className="top-section">
          <div className="thumbnail">{thumbnail}</div>
          <div className="description-card">
            {!React.isValidElement(description) ? <span>{description}</span> : description}
          </div>
        </div>
        {content}
      </div>
    ) : (
      <div key={`${title}-card`}>
        <Fragment>
          {content}
          <div className="description-card">
            {!React.isValidElement(description) ? <span>{description}</span> : description}
          </div>
        </Fragment>
      </div>
    );

  return (
    <Fragment>
      <ClickableTile
        className={`${className} tile-gallery-item ${prefix}--tile ${prefix}--tile--clickable tile-${
          mode === 'grid' ? 'card' : 'list'
        }-title`}
        key={`${title}-card-link`}
        onClick={onClick}
        data-testid={testId}
      >
        {tile}
      </ClickableTile>
    </Fragment>
  );
};

TileGalleryItem.propTypes = propTypes;
TileGalleryItem.defaultProps = defaultProps;

export default TileGalleryItem;
