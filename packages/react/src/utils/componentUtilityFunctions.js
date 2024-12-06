import { useEffect } from 'react';
import { delay, isNil } from 'lodash-es';
import { sortStates } from '@carbon/react/es/components/DataTable/state/sorting';
import fileDownload from 'js-file-download';
import warning from 'warning';
import { firstBy } from 'thenby';

import {
  GUTTER,
  DASHBOARD_BREAKPOINTS,
  CARD_DIMENSIONS,
  ROW_HEIGHT,
  DASHBOARD_COLUMNS,
} from '../constants/LayoutConstants';
import { FILTER_EMPTY_STRING, EMPTY_STRING_DISPLAY_VALUE } from '../constants/Filters';
import {
  reactAttributes,
  htmlAttributes,
  svgAttributes,
  eventHandlers,
} from '../constants/HTMLAttributes';

import dayjs from './dayjs';

/**
 * Helper function to generate a CSV from an array of table cell data
 * Retrieve the column headers, then match and join the cell values
 * with each header
 * @param {Array<string | number | boolean>} data from table cells
 * @return {string} generated csv
 */
export const generateCsv = (data) => {
  const allHeadersObj = Object.assign({}, ...data.map((row) => row.values));
  const columnHeaders = Object.keys(allHeadersObj);
  const headerRow = `${columnHeaders.join(',')}\n`;
  const lastColumnId = columnHeaders.slice(-1)[0];

  return data.reduce((previousCsv, row) => {
    return columnHeaders.reduce((previousNestedCsv, headerId) => {
      const separator = headerId === lastColumnId ? '\n' : ',';
      return `${previousNestedCsv}${row.values[headerId] ?? ''}${separator}`;
    }, previousCsv);
  }, headerRow);
};

/**
 * Helper function to support downloading data as CSV
 * Retrieve the column headers, then match and join the cell values
 * with each header. When CSV is fully joined, download the file
 *
 * @param {Array<string | number>} data from table cells
 * @param {string} title file name to be saved as
 */
export const csvDownloadHandler = (data, title = 'export') => {
  const csv = generateCsv(data);
  const exportedFilename = `${title}.csv`;

  fileDownload(csv, exportedFilename);
};

export const tableTranslateWithId = (i18n, id, state) => {
  const { batchCancel, itemsSelected, itemSelected } = i18n;
  switch (id) {
    case 'carbon.table.batch.cancel':
      return batchCancel;
    case 'carbon.table.batch.items.selected':
      return typeof itemsSelected === 'function'
        ? itemsSelected(state.totalSelected)
        : `${state.totalSelected} ${itemsSelected}`;
    case 'carbon.table.batch.item.selected':
      return typeof itemSelected === 'function'
        ? itemSelected(state.totalSelected)
        : `${state.totalSelected} ${itemSelected}`;
    case 'carbon.table.toolbar.search.label':
      return i18n.searchLabel;
    case 'carbon.table.toolbar.search.placeholder':
      return i18n.searchPlaceholder;
    case 'carbon.table.header.icon.description':
      if (state.isSortHeader) {
        // When transitioning, we know that the sequence of states is as follows:
        // NONE -> ASC -> DESC -> NONE
        if (state.sortDirection === sortStates.NONE) {
          return i18n.filterAscending;
        }
        if (state.sortDirection === sortStates.ASC) {
          return i18n.filterDescending;
        }

        return i18n.filterNone;
      }
      return i18n.filterAscending;
    default:
      return '';
  }
};

/** This function assumes you're using carbon widgets */
export function scrollErrorIntoView(focus = true) {
  const invalidField = document.querySelector('[data-invalid="true"]');
  if (invalidField) {
    invalidField.scrollIntoView({ behavior: 'smooth' });
    if (focus) {
      delay(() => invalidField.focus(), 250);
    }
    return true;
  }
  return false;
}

export const handleEnterKeyDown = (evt, callback) => {
  if (evt.key === 'Enter') {
    callback(evt);
  }
};

export const defaultFunction = (name) => () => {
  if (!process?.env?.JEST_WORKER_ID) {
    // eslint-disable-next-line no-console
    console.info(`${name} not implemented`);
  }
};

