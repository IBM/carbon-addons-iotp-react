/* eslint-disable react/destructuring-assignment */
/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withKnobs, select, text, boolean } from '@storybook/addon-knobs';
import { Carbon, Compass, Tag as TagIcon } from '@carbon/icons-react';
import { action } from '@storybook/addon-actions';

import { Tag, TagSkeleton } from '.';

const iconOptions = {
  Carbon,
  Compass,
  TagIcon,
};

const sizes = {
  'Default size (md)': 'md',
  'Small size (sm)': 'sm',
  'Large size (lg)': 'lg',
};

const props = {
  regular: () => ({
    type: select(
      'Tag type (type)',
      [
        'red',
        'magenta',
        'purple',
        'blue',
        'cyan',
        'teal',
        'green',
        'gray',
        'cool-gray',
        'warm-gray',
        'high-contrast',
        'outline',
      ],
      'red'
    ),
    disabled: boolean('Disabled (disabled)', false),
    size: select('Field size (size)', sizes, 'md') || undefined,
    title: text('Title (title)', 'Clear Filter'),
  }),
  filter() {
    return {
      ...this.regular(),
      onClick: action('onClick'),
      onClose: action('onClose'),
    };
  },
  icon() {
    return {
      ...this.regular(),
      renderIcon: iconOptions[select('Icon (icon)', Object.keys(iconOptions), 'TagIcon')],
    };
  },
};

export default {
  title: '3 - Carbon/Tag',
  decorators: [withKnobs],

  parameters: {
    component: Tag,

    subcomponents: {
      TagSkeleton,
    },
  },
};

export const _Default = () => (
  <Tag className="some-class" {...props.regular()}>
    {text('Content (children)', 'This is a tag')}
  </Tag>
);

_Default.parameters = {
  info: {
    text: `
        Tags are used for items that need to be labeled, categorized, or organized using keywords that describe them.
        The example below shows how the Tag component can be used. Each type has a default message describing the type,
        but a custom message can also be applied.
      `,
  },
};

export const Filter = () => (
  <Tag className="some-class" {...props.filter()} filter>
    {text('Content (children)', 'This is a tag')}
  </Tag>
);

Filter.parameters = {
  info: {
    text: `
        Tags are used for items that need to be labeled, categorized, or organized using keywords that describe them.
        The example below shows how the Tag component can be used. Each type has a default message describing the type,
        but a custom message can also be applied.
      `,
  },
};

export const CustomIcon = () => (
  <Tag className="some-class" {...props.icon()}>
    {text('Content (children)', 'This is a tag')}
  </Tag>
);

CustomIcon.parameters = {
  info: {
    text: `
        Tags are used for items that need to be labeled, categorized, or organized using keywords that describe them.
        The example below shows how the Tag component can be used. Each type has a default message describing the type,
        but a custom message can also be applied.
      `,
  },
};

export const Skeleton = () => (
  <div>
    <TagSkeleton />
    <TagSkeleton size="sm" />
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
