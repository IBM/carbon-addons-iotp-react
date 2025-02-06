import React from 'react';
import { boolean, text, select, number, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';
import {
  INTERVAL_VALUES,
  RELATIVE_VALUES,
  PICKER_KINDS,
  PRESET_VALUES,
} from '../../constants/DateConstants';

import DateTimePicker from './DateTimePickerV2';

export const Experimental = () => <StoryNotice componentName="DateTimePickerV2" experimental />;
Experimental.storyName = experimentalStoryTitle;

export const defaultRelativeValue = {
  timeRangeKind: PICKER_KINDS.RELATIVE,
  timeRangeValue: {
    lastNumber: 20,
    lastInterval: INTERVAL_VALUES.MINUTES,
    relativeToWhen: RELATIVE_VALUES.TODAY,
    relativeToTime: '13:30',
  },
};

export const defaultAbsoluteValue = {
  timeRangeKind: PICKER_KINDS.ABSOLUTE,
  timeRangeValue: {
    startDate: '2020-04-01',
    startTime: '12:34',
    endDate: '2020-04-06',
    endTime: '10:49',
  },
};

export default {
  title: '2 - Watson IoT Experimental/☢️ DateTimePickerV2',
  parameters: {
    docs: {
      inlineStories: false,
    },
  },
  excludeStories: ['defaultRelativeValue', 'defaultAbsoluteValue'],
};

export const Default = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      dateTimeMask={text('dateTimeMask', 'YYYY-MM-DD HH:mm')}
      useNewTimeSpinner={boolean('useNewTimeSpinner', true)}
      relatives={[
        {
          label: 'Yesterday',
          value: RELATIVE_VALUES.YESTERDAY,
        },
      ]}
      hasTimeInput={boolean('hasTimeInput', true)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      hasIconOnly={boolean('hasIconOnly', false)}
      invalid={boolean('invalid', false)}
      disabled={boolean('disabled', false)}
      style={{ zIndex: number('zIndex', 0) }}
      i18n={object('i18n', {
        invalidText: 'The date time entered is invalid',
      })}
      renderInPortal={boolean('renderInPortal', true)}
    />
  );
};

export const SelectedPreset = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      defaultValue={{
        timeRangeKind: PICKER_KINDS.PRESET,
        timeRangeValue: PRESET_VALUES[3],
      }}
      hasTimeInput={boolean('hasTimeInput', true)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      hasIconOnly={boolean('hasIconOnly', false)}
      style={{ zIndex: number('zIndex', 0) }}
      invalid={boolean('invalid', false)}
      disabled={boolean('disabled', false)}
      i18n={object('i18n', {
        invalidText: 'The date time entered is invalid',
      })}
      renderInPortal={boolean('renderInPortal', true)}
    />
  );
};

SelectedPreset.storyName = 'Selected preset';

export const SelectedRelative = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      defaultValue={defaultRelativeValue}
      hasTimeInput={boolean('hasTimeInput', true)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      hasIconOnly={boolean('hasIconOnly', false)}
      style={{ zIndex: number('zIndex', 0) }}
      invalid={boolean('invalid', false)}
      disabled={boolean('disabled', false)}
      i18n={object('i18n', {
        invalidText: 'The date time entered is invalid',
      })}
      renderInPortal={boolean('renderInPortal', true)}
    />
  );
};

SelectedRelative.storyName = 'Selected relative';

export const SelectedAbsolute = () => {
  return (
    <div
      style={{
        height: '15rem',
        paddingTop: '5rem',
        paddingBottom: '50rem',
        paddingLeft: '1rem',
        overflow: 'scroll',
      }}
    >
      <div>
        <DateTimePicker
          id="datetimepicker"
          useNewTimeSpinner={boolean('useNewTimeSpinner', false)}
          useAutoPositioning={boolean('useAutoPositioning', true)}
          defaultValue={defaultAbsoluteValue}
          dateTimeMask={text('dateTimeMask', 'YYYY-MM-DD HH:mm')}
          hasTimeInput={boolean('hasTimeInput', true)}
          onApply={action('onApply')}
          onCancel={action('onCancel')}
          hasIconOnly={boolean('hasIconOnly', false)}
          invalid={boolean('invalid', false)}
          disabled={boolean('disabled', false)}
          style={{ zIndex: number('zIndex', 0) }}
          i18n={object('i18n', {
            startTimeLabel: 'Start',
            endTimeLabel: 'End',
            invalidText: 'The date time entered is invalid',
          })}
          renderInPortal={boolean('renderInPortal', true)}
        />
      </div>
      <div style={{ height: '10rem' }} />
    </div>
  );
};

SelectedAbsolute.storyName = 'Selected absolute';