export const sortTableData = (columnId, isTimestampColumn) => (a, b) => {
  if (isNil(a)) {
    return 1;
  }
  if (isNil(b)) {
    return -1;
  }
  if (isTimestampColumn) {
    // support the sort if we have column with timestamp
    const dateA = dayjs(a);
    const dateB = dayjs(b);

    if (dateA < dateB) {
      return -1;
    }
    if (dateA > dateB) {
      return 1;
    }
  }
  if (typeof a === 'string' && !Number(a)) {
    return a.localeCompare(b);
  }
  if (Number(a) < Number(b)) {
    return -1;
  }
  if (Number(a) > Number(b)) {
    return 1;
  }

  return 0;
};

export const getSortedData = (inputData, columnId, direction, isTimestampColumn) => {
  // clone inputData because sort mutates the array
  const sortedData = inputData.map((i) => i);

  return sortedData.sort(
    firstBy((row) => row.values[columnId], {
      cmp: sortTableData(columnId, isTimestampColumn),
      direction: direction === 'ASC' ? 'asc' : 'desc',
    })
  );
};

/**
 * A simple helper function that stops prop on an event before calling back the callback function
 * @param {*} evt  event to stop
 * @param {*} callback  callback to call
 * @param  {...any} args
 */
export const stopPropagationAndCallback = (evt, callback, ...args) => {
  evt.stopPropagation();
  callback(...args);
};

/**
 * Determines the smallest possible height that the dashboard can be while fitting all cards
 * Cards have a max height of 16 units
 * @param {array} cards list of cards
 */
export const getGridHeight = (cards) => cards.length * 16;

/**
 * Utility function that prints out the grid at the correct orientation
 */
export const printGrid = (grid, cards) => {
  let result = '';
  for (let j = 0; j < getGridHeight(cards); j += 1) {
    for (let i = 0; i < grid.length; i += 1) {
      result += `${grid[i][j]} `;
    }
    result += '\n';
  }
  console.log(result); // eslint-disable-line no-console
};

/**
 * Checks to see if the bounds of a card (given x/y coordinates and width/height) fit the grid
 * @param {*} x  the current x location of a card
 * @param {*} y  the current y location of a card
 * @param {*} w  current width of a card
 * @param {*} h  current height of a card
 * @param {*} grid nested array of rows and columns with the current card index that is occupying them. for example, if the entire top row was taken by the first card it would look like this [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
 */
export const canFit = (x, y, w, h, grid) => {
  for (let i = x; i < x + w; i += 1) {
    for (let j = y; j < y + h; j += 1) {
      if (grid.length === i) return false;
      if (grid[i].length === j) return false;
      if (grid[i][j] !== 0) return false;
    }
  }
  return true;
};

/**
 * Generates a non overlapping layout given the cards and column/dimension configuration for a given layout
 * @param {*} layoutName
 * @param {*} cards
 * @param {*} dashboardColumns array of column counts for the different breakpoints (see DASHBOARD_COLUMNS)
 * @param {*} cardDimensions double object of card height and width keyed by card size and layout (see CARD_DIMENSIONS)
 * returns
 */
export const getLayout = (layoutName, cards, dashboardColumns, cardDimensions, existingLayout) => {
  let currX = 0;
  let currY = 0;

  // This grid is used to determine where a card can fit in the layout
  const grid = Array(dashboardColumns[layoutName])
    .fill(0)
    .map(() => Array(getGridHeight(cards)).fill(0));

  // This function updates the grid to reflect a card
  const placeCard = (x, y, w, h, num) => {
    for (let i = x; i < x + w; i += 1) {
      for (let j = y; j < y + h; j += 1) {
        grid[i][j] = num;
      }
    }
  };

  const layout = cards
    .map((card, index) => {
      const { w, h } = cardDimensions[card.size][layoutName]; // These are width and height based on card.size.

      // Handle pre-existing cards
      const existingCardLayout = existingLayout?.find(({ i }) => i === card.id);
      if (existingCardLayout) {
        const { x, y } = existingCardLayout; // coordinates of a card that already exists
        // Need to 'try' here because we will get an error if the user passes a layout that doesn't work
        try {
          // Need to place each existing card into the grid so that new cards know their bounds
          placeCard(x, y, w, h, index + 1);
        } catch (err) {
          // In this case, since we didn't explicitly place it, react-grid-layout will handle it for us
          // eslint-disable-next-line no-console
          console.error('Error displaying user defined layout: ', err);
        }
        return {
          ...existingCardLayout,
          w,
          h,
        };
      }

      // Handle new cards
      while (!canFit(currX, currY, w, h, grid)) {
        // checks each position of the grid to see if the card fits, updating the currX and currY along the way
        currX += 1;
        if (currX > dashboardColumns[layoutName]) {
          currX = 0;
          currY += 1;
          if (currY > getGridHeight(cards)) {
            return null;
          }
        }
      }
      // Need to 'try' here because we will get an error if the user passes a layout that doesn't work
      try {
        placeCard(currX, currY, w, h, index + 1);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error displaying user defined layout: ', err);
      }

      const cardLayout = {
        i: card.id,
        x: currX,
        y: currY,
        w,
        h,
      };
      currX += w;
      return cardLayout;
    })
    .filter((i) => i !== null);

  return layout;
};

