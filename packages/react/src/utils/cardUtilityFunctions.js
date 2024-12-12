import React, { useMemo, useState } from 'react';
import warning from 'warning';
import { isNil, mapValues } from 'lodash-es';

import { CARD_SIZES } from '../constants/LayoutConstants';

import dayjs from './dayjs';
import { convertStringsToDOMElement } from './componentUtilityFunctions';

/**
 * determine time range from drop down action
 * range - requested range from card dropdown action
 */
export const determineCardRange = (range) => {
  switch (range) {
    case 'last24Hours':
      return { interval: 'day', count: -1, timeGrain: 'hour', type: 'rolling' };
    case 'last7Days':
      return { interval: 'week', count: -1, timeGrain: 'day', type: 'rolling' };
    case 'lastMonth':
      return {
        interval: 'month',
        count: -1,
        timeGrain: 'day',
        type: 'rolling',
      };
    case 'lastQuarter':
      return {
        interval: 'quarter',
        count: -1,
        timeGrain: 'month',
        type: 'rolling',
      };
    case 'lastYear':
      return {
        interval: 'year',
        count: -1,
        timeGrain: 'month',
        type: 'rolling',
      };
    case 'thisWeek':
      return {
        interval: 'week',
        count: -1,
        timeGrain: 'day',
        type: 'periodToDate',
      };
    case 'thisMonth':
      return {
        interval: 'month',
        count: -1,
        timeGrain: 'day',
        type: 'periodToDate',
      };
    case 'thisQuarter':
      return {
        interval: 'quarter',
        count: -1,
        timeGrain: 'month',
        type: 'periodToDate',
      };
    case 'thisYear':
      return {
        interval: 'year',
        count: -1,
        timeGrain: 'month',
        type: 'periodToDate',
      };
    default:
      return { interval: 'day', count: -5, timeGrain: 'day', type: 'rolling' };
  }
};

/** Compare grains to decide which is greater */
export const compareGrains = (grain1, grain2) => {
  const greaterGrains = {
    hour: ['day', 'week', 'month', 'year'],
    day: ['week', 'month', 'year'],
    week: ['month', 'year'],
    month: ['year'],
    year: [],
  };
  if (grain1 === grain2) {
    return 0;
  }

  if (!grain1 || greaterGrains[grain1].includes(grain2)) {
    return -1;
  }
  return 1;
};

export const getUpdatedCardSize = (oldSize) => {
  const changedSize =
    oldSize === 'XSMALL'
      ? 'SMALL'
      : oldSize === 'XSMALLWIDE'
      ? 'SMALLWIDE'
      : oldSize === 'WIDE'
      ? 'MEDIUMWIDE'
      : oldSize === 'TALL'
      ? 'LARGETHIN'
      : oldSize === 'XLARGE'
      ? 'LARGEWIDE'
      : null;
  let newSize = oldSize;
  if (changedSize) {
    if (__DEV__) {
      warning(
        false,
        `You have set your card to a ${oldSize} size. This size name is deprecated. The card will be displayed as a ${changedSize} size.`
      );
    }
    newSize = changedSize;
  }
  return newSize;
};

/**
 * This function provides decimal precision and compact abbreviation formatting for number values
 * @param {number} value, the value the card will display
 * @param {number} precision, how many decimal values to display configured at the attribute level
 * @param {string} locale, the local browser locale because locales use different decimal separators
 * @param {Boolean} isNumberValueCompact whether the number should be abbreviated (i.e. 10,000 = 10K)
 */
export const formatNumberWithPrecision = (
  value,
  precision,
  locale = 'en',
  isNumberValueCompact = false
) => {
  return new Intl.NumberFormat(locale, {
    ...(precision
      ? {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }
      : {}),
    ...(isNumberValueCompact ? { notation: 'compact' } : {}),
  }).format(value);
};

/**
 * Reusable function to check if a string contains variables identified by surrounding curly braces i.e. {deviceid}
 * @param {string} value A string with variables, i.e. `{manufacturer} acceleration over the last {sensor} hours`
 * @returns {Array<String>} an array of variables, i.e. ['manufacturer', 'sensor']
 */
export const getVariables = (value) => {
  let variables = value && typeof value === 'string' ? value.match(/{[a-zA-Z0-9_-]+}/g) : null;
  variables = variables?.map((variable) => variable.replace(/[{}]/g, ''));
  return variables;
};

/**
 * Replace variables from the list of variables that are found on the target with their corresponding value
 * @param {Array<String>} variables an array of variable strings
 * @param {object} cardVariables an object with properties such that the key is a variable name and the value is the value to replace it with, i.e. { manufacturer: 'Rentech', sensor: 3 }
 * @param {Object || Array || String} target a card or string to replace variables on
 * @returns {Object} a parsed object with all variables replaced with their corresponding values found on the values object
 */
