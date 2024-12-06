/* Used dependencies */
import React from 'react';
import { boolean, number, select, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ProgressIndicatorSkeleton, Tooltip } from '@carbon/react';
// import { settings } from 'carbon-components';

import ProgressIndicator from './ProgressIndicator';

import { CarbonProgressIndicator, CarbonProgressStep } from '.';

const { prefix } = 'cds';

const items = [
  {
    id: 'step1',
    label: 'First step is very, very long',
    secondaryLabel: 'Optional label is very, very long',
    description: 'This is displayed when step icon is hovered',
  },
  {
    id: 'step2',
    label: 'Second Step',
    secondaryLabel: 'Optional label',
    children: [
      { id: 'step2_substep1', label: 'Sub Step 1' },
      {
        id: 'step2_substep2',
        label: 'Sub Step 2',
        secondaryLabel: 'Optional label',
      },
      { id: 'step2_substep3', label: 'Sub Step 3', invalid: true },
      {
        id: 'step2_substep4',
        label: 'Sub Step 4',
        invalid: true,
        disabled: true,
      },
    ],
  },
  {
    id: 'step3',
    label: 'Third Step',
    secondaryLabel: 'Optional label',
    disabled: true,
  },
  { id: 'step4', label: 'Fourth Step', invalid: true },
  { id: 'step5', label: 'Fifth Step' },
];

export default {
  title: '1 - Watson IoT/Progress indicator/Progress indicator',

  parameters: {
    component: ProgressIndicator,
  },
};

export const Stateful = () => (
  <ProgressIndicator
    items={items}
    currentItemId="step2_substep2"
    stepWidth={number('stepWidth', 6)}
    showLabels={boolean('showlabels', true)}
    isVerticalMode={boolean('isVerticalMode', false)}
    isClickable={boolean('isClickable', true)}
  />
);

Stateful.storyName = 'stateful';

export const Presentation = () => {
  const spaceEquallyFlag = boolean('spaceEqually', false);
  return (
    <ProgressIndicator
      items={items}
      currentItemId={select(
        'id',
        items.map((item) => item.id),
        items[0].id
      )}
      onClickItem={action('onClickItem')}
      stepWidth={!spaceEquallyFlag ? number('stepWidth', 6) : null}
      showLabels={boolean('showlabels', true)}
      isVerticalMode={boolean('isVerticalMode', false)}
      isClickable={boolean('isClickable', true)}
      spaceEqually={spaceEquallyFlag}
    />
  );
};

Presentation.storyName = 'presentation';

export const PresentationVertical = () => (
  <ProgressIndicator
    items={items}
    currentItemId={select(
      'id',
      items.map((item) => item.id),
      items[1].id
    )}
    showLabels={boolean('showlabels', true)}
    isClickable={boolean('isClickable', true)}
    isVerticalMode={boolean('isVerticalMode', true)}
  />
);

PresentationVertical.storyName = 'presentation vertical';

export const HideLabelsAndDefaultStepWidth = () => (
  <ProgressIndicator
    items={items}
    currentItemId={select(
      'id',
      items.map((item) => item.id),
      items[1].id
    )}
    onClickItem={action('onClickItem')}
    showLabels={boolean('showlabels', false)}
    isVerticalMode={boolean('isVerticalMode', false)}
    isClickable={boolean('isClickable', true)}
  />
);

HideLabelsAndDefaultStepWidth.storyName = 'hideLabels and default stepWidth';

export const Skeleton = () => <ProgressIndicatorSkeleton />;

Skeleton.storyName = 'skeleton';

Skeleton.parameters = {
  info: {
    text: `
            Placeholder skeleton state to use when content is loading.
        `,
  },
};

export const CarbonDefaultProgressIndicator = () => (
  <CarbonProgressIndicator
    vertical={boolean('Vertical (vertical)', false)}
    currentIndex={number('Current progress (currentIndex)', 1)}
    spaceEqually={boolean('Space Equally (spaceEqually)', false)}
  >
    <CarbonProgressStep
      label={text('Label (label)', 'First step')}
      description="Step 1: Getting started with Carbon Design System"
      secondaryLabel="Optional label"
    />
    <CarbonProgressStep
      label="Second step with tooltip"
      description="Step 2: Getting started with Carbon Design System"
      renderLabel={() => (
        <Tooltip
          direction="bottom"
          showIcon={false}
          triggerClassName={`${prefix}--progress-label`}
          triggerText="Second step with tooltip"
          triggerId="tooltipTrigger-0"
          tooltipId="tooltipId-0"
        >
          <p>Overflow tooltip content.</p>
        </Tooltip>
      )}
    />
    <CarbonProgressStep
      label="Third step with tooltip"
      description="Step 3: Getting started with Carbon Design System"
      renderLabel={() => (
        <Tooltip
          direction="bottom"
          showIcon={false}
          triggerClassName={`${prefix}--progress-label`}
          triggerText="Third step with tooltip"
          triggerId="tooltipTrigger-1"
          tooltipId="tooltipId-1"
        >
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi consequuntur hic ratione
            aliquid cupiditate, nesciunt saepe iste blanditiis cumque maxime tenetur veniam est illo
            deserunt sint quae pariatur. Laboriosam, consequatur.
          </p>
        </Tooltip>
      )}
    />
    <CarbonProgressStep
      label="Fourth step"
      description="Step 4: Getting started with Carbon Design System"
      invalid
      secondaryLabel="Example invalid step"
    />
    <CarbonProgressStep
      label="Fifth step"
      description="Step 5: Getting started with Carbon Design System"
      disabled
    />
  </CarbonProgressIndicator>
);

CarbonDefaultProgressIndicator.storyName = 'carbon progress indicator';

CarbonDefaultProgressIndicator.parameters = {
  info: {
    text: `The default Carbon Progress Indicator component.`,
  },
};
