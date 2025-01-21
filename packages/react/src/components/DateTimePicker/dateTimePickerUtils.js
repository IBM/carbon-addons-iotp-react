import { cloneDeep, debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { settings } from '../../constants/Settings';
import { PICKER_KINDS, INTERVAL_VALUES, RELATIVE_VALUES } from '../../constants/DateConstants';
import dayjs from '../../utils/dayjs';

const { iotPrefix, prefix } = settings;

/** check if current time is 24 hours
 *
 * @param {string} dateTimeMask like YYYY-MM-DD HH:MM
 * @returns true or false
 */
const is24hours = (dateTimeMask) => {
  const [, time] = dateTimeMask.split(' ');
  const hoursMask = time?.split(':')[0];
  return hoursMask ? hoursMask.includes('H') : false;
};

/** convert time from 12 hours to 24 hours, if time12hour is 24 hours format, return immediately
 * @param {Object} object hh:mm A time oject
 * @returns HH:mm time object
 */
export const format12hourTo24hour = (time12hour) => {
  if (time12hour === '' || !time12hour) {
    return '00:00';
  }
  const [time, modifier] = time12hour.split(' ');

  if (!modifier) {
    return time12hour;
  }

  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours}:${minutes}`;
};

/**
 * Parses a value object into a human readable value
 * @param {Object} value - the currently selected value
 * @param {string} value.kind - preset/relative/absolute
 * @param {Object} value.preset - the preset selection
 * @param {Object} value - the relative time selection
 * @param {Object} value - the absolute time selection
 * @returns {Object} a human readable value and a furtherly augmented value object
 */
export const parseValue = (timeRange, dateTimeMask, toLabel, hasTimeInput) => {
  let readableValue = '';

  if (!timeRange) {
    return { readableValue };
  }

  const kind = timeRange.kind ?? timeRange.timeRangeKind;
  const value =
    kind === PICKER_KINDS.RELATIVE
      ? timeRange?.relative ?? timeRange.timeRangeValue
      : kind === PICKER_KINDS.ABSOLUTE
      ? timeRange?.absolute ?? timeRange.timeRangeValue
      : kind === PICKER_KINDS.SINGLE
      ? timeRange?.single ?? timeRange.timeSingleValue
      : timeRange?.preset ?? timeRange.timeRangeValue;

  if (!value) {
    return { readableValue };
  }

  const returnValue = cloneDeep(timeRange);
  dayjs.extend(customParseFormat);

  switch (kind) {
    case PICKER_KINDS.RELATIVE: {
      let endDate = dayjs();
      if (value.relativeToWhen !== '') {
        endDate =
          value.relativeToWhen === RELATIVE_VALUES.YESTERDAY
            ? dayjs().add(-1, INTERVAL_VALUES.DAYS)
            : dayjs();
        // wait to parse it until fully typed
        if (value.relativeToTime.length === 5) {
          endDate = endDate.hour(Number(value.relativeToTime.split(':')[0]));
          endDate = endDate.minute(Number(value.relativeToTime.split(':')[1]));
        }

        const startDate = endDate
          .clone()
          .subtract(
            value.lastNumber,
            value.lastInterval ? value.lastInterval : INTERVAL_VALUES.MINUTES
          );
        if (!returnValue.relative) {
          returnValue.relative = {};
        }
        returnValue.relative.start = new Date(startDate.valueOf());
        returnValue.relative.end = new Date(endDate.valueOf());
        readableValue = `${dayjs(startDate).format(dateTimeMask)} ${toLabel} ${dayjs(
          endDate
        ).format(dateTimeMask)}`;
      }
      break;
    }
    case PICKER_KINDS.ABSOLUTE: {
      let startDate = dayjs(value.start ?? value.startDate);
      if (value.startTime) {
        const formatedStartTime = is24hours(dateTimeMask)
          ? value.startTime
          : format12hourTo24hour(value.startTime);
        startDate = startDate.hours(formatedStartTime.split(':')[0]);
        startDate = startDate.minutes(formatedStartTime.split(':')[1]);
      }
      if (!returnValue.absolute) {
        returnValue.absolute = {};
      }

      returnValue.absolute.start = new Date(startDate.valueOf());

      const startTimeValue = value.startTime
        ? `${dayjs(startDate).format(dateTimeMask)}`
        : `${dayjs(startDate).format(dateTimeMask)}`.split(' ')[0];
      if (value.end ?? value.endDate) {
        let endDate = dayjs(value.end ?? value.endDate);
        if (value.endTime) {
          const formatedEndTime = is24hours(dateTimeMask)
            ? value.endTime
            : format12hourTo24hour(value.endTime);
          endDate = endDate.hours(formatedEndTime.split(':')[0]);
          endDate = endDate.minutes(formatedEndTime.split(':')[1]);
        }

        const endTimeValue = value.endTime
          ? `${dayjs(endDate).format(dateTimeMask)}`
          : `${dayjs(endDate).format(dateTimeMask)}`.split(' ')[0];

        returnValue.absolute.end = new Date(endDate.valueOf());
        readableValue = `${startTimeValue} ${toLabel} ${endTimeValue}`;
      } else {
        readableValue = `${startTimeValue} ${toLabel} ${startTimeValue}`;
      }
      break;
    }
    case PICKER_KINDS.SINGLE: {
      // replace 'a' or 'A' in dateTimeMask to be consistent with time picker placeholder text
      const updatedDateTimeMask = dateTimeMask.replace(/a|A/, 'XM');
      if (!value.start && !value.startDate) {
        readableValue = updatedDateTimeMask;
        returnValue.single.start = null;
        break;
      }
      let startDate = dayjs(value.start ?? value.startDate);
      if (value.startTime) {
        const formatedStartTime = is24hours(dateTimeMask)
          ? value.startTime
          : format12hourTo24hour(value.startTime);
        startDate = startDate.hours(formatedStartTime.split(':')[0]);
        startDate = startDate.minutes(formatedStartTime.split(':')[1]);
      } else if (hasTimeInput) {
        returnValue.absolute.startTime = null;
        readableValue = updatedDateTimeMask;
        break;
      }
      returnValue.single.start = new Date(startDate.valueOf());
      readableValue = value.startTime
        ? `${dayjs(startDate).format(dateTimeMask)}`
        : `${dayjs(startDate).format(dateTimeMask)}`.split(' ')[0];
      break;
    }
    default:
      readableValue = value.label;
      break;
  }

  return { readableValue, ...returnValue };
};

/**
 * A hook to set the ref to the current date time pick and re-parent it based on V1/V2.
 *
 * @param {Object} object contains the ID of the current picker, and a bool if it's v2
 * @returns An array containing: [dateTimePickerRef (object ref to the picker), function (a callback for setting the element)]
 */
export const useDateTimePickerRef = ({ id, v2 = false }) => {
  const previousActiveElement = useRef(null);
  const [datePickerElem, setDatePickerElem] = useState(null);

  /**
   * A callback ref to capture the DateTime node. When a user changes from Relative to Absolute
   * the calendar would capture focus and move the users position adding confusion to where they
   * are on the page. This also checks if they're currently focused on the Absolute radio button
   * and captures it so focus can be restored after the calendar has been re-parented below.
   */
  const handleDatePickerRef = useCallback((node) => {
    if (
      node !== null &&
      node.calendar &&
      !node.calendar.isOpen &&
      previousActiveElement.current !== document.activeElement
    ) {
      previousActiveElement.current = document.activeElement;
      setDatePickerElem(node);
    }
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (datePickerElem?.calendar && datePickerElem.calendar.isOpen !== undefined) {
        datePickerElem.calendar.open();
        // while waiting for https://github.com/carbon-design-system/carbon/issues/5713
        // the only way to display the calendar inline is to re-parent its DOM to our component

        if (v2) {
          const dp = document.getElementById(`${id}-${iotPrefix}--date-time-picker__datepicker`);
          dp.appendChild(datePickerElem.calendar.calendarContainer);
        } else {
          const wrapper = document.getElementById(`${id}-${iotPrefix}--date-time-picker__wrapper`);

          if (typeof wrapper !== 'undefined' && wrapper !== null) {
            const dp = document
              .getElementById(`${id}-${iotPrefix}--date-time-picker__wrapper`)
              .getElementsByClassName(`${iotPrefix}--date-time-picker__datepicker`)[0];
            dp.appendChild(datePickerElem.calendar.calendarContainer);
          }
        }

        // if we were focused on the Absolute radio button previously, restore focus to it.
        /* istanbul ignore if */
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
          previousActiveElement.current = null;
        }
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [datePickerElem, id, v2]);

  return [datePickerElem, handleDatePickerRef];
};
/**
 * A helper to switch focus between start and end times when choosing absolute date/times in the calendar
 *
 * @param {Object} datePickerElem ref to current dateTimePicker element
 * @returns An array containing [bool (is the start date in focus), function (set the focus on the start field)]
 */
export const useDateTimePickerFocus = (datePickerElem) => {
  const [focusOnFirstField, setFocusOnFirstField] = useState(true);

  useEffect(() => {
    if (datePickerElem && datePickerElem.inputField && datePickerElem.toInputField) {
      if (focusOnFirstField) {
        datePickerElem.inputField.click();
      } else {
        datePickerElem.toInputField.click();
      }
    }
  }, [datePickerElem, focusOnFirstField]);

  return [focusOnFirstField, setFocusOnFirstField];
};

/**
 * Simple date/time validator
 *
 * @param {Date} date The date to check
 * @param {string} time The time string to check
 * @returns bool
 */
export const isValidDate = (date, time) => {
  const isValid24HoursRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  return date instanceof Date && !Number.isNaN(date) && isValid24HoursRegex.test(time);
};

/**
 * 12 hour time validator
 *
 * @param {string} time The time string to check
 * @returns bool
 */
export const isValid12HourTime = (time) => {
  const isValid12HoursRegex = /^((0[1-9])?|(1[0-2])?)*:[0-5][0-9] (AM|PM)$/;
  return isValid12HoursRegex.test(time) || time === '';
};

/**
 * 24 hour time validator
 *
 * @param {string} time The time string to check
 * @returns bool
 */
export const isValid24HourTime = (time) => {
  const isValid24HoursRegex = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
  return isValid24HoursRegex.test(time) || time === '';
};

/**
 * Simple function to handle keeping flatpickr open when it would normally close
 *
 * @param {*} range unused
 * @param {*} single unused
 * @param {class} flatpickr The flatpickr instance
 */
export const onDatePickerClose = (range, single, flatpickr) => {
  // force it to stay open
  /* istanbul ignore else */
  if (flatpickr) {
    flatpickr.open();
  }
};

// Validates absolute start date
export const invalidStartDate = (startTime, endTime, absoluteValues) => {
  // If start and end date have been selected
  const formatedStartTime = format12hourTo24hour(startTime);
  const formatedEndTime = format12hourTo24hour(endTime);
  if (
    absoluteValues.hasOwnProperty('start') &&
    absoluteValues.hasOwnProperty('end') &&
    isValidDate(new Date(absoluteValues.start), formatedStartTime)
  ) {
    const startDate = new Date(`${absoluteValues.startDate} ${formatedStartTime}`);
    const endDate = new Date(`${absoluteValues.endDate} ${formatedEndTime}`);
    return startDate >= endDate;
  }
  // Return invalid date if start time and end date not selected or if inputted time is not valid
  return true;
};

/**
 *
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} absoluteValues
 * @returns
 */
export const invalidEndDate = (startTime, endTime, absoluteValues) => {
  // If start and end date have been selected
  const formatedStartTime = format12hourTo24hour(startTime);
  const formatedEndTime = format12hourTo24hour(endTime);
  if (
    absoluteValues.hasOwnProperty('start') &&
    absoluteValues.hasOwnProperty('end') &&
    isValidDate(new Date(absoluteValues.end), formatedEndTime)
  ) {
    const startDate = new Date(`${absoluteValues.startDate} ${formatedStartTime}`);
    const endDate = new Date(`${absoluteValues.endDate} ${formatedEndTime}`);
    return startDate >= endDate;
  }

  // Return invalid date if start time and end date not selected or if inputted time is not valid
  return true;
};

/**
 * A DateTimePicker hook for handling all absolute time values
 *
 * @returns Object an object containing:
 *    absoluteValue (object): The currently selected absolute value
 *    setAbsoluteValue (function): Set the current absolute value
 *    absoluteStartTimeInvalid (bool): Is the start time invalid
 *    setAbsoluteStartTimeInvalid (function): Set the start time invalid
 *    absoluteEndTimeInvalid (bool): Is the end time invalid
 *    setAbsoluteEndTimeInvalid (function): Set the end time invalid
 *    onAbsoluteStartTimeChange (function): handles changes to start time
 *    onAbsoluteEndTimeChange (function): handles changes to end time
 *    resetAbsoluteValue (function): reset absolute value to empty defaults
 */
export const useAbsoluteDateTimeValue = () => {
  const [absoluteValue, setAbsoluteValue] = useState(null);
  const [absoluteStartTimeInvalid, setAbsoluteStartTimeInvalid] = useState(false);
  const [absoluteEndTimeInvalid, setAbsoluteEndTimeInvalid] = useState(false);

  // Util func to update the absolute value
  const changeAbsolutePropertyValue = (property, value) => {
    setAbsoluteValue((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const resetAbsoluteValue = () => {
    setAbsoluteValue({
      startDate: '',
      startTime: null,
      endDate: '',
      endTime: null,
    });
  };

  // on change functions that trigger a absolute value update
  const onAbsoluteStartTimeChange = (startTime, evt, meta) => {
    const { endTime } = absoluteValue;
    const invalidStart = invalidStartDate(startTime, endTime, absoluteValue);
    const invalidEnd = invalidEndDate(startTime, endTime, absoluteValue);
    setAbsoluteStartTimeInvalid(meta.invalid || invalidStart);
    setAbsoluteEndTimeInvalid(invalidEnd);
    changeAbsolutePropertyValue('startTime', startTime);
  };

  const onAbsoluteEndTimeChange = (endTime, evt, meta) => {
    const { startTime } = absoluteValue;
    const invalidEnd = invalidEndDate(startTime, endTime, absoluteValue);
    const invalidStart = invalidStartDate(startTime, endTime, absoluteValue);
    setAbsoluteEndTimeInvalid(meta.invalid || invalidEnd);
    setAbsoluteStartTimeInvalid(invalidStart);
    changeAbsolutePropertyValue('endTime', endTime);
  };

  return {
    absoluteValue,
    setAbsoluteValue,
    absoluteStartTimeInvalid,
    setAbsoluteStartTimeInvalid,
    absoluteEndTimeInvalid,
    setAbsoluteEndTimeInvalid,
    onAbsoluteStartTimeChange,
    onAbsoluteEndTimeChange,
    resetAbsoluteValue,
    changeAbsolutePropertyValue,
    format12hourTo24hour,
    isValid12HourTime,
    isValid24HourTime,
  };
};

/**
 * A DateTimePicker hook for handling all relative time values
 *
 * @param {object} object an object containing the interval and default relativeTo values for relative times
 * @returns Object an object containing:
 *    relativeValue (object): The currently set relative value object
 *    setRelativeValue (function): Set the current relative value
 *    relativeToTimeInvalid (bool): Is the current relative time invalid
 *    setRelativeToTimeInvalid (function): Set the current relative time invalid
 *    relativeLastNumberInvalid (bool): Is the relative last number invalid
 *    setRelativeLastNumberInvalid (function): Set the relative last number
 *    resetRelativeValue (function): Resets the relative value to empty defaults
 *    onRelativeLastNumberChange (function): handles changes to last number
 *    onRelativeLastIntervalChange (function): handles changes to interval
 *    onRelativeToWhenChange (function): handles changes to relative to when
 *    onRelativeToTimeChange (function): handles changes to relative to time
 */
export const useRelativeDateTimeValue = ({ defaultInterval, defaultRelativeTo }) => {
  const [relativeValue, setRelativeValue] = useState(null);
  const [relativeToTimeInvalid, setRelativeToTimeInvalid] = useState(false);
  const [relativeLastNumberInvalid, setRelativeLastNumberInvalid] = useState(false);

  const resetRelativeValue = () => {
    setRelativeValue({
      lastNumber: 0,
      lastInterval: defaultInterval,
      relativeToWhen: defaultRelativeTo,
      relativeToTime: '',
    });
  };

  // Util func to update the relative value
  const changeRelativePropertyValue = (property, value) => {
    setRelativeValue((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  // on change functions that trigger a relative value update
  const onRelativeLastNumberChange = (event, { value }) => {
    const valid = !event.currentTarget.getAttribute('data-invalid');
    setRelativeLastNumberInvalid(!valid);
    if (valid) {
      changeRelativePropertyValue('lastNumber', Number(value));
    }
  };
  const onRelativeLastIntervalChange = (event) => {
    changeRelativePropertyValue('lastInterval', event.currentTarget.value);
  };
  const onRelativeToWhenChange = (event) => {
    changeRelativePropertyValue('relativeToWhen', event.currentTarget.value);
  };
  const onRelativeToTimeChange = (pickerValue, evt, meta) => {
    setRelativeToTimeInvalid(meta.invalid);
    changeRelativePropertyValue('relativeToTime', pickerValue);
  };

  return {
    relativeValue,
    setRelativeValue,
    relativeToTimeInvalid,
    setRelativeToTimeInvalid,
    relativeLastNumberInvalid,
    setRelativeLastNumberInvalid,
    resetRelativeValue,
    onRelativeLastNumberChange,
    onRelativeLastIntervalChange,
    onRelativeToWhenChange,
    onRelativeToTimeChange,
  };
};

/**
 * Simple hook to change the type of DateTimePicker we're working with (relative or absolute)
 *
 * @param {boolean} showRelativeOption Are the relative options shown by default
 * @returns an array containing [string (current kind), function (set the current range type), function (handles changing the range kind)]
 */
export const useDateTimePickerRangeKind = (showRelativeOption) => {
  const [customRangeKind, setCustomRangeKind] = useState(
    showRelativeOption ? PICKER_KINDS.RELATIVE : PICKER_KINDS.ABSOLUTE
  );

  const onCustomRangeChange = (kind) => {
    setCustomRangeKind(kind);
  };

  return [customRangeKind, setCustomRangeKind, onCustomRangeChange];
};

/**
 * A hook handling interactions related to keyboard navigation and changing of the currently selected
 * DateTimePicker kind (relative/absolute)
 *
 * @param {boolean} showRelativeOption boolean determining if relative options are shown
 * @returns Object An object containing:
 *    presetListRef (Object): the ref to the preset div element
 *    isExpanded (boolean): is the DateTimePicker expanded
 *    setIsExpanded (function): set the isExpanded state
 *    getFocusableSiblings (function): return other focusable siblings from the presetListRef
 *    onFieldInteraction (function): handles changing expanded or focus state on different key presses
 *    onNavigateRadioButton (function): handles changing the focus state of the current radio button (relative/absolute)
 *    onNavigatePresets (function): handles changing the currently focuses preset as keyboard navigates
 */
export const useDateTimePickerKeyboardInteraction = ({ expanded, setCustomRangeKind }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const presetListRef = useRef(null);

  const getFocusableSiblings = () => {
    /* istanbul ignore else */
    if (presetListRef?.current) {
      const siblings = presetListRef.current.querySelectorAll('[tabindex]');
      return Array.from(siblings).filter(
        (sibling) => parseInt(sibling.getAttribute('tabindex'), 10) !== -1
      );
    }

    return [];
  };

  const onFieldInteraction = ({ key }) => {
    switch (key) {
      case 'Escape':
        setIsExpanded(false);
        break;
      // if the input box is focused and a down arrow is pressed this
      // moves focus to the first item in the preset list that has a tabindex
      case 'ArrowDown':
        /* istanbul ignore else */
        if (presetListRef?.current) {
          const listItems = getFocusableSiblings();
          /* istanbul ignore else */
          if (listItems?.[0]?.focus) {
            listItems[0].focus();
          }
        }
        break;
      default:
        setIsExpanded(!isExpanded);
        break;
    }
  };

  const onFieldClick = (e) => {
    if (e.target.innerText !== 'Apply') setIsExpanded(!isExpanded);
  };

  /**
   * Moves up the preset list to the previous focusable element or wraps around to the bottom
   * if already at the top.
   */
  const moveToPreviousElement = () => {
    const siblings = getFocusableSiblings();
    const index = siblings.findIndex((elem) => elem === document.activeElement);
    const previous = siblings[index - 1];
    if (previous) {
      previous.focus();
    } else {
      siblings[siblings.length - 1].focus();
    }
  };

  /**
   * Moves down the preset list to the next focusable element or wraps around to the top
   * if already at the bottom
   */
  const moveToNextElement = () => {
    const siblings = getFocusableSiblings();
    const index = siblings.findIndex((elem) => elem === document.activeElement);
    const next = siblings[index + 1];
    if (next) {
      next.focus();
    } else {
      siblings[0].focus();
    }
  };

  const onNavigatePresets = ({ key }) => {
    switch (key) {
      case 'ArrowUp':
        moveToPreviousElement();
        break;
      case 'ArrowDown':
        moveToNextElement();
        break;
      default:
        break;
    }
  };

  /**
   * Allows navigation back and forth between the radio buttons for Relative/Absolute
   *
   * @param {KeyboardEvent} e
   */
  const onNavigateRadioButton = (e) => {
    if (e.target.getAttribute('id').includes('absolute')) {
      setCustomRangeKind(PICKER_KINDS.RELATIVE);
      document.activeElement.parentNode.previousSibling
        .querySelector('input[type="radio"]')
        .focus();
    } else {
      setCustomRangeKind(PICKER_KINDS.ABSOLUTE);
      document.activeElement.parentNode.nextSibling.querySelector('input[type="radio"]').focus();
    }
  };

  return {
    presetListRef,
    isExpanded,
    setIsExpanded,
    getFocusableSiblings,
    onFieldInteraction,
    onNavigateRadioButton,
    onNavigatePresets,
    onFieldClick,
  };
};

/**
 * Get an alternative human readable value for a preset to show in tooltips and dropdown
 * ie. 'Last 30 minutes' displays '2020-04-01 11:30 to Now' on the tooltip
 * @param {Object} object an object containing:
 *    currentValue: the current picker value
 *    strings: i18n translation strings
 *    dateTimeMask: the current date/time string mask
 *    humanValue: the human readable string value for the current time
 *
 * @returns {string} an interval string, starting point in time to now
 */
export const getIntervalValue = ({ currentValue, mergedI18n, dateTimeMask, humanValue }) => {
  if (currentValue) {
    if (currentValue.kind === PICKER_KINDS.PRESET) {
      return `${dayjs().subtract(currentValue.preset.offset, 'minutes').format(dateTimeMask)} ${
        mergedI18n.toNowLabel
      }`;
    }
    return humanValue;
  }

  return '';
};

/**
 * Helper hook to open and close the tooltip as the DateTimePicker is opened and closed
 *
 * @param {Object} object An object telling the current state of the DateTimePicker being open
 * @returns Array an array containing [bool (is the tooltip open), func (function to toggle tooltip state)]
 */
export const useDateTimePickerTooltip = ({ isExpanded }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  /**
   * Shows and hides the tooltip with the humanValue (Relative) or full-range (Absolute) when
   * the user focuses or hovers on the input
   */
  const toggleTooltip = () => {
    if (isExpanded) {
      setIsTooltipOpen(false);
    } else {
      setIsTooltipOpen((prev) => !prev);
    }
  };

  return [isTooltipOpen, toggleTooltip, setIsTooltipOpen];
};

/**
 * Hook to validate event and invoke callback
 * @param {function} closeDropdownCallback: function that will be called if validation passes
 * @returns void
 */
export const useDateTimePickerClickOutside = (closeDropdownCallback, containerRef) => (evt) => {
  if (
    evt?.target.classList?.contains(`${iotPrefix}--date-time-picker__listitem--custom`) ||
    evt?.target.classList?.contains(`${iotPrefix}--date-time-picker__menu-btn-back`) ||
    evt?.target.classList?.contains(`${iotPrefix}--date-time-picker__menu-btn-reset`) ||
    evt?.target.classList?.contains(`${iotPrefix}--date-time-picker__menu-btn-cancel`) ||
    evt?.target.classList?.contains(`${iotPrefix}--date-time-picker__menu-btn-apply`)
  ) {
    return;
  }

  if (containerRef.current?.firstChild.contains(evt.target)) {
    closeDropdownCallback({ isEventOnField: true });
    return;
  }

  // Composed path is needed in order to detect if event is bubbled from TimePickerSpinner which is a React Portal
  if (
    evt.composed &&
    evt
      .composedPath()
      .some(
        (el) =>
          el.classList?.contains(`${iotPrefix}--time-picker-spinner`) ||
          el.classList?.contains(`${prefix}--date-picker__calendar`)
      )
  ) {
    return;
  }

  closeDropdownCallback({ isEventOnField: false });
};

/**
 * Utility function to get time picker kind key
 * @param {Object} object: an object containing:
 *   kind: time picker kind
 *   timeRangeKind: time range kind
 * @returns
 */
const getTimeRangeKindKey = ({ kind, timeRangeKind }) => {
  if (kind === PICKER_KINDS.SINGLE || timeRangeKind === PICKER_KINDS.SINGLE) {
    return 'timeSingleValue';
  }
  return 'timeRangeValue';
};

/**
 * Hook to close time picker dropdown and reset default value
 * @param {Object} object: an object containing:
 *   isExpanded: current state of the dropdown
 *   setIsExpanded: useState callback
 *   isCustomRange: if dropdown was opened in custom range
 *   setIsCustomRange: useState callback
 *   defaultValue: props value for time picker
 *   parseDefaultValue: parses value from string to time picker format
 *   setCustomRangeKind: useState callback
 *   lastAppliedValue: last saved value
 * @returns {function}
 */
export const useCloseDropdown = ({
  isExpanded,
  setIsExpanded,
  isCustomRange,
  setIsCustomRange,
  defaultValue,
  parseDefaultValue,
  setCustomRangeKind,
  lastAppliedValue,
  singleTimeValue,
  setSingleDateValue,
  setSingleTimeValue,
}) =>
  useCallback(
    ({ isEventOnField }) => {
      if (!isExpanded) {
        return;
      }

      if (!isEventOnField) {
        setIsExpanded(false);
      }

      // memoized value at the time when dropdown was opened
      if (!isCustomRange) {
        setIsCustomRange(false);
      }

      if (
        (lastAppliedValue?.timeRangeKind === PICKER_KINDS.SINGLE ||
          lastAppliedValue?.kind === PICKER_KINDS.SINGLE) &&
        !singleTimeValue
      ) {
        setSingleDateValue({ start: null, startDate: null });
        setSingleTimeValue(null);
        return;
      }

      if (lastAppliedValue) {
        setCustomRangeKind(lastAppliedValue.kind || lastAppliedValue.timeRangeKind);
        parseDefaultValue({
          ...lastAppliedValue,
          ...(!lastAppliedValue.timeRangeKind && {
            timeRangeKind: lastAppliedValue?.kind,
            [getTimeRangeKindKey(lastAppliedValue)]:
              lastAppliedValue[lastAppliedValue?.kind.toLowerCase()],
          }),
        });
      } else {
        setCustomRangeKind(defaultValue ? defaultValue.timeRangeKind : PICKER_KINDS.RELATIVE);
        parseDefaultValue(defaultValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultValue, isExpanded, setCustomRangeKind, setIsExpanded, lastAppliedValue]
  );

/**
 * For a given element, walk up the dom to find scroll container.
 * Only gets first as modals should prevent scrolling in elements above.
 * @param{element} element
 */
export const getScrollParent = (element) => {
  try {
    /* istanbul ignore next */
    if (
      element.scrollHeight > parseInt(element.clientHeight, 10) + 10 ||
      element.scrollWidth > parseInt(element.clientWidth, 10) + 10
    ) {
      const computedStyle = window.getComputedStyle(element);
      if (
        ['scroll', 'auto'].includes(computedStyle.overflowY) ||
        ['scroll', 'auto'].includes(computedStyle.overflow)
      ) {
        return element;
      }
    }
    if (element.parentElement) {
      return getScrollParent(element.parentElement);
    }
    return document.scrollingElement;
  } catch (error) {
    /* istanbul ignore next */
    return window;
  }
};

/**
 * A hook handling the height of the drop down menu
 *
 * @param {object} containerRef the ref to the container div of the drop down menu
 * @param {boolean} isSingleSelect if it is single select calendar
 * @param {boolean} isCustomRange if dropdown was opened in custom range
 * @param {boolean} showRelativeOption are the relative options shown by default
 * @param {string} customRangeKind custom range kind is either relative or absolute
 * @param {function} setIsExpanded set the isExpanded state
 * @returns Object An object containing:
 *    offTop (boolean): if the menu is off top
 *    offBottom (boolean): if the menu is off bottom
 *    inputTop (string) : the top position of the date time input
 *    inputBottom (string): the bottom position of the date time input
 *    customHeight (string): the adjusted height of the drop down menu if both offTop and offBottom are true
 *    maxHeight (string) : maximum height of the drop down menu
 */
export const useCustomHeight = ({
  containerRef,
  isSingleSelect,
  isCustomRange,
  showRelativeOption,
  customRangeKind,
  setIsExpanded,
}) => {
  // calculate max height for varies dropdown
  const presetMaxHeight = 315;
  const relativeMaxHeight = 200;
  const absoluteMaxHeight = 446;
  const singleMaxHeight = 442;
  const footerHeight = 40;
  const invalidDateWarningHeight = 38;
  const invalidTimeWarningHeight = 22;
  const relativeOptionHeight = 69;
  const timeInputHeight = 64;
  const maxHeight = isSingleSelect
    ? singleMaxHeight
    : isCustomRange
    ? (customRangeKind === PICKER_KINDS.ABSOLUTE ? absoluteMaxHeight : relativeMaxHeight) +
      (showRelativeOption ? relativeOptionHeight : 0)
    : presetMaxHeight;

  const closeDropDown = () => {
    setIsExpanded(false);
  };

  useEffect(() => {
    const firstScrollableParent = getScrollParent(containerRef.current);
    if (firstScrollableParent) {
      firstScrollableParent.addEventListener('scroll', closeDropDown);
    }
    window.addEventListener('scroll', closeDropDown);
    return () => {
      if (firstScrollableParent) {
        firstScrollableParent.removeEventListener('scroll', closeDropDown);
      }
      window.removeEventListener('scroll', closeDropDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-calculate window height when resize
  const [windowHeight, setWindowHeight] = useState(
    window.innerHeight || document.documentElement.clientHeight
  );

  const handleWindowResize = debounce(() => {
    setWindowHeight(window.innerHeight || document.documentElement.clientHeight);
  }, 50);

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [handleWindowResize]);

  // calculate if flyout menu will be off top or bottom of the screen
  const inputBottom = containerRef?.current?.getBoundingClientRect().bottom;
  const inputTop = containerRef?.current?.getBoundingClientRect().top;
  const flyoutMenuHeight = maxHeight + footerHeight;
  const offBottom = windowHeight - inputBottom < flyoutMenuHeight;
  const offTop = inputTop < flyoutMenuHeight;
  const topGap = inputTop;
  const bottomGap = windowHeight - inputBottom;

  const customHeight =
    offBottom && offTop ? (topGap > bottomGap ? topGap : bottomGap) - footerHeight : undefined;

  return [
    offTop,
    offBottom,
    inputTop,
    inputBottom,
    customHeight,
    maxHeight,
    invalidDateWarningHeight,
    invalidTimeWarningHeight,
    timeInputHeight,
  ];
};
