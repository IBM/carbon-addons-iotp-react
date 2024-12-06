import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import Button from '../Button/Button';

const { iotPrefix } = settings;

const propTypes = {
  /** true if the legend should be full bleed  and occupy the full width of the map  */
  isFullWidth: PropTypes.bool.isRequired,
  /** true if the legend is collapsed (only relevant for isFullWidth:true) */
  isCollapsed: PropTypes.bool.isRequired,
  /** true if there should be extra wide margins, like when a card is expanded to full page */
  increasedMargin: PropTypes.bool,
  titleText: PropTypes.string,
  hideLegendText: PropTypes.string,
  showLegendText: PropTypes.string,
  /** list of text - color pairs for the legend. Each pair is an array where pos 0 is the text and pos 1 the color */
  stops: PropTypes.arrayOf(PropTypes.array).isRequired,
  /** callback for when the collapse toggle button is clicked */
  onCollapsToggle: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

const defaultProps = {
  titleText: 'Legend',
  hideLegendText: 'Hide legend',
  showLegendText: 'Show legend',
  increasedMargin: false,
  testId: 'map-legend',
};

const Legend = ({
  increasedMargin,
  isFullWidth,
  stops,
  titleText,
  hideLegendText,
  showLegendText,
  isCollapsed,
  onCollapsToggle,
  testId,
}) => {
  const renderLegendKeys = () => {
    return stops.map(([value, color], i) => {
      const localValue = value.toLocaleString();
      return (
        <div key={`${localValue}-${color}-${i}`} className={`${iotPrefix}--map-legend-keys`}>
          <span
            className={`${iotPrefix}--map-legend-keys-color`}
            style={{ backgroundColor: color }}
          />
          <span className={`${iotPrefix}--map-legend-keys-value`}>{localValue}</span>
        </div>
      );
    });
  };

  return isFullWidth ? (
    <div
      data-testid={testId}
      className={classnames(`${iotPrefix}--map-legend`, `${iotPrefix}--map-legend--fullwidth`, {
        [`${iotPrefix}--map-legend--fullwidth-collapsed`]: isCollapsed,
      })}
    >
      <Button
        testId={`${testId}-collapse-toggle`}
        className={`${iotPrefix}--map-legend__collapse-btn`}
        kind="ghost"
        size="sm"
        renderIcon={
          (document.dir === 'ltr' && isCollapsed) || (document.dir === 'rtl' && !isCollapsed)
            ? ChevronRight
            : ChevronLeft
        }
        hasIconOnly
        iconDescription={isCollapsed ? showLegendText : hideLegendText}
        tooltipPosition={document.dir === 'rtl' ? 'left' : 'right'}
        onClick={onCollapsToggle}
      />

      <div className={`${iotPrefix}--map-legend-content`}>
        <div title={titleText} className={`${iotPrefix}--map-legend__label`}>
          {titleText}
        </div>
        <div className={`${iotPrefix}--map-legend__keys-container`}>{renderLegendKeys()}</div>
      </div>
    </div>
  ) : (
    <div
      data-testid={testId}
      className={classnames(`${iotPrefix}--map-legend`, {
        [`${iotPrefix}--map-legend--increased-margin`]: increasedMargin,
      })}
    >
      {renderLegendKeys()}
    </div>
  );
};

Legend.defaultProps = defaultProps;
Legend.propTypes = propTypes;
export default Legend;
