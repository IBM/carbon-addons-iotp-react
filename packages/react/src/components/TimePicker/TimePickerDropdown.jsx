import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { TextInput } from '@carbon/react';
import { Time, EditOff, WarningAltFilled, WarningFilled } from '@carbon/react/icons';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';
import { keyboardKeys } from '../../constants/KeyCodeConstants';
import useMerged from '../../hooks/useMerged';

import ListSpinner from './ListSpinner';

const { iotPrefix, prefix } = settings;

const TIME_FORMAT = {
  12: 'hh:mm A',
  24: 'HH:mm',
};

const AVAILABLE_FORMATS = 'hhHHmmA';

const timeUtils = {
  get12Hours: (selectedTime, currentTime) =>
    /(0[1-9])|(1[0-2])/.test(selectedTime.substring(0, 2))
      ? selectedTime.substring(0, 2)
      : currentTime.substring(0, 2),
  get24Hours: (selectedTime, currentTime) =>
    /^(2[0-3]|[01]?[0-9])$/.test(selectedTime.substring(0, 2))
      ? selectedTime.substring(0, 2)
      : currentTime.substring(2, 4),
  getMinutes: (selectedTime, currentTime) =>
    /[0-5][0-9]/.test(selectedTime.substring(3, 5))
      ? selectedTime.substring(3, 5)
      : currentTime.substring(4, 6),
  getMeridiem: (selectedTime, currentTime, amString, pmString) =>
    new RegExp(`[${amString}|${pmString}]`).test(selectedTime.substring(selectedTime.length - 2))
      ? selectedTime.substring(selectedTime.length - 2)
      : currentTime.substring(6),
};

const propTypes = {
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  /** Specify the value for input */
  value: PropTypes.string,
  /** Specify the value for secondary input (range) */
  secondaryValue: PropTypes.string,
  /** Specify whether the input labels to be visually hidden */
  hideLabel: PropTypes.bool,
  /** Specify whether the secondary label to be visually hidden */
  hideSecondaryLabel: PropTypes.bool,
  /** Input can be for a single time or a range - defaults to single */
  type: PropTypes.oneOf(['single', 'range']),
  i18n: PropTypes.shape({
    /** Label for input (will be first, if range type) */
    labelText: PropTypes.string.isRequired,
    helperText: PropTypes.string,
    /** Label for second input in range */
    secondaryLabelText: PropTypes.string,
    secondaryHelperText: PropTypes.string,
    invalidText: PropTypes.string,
    warnText: PropTypes.string,
    timeIconText: PropTypes.string,
    placeholderText: PropTypes.string,
    placeholderText24h: PropTypes.string,
    amString: PropTypes.string,
    pmString: PropTypes.string,
  }),
  /** Size of input */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Specify whether the control is currently disabled */
  disabled: PropTypes.bool,
  /** Specify whether the control is currently read only */
  readOnly: PropTypes.bool,
  /** Specify whether the control is currently in warning state */
  warn: PropTypes.arrayOf(PropTypes.bool),
  /** Specify whether the control is currently in invalid state */
  invalid: PropTypes.arrayOf(PropTypes.bool),
  /** Boolean to swap for light theme */
  light: PropTypes.bool,
  /** Optional handler that is called whenever <input> is updated - will be called with new value as an argument */
  onChange: PropTypes.func,
  testId: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  is24hours: PropTypes.bool,
};

/* istanbul ignore next */
const defaultProps = {
  className: undefined,
  hideLabel: false,
  value: undefined,
  secondaryValue: undefined,
  hideSecondaryLabel: false,
  type: 'single',
  i18n: {
    invalidText: 'The time entered is invalid',
    warnText: undefined,
    timeIconText: 'Open time picker',
    placeholderText: 'hh:mm XM',
    placeholderText24h: 'HH:mm',
    readOnlyBtnText: 'Read only',
    amString: 'AM',
    pmString: 'PM',
  },
  size: 'md',
  disabled: false,
  readOnly: false,
  warn: [false, false],
  invalid: [false, false],
  light: false,
  onChange: () => {},
  testId: 'time-picker',
  style: {},
  is24hours: false,
};

