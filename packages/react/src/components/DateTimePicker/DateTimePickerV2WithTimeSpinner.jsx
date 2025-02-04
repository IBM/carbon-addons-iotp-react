import React, { useEffect, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
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
} from '@carbon/react';
import { Calendar, WarningFilled, ErrorFilled } from '@carbon/react/icons';
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import warning from 'warning';
import { useLangDirection } from 'use-lang-direction';

import TimePickerSpinner from '../TimePickerSpinner/TimePickerSpinner';
import TimePickerDropdown from '../TimePicker/TimePickerDropdown';
import { settings } from '../../constants/Settings';
import dayjs, { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';
import {
  PICKER_KINDS,
  PRESET_VALUES,
  INTERVAL_VALUES,
  RELATIVE_VALUES,
} from '../../constants/DateConstants';
import Button from '../Button/Button';
import FlyoutMenu, { FlyoutMenuButtonSize, FlyoutMenuDirection } from '../FlyoutMenu/FlyoutMenu';
import { handleSpecificKeyDown, useOnClickOutside } from '../../utils/componentUtilityFunctions';

import {
  getIntervalValue,
  invalidEndDate,
  invalidStartDate,
  parseValue,
  useAbsoluteDateTimeValue,
  useDateTimePickerKeyboardInteraction,
  useDateTimePickerRangeKind,
  useRelativeDateTimeValue,
  useDateTimePickerClickOutside,
  useCloseDropdown,
  useCustomHeight,
} from './dateTimePickerUtils';

const { iotPrefix, prefix } = settings;

export const DateTimePickerDefaultValuePropTypes = PropTypes.oneOfType([
  PropTypes.exact({
    timeRangeKind: PropTypes.oneOf([PICKER_KINDS.PRESET]).isRequired,
    timeRangeValue: PropTypes.exact({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      /** offset is in minutes */
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
  PropTypes.exact({
    timeRangeKind: PropTypes.oneOf([PICKER_KINDS.SINGLE]).isRequired,
    timeSingleValue: PropTypes.exact({
      /** Can be a full parsable DateTime string or a Date object */
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      startDate: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
]);

export const propTypes = {
  testId: PropTypes.string,
  /** default value for the picker */
  defaultValue: DateTimePickerDefaultValuePropTypes,
  /** the dayjs.js format for the human readable interval value */
  dateTimeMask: PropTypes.string,
  /** a list of options to for the default presets */
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      offset: PropTypes.number,
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
  /** hide the back button and display cancel button while only using absolute range selector */
  hideBackButton: PropTypes.bool,
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
  /** call back function for clear values in single select */
  onClear: PropTypes.func,
  /** All the labels that need translation */
  i18n: PropTypes.shape({
    toLabel: PropTypes.string,
    toNowLabel: PropTypes.string,
    calendarLabel: PropTypes.string,
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
    startDateLabel: PropTypes.string,
    endDateLabel: PropTypes.string,
    startTimeLabel: PropTypes.string,
    endTimeLabel: PropTypes.string,
    applyBtnLabel: PropTypes.string,
    cancelBtnLabel: PropTypes.string,
    backBtnLabel: PropTypes.string,
    resetBtnLabel: PropTypes.string,
    increment: PropTypes.string,
    decrement: PropTypes.string,
    hours: PropTypes.string,
    minutes: PropTypes.string,
    number: PropTypes.string,
    timePickerInvalidText: PropTypes.string,
    invalidText: PropTypes.string,
    amString: PropTypes.string,
    pmString: PropTypes.string,
  }),
  /** Light version  */
  light: PropTypes.bool,
  /** The language locale used to format the days of the week, months, and numbers. */
  locale: PropTypes.string,
  /** Unique id of the component */
  id: PropTypes.string,
  /** Optionally renders only an icon rather than displaying the current selected time */
  hasIconOnly: PropTypes.bool,
  /** Allow repositioning the flyout menu */
  menuOffset: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
    inputTop: PropTypes.number,
    inputBottom: PropTypes.number,
  }),
  /** Date picker types are single and range, default is range */
  datePickerType: PropTypes.string,
  /** If set to true it will render outside of the current DOM in a portal, otherwise render as a child */
  renderInPortal: PropTypes.bool,
  /** Auto reposition if flyout menu offscreen */
  useAutoPositioning: PropTypes.bool,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

export const defaultProps = {
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
  hideBackButton: false,
  showCustomRangeLink: true,
  hasTimeInput: true,
  renderPresetTooltipText: null,
  onCancel: null,
  onApply: null,
  onClear: null,
  i18n: {
    toLabel: 'to',
    toNowLabel: 'to Now',
    calendarLabel: 'Calendar',
    presetLabels: [],
    intervalLabels: [],
    relativeLabels: [],
    customRangeLinkLabel: 'Custom Range',
    customRangeLabel: 'Custom range',
    relativeLabel: 'Relative',
    lastLabel: 'Last',
    invalidNumberLabel: 'Number is not valid',
    relativeToLabel: 'Relative to',
    absoluteLabel: 'Absolute',
    startTimeLabel: 'Start time',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    startAriaLabel: 'Date time start',
    endAriaLabel: 'Date time end',
    endTimeLabel: 'End time',
    applyBtnLabel: 'Apply',
    cancelBtnLabel: 'Cancel',
    backBtnLabel: 'Back',
    resetBtnLabel: 'Clear',
    increment: 'Increment',
    decrement: 'Decrement',
    hours: 'hours',
    minutes: 'minutes',
    number: 'number',
    timePickerInvalidText: undefined,
    invalidText: 'Time is required',
    invalidDateText: 'Date is required',
    amString: 'AM',
    pmString: 'PM',
  },
  light: false,
  locale: 'en',
  id: undefined,
  hasIconOnly: false,
  menuOffset: undefined,
  datePickerType: 'range',
  renderInPortal: true,
  useAutoPositioning: false,
  style: {},
};

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
  hideBackButton,
  onCancel,
  onApply,
  onClear,
  i18n,
  light,
  locale,
  hasIconOnly,
  menuOffset,
  datePickerType,
  renderInPortal,
  useAutoPositioning,
  style,
  ...others
}) => {
  const id = useRef(others.id || uuidv4()).current;

  React.useEffect(() => {
    if (__DEV__) {
      warning(
        false,
        'The `DateTimePickerV2` is an experimental component and could be lacking unit test and documentation. Be aware that minor version bumps could introduce breaking changes. For the reasons listed above use of this component in production is highly discouraged'
      );
    }
  }, []);

  const langDir = useLangDirection();
  const mergedI18n = useMemo(
    () => ({
      ...defaultProps.i18n,
      ...i18n,
    }),
    [i18n]
  );

  const is24hours = useMemo(() => {
    const [, time] = dateTimeMask.split(' ');
    const hoursMask = time?.split(':')[0];
    return hoursMask ? hoursMask.includes('H') : false;
  }, [dateTimeMask]);
  const isSingleSelect = useMemo(() => datePickerType === 'single', [datePickerType]);

  // initialize the dayjs locale
  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  // State
  const [customRangeKind, setCustomRangeKind, onCustomRangeChange] =
    useDateTimePickerRangeKind(showRelativeOption);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [lastAppliedValue, setLastAppliedValue] = useState(null);
  const [humanValue, setHumanValue] = useState(null);
  const [defaultTimeValueUpdate, setDefaultTimeValueUpdate] = useState(false);
  const [invalidState, setInvalidState] = useState(invalid);
  const relativeSelect = useRef(null);
  const containerRef = useRef();
  const dropdownRef = useRef();
  const updatedStyle = useMemo(
    () => ({
      ...style,
      '--zIndex': style.zIndex ?? 0,
    }),
    [style]
  );
  const {
    absoluteValue,
    setAbsoluteValue,
    resetAbsoluteValue,
    isValid12HourTime,
    isValid24HourTime,
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

  const {
    isExpanded,
    setIsExpanded,
    presetListRef,
    onFieldInteraction,
    onNavigateRadioButton,
    onNavigatePresets,
    onFieldClick,
  } = useDateTimePickerKeyboardInteraction({ expanded, setCustomRangeKind });

  const [singleDateValue, setSingleDateValue] = useState(null);
  const [singleTimeValue, setSingleTimeValue] = useState(null);
  const [rangeStartTimeValue, setRangeStartTimeValue] = useState(null);
  const [rangeEndTimeValue, setRangeEndTimeValue] = useState(null);
  const [invalidRangeStartTime, setInvalidRangeStartTime] = useState(false);
  const [invalidRangeEndTime, setInvalidRangeEndTime] = useState(false);
  const [invalidRangeStartDate, setInvalidRangeStartDate] = useState(false);

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
    single: {
      startDate: null,
      startTime: null,
    },
  };
  const translatedMeridian = {
    AM: mergedI18n.amString,
    am: mergedI18n.amString,
    PM: mergedI18n.pmString,
    pm: mergedI18n.pmString,
  };

  const getLocalizedTimeValue = (timeValue) =>
    !is24hours && timeValue
      ? timeValue?.replace(/am|AM|pm|PM/g, (matched) => translatedMeridian[matched])
      : timeValue;

  const getTranslatedTimeValue = (timeValue) => {
    if (!timeValue) {
      return timeValue;
    }
    const localizedMeridian = {
      [mergedI18n.amString]: 'AM',
      [mergedI18n.pmString]: 'PM',
    };
    const time = timeValue.split(' ')[0];
    const meridian = localizedMeridian[timeValue.split(' ')[1]];

    return is24hours ? timeValue : `${time} ${meridian}`;
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
      } else if (customRangeKind === PICKER_KINDS.ABSOLUTE) {
        value.absolute = {
          ...absoluteValue,
          startTime: hasTimeInput ? rangeStartTimeValue : null,
          endTime: hasTimeInput ? rangeEndTimeValue : null,
        };
      } else {
        value.single = {
          ...singleDateValue,
          startTime: hasTimeInput && singleTimeValue !== '' ? singleTimeValue : null,
        };
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
    const parsedValue = parseValue(value, dateTimeMask, mergedI18n.toLabel, hasTimeInput);

    setHumanValue(getLocalizedTimeValue(parsedValue.readableValue));

    return {
      ...value,
      ...parsedValue,
    };
  };

  useEffect(
    () => {
      if (
        absoluteValue ||
        relativeValue ||
        singleDateValue ||
        singleTimeValue ||
        rangeStartTimeValue ||
        rangeEndTimeValue
      ) {
        renderValue();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      absoluteValue,
      relativeValue,
      singleDateValue,
      singleTimeValue,
      rangeStartTimeValue,
      rangeEndTimeValue,
    ]
  );

  const onDatePickerChange = ([start, end]) => {
    const newAbsolute = { ...absoluteValue };
    newAbsolute.start = start;
    newAbsolute.startDate = start ? dayjs(newAbsolute.start).format('MM/DD/YYYY') : '';
    newAbsolute.end = end;
    newAbsolute.endDate = end ? dayjs(newAbsolute.end).format('MM/DD/YYYY') : '';

    setAbsoluteValue(newAbsolute);
    setInvalidRangeStartTime(
      invalidStartDate(newAbsolute.startTime, newAbsolute.endTime, newAbsolute)
    );
    setInvalidRangeEndTime(
      invalidStartDate(newAbsolute.startTime, newAbsolute.endTime, newAbsolute)
    );
  };

  const onSingleDatePickerChange = (start) => {
    const newSingleDate = { ...singleDateValue };
    newSingleDate.start = start;
    newSingleDate.startDate = dayjs(newSingleDate.start).format('MM/DD/YYYY');
    setSingleDateValue(newSingleDate);
    setInvalidRangeStartDate(!newSingleDate.startDate);
  };

  const onPresetClick = (preset) => {
    setSelectedPreset(preset.id ?? preset.offset);
    renderValue(preset);
  };

  const parseDefaultValue = (parsableValue) => {
    const currentCustomRangeKind = showRelativeOption
      ? PICKER_KINDS.RELATIVE
      : datePickerType === 'range'
      ? PICKER_KINDS.ABSOLUTE
      : PICKER_KINDS.SINGLE;
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
        // range
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
        absolute.startTime = is24hours
          ? dayjs(absolute.start).format('HH:mm')
          : dayjs(absolute.start).format('hh:mm A');
        absolute.endDate = dayjs(absolute.end).format('MM/DD/YYYY');
        absolute.endTime = is24hours
          ? dayjs(absolute.end).format('HH:mm')
          : dayjs(absolute.end).format('hh:mm A');
        setAbsoluteValue(absolute);
        setRangeStartTimeValue(absolute.startTime);
        setRangeEndTimeValue(absolute.endTime);
      }

      if (parsableValue.timeRangeKind === PICKER_KINDS.SINGLE) {
        // single
        const single = { ...parsableValue.timeSingleValue };
        resetRelativeValue();
        setIsCustomRange(true);
        setCustomRangeKind(PICKER_KINDS.SINGLE);
        if (!single.hasOwnProperty('start') && single.startDate && single.startTime) {
          single.start = dayjs(`${single.startDate} ${single.startTime}`).valueOf();
        }
        single.startDate = single.start ? dayjs(single.start).format('MM/DD/YYYY') : null;
        single.startTime = single.start
          ? is24hours
            ? dayjs(single.start).format('HH:mm')
            : dayjs(single.start).format('hh:mm A')
          : null;
        setSingleDateValue(single);
        setSingleTimeValue(single.startTime);
      }
    } else {
      resetAbsoluteValue();
      resetRelativeValue();
      setCustomRangeKind(currentCustomRangeKind);
      onPresetClick(presets[0]);
    }
  };

  const toggleIsCustomRange = (event) => {
    // stop the event from bubbling
    event.stopPropagation();
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

  const tooltipValue = renderPresetTooltipText
    ? renderPresetTooltipText(currentValue)
    : datePickerType === 'range'
    ? getIntervalValue({ currentValue, mergedI18n, dateTimeMask, humanValue })
    : isSingleSelect
    ? humanValue
    : dateTimeMask;

  const disableAbsoluteApply =
    isCustomRange &&
    customRangeKind === PICKER_KINDS.ABSOLUTE &&
    (invalidRangeStartTime ||
      invalidRangeEndTime ||
      (absoluteValue?.startDate === '' && absoluteValue?.endDate === '') ||
      (hasTimeInput ? !rangeStartTimeValue || !rangeEndTimeValue : false));

  const disableRelativeApply =
    isCustomRange &&
    customRangeKind === PICKER_KINDS.RELATIVE &&
    (relativeLastNumberInvalid || relativeToTimeInvalid);

  const disableApply = disableRelativeApply || disableAbsoluteApply;

  useEffect(() => setInvalidState(invalid), [invalid]);

  const onApplyClick = () => {
    const value = renderValue();
    const returnValue = {
      timeRangeKind: value.kind,
      timeRangeValue: null,
      timeSingleValue: null,
    };

    let isValid = true;
    switch (value.kind) {
      case PICKER_KINDS.ABSOLUTE:
        value.absolute.startTime = getLocalizedTimeValue(value.absolute.startTime);
        value.absolute.endTime = getLocalizedTimeValue(value.absolute.endTime);
        returnValue.timeRangeValue = {
          ...value.absolute,
          humanValue,
          tooltipValue,
          ISOStart: value.absolute.start?.toISOString(),
          ISOEnd: value.absolute.end?.toISOString(),
        };
        break;
      case PICKER_KINDS.SINGLE:
        isValid =
          value.single.startDate &&
          !invalidRangeStartDate &&
          (hasTimeInput ? !invalidRangeStartTime && value.single.startTime : true);

        setInvalidRangeStartTime(hasTimeInput ? !value.single.startTime : false);
        setInvalidRangeStartDate(!value.single.startDate);

        value.single.startTime = getLocalizedTimeValue(value.single.startTime);
        returnValue.timeSingleValue = {
          ...value.single,
          humanValue,
          tooltipValue,
          ISOStart: new Date(value.single.start).toISOString(),
        };
        setDefaultTimeValueUpdate(!defaultTimeValueUpdate);
        break;

      case PICKER_KINDS.RELATIVE:
        returnValue.timeRangeValue = {
          ...value.relative,
          humanValue,
          tooltipValue,
        };
        break;
      default:
        returnValue.timeRangeValue = {
          ...value.preset,
          tooltipValue,
        };
        break;
    }
    setLastAppliedValue(returnValue);

    if (onApply && isValid) {
      setIsExpanded(false);
      onApply(returnValue);
    }
  };

  const onCancelClick = () => {
    parseDefaultValue(lastAppliedValue);
    setIsExpanded(false);

    /* istanbul ignore else */
    if (onCancel) {
      onCancel();
    }
  };

  const onClearClick = () => {
    setSingleDateValue({ start: null, startDate: null });
    setSingleTimeValue(null);
    setDefaultTimeValueUpdate(!defaultTimeValueUpdate);
    setInvalidRangeStartDate(false);
    setIsExpanded(false);
    const returnValue = {
      timeRangeKind: PICKER_KINDS.SINGLE,
      timeRangeValue: null,
      timeSingleValue: null,
    };

    returnValue.timeSingleValue = {
      ISOStart: null,
      humanValue: dateTimeMask,
      start: null,
      startDate: null,
      startTime: null,
      tooltipValue: dateTimeMask,
    };

    onClear(returnValue);
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
    singleTimeValue,
    setSingleDateValue,
    setSingleTimeValue,
  });

  const onClickOutside = useDateTimePickerClickOutside(closeDropdown, containerRef);

  useOnClickOutside(dropdownRef, onClickOutside);

  // eslint-disable-next-line react/prop-types
  const CustomFooter = () => {
    return (
      <div className={`${iotPrefix}--date-time-picker__menu-btn-set`}>
        {isCustomRange && !isSingleSelect && !hideBackButton ? (
          <Button
            kind="secondary"
            className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-back`}
            size="md"
            {...others}
            onClick={toggleIsCustomRange}
            onKeyUp={handleSpecificKeyDown(['Enter', ' '], toggleIsCustomRange)}
          >
            {mergedI18n.backBtnLabel}
          </Button>
        ) : isSingleSelect ? (
          <Button
            kind="secondary"
            className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-reset`}
            size="md"
            {...others}
            onClick={onClearClick}
            onMouseDown={(e) => e.preventDefault()}
            onKeyUp={handleSpecificKeyDown(['Enter', ' '], onClearClick)}
          >
            {mergedI18n.resetBtnLabel}
          </Button>
        ) : (
          <Button
            kind="secondary"
            className={`${iotPrefix}--date-time-picker__menu-btn ${iotPrefix}--date-time-picker__menu-btn-cancel`}
            onClick={onCancelClick}
            size="md"
            {...others}
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
          onKeyUp={handleSpecificKeyDown(['Enter', ' '], onApplyClick)}
          onMouseDown={(e) => e.preventDefault()}
          size="md"
          disabled={customRangeKind === PICKER_KINDS.SINGLE ? false : disableApply}
        >
          {mergedI18n.applyBtnLabel}
        </Button>
      </div>
    );
  };

  const handleRangeTimeValueChange = (startState, endState) => {
    const translatedStartTimeValue = getTranslatedTimeValue(startState);
    const translatedEndTimeValue = getTranslatedTimeValue(endState);
    setRangeStartTimeValue(translatedStartTimeValue);
    setRangeEndTimeValue(translatedEndTimeValue);
    setInvalidRangeStartTime(
      (absoluteValue &&
        invalidStartDate(translatedStartTimeValue, translatedEndTimeValue, absoluteValue)) ||
        (is24hours
          ? !isValid24HourTime(translatedStartTimeValue)
          : !isValid12HourTime(translatedStartTimeValue))
    );
    setInvalidRangeEndTime(
      (absoluteValue &&
        invalidEndDate(translatedStartTimeValue, translatedEndTimeValue, absoluteValue)) ||
        (is24hours
          ? !isValid24HourTime(translatedEndTimeValue)
          : !isValid12HourTime(translatedEndTimeValue))
    );
  };

  const handleSingleTimeValueChange = (startState) => {
    const translatedTimeValue = getTranslatedTimeValue(startState);
    setSingleTimeValue(translatedTimeValue);
    setInvalidRangeStartTime(
      is24hours ? !isValid24HourTime(translatedTimeValue) : !isValid12HourTime(translatedTimeValue)
    );
  };

  const menuOffsetLeft = menuOffset?.left
    ? menuOffset.left
    : langDir === 'ltr'
    ? 0
    : hasIconOnly
    ? -15
    : 288;

  const menuOffsetTop = menuOffset?.top ? menuOffset.top : 0;

  const [
    offTop,
    ,
    inputTop,
    inputBottom,
    customHeight,
    maxHeight,
    invalidDateWarningHeight,
    invalidTimeWarningHeight,
    timeInputHeight,
  ] = useCustomHeight({
    containerRef,
    isSingleSelect,
    isCustomRange,
    showRelativeOption,
    customRangeKind,
    setIsExpanded,
  });

  const direction = useAutoPositioning
    ? offTop
      ? FlyoutMenuDirection.BottomEnd
      : FlyoutMenuDirection.TopEnd
    : FlyoutMenuDirection.BottomEnd;

  const tooltipField = (
    <div
      className={classnames({
        [`${iotPrefix}--date-time-picker__box--full`]: !hasIconOnly,
        [`${iotPrefix}--date-time-picker__box--light`]: light,
        [`${iotPrefix}--date-time-picker__box--disabled`]: disabled,
        [`${iotPrefix}--date-time-picker__box--invalid`]: invalidState,
      })}
    >
      {!hasIconOnly ? (
        <div data-testid={`${testId}__field`} className={`${iotPrefix}--date-time-picker__field`}>
          {isExpanded ||
          (currentValue && currentValue.kind !== PICKER_KINDS.PRESET) ||
          humanValue ? (
            <span
              className={classnames({
                [`${iotPrefix}--date-time-picker__disabled`]:
                  disabled ||
                  (isSingleSelect &&
                    (!singleDateValue?.startDate || (hasTimeInput ? !singleTimeValue : false))), // singleDateValue might be null or undefined
              })}
              title={humanValue}
            >
              {humanValue}
            </span>
          ) : null}
        </div>
      ) : null}

      <FlyoutMenu
        isOpen={isExpanded}
        buttonSize={hasIconOnly ? FlyoutMenuButtonSize.Default : FlyoutMenuButtonSize.Small}
        renderIcon={invalidState ? WarningFilled : Calendar}
        disabled={disabled}
        buttonProps={{
          tooltipPosition: 'top',
          tabIndex: -1,
          className: classnames(`${iotPrefix}--date-time-picker--trigger-button`, {
            [`${iotPrefix}--date-time-picker--trigger-button--invalid`]: invalid,
            [`${iotPrefix}--date-time-picker--trigger-button--disabled`]: disabled,
          }),
        }}
        hideTooltip
        passive={false}
        triggerId={`test-trigger-${id}`}
        light={light}
        menuOffset={{
          top: menuOffsetTop,
          left: menuOffsetLeft,
          inputTop,
          inputBottom,
        }}
        testId={`${testId}-datepicker-flyout`}
        direction={direction}
        tooltipFocusTrap={false}
        renderInPortal={renderInPortal}
        useAutoPositioning={false}
        tooltipClassName={classnames(`${iotPrefix}--date-time-picker--tooltip`, {
          [`${iotPrefix}--date-time-picker--tooltip--icon`]: hasIconOnly,
        })}
        tooltipContentClassName={`${iotPrefix}--date-time-picker--menu`}
        style={updatedStyle}
      >
        <div
          ref={dropdownRef}
          className={`${iotPrefix}--date-time-picker__menu-scroll`}
          style={{
            '--wrapper-width': '20rem',
            height: customHeight,
            maxHeight:
              maxHeight +
              (invalidRangeStartTime || invalidRangeEndTime ? invalidTimeWarningHeight : 0) +
              (invalidRangeStartDate ? invalidDateWarningHeight : 0) -
              (!hasTimeInput ? timeInputHeight : 0),
          }}
          role="presentation"
          onClick={(event) => event.stopPropagation()} // need to stop the event so that it will not close the menu
          onKeyDown={(event) => event.stopPropagation()} // need to stop the event so that it will not close the menu
          tabIndex="-1"
        >
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
                    className={`${iotPrefix}--date-time-picker__listitem ${iotPrefix}--date-time-picker__listitem--preset ${iotPrefix}--date-time-picker__listitem--custom`}
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
                      onKeyDown={handleSpecificKeyDown(['Enter', ' '], () => onPresetClick(preset))}
                      className={classnames(
                        `${iotPrefix}--date-time-picker__listitem ${iotPrefix}--date-time-picker__listitem--preset`,
                        {
                          [`${iotPrefix}--date-time-picker__listitem--preset-selected`]:
                            selectedPreset === (preset.id ?? preset.offset),
                        }
                      )}
                      tabIndex={0}
                    >
                      {mergedI18n.presetLabels[i] || preset.label}
                    </ListItem>
                  );
                })}
              </OrderedList>
            </div>
          ) : (
            <div
              className={`${iotPrefix}--date-time-picker__custom-wrapper`}
              style={{ '--wrapper-width': '20rem' }}
            >
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
                <>
                  <FormGroup
                    legendText={mergedI18n.lastLabel}
                    className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                  >
                    <div className={`${iotPrefix}--date-time-picker__fields-wrapper`}>
                      <NumberInput
                        id={`${id}-last-number`}
                        invalidText={mergedI18n.invalidNumberLabel}
                        step={1}
                        min={0}
                        value={relativeValue ? relativeValue.lastNumber : 0}
                        onChange={onRelativeLastNumberChange}
                        translateWithId={(messageId) =>
                          messageId === 'increment.number'
                            ? `${i18n.increment} ${i18n.number}`
                            : messageId === 'decrement.number'
                            ? `${i18n.decrement} ${i18n.number}`
                            : null
                        }
                        light={!light}
                      />
                      <Select
                        {...others}
                        id={`${id}-last-interval`}
                        defaultValue={
                          relativeValue ? relativeValue.lastInterval : INTERVAL_VALUES.MINUTES
                        }
                        onChange={onRelativeLastIntervalChange}
                        hideLabel
                        light={!light}
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
                        `${iotPrefix}--date-time-picker__fields-wrapper--with-gap`
                      )}
                    >
                      <Select
                        {...others}
                        ref={relativeSelect}
                        id={`${id}-relative-to-when`}
                        defaultValue={relativeValue ? relativeValue.relativeToWhen : ''}
                        onChange={onRelativeToWhenChange}
                        hideLabel
                        light={!light}
                      >
                        {relatives.map((relative, i) => {
                          return (
                            <SelectItem
                              key={i}
                              value={relative.value}
                              text={mergedI18n.relativeLabels[i] || relative.label}
                            />
                          );
                        })}
                      </Select>
                      {hasTimeInput ? (
                        <TimePickerSpinner
                          id={`${id}-relative-to-time`}
                          invalid={relativeToTimeInvalid}
                          value={relativeValue ? relativeValue.relativeToTime : ''}
                          i18n={i18n}
                          onChange={onRelativeToTimeChange}
                          spinner
                          autoComplete="off"
                          light={!light}
                        />
                      ) : null}
                    </div>
                  </FormGroup>
                </>
              ) : (
                <div data-testid={`${testId}-datepicker`}>
                  <FormGroup className={`${iotPrefix}--date-time-picker__menu-formgroup`}>
                    <DatePicker
                      datePickerType={datePickerType}
                      dateFormat="m/d/Y"
                      onChange={
                        datePickerType === 'single' ? onSingleDatePickerChange : onDatePickerChange
                      }
                      value={
                        absoluteValue && datePickerType === 'range'
                          ? [absoluteValue.startDate, absoluteValue.endDate]
                          : singleDateValue && datePickerType === 'single'
                          ? [singleDateValue?.startDate]
                          : null
                      }
                      locale={locale?.split('-')[0]}
                      closeOnSelect={false}
                      light={!light}
                    >
                      <DatePickerInput
                        labelText={mergedI18n.startDateLabel}
                        aria-label={mergedI18n.startAriaLabel}
                        id={`${id}-date-picker-input-start`}
                      />

                      {datePickerType === 'range' ? (
                        <DatePickerInput
                          labelText={mergedI18n.endDateLabel}
                          aria-label={mergedI18n.endAriaLabel}
                          id={`${id}-date-picker-input-end`}
                        />
                      ) : null}
                    </DatePicker>
                    {invalidRangeStartDate ? (
                      <div
                        className={classnames(
                          `${iotPrefix}--date-time-picker__datepicker--invalid`
                        )}
                      >
                        <ErrorFilled />
                        <p
                          className={classnames(
                            `${iotPrefix}--date-time-picker__helper-text--invalid`
                          )}
                        >
                          {mergedI18n.invalidDateText}
                        </p>
                      </div>
                    ) : null}
                  </FormGroup>
                  {hasTimeInput ? (
                    <FormGroup
                      legendText=""
                      className={`${iotPrefix}--date-time-picker__menu-formgroup`}
                    >
                      <TimePickerDropdown
                        className={`${iotPrefix}--time-picker-dropdown`}
                        id={id}
                        key={defaultTimeValueUpdate}
                        value={
                          isSingleSelect
                            ? getLocalizedTimeValue(singleTimeValue)
                            : getLocalizedTimeValue(rangeStartTimeValue)
                        }
                        secondaryValue={getLocalizedTimeValue(rangeEndTimeValue)}
                        hideLabel={!mergedI18n.startTimeLabel}
                        hideSecondaryLabel={!mergedI18n.endTimeLabel}
                        onChange={(startState, endState) =>
                          isSingleSelect
                            ? handleSingleTimeValueChange(startState)
                            : handleRangeTimeValueChange(startState, endState)
                        }
                        type={isSingleSelect ? 'single' : 'range'}
                        invalid={[invalidRangeStartTime, invalidRangeEndTime]}
                        i18n={{
                          labelText: mergedI18n.startTimeLabel,
                          secondaryLabelText: mergedI18n.endTimeLabel,
                          invalidText: mergedI18n.timePickerInvalidText,
                          amString: mergedI18n.amString,
                          pmString: mergedI18n.pmString,
                        }}
                        size="sm"
                        testId={`${testId}--time-picker-dropdown`}
                        style={{ zIndex: `${(style.zIndex ?? 0) + 10000}` }}
                        is24hours={is24hours}
                        light={!light}
                      />
                    </FormGroup>
                  ) : (
                    <div className={`${iotPrefix}--date-time-picker__no-formgroup`} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {CustomFooter()}
      </FlyoutMenu>
    </div>
  );

  return (
    <div className={`${iotPrefix}--date-time-pickerv2`} ref={containerRef}>
      <div
        data-testid={testId}
        id={`${id}-${iotPrefix}--date-time-pickerv2__wrapper`}
        className={classnames(`${iotPrefix}--date-time-pickerv2__wrapper`, {
          [`${iotPrefix}--date-time-pickerv2__wrapper--disabled`]: disabled,
          [`${iotPrefix}--date-time-pickerv2__wrapper--invalid`]: invalidState,
        })}
        style={{ '--wrapper-width': hasIconOnly ? '3rem' : '20rem' }}
        role="button"
        onClick={onFieldClick}
        onKeyDown={handleSpecificKeyDown(['Enter', ' ', 'Escape', 'ArrowDown'], (event) => {
          // the onApplyClick event gets blocked when called via the keyboard from the flyout menu's
          // custom footer. This is a catch to ensure the onApplyCLick is called correctly for preset
          // ranges via the keyboard.
          if (
            (event.key === 'Enter' || event.key === ' ') &&
            event.target.classList.contains(`${iotPrefix}--date-time-picker__menu-btn-apply`) &&
            !isCustomRange
          ) {
            onApplyClick();
          }

          onFieldInteraction(event);
        })}
        tabIndex={0}
      >
        {tooltipField}
      </div>
      {invalidState && !hasIconOnly ? (
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
