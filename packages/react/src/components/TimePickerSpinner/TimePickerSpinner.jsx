import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TimePicker } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons'; //  CaretDownGlyph, CaretUpGlyph correct icon need to find
import classnames from 'classnames';
import { merge } from 'lodash-es';

import { settings } from '../../constants/Settings';
import { keyboardKeys } from '../../constants/KeyCodeConstants';

const { iotPrefix } = settings;

export const TIMEGROUPS = {
  HOURS: 'HOURS',
  MINUTES: 'MINUTES',
};

const propTypes = {
  /** renders the up/down buttons  */
  spinner: PropTypes.bool,
  /** a default value for the input  */
  value: PropTypes.string,
  /** a list of children to pass to the Carbon TimePicker component  */
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  /** triggered on input click  */
  onClick: PropTypes.func,
  /** triggered on value change. Called with 3 parameters: newValue, event, meta
   * The meta object has a property called invalid that is either true or false
   * representing the validation status of the new input
   */
  onChange: PropTypes.func,
  /** disable the input  */
  disabled: PropTypes.bool,
  /** will display invalidText when set to true */
  invalid: PropTypes.bool,
  /** set a 12-hour timepicker instead of the default 24-hour  */
  is12hour: PropTypes.bool,
  /** the default selected timegroup (hours, minutes) */
  defaultTimegroup: PropTypes.oneOf([TIMEGROUPS.HOURS, TIMEGROUPS.MINUTES]),
  /** All the labels that need translation */
  i18n: PropTypes.shape({
    /** String for word 'increment' or function receiving the unit as param:
     * (timeUnit) => `Increment ${timeUnit}` */
    increment: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /** String for word 'decrement' or function receiving the unit as param:
     * (timeUnit) => `Decrement ${timeUnit}` */
    decrement: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    hours: PropTypes.string,
    minutes: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  spinner: false,
  value: '',
  children: null,
  onClick: null,
  onChange: null,
  disabled: false,
  invalid: false,
  is12hour: false,
  defaultTimegroup: TIMEGROUPS.HOURS,
  i18n: {
    increment: 'Increment',
    decrement: 'Decrement',
    hours: 'hours',
    minutes: 'minutes',
  },
  testId: 'time-picker-spinner',
};

const getButtonLabel = (text, timeUnit) =>
  typeof text === 'function' ? text(timeUnit) : `${text} ${timeUnit}`;

const TimePickerSpinner = ({
  spinner,
  value,
  children,
  onClick,
  onChange,
  disabled,
  invalid,
  is12hour,
  defaultTimegroup,
  i18n: i18nProp,
  testId,
  ...others
}) => {
  const i18n = merge({}, defaultProps.i18n, i18nProp);
  const [pickerValue, setPickerValue] = useState(value || '');
  const [currentTimeGroup, setCurrentTimeGroup] = useState(
    defaultTimegroup === TIMEGROUPS.MINUTES ? 1 : 0
  );

  const [isInteractingWithSpinner, setIsInteractingWithSpinner] = useState(false);
  const [isSpinnerFocused, setIsSpinnerFocused] = useState(false);
  const [keyUpOrDownPosition, setKeyUpOrDownPosition] = useState(-1);
  const [focusTarget, setFocusTarget] = useState(null);

  const timePickerRef = React.createRef();

  const validate = (newValue) => {
    const isValid12HoursRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]$/;
    const isValid24HoursRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return !(is12hour ? isValid12HoursRegex.test(newValue) : isValid24HoursRegex.test(newValue));
  };

  const handleArrowClick = (direction) => {
    const timeGroups = pickerValue.split(':');
    if (timeGroups.length === 1) {
      timeGroups.push('00');
    }
    const isChangingHours = currentTimeGroup === 0;
    let groupValue = Number(timeGroups[currentTimeGroup]);
    const maxForGroup = isChangingHours ? (is12hour ? 12 : 23) : 59;

    if (direction === 'down') {
      const lowestForGroup = isChangingHours && is12hour ? maxForGroup : 0;
      const newGroupValue = groupValue - 1;
      groupValue =
        groupValue - 1 < 0 ? maxForGroup : newGroupValue === 0 ? lowestForGroup : newGroupValue;
    } else {
      groupValue =
        groupValue + 1 > maxForGroup ? (isChangingHours && is12hour ? 1 : 0) : groupValue + 1;
    }

    timeGroups[currentTimeGroup] = groupValue.toString().padStart(2, '0');
    const newValue = timeGroups.join(':');
    setPickerValue(newValue);
    if (onChange) {
      onChange(newValue, null, { invalid: validate(newValue) });
    }
    window.setTimeout(() => {
      if (focusTarget) {
        focusTarget.selectionStart = keyUpOrDownPosition;
        focusTarget.selectionEnd = keyUpOrDownPosition;
        setKeyUpOrDownPosition(-1);
      }
    }, 0);
  };

  const onInputClick = (e) => {
    const target = e.currentTarget;
    setFocusTarget(target);
    setCurrentTimeGroup(target.selectionStart <= 2 ? 0 : 1);
    if (onClick) {
      onClick(e);
    }
  };

  const onInputChange = (e) => {
    const {
      currentTarget: { value: currentValue },
    } = e;
    setPickerValue(currentValue);
    if (onChange) {
      onChange(currentValue, e, { invalid: validate(currentValue) });
    }
  };

  const preventNonAllowedKeyboardInput = (e) => {
    const isNumberChar = /\d/.test(e.key);
    const isOnlyColon = e.key === ':' && !e.currentTarget.value?.includes(':');

    if (isNumberChar || isOnlyColon) {
      return true;
    }

    e.preventDefault();
    return false;
  };

  const onInputKeyDown = (e) => {
    const target = e.currentTarget;
    setFocusTarget(target);
    switch (e.key) {
      case keyboardKeys.UP:
      case keyboardKeys.DOWN:
        setKeyUpOrDownPosition(target.selectionStart);
        break;
      case keyboardKeys.BACKSPACE:
      case keyboardKeys.DELETE:
      case keyboardKeys.TAB:
      case keyboardKeys.END:
      case keyboardKeys.HOME:
      case keyboardKeys.LEFT:
      case keyboardKeys.RIGHT:
        break;
      default:
        return preventNonAllowedKeyboardInput(e);
    }
    return true;
  };

  const onInputBlur = (e) => {
    const target = e.currentTarget;
    const regex = /[^\d:]/g;
    if (target.value.search(regex) > -1) {
      setPickerValue(target.value.replace(regex, ''));
    }
  };

  let lastSelectionStart = -1;
  const onInputKeyUp = (e) => {
    switch (e.key) {
      case keyboardKeys.LEFT:
      case keyboardKeys.RIGHT:
        setCurrentTimeGroup(e.currentTarget.selectionStart <= 2 ? 0 : 1);

        // this is to fix the event hijacking from sibling components, ie. DatePicker
        // in this case we need to set the proper cursor position artificially
        if (e.currentTarget.selectionStart === lastSelectionStart) {
          if (e.key === keyboardKeys.LEFT) {
            e.currentTarget.selectionStart -= 1;
          } else {
            e.currentTarget.selectionStart += 1;
          }
          e.currentTarget.selectionEnd = e.currentTarget.selectionStart;
        }
        lastSelectionStart = e.currentTarget.selectionStart;

        break;
      case keyboardKeys.UP:
        handleArrowClick('up');
        break;
      case keyboardKeys.DOWN:
        handleArrowClick('down');
        break;
      default:
        break;
    }
  };

  const onArrowClick = (direction) => {
    setIsInteractingWithSpinner(true);
    handleArrowClick(direction);
  };

  const onArrowInteract = (fromFocus) => {
    if (!isSpinnerFocused) {
      setIsSpinnerFocused(fromFocus);
    }
    setIsInteractingWithSpinner(true);
  };

  const onArrowStopInteract = (fromBlur) => {
    if (fromBlur) {
      setIsSpinnerFocused(false);
      setIsInteractingWithSpinner(false);
    }
    if (!isSpinnerFocused) {
      setIsInteractingWithSpinner(false);
    }
  };

  const timeGroupForLabel = currentTimeGroup === 0 ? i18n.hours : i18n.minutes;

  return (
    <div
      data-testid={`${testId}-wrapper`}
      className={classnames(`${iotPrefix}--time-picker__wrapper`, {
        [`${iotPrefix}--time-picker__wrapper--with-spinner`]: spinner,
        [`${iotPrefix}--time-picker__wrapper--updown`]: keyUpOrDownPosition > -1,
        [`${iotPrefix}--time-picker__wrapper--show-underline`]: isInteractingWithSpinner,
        [`${iotPrefix}--time-picker__wrapper--show-underline-minutes`]: currentTimeGroup === 1,
      })}
    >
      <TimePicker
        ref={timePickerRef}
        onClick={onInputClick}
        onChange={onInputChange}
        value={pickerValue}
        onKeyDown={onInputKeyDown}
        onKeyUp={onInputKeyUp}
        onBlur={onInputBlur}
        disabled={disabled}
        data-testid={testId}
        invalid={invalid}
        {...others}
      >
        {children}
        {spinner ? (
          <div className={`${iotPrefix}--time-picker__controls`}>
            <button
              type="button"
              className={`${iotPrefix}--time-picker__controls--btn up-icon`}
              onClick={() => onArrowClick('up')}
              onMouseOver={() => onArrowInteract(false)}
              onMouseOut={() => onArrowStopInteract(false)}
              onFocus={() => onArrowInteract(true)}
              onBlur={() => onArrowStopInteract(true)}
              aria-live="polite"
              aria-atomic="true"
              title={getButtonLabel(i18n.increment, timeGroupForLabel)}
              aria-label={getButtonLabel(i18n.increment, timeGroupForLabel)}
              disabled={disabled}
              data-testid={`${testId}-up-button`}
            >
              <ChevronUp className="up-icon" />
            </button>
            <button
              type="button"
              className={`${iotPrefix}--time-picker__controls--btn down-icon`}
              onClick={() => onArrowClick('down')}
              onMouseOver={() => onArrowInteract(false)}
              onMouseOut={() => onArrowStopInteract(false)}
              onFocus={() => onArrowInteract(true)}
              onBlur={() => onArrowStopInteract(true)}
              aria-live="polite"
              aria-atomic="true"
              title={getButtonLabel(i18n.decrement, timeGroupForLabel)}
              aria-label={getButtonLabel(i18n.decrement, timeGroupForLabel)}
              disabled={disabled}
              data-testid={`${testId}-down-button`}
            >
              <ChevronDown className="down-icon" />
            </button>
          </div>
        ) : null}
      </TimePicker>
    </div>
  );
};

TimePickerSpinner.propTypes = propTypes;
TimePickerSpinner.defaultProps = defaultProps;

export default TimePickerSpinner;
