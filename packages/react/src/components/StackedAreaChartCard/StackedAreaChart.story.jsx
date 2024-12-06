import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, boolean, object } from '@storybook/addon-knobs';
import { layout05 } from '@carbon/layout';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';

// import StackedAreaChartCardREADME from './StackedAreaChartCard.mdx'; //carbon 11
import StackedAreaChartCard from './StackedAreaChartCard';

const supportedSizes = Object.keys(CARD_SIZES).filter(
  (size) => (size.includes('MEDIUM') || size.includes('LARGE')) && size !== CARD_SIZES.MEDIUMTHIN
);
export default {
  title: '1 - Watson IoT/Card/StackedAreaChartCard',
  parameters: {
    component: StackedAreaChartCard,
    // docs: {
    //   page: StackedAreaChartCardREADME,
    // }, //carbon 11
  },
};

export const Basic = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <StackedAreaChartCard
        title={text('title', 'Manage')}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          color: {
            pairing: {
              option: 4,
            },
          },
        }}
        values={object('values', [
          {
            group: 'Dummy',
            date: '2019-01-01T02:00:00.000Z',
            value: 10000,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy',
            date: '2019-01-02T02:00:00.000Z',
            value: 50400,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-03T02:00:00.000Z',
            value: 32200,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-07T02:00:00.000Z',
            value: 59293,
          },
        ])}
        size={size}
        breakpoint={breakpoint}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

Basic.storyName = 'basic';

export const withThresholds = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <StackedAreaChartCard
        title={text('title', 'Manage')}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          yThresholds: [
            {
              value: 80000,
              label: 'Threshold',
            },
          ],
          color: {
            pairing: {
              option: 4,
            },
          },
        }}
        values={object('values', [
          {
            group: 'Dummy',
            date: '2019-01-01T02:00:00.000Z',
            value: 10000,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy',
            date: '2019-01-02T02:00:00.000Z',
            value: 50400,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-03T02:00:00.000Z',
            value: 32200,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-07T02:00:00.000Z',
            value: 59293,
          },
        ])}
        size={size}
        breakpoint={breakpoint}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

withThresholds.storyName = 'with Thresholds';
export const EmptyState = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <StackedAreaChartCard
        title={text('title', 'Manage')}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          color: {
            pairing: {
              option: 4,
            },
          },
        }}
        values={[]}
        size={size}
        breakpoint={breakpoint}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

EmptyState.storyName = 'empty state';
