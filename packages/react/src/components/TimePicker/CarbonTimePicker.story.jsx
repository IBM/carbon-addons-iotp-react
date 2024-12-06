/* eslint-disable react/destructuring-assignment */
/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, number, select, text } from '@storybook/addon-knobs';

import { SelectItem } from '../SelectItem';
import { TimePickerSelect } from '../TimePickerSelect';

import { TimePicker } from '.';

const sizes = {
  'Extra large size (lg)': 'lg',
  'Default size': 'md',
  'Small size (sm)': 'sm',
};

const props = {
  timepicker: () => ({
    pattern: text(
      'Regular expression for the value (pattern in <TimePicker>)',
      '(1[012]|[1-9]):[0-5][0-9](\\s)?'
    ),
    placeholder: text('Placeholder text (placeholder in <TimePicker>)', 'hh:mm'),
    disabled: boolean('Disabled (disabled in <TimePicker>)', false),
    light: boolean('Light variant (light in <TimePicker>)', false),
    labelText: text('Label text (labelText in <TimePicker>)', 'Select a time'),
    invalid: boolean('Show form validation UI (invalid in <TimePicker>)', false),
    invalidText: text(
      'Form validation UI content (invalidText in <TimePicker>)',
      'A valid value is required'
    ),
    maxLength: number('Maximum length (maxLength in <TimePicker>)', 5),
    size: select('Field size (size)', sizes, 'md') || undefined,
    onClick: action('onClick'),
    onChange: action('onChange'),
    onBlur: action('onBlur'),
  }),
  select: () => ({
    disabled: boolean('Disabled (disabled in <TimePickerSelect>)', false),
    labelText: text('Label text (labelText in <TimePickerSelect>)', 'Please select'),
    'aria-label': text(
      "Trigger icon description ('aria-label' in <TimePickerSelect>)",
      'open list of options'
    ),
  }),
};

export default {
  title: '3 - Carbon/TimePicker',
  decorators: [withKnobs],
  parameters: {
    component: TimePicker,

    subcomponents: {
      TimePickerSelect,
      SelectItem,
    },
  },
};

export const Default = () => {
  return (
    <>
      <TimePicker id="time-picker" {...props.timepicker()} />
    </>
  );
};

Default.parameters = {
  info: {
    text: `
        The time picker allow users to select a time.
      `,
  },
};
