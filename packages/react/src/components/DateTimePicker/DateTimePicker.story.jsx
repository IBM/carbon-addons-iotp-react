/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import { boolean, text, select, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { spacing06 } from '@carbon/layout';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import {
  INTERVAL_VALUES,
  RELATIVE_VALUES,
  PICKER_KINDS,
  PRESET_VALUES,
} from '../../constants/DateConstants';

import DateTimePicker from './DateTimePicker';

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
  title: '1 - Watson IoT/Date time range selector',
  parameters: {
    docs: {
      inlineStories: false,
    },
  },
  excludeStories: ['defaultRelativeValue', 'defaultAbsoluteValue'],
};

export const Default = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <DateTimePicker
        id="datetimepicker"
        relatives={[
          {
            label: 'Yesterday',
            value: RELATIVE_VALUES.YESTERDAY,
          },
        ]}
        dateTimeMask={text('dateTimeMask', 'YYYY-MM-DD HH:mm')}
        hasTimeInput={boolean('hasTimeInput', true)}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
        i18n={object('i18n', {
          invalidText: 'The date time entered is invalid',
        })}
        style={{ zIndex: text('zIndex', '100') }}
      />
    </div>
  );
};

export const SelectedPreset = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <DateTimePicker
        id="datetimepicker"
        defaultValue={{
          timeRangeKind: PICKER_KINDS.PRESET,
          timeRangeValue: PRESET_VALUES[3],
        }}
        hasTimeInput={boolean('hasTimeInput', true)}
        onApply={action('onApply')}
        onCancel={action('onCancel')}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
        i18n={object('i18n', {
          invalidText: 'The date time entered is invalid',
        })}
      />
    </div>
  );
};

SelectedPreset.storyName = 'Selected preset';

export const SelectedRelative = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <DateTimePicker
        id="datetimepicker"
        defaultValue={defaultRelativeValue}
        hasTimeInput={boolean('hasTimeInput', true)}
        onApply={action('onApply')}
        onCancel={action('onCancel')}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
        i18n={object('i18n', {
          invalidText: 'The date time entered is invalid',
        })}
      />
    </div>
  );
};

SelectedRelative.storyName = 'Selected relative';

export const SelectedAbsolute = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <DateTimePicker
        id="datetimepicker"
        defaultValue={defaultAbsoluteValue}
        hasTimeInput={boolean('hasTimeInput', true)}
        onApply={action('onApply')}
        onCancel={action('onCancel')}
        invalid={boolean('invalid', false)}
        disabled={boolean('disabled', false)}
        i18n={object('i18n', {
          invalidText: 'The date time entered is invalid',
        })}
      />
    </div>
  );
};

SelectedAbsolute.storyName = 'Selected absolute';

export const WithoutARelativeOption = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
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
      />
    </div>
  );
};

WithoutARelativeOption.storyName = 'Without a relative option';

export const WithoutACustomRangeLink = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
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
      />
    </div>
  );
};

WithoutACustomRangeLink.storyName = 'Without a custom range link';

export const LightVersion = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
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
      />
    </div>
  );
};

LightVersion.storyName = 'Light version';

export const Locale = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <DateTimePicker
        id="datetimepicker25"
        dateTimeMask={text('dateTimeMask', 'L HH:mm')}
        locale={select('locale', ['en', 'fr', 'ja'], 'fr')}
        defaultValue={defaultAbsoluteValue}
        hasTimeInput={boolean('hasTimeInput', true)}
      />
    </div>
  );
};