/**
 * Returns { x: width in pixels, y: height in pixels }
 * This is used to set min-width and min-height of the card based on the current breakpoint
 */
export const getCardMinSize = (
  breakpoint,
  size,
  dashboardBreakpoints = DASHBOARD_BREAKPOINTS,
  cardDimensions = CARD_DIMENSIONS,
  rowHeight = ROW_HEIGHT,
  dashboardColumns = DASHBOARD_COLUMNS
) => {
  const totalCol = dashboardColumns[breakpoint];
  const columnWidth = (dashboardBreakpoints[breakpoint] - (totalCol - 1) * GUTTER) / totalCol;
  const cardColumns = cardDimensions[size][breakpoint].w;
  const cardRows = cardDimensions[size][breakpoint].h;

  const cardSize = {
    x: cardColumns * columnWidth + (cardColumns - 1) * GUTTER,
    y: cardRows * rowHeight[breakpoint] + (cardRows - 1) * GUTTER,
  };
  return cardSize;
};

/**
 * Checks if function argument is an empty string
 * @param {string} str argument to be checked
 * @returns {Boolean} is empty string or not
 */
export const isEmptyString = (str) => typeof str === 'string' && str.length === 0;

/**
 * Searches through an array of keys for a searchTerm match
 * @param {Array<string>} keys to be searched
 * @param {string} searchTerm
 * @returns {Boolean} found or not
 */
export const caseInsensitiveSearch = (keys, searchTerm) => {
  return keys.some((key) => key.toLowerCase().includes(searchTerm.toLowerCase()));
};

const data = '[Dd][Aa][Tt][Aa]';
const aria = '[Aa][Rr][Ii][Aa]';
const attributes = [...reactAttributes, ...htmlAttributes, ...svgAttributes, ...eventHandlers].join(
  '|'
);
const validAttributes = RegExp(`^((${attributes})|((${data}|${aria}|x)-.*))$`);
/**
 * Filter out props that are not valid HTML or react library props like 'ref'.
 * See HTMLAttributes.js for more info
 * @param {object} props the props (attributes) to filter
 */
export const filterValidAttributes = (props) =>
  Object.keys(props)
    .filter((prop) => validAttributes.test(prop))
    .reduce((filteredProps, propName) => {
      // eslint-disable-next-line no-param-reassign
      filteredProps[propName] = props[propName];
      return filteredProps;
    }, {});

/**
 * Detect browser support for a given API
 * @param {Array<string>} api the API to be tested
 * @returns {Boolean} return true if browser has support
 */
export const browserSupports = (api) => {
  switch (api) {
    case 'ResizeObserver':
      return typeof ResizeObserver !== 'undefined';
    case 'IntersectionObserver':
      return typeof IntersectionObserver !== 'undefined';
    default:
      // There is no assigned value by default, so return undefined
      return undefined;
  }
};

/**
 * Helper function for using the overrides props as object or a function that returns an object
 * @param {Object | Function} props the props that should override existing props
 * @param {Object} originalProps the original props, can be used as input for creating new props
 */
export const getOverrides = (props, originalProps) => {
  return typeof props === 'function' ? props(originalProps) : props;
};

/**
 * Converts strings to DOM Elements, individually returned within a <body> node.
 * @param {Array} strings
 * @returns {Array} DOM Elements
 */
