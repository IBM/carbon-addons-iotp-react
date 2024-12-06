/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, select, text } from '@storybook/addon-knobs';
import { Search, SearchSkeleton } from '@carbon/react';

const sizes = {
  'Large size (lg)': 'lg',
  'Regular size (md)': 'md',
  'Small size (sm)': 'sm',
};

const props = () => ({
  className: 'some-class',
  size: select('Size (size)', sizes, 'md'),
  light: boolean('Light variant (light)', false),
  disabled: boolean('Disabled (disabled)', false),
  name: text('Form item name (name)', ''),
  defaultValue: text('Default value (defaultValue)', 'Sample Search'),
  labelText: text('Label text (labelText)', 'Search'),
  closeButtonLabelText: text(
    'The label text for the close button (closeButtonLabelText)',
    'Clear search input'
  ),
  placeholder: text('Placeholder text (placeholder)', 'Search'),
  onChange: action('onChange'),
  onKeyDown: action('onKeyDown'),
});

export default {
  title: '3 - Carbon/Search',
  decorators: [withKnobs],

  parameters: {
    component: Search,
  },
};

export const Default = () => <Search {...props()} id="search-1" />;

Default.parameters = {
  info: {
    text: `
            Search enables users to specify a word or a phrase to find particular relevant pieces of content
            without the use of navigation. Search can be used as the primary means of discovering content,
            or as a filter to aid the user in finding content.
          `,
  },
};

export const Skeleton = () => (
  <div style={{ width: '200px' }}>
    <SearchSkeleton small />
    &nbsp;
    <SearchSkeleton small />
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
