import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, object, boolean } from '@storybook/addon-knobs';
import { SettingsAdjust } from '@carbon/react/icons';
import { cloneDeep } from 'lodash-es';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import FlyoutMenu, { FlyoutMenuDirection } from '../FlyoutMenu/FlyoutMenu';

import PieChartCard from './PieChartCard';

const acceptableSizes = Object.keys(CARD_SIZES).filter(
  (size) => size.includes('MEDIUM') || size.includes('LARGE')
);

const chartDataExample = [
  {
    group: '2V2N 9KYPM',
    category: 'A',
    value: 1,
  },
  {
    group: 'L22I P66EP L22I P66EP',
    category: 'B',
    value: 10,
  },
  {
    group: 'JQAI 2M4L1',
    category: 'C',
    value: 20,
  },
  {
    group: 'J9DZ F37AP',
    category: 'D',
    value: 50,
  },
  {
    group: 'YEL48 Q6XK YEL48',
    category: 'E',
    value: 15,
  },
  {
    group: 'Misc',
    category: 'F',
    value: 40,
  },
];

export default {
  title: '1 - Watson IoT/Card/PieChartCard',

  parameters: {
    component: PieChartCard,
  },
};

export const Basic = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.MEDIUM);
  const groupDataSourceId = select('groupDataSourceId', ['category', 'group'], 'category');
  const chartData = object('chartData', chartDataExample);

  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        content={{
          groupDataSourceId,
          legendPosition: select('legendPosition', ['bottom', 'top'], 'bottom'),
        }}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

Basic.storyName = 'basic';

export const WithCardVariables = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.LARGE);
  const groupDataSourceId = select('groupDataSourceId', ['category', 'group'], 'group');
  const chartDataExampleWithVars = chartDataExample.map((data) => ({
    ...data,
    group: `{var1} ${data.group}`,
  }));
  const chartData = object('chartData', chartDataExampleWithVars);
  const cardVariables = object('cardVariables', { var1: 'Inserted' });

  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        cardVariables={cardVariables}
        content={{
          groupDataSourceId,
          legendPosition: select('legendPosition', ['bottom', 'top'], 'bottom'),
        }}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

WithCardVariables.storyName = 'with CardVariables';

export const CustomColors = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.LARGE);
  const groupDataSourceId = select('groupDataSourceId', ['category', 'group'], 'category');
  const chartData = object('chartData', chartDataExample);
  const colorsMap = object('colors', {
    A: 'red',
    B: 'green',
    C: 'blue',
    D: 'yellow',
    E: 'purple',
    F: 'orange',
  });
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        content={{
          colors: colorsMap,
          groupDataSourceId,
          legendPosition: select('legendPosition', ['bottom', 'top'], 'bottom'),
        }}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

CustomColors.storyName = 'custom colors';

export const CustomLabels = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.LARGE);
  const groupDataSourceId = select('groupDataSourceId', ['category', 'group'], 'category');
  const chartData = object('chartData', chartDataExample);

  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        content={{
          groupDataSourceId,
          labelsFormatter: (wrapper) => {
            return `${wrapper.data[groupDataSourceId]} (${wrapper.value})`;
          },
          legendPosition: select('legendPosition', ['bottom', 'top'], 'bottom'),
        }}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

CustomLabels.storyName = 'custom labels';

export const CustomTooltip = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.LARGE);
  const groupDataSourceId = select('groupDataSourceId', ['category', 'group'], 'category');
  const chartData = object('chartData', chartDataExample);

  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        content={{
          customTooltip: ([pieData] = [], html) => {
            return pieData ? `label: ${pieData.label} - Value: ${pieData.value}` : html;
          },
          groupDataSourceId,
          legendPosition: select('legendPosition', ['bottom', 'top'], 'bottom'),
        }}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

CustomTooltip.storyName = 'custom tooltip';

export const NoData = () => {
  const size = select('size', acceptableSizes, CARD_SIZES.LARGE);
  const chartData = object('chartData', []);
  const i18n = object('i18n', { noDataLabel: 'No data for this card' });
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <PieChartCard
        availableActions={{ expand: true }}
        content={{
          legendPosition: 'bottom',
        }}
        i18n={i18n}
        id="basicCardStory"
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        onCardAction={action('onCardAction')}
        size={size}
        title={text('title', 'Schools')}
        testID="basicCardStoryTest"
        values={chartData}
      />
    </div>
  );
};

NoData.storyName = 'no data';

export const AdvancedCustomisationUsingOverrides = () => {
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', CARD_SIZES.LARGE).x}px`,
        margin: 20,
      }}
    >
      <PieChartCard
        availableActions={{ expand: true }}
        content={{ legendPosition: 'bottom' }}
        id="basicCardStory"
        isExpanded={boolean('isExpanded', true)}
        onCardAction={action('onCardAction')}
        size={CARD_SIZES.LARGE}
        title="Animations turned on and FlyoutMenu added to table"
        testID="basicCardStoryTest"
        values={chartDataExample}
        overrides={{
          pieChart: {
            props: (originalPieChartProps) => {
              const props = cloneDeep(originalPieChartProps);
              props.options.animations = true;
              return props;
            },
          },
          table: {
            props: (originalTableProps) => {
              const props = cloneDeep(originalTableProps);
              props.view.toolbar = {
                customToolbarContent: (
                  <FlyoutMenu
                    direction={FlyoutMenuDirection.BottomEnd}
                    buttonProps={{
                      size: 'default',
                      renderIcon: SettingsAdjust,
                    }}
                    triggerId="test-flyout-id"
                    transactional
                    onApply={action('FlyoutMenuApply')}
                    onCancel={action('FlyoutMenuCancel')}
                    iconDescription=""
                  >
                    Example Flyout Content
                  </FlyoutMenu>
                ),
              };
              return props;
            },
          },
        }}
      />
    </div>
  );
};

AdvancedCustomisationUsingOverrides.storyName = 'advanced customisation using overrides';
