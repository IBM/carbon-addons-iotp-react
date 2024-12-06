import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, select, text } from '@storybook/addon-knobs';
import {
  ChartColumnFloating,
  ChartLineData,
  ChartBubble,
  ChartVennDiagram,
  TableSplit,
  QqPlot,
  ChartEvaluation,
  ChartSunburst,
  Diagram,
} from '@carbon/react/icons';

import Dropdown from './Dropdown';

import { DropdownSkeleton } from '.';

export const items = [
  {
    id: 'option-0',
    icon: ChartColumnFloating,
    text: 'Column Chart',
  },
  {
    id: 'option-1',
    icon: ChartBubble,
    text: 'Bubble Chart',
  },
  {
    id: 'option-2',
    icon: ChartVennDiagram,
    text: 'Venn Diagram',
  },
  {
    id: 'option-3',
    icon: ChartEvaluation,
    text: 'Evaluation Chart',
  },
  {
    id: 'option-4',
    icon: ChartLineData,
    text: 'Line Chart',
  },
  {
    id: 'option-5',
    icon: TableSplit,
    text: 'Option 5',
  },
  {
    id: 'option-6',
    icon: QqPlot,
    text: 'QQ Plot',
  },
  {
    id: 'option-7',
    icon: ChartSunburst,
    text: 'Sunburst Chart',
  },
  {
    id: 'option-8',
    icon: Diagram,
    text: 'Diagram',
  },
];

const directions = {
  'Bottom (default)': 'bottom',
  'Top ': 'top',
};

const props = () => ({
  id: text('Dropdown ID (id)', 'carbon-dropdown-example'),
  direction: select('Dropdown direction (direction)', directions, 'bottom'),
  label: text('Label (label)', 'Dropdown menu options'),
  ariaLabel: text('Aria Label (ariaLabel)', 'Dropdown'),
  disabled: boolean('Disabled (disabled)', false),
  light: boolean('Light variant (light)', false),
  titleText: text('Title (titleText)', 'Dropdown label'),
  helperText: text('Helper text (helperText)', 'This is some helper text.'),
  invalid: boolean('Show form validation UI (invalid)', false),
  invalidText: text('Form validation UI content (invalidText)', 'A valid value is required'),
});

export default {
  title: '1 - Watson IoT/DropDown/Dropdown',
  decorators: [withKnobs],
  parameters: {
    component: Dropdown,
  },
  excludeStories: ['items', 'DropdownStory'],
};

export const Default = () => (
  <div style={{ width: 300 }}>
    <Dropdown
      id="default"
      titleText="Dropdown label"
      helperText="This is some helper text"
      label="Dropdown menu options"
      items={items}
      itemToString={(item) => (item ? item.text : '')}
      onChange={action('onChange')}
    />
  </div>
);

export const Inline = () => (
  <div style={{ width: 600 }}>
    <Dropdown
      id="inline"
      titleText="Inline dropdown label"
      label="Dropdown menu options"
      type="inline"
      items={items}
      itemToString={(item) => (item ? item.text : '')}
      onChange={action('onChange')}
    />
  </div>
);

export const Playground = () => {
  return (
    <div style={{ width: 300 }}>
      <Dropdown {...props()} items={items} itemToString={(item) => (item ? item.text : '')} />
    </div>
  );
};

export const WithIcons = () => {
  return (
    <div
      style={{
        width: select('wrapper width', ['300px', '100px'], '300px'),
      }}
    >
      <Dropdown
        {...props()}
        id="some-dropdown-id"
        items={items}
        onChange={(viewItem) => {
          action('onChangeView')(viewItem);
        }}
      />
    </div>
  );
};

WithIcons.storyName = 'with icons and labels';

export const Skeleton = () => (
  <div style={{ width: 300 }}>
    <DropdownSkeleton />
  </div>
);
