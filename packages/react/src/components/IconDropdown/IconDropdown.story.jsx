import React, { useState } from 'react';
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
} from '@carbon/react/icons';

import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';

import IconDropdown from './IconDropdown';

export const Experimental = () => <StoryNotice componentName="IconDropdown" experimental />;
Experimental.storyName = experimentalStoryTitle;

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
];

const directions = {
  'Bottom (default)': 'bottom',
  'Top ': 'top',
};

const props = () => ({
  id: text('IconDropdown ID (id)', 'carbon-icon-dropdown-example'),
  dropdownId: text('Dropdown ID (id)', 'carbon-dropdown-example'),
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
  title: '2 - Watson IoT Experimental/☢️ IconDropdown',
  decorators: [withKnobs],
  parameters: {
    component: IconDropdown,
  },
  excludeStories: ['items'],
};

export const _Default = () => {
  const DefaultExample = () => {
    const renderFooter = (item) => {
      return <div>{item.text}</div>;
    };

    const itemsWithFooter = items.map((item) => {
      return {
        ...item,
        footer: renderFooter(item),
      };
    });

    const [selectedItem, setSelectedItem] = useState(null);

    return (
      <div
        style={{
          width: select('wrapper width', ['300px', '100px'], '300px'),
          transform: 'translateY(100px)',
        }}
      >
        <IconDropdown
          {...props()}
          id="unique-drop-down-id"
          items={itemsWithFooter}
          selectedItem={selectedItem}
          initialSelectedItem={selectedItem}
          onChange={(item) => {
            setSelectedItem(item);
            action('onChangeView')(item);
          }}
        />
      </div>
    );
  };

  return <DefaultExample />;
};

_Default.storyName = 'default';