export const replaceVariables = (variables, cardVariables, target) => {
  // Need to create a copy of cardVariables with all lower-case keys
  const insensitiveCardVariables = Object.keys(cardVariables).reduce((acc, variable) => {
    acc[variable.toLowerCase()] = cardVariables[variable];
    return acc;
  }, {});

  // if it's an array then recursively place the variables in each element
  if (Array.isArray(target)) {
    return target.map((element) => replaceVariables(variables, cardVariables, element));
  }

  // if it's an object, then recursively replace each value unless it's a react element
  if (typeof target === 'object') {
    // if it's a react element, leave it alone
    return React.isValidElement(target) || isNil(target)
      ? target
      : mapValues(target, (property) =>
          replaceVariables(variables, insensitiveCardVariables, property)
        );
  }

  // we can only replace on string targets at this point
  if (typeof target !== 'string') {
    return target;
  }
  let updatedTarget = target;
  variables.forEach((variable) => {
    const insensitiveVariable = variable.toLowerCase();
    const variableRegex = new RegExp(`{${variable}}`, 'g');
    const exactMatch = new RegExp(`^{${insensitiveVariable}}$`, 'g');
    // if we're an exact match on number then set to number (to support numeric thresholds)
    if (
      exactMatch.test(target) &&
      typeof insensitiveCardVariables[insensitiveVariable] === 'number'
    ) {
      updatedTarget = insensitiveCardVariables[insensitiveVariable];
    } else if (typeof insensitiveCardVariables[insensitiveVariable] === 'function') {
      const callback = insensitiveCardVariables[insensitiveVariable];
      updatedTarget = callback(variable, target);
    } else {
      // if the target is still a string then continue
      updatedTarget =
        typeof updatedTarget === 'string' && !isNil(insensitiveCardVariables[insensitiveVariable])
          ? updatedTarget.replace(variableRegex, insensitiveCardVariables[insensitiveVariable])
          : updatedTarget;
    }
  });
  return updatedTarget;
};

/**
 * This function recurses across all of the card properties to find templatted variable
 * strings that need to be replaced
 * @param {Object} cardProperty i.e. title, content
 * @param {Array<string>} keysToSkip if present, do not attempt to retrieve variables
 * i.e. in table cards, there is unique cases in which it retrieves its only variables
 * @returns {Array<String>} an array of unique variable values
 */
export const getCardVariables = (cardProperty, keysToSkip = []) => {
  const cardVariables = Object.entries(cardProperty).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && !React.isValidElement(value) && !isNil(value)) {
      // recursively search any objects for additional string properties
      acc.push(...getCardVariables(value, keysToSkip));
    } else if (typeof value === 'string' && !keysToSkip.includes(key)) {
      // if it's a string, look for variables
      const detectedVariables = getVariables(value);
      if (detectedVariables) {
        acc.push(...detectedVariables);
      }
    }
    return acc;
  }, []);
  return [...new Set(cardVariables)];
};

/**
 * Replace variables from the list of variables that are found on the target with their corresponding value
 * @param {string} title - Title for the card
 * @param {object} content - Contents for the card
 * @param {string} values - Values for the card
 * @param {object} card - The rest of the card
 * @param {Array<string>} keysToSkip if present, do not attempt to retrieve variables
 * i.e. in table cards, there is unique cases in which it retrieves its only variables
 * @return {object} updatedCard - card with any found variables replaced by their coresponding values, or the original card if no variables
 */
export const handleCardVariables = (title, content, values, card, keysToSkip = []) => {
  const updatedCard = {
    title,
    content,
    values,
    ...card,
  };

  if (!updatedCard.cardVariables) {
    return updatedCard;
  }
  const { cardVariables } = updatedCard;

  const variablesArray = getCardVariables(updatedCard, keysToSkip);
  return replaceVariables(variablesArray, cardVariables, updatedCard);
};

/**
 * Determines how many decimals to show for a value based on the value, the available size of the card
 * @param {string} size constant that describes the size of the Table card
 * @param {any} value will be checked to determine how many decimals to show
 * @param {*} precision Desired decimal precision, will be used if specified
 */
export const determinePrecision = (size, value, precision) => {
  // If it's an integer don't return extra values
  if (Number.isInteger(value)) {
    return 0;
  }
  // If the card is small we don't have room for decimals!
  switch (size) {
    case CARD_SIZES.SMALL:
      return !isNil(precision) ? precision : Math.abs(value) > 9 ? 0 : undefined;
    default:
  }
  return precision;
};

