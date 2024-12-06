import React from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash-es';
import { CaretUp, CaretDown } from '@carbon/react/icons';
import classnames from 'classnames';
import { gray60 } from '@carbon/colors';
import { Link } from '@carbon/react';

import { CARD_LAYOUTS } from '../../constants/LayoutConstants';
import CardIcon from '../ImageCard/CardIcon';
import useMatchingThreshold from '../../hooks/useMatchingThreshold';
import { Tooltip } from '../Tooltip/index';

import ValueRenderer from './ValueRenderer';
import UnitRenderer from './UnitRenderer';
import { BASE_CLASS_NAME } from './valueCardUtils';

const propTypes = {
  attribute: PropTypes.shape({
    label: PropTypes.string,
    unit: PropTypes.string,
    dataSourceId: PropTypes.string,
    measurementUnitLabel: PropTypes.string,
    // decimal precision
    precision: PropTypes.number,
    thresholds: PropTypes.arrayOf(
      PropTypes.shape({
        comparison: PropTypes.oneOf(['<', '>', '=', '<=', '>=']).isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        color: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
    tooltip: PropTypes.string,
  }).isRequired,
  customFormatter: PropTypes.func,
  isEditable: PropTypes.bool,
  layout: PropTypes.oneOf(Object.values(CARD_LAYOUTS)),
  locale: PropTypes.string,

  renderIconByName: PropTypes.func,
  /** Optional trend information */
  secondaryValue: PropTypes.shape({
    color: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  fontSize: PropTypes.number.isRequired,
  /** optional option to determine whether the number should be abbreviated (i.e. 10,000 = 10K) */
  isNumberValueCompact: PropTypes.bool.isRequired,
  /** number of attributes */
  attributeCount: PropTypes.number.isRequired,
  testId: PropTypes.string,
  /** callback when the attribute is clicked to trigger further action like opening a modal */
  onValueClick: PropTypes.func,
};

const defaultProps = {
  layout: null,
  value: null,
  renderIconByName: null,
  secondaryValue: null,
  locale: 'en',
  customFormatter: null,
  isEditable: false,
  testId: 'attribute',
  onValueClick: null,
};

const BEM_BASE = `${BASE_CLASS_NAME}__attribute`;

/**
 * An attribute has a Value, Units and maybe a Threshold or Trend.
 * He also determines which threshold applies to a given attribute (perhaps that should be moved)
 */
const Attribute = ({
  attribute: { label, unit, thresholds, precision, dataSourceId, measurementUnitLabel, tooltip },
  attributeCount,
  customFormatter,
  isEditable,
  layout,
  locale,
  renderIconByName,
  secondaryValue,
  value,
  fontSize,
  isNumberValueCompact,
  testId,
  onValueClick,
}) => {
  const matchedThreshold = useMatchingThreshold({ thresholds, value });

  // matching threshold will be the first match in the list, or a value of null if not isEditable
  const matchingThreshold = thresholds ? (isEditable ? thresholds[0] : matchedThreshold) : null;

  const valueColor =
    matchingThreshold && matchingThreshold.icon === undefined ? matchingThreshold.color : null;

  // need to reduce the width size to fit multiple attributes when card layout is horizontal
  const attributeWidthPercentage = layout === CARD_LAYOUTS.HORIZONTAL ? 100 / attributeCount : 100;
  return (
    <div
      className={classnames(`${BEM_BASE}-wrapper`, {
        [`${BEM_BASE}-wrapper--vertical`]: layout === CARD_LAYOUTS.VERTICAL,
        [`${BEM_BASE}-wrapper--horizontal`]: layout === CARD_LAYOUTS.HORIZONTAL,
      })}
      style={{
        '--value-card-attribute-width': `${attributeWidthPercentage}%`,
      }}
    >
      <div className={`${BEM_BASE}-label`}>
        {matchingThreshold?.icon ? (
          <CardIcon
            fill={matchingThreshold.color}
            color={matchingThreshold.color}
            width={16}
            height={16}
            title={`${matchingThreshold.comparison} ${matchingThreshold.value}`}
            renderIconByName={renderIconByName}
            icon={matchingThreshold.icon}
            testId={`${testId}-threshold-icon`}
          />
        ) : null}
        {tooltip ? (
          <Tooltip direction="right" showIcon={false} triggerText={label}>
            <p>{tooltip}</p>
          </Tooltip>
        ) : (
          <span data-testid={`${testId}-threshold-label`}>{label}</span>
        )}
      </div>

      <div className={`${BEM_BASE}`}>
        <ValueRenderer
          value={value}
          layout={layout}
          precision={precision}
          color={valueColor}
          locale={locale}
          customFormatter={customFormatter}
          fontSize={fontSize}
          isNumberValueCompact={isNumberValueCompact}
          testId={`${testId}-value`}
          dataSourceId={dataSourceId}
          measurementUnitLabel={measurementUnitLabel}
          onClick={onValueClick}
        />
        <UnitRenderer unit={unit} testId={`${testId}-unit`} />
      </div>
      {!isNil(secondaryValue) ? (
        <div
          data-testid={`${testId}-secondary-value`}
          className={`${BEM_BASE}-secondary-value`}
          style={{
            '--secondary-value-color': gray60,
          }}
        >
          {secondaryValue.trend === 'up' ? (
            <CaretUp
              className={`${BEM_BASE}_trend-icon`}
              aria-label="trending up"
              data-testid={`${testId}-trending-up`}
              fill={secondaryValue.color || gray60}
            />
          ) : secondaryValue.trend === 'down' ? (
            <CaretDown
              className={`${BEM_BASE}_trend-icon`}
              aria-label="trending down"
              data-testid={`${testId}-trending-down`}
              fill={secondaryValue.color || gray60}
            />
          ) : null}
          {secondaryValue.href || secondaryValue.onClick ? (
            <Link
              data-testid={`${testId}-secondary-value--link`}
              className={`${BEM_BASE}-secondary-value--link`}
              href={secondaryValue?.href}
              rel="noopener noreferrer"
              onClick={() => secondaryValue?.onClick({ dataSourceId, secondaryValue })}
            >
              {secondaryValue.value}
            </Link>
          ) : (
            secondaryValue.value
          )}
        </div>
      ) : null}
    </div>
  );
};

Attribute.propTypes = propTypes;
Attribute.defaultProps = defaultProps;

export default Attribute;
