/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, number, select, text } from '@storybook/addon-knobs';
import { Accordion, AccordionItem, AccordionSkeleton } from '@carbon/react';

import Button from '../Button';

export default {
  title: '3 - Carbon/Accordion',
  component: Accordion,
  decorators: [withKnobs],
};

export const accordion = () => (
  <Accordion>
    <AccordionItem title="Section 1 title">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
    <AccordionItem title="Section 2 title">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
    <AccordionItem title="Section 3 title">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
    <AccordionItem title="Section 4 title">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
  </Accordion>
);

export const skeleton = () => <AccordionSkeleton open count={4} />;

skeleton.decorators = [(story) => <div style={{ width: '500px' }}>{story()}</div>];

const props = {
  onClick: action('onClick'),
  onHeadingClick: action('onHeadingClick'),
};

const sizes = {
  'Large size (lg)': 'lg',
  'Default size (md)': 'md',
  'Small size (sm)': 'sm',
};

export const playground = () => (
  <Accordion
    disabled={boolean('Disable entire Accordion (disabled)', false)}
    size={select('Accordion heading size (size)', sizes, 'md') || undefined}
    align={select('Accordion heading alignment (align)', ['start', 'end'], 'end')}
  >
    <AccordionItem
      title={text('The title (title)', 'Section 1 title')}
      open={boolean('Open the section (open)', false)}
      {...props}
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
    <AccordionItem title="Section 2 title" {...props}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
    <AccordionItem
      title="Section 3 title"
      {...props}
      disabled={boolean('Disable Section 3 (disabled)', true)}
    >
      <Button>This is a button.</Button>
    </AccordionItem>
    <AccordionItem
      title={
        <span>
          Section 4 title (<em>the title can be a node</em>)
        </span>
      }
      {...props}
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </AccordionItem>
  </Accordion>
);

export const skeletonPlayground = () => (
  <div style={{ width: '500px' }}>
    <AccordionSkeleton
      align={select('Accordion heading alignment (align)', ['start', 'end'], 'end')}
      open={boolean('Show first item opened (open)', true)}
      count={number('Set number of items (count)', 4)}
    />
  </div>
);
