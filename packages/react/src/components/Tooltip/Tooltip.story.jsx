/* eslint-disable react/destructuring-assignment */
/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withKnobs, select, text, number } from '@storybook/addon-knobs';
import { OverflowMenuVertical } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import Button from '../Button';

import { Tooltip } from '.';

const { prefix } = settings;
const directions = {
  'Bottom (bottom)': 'bottom',
  'Left (left)': 'left',
  'Top (top)': 'top',
  'Right (right)': 'right',
};

const props = {
  withIcon: () => ({
    direction: select('Tooltip direction (direction)', directions, 'bottom'),
    triggerText: text('Trigger text (triggerText)', 'Tooltip label'),
    tabIndex: number('Tab index (tabIndex in <Tooltip>)', 0),
    selectorPrimaryFocus: text('Primary focus element selector (selectorPrimaryFocus)', ''),
    triggerId: 'withIcon',
  }),
  withoutIcon: () => ({
    showIcon: false,
    direction: select('Tooltip direction (direction)', directions, 'bottom'),
    triggerText: text('Trigger text (triggerText)', 'Tooltip label'),
    tabIndex: number('Tab index (tabIndex in <Tooltip>)', 0),
    selectorPrimaryFocus: text('Primary focus element selector (selectorPrimaryFocus)', ''),
    triggerId: 'withoutIcon',
  }),
  customIcon: () => ({
    showIcon: true,
    direction: select('Tooltip direction (direction)', directions, 'bottom'),
    triggerText: text('Trigger text (triggerText)', 'Tooltip label'),
    tabIndex: number('Tab index (tabIndex in <Tooltip>)', 0),
    selectorPrimaryFocus: text('Primary focus element selector (selectorPrimaryFocus)', ''),
    triggerId: 'customIcon',
    // eslint-disable-next-line react/display-name
    renderIcon: React.forwardRef((props, ref) => (
      <div ref={ref}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
          <path d="M8.5 11V6.5h-2v1h1V11H6v1h4v-1zM8 3.5c-.4 0-.8.3-.8.8s.4.7.8.7.8-.3.8-.8-.4-.7-.8-.7z" />
          <path d="M8 15c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zM8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" />
          <path fill="none" d="M0 0h16v16H0z" />
        </svg>
      </div>
    )),
  }),
  customIconOnly: () => ({
    showIcon: true,
    direction: select('Tooltip direction (direction)', directions, 'bottom'),
    iconDescription: 'Helpful Information',
    tabIndex: number('Tab index (tabIndex in <Tooltip>)', 0),
    selectorPrimaryFocus: text('Primary focus element selector (selectorPrimaryFocus)', ''),
    renderIcon: OverflowMenuVertical,
    triggerId: 'customIconOnly',
  }),
};

