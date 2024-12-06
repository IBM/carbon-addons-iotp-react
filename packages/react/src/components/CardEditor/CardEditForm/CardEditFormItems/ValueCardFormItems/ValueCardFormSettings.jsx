import React from 'react';
import PropTypes from 'prop-types';
import { NumberInput, Toggle } from '@carbon/react';

import { settings } from '../../../../../constants/Settings';
import { Tooltip } from '../../../../Tooltip';
import { DEFAULT_FONT_SIZE } from '../../../../ValueCard/valueCardUtils';
import { isNumberValidForMinMax } from '../../../../../utils/componentUtilityFunctions';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.shape({
      series: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          dataSourceId: PropTypes.string,
          color: PropTypes.string,
        })
      ),
      unit: PropTypes.string,
    }),
    interval: PropTypes.string,
    fontSize: PropTypes.number,
    isNumberValueCompact: PropTypes.bool,
  }),
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    fontSize: PropTypes.string,
    abbreviateNumbers: PropTypes.string,
    abbreviateNumbersTooltip: PropTypes.string,
  }),
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    fontSize: 'Font size',
    abbreviateNumbers: 'Abbreviate numbers',
    abbreviateNumbersTooltip:
      'Shorten numbers by using K, M, B. For example, shows "1.2K" instead of "1,200"',
  },
};

const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 54;

const ValueCardFormSettings = ({ cardConfig, onChange, i18n }) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const { id, fontSize, isNumberValueCompact } = cardConfig;

  const baseClassName = `${iotPrefix}--card-edit-form`;

  return (
    <>
      <div className={`${baseClassName}--input`}>
        <NumberInput
          id={`${id}_value-card-font-size`}
          step={1}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          light
          label={mergedI18n.fontSize}
          value={fontSize || DEFAULT_FONT_SIZE}
          onChange={(event) => {
            const parsedValue = Number(event.imaginaryTarget.value);
            if (isNumberValidForMinMax(parsedValue, MIN_FONT_SIZE, MAX_FONT_SIZE)) {
              onChange({
                ...cardConfig,
                fontSize: parsedValue,
              });
            }
          }}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <div className={`${baseClassName}--input--toggle-field`}>
          <span>{mergedI18n.abbreviateNumbers}</span>
          <Tooltip
            direction="left"
            triggerText={null}
            triggerId={`${id}-abbreviate-numbers-tooltip`}
          >
            <p>{mergedI18n.abbreviateNumbersTooltip}</p>
          </Tooltip>
          <Toggle
            size="sm"
            id={`${id}_value-card-number-compact`}
            labelA=""
            labelB=""
            toggled={isNumberValueCompact || false}
            onToggle={(toggled) =>
              onChange({
                ...cardConfig,
                isNumberValueCompact: toggled,
              })
            }
            aria-label="Abbreviate number"
          />
        </div>
      </div>
    </>
  );
};

ValueCardFormSettings.propTypes = propTypes;
ValueCardFormSettings.defaultProps = defaultProps;

export default ValueCardFormSettings;
