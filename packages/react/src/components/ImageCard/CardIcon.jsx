import React from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';

import icons from '../../utils/bundledIcons';

const propTypes = {
  /** the name of the icon to render */
  icon: PropTypes.string,
  /** callback function that returns an react node based on the name of the icon */
  renderIconByName: PropTypes.func,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  testId: PropTypes.string,
};

const defaultProps = {
  testId: 'card-icon',
  icon: undefined,
  renderIconByName: undefined,
  height: 16,
  width: 16,
};

/** This component calls out to our renderIconByName callback function with the icon name OR fails over to our legacy card icons from our legacy icon bundle */
/* We test the implementation and do not want to trigger this console in our test logs */
/* istanbul ignore next */
const CardIcon = ({
  icon,
  renderIconByName,
  title,
  color,
  width,
  height,
  className,
  testId,
  ...rest
}) => {
  if (__DEV__ && !renderIconByName && !icons[icon]) {
    warning(
      false,
      `You have not passed a renderIconByName function, and your icon name '${icon}' is not in our legacy icon bundle: ${JSON.stringify(
        Object.keys(icons)
      )} so we will default to our 'help' icon.`
    );
  }
  const Icon = icons[icon] || icons.help;

  return icon ? (
    renderIconByName ? (
      renderIconByName(icon, {
        title,
        className,
        fill: color,
        width,
        height,
        tabIndex: '0',
        'data-testid': testId,
      })
    ) : (
      <Icon
        {...rest}
        className={className}
        fill={color}
        width={width}
        height={height}
        title={title}
        aria-label={title}
        data-testid={testId}
      />
    )
  ) : null;
};

CardIcon.propTypes = propTypes;
CardIcon.defaultProps = defaultProps;
export default CardIcon;