const containerStyles = {
  height: 'calc(100vh - 6rem)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

Tooltip.displayName = 'Tooltip';

export default {
  title: '1 - Watson IoT/Tooltip',
  decorators: [withKnobs],

  parameters: {
    component: Tooltip,
  },
};

export const DefaultBottom = () => (
  <div style={containerStyles}>
    <Tooltip {...props.withIcon()} tooltipBodyId="tooltip-body">
      <>
        <p id="tooltip-body">
          This is some tooltip text. This box shows the maximum amount of text that should appear
          inside. If more room is needed please use a modal instead.
        </p>
        <div className={`${prefix}--tooltip__footer`}>
          <a href="/" className={`${prefix}--link`}>
            Learn More
          </a>
          <Button size="sm">Create</Button>
        </div>
      </>
    </Tooltip>
  </div>
);

DefaultBottom.storyName = 'default (bottom)';

DefaultBottom.parameters = {
  info: {
    text: `
        Interactive tooltip should be used if there are actions a user can take in the tooltip (e.g. a link or a button).
        For more regular use case, e.g. giving the user more text information about something, use definition tooltip or icon tooltip.
        By default, the tooltip will render above the element. The example below shows the default scenario.
      `,
  },
};

export const NoIcon = () => (
  <div style={containerStyles}>
    <Tooltip {...props.withoutIcon()}>
      <>
        <p id="tooltip-body">
          This is some tooltip text. This box shows the maximum amount of text that should appear
          inside. If more room is needed please use a modal instead.
        </p>
        <div className={`${prefix}--tooltip__footer`}>
          <a href="/" className={`${prefix}--link`}>
            Learn More
          </a>
          <Button size="sm">Create</Button>
        </div>
      </>
    </Tooltip>
  </div>
);

NoIcon.storyName = 'no icon';

NoIcon.parameters = {
  info: {
    text: `
        Interactive tooltip should be used if there are actions a user can take in the tooltip (e.g. a link or a button).
        For more regular use case, e.g. giving the user more text information about something, use definition tooltip or icon tooltip.
        By default, the tooltip will render with an information Icon. The example below shows the option to exclude the Icon.
      `,
  },
};

export const RenderCustomIcon = () => (
  <div style={containerStyles}>
    <Tooltip {...props.customIcon()}>
      <>
        <p id="tooltip-body">
          This is some tooltip text. This box shows the maximum amount of text that should appear
          inside. If more room is needed please use a modal instead.
        </p>
        <div className={`${prefix}--tooltip__footer`}>
          <a href="/" className={`${prefix}--link`}>
            Learn More
          </a>
          <Button size="sm">Create</Button>
        </div>
      </>
    </Tooltip>
  </div>
);

RenderCustomIcon.storyName = 'render custom icon';

RenderCustomIcon.parameters = {
  info: {
    text: `
        Interactive tooltip should be used if there are actions a user can take in the tooltip (e.g. a link or a button).
        For more regular use case, e.g. giving the user more text information about something, use definition tooltip or icon tooltip.
        By default, the tooltip will render with an information Icon. The example below shows the option to exclude the Icon.
      `,
  },
};

export const OnlyCustomIcon = () => (
  <div style={containerStyles}>
    <Tooltip {...props.customIconOnly()}>
      <>
        <p id="tooltip-body">
          This is some tooltip text. This box shows the maximum amount of text that should appear
          inside. If more room is needed please use a modal instead.
        </p>
        <div className={`${prefix}--tooltip__footer`}>
          <a href="/" className={`${prefix}--link`}>
            Learn More
          </a>
          <Button size="sm">Create</Button>
        </div>
      </>
    </Tooltip>
  </div>
);

OnlyCustomIcon.storyName = 'only custom icon';

OnlyCustomIcon.parameters = {
  info: {
    text: `
        Interactive tooltip should be used if there are actions a user can take in the tooltip (e.g. a link or a button).
        For more regular use case, e.g. giving the user more text information about something, use definition tooltip or icon tooltip.
        By default, the tooltip will render with an information Icon. The example below shows the option to exclude the Icon.
      `,
  },
};

export const AutoPositioningExample = () => {
  return (
    <div
      style={{
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        height: 'calc(100vh - 4rem)',
      }}
    >
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Tooltip
            triggerId="top-left"
            tooltipBodyId="tooltip-body"
            direction="left"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Tooltip
            triggerId="top-center"
            tooltipBodyId="tooltip-body"
            direction="top"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip
            triggerId="top-right"
            tooltipBodyId="tooltip-body"
            direction="right"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Tooltip
            triggerId="left-center"
            tooltipBodyId="tooltip-body"
            direction="left"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tooltip
            triggerId="center"
            tooltipBodyId="tooltip-body"
            direction="top"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip
            triggerId="right-center"
            tooltipBodyId="tooltip-body"
            direction="right"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Tooltip
            triggerId="bottom-left"
            tooltipBodyId="tooltip-body"
            direction="left"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Tooltip
            triggerId="bottom-center"
            tooltipBodyId="tooltip-body"
            direction="top"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip
            triggerId="bottom-right"
            tooltipBodyId="tooltip-body"
            direction="right"
            useAutoPositioning
          >
            <p id="tooltip-body">This is a body.</p>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

AutoPositioningExample.storyName = 'autopositioning example';