/**
 * Determines how to format our values for our lines and bars
 *
 * @param {any} value any value possible, but will only special format if a number
 * @param {string} size card size
 * @param {string} unit any optional units to show
 * @param {number} the selected precision value
 */
export const chartValueFormatter = (value, size, unit, locale, precision) => {
  const precisionToFormat =
    precision || determinePrecision(size, value, Math.abs(value) > 1 ? 1 : 3);
  let renderValue = value;
  if (typeof value === 'number') {
    renderValue = formatNumberWithPrecision(value, precisionToFormat, locale);
  } else if (isNil(value)) {
    renderValue = '--';
  }
  return `${renderValue}${!isNil(unit) ? ` ${unit}` : ''}`;
};

/**
 * Charts render incorrectly if size is too small, so change their size to MEDIUM
 * @param {string} size card size
 */
export const increaseSmallCardSize = (size, cardName) => {
  if (__DEV__) {
    warning(
      size !== CARD_SIZES.SMALL && size !== CARD_SIZES.SMALLWIDE && size !== CARD_SIZES.SMALLFULL,
      `${cardName} does not support card size ${size}`
    );
  }
  return size === CARD_SIZES.SMALL
    ? CARD_SIZES.MEDIUM
    : size === CARD_SIZES.SMALLWIDE
    ? CARD_SIZES.MEDIUMWIDE
    : size === CARD_SIZES.SMALLFULL
    ? CARD_SIZES.MEDIUMWIDE
    : size;
};

const resizeHandleId = 'resizableHandle';

/**
 * Simple helper function to extract the resizeHandles from the react children
 * @param {} children the react children data structure containing the resizeHandles
 */
export const getResizeHandles = (children) =>
  React.Children.toArray(children).filter((child) => child.key?.includes(resizeHandleId));

/**
 * Custom hook that manages the isResizable state. It does that by wrapping
 * the onStart/onStop callbacks found in the resizeHandles. The resizeHandles
 * are created by the external library react-grid-layout.
 *
 * The hook returns an object with both the modified resizeHandles and
 * the isResizing state.
 *
 * @param {array} wrappingCardResizeHandles resizeHandles optionally passed down by wrapping card
 * @param {} children the react children data structure containing the resizeHandles
 * @param {boolean} isResizable true if the component using the hook should be resizable
 */
export const useCardResizing = (wrappingCardResizeHandles, children, isResizable) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeHandlesWithEventHandling = useMemo(
    () => {
      const resizeHandles =
        wrappingCardResizeHandles || (isResizable && getResizeHandles(children)) || [];

      return resizeHandles.map((handleElement) =>
        React.cloneElement(handleElement, {
          ...handleElement.props,
          onStart: (...args) => {
            setIsResizing(true);
            if (handleElement.props?.onStart) {
              handleElement.props.onStart(...args);
            }
          },
          disabled: false,
          onStop: (...args) => {
            setIsResizing(false);
            if (handleElement.props?.onStop) {
              handleElement.props.onStop(...args);
            }
          },
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isResizable]
  );
  return { resizeHandles: resizeHandlesWithEventHandling, isResizing };
};

/**
 *
 * @param {string} url the url where the image is hosted
 * @param {function} callback for handling errors from fetch
 */
export const fetchDataURL = (url, callback) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.arrayBuffer();
    })
    .then((ab) => ({
      files: {
        addedFiles: [new File([ab], `${url.match(/([^/]*?)(?=\?|#|$)/)[0]}`)],
      },
      dataURL: `data:image/png;base64,${btoa(
        new Uint8Array(ab).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`,
    }))
    .catch((e) => callback(e.message));

/**
 * Returns an array of matching thresholds will only return the highest severity threshold for a column
 * If passed a columnId, it filters the threshold check on the current column only
 * @param {Array<Object>} thresholds
 * @param {Object} item
 * @param {string} columnId
 * @returns {Array} matching thresholds
 */
