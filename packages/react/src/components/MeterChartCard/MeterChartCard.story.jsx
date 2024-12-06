import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, number, select, boolean, object } from '@storybook/addon-knobs';
import { layout05 } from '@carbon/layout';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';

// import MeterChartCardREADME from './MeterChartCard.mdx'; //carbon 11
import MeterChartCard from './MeterChartCard';

const supportedSizes = Object.keys(CARD_SIZES).filter(
  (size) => (size.includes('MEDIUM') || size.includes('LARGE')) && size !== CARD_SIZES.MEDIUMTHIN
);
export default {
  title: '1 - Watson IoT/Card/MeterChartCard',
  parameters: {
    component: MeterChartCard,
    // docs: {
    //   page: MeterChartCardREADME,
    // }, //carbon 11
  },
};

export const Basic = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  const totalFormatter = boolean('hasTotalFormatter', false);
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <MeterChartCard
        title={text('title', 'Manage')}
        content={{
          peak: number('content.peak', 2000),
          meterTotal: number('content.meterTotal', 1000),
          meterUnit: text('content.meterUnit', 'AppPoints'),
          totalFormatter: totalFormatter
            ? (total) => text('content.totalFormatter', `${total} custom formatter`)
            : null,
          color: {
            pairing: {
              option: 5,
            },
          },
          legendPosition: 'top',
          status: object('content.status', {
            success: [0, 300],
            warning: [300, 900],
            danger: [900, 2000],
          }),
        }}
        values={object('values', [
          {
            group: 'Install',
            value: 100,
          },
          {
            group: 'Limited users',
            value: 200,
          },
          {
            group: 'Base users',
            value: 300,
          },
          {
            group: 'Premium users',
            value: 200,
          },
          {
            group: 'Cron tasks',
            value: 100,
          },
          {
            group: 'Reports',
            value: 150,
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

export const BasicWithNoFooter = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <MeterChartCard
        title={text('title', 'Manage')}
        content={{
          peak: number('content.peak', 2000),
          meterTotal: number('content.meterTotal', 1000),
          meterUnit: text('content.meterUnit', 'AppPoints'),
          color: {
            pairing: {
              option: 5,
            },
          },
          legendPosition: 'top',
          status: object('content.status', {
            success: [0, 300],
            warning: [300, 900],
            danger: [900, 2000],
          }),
        }}
        values={[
          {
            group: 'Install',
            value: 100,
          },
          {
            group: 'Limited users',
            value: 200,
          },
          {
            group: 'Base users',
            value: 300,
          },
          {
            group: 'Premium users',
            value: 200,
          },
          {
            group: 'Cron tasks',
            value: 100,
          },
          {
            group: 'Reports',
            value: 150,
          },
        ]}
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

BasicWithNoFooter.storyName = 'basic with no footer';
export const EmptyState = () => {
  const size = select('size', supportedSizes, CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'md');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: layout05,
      }}
    >
      <MeterChartCard
        title={text('title', 'Manage')}
        content={{
          peak: number('content.peak', 2000),
          meterTotal: number('content.meterTotal', 1000),
          meterUnit: text('content.meterUnit', 'AppPoints'),
          color: {
            pairing: {
              option: 5,
            },
          },
          status: object('content.status', {
            success: [0, 300],
            warning: [300, 900],
            danger: [900, 2000],
          }),
        }}
        values={[]}
        size={size}
        breakpoint={breakpoint}
        footerContent={() => <div>Occured on ... </div>}
        isExpanded={boolean('isExpanded', false)}
        locale="en"
        availableActions={{ expand: true }}
        onCardAction={action('onCardAction')}
        i18n={{
          noDataLabel: 'No data',
        }}
      />
    </div>
  );
};

EmptyState.storyName = 'empty state';
