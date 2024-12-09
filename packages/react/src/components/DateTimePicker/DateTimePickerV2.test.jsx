import React from 'react';
import { mount } from 'enzyme';
import { render, fireEvent, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom/extend-expect';
import dayjs from '../../utils/dayjs';
import {
  INTERVAL_VALUES,
  RELATIVE_VALUES,
  PRESET_VALUES,
  PICKER_KINDS,
} from '../../constants/DateConstants';
import { settings } from '../../constants/Settings';
import { FlyoutMenuDirection } from '../FlyoutMenu/FlyoutMenu';

import DateTimePicker from './DateTimePickerV2';
import { defaultAbsoluteValue, defaultRelativeValue } from './DateTimePickerV2.story';

const defaultPresets = [
  ...PRESET_VALUES,
  {
    label: 'Last 70 minutes',
    offset: 70,
  },
];

const { iotPrefix, prefix } = settings;

const dateTimePickerProps = {
  testId: 'date-time-picker',
  onCancel: jest.fn(),
  onApply: jest.fn(),
  dateTimeMask: 'YYYY-MM-DD HH:mm',
};

const i18n = {
  presetLabels: ['Last 30 minutes', 'Missed in translation'],
  intervalLabels: ['minutes', 'Missed in translation'],
  relativeLabels: ['Missed in translation'],
  invalidText: 'The date time entered is invalid',
  invalidLabel: 'Invalid',
};

const generateBoundingClientRect =
  ({ x, y, height = 50, width = 50 }) =>
  () => ({
    x,
    y,
    height,
    width,
    top: y,
    bottom: y + height,
    left: x,
    right: x + width,
  });

describe('DateTimePickerV2', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockClear();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it('should not blow up if correct object is passed as default value', () => {
    mount(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={[
          {
            label: 'Last 30 minutes',
            offset: 30,
          },
          {
            label: 'Last 1 hour',
            offset: 60,
          },
        ]}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          // test not having id
          timeRangeValue: {
            label: 'Last 30 minutes',
            offset: 30,
          },
        }}
      />
    );
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should not blow up if correct object is passed as default value (new time spinner)', () => {
    mount(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        presets={[
          {
            label: 'Last 30 minutes',
            offset: 30,
          },
          {
            label: 'Last 1 hour',
            offset: 60,
          },
        ]}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          // test not having id
          timeRangeValue: {
            label: 'Last 30 minutes',
            offset: 30,
          },
        }}
      />
    );
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should blow up if wrong combo of timeRangeKind and timeRangeValue is passed for defaultValue', () => {
    mount(
      <DateTimePicker
        {...dateTimePickerProps}
        preset={defaultPresets}
        defaultValue={{
          timeRangeKind: 'some other string',
          timeRangeValue: PRESET_VALUES[1],
        }}
      />
    );
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should have the first preset as value', () => {
    render(<DateTimePicker {...dateTimePickerProps} i18n={i18n} />);
    expect(screen.getByText(PRESET_VALUES[0].label)).toBeVisible();
  });

  it('should have the first preset as value (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} useNewTimeSpinner i18n={i18n} />);
    expect(screen.getByText(PRESET_VALUES[0].label)).toBeVisible();
  });

  it('should change to another preset value when clicked', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={[
          {
            label: 'Last 30 minutes',
            offset: 30,
          },
          {
            label: 'Last 1 hour',
            offset: 60,
          },
        ]}
      />
    );
    // open the dropdown
    // the first element is the button. the second element is the svg
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // select last 1 hour
    userEvent.click(screen.getByText(/Last 1 hour/));
    // check for the selected text
    expect(screen.getAllByText(/Last 1 hour/)).toHaveLength(2);
  });

  it('should change to another preset value when clicked (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        presets={[
          {
            label: 'Last 30 minutes',
            offset: 30,
          },
          {
            label: 'Last 1 hour',
            offset: 60,
          },
        ]}
      />
    );
    // open the dropdown
    // the first element is the button. the second element is the svg
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // select last 1 hour
    userEvent.click(screen.getByText(/Last 1 hour/));
    // check for the selected text
    expect(screen.getAllByText(/Last 1 hour/)).toHaveLength(2);
  });

  it('should show the user defined tooltip for preset', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        renderPresetTooltipText={() => 'User tooltip'}
        preset={defaultPresets}
      />
    );
    expect(screen.getByText('User tooltip')).toBeInTheDocument();
  });

  it('should show the user defined tooltip for preset (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        renderPresetTooltipText={() => 'User tooltip'}
        preset={defaultPresets}
      />
    );
    expect(screen.getByText('User tooltip')).toBeInTheDocument();
  });

  it('should call onApply', () => {
    render(<DateTimePicker {...dateTimePickerProps} preset={defaultPresets} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should call onApply (new time spinner)', () => {
    render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} preset={defaultPresets} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('onCancel should be called', () => {
    render(<DateTimePicker {...dateTimePickerProps} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText('Cancel'));
    expect(dateTimePickerProps.onCancel).toHaveBeenCalled();
  });

  it('onCancel should be called (new time spinner)', () => {
    render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText('Cancel'));
    expect(dateTimePickerProps.onCancel).toHaveBeenCalled();
  });

  it('should render with a predefined preset', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[1],
        }}
      />
    );
    expect(screen.getByText(PRESET_VALUES[1].label)).toBeVisible();
  });

  it('should render with a predefined preset (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[1],
        }}
      />
    );
    expect(screen.getByText(PRESET_VALUES[1].label)).toBeVisible();
  });

  it('should render with a predefined relative range', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultRelativeValue} />);

    // default value is 20 minutes relative to today at 13:30

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // change the last interval to days, meaning 20 days relative to today at 13:30
    fireEvent.change(screen.getAllByLabelText('Select')[0], {
      target: { value: INTERVAL_VALUES.DAYS },
    });
    // change the relative to yesterady, meaning 20 days relative to yesterday at 13:30
    fireEvent.change(screen.getAllByLabelText('Select')[1], {
      target: { value: RELATIVE_VALUES.YESTERDAY },
    });

    const yesterday = dayjs().subtract(1, 'day');
    const from = yesterday.subtract(20, 'day');

    // expect 20 day range relative to yesterday at 13:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 13:30 to ${yesterday.format('YYYY-MM-DD')} 13:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByLabelText('Increment hours'));
    // expect 20 day range relative to yesterday at 14:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 14:30 to ${yesterday.format('YYYY-MM-DD')} 14:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByLabelText('Increment hours'));
    // expect 20 day range relative to yesterday at 15:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 15:30 to ${yesterday.format('YYYY-MM-DD')} 15:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should render with a predefined relative range (new time spinner) ', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={defaultRelativeValue}
      />
    );

    // default value is 20 minutes relative to today at 13:30

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // change the last interval to days, meaning 20 days relative to today at 13:30
    fireEvent.change(screen.getAllByLabelText('Select')[0], {
      target: { value: INTERVAL_VALUES.DAYS },
    });
    // change the relative to yesterady, meaning 20 days relative to yesterday at 13:30
    fireEvent.change(screen.getAllByLabelText('Select')[1], {
      target: { value: RELATIVE_VALUES.YESTERDAY },
    });

    const yesterday = dayjs().subtract(1, 'day');
    const from = yesterday.subtract(20, 'day');

    // expect 20 day range relative to yesterday at 13:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 13:30 to ${yesterday.format('YYYY-MM-DD')} 13:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByLabelText('Increment hours'));
    // expect 20 day range relative to yesterday at 14:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 14:30 to ${yesterday.format('YYYY-MM-DD')} 14:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByLabelText('Increment hours'));
    // expect 20 day range relative to yesterday at 15:30
    expect(
      screen.getByText(
        `${from.format('YYYY-MM-DD')} 15:30 to ${yesterday.format('YYYY-MM-DD')} 15:30`
      )
    ).toBeVisible();

    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should render with a predefined absolute range', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultAbsoluteValue} />);

    // default value starts at   '2020-04-01' at 12:34 to 2020-04-06 at 10:49
    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getAllByLabelText('Increment hours')[0]);
    expect(screen.getByText('2020-04-01 13:34 to 2020-04-06 10:49')).toBeVisible();

    userEvent.click(screen.getAllByLabelText('Increment hours')[1]);
    expect(screen.getByText('2020-04-01 13:34 to 2020-04-06 11:49')).toBeVisible();

    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should render with a predefined absolute range (new time spinner and 12 hours time)', () => {
    render(
      <DateTimePicker
        useNewTimeSpinner
        {...dateTimePickerProps}
        dateTimeMask="YYYY-MM-DD hh:mm A"
        defaultValue={defaultAbsoluteValue}
      />
    );

    // default value starts at   '2020-04-01' at 12:34 to 2020-04-06 at 10:49
    expect(screen.getByText('2020-04-01 12:34 PM to 2020-04-06 10:49 AM')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // open start time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input-1'));

    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('05')
    );
    // select miniute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('03')
    );
    // select AM/PM
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-3')).getByText('AM')
    );

    screen.getByTestId('date-time-picker-spinner').blur();

    // open end time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input-2'));
    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('05')
    );
    // select minute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('03')
    );
    // select AM/PM
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-3')).getByText('PM')
    );
    screen.getByTestId('date-time-picker-spinner').blur();
    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should render with a predefined absolute range (new time spinner and 24 hours format time)', () => {
    render(
      <DateTimePicker
        useNewTimeSpinner
        {...dateTimePickerProps}
        defaultValue={defaultAbsoluteValue}
      />
    );

    // default value starts at   '2020-04-01' at 12:34 to 2020-04-06 at 10:49
    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // open start time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input-1'));

    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('13')
    );
    // select miniute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('34')
    );

    screen.getByTestId('date-time-picker-spinner').blur();

    // open end time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input-2'));
    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('11')
    );
    // select minute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('49')
    );

    screen.getByTestId('date-time-picker-spinner').blur();
    expect(screen.getByText('2020-04-01 13:34 to 2020-04-06 11:49')).toBeVisible();
    userEvent.click(screen.getByText('Apply'));
    expect(dateTimePickerProps.onApply).toHaveBeenCalled();
  });

  it('should render with a predefined single select date and 12 hours time format time', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34 AM
    expect(screen.getByText('2020-04-01 12:34 AM')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByText(/2020-04-01 12:34 AM/i)[0]);

    const startTime = screen.getByTestId('date-time-picker-input');
    // open time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input'));
    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('05')
    );
    // select miniute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('03')
    );
    // select AM/PM
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-3')).getByText('PM')
    );

    expect(startTime).toHaveValue('05:03 PM');
    expect(screen.getByText('2020-04-01 05:03 PM')).toBeVisible();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();
  });

  it('should render with a predefined single select date and 24 hours time format time', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD HH:mm"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34
    expect(screen.getByText('2020-04-01 12:34')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByText(/2020-04-01 12:34/i)[0]);

    const startTime = screen.getByTestId('date-time-picker-input');
    // open time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input'));
    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('23')
    );
    // select miniute
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-2')).getByText('03')
    );

    expect(startTime).toHaveValue('23:03');
    expect(screen.getByText('2020-04-01 23:03')).toBeVisible();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();
  });

  it('should render with a predefined single select when default start date and start time are null', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: null,
            startTime: null,
          },
        }}
      />
    );
    // default value is YYYY-MM-DD hh:mm XM
    expect(screen.getByText('YYYY-MM-DD hh:mm XM')).toBeVisible();
  });

  it('should clear date and time fields when click clear button in single select', () => {
    const mockOnClear = jest.fn();
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        onApply={jest.fn()}
        onClear={mockOnClear}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34 AM
    expect(screen.getByText('2020-04-01 12:34 AM')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByText(/2020-04-01 12:34 AM/i)[0]);

    userEvent.click(screen.getByText(/clear/i));

    expect(screen.getByText('YYYY-MM-DD hh:mm XM')).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mockOnClear).toHaveBeenCalledWith({
      timeRangeKind: 'SINGLE',
      timeRangeValue: null,
      timeSingleValue: {
        ISOStart: null,
        start: null,
        startDate: null,
        startTime: null,
        humanValue: 'YYYY-MM-DD hh:mm A',
        tooltipValue: 'YYYY-MM-DD hh:mm A',
      },
    });
  });

  it('should not disable apply button when clear time picker input in single select', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        onApply={jest.fn()}
        onClear={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34 AM
    expect(screen.getByText('2020-04-01 12:34 AM')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByText(/2020-04-01 12:34 AM/i)[0]);
    userEvent.click(screen.getByText(i18n.resetBtnLabel));
    expect(screen.getByText('YYYY-MM-DD hh:mm XM')).toBeVisible();

    // open the calendar again
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();
  });

  it('should go back to presets when cancel button is picked on absolute screen', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultAbsoluteValue} />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText(/Back/));
    expect(screen.getByText(/Custom Range/i)).toBeInTheDocument();
  });

  it('should go back to presets when cancel button is picked on absolute screen (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultAbsoluteValue} />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText(/Back/));
    expect(screen.getByText(/Custom Range/i)).toBeInTheDocument();
  });

  it('should switch from relative to absolute and then to preset', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultRelativeValue} />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // There should only be one on the relative page
    expect(screen.getAllByTitle(/Increment hours/).length).toEqual(1);

    userEvent.click(screen.getAllByText('Absolute')[0]);

    // There should be two on the Absolute page
    expect(screen.getAllByTitle(/Increment hours/).length).toEqual(2);

    userEvent.click(screen.getAllByText('Absolute')[0]);
  });

  it('should switch from relative to absolute and then to preset (new time spinner)', () => {
    render(
      <DateTimePicker
        useNewTimeSpinner
        {...dateTimePickerProps}
        defaultValue={defaultRelativeValue}
      />
    );

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // There should only be one on the relative page
    expect(screen.getAllByTitle(/Increment hours/).length).toEqual(1);

    userEvent.click(screen.getAllByText('Absolute')[0]);

    // There should be two on the Absolute page
    expect(screen.getAllByTestId('date-time-picker-input-1').length).toEqual(1);
    expect(screen.getAllByTestId('date-time-picker-input-2').length).toEqual(1);

    userEvent.click(screen.getAllByText('Absolute')[0]);
  });

  it('should not show the relative option', () => {
    const wrapper = mount(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={defaultAbsoluteValue}
        showRelativeOption={false}
        hasTimeInput={false}
      />
    );
    expect(wrapper.find(`.${iotPrefix}--date-time-picker__field`)).toHaveLength(1);
    expect(wrapper.find(`.${prefix}--radio-button`)).toHaveLength(0);
  });

  it('should not show the relative option (new time spinner)', () => {
    const wrapper = mount(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={defaultAbsoluteValue}
        showRelativeOption={false}
        hasTimeInput={false}
      />
    );
    expect(wrapper.find(`.${iotPrefix}--date-time-picker__field`)).toHaveLength(1);
    expect(wrapper.find(`.${prefix}--radio-button`)).toHaveLength(0);
  });

  // https://github.com/IBM/carbon-addons-iot-react/issues/1179
  it('should not show the relative option with preset as default value', () => {
    const wrapper = mount(
      <DateTimePicker
        {...dateTimePickerProps}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[1],
        }}
        showRelativeOption={false}
      />
    );
    expect(wrapper.find(`.${iotPrefix}--date-time-picker__field`)).toHaveLength(1);
    expect(wrapper.find(`.${prefix}--radio-button`)).toHaveLength(0);
  });

  it('should not show the relative option with preset as default value (new time spinner)', () => {
    const wrapper = mount(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[1],
        }}
        showRelativeOption={false}
      />
    );
    expect(wrapper.find(`.${iotPrefix}--date-time-picker__field`)).toHaveLength(1);
    expect(wrapper.find(`.${prefix}--radio-button`)).toHaveLength(0);
  });

  it('should set the value relative to yesterday', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        intervals={[
          {
            label: 'minutes',
            value: INTERVAL_VALUES.MINUTES,
          },
        ]}
        relatives={[
          {
            label: 'Yesterday',
            value: RELATIVE_VALUES.YESTERDAY,
          },
        ]}
      />
    );

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getByText(/Custom Range/));
    const yesterday = dayjs().subtract(1, 'days');

    userEvent.click(screen.getByLabelText('Increment hours'));
    expect(
      screen.getByText(
        `${yesterday.subtract(1, 'minute').format('YYYY-MM-DD')} 01:00 to ${yesterday.format(
          'YYYY-MM-DD'
        )} 01:00`
      )
    ).toBeVisible();
  });

  it('should set the value relative to yesterday (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        intervals={[
          {
            label: 'minutes',
            value: INTERVAL_VALUES.MINUTES,
          },
        ]}
        relatives={[
          {
            label: 'Yesterday',
            value: RELATIVE_VALUES.YESTERDAY,
          },
        ]}
      />
    );

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getByText(/Custom Range/));
    const yesterday = dayjs().subtract(1, 'days');

    userEvent.click(screen.getByLabelText('Increment hours'));
    expect(
      screen.getByText(
        `${yesterday.subtract(1, 'minute').format('YYYY-MM-DD')} 01:00 to ${yesterday.format(
          'YYYY-MM-DD'
        )} 01:00`
      )
    ).toBeVisible();
  });

  it('should switch from relative to presets', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultRelativeValue} />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    expect(screen.getByText('Relative')).toBeInTheDocument();

    // go back to preset
    userEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Custom Range')).toBeInTheDocument();
  });

  it('should switch from relative to presets (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={defaultRelativeValue}
      />
    );

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    expect(screen.getByText('Relative')).toBeInTheDocument();

    // go back to preset
    userEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Custom Range')).toBeInTheDocument();
  });

  it('should keep preset value when switching from presets to relative and back', () => {
    render(<DateTimePicker {...dateTimePickerProps} />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getByText(/Custom Range/));

    // go back to preset
    userEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Custom Range')).toBeInTheDocument();
  });

  it('should keep preset value when switching from presets to relative and back (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} useNewTimeSpinner />);

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getByText(/Custom Range/));

    // go back to preset
    userEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Custom Range')).toBeInTheDocument();
  });

  it('should render with programmatically set absolute range', () => {
    const { rerender } = render(<DateTimePicker {...dateTimePickerProps} />);

    expect(screen.getByText(PRESET_VALUES[0].label)).toBeVisible();

    rerender(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultAbsoluteValue} />);

    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    userEvent.click(screen.getAllByLabelText('Increment hours')[0]);
    expect(screen.getByText('2020-04-01 13:34 to 2020-04-06 10:49')).toBeVisible();

    userEvent.click(screen.getByText('Back'));
    userEvent.click(screen.getByText('Cancel'));

    expect(dateTimePickerProps.onCancel).toHaveBeenCalled();
    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();
  });

  it('should render with programmatically set absolute range (new time spinner)', () => {
    const { rerender } = render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} />);

    expect(screen.getByText(PRESET_VALUES[0].label)).toBeVisible();

    rerender(
      <DateTimePicker
        useNewTimeSpinner
        {...dateTimePickerProps}
        defaultValue={defaultAbsoluteValue}
      />
    );

    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // open start time picker
    fireEvent.focus(screen.getByTestId('date-time-picker-input-1'));

    // select hour
    userEvent.click(
      within(screen.getByTestId('date-time-picker-spinner-list-spinner-1')).getByText('01')
    );
    screen.getByTestId('date-time-picker-spinner').blur();

    expect(screen.getByText('2020-04-01 01:34 to 2020-04-06 10:49')).toBeVisible();

    userEvent.click(screen.getByText('Back'));
    userEvent.click(screen.getByText('Cancel'));

    expect(dateTimePickerProps.onCancel).toHaveBeenCalled();
    expect(screen.getByText('2020-04-01 12:34 to 2020-04-06 10:49')).toBeVisible();
  });

  it('changing the absolute range and applying', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultAbsoluteValue} />);
    // first open the menu and select custom range
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // Select custom range
    expect(screen.getByText(/Custom range/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/Custom range/i));
    // Select absolute
    expect(screen.getByText(/Absolute/)).toBeInTheDocument();
    userEvent.click(screen.getByText(/Absolute/i));
    fireEvent.click(screen.getByLabelText('April 10, 2020'));
    fireEvent.click(screen.getByLabelText('April 11, 2020'));
    expect(screen.getByTitle('2020-04-10 12:34 to 2020-04-11 10:49')).toBeVisible();
    userEvent.click(screen.getByText('Apply'));
    // This should be displayed
    expect(screen.getByTitle('2020-04-10 12:34 to 2020-04-11 10:49')).toBeVisible();
  });

  it('changing the absolute range and applying (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        defaultValue={defaultAbsoluteValue}
        useNewTimeSpinner
      />
    );
    // first open the menu and select custom range
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    // Select custom range
    expect(screen.getByText(/Custom range/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/Custom range/i));
    // Select absolute
    expect(screen.getByText(/Absolute/)).toBeInTheDocument();
    userEvent.click(screen.getByText(/Absolute/i));
    fireEvent.click(screen.getByLabelText('April 10, 2020'));
    fireEvent.click(screen.getByLabelText('April 11, 2020'));
    expect(screen.getByTitle('2020-04-10 12:34 to 2020-04-11 10:49')).toBeVisible();
    userEvent.click(screen.getByText('Apply'));
    // This should be displayed
    expect(screen.getByTitle('2020-04-10 12:34 to 2020-04-11 10:49')).toBeVisible();
  });

  it('verify flyout testids exist', () => {
    render(<DateTimePicker {...dateTimePickerProps} defaultValue={defaultRelativeValue} />);

    // the initial flyout id should be there
    expect(screen.getByTestId('date-time-picker-datepicker-flyout-container')).toBeInTheDocument();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // now the menu should be there
    expect(screen.getByTestId('date-time-picker-datepicker-flyout')).toBeInTheDocument();
  });

  it('verify flyout testids exist (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        defaultValue={defaultRelativeValue}
      />
    );

    // the initial flyout id should be there
    expect(screen.getByTestId('date-time-picker-datepicker-flyout-container')).toBeInTheDocument();

    // first open the menu
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);

    // now the menu should be there
    expect(screen.getByTestId('date-time-picker-datepicker-flyout')).toBeInTheDocument();
  });

  it('i18n string test', () => {
    const i18nTest = {
      toLabel: 'to-label',
      toNowLabel: 'to-now-label',
      calendarLabel: 'calendar-label',
      presetLabels: ['last-30-min', 'last-1-hour', 'last-6-hour', 'last-12-hour', 'last-24-hour'],
      intervalLabels: ['mins', 'hrs', 'dys', 'wks', 'mths', 'yrs'],
      relativeLabels: ['today', 'yesterday'],
      customRangeLinkLabel: 'custom-range',
      customRangeLabel: 'custom-range-2',
      relativeLabel: 'relative',
      lastLabel: 'last',
      invalidNumberLabel: 'number-is-not-valid',
      relativeToLabel: 'relative-to',
      absoluteLabel: 'absolute',
      startTimeLabel: 'start-time',
      endTimeLabel: 'end-time',
      applyBtnLabel: 'apply',
      cancelBtnLabel: 'cancel',
      backBtnLabel: 'back',
    };

    const presets = [
      {
        id: 'item-01',
        label: 'last-30-min',
        offset: 30,
      },
      {
        id: 'item-02',
        label: 'last-1-hour',
        offset: 60,
      },
      {
        id: 'item-03',
        label: 'last-6-hour',
        offset: 360,
      },
      {
        id: 'item-04',
        label: 'last-12-hour',
        offset: 720,
      },
      {
        id: 'item-05',
        label: 'last-24-hour',
        offset: 1440,
      },
    ];

    const i18nDefault = DateTimePicker.defaultProps.i18n;

    const relatives = [
      {
        label: 'today2',
        value: RELATIVE_VALUES.TODAY,
      },
      {
        label: 'yesterday2',
        value: RELATIVE_VALUES.YESTERDAY,
      },
    ];

    render(
      <DateTimePicker id="datetimepicker" presets={presets} i18n={i18nTest} relatives={relatives} />
    );

    // first open the menu
    userEvent.click(screen.getAllByLabelText(i18nTest.calendarLabel)[0]);

    i18nTest.presetLabels.forEach((label) => {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText(i18nTest.toNowLabel, { exact: false })[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(i18nTest.calendarLabel)).toHaveLength(3);
    expect(screen.getByText(i18nTest.customRangeLinkLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.applyBtnLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.cancelBtnLabel)).toBeInTheDocument();

    i18nDefault.presetLabels.forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
    expect(screen.queryByText(i18nDefault.toNowLabel, { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(i18nDefault.calendarLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.customRangeLinkLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.applyBtnLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.cancelBtnLabel)).not.toBeInTheDocument();
    // custom relative range screen
    fireEvent.click(screen.getByText(i18nTest.customRangeLinkLabel));
    i18nTest.intervalLabels.forEach((label) => {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    });
    i18nTest.relativeLabels.forEach((label) => {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    });
    expect(screen.getByText(i18nTest.customRangeLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.backBtnLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.relativeLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.lastLabel)).toBeInTheDocument();

    i18nDefault.intervalLabels.forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
    i18nDefault.relativeLabels.forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
    expect(screen.queryByText(i18nDefault.customRangeLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.backBtnLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.relativeLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.lastLabel)).not.toBeInTheDocument();
    // custom range absolute screen.
    fireEvent.click(screen.getByText(i18nTest.absoluteLabel));
    expect(screen.getByText(i18nTest.startTimeLabel)).toBeInTheDocument();
    expect(screen.getByText(i18nTest.endTimeLabel)).toBeInTheDocument();

    expect(screen.queryByText(i18nDefault.startTimeLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.endTimeLabel)).not.toBeInTheDocument();
    // click apply
    expect(screen.getByText(i18nTest.applyBtnLabel)).toBeDisabled();
    userEvent.click(screen.getAllByLabelText('Increment hours')[0]);
    expect(screen.getAllByTitle(new RegExp(`.*${i18nTest.toLabel}.*`))[0]).toBeInTheDocument();
    fireEvent.click(screen.getByText(i18nTest.applyBtnLabel));

    expect(
      screen.queryByTitle(new RegExp(`.*\\s${i18nDefault.toLabel}\\s.*`))
    ).not.toBeInTheDocument();
  });

  it('should parse default values with start/end', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: '2021-08-01 12:34',
            end: '2021-08-06 10:49',
          },
        }}
      />
    );

    expect(screen.getByText('2021-08-01 12:34 to 2021-08-06 10:49')).toBeVisible();
  });

  it('should parse default values with start/end (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: '2021-08-01 12:34',
            end: '2021-08-06 10:49',
          },
        }}
      />
    );

    expect(screen.getByText('2021-08-01 12:34 to 2021-08-06 10:49')).toBeVisible();
  });

  it('should not render a time picker if hasTimeInput:false', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    userEvent.click(screen.getByText('2021-08-01 12:34 to 2021-08-06 10:49'));
    expect(screen.queryByLabelText('Start time')).toBeNull();
    expect(screen.queryByLabelText('End time')).toBeNull();
  });

  it('should not render a time picker if hasTimeInput:false (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        id="picker-test"
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    userEvent.click(screen.getByText('2021-08-01 to 2021-08-06'));
    expect(screen.queryByLabelText('Start time')).toBeNull();
    expect(screen.queryByLabelText('End time')).toBeNull();
  });

  it('should fallback to minute intervals if none given in a relative defaultValue', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 20,
            relativeToWhen: RELATIVE_VALUES.TODAY,
            relativeToTime: '13:30',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });

  it('should fallback to minute intervals if none given in a relative defaultValue (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        id="picker-test"
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 20,
            relativeToWhen: RELATIVE_VALUES.TODAY,
            relativeToTime: '13:30',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });

  it('should render light when given', () => {
    const { container } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 20,
            relativeToWhen: RELATIVE_VALUES.TODAY,
            relativeToTime: '13:30',
          },
        }}
        light
      />
    );
    jest.runAllTimers();

    expect(container.querySelectorAll(`.${iotPrefix}--date-time-picker__box--light`)).toHaveLength(
      1
    );
  });

  it('should render light when given (new time spinner)', () => {
    const { container } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        useNewTimeSpinner
        hasTimeInput={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 20,
            relativeToWhen: RELATIVE_VALUES.TODAY,
            relativeToTime: '13:30',
          },
        }}
        light
      />
    );
    jest.runAllTimers();

    expect(container.querySelectorAll(`.${iotPrefix}--date-time-picker__box--light`)).toHaveLength(
      1
    );
  });

  it('should fallback to empty for absolute times when none given', () => {
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Custom Range'));
    userEvent.click(screen.getByText('Absolute'));
    expect(screen.getAllByTestId('time-picker-spinner')[0]).toHaveValue('');
  });

  it('should fallback to empty for absolute times when none given (new time spinner)', () => {
    render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Custom Range'));
    userEvent.click(screen.getByText('Absolute'));
    expect(screen.getByTestId('date-time-picker-input-1')).toHaveValue('');
    expect(screen.getByTestId('date-time-picker-input-2')).toHaveValue('');
  });

  it('should not show the Custom Range link when showCustomRangeLink:false', () => {
    render(
      <DateTimePicker {...dateTimePickerProps} showCustomRangeLink={false} id="picker-test" />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    expect(screen.queryByText('Custom Range')).toBeNull();
  });

  it('should not show the Custom Range link when showCustomRangeLink:false (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        showCustomRangeLink={false}
        id="picker-test"
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    expect(screen.queryByText('Custom Range')).toBeNull();
  });

  it('should show relative labels', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        relatives={[
          {
            label: 'Quarter',
            value: 'quarter',
          },
        ]}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: '2021-08-01 12:34',
            end: '2021-08-06 10:49',
          },
        }}
        id="picker-test"
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Relative'));
    expect(screen.getByText('Quarter')).toBeInTheDocument();
  });

  it('should show relative labels (new time spinner)', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        relatives={[
          {
            label: 'Quarter',
            value: 'quarter',
          },
        ]}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: '2021-08-01 12:34',
            end: '2021-08-06 10:49',
          },
        }}
        id="picker-test"
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Relative'));
    expect(screen.getByText('Quarter')).toBeInTheDocument();
  });

  it('should show a warning in __DEV__', () => {
    const { __DEV__ } = global;
    global.__DEV__ = true;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'The `DateTimePickerV2` is an experimental component and could be lacking unit test and documentation.'
      )
    );
    jest.resetAllMocks();
    global.__DEV__ = __DEV__;
  });

  it('should change --wrapper-width when hasIconOnly:true', () => {
    render(<DateTimePicker {...dateTimePickerProps} hasIconOnly />);
    expect(screen.getByTestId('date-time-picker')).toHaveStyle('--wrapper-width:3rem');
  });

  it('should change --wrapper-width when hasIconOnly:true (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} useNewTimeSpinner hasIconOnly />);
    expect(screen.getByTestId('date-time-picker')).toHaveStyle('--wrapper-width:3rem');
  });

  it('should disable apply button when number input is invalid', () => {
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.queryByText(DateTimePicker.defaultProps.i18n.customRangeLinkLabel));
    expect(screen.getByText('Apply')).toBeEnabled();
    const numberInput = screen.getByLabelText(
      'Numeric input field with increment and decrement buttons'
    );
    expect(numberInput).toBeValid();

    // Empty value is invalid
    userEvent.type(numberInput, '{backspace}');
    expect(numberInput).toBeInvalid();
    expect(screen.getByText('Apply')).toBeDisabled();

    // 0 is valid
    userEvent.type(numberInput, '1');
    expect(numberInput).toBeValid();
    expect(screen.getByText('Apply')).toBeEnabled();

    // -1 is invalid
    userEvent.type(numberInput, '{backspace}-1');
    expect(numberInput).toBeInvalid();
    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('should disable apply button when number input is invalid (new time spinner)', () => {
    render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.queryByText(DateTimePicker.defaultProps.i18n.customRangeLinkLabel));
    expect(screen.getByText('Apply')).toBeEnabled();
    const numberInput = screen.getByLabelText(
      'Numeric input field with increment and decrement buttons'
    );
    expect(numberInput).toBeValid();

    // Empty value is invalid
    userEvent.type(numberInput, '{backspace}');
    expect(numberInput).toBeInvalid();
    expect(screen.getByText('Apply')).toBeDisabled();

    // 0 is valid
    userEvent.type(numberInput, '1');
    expect(numberInput).toBeValid();
    expect(screen.getByText('Apply')).toBeEnabled();

    // -1 is invalid
    userEvent.type(numberInput, '{backspace}-1');
    expect(numberInput).toBeInvalid();
    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('should disable apply button when relative TimePickerSpinner input is invalid', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.queryByText(DateTimePicker.defaultProps.i18n.customRangeLinkLabel));
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();
    const relativeToTime = screen.getByPlaceholderText('hh:mm');
    expect(relativeToTime).toBeValid();

    // set time to 1
    userEvent.type(relativeToTime, '1');
    expect(relativeToTime).toBeInvalid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // set time to 11:11
    userEvent.type(relativeToTime, '1:11');
    expect(relativeToTime).toBeValid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // set time to 11:61
    userEvent.type(relativeToTime, '{backspace}{backspace}61');
    expect(relativeToTime).toBeInvalid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when relative TimePickerSpinner input is invalid (new time spinner)', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(<DateTimePicker useNewTimeSpinner {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.queryByText(DateTimePicker.defaultProps.i18n.customRangeLinkLabel));
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();
    const relativeToTime = screen.getByPlaceholderText('hh:mm');
    expect(relativeToTime).toBeValid();

    // set time to 1
    userEvent.type(relativeToTime, '1');
    expect(relativeToTime).toBeInvalid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // set time to 11:11
    userEvent.type(relativeToTime, '1:11');
    expect(relativeToTime).toBeValid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // set time to 11:61
    userEvent.type(relativeToTime, '{backspace}{backspace}61');
    expect(relativeToTime).toBeInvalid();
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when absolute TimePickerSpinner input is invalid on the same day', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2020, 3, 1, 12, 34, 0),
            end: new Date(2020, 3, 1, 11, 49, 0),
            startDate: '2020-04-01',
            startTime: '12:34',
            endDate: '2020-04-01',
            endTime: '11:49',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));

    // Get start and end time inputs
    const startTime = screen.getAllByTestId('time-picker-spinner')[0];
    const endTime = screen.getAllByTestId('time-picker-spinner')[1];

    const timeRange = screen.getByTestId('date-time-picker__field');

    expect(timeRange).toHaveTextContent('2020-04-01 12:34 to 2020-04-01 11:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-01 11:49
    userEvent.type(startTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:34');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('11:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-01 11:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // 2020-04-01 13:34 to 2020-04-01 12:49
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}12:49');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('12:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-01 12:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // 2020-04-01 13:34 to 2020-04-01 13:49
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:49');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-01 13:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:50 to 2020-04-01 13:49
    userEvent.type(startTime, '{backspace}{backspace}50');
    expect(startTime).toHaveValue('13:50');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:50 to 2020-04-01 13:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}9999');
    userEvent.type(startTime, '{backspace}{backspace}51');
    expect(startTime).toHaveValue('13:51');
    expect(endTime).toHaveValue('9999');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when absolute TimePickerSpinner input is invalid on the same day (with new time spinner)', () => {
    const { i18n } = DateTimePicker.defaultProps;

    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        dateTimeMask="YYYY-MM-DD HH:mm A"
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2020, 3, 1, 12, 34, 0),
            end: new Date(2020, 3, 1, 11, 49, 0),
            startDate: '2020-04-01',
            startTime: '12:34',
            endDate: '2020-04-01',
            endTime: '11:49',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));

    const timeRange = screen.getByTestId('date-time-picker__field');
    const startTime = screen.getByTestId('date-time-picker-input-1');
    const endTime = screen.getByTestId('date-time-picker-input-2');

    expect(timeRange).toHaveTextContent('2020-04-01 12:34 PM to 2020-04-01 11:49 AM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // 2020-04-01 13:34 to 2020-04-01 11:49
    fireEvent.focus(startTime);
    userEvent.type(startTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:34');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('11:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 PM to 2020-04-01 11:49 AM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // 2020-04-01 13:34 to 2020-04-01 12:49
    fireEvent.focus(endTime);
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}12:49');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('12:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 PM to 2020-04-01 12:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    // 2020-04-01 13:34 to 2020-04-01 13:49
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:49');
    endTime.blur();
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 PM to 2020-04-01 13:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:50 to 2020-04-01 13:49
    fireEvent.focus(startTime);
    userEvent.type(startTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:50');
    expect(startTime).toHaveValue('13:50');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:50 PM to 2020-04-01 13:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();

    userEvent.type(startTime, '{backspace}{backspace}51');

    fireEvent.focus(endTime);
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}9999');
    endTime.blur();
    expect(startTime).toHaveValue('13:51');
    expect(endTime).toHaveValue('9999');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when switching from presets to relative then to absolute with empty startDate and endDate', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Custom Range'));
    userEvent.click(screen.getByText('Absolute'));
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when switching from presets to relative then to absolute with empty startDate and endDate (new time spinner)', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(<DateTimePicker {...dateTimePickerProps} id="picker-test" useNewTimeSpinner />);
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));
    userEvent.click(screen.getByText('Custom Range'));
    userEvent.click(screen.getByText('Absolute'));
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should enable apply button when absolute DatePicker input has start and end date in different dates', () => {
    const { i18n } = DateTimePicker.defaultProps;
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2020, 3, 1, 12, 34, 0),
            end: new Date(2020, 3, 6, 11, 49, 0),
            startDate: '2020-04-01',
            startTime: '12:34',
            endDate: '2020-04-06',
            endTime: '11:49',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));

    // Get start and end time inputs
    const startTime = screen.getAllByTestId('time-picker-spinner')[0];
    const endTime = screen.getAllByTestId('time-picker-spinner')[1];

    const timeRange = screen.getByTestId('date-time-picker__field');

    expect(timeRange).toHaveTextContent('2020-04-01 12:34 to 2020-04-06 11:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-06 11:49
    userEvent.type(startTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:34');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('11:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-06 11:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-06 12:49
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}12:49');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('12:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-06 12:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-06 13:49
    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}13:49');
    expect(startTime).toHaveValue('13:34');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:34 to 2020-04-06 13:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:50 to 2020-04-06 13:49
    userEvent.type(startTime, '{backspace}{backspace}50');
    expect(startTime).toHaveValue('13:50');
    expect(endTime).toHaveValue('13:49');
    expect(timeRange).toHaveTextContent('2020-04-01 13:50 to 2020-04-06 13:49');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    userEvent.type(endTime, '{backspace}{backspace}{backspace}{backspace}{backspace}9999');
    userEvent.type(startTime, '{backspace}{backspace}51');
    expect(startTime).toHaveValue('13:51');
    expect(endTime).toHaveValue('9999');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should disable apply button when absolute DatePicker input has start and end date in different dates (with new time spinner)', async () => {
    const { i18n } = DateTimePicker.defaultProps;

    render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        dateTimeMask="YYYY-MM-DD hh:mm A"
        id="picker-test"
        testId="date-time-picker"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2020, 3, 1, 12, 34, 0),
            end: new Date(2020, 3, 6, 11, 49, 0),
            startDate: '2020-04-01',
            startTime: '12:34',
            endDate: '2020-04-06',
            endTime: '11:49',
          },
        }}
      />
    );
    jest.runAllTimers();

    userEvent.click(screen.getByTestId('date-time-picker__field'));

    // Get start and end time inputs
    const timeRange = screen.getByTestId('date-time-picker__field');
    const startTime = screen.getByTestId('date-time-picker-input-1');
    const endTime = screen.getByTestId('date-time-picker-input-2');

    expect(timeRange).toHaveTextContent('2020-04-01 12:34 PM to 2020-04-06 11:49 AM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-06 11:49
    fireEvent.focus(startTime);
    userEvent.type(
      startTime,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}01:34 PM'
    );

    expect(startTime).toHaveValue('01:34 PM');
    expect(endTime).toHaveValue('11:49 AM');
    expect(timeRange).toHaveTextContent('2020-04-01 01:34 PM to 2020-04-06 11:49 AM');

    // 2020-04-01 13:34 to 2020-04-06 12:49
    fireEvent.focus(endTime);
    userEvent.type(
      endTime,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12:49 PM'
    );
    endTime.blur();
    expect(startTime).toHaveValue('01:34 PM');
    expect(endTime).toHaveValue('12:49 PM');
    expect(timeRange).toHaveTextContent('2020-04-01 01:34 PM to 2020-04-06 12:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:34 to 2020-04-06 13:49
    fireEvent.focus(endTime);
    userEvent.type(
      endTime,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}01:49 PM'
    );
    expect(startTime).toHaveValue('01:34 PM');
    expect(endTime).toHaveValue('01:49 PM');
    expect(timeRange).toHaveTextContent('2020-04-01 01:34 PM to 2020-04-06 01:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    // 2020-04-01 13:50 to 2020-04-06 13:49
    fireEvent.focus(startTime);
    userEvent.type(
      startTime,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}01:50 PM'
    );
    expect(screen.getByTestId('date-time-picker-input-1')).toHaveValue('01:50 PM');
    expect(screen.getByTestId('date-time-picker-input-2')).toHaveValue('01:49 PM');
    expect(timeRange).toHaveTextContent('2020-04-01 01:50 PM to 2020-04-06 01:49 PM');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeEnabled();

    fireEvent.focus(startTime);
    userEvent.type(startTime, '{backspace}{backspace}{backspace}{backspace}{backspace}51 PM');

    fireEvent.focus(endTime);
    userEvent.type(
      endTime,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}9999'
    );
    expect(startTime).toHaveValue('01:51 PM');
    expect(endTime).toHaveValue('9999');
    expect(screen.getByText(i18n.applyBtnLabel)).toBeDisabled();
  });

  it('should be able to generate default id', () => {
    render(<DateTimePicker {...dateTimePickerProps} testId="date-time-picker" />);
    expect(screen.getByTestId('date-time-picker').getAttribute('id')).toMatch(
      /-iot--date-time-pickerv2__wrapper/
    );
  });

  it('should be able to generate default id (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} testId="date-time-picker" useNewTimeSpinner />);
    expect(screen.getByTestId('date-time-picker').getAttribute('id')).toMatch(
      /-iot--date-time-pickerv2__wrapper/
    );
  });

  it('should show invalid text when in invalid state', () => {
    render(<DateTimePicker {...dateTimePickerProps} i18n={i18n} invalid />);
    expect(screen.getByText(i18n.invalidText)).toBeInTheDocument();
    expect(
      screen
        .getByTestId(`${dateTimePickerProps.testId}-datepicker-flyout-button`)
        .classList.contains(`${iotPrefix}--date-time-picker--trigger-button--invalid`)
    ).toBe(true);
    userEvent.click(screen.getByText(i18n.invalidText));
    expect(screen.queryByRole('dialog', { 'aria-labelledby': 'flyout-tooltip' })).toBeNull();
  });

  it('should show invalid text when in invalid state (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} i18n={i18n} invalid useNewTimeSpinner />);
    expect(screen.getByText(i18n.invalidText)).toBeInTheDocument();
    expect(
      screen
        .getByTestId(`${dateTimePickerProps.testId}-datepicker-flyout-button`)
        .classList.contains(`${iotPrefix}--date-time-picker--trigger-button--invalid`)
    ).toBe(true);
    userEvent.click(screen.getByText(i18n.invalidText));
    expect(screen.queryByRole('dialog', { 'aria-labelledby': 'flyout-tooltip' })).toBeNull();
  });

  it('should disable menu button when disabled is set', () => {
    render(<DateTimePicker {...dateTimePickerProps} disabled />);
    expect(
      screen
        .getByTestId(`${dateTimePickerProps.testId}-datepicker-flyout-button`)
        .classList.contains(`${iotPrefix}--date-time-picker--trigger-button--disabled`)
    ).toBe(true);
  });

  it('should disable menu button when disabled is set (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} disabled useNewTimeSpinner />);
    expect(
      screen
        .getByTestId(`${dateTimePickerProps.testId}-datepicker-flyout-button`)
        .classList.contains(`${iotPrefix}--date-time-picker--trigger-button--disabled`)
    ).toBe(true);
  });

  it('should render in a portal when renderInPortal:true', () => {
    render(<DateTimePicker {...dateTimePickerProps} renderInPortal />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelectorAll(`#flyout-tooltip`)
    ).toHaveLength(0);
  });

  it('should render in a portal when renderInPortal:true (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} useNewTimeSpinner renderInPortal />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelectorAll(`#flyout-tooltip`)
    ).toHaveLength(0);
  });

  it('should render as a child when renderInPortal:false', () => {
    render(<DateTimePicker {...dateTimePickerProps} renderInPortal={false} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelector('.iot--flyout-menu--tooltip-anchor')
    ).toHaveAttribute('data-floating-menu-container', 'true');
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelectorAll(`#flyout-tooltip`)
    ).toHaveLength(1);
  });

  it('should render as a child when renderInPortal:false (new time spinner)', () => {
    render(<DateTimePicker {...dateTimePickerProps} useNewTimeSpinner renderInPortal={false} />);
    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelector('.iot--flyout-menu--tooltip-anchor')
    ).toHaveAttribute('data-floating-menu-container', 'true');
    expect(
      screen
        .getByTestId('date-time-picker-datepicker-flyout-container')
        .querySelectorAll(`#flyout-tooltip`)
    ).toHaveLength(1);
  });

  it('when flyout menu offscreen top left render direction to  RightStart', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: -200,
        y: -200,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        testId={testId}
        useNewTimeSpinner
        useAutoPositioning
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 20,
      y: 20,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.RightStart}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout offscreen top right render direction to bottomEnd', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: 1200,
        y: -200,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 1000,
      y: 20,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.BottomEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen bottom left render direction to TopStart', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: -200,
        y: 800,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 20,
      y: 748,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.TopStart}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen bottom right render direction to TopEnd', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: 1200,
        y: 800,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 1000,
      y: 748,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.TopEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen top render direction as BottomEnd', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: 300,
        y: -70,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 500,
      y: 20,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.BottomEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen right render direction as LeftEnd', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: 1200,
        y: 300,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 1200,
      y: 300,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.BottomEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen bottom render direction as TopEnd', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: 300,
        y: 1000,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 300,
      y: 700,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.TopEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('when flyout menu offscreen left render direction as RightStart', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: -200,
        y: 300,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          useAutoPositioning
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 20,
      y: 300,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.RightStart}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('should renders normally with default direction bottomEnd when autopositioning off', () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn(
      generateBoundingClientRect({
        x: -200,
        y: 300,
        height: 134,
        width: 278,
      })
    );
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    const testId = 'picker-test';
    act(() => {
      render(
        <DateTimePicker
          {...dateTimePickerProps}
          testId={testId}
          useNewTimeSpinner
          onApply={jest.fn()}
          datePickerType="single"
          dateTimeMask="YYYY-MM-DD hh:mm A"
          hasTimeInput
          showRelativeOption={false}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34 AM',
            },
          }}
        />
      );
    });

    const button = screen.getByTestId(`${testId}-datepicker-flyout-button`);
    button.getBoundingClientRect = generateBoundingClientRect({
      x: 20,
      y: 300,
    });

    userEvent.click(button);
    const menu = screen.getByTestId(`${testId}-datepicker-flyout`);

    expect(
      menu.classList.contains(`${iotPrefix}--flyout-menu--body__${FlyoutMenuDirection.BottomEnd}`)
    ).toBe(true);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('should close on click outside and restore default value', () => {
    const { baseElement } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={defaultPresets}
        i18n={{
          ...i18n,
          presetLabels: ['Last 30 minutes', 'Last 1 hour'],
        }}
      />
    );
    const dropdownTrigger = screen.getByRole('button', { name: 'Last 30 minutes' });
    userEvent.click(dropdownTrigger);
    const dropdown = baseElement.querySelector('[role="dialog"]');
    expect(dropdown).toBeInTheDocument();

    userEvent.click(within(dropdown).getByText('Last 1 hour'));
    expect(screen.getAllByText('Last 1 hour')).toHaveLength(2); // Value in input and in dropdown

    userEvent.click(document.body);
    expect(dropdown).not.toBeInTheDocument();

    userEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveTextContent('Last 30 minutes'); // Default value restored
  });

  it('should close on click outside and restore default value (new time spinner)', () => {
    const { baseElement } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        useNewTimeSpinner
        presets={defaultPresets}
        i18n={{
          ...i18n,
          presetLabels: ['Last 30 minutes', 'Last 1 hour'],
        }}
      />
    );
    const dropdownTrigger = screen.getByRole('button', { name: 'Last 30 minutes' });
    userEvent.click(dropdownTrigger);
    const dropdown = baseElement.querySelector('[role="dialog"]');
    expect(dropdown).toBeInTheDocument();

    userEvent.click(within(dropdown).getByText('Last 1 hour'));
    expect(screen.getAllByText('Last 1 hour')).toHaveLength(2); // Value in input and in dropdown

    userEvent.click(document.body);
    expect(dropdown).not.toBeInTheDocument();

    userEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveTextContent('Last 30 minutes'); // Default value restored
  });

  it('should close on click outside and restore custom value', () => {
    const { baseElement } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={defaultPresets}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[3],
        }}
        i18n={{
          ...i18n,
          presetLabels: ['Last 30 minutes', 'Last 1 hour'],
        }}
      />
    );
    const dropdownTrigger = screen.getByRole('button', { name: 'Last 12 hours' });
    userEvent.click(dropdownTrigger);
    const dropdown = baseElement.querySelector('[role="dialog"]');
    expect(dropdown).toBeInTheDocument();

    userEvent.click(within(dropdown).getByText('Last 1 hour'));
    expect(screen.getAllByText('Last 1 hour')).toHaveLength(2); // Value in input and in dropdown

    userEvent.click(document.body);
    expect(dropdown).not.toBeInTheDocument();

    userEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveTextContent('Last 12 hours'); // Default value restored
  });

  it('should close on click outside and restore custom value (new time spinner)', () => {
    const { baseElement } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={defaultPresets}
        useNewTimeSpinner
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[3],
        }}
        i18n={{
          ...i18n,
          presetLabels: ['Last 30 minutes', 'Last 1 hour'],
        }}
      />
    );
    const dropdownTrigger = screen.getByRole('button', { name: 'Last 12 hours' });
    userEvent.click(dropdownTrigger);
    const dropdown = baseElement.querySelector('[role="dialog"]');
    expect(dropdown).toBeInTheDocument();

    userEvent.click(within(dropdown).getByText('Last 1 hour'));
    expect(screen.getAllByText('Last 1 hour')).toHaveLength(2); // Value in input and in dropdown

    userEvent.click(document.body);
    expect(dropdown).not.toBeInTheDocument();

    userEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveTextContent('Last 12 hours'); // Default value restored
  });

  it('should close on click outside if renderInPortal:false', () => {
    const { baseElement } = render(
      <DateTimePicker
        {...dateTimePickerProps}
        presets={defaultPresets}
        renderInPortal={false}
        dateTimeMask="YYYY-MM-DD HH:mm"
        i18n={{
          ...i18n,
          presetLabels: ['Last 30 minutes', 'Last 1 hour'],
        }}
      />
    );
    const dropdownTrigger = screen.getByRole('button', { name: 'Last 30 minutes' });
    userEvent.click(dropdownTrigger);
    const dropdown = baseElement.querySelector('[role="dialog"]');
    expect(dropdown).toBeInTheDocument();

    userEvent.click(within(dropdown).getByText('Last 1 hour'));
    expect(screen.getAllByText('Last 1 hour')).toHaveLength(2); // Value in input and in dropdown

    userEvent.click(document.body);
    expect(dropdown).not.toBeInTheDocument();

    userEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveTextContent('Last 30 minutes'); // Default value restored
  });

  describe('should discard to last saved value if closed by click outside', () => {
    it('without default value', () => {
      const onApply = jest.fn();
      const { baseElement } = render(
        <DateTimePicker
          {...dateTimePickerProps}
          presets={defaultPresets}
          onApply={onApply}
          i18n={{
            ...i18n,
            presetLabels: ['Last 30 minutes', 'Last 1 hour'],
          }}
        />
      );
      const dropdownTrigger = screen.getAllByRole('button')[0];

      userEvent.click(dropdownTrigger);
      const dropdown = baseElement.querySelector('[role="dialog"]');

      // Save some preset
      userEvent.click(within(dropdown).getByText('Last 1 hour'));
      userEvent.click(within(dropdown).getByText('Apply'));

      // Unsaved changes
      userEvent.click(dropdownTrigger);
      userEvent.click(within(dropdown).getByText('Last 6 hours'));
      userEvent.click(document.body);

      // Preserves saved changes
      expect(dropdownTrigger).toHaveTextContent('Last 1 hour');
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('with selected preset', () => {
      const onApply = jest.fn();
      const { baseElement } = render(
        <DateTimePicker
          {...dateTimePickerProps}
          presets={defaultPresets}
          onApply={onApply}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.PRESET,
            timeRangeValue: PRESET_VALUES[3],
          }}
          i18n={{
            ...i18n,
            presetLabels: ['Last 30 minutes', 'Last 1 hour'],
          }}
        />
      );
      const dropdownTrigger = screen.getAllByRole('button')[0];
      userEvent.click(dropdownTrigger);
      const dropdown = baseElement.querySelector('[role="dialog"]');

      // Save some preset
      userEvent.click(within(dropdown).getByText('Last 1 hour'));
      userEvent.click(within(dropdown).getByText('Apply'));

      // Unsaved changes
      userEvent.click(dropdownTrigger);
      userEvent.click(within(dropdown).getByText('Last 6 hours'));
      userEvent.click(document.body);

      // Preserves saved changes
      expect(dropdownTrigger).toHaveTextContent('Last 1 hour');
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('with default relative value', () => {
      const onApply = jest.fn();
      const { baseElement } = render(
        <DateTimePicker
          {...dateTimePickerProps}
          presets={defaultPresets}
          onApply={onApply}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.RELATIVE,
            timeRangeValue: {
              relativeToWhen: INTERVAL_VALUES.MINUTES,
              relativeToTime: '',
            },
          }}
          i18n={{
            ...i18n,
            presetLabels: ['Last 30 minutes', 'Last 1 hour'],
          }}
        />
      );
      const dropdownTrigger = screen.getAllByRole('button')[0];
      userEvent.click(dropdownTrigger);
      const dropdown = baseElement.querySelector('[role="dialog"]');

      // Save some date
      fireEvent.change(within(dropdown).getByPlaceholderText('hh:mm'), {
        target: { value: '13:30' },
      });
      userEvent.click(within(dropdown).getByText('Apply'));

      // Unsaved changes
      userEvent.click(dropdownTrigger);
      const dropdownRerendered = baseElement.querySelector('[role="dialog"]');
      userEvent.click(within(dropdownRerendered).getByText('Back'));
      userEvent.click(within(dropdownRerendered).getByText('Last 1 hour'));
      userEvent.click(document.body);

      // Preserves saved changes
      expect(dropdownTrigger).toHaveTextContent(/13:30/i);
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('with default absolute value', () => {
      const onApply = jest.fn();
      const { baseElement } = render(
        <DateTimePicker
          {...dateTimePickerProps}
          presets={defaultPresets}
          onApply={onApply}
          defaultValue={{
            timeRangeKind: PICKER_KINDS.ABSOLUTE,
            timeRangeValue: {
              start: new Date(2021, 7, 1, 12, 34, 0),
              end: new Date(2021, 7, 6, 10, 49, 0),
            },
          }}
          i18n={{
            ...i18n,
            presetLabels: ['Last 30 minutes', 'Last 1 hour'],
          }}
        />
      );
      const dropdownTrigger = screen.getAllByRole('button')[0];
      userEvent.click(dropdownTrigger);
      const dropdown = baseElement.querySelector('[role="dialog"]');

      // Save some date
      fireEvent.change(within(dropdown).getByLabelText('Start time'), {
        target: { value: '13:30' },
      });
      userEvent.click(within(dropdown).getByText('Apply'));

      // Unsaved changes
      userEvent.click(dropdownTrigger);
      const dropdownRerendered = baseElement.querySelector('[role="dialog"]');
      userEvent.click(within(dropdownRerendered).getByText('Back'));
      userEvent.click(within(dropdownRerendered).getByText('Last 1 hour'));
      userEvent.click(document.body);

      // Preserves saved changes
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        '2021-08-01 13:30 to 2021-08-06 10:49'
      );
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('with default absolute value (new time spinner)', () => {
      const onApply = jest.fn();
      const { baseElement } = render(
        <DateTimePicker
          {...dateTimePickerProps}
          presets={defaultPresets}
          onApply={onApply}
          useNewTimeSpinner
          defaultValue={{
            timeRangeKind: PICKER_KINDS.ABSOLUTE,
            timeRangeValue: {
              start: new Date(2021, 7, 1, 12, 34, 0),
              end: new Date(2021, 7, 6, 10, 49, 0),
            },
          }}
          i18n={{
            ...i18n,
            presetLabels: ['Last 30 minutes', 'Last 1 hour'],
          }}
        />
      );
      const dropdownTrigger = screen.getAllByRole('button')[0];
      userEvent.click(dropdownTrigger);
      const dropdown = baseElement.querySelector('[role="dialog"]');

      // Save some date
      within(dropdown).getByLabelText('Start time').focus();
      userEvent.click(baseElement.querySelector('[aria-label="Previous item"]'));
      userEvent.click(within(dropdown).getByText('Apply'));

      // Unsaved changes
      userEvent.click(dropdownTrigger);
      const dropdownRerendered = baseElement.querySelector('[role="dialog"]');
      userEvent.click(within(dropdownRerendered).getByText('Back'));
      userEvent.click(within(dropdownRerendered).getByText('Last 1 hour'));
      userEvent.click(document.body);

      // Preserves saved changes
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        /2021-08-01 12:34 to 2021-08-06 10:49/i
      );
      expect(onApply).toHaveBeenCalledTimes(1);
    });
  });

  it('should render without a time picker and a mask that does not include time', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        i18n={i18n}
        dateTimeMask="MM/DD/YYYY"
        hasTimeInput={false}
      />
    );
    expect(screen.getByText(PRESET_VALUES[0].label)).toBeVisible();
  });

  it('should render with locale that is 2 letters', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        locale="en"
        useNewTimeSpinner
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34 AM
    expect(screen.getByText('2020-04-01 12:34 AM')).toBeVisible();
  });

  it('should render with locale that is not 2 letters', () => {
    render(
      <DateTimePicker
        {...dateTimePickerProps}
        locale="en-us"
        useNewTimeSpinner
        onApply={jest.fn()}
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD hh:mm A"
        hasTimeInput
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34 AM',
          },
        }}
      />
    );

    // default value is 2020-04-01 12:34 AM
    expect(screen.getByText('2020-04-01 12:34 AM')).toBeVisible();
  });
});
