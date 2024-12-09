import React, { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  DatePicker,
  DatePickerInput,
  RadioButtonGroup,
  RadioButton,
  FormGroup,
  Select,
  SelectItem,
  NumberInput,
  OrderedList,
  ListItem,
  TooltipDefinition,
} from 'carbon-components-react';
import { Calendar16, WarningFilled16 } from '@carbon/icons-react';
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

import TimePickerSpinner from '../TimePickerSpinner/TimePickerSpinner';
import { settings } from '../../constants/Settings';
import dayjs, { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';
import { handleSpecificKeyDown, useOnClickOutside } from '../../utils/componentUtilityFunctions';
import { Tooltip } from '../Tooltip';

import {
  getIntervalValue,
  invalidEndDate,
  invalidStartDate,
  onDatePickerClose,
  parseValue,
  useAbsoluteDateTimeValue,
  useDateTimePickerFocus,
  useDateTimePickerKeyboardInteraction,
  useDateTimePickerRangeKind,
  useDateTimePickerRef,
  useDateTimePickerTooltip,
  useRelativeDateTimeValue,
  useCloseDropdown,
  useDateTimePickerClickOutside,
} from './dateTimePickerUtils';

const { iotPrefix, prefix } = settings;

export const PICKER_KINDS = {
  PRESET: 'PRESET',
  RELATIVE: 'RELATIVE',
  ABSOLUTE: 'ABSOLUTE',
};

export const PRESET_VALUES = [
  {
    id: 'item-01',
    label: 'Last 30 minutes',
    offset: 30,
  },
  {
    id: 'item-02',
    label: 'Last 1 hour',
    offset: 60,
  },
  {
    id: 'item-03',
    label: 'Last 6 hours',
    offset: 360,
  },
  {
    id: 'item-04',
    label: 'Last 12 hours',
    offset: 720,
  },
  {
    id: 'item-05',
    label: 'Last 24 hours',
    offset: 1440,
  },
];

export const INTERVAL_VALUES = {
  MINUTES: 'MINUTES',
  HOURS: 'HOURS',
  DAYS: 'DAYS',
  WEEKS: 'WEEKS',
  MONTHS: 'MONTHS',
  YEARS: 'YEARS',
};
export const RELATIVE_VALUES = {
  YESTERDAY: 'YESTERDAY',
  TODAY: 'TODAY',
};

const propTypes = {
  testId: PropTypes.string,
  /** default value for the picker */
  defaultValue: PropTypes.oneOfType([
    PropTypes.exact({
      timeRangeKind: PropTypes.oneOf([PICKER_KINDS.PRESET]).isRequired,
      timeRangeValue: PropTypes.exact({
        id: PropTypes.string,
        label: PropTypes.string.isRequired,
        offset: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    PropTypes.exact({
      timeRangeKind: PropTypes.oneOf([PICKER_KINDS.RELATIVE]).isRequired,
      timeRangeValue: PropTypes.exact({
        lastNumber: PropTypes.number.isRequired,
        lastInterval: PropTypes.string.isRequired,
        relativeToWhen: PropTypes.string.isRequired,
        relativeToTime: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    PropTypes.exact({
      timeRangeKind: PropTypes.oneOf([PICKER_KINDS.ABSOLUTE]).isRequired,
      timeRangeValue: PropTypes.exact({
        startDate: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        /** Can be a full parsable DateTime string or a Date object */
        start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        /** Can be a full parsable DateTime string or a Date object */
        end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        endDate: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  ]),
  /** the dayjs.js format for the human readable interval value */
  dateTimeMask: PropTypes.string,
  /** a list of options to for the default presets */
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      offset: PropTypes.number,
      id: PropTypes.string,
    })
  ),
  /** a list of options to put on the 'Last' interval dropdown */
  intervals: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  /** a list of options to put on the 'Relative to' dropdown */
  relatives: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  /** show the picker in the expanded state */
  expanded: PropTypes.bool,
  /** disable the input */
  disabled: PropTypes.bool,
  /** specify the input in invalid state */
  invalid: PropTypes.bool,
  /** show the relative custom range picker */
  showRelativeOption: PropTypes.bool,
  /** show the custom range link */
  showCustomRangeLink: PropTypes.bool,
  /** show time input fields */
  hasTimeInput: PropTypes.bool,
  /**
   * Function hook used to provide the appropriate tooltip content for the preset time
   * picker. This function takes in the currentValue and should return a string message.
   */
  renderPresetTooltipText: PropTypes.func,
  /** triggered on cancel */
  onCancel: PropTypes.func,
  /** triggered on apply with returning object with similar signature to defaultValue */
  onApply: PropTypes.func,
  /** All the labels that need translation */
  i18n: PropTypes.shape({
    toLabel: PropTypes.string,
    toNowLabel: PropTypes.string,
    calendarLabel: PropTypes.string,
    invalidLabel: PropTypes.string,
    presetLabels: PropTypes.arrayOf(PropTypes.string),
    intervalLabels: PropTypes.arrayOf(PropTypes.string),
    relativeLabels: PropTypes.arrayOf(PropTypes.string),
    customRangeLinkLabel: PropTypes.string,
    customRangeLabel: PropTypes.string,
    relativeLabel: PropTypes.string,
    lastLabel: PropTypes.string,
    invalidNumberLabel: PropTypes.string,
    relativeToLabel: PropTypes.string,
    absoluteLabel: PropTypes.string,
    startTimeLabel: PropTypes.string,
    endTimeLabel: PropTypes.string,
    applyBtnLabel: PropTypes.string,
    cancelBtnLabel: PropTypes.string,
    backBtnLabel: PropTypes.string,
    increment: PropTypes.string,
    decrement: PropTypes.string,
    hours: PropTypes.string,
    minutes: PropTypes.string,
    number: PropTypes.string,
    invalidText: PropTypes.string,
  }),
  /** Light version  */
  light: PropTypes.bool,
  /** The language locale used to format the days of the week, months, and numbers. */
  locale: PropTypes.string,
  /** Unique id of the component */
  id: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  testId: 'date-time-picker',
  defaultValue: null,
  dateTimeMask: DAYJS_INPUT_FORMATS.RANGE,
  presets: PRESET_VALUES,
  intervals: [
    {
      label: 'minutes',
      value: INTERVAL_VALUES.MINUTES,
    },
    {
      label: 'hours',
      value: INTERVAL_VALUES.HOURS,
    },
    {
      label: 'days',
      value: INTERVAL_VALUES.DAYS,
    },
    {
      label: 'weeks',
      value: INTERVAL_VALUES.WEEKS,
    },
    {
      label: 'months',
      value: INTERVAL_VALUES.MONTHS,
    },
    {
      label: 'years',
      value: INTERVAL_VALUES.YEARS,
    },
  ],
  relatives: [
    {
      label: 'Today',
      value: RELATIVE_VALUES.TODAY,
    },
    {
      label: 'Yesterday',
      value: RELATIVE_VALUES.YESTERDAY,
    },
  ],
  expanded: false,
  disabled: false,
  invalid: false,
  showRelativeOption: true,
  showCustomRangeLink: true,
  hasTimeInput: true,
  renderPresetTooltipText: null,
  onCancel: null,
  onApply: null,
  i18n: {
    toLabel: 'to',
    toNowLabel: 'to Now',
    calendarLabel: 'Calendar',
    invalidLabel: 'Invalid',
    presetLabels: [
      'Last 30 minutes',
      'Last 1 hour',
      'Last 6 hours',
      'Last 12 hours',
      'Last 24 hours',
    ],
    intervalLabels: ['minutes', 'hours', 'days', 'weeks', 'months', 'years'],
    relativeLabels: ['Today', 'Yesterday'],
    customRangeLinkLabel: 'Custom Range',
    customRangeLabel: 'Custom range',
    relativeLabel: 'Relative',
    lastLabel: 'Last',
    invalidNumberLabel: 'Number is not valid',
    relativeToLabel: 'Relative to',
    absoluteLabel: 'Absolute',
    startTimeLabel: 'Start time',
    endTimeLabel: 'End time',
    applyBtnLabel: 'Apply',
    cancelBtnLabel: 'Cancel',
    backBtnLabel: 'Back',
    increment: 'Increment',
    decrement: 'Decrement',
    hours: 'hours',
    minutes: 'minutes',
    number: 'number',
    invalidText: 'The date time entered is invalid',
  },
  light: false,
  locale: 'en',
  id: undefined,
  style: {},
};

const dateTimePickerId = uuidv4();

const DateTimePicker = ({
  testId,
  defaultValue,
  dateTimeMask,
  presets,
  intervals,
  relatives,
  expanded,
  disabled,
  invalid,
  showRelativeOption,
  showCustomRangeLink,
  hasTimeInput,
  renderPresetTooltipText,
  onCancel,
  onApply,
  i18n,
  light,
  locale,
  id = dateTimePickerId,
  style,
  ...others
}) => {
  const mergedI18n = {
    ...defaultProps.i18n,
    ...i18n,
  };

  dayjs.locale(locale);

  // State
  const [customRangeKind, setCustomRangeKind, onCustomRangeChange] =
    useDateTimePickerRangeKind(showRelativeOption);
  const {
    isExpanded,
    setIsExpanded,
    presetListRef,
    onFieldInteraction,
    onNavigateRadioButton,
    onNavigatePresets,
  } = useDateTimePickerKeyboardInteraction({ expanded, setCustomRangeKind });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [lastAppliedValue, setLastAppliedValue] = useState(null);
  const [humanValue, setHumanValue] = useState(null);
  const [invalidState, setInvalidState] = useState(invalid);

  const relativeSelect = useRef(null);
  const dropdownRef = useRef(null);
  const fieldRef = useRef(null);
  const updatedStyle = useMemo(() => ({ ...style, '--zIndex': style.zIndex ?? 0 }), [style]);
  const [datePickerElem, pickerRefCallback] = useDateTimePickerRef({ id });
  const [focusOnFirstField, setFocusOnFirstField] = useDateTimePickerFocus(datePickerElem);
  const {
    absoluteValue,
    setAbsoluteValue,
    absoluteStartTimeInvalid,
    setAbsoluteStartTimeInvalid,
    absoluteEndTimeInvalid,
    setAbsoluteEndTimeInvalid,
    onAbsoluteStartTimeChange,
    onAbsoluteEndTimeChange,
    resetAbsoluteValue,
  } = useAbsoluteDateTimeValue();
  const {
    relativeValue,
    setRelativeValue,
    relativeToTimeInvalid,
    resetRelativeValue,
    relativeLastNumberInvalid,
    onRelativeLastNumberChange,
    onRelativeLastIntervalChange,
    onRelativeToWhenChange,
    onRelativeToTimeChange,
  } = useRelativeDateTimeValue({
    defaultInterval: intervals[0].value,
    defaultRelativeTo: relatives[0].value,
  });
  const [isTooltipOpen, toggleTooltip, setIsTooltipOpen] = useDateTimePickerTooltip({ isExpanded });

  const dateTimePickerBaseValue = {
    kind: '',
    preset: {
      id: presets[0].id,
      label: presets[0].label,
      offset: presets[0].offset,
    },
    relative: {
      lastNumber: null,
      lastInterval: intervals[0].value,
      relativeToWhen: relatives[0].value,
      relativeToTime: null,
    },
    absolute: {
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
    },
  };

  /**
   * Transforms a default or selected value into a full blown returnable object
   * @param {Object} [preset] clicked preset
   * @param {string} preset.label preset label
   * @param {number} preset.offset preset offset in minutes
   * @returns {Object} the augmented value itself and the human readable value
   */
  const renderValue = (clickedPreset = null) => {
    const value = { ...dateTimePickerBaseValue };
    if (isCustomRange) {
      if (customRangeKind === PICKER_KINDS.RELATIVE) {
        value.relative = relativeValue;
      } else {
        value.absolute = absoluteValue;
      }
      value.kind = customRangeKind;
    } else {
      const preset = presets
        .filter((p) => {
          let filteredPreset;
          if (p.id) {
            filteredPreset = p.id === (clickedPreset ? clickedPreset.id : selectedPreset);
          } else {
            filteredPreset = p.offset === (clickedPreset ? clickedPreset.offset : selectedPreset);
          }
          return filteredPreset;
        })
        .pop();
      value.preset = preset;
      value.kind = PICKER_KINDS.PRESET;
    }

    setCurrentValue(value);
    const parsedValue = parseValue(value, dateTimeMask, mergedI18n.toLabel);
    setHumanValue(parsedValue.readableValue);

    return {
      ...value,
      ...parsedValue,
    };
  };

  useEffect(
    () => {
      if (absoluteValue || relativeValue) {
        renderValue();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [absoluteValue, relativeValue]
  );

  const onDatePickerChange = ([start, end], _, flatpickr) => {
    const calendarInFocus = document.activeElement.closest(
      `.${iotPrefix}--date-time-picker__datepicker`
    );

    const daysDidntChange =
      dayjs(absoluteValue.start).isSame(dayjs(start)) &&
      dayjs(absoluteValue.end).isSame(dayjs(end));

    if (daysDidntChange || !calendarInFocus) {
      // jump back to start to fix bug where flatpickr will change the month to the start
      // after it loses focus if you click outside the calendar
      if (focusOnFirstField) {
        flatpickr.jumpToDate(start);
      } else {
        flatpickr.jumpToDate(end);
      }

      // In some situations, when the calendar loses focus flatpickr is firing the onChange event
      // twice, but the dates reset to where both start and end are the same. This fixes that.
      if (!calendarInFocus && dayjs(start).isSame(dayjs(end))) {
        flatpickr.setDate([absoluteValue.start, absoluteValue.end]);
      }
      return;
    }

    const newAbsolute = { ...absoluteValue };
    newAbsolute.start = start;
    newAbsolute.startDate = dayjs(newAbsolute.start).format('MM/DD/YYYY');
    const prevFocusOnFirstField = focusOnFirstField;
    if (end) {
      setFocusOnFirstField(!focusOnFirstField);
      newAbsolute.start = start;
      newAbsolute.startDate = dayjs(newAbsolute.start).format('MM/DD/YYYY');
      newAbsolute.end = end;
      newAbsolute.endDate = dayjs(newAbsolute.end).format('MM/DD/YYYY');
      if (prevFocusOnFirstField) {
        flatpickr.jumpToDate(newAbsolute.start);
      } else {
        flatpickr.jumpToDate(newAbsolute.end);
      }
    } else {
      setFocusOnFirstField(false);
      flatpickr.jumpToDate(newAbsolute.start);
    }

    setAbsoluteValue(newAbsolute);

    // Update end and start time invalid state when date changed
    setAbsoluteEndTimeInvalid(
      invalidEndDate(newAbsolute.startTime, newAbsolute.endTime, newAbsolute)
    );
    setAbsoluteStartTimeInvalid(
      invalidStartDate(newAbsolute.startTime, newAbsolute.endTime, newAbsolute)
    );
  };

  const onPresetClick = (preset) => {
    setSelectedPreset(preset.id ?? preset.offset);
    renderValue(preset);
  };

  const parseDefaultValue = (parsableValue) => {
    const currentCustomRangeKind = showRelativeOption
      ? PICKER_KINDS.RELATIVE
      : PICKER_KINDS.ABSOLUTE;
    if (parsableValue !== null) {
      if (parsableValue.timeRangeKind === PICKER_KINDS.PRESET) {
        // preset
        resetAbsoluteValue();
        resetRelativeValue();
        setCustomRangeKind(currentCustomRangeKind);
        onPresetClick(parsableValue.timeRangeValue);
      }
      if (parsableValue.timeRangeKind === PICKER_KINDS.RELATIVE) {
        // relative
        resetAbsoluteValue();
        setIsCustomRange(true);
        setCustomRangeKind(currentCustomRangeKind);
        setRelativeValue(parsableValue.timeRangeValue);
      }

      if (parsableValue.timeRangeKind === PICKER_KINDS.ABSOLUTE) {
        // absolute
        const absolute = { ...parsableValue.timeRangeValue };
        resetRelativeValue();
        setIsCustomRange(true);
        setCustomRangeKind(PICKER_KINDS.ABSOLUTE);
        if (!absolute.hasOwnProperty('start')) {
          absolute.start = dayjs(`${absolute.startDate} ${absolute.startTime}`).valueOf();
        }
        if (!absolute.hasOwnProperty('end')) {
          absolute.end = dayjs(`${absolute.endDate} ${absolute.endTime}`).valueOf();
        }
        absolute.startDate = dayjs(absolute.start).format('MM/DD/YYYY');
        absolute.startTime = dayjs(absolute.start).format('HH:mm');
        absolute.endDate = dayjs(absolute.end).format('MM/DD/YYYY');
        absolute.endTime = dayjs(absolute.end).format('HH:mm');
        setAbsoluteValue(absolute);
      }
    } else {
      resetAbsoluteValue();
      resetRelativeValue();
      setCustomRangeKind(currentCustomRangeKind);
      onPresetClick(presets[0]);
    }
  };

  const closeDropdown = useCloseDropdown({
    isExpanded,
    isCustomRange,
    setIsCustomRange,
    setIsExpanded,
    parseDefaultValue,
    defaultValue,
    setCustomRangeKind,
    lastAppliedValue,
  });

  const onClickOutside = useDateTimePickerClickOutside(closeDropdown, fieldRef);

  useOnClickOutside(dropdownRef, onClickOutside);

  // Close tooltip if dropdown was closed by click outside
  const onFieldBlur = (evt) => {
    if (evt.target !== evt.currentTarget) {
      setIsTooltipOpen(false);
    }
  };

  const toggleIsCustomRange = () => {
    setIsCustomRange(!isCustomRange);

    // If value was changed reset when going back to Preset
    if (absoluteValue.startDate !== '' || relativeValue.lastNumber > 0) {
      if (selectedPreset) {
        onPresetClick(presets.filter((p) => p.id ?? p.offset === selectedPreset)[0]);
        resetAbsoluteValue();
        resetRelativeValue();
      } else {
        onPresetClick(presets[0]);
        resetAbsoluteValue();
        resetRelativeValue();
      }
    }
  };

  useEffect(
    () => {
      /* istanbul ignore else */
      if (defaultValue || humanValue === null) {
        parseDefaultValue(defaultValue);
        setLastAppliedValue(defaultValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultValue]
  );

  const onCancelClick = () => {
    setIsExpanded(false);
    parseDefaultValue(lastAppliedValue);

    /* istanbul ignore else */
    if (onCancel) {
      onCancel();
    }
  };

  const onApplyClick = () => {
    setIsExpanded(false);
    const value = renderValue();
    setLastAppliedValue(value);
    const returnValue = {
      timeRangeKind: value.kind,
      timeRangeValue: null,
    };
    switch (value.kind) {
      case PICKER_KINDS.ABSOLUTE:
        returnValue.timeRangeValue = value.absolute;
        break;
      case PICKER_KINDS.RELATIVE:
        returnValue.timeRangeValue = value.relative;
        break;
      default:
        returnValue.timeRangeValue = value.preset;
        break;
    }

    if (onApply) {
      onApply(returnValue);
    }
  };

  const tooltipValue = renderPresetTooltipText
    ? renderPresetTooltipText(currentValue)
    : getIntervalValue({ currentValue, mergedI18n, dateTimeMask, humanValue });

  const disableRelativeApply =
    isCustomRange &&
    customRangeKind === PICKER_KINDS.RELATIVE &&
    (relativeLastNumberInvalid || relativeToTimeInvalid);

  const disableAbsoluteApply =
    isCustomRange &&
    customRangeKind === PICKER_KINDS.ABSOLUTE &&
    (absoluteStartTimeInvalid ||
      absoluteEndTimeInvalid ||
      (absoluteValue.startDate === '' && absoluteValue.endDate === '') ||
      (hasTimeInput ? !absoluteValue.startTime || !absoluteValue.endTime : false));

  const disableApply = disableRelativeApply || disableAbsoluteApply;

  useEffect(() => setInvalidState(invalid || disableApply), [invalid, disableApply]);

  return (
    // Escape handler added to allow pressing escape to close the picker from any via event bubbling
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-testid={testId}
      id={`${id}-${iotPrefix}--date-time-picker__wrapper`}
      className={classnames(`${iotPrefix}--date-time-picker__wrapper`, {
        [`${iotPrefix}--date-time-picker__wrapper--disabled`]: disabled,
      })}
      onKeyDown={handleSpecificKeyDown(['Escape'], () => setIsExpanded(false))}
      ref={fieldRef}
    >
      <div
        className={classnames(`${iotPrefix}--date-time-picker__box`, {
          [`${iotPrefix}--date-time-picker__box--light`]: light,
          [`${iotPrefix}--date-time-picker__box--invalid`]: invalidState,
          [`${iotPrefix}--date-time-picker__box--disabled`]: disabled,
        })}
      >
        <div
          data-testid={`${testId}__field`}
          className={classnames(`${iotPrefix}--date-time-picker__field`, {
            [`${iotPrefix}--date-time-picker__field--disabled`]: disabled,
          })}
          role="button"
          onClick={onFieldInteraction}
          /* using on onKeyUp b/c something is preventing onKeyDown from firing with 'Enter' when the calendar is displayed */
          onKeyUp={handleSpecificKeyDown(['Enter', ' ', 'Escape', 'ArrowDown'], onFieldInteraction)}
          onFocus={toggleTooltip}
          onBlur={onFieldBlur}
          onMouseEnter={toggleTooltip}
          onMouseLeave={toggleTooltip}
          tabIndex={0}
        >
          {isExpanded || (currentValue && currentValue.kind !== PICKER_KINDS.PRESET) ? (
            <span
              className={classnames({
                [`${iotPrefix}--date-time-picker__disabled`]: disabled,
              })}
              title={humanValue}
            >
              {humanValue}
            </span>
          ) : humanValue ? (
            <TooltipDefinition
              align="center"
              direction="bottom"
              tooltipText={tooltipValue}
              triggerClassName={disabled ? `${iotPrefix}--date-time-picker__disabled` : ''}
            >
              {humanValue}
            </TooltipDefinition>
          ) : null}
          {invalidState ? (
            <WarningFilled16
              data-testid={`${testId}__invalid-icon`}
              aria-label={mergedI18n.invalidLabel}
              className={classnames(
                `${iotPrefix}--date-time-picker__icon`,
                `${iotPrefix}--date-time-picker__icon--invalid`
              )}
            />
          ) : (
            <Calendar16
              aria-label={mergedI18n.calendarLabel}
              className={classnames(`${iotPrefix}--date-time-picker__icon`, {
                [`${iotPrefix}--date-time-picker__icon--disabled`]: disabled,
              })}
            />
          )}
          {!isExpanded && isTooltipOpen ? (
            <Tooltip
              open={isTooltipOpen}
              showIcon={false}
              focusTrap={false}
              triggerClassName={`${iotPrefix}--date-time-picker__tooltip-trigger`}
              className={`${iotPrefix}--date-time-picker__tooltip`}
            >
              {tooltipValue}
            </Tooltip>
          ) : null}
        </div>
        <div
          className={classnames(`${iotPrefix}--date-time-picker__menu`, {
            [`${iotPrefix}--date-time-picker__menu-expanded`]: isExpanded,
          })}
          style={{ ...updatedStyle }}
          role="listbox"
          ref={dropdownRef}
        >
          <div className={`${iotPrefix}--date-time-picker__menu-scroll`}>
            {!isCustomRange ? (
              // Catch bubbled Up/Down keys from the preset list and move focus.
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                ref={presetListRef}
                onKeyDown={handleSpecificKeyDown(['ArrowUp', 'ArrowDown'], onNavigatePresets)}
              >
                <OrderedList nested={false}>
                  {tooltipValue ? (
                    <ListItem
                      className={`${iotPrefix}--date-time-picker__listitem ${iotPrefix}--date-time-picker__listitem--current`}
                    >
                      {tooltipValue}
                    </ListItem>
                  ) : null}
                  {showCustomRangeLink ? (
                    <ListItem
                      onClick={toggleIsCustomRange}
                      onKeyDown={handleSpecificKeyDown(['Enter', ' '], toggleIsCustomRange)}
                      className={`${iotPrefix}--date-time-picker__listitem ${iotPrefix}--date-time-picker__listitem--custom`}
                      tabIndex={0}
                    >
                      {mergedI18n.customRangeLinkLabel}
                    </ListItem>
                  ) : null}
                  {presets.map((preset, i) => {
                    return (
                      <ListItem
                        key={i}
                        onClick={() => onPresetClick(preset)}
                        onKeyDown={handleSpecificKeyDown(['Enter', ' '], () =>
                          onPresetClick(preset)
                        )}
                        tabIndex={0}
                        className={classnames(
                          `${iotPrefix}--date-time-picker__listitem ${iotPrefix}--date-time-picker__listitem--preset`,
                          {
                            [`${iotPrefix}--date-time-picker__listitem--preset-selected`]:
                              selectedPreset === (preset.id ?? preset.offset),
                          }
                        )}
                      >
                        {mergedI18n.presetLabels[i] || preset.label}
                      </ListItem>
                    );
                  })}
                </OrderedList>
              </div>
            ) : (
              <div className={`${iotPrefix}--date-time-picker__custom-wrapper`}>
                {showRelativeOption ? (
                  <FormGroup
                    legendText={mergedI18n.customRangeLabel}
                    className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                  >
                    <RadioButtonGroup
                      valueSelected={customRangeKind}
                      onChange={onCustomRangeChange}
                      name={`${id}-radiogroup`}
                    >
                      <RadioButton
                        value={PICKER_KINDS.RELATIVE}
                        id={`${id}-relative`}
                        labelText={mergedI18n.relativeLabel}
                        onKeyDown={handleSpecificKeyDown(
                          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
                          onNavigateRadioButton
                        )}
                      />
                      <RadioButton
                        value={PICKER_KINDS.ABSOLUTE}
                        id={`${id}-absolute`}
                        labelText={mergedI18n.absoluteLabel}
                        onKeyDown={handleSpecificKeyDown(
                          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
                          onNavigateRadioButton
                        )}
                      />
                    </RadioButtonGroup>
                  </FormGroup>
                ) : null}
                {showRelativeOption && customRangeKind === PICKER_KINDS.RELATIVE ? (
                  <div>
                    <FormGroup
                      legendText={mergedI18n.lastLabel}
                      className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                    >
                      <div
                        className={classnames(
                          `${iotPrefix}--date-time-picker__fields-wrapper`,
                          `${iotPrefix}--date-time-picker__fields-wrapper--with-gap`
                        )}
                      >
                        <NumberInput
                          id={`${id}-last-number`}
                          invalidText={mergedI18n.invalidNumberLabel}
                          step={1}
                          min={0}
                          light
                          value={relativeValue ? relativeValue.lastNumber : 0}
                          onChange={onRelativeLastNumberChange}
                          translateWithId={(messageId) =>
                            messageId === 'increment.number'
                              ? `${mergedI18n.increment} ${mergedI18n.number}`
                              : messageId === 'decrement.number'
                              ? `${mergedI18n.decrement} ${mergedI18n.number}`
                              : null
                          }
                        />
                        <Select
                          {...others}
                          id={`${id}-last-interval`}
                          light
                          defaultValue={
                            relativeValue ? relativeValue.lastInterval : INTERVAL_VALUES.MINUTES
                          }
                          onChange={onRelativeLastIntervalChange}
                          hideLabel
                        >
                          {intervals.map((interval, i) => {
                            return (
                              <SelectItem
                                key={i}
                                value={interval.value}
                                text={mergedI18n.intervalLabels[i] || interval.label}
                              />
                            );
                          })}
                        </Select>
                      </div>
                    </FormGroup>
                    <FormGroup
                      legendText={mergedI18n.relativeToLabel}
                      className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                    >
                      <div
                        className={classnames(
                          `${iotPrefix}--date-time-picker__fields-wrapper`,
                          `${iotPrefix}--date-time-picker__fields-wrapper--with-gap`,
                          {
                            [`${iotPrefix}--date-time-picker__fields-wrapper--without-time`]:
                              !hasTimeInput,
                          }
                        )}
                      >
                        <Select
                          {...others}
                          ref={relativeSelect}
                          id={`${id}-relative-to-when`}
                          light
                          defaultValue={relativeValue ? relativeValue.relativeToWhen : ''}
                          onChange={onRelativeToWhenChange}
                          hideLabel
                        >
                          {relatives.map((relative, i) => {
                            return (
                              <SelectItem
                                key={i}
                                value={relative.value}
                                text={
                                  mergedI18n.relativeLabels.filter(
                                    (x) => x === relative.label
                                  )[0] || relative.label
                                }
                              />
                            );
                          })}
                        </Select>
                        {hasTimeInput ? (
                          <TimePickerSpinner
                            key={`${id}-relative-to-time`}
                            id={`${id}-relative-to-time`}
                            invalid={relativeToTimeInvalid}
                            value={relativeValue ? relativeValue.relativeToTime : ''}
                            i18n={i18n}
                            light
                            onChange={onRelativeToTimeChange}
                            spinner
                            autoComplete="off"
                          />
                        ) : null}
                      </div>
                    </FormGroup>
                  </div>
                ) : (
                  <div data-testid={`${testId}-datepicker`}>
                    <div className={`${iotPrefix}--date-time-picker__datepicker`}>
                      <DatePicker
                        datePickerType="range"
                        dateFormat="m/d/Y"
                        ref={pickerRefCallback}
                        onChange={onDatePickerChange}
                        onClose={onDatePickerClose}
                        value={
                          absoluteValue ? [absoluteValue.startDate, absoluteValue.endDate] : ''
                        }
                        locale={locale.split('-')[0]}
                      >
                        <DatePickerInput
                          labelText=""
                          id={`${id}-date-picker-input-start`}
                          hideLabel
                        />
                        <DatePickerInput
                          labelText=""
                          id={`${id}-date-picker-input-end`}
                          hideLabel
                        />
                      </DatePicker>
                    </div>
                    {hasTimeInput ? (
                      <FormGroup
                        legendText=""
                        className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                      >
                        <div className={`${iotPrefix}--date-time-picker__fields-wrapper`}>
                          <TimePickerSpinner
                            id={`${id}-start-time`}
                            invalid={absoluteStartTimeInvalid}
                            labelText={mergedI18n.startTimeLabel}
                            value={absoluteValue ? absoluteValue.startTime : null}
                            i18n={i18n}
                            onChange={onAbsoluteStartTimeChange}
                            spinner
                            light
                            autoComplete="off"
                          />
                          <TimePickerSpinner
                            id={`${id}-end-time`}
                            invalid={absoluteEndTimeInvalid}
                            labelText={mergedI18n.endTimeLabel}
                            value={absoluteValue ? absoluteValue.endTime : null}
                            i18n={i18n}
                            onChange={onAbsoluteEndTimeChange}
                            spinner
                            light
                            autoComplete="off"
                          />
                        </div>
                      </FormGroup>
                    ) : (
                      <div className={`${iotPrefix}--date-time-picker__no-formgroup`} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`${iotPrefix}--date-time-picker__menu-btn-set`}>
            {isCustomRange ? (
              <Button
                kind="secondary"
                className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-back`}
                size="field"
                {...others}
                onClick={toggleIsCustomRange}
                /* using on onKeyUp b/c something is preventing onKeyDown from firing with 'Enter' when the calendar is displayed */
                onKeyUp={handleSpecificKeyDown(['Enter', ' '], toggleIsCustomRange)}
              >
                {mergedI18n.backBtnLabel}
              </Button>
            ) : (
              <Button
                kind="secondary"
                className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-cancel`}
                size="field"
                {...others}
                onClick={onCancelClick}
                /* using on onKeyUp b/c something is preventing onKeyDown from firing with 'Enter' when the calendar is displayed */
                onKeyUp={handleSpecificKeyDown(['Enter', ' '], onCancelClick)}
              >
                {mergedI18n.cancelBtnLabel}
              </Button>
            )}
            <Button
              kind="primary"
              className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-apply`}
              {...others}
              onClick={onApplyClick}
              /* using on onKeyUp b/c something is preventing onKeyDown from firing with 'Enter' when the calendar is displayed */
              onKeyUp={handleSpecificKeyDown(['Enter', ' '], onApplyClick)}
              size="field"
              disabled={disableApply}
            >
              {mergedI18n.applyBtnLabel}
            </Button>
          </div>
        </div>
      </div>
      {invalidState ? (
        <p
          className={classnames(
            `${prefix}--form__helper-text`,
            `${iotPrefix}--date-time-picker__helper-text--invalid`
          )}
        >
          {mergedI18n.invalidText}
        </p>
      ) : null}
    </div>
  );
};

DateTimePicker.propTypes = propTypes;
DateTimePicker.defaultProps = defaultProps;

export default DateTimePicker;