export const convertStringsToDOMElement = (strings = []) => {
  const domparser = new DOMParser();
  const mimetype = 'text/html';

  return strings.map((string) => {
    return domparser.parseFromString(string, mimetype).querySelector('body');
  });
};

/**
 * Converts a color in hexadecimal to the RGB values.
 * @param {string} hexColor
 * @returns {object} object with values for r, g, b properties
 */
export const hexToRgb = (hexColor) => {
  const regexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  const radix = 16;
  let rgbColors;
  try {
    const r = parseInt(regexResult[1], radix);
    const g = parseInt(regexResult[2], radix);
    const b = parseInt(regexResult[3], radix);
    rgbColors = { r, g, b };
  } catch {
    if (__DEV__) {
      warning(
        false,
        'Incorrect color value used, expected hexadecimal string. Defaulting to gray.'
      );
    }
  }
  return rgbColors ?? { r: 200, g: 200, b: 200 };
};

/**
 * If min and max are provided, this function checks to see if the integer value is within the range
 * @param {Number} value integer value
 * @param {Number} min optional
 * @param {Number} max optional
 */
export const isNumberValidForMinMax = (value, min, max) => {
  let valid = false;
  if (Number.isInteger(value)) {
    valid = true;
    if (min) {
      if (value < min) {
        valid = false;
      }
    }
    if (max) {
      if (value > max) {
        valid = false;
      }
    }
  }
  return valid;
};

/**
 * Given an array of keys and a callback, fire the callback only when the event.key matches one of the keys included in the array
 *
 * @param {string[]} keys An array of key names you want to match and fire the callback on
 * @param {func} callback A callback to be fired when the specific keys are pressed
 * @returns void
 */
export const handleSpecificKeyDown = (keys, callback) => (evt) => {
  if (keys.includes(evt.key)) {
    callback(evt);
  }
};

/**
 * Returns filter id (includes special constant for empty string)
 * @param {string} selectedItem filter value
 * @returns {string}
 */
export const getFilterValue = (selectedItem) => {
  if (selectedItem === null) {
    return '';
  }

  if (isEmptyString(selectedItem.id)) {
    return FILTER_EMPTY_STRING;
  }

  return selectedItem.id;
};

/**
 * Returns filter id for multiselect (includes special constant for empty string)
 * @param {string} selectedItem filter value
 * @returns {string}
 */
export const getMultiselectFilterValue = (selectedItem) => {
  if (isEmptyString(selectedItem.id)) {
    return FILTER_EMPTY_STRING;
  }

  return selectedItem.text;
};

/**
 * Returns filter text (includes check for empty string)
 * @param {Object} column table column containing applied filter
 * @param {*} filterValue
 * @returns {string} text to display in input field
 */
export const getAppliedFilterText = (column, filterValue) => {
  const filter = column.options.find((option) => {
    if (filterValue === FILTER_EMPTY_STRING && option.id === '') {
      return true;
    }

    if (option.id === '') {
      return false;
    }

    return option.id === filterValue;
  });

  if (filter) {
    return filter.text;
  }

  return '';
};

const getSelectedItem = (value, emptyValue) => {
  if (typeof value === 'object') {
    return value;
  }

  if (value === FILTER_EMPTY_STRING) {
    return { id: '', text: emptyValue };
  }

  return { id: value, text: value };
};

/**
 * Returns array with selected filters (includes check for empty string)
 * @param {Object} column table column containing applied filter
 * @param {*} filterValue
 * @returns {Object[]} selected filters
 */
export const getMultiSelectItems = (column, filterValue) => {
  const filterWithEmptyString = column?.options.find((filter) => isEmptyString(filter.id));
  const displayEmptyValue = filterWithEmptyString?.text ?? EMPTY_STRING_DISPLAY_VALUE;

  if (Array.isArray(filterValue)) {
    return filterValue.map((value) => getSelectedItem(value, displayEmptyValue));
  }

  if (filterValue === FILTER_EMPTY_STRING) {
    return [{ id: '', text: displayEmptyValue }];
  }

  if (filterValue) {
    return [{ id: filterValue, text: filterValue }];
  }

  return [];
};

/**
 * Hook to detect clicks outside of a specified element
 * @param {node} ref Upon interaction with this DOM node handler won't be invoked
 * @param {function} handler Callback for interaction event
 */
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, handler]);
};
