import React from 'react';
import { ProgressBar as CarbonProgressBar } from '@carbon/react';
import PropTypes from 'prop-types';
import { blue60 } from '@carbon/colors';
import classnames from 'classnames';

import useMerged from '../../hooks/useMerged';
import { settings } from '../../constants/Settings';
import useMatchingThreshold from '../../hooks/useMatchingThreshold';

import {
  ThresholdComparisonPropType,
  ThresholdComparisonFunctionPropType,
} from './thresholdPropTypes';

const { prefix, iotPrefix } = settings;

const propTypes = {
  className: PropTypes.string,
  /* the label show above the bar */
  label: PropTypes.string.isRequired,
  /* the text shown below the bar */
  helperText: PropTypes.string,
  /* if true, hide the label  */
  hideLabel: PropTypes.bool,
  /** When true, show the inline variant without an icon or label */
  inline: PropTypes.bool,
  /* the number used to fill the bar */
  value: PropTypes.number.isRequired,
  /* the unit shown beside the value label text */
  valueUnit: PropTypes.string,
  /**
   * the maximum value this bar supports, values higher trigger the `over` class to style the
   * value label text differently
   */
  max: PropTypes.number,
  /* If true, the bar area is white, for use with a gray background */
  light: PropTypes.bool,

  /**
   * An array of threshold objects to compare the value against and change the icon and/or
   * bar colors based on matching criteria
   */
  thresholds: PropTypes.arrayOf(
    PropTypes.oneOfType([ThresholdComparisonPropType, ThresholdComparisonFunctionPropType])
  ),
  /**
   * renders an icon beside the value label text
   */
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  /**
   * Callback called when a threshold determines what icon to render based on a string for the icon
   *    example usage: renderIconByName(name = 'my--checkmark--icon', props = { title: 'A checkmark', etc. })
   */
  renderIconByName: PropTypes.func,

  /**
   * i18n prop for adding an aria label to the icon
   */
  i18n: PropTypes.shape({
    iconLabel: PropTypes.string,
  }),
};

const defaultProps = {
  className: undefined,
  helperText: '',
  hideLabel: false,
  inline: false,
  light: false,
  thresholds: [],
  max: 100,
  valueUnit: '%',
  renderIcon: undefined,
  renderIconByName: undefined,
  i18n: {
    iconLabel: 'Progress bar icon',
  },
};

const DEFAULT_PROGRESS_BAR_COLOR = blue60;

const ProgressBar = ({
  className,
  helperText,
  hideLabel,
  i18n,
  inline,
  label,
  light,
  max,
  renderIcon,
  renderIconByName,
  thresholds,
  value,
  valueUnit,
}) => {
  const mergedI18n = useMerged(defaultProps.i18n, i18n);
  const matchingThreshold = useMatchingThreshold({ thresholds, value });
  const Icon = matchingThreshold?.icon ?? renderIcon;
  const hasColorObject = typeof matchingThreshold?.color?.fill === 'string';
  const matchingFillColor = matchingThreshold?.color ?? DEFAULT_PROGRESS_BAR_COLOR;
  const fillColor = hasColorObject ? matchingThreshold.color.fill : matchingFillColor;
  const strokeColor = hasColorObject ? matchingThreshold.color.stroke : undefined;
  const valueAndUnitString = Number.isInteger(value) ? `${value}${valueUnit}` : '';

  /**
   * helper to render the value and unit
   *
   * @returns JSXElement
   */
  const valueAndUnit = (
    <span
      className={classnames(`${iotPrefix}--progress-bar__value-label`, {
        // allow styling the value label differently when above max
        [`${iotPrefix}--progress-bar__value-label--over`]: value > max,
        [`${iotPrefix}--progress-bar__value-label--inline`]: inline,
      })}
      title={valueAndUnitString}
    >
      {valueAndUnitString}
    </span>
  );

  /**
   * When the progress bar is not using the inline variant, render the label and icon
   * above the progress bar.
   *
   * @returns JSX Element
   */
  const progressBarLabel = (
    <div
      className={classnames(`${iotPrefix}--progress-bar__label--right`, {
        [`${prefix}--visually-hidden`]: hideLabel,
      })}
    >
      {Icon ? (
        <span className={`${iotPrefix}--progress-bar__icon`} data-testid="progress-bar-icon">
          {renderIconByName && typeof Icon === 'string' ? (
            renderIconByName(Icon, {
              fill: fillColor,
              stroke: strokeColor,
              'aria-label': mergedI18n.iconLabel,
            })
          ) : (
            <Icon fill={fillColor} stroke={strokeColor} aria-label={mergedI18n.iconLabel} />
          )}
        </span>
      ) : null}
      {valueAndUnit}
    </div>
  );

  /**
   * helper method to render the progress bar with a div wrapper for the inline variant
   *
   * @returns JSXElement
   */
  const progressBarWithInlineWrapper = (
    <div className={`${iotPrefix}--progress-bar-wrapper--inline`}>
      <CarbonProgressBar label={label} helperText={undefined} hideLabel value={value} max={max} />
      {valueAndUnit}
    </div>
  );

  return (
    <div
      className={classnames(
        `${iotPrefix}--progress-bar-container`,
        {
          [`${iotPrefix}--progress-bar-container--light`]: light,
          [`${iotPrefix}--progress-bar-container--with-icon`]: Icon,
        },
        className
      )}
      data-testid="progress-bar-container"
      style={{
        '--progress-bar-fill-color': fillColor,
        '--progress-bar-stroke-color': strokeColor,
      }}
    >
      {inline ? (
        progressBarWithInlineWrapper
      ) : (
        <>
          {progressBarLabel}
          <CarbonProgressBar
            label={label}
            helperText={helperText}
            hideLabel={hideLabel}
            value={value}
            max={max}
          />
        </>
      )}
    </div>
  );
};

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;

export default ProgressBar;
