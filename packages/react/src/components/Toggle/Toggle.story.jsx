/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Toggle, ToggleSkeleton } from '@carbon/react';

const sizes = {
  'Regular size (md)': 'md',
  'Small size (sm)': 'sm',
};

export default {
  title: '3 - Carbon/Toggle',
  decorators: [withKnobs],

  parameters: {
    component: Toggle,
  },
};

const ToggleProps = () => ({
  className: 'some-class',
  disabled: boolean('Disabled (disabled)', false),
  hideLabel: boolean('No label (hideLabel)', false),
  labelB: text('Label A', 'On'),
  labelA: text('Label B', 'Off'),
  labelText: text('Label text (labelText)', 'Toggle element label'),
  readOnly: boolean('Read only variant', false),
  id: 'test2',
  size: select('Toggle size (size)', sizes, 'md'),
  onToggle: action('onToggle'),
  onClick: action('onClick'),
});

export const Default = () => <Toggle {...ToggleProps()} defaultToggled id="toggle-1" />;

Default.parameters = {
  info: {
    text: `
            Text areas enable the user to interact with and input data. A text area is used when you
            anticipate the user to input more than 1 sentence.
          `,
  },
};

export const Skeleton = () => (
  <div>
    <ToggleSkeleton />
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
