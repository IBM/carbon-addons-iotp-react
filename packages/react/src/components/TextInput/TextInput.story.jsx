import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, select, text } from '@storybook/addon-knobs';

import { TextInputSkeleton, TextInput } from '.';

const types = {
  None: '',
  'Text (text)': 'text',
  'For email (email)': 'email',
  'For password (password)': 'password',
};

const sizes = {
  'Large size (lg)': 'lg',
  'Default size (md)': 'md',
  'Small size (sm)': 'sm',
};

function ControlledPasswordInputApp(props) {
  const [type, setType] = useState('password');
  const togglePasswordVisibility = () => {
    setType(type === 'password' ? 'text' : 'password');
  };
  return (
    <>
      <TextInput.ControlledPasswordInput
        type={type}
        togglePasswordVisibility={togglePasswordVisibility}
        {...props}
      />
      <button type="button" onClick={() => setType('text')}>
        Show password
      </button>
      <button type="button" onClick={() => setType('password')}>
        Hide password
      </button>
    </>
  );
}

const props = {
  TextInputProps: () => ({
    className: 'some-class',
    id: 'test2',
    defaultValue: text('Default value (defaultValue)', 'This is not a default value'),
    size: select('Field size (size)', sizes, 'md') || undefined,
    labelText: text('Label text (labelText)', 'Text Input label'),
    placeholder: text('Placeholder text (placeholder)', 'Placeholder text'),
    light: boolean('Light variant (light)', false),
    disabled: boolean('Disabled (disabled)', false),
    hideLabel: boolean('No label (hideLabel)', false),
    invalid: boolean('Show form validation UI (invalid)', false),
    invalidText: text('Form validation UI content (invalidText)', 'A valid value is required'),
    helperText: text('Helper text (helperText)', 'Optional helper text.'),
    onClick: action('onClick'),
    onChange: action('onChange'),
  }),
  PasswordInputProps: () => ({
    tooltipPosition: select(
      'Tooltip position (tooltipPosition)',
      ['top', 'right', 'bottom', 'left'],
      'bottom'
    ),
    tooltipAlignment: select(
      'Tooltip alignment (tooltipAlignment)',
      ['start', 'center', 'end'],
      'center'
    ),
    hidePasswordLabel: text(
      '"Hide password" tooltip label for password visibility toggle (hidePasswordLabel)',
      'Hide password'
    ),
    showPasswordLabel: text(
      '"Show password" tooltip label for password visibility toggle (showPasswordLabel)',
      'Show password'
    ),
  }),
};

TextInput.displayName = 'TextInput';

export default {
  title: '3 - Carbon/TextInput',
  decorators: [withKnobs],

  parameters: {
    component: TextInput,
  },
};

export const Default = () => (
  <TextInput
    type={select('Form control type (type)', types, 'text')}
    {...props.TextInputProps()} // eslint-disable-line react/destructuring-assignment
  />
);

Default.parameters = {
  info: {
    text: `
        Text fields enable the user to interact with and input data. A single line
        field is used when the input anticipated by the user is a single line of
        text as opposed to a paragraph.
        The default type is 'text' and its value can be either 'string' or 'number'.
      `,
  },
};

export const TogglePasswordVisibility = () => {
  return (
    <TextInput.PasswordInput
      {...props.TextInputProps()} // eslint-disable-line react/destructuring-assignment
      {...props.PasswordInputProps()} // eslint-disable-line react/destructuring-assignment
    />
  );
};

TogglePasswordVisibility.storyName = 'Toggle password visibility';

TogglePasswordVisibility.parameters = {
  info: {
    text: `
      Text field with password visibility toggle.
    `,
  },
};

export const FullyControlledTogglePasswordVisibility = () => {
  return (
    <ControlledPasswordInputApp
      {...props.TextInputProps()} // eslint-disable-line react/destructuring-assignment
      {...props.PasswordInputProps()} // eslint-disable-line react/destructuring-assignment
    />
  );
};

FullyControlledTogglePasswordVisibility.storyName = 'Fully controlled toggle password visibility';

FullyControlledTogglePasswordVisibility.parameters = {
  info: {
    text: `
    Fully controlled text field with password visibility toggle.
  `,
  },
};

export const Skeleton = () => (
  <div
    aria-label="loading text input"
    aria-live="assertive"
    role="status"
    tabIndex="0" // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
  >
    <TextInputSkeleton />
    <br />
    <TextInputSkeleton hideLabel />
  </div>
);

Skeleton.storyName = 'skeleton';

Skeleton.parameters = {
  info: {
    text: `
        Placeholder skeleton state to use when content is loading.
        `,
  },
};