const validate = (newValue, is24hours, amString, pmString) => {
  if (is24hours) {
    return /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(newValue) || newValue === '';
  }
  const timeRegEx = /^((0[1-9])?|(1[0-2])?)*:[0-5][0-9]/;
  const meridianRegEx = new RegExp(`${amString}|${pmString}`);

  return (
    (timeRegEx.test(newValue.split(' ')[0]) && meridianRegEx.test(newValue.split(' ')[1])) ||
    newValue === ''
  );
};

const TimePickerDropdown = ({
  id,
  className,
  type,
  i18n,
  size,
  disabled,
  testId,
  warn,
  invalid,
  light,
  readOnly,
  hideLabel,
  hideSecondaryLabel,
  value,
  secondaryValue,
  onChange,
  style,
  is24hours,
}) => {
  const init = useRef(false);
  const inputRef = useRef();
  const secondaryInputRef = useRef();
  const dropDownRef = useRef();
  const container = inputRef.current;
  const invalidProp = invalid[0];
  const secondaryInvalidProp = invalid[1];
  const warnProp = warn[0];
  const secondaryWarnProp = warn[1];
  // Component state
  const [openState, setOpenState] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const [focusedInput, setFocusedInput] = useState(0);
  const [valueState, setValueState] = useState(value || '');
  const [secondaryValueState, setSecondaryValueState] = useState(secondaryValue || '');
  const [invalidState, setInvalidState] = useState(invalidProp);
  const [secondaryInvalidState, setSecondaryInvalidState] = useState(secondaryInvalidProp);
  useEffect(() => {
    if (init.current) {
      onChange(valueState, secondaryValueState);
    } else {
      init.current = true;
    }
  }, [onChange, secondaryValueState, valueState, init]);

  useEffect(() => {
    setInvalidState(invalidProp);
    setSecondaryInvalidState(secondaryInvalidProp);
  }, [invalidProp, secondaryInvalidProp]);

  useEffect(() => {
    if (container) {
      const { left, bottom } = container.getBoundingClientRect();
      setPosition([left, bottom]);
    }
  }, [container, hideLabel]);

  const {
    labelText,
    secondaryLabelText,
    helperText,
    invalidText,
    warnText,
    timeIconText,
    placeholderText,
    placeholderText24h,
    readOnlyBtnText,
    amString,
    pmString,
  } = useMerged(defaultProps.i18n, i18n);

  useEffect(() => {
    if (openState) {
      const { left, bottom, top } = container.getBoundingClientRect();
      const dropdownHeight = 280;
      const scrollOffset = window.pageYOffset;
      const dropdownBottom = bottom + dropdownHeight;
      const dropdownPos = top - dropdownHeight + scrollOffset;
      if (dropdownBottom > window.innerHeight && dropdownPos > 0) {
        setPosition([left, dropdownPos]);
      } else {
        setPosition([left, bottom + scrollOffset]);
      }
    }
  }, [container, openState, focusedInput, is24hours, value, secondaryValue]);

  const handleOpenDropdown = (index) => {
    if (focusedInput === index && openState === true) {
      setOpenState(false);
    } else {
      setOpenState(true);
    }
    setFocusedInput(index);
  };

  const handleOnFocus = (index) => {
    setFocusedInput(index);
    if (!readOnly) {
      handleOpenDropdown(index);

      const current12HourTime = dayjs().format(TIME_FORMAT[12]).split(' ')[0];
      const current12HourMeridian =
        dayjs().format(TIME_FORMAT[12]).split(' ')[1] === 'AM' ? amString : pmString;
      const currentTime = is24hours
        ? dayjs().format(TIME_FORMAT[24])
        : `${current12HourTime} ${current12HourMeridian}`;

      if (index === 0 && !value) {
        setValueState((prevValue) => {
          return prevValue || currentTime;
        });
      }

      if (index === 1 && !secondaryValue) {
        setSecondaryValueState((prevValue) => prevValue || currentTime);
      }
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === keyboardKeys.ESCAPE) {
      setOpenState(false);
    }

    if (e.key === keyboardKeys.DOWN && dropDownRef.current) {
      dropDownRef.current.focus();
    }
  };

  const handleOnKeyUp = (e) => {
    if (e.key === keyboardKeys.ENTER && inputRef.current) {
      setOpenState(false);
      inputRef.current.focus();
    }
  };

  const handleOnChange = (e) => {
    let val = e;
    if (typeof e === 'object') {
      val = e.target.value;
    }

    // match all the words combined provided by amString and pmString
    const isValidMeridian = new RegExp(`[${amString}${pmString}]`).test(
      val.substring(val.length - 1)
    );
    const isValidTime = /[0-9: ]/.test(val.substring(val.length - 1));
    // @TODO: detect the length and run validation for as many as we can
    // This value is pasted in or autocompleted
    // istanbul ignore else

    // match any of the full string of tranlated AM or PM
    const meridianRegEx = new RegExp(
      `${amString}|${pmString}|${defaultProps.i18n.amString}|${defaultProps.i18n.pmString}`,
      'g'
    );
    const newVal =
      val && meridianRegEx.test(val) && !is24hours
        ? val.split(' ')[1] === 'AM' || val.split(' ')[1] === amString
          ? `${val.split(' ')[0]} ${amString}`
          : `${val.split(' ')[0]} ${pmString}`
        : val;
    if (val.length > 1) {
      if (focusedInput === 0) {
        setValueState(newVal);
      } else {
        setSecondaryValueState(newVal);
      }
    } else if (isValidMeridian || isValidTime || val === '') {
      if (focusedInput === 0) {
        setValueState(newVal);
      } else {
        setSecondaryValueState(newVal);
      }
    }
  };

  const handleOnBlur = (e) => {
    const contained =
      dropDownRef.current?.contains(e.relatedTarget) ||
      e.currentTarget.contains(e.relatedTarget) ||
      e.relatedTarget?.parentNode?.classList[0].includes('iot--list-spinner') ||
      e.relatedTarget?.parentNode?.classList[0].includes('iot--list-spinner');

    if (!contained) {
      // close dropdown and validate
      setOpenState(false);
      setInvalidState(!validate(inputRef.current.value, is24hours, amString, pmString));
      /* istanbul ignore else */
      if (secondaryInputRef.current) {
        setSecondaryInvalidState(
          !validate(secondaryInputRef.current.value, is24hours, amString, pmString)
        );
      }
    }
  };

  const inputState = useMemo(() => {
    return {
      state:
        invalidState && !readOnly
          ? 'invalid'
          : warnProp && !readOnly
          ? 'warn'
          : readOnly
          ? 'readOnly'
          : 'default',
      secondaryState:
        secondaryInvalidState && !readOnly
          ? 'invalid'
          : secondaryWarnProp && !readOnly
          ? 'warn'
          : readOnly
          ? 'readOnly'
          : 'default',
      firstIcon:
        invalidState && !readOnly
          ? WarningFilled
          : warnProp && !readOnly
          ? WarningAltFilled
          : readOnly
          ? EditOff
          : Time,
      secondIcon:
        secondaryInvalidState && !readOnly
          ? WarningFilled
          : secondaryWarnProp && !readOnly
          ? WarningAltFilled
          : readOnly
          ? EditOff
          : Time,
      text: !readOnly && invalidState ? invalidText : !readOnly && warnProp ? warnText : helperText,
      secondaryText:
        !readOnly && secondaryInvalidState
          ? invalidText
          : !readOnly && secondaryWarnProp
          ? warnText
          : helperText,
    };
  }, [
    invalidState,
    secondaryInvalidState,
    warnProp,
    secondaryWarnProp,
    readOnly,
    invalidText,
    warnText,
    helperText,
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onBlur={handleOnBlur}
      onKeyDown={handleOnKeyDown}
      onKeyUp={handleOnKeyUp}
      data-testid={testId}
      className={classnames(`${iotPrefix}--time-picker`, {
        [className]: className,
        [`${iotPrefix}--time-picker--24h`]: is24hours,
        [`${iotPrefix}--time-picker--light`]: light,
        [`${iotPrefix}--time-picker--disabled`]: disabled,
        [`${iotPrefix}--time-picker-range`]: type === 'range',
        [`${iotPrefix}--time-picker--warn`]:
          inputState.state === 'warn' || inputState.secondaryState === 'warn' || warn[0] || warn[1],
      })}
    >
      {type === 'single' ? (
        <>
          <div
            className={classnames(
              `${iotPrefix}--time-picker__wrapper ${iotPrefix}--time-picker__wrapper-${size}`,
              {
                [`${iotPrefix}--time-picker__wrapper--selected`]: focusedInput === 0 && openState,
                [`${iotPrefix}--time-picker--invalid`]: inputState.state === 'invalid',
              }
            )}
          >
            <TextInput
              onChange={handleOnChange}
              data-testid={`${testId}-input`}
              id={id}
              value={valueState}
              onFocus={() => handleOnFocus(0)}
              readOnly={readOnly}
              hideLabel={hideLabel}
              labelText={labelText}
              placeholder={is24hours ? placeholderText24h : placeholderText}
              size={size}
              warn={warnProp}
              invalid={invalidState}
              light={light}
              disabled={disabled}
              ref={inputRef}
            />
            <div
              data-testid={`${testId}-time-btn`}
              title={readOnly ? readOnlyBtnText : timeIconText}
              className={classnames(`${iotPrefix}--time-picker__icon`, {
                [`${iotPrefix}--time-picker__icon--invalid`]: invalidState,
                [`${iotPrefix}--time-picker__icon--warn`]: warnProp,
                [`${iotPrefix}--time-picker__icon--readonl`]: readOnly,
              })}
            >
              <inputState.firstIcon aria-hidden="true" focusable={false} />
            </div>
          </div>
          <p
            data-testid={`${testId}-helpertext`}
            className={classnames(`${prefix}--form__helper-text`, {
              [`${iotPrefix}--time-picker__helper-text`]: invalidState,
              [`${prefix}--form__helper-text--disabled`]: disabled,
              [`${iotPrefix}--time-picker--invalid`]: inputState.state === 'invalid',
            })}
          >
            {!readOnly && invalidState
              ? invalidText
              : !readOnly && warnProp
              ? warnText
              : helperText}
          </p>
        </>
      ) : (
        <fieldset>
          {hideSecondaryLabel && !hideLabel ? (
            <legend
              id={`${id}-label`}
              className={classnames(`${prefix}--label`, {
                [`${prefix}--label--disabled`]: disabled,
              })}
            >
              {labelText}
            </legend>
          ) : null}
          <div
            className={classnames(
              `${iotPrefix}--time-picker__wrapper ${iotPrefix}--time-picker__wrapper-${size}`,
              {
                [`${iotPrefix}--time-picker__wrapper--selected`]: focusedInput === 0 && openState,
                [`${iotPrefix}--time-picker--invalid`]: inputState.state === 'invalid',
              }
            )}
          >
            <TextInput
              onChange={handleOnChange}
              data-testid={`${testId}-input-1`}
              onFocus={() => handleOnFocus(0)}
              id={`${id}-1`}
              readOnly={readOnly}
              value={valueState}
              hideLabel={hideSecondaryLabel || hideLabel}
              aria-labelledby={hideSecondaryLabel ? `${id}-label` : undefined}
              className={`${iotPrefix}--time-picker-range__text-input-wrapper`}
              labelText={!hideSecondaryLabel ? labelText : ''}
              placeholder={is24hours ? placeholderText24h : placeholderText}
              size={size}
              warn={warnProp}
              invalid={invalidState}
              light={light}
              disabled={disabled}
              ref={inputRef}
            />
            <div
              data-testid={`${testId}-time-btn-1`}
              title={readOnly ? readOnlyBtnText : timeIconText}
              className={classnames(`${iotPrefix}--time-picker__icon`, {
                [`${iotPrefix}--time-picker__icon--invalid`]: invalidState,
                [`${iotPrefix}--time-picker__icon--warn`]: warnProp,
                [`${iotPrefix}--time-picker__icon--readonl`]: readOnly,
              })}
            >
              <inputState.firstIcon aria-hidden="true" focusable={false} />
            </div>
          </div>
          <div
            className={classnames(
              `${iotPrefix}--time-picker__wrapper ${iotPrefix}--time-picker__wrapper-${size}`,
              {
                [`${iotPrefix}--time-picker__wrapper--selected`]: focusedInput === 1 && openState,
                [`${iotPrefix}--time-picker--invalid`]: inputState.secondaryState === 'invalid',
              }
            )}
          >
            <TextInput
              data-testid={`${testId}-input-2`}
              id={`${id}-2`}
              onChange={handleOnChange}
              onFocus={() => handleOnFocus(1)}
              readOnly={readOnly}
              value={secondaryValueState}
              hideLabel={hideSecondaryLabel || hideLabel}
              aria-labelledby={hideSecondaryLabel ? `${id}-label` : undefined}
              className={`${iotPrefix}--time-picker-range__text-input-wrapper`}
              labelText={!hideSecondaryLabel ? secondaryLabelText : ''}
              placeholder={is24hours ? placeholderText24h : placeholderText}
              size={size}
              warn={secondaryWarnProp}
              invalid={secondaryInvalidState}
              light={light}
              disabled={disabled}
              ref={secondaryInputRef}
            />
            <div
              data-testid={`${testId}-time-btn-2`}
              title={readOnly ? readOnlyBtnText : timeIconText}
              className={classnames(`${iotPrefix}--time-picker__icon`, {
                [`${iotPrefix}--time-picker__icon--invalid`]: secondaryInvalidState,
                [`${iotPrefix}--time-picker__icon--warn`]: secondaryWarnProp,
                [`${iotPrefix}--time-picker__icon--readonly`]: readOnly,
              })}
            >
              <inputState.secondIcon aria-hidden="true" focusable={false} />
            </div>
          </div>
          <p
            data-testid={`${testId}-range__helper-text`}
            className={classnames(
              `${prefix}--form__helper-text`,
              `${iotPrefix}--time-picker-range__helper-text`,
              {
                [`${prefix}--form__helper-text--disabled`]: disabled,
                [`${iotPrefix}--time-picker--invalid`]: inputState.state === 'invalid',
              }
            )}
          >
            {inputState.text}
          </p>
          <p
            data-testid={`${testId}-range__helper-text--secondary`}
            className={classnames(
              `${prefix}--form__helper-text`,
              `${iotPrefix}--time-picker-range__helper-text--secondary`,
              {
                [`${prefix}--form__helper-text--disabled`]: disabled,
                [`${iotPrefix}--time-picker--invalid`]: inputState.secondaryState === 'invalid',
              }
            )}
          >
            {inputState.secondaryText}
          </p>
        </fieldset>
      )}
      {openState ? (
        <TimePickerSpinner
          onChange={handleOnChange}
          focusedInput={focusedInput}
          value={focusedInput === 0 ? valueState : secondaryValueState}
          testId={`${testId}-spinner`}
          position={position}
          ref={dropDownRef}
          style={style}
          is24hours={is24hours}
          amString={amString}
          pmString={pmString}
        />
      ) : null}
    </div>
  );
};

const listItemsForVertical24Hours = Array.from(Array(24)).map((el, i) => {
  const index = i < 10 ? `0${i}` : `${i}`;
  return { id: index, value: index };
});

const listItemsForVertical12Hours = listItemsForVertical24Hours.slice(1, 13);

const listItemsForVerticalMinutes = Array.from(Array(60)).map((el, i) => {
  const index = i < 10 ? `0${i}` : `${i}`;
  return { id: index, value: index };
});

const listItemsForVerticalMeridiem = (amString, pmString) => [
  { id: 'AM', value: amString },
  { id: 'PM', value: pmString },
];

const spinnerPropTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  testId: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),
  is24hours: PropTypes.bool,
  amString: PropTypes.string,
  pmString: PropTypes.string,
};

