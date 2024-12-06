import React from 'react';
import PropTypes from 'prop-types';
import { Tile } from '@carbon/react';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  tiles: PropTypes.arrayOf(PropTypes.node),
  testId: PropTypes.string,
};

const defaultProps = {
  tiles: null,
  testId: 'tile-group',
};

/** this component just exists to make the last tile look good in a responsive flex container */
const TileGroup = ({ tiles, className, testId }) => (
  <div data-testid={testId} className={classnames(className, `${iotPrefix}--tile-group`)}>
    {tiles}
    <Tile className={`${iotPrefix}--greedy-tile`} />
  </div>
);

TileGroup.propTypes = propTypes;
TileGroup.defaultProps = defaultProps;

export default TileGroup;
