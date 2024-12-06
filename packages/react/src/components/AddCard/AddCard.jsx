import { ClickableTile } from '@carbon/react';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
// import { v10 } from '@carbon/themes';  need to upgrade
import { Add } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';

// const { g10 } = v10;
const { iotPrefix } = settings;
const propTypes = {
  /** Title to show on the card */
  title: PropTypes.string.isRequired,
  /** Callback function when icon is clicked */
  onClick: PropTypes.func.isRequired,

  testId: PropTypes.string,
};

/**
 * Clickable card that shows "Add" button
 */
const AddCard = ({ onClick, title, className, testId }) => (
  <ClickableTile
    data-testid={testId}
    className={classnames(`${iotPrefix}-add-card`, className)}
    onClick={onClick}
  >
    <p className={`${iotPrefix}-addcard-title`}>{title}</p>
    {/* <Add size={20} fill={g10.icon01} description={title} /> */}
    <Add size={20} description={title} />
  </ClickableTile>
);

AddCard.propTypes = propTypes;
AddCard.defaultProps = {
  testId: 'add-card-tile',
};

export default AddCard;