/* istanbul ignore next */
const defaultSpinnerProps = {
  value: '',
  testId: 'time-picker-spinner',
  onChange: () => {},
  style: {},
  is24hours: false,
  amString: 'AM',
  pmString: 'PM',
};

export const TimePickerSpinner = React.forwardRef(
  ({ onChange, position, value, testId, style, is24hours, amString, pmString }, ref) => {
    const currentTime = dayjs().format(AVAILABLE_FORMATS);

    const updatedStyle = useMemo(() => ({ ...style, '--zIndex': style.zIndex ?? 0 }), [style]);
    const firstVal = useMemo(
      () =>
        is24hours
          ? timeUtils.get24Hours(value, currentTime)
          : timeUtils.get12Hours(value, currentTime),
      [value, is24hours, currentTime]
    );
    const secondVal = useMemo(() => timeUtils.getMinutes(value, currentTime), [value, currentTime]);
    const thirdVal = useMemo(
      () =>
        is24hours
          ? ''
          : timeUtils.getMeridiem(value, currentTime, amString, pmString) === amString
          ? 'AM'
          : 'PM',
      [is24hours, value, currentTime, amString, pmString]
    );

    const [selected, setSelected] = useState([firstVal, secondVal, thirdVal]);
    const [callbackValue, setCallbackValue] = useState(value);
    const [, setFocusedSpinner] = useState(0);

    const secondSpinnerRef = useRef();
    const thirdSpinnerRef = useRef();

    const numberOfSpinners = is24hours ? 2 : 3;

    useEffect(() => {
      setSelected([firstVal, secondVal, thirdVal]);
    }, [firstVal, secondVal, thirdVal]);

    useEffect(() => {
      onChange(callbackValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callbackValue]);

    const handleOnClick = (str, index) => {
      setSelected((prev) => {
        const arr = [...prev];
        arr[index] = str;
        const newValue = is24hours ? `${arr[0]}:${arr[1]}` : `${arr[0]}:${arr[1]} ${arr[2]}`;
        setCallbackValue(newValue);
        return arr;
      });
    };

    /* eslint-disable no-unused-expressions */
    const handleRightArrowClick = useCallback(() => {
      setFocusedSpinner((prevValue) => {
        const nextSelected = (prevValue + 1) % numberOfSpinners;
        if (nextSelected === 0) {
          ref?.current.focus();
        }

        if (nextSelected === 1) {
          secondSpinnerRef?.current.focus();
        }

        if (nextSelected === 2) {
          thirdSpinnerRef?.current.focus();
        }
        return nextSelected;
      });
    }, [numberOfSpinners, ref]);

    const handleLeftArrowClick = useCallback(() => {
      const stepBehind = is24hours ? 1 : 2;
      setFocusedSpinner((prevValue) => {
        const nextSelected = (prevValue + stepBehind) % numberOfSpinners;
        if (nextSelected === 0) {
          ref?.current.focus();
        }

        if (nextSelected === 1) {
          secondSpinnerRef?.current.focus();
        }

        if (nextSelected === 2) {
          thirdSpinnerRef?.current.focus();
        }
        return nextSelected;
      });
    }, [is24hours, numberOfSpinners, ref]);
    /* eslint-enable no-unused-expressions */

    const listSpinner1 = useMemo(
      () => (
        <ListSpinner
          testId={`${testId}-list-spinner-1`}
          ref={ref}
          onClick={(e) => handleOnClick(e, 0)}
          list={is24hours ? listItemsForVertical24Hours : listItemsForVertical12Hours}
          defaultSelectedId={selected[0]}
          onRightArrowClick={handleRightArrowClick}
          onLeftArrowClick={handleLeftArrowClick}
        />
      ),
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [selected[0]]
    );
    const listSpinner2 = useMemo(
      () => (
        <ListSpinner
          testId={`${testId}-list-spinner-2`}
          ref={secondSpinnerRef}
          onClick={(e) => handleOnClick(e, 1)}
          list={listItemsForVerticalMinutes}
          defaultSelectedId={selected[1]}
          onRightArrowClick={handleRightArrowClick}
          onLeftArrowClick={handleLeftArrowClick}
        />
      ),
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [selected[1]]
    );
    const listSpinner3 = useMemo(
      () => {
        return (
          <ListSpinner
            testId={`${testId}-list-spinner-3`}
            ref={thirdSpinnerRef}
            className={classnames(`${iotPrefix}--time-picker-spinner-last-list-spinner`, {
              [`${iotPrefix}--time-picker-spinner-last-list-spinner--PM`]: selected[2] === pmString,
            })}
            onClick={(e) => handleOnClick(e, 2)}
            list={listItemsForVerticalMeridiem(amString, pmString)}
            defaultSelectedId={selected[2]}
            onRightArrowClick={handleRightArrowClick}
            onLeftArrowClick={handleLeftArrowClick}
          />
        );
      },
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [selected[2]]
    );

    const dropdown = (
      <div
        data-testid={testId}
        className={classnames(`${iotPrefix}--time-picker-spinner`, {
          [`${iotPrefix}--time-picker-spinner--24h`]: is24hours,
        })}
        style={{
          ...updatedStyle,
          left: `${position[0]}px`,
          top: `${position[1]}px`,
        }}
      >
        {listSpinner1}
        {listSpinner2}
        {is24hours ? null : listSpinner3}
      </div>
    );
    return ReactDOM.createPortal(dropdown, document.body);
  }
);

TimePickerSpinner.propTypes = spinnerPropTypes;
TimePickerSpinner.defaultProps = defaultSpinnerProps;

TimePickerDropdown.propTypes = propTypes;
TimePickerDropdown.defaultProps = defaultProps;
export default TimePickerDropdown;