export const SingleSelect = () => {
  const dateTimeMask = text('dateTimeMask', 'YYYY-MM-DD HH:mm');
  return (
    <div
      style={{
        height: '20rem',
        paddingTop: '5rem',
        paddingBottom: '40rem',
        paddingLeft: '1rem',
        overflow: 'scroll',
      }}
    >
      <DateTimePicker
        id="datetimepicker"
        key={dateTimeMask}
        useNewTimeSpinner
        useAutoPositioning={boolean('useAutoPositioning', true)}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34',
          },
        }}
        dateTimeMask={dateTimeMask}
        hasTimeInput={boolean('hasTimeInput', true)}
        onApply={action('onApply')}
        onCancel={action('onCancel')}
        onClear={action('onClear')}
        datePickerType="single"
        showRelativeOption={boolean('show relative option', false)}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
        i18n={object('i18n', {
          startTimeLabel: 'Time',
          timePickerInvalidText: 'A valid value is required',
          invalidText: 'The date time entered is invalid',
          amString: '上午',
          pmString: '下午',
        })}
        style={{ zIndex: number('zIndex', 0) }}
        renderInPortal={boolean('renderInPortal', true)}
        locale={text('locale', 'en')}
        closeOnSelect={boolean('Close On Select', true)}
      />
      <div style={{ height: '10rem' }} />
    </div>
  );
};

SingleSelect.storyName = 'Single select with new time spinner';

export const SelectedAbsoluteWithNewTimeSpinner = () => {
  const dateTimeMask = text('dateTimeMask', 'YYYY-MM-DD HH:mm');
  return (
    <DateTimePicker
      id="datetimepicker"
      key={dateTimeMask}
      useNewTimeSpinner
      useAutoPositioning={boolean('useAutoPositioning', true)}
      defaultValue={defaultAbsoluteValue}
      dateTimeMask={dateTimeMask}
      hasTimeInput={boolean('hasTimeInput', true)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      showCustomRangeLink={boolean('show custom range link', true)}
      hideBackButton={boolean('hide back button', false)}
      showRelativeOption={boolean('show the relative option', true)}
      style={{ zIndex: number('zIndex', 0) }}
      i18n={object('i18n', {
        startTimeLabel: 'Start',
        endTimeLabel: 'End',
        invalidText: 'The date time entered is invalid',
      })}
      invalid={boolean('invalid', false)}
      disabled={boolean('disabled', false)}
      renderInPortal={boolean('renderInPortal', true)}
    />
  );
};

SelectedAbsoluteWithNewTimeSpinner.storyName = 'Range select with new time spinner';

export const WithoutARelativeOption = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      defaultValue={{
        timeRangeKind: PICKER_KINDS.PRESET,
        timeRangeValue: PRESET_VALUES[3],
      }}
      hasTimeInput={boolean('hasTimeInput', true)}
      showRelativeOption={false}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      hasIconOnly={boolean('hasIconOnly', false)}
    />
  );
};

WithoutARelativeOption.storyName = 'Without a relative option';

export const WithoutACustomRangeLink = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      defaultValue={{
        timeRangeKind: PICKER_KINDS.PRESET,
        timeRangeValue: PRESET_VALUES[3],
      }}
      hasTimeInput={boolean('hasTimeInput', true)}
      showCustomRangeLink={false}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      hasIconOnly={boolean('hasIconOnly', false)}
    />
  );
};

WithoutACustomRangeLink.storyName = 'Without a custom range link';

export const LightVersion = () => {
  return (
    <DateTimePicker
      id="datetimepicker"
      dateTimeMask={text('dateTimeMask', 'YYYY-MM-DD HH:mm')}
      relatives={[
        {
          label: 'Yesterday',
          value: RELATIVE_VALUES.YESTERDAY,
        },
      ]}
      light
      hasTimeInput={boolean('hasTimeInput', true)}
      hasIconOnly={boolean('hasIconOnly', false)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
      style={{ zIndex: number('zIndex', 0) }}
    />
  );
};

LightVersion.storyName = 'Light version';

export const IconOnly = () => {
  return (
    <div style={{ paddingLeft: '20rem' }}>
      <DateTimePicker
        id="datetimepicker"
        dateTimeMask={text('dateTimeMask', 'YYYY-MM-DD HH:mm')}
        relatives={[
          {
            label: 'Yesterday',
            value: RELATIVE_VALUES.YESTERDAY,
          },
        ]}
        hasTimeInput={boolean('hasTimeInput', true)}
        hasIconOnly={boolean('hasIconOnly', true)}
        style={{ zIndex: number('zIndex', 0) }}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
      />
    </div>
  );
};

IconOnly.storyName = 'Icon only';

export const Locale = () => {
  return (
    <DateTimePicker
      id="datetimepicker25"
      dateTimeMask={text('dateTimeMask', 'L HH:mm')}
      locale={select('locale', ['en', 'fr', 'ja'], 'fr')}
      defaultValue={defaultAbsoluteValue}
      hasTimeInput={boolean('hasTimeInput', true)}
      hasIconOnly={boolean('hasIconOnly', false)}
      onApply={action('onApply')}
      onCancel={action('onCancel')}
    />
  );
};