export const findMatchingThresholds = (thresholds, item, columnId) => {
  if (!item) {
    return [];
  }
  return thresholds
    .filter((t) => {
      const { comparison, value, dataSourceId } = t;
      // Does the threshold apply to the current column?
      if (columnId && !columnId.includes(dataSourceId)) {
        return false;
      }

      switch (comparison) {
        case '<':
          return !isNil(item[dataSourceId]) && parseFloat(item[dataSourceId]) < value;
        case '>':
          return parseFloat(item[dataSourceId]) > value;
        case '=':
          return parseFloat(item[dataSourceId]) === value || item[dataSourceId] === value; // need to handle the string case
        case '<=':
          return !isNil(item[dataSourceId]) && parseFloat(item[dataSourceId]) <= value;
        case '>=':
          return parseFloat(item[dataSourceId]) >= value;
        default:
          return false;
      }
    })
    .reduce((highestSeverityThreshold, threshold) => {
      const currentThresholdIndex = highestSeverityThreshold.findIndex(
        (currentThreshold) => currentThreshold.dataSourceId === threshold.dataSourceId
      );

      if (
        // If I don't have a threshold currently for this column
        currentThresholdIndex < 0
      ) {
        highestSeverityThreshold.push({
          ...threshold,
          currentValue: item[threshold.dataSourceId],
        });
      } // The lowest severity is actually the most severe
      else if (highestSeverityThreshold[currentThresholdIndex].severity > threshold.severity) {
        // eslint-disable-next-line no-param-reassign
        highestSeverityThreshold[currentThresholdIndex] = {
          ...threshold,
          currentValue: item[threshold.dataSourceId],
        };
      }
      return highestSeverityThreshold;
    }, []);
};

/** compare the current datapoint to a list of alert ranges */
export const findMatchingAlertRange = (alertRanges, data) => {
  const currentData = Array.isArray(data) ? data[0] : data;

  const { date: currentDataPoint, dataSourceId } = currentData || {};

  if (!currentDataPoint) {
    return [];
  }

  const currentDatapointTimestamp = currentDataPoint.valueOf();
  return (
    Array.isArray(alertRanges) &&
    alertRanges.filter(
      (alert) =>
        currentDatapointTimestamp <= alert.endTimestamp &&
        currentDatapointTimestamp >= alert.startTimestamp &&
        (alert?.inputSource?.dataSourceIds && dataSourceId // If there is input data sources provided use them to do the filter
          ? alert.inputSource.dataSourceIds.includes(dataSourceId)
          : true)
    )
  );
};

/**
 * Extends default tooltip with the additional date information, and optionally alert information
 * @param {object} dataOrHoveredElement data object for this particular datapoint should have a date field containing the timestamp
 * @param {string} defaultTooltip Default HTML generated for this tooltip that needs to be marked up
 * @param {object} _datum of the hovered element
 * @param {array} alertRanges Array of alert range information to search
 * @param {string} alertDetected Translated string to indicate that the alert is detected
 * @param {bool} showTimeInGMT
 * @param {string} tooltipDateFormatPattern
 * @returns {string} DOM representation of the tooltip
 */
export const handleTooltip = (
  dataOrHoveredElement,
  defaultTooltip,
  _datum,
  alertRanges,
  alertDetected,
  showTimeInGMT,
  tooltipDateFormatPattern = 'L HH:mm:ss',
  locale
) => {
  dayjs.locale(locale);
  const data = /* eslint-disable no-underscore-dangle */ dataOrHoveredElement?.__data__
    ? dataOrHoveredElement.__data__ // eslint-disable-line no-underscore-dangle
    : dataOrHoveredElement;
  const timeStamp = Array.isArray(data) ? data[0]?.date?.getTime() : data?.date?.getTime();
  const dateLabel = timeStamp
    ? `<li class='datapoint-tooltip'>
        <p class='label'>${(showTimeInGMT // show timestamp in gmt or local time
          ? dayjs.utc(timeStamp)
          : dayjs(timeStamp)
        ).format(tooltipDateFormatPattern)}</p>
      </li>`
    : '';
  const matchingAlertRanges = findMatchingAlertRange(alertRanges, data);
  const matchingAlertLabels = Array.isArray(matchingAlertRanges)
    ? matchingAlertRanges
        .map(
          (matchingAlertRange) =>
            `<li class='datapoint-tooltip'><a style="background-color:${matchingAlertRange.color}" class="tooltip-color"></a><p class='label'>${alertDetected} ${matchingAlertRange.details}</p></li>`
        )
        .join('')
    : '';

  // Convert strings to DOM Elements so we can easily reason about them and manipulate/replace pieces.
  const [defaultTooltipDOM, dateLabelDOM, matchingAlertLabelsDOM] = convertStringsToDOMElement([
    defaultTooltip,
    dateLabel,
    matchingAlertLabels,
  ]);

  // if the data has no timestamp, there will no dateLabel
  // and without this check a null string was being inserted into the DOM.
  if (dateLabelDOM.querySelector('li')) {
    // The first <li> will always be carbon chart's Dates row in this case, replace with our date format <li>
    defaultTooltipDOM.querySelector('li:first-child').replaceWith(dateLabelDOM.querySelector('li'));
  }

  // Append all the matching alert labels
  matchingAlertLabelsDOM.querySelectorAll('li').forEach((label) => {
    defaultTooltipDOM.querySelector('ul').append(label);
  });

  return defaultTooltipDOM.innerHTML;
};
