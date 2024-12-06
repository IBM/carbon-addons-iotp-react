import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, boolean, object } from '@storybook/addon-knobs';
import { layout05 } from '@carbon/layout';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';

// import SparklineChartCardREADME from './SparklineChartCard.mdx'; //carbon 11
import SparklineChartCard from './SparklineChartCard';

const supportedSizes = Object.keys(CARD_SIZES).filter(
  (size) => (size.includes('MEDIUM') || size.includes('LARGE')) && size !== CARD_SIZES.MEDIUMTHIN
);
export default {
  title: '1 - Watson IoT/Card/SparklineChartCard',
  parameters: {
    component: SparklineChartCard,
    // docs: {
    //   page: SparklineChartCardREADME,
    // }, //carbon 11
  },
};

export const Basic = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMTHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <SparklineChartCard
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
            gradient: {
              enabled: true,
            },
          },
          listContent: object('content.listContent', [
            { label: 'Target', value: 1000 },
            { label: 'Mean', value: 756 },
            { label: 'Peak', value: 1045 },
          ]),
        }}
        values={object('values', [
          {
            group: 'Dataset 1',
            date: 1558453860000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453920000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453980000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454040000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454100000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454160000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454280000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454340000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454460000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454520000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454580000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454640000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454700000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454760000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454820000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454880000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558454940000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558455000000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558455060000,
            value: 2,
          },
        ])}
        size={size}
        breakpoint={breakpoint}
        footerContent={() => <div>Occured on ... </div>}
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
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMTHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <SparklineChartCard
        title={text('title', 'Manage')}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          yThresholds: [
            {
              value: 6,
              label: 'Threshold',
            },
          ],
          color: {
            pairing: {
              option: 4,
            },
            gradient: {
              enabled: true,
            },
          },
          listContent: object('content.listContent', [
            { label: 'Target', value: 1000 },
            { label: 'Mean', value: 756 },
            { label: 'Peak', value: 1045 },
          ]),
        }}
        values={object('values', [
          {
            group: 'Dataset 1',
            date: 1558453860000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453920000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453980000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454040000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454100000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454160000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454280000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454340000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454460000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454520000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454580000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454640000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454700000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454760000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454820000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454880000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558454940000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558455000000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558455060000,
            value: 2,
          },
        ])}
        size={size}
        breakpoint={breakpoint}
        footerContent={() => <div>Occured on ... </div>}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

withThresholds.storyName = 'with thresholds';
export const MultipleGroups = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMTHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <SparklineChartCard
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
            gradient: {
              enabled: true,
            },
          },
          listContent: object('content.listContent', [
            { label: 'Target', value: 1000 },
            { label: 'Mean', value: 756 },
            { label: 'Peak', value: 1045 },
          ]),
        }}
        values={object('values', [
          {
            group: 'Dataset 1',
            date: 1558453860000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453920000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453980000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454040000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454100000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454160000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454280000,
            value: 2,
          },
          {
            group: 'Dataset 2',
            date: 1558454340000,
            value: 6,
          },
          {
            group: 'Dataset 2',
            date: 1558454460000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454520000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454580000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454640000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454700000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454760000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454820000,
            value: 4,
          },
          {
            group: 'Dataset 3',
            date: 1558454880000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558454880000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558454940000,
            value: 1,
          },
          {
            group: 'Dataset 3',
            date: 1558454940000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558455000000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558455060000,
            value: 2,
          },
        ])}
        size={size}
        breakpoint={breakpoint}
        footerContent={() => <div>Occured on ... </div>}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

MultipleGroups.storyName = 'multiple chart groups';
export const EmptyState = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUMTHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <SparklineChartCard
        title={text('title', 'Manage')}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          color: {
            pairing: {
              option: 5,
            },
          },
          listContent: object('content.listContent', []),
        }}
        values={object('values', [])}
        size={size}
        breakpoint={breakpoint}
        footerContent={() => <div>Occured on ... </div>}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
        i18n={{ noDataLabel: 'No data available.' }}
      />
    </div>
  );
};

EmptyState.storyName = 'empty state';
