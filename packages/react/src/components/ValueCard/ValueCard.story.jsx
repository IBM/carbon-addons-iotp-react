import React from 'react';
import { text, select, object, boolean, number } from '@storybook/addon-knobs';
import { Bee, Checkmark, WarningFilled } from '@carbon/react/icons';
import { action } from '@storybook/addon-actions';

import { CARD_SIZES, CARD_DATA_STATE } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import { getDataStateProp } from '../Card/Card.story';

import ValueCard from './ValueCard';
// import ValueCardREADME from './ValueCard.mdx'; //carbon 11

export default {
  title: '1 - Watson IoT/Card/ValueCard',

  parameters: {
    component: ValueCard,
    // docs: {
    //   page: ValueCardREADME,
    // },
  },
};

export const SmallLongNoUnits = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALL);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title="Tagpath"
        id="facilitycard"
        content={{
          attributes: [
            {
              label: 'Tagpath',
              dataSourceId: 'footTraffic',
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          footTraffic: text(
            'occupancy',
            'rutherford/rooms/northadd/ah2/ft_supflow/eurutherford/rooms/northadd/ah2/ft_supflow/eu'
          ),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
      />
    </div>
  );
};

SmallLongNoUnits.storyName = 'with long text, no units, no click handler';

SmallLongNoUnits.parameters = {
  info: {
    text: 'In the case of having a long string value with no units, there is extra room to wrap the text to two lines. This makes it easier to read without needing to mouse over the text value.',
  },
};

export const WithTrends = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALL);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Foot Traffic - {a-variable}')}
        id="facilitycard"
        cardVariables={object('variables', {
          'a-variable': 'working',
        })}
        content={{
          attributes: [
            {
              dataSourceId: 'footTraffic',
              label: text('content.attributes[0].label', 'Walkers'),
              secondaryValue: {
                dataSourceId: 'trend',
                trend: select('content.attributes[0].secondaryValue.trend', ['up', 'down'], 'down'),
                color: select(
                  'content.attributes[0].secondaryValue.color',
                  ['red', 'green'],
                  'red'
                ),
              },
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          footTraffic: number('values.footTraffic', 13572),
          trend: text('values.trend', '22%'),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

WithTrends.storyName = 'with trends, variables, and label';

export const WithLinkAndMeasurementUnit = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALLWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `624px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Overage')}
        id="appPoints-overage"
        renderIconByName={(name, props = {}) =>
          name === 'bee' ? (
            <Bee {...props}>
              <title>{props.title}</title>
            </Bee>
          ) : name === 'checkmark' ? (
            <Checkmark {...props}>
              <title>{props.title}</title>
            </Checkmark>
          ) : name === 'warning' ? (
            <WarningFilled {...props}>
              <title>{props.title}</title>
            </WarningFilled>
          ) : (
            <span>Unknown</span>
          )
        }
        content={{
          attributes: [
            {
              dataSourceId: 'peakUsage',
              label: text('content.attributes[0].label', 'Peak usage'),
              tooltip: text('content.attributes[0].tooltip', 'Peak usage tooltip'),
              measurementUnitLabel: text('content.attributes[0].measurementUnitLabel', 'AppPoints'),
              thresholds: [
                {
                  comparison: '>',
                  value: 1000,
                  icon: select(
                    'content.attributes[0].thresholds[0].icon',
                    ['bee', 'checkmark', 'warning', 'undefined'],
                    'warning'
                  ),
                  color: select(
                    'content.attributes[0].thresholds[0].color',
                    ['red', 'green', 'yellow'],
                    '#f1c21b'
                  ),
                },
              ],
              secondaryValue: {
                dataSourceId: 'trend',
                trend: select('content.attributes[0].secondaryValue.trend', ['up', 'down'], 'up'),
                color: select(
                  'content.attributes[0].secondaryValue.color',
                  ['red', 'green'],
                  'red'
                ),
              },
            },
            {
              dataSourceId: 'target',
              label: text('content.attributes[1].label', 'Target'),
              measurementUnitLabel: text('content.attributes[1].measurementUnitLabel', 'AppPoints'),
              secondaryValue: {
                dataSourceId: 'adjustTarget',
                // href: 'https://google.com',
                onClick: action('onClick'),
              },
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          peakUsage: number('values.peakUsage', 1045),
          trend: text('values.trend', 'Up 30% month on month'),
          target: number('values.target', 1000),
          adjustTarget: text('values.adjustTarget', 'Adjust target'),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
      />
    </div>
  );
};

WithLinkAndMeasurementUnit.storyName = 'with link and measurement unit ';
export const WithThresholds = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALL);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Alert Count')}
        id="facilitycard"
        renderIconByName={(name, props = {}) =>
          name === 'bee' ? (
            <Bee {...props}>
              <title>{props.title}</title>
            </Bee>
          ) : name === 'checkmark' ? (
            <Checkmark {...props}>
              <title>{props.title}</title>
            </Checkmark>
          ) : (
            <span>Unknown</span>
          )
        }
        content={{
          attributes: [
            {
              dataSourceId: 'alertCount',
              thresholds: [
                {
                  comparison: '>',
                  value: 5,
                  icon: select(
                    'content.attributes[0].thresholds[0].icon',
                    ['bee', 'checkmark', 'undefined'],
                    'bee'
                  ),
                  color: select(
                    'content.attributes[0].thresholds[0].color',
                    ['red', 'green', 'yellow'],
                    'green'
                  ),
                },
              ],
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        values={{ alertCount: number('values.alertCount', 70) }}
        customFormatter={(formattedValue) => {
          return text('Custom Value', formattedValue);
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

WithThresholds.storyName = 'with thresholds, custom icon renderer, and custom formatter';

export const SmallWideThresholdsString = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALLWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Status')}
        id="facilitycard"
        content={{
          attributes: object('content.attributes', [
            {
              dataSourceId: 'status',
              thresholds: [
                {
                  comparison: '=',
                  value: 'Healthy',
                  icon: 'checkmark',
                  color: 'green',
                },
                {
                  comparison: '=',
                  value: 'Unhealthy',
                  icon: 'close',
                  color: 'red',
                },
              ],
            },
          ]),
        }}
        breakpoint={breakpoint}
        size={size}
        values={{ status: text('status', 'Unhealthy') }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

SmallWideThresholdsString.storyName = 'with thresholds (string)';

export const MediumThin3 = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUMTHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Facility Conditions')}
        id="facilitycard"
        content={{
          attributes: [
            {
              label: 'Comfort Level',
              dataSourceId: 'comfortLevel',
              unit: '%',
              thresholds: [
                {
                  comparison: '>',
                  value: 80,
                  color: '#F00',
                  icon: 'warning',
                },
                {
                  comparison: '<',
                  value: 80,
                  color: '#5aa700',
                  icon: 'checkmark',
                },
              ],
            },
            {
              label: 'Average Temperature',
              dataSourceId: 'averageTemp',
              unit: '˚F',
              precision: 1,
              thresholds: [
                {
                  comparison: '>',
                  value: 80,
                  color: '#F00',
                  icon: 'warning',
                },
                {
                  comparison: '<',
                  value: 80,
                  color: '#5aa700',
                  icon: 'checkmark',
                },
              ],
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
              unit: '˚F',
              precision: 1,
              thresholds: [
                {
                  comparison: '>',
                  value: 80,
                  color: '#F00',
                  icon: 'warning',
                },
                {
                  comparison: '<',
                  value: 80,
                  color: '#5aa700',
                  icon: 'checkmark',
                },
              ],
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          comfortLevel: number('comfortLevel', 345678234234234234),
          averageTemp: number('averageTemp', 456778234234234234),
          humidity: number('humidity', 88888678234234234234),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

MediumThin3.storyName = 'with three data points and thresholds';

export const WithFourDataPoints = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.SMALLWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Status')}
        id="facilitycard"
        content={{
          attributes: object('content.attributes', [
            {
              dataSourceId: 'status',
              label: 'Status',
            },
            {
              dataSourceId: 'comfortLevel',
              label: 'Comfort level',
            },
            {
              dataSourceId: 'occupancy',
              label: 'Occupancy',
            },
            {
              dataSourceId: 'humidity',
              label: 'Humidity',
            },
          ]),
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          status: text('status', 'Good'),
          comfortLevel: text('comfortLevel', 'Healthy'),
          occupancy: text('occupancy', 'None'),
          humidity: text('humidity', 'Unbearable'),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

WithFourDataPoints.storyName = 'with four data points';

export const Large5 = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Facility Conditions')}
        id="facilitycard"
        content={{
          attributes: object('content.attributes', [
            {
              label: 'Comfort Level',
              dataSourceId: 'comfortLevel',
              unit: '%',
            },
            {
              label: 'Average Temperature',
              dataSourceId: 'averageTemp',
              unit: '˚F',
              precision: 1,
            },
            { label: 'Utilization', dataSourceId: 'utilization', unit: '%' },
            { label: 'Humidity', dataSourceId: 'humidity', unit: '%' },
            { label: 'Air Flow', dataSourceId: 'air_flow' },
          ]),
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          comfortLevel: number('comfortLevel', 89),
          averageTemp: number('averageTemp', 76.7),
          utilization: number('utilization', 76),
          humidity: number('humidity', 50),
          air_flow: number('air_flow', 0.567),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

Large5.storyName = 'with five data points';

export const LargeThin6 = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGETHIN);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Facility Conditions')}
        id="facilitycard"
        content={{
          attributes: object('content.attributes', [
            {
              label: 'Comfort Level',
              dataSourceId: 'comfortLevel',
              unit: '%',
            },
            {
              label: 'Average Temperature',
              dataSourceId: 'averageTemp',
              unit: '˚F',
              precision: 1,
            },
            { label: 'Utilization', dataSourceId: 'utilization', unit: '%' },
            { label: 'CPU', dataSourceId: 'cpu', unit: '%' },
            { label: 'Humidity', dataSourceId: 'humidity', unit: '%' },
            { label: 'Location', dataSourceId: 'location' },
            { label: 'Air quality', dataSourceId: 'air_quality', unit: '%' },
          ]),
        }}
        breakpoint={breakpoint}
        size={size}
        values={{
          comfortLevel: number('comfortLevel', 89),
          averageTemp: number('averageTemp', 76.7),
          utilization: number('utilization', 76),
          humidity: number('humidity', 76),
          cpu: number('cpu', 76),
          location: text('location', 'Australia'),
          air_quality: number('air_quality', 76),
        }}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

LargeThin6.storyName = 'with six data points';

export const DataStateNoDataMediumScrollPage = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const myDataState = {
    type: select('dataState.type', Object.keys(CARD_DATA_STATE), CARD_DATA_STATE.NO_DATA),
    ...getDataStateProp(),
    learnMoreElement: (
      <button
        type="button"
        onClick={() => {
          console.info('Learning more is great');
        }}
      >
        Learn more
      </button>
    ),
    icon: boolean('use custom icon', false) ? (
      <Bee style={{ fill: 'orange' }}>
        <title>App supplied icon</title>
      </Bee>
    ) : undefined,
  };

  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Health score')}
        content={{
          attributes: [{ label: 'Monthly summary', dataSourceId: 'monthlySummary' }],
        }}
        dataState={myDataState}
        breakpoint={breakpoint}
        size={size}
        id="myStoryId"
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        onAttributeClick={action('onAttributeClick')}
      />

      <div style={{ height: '150vh' }} />
    </div>
  );
};

DataStateNoDataMediumScrollPage.storyName = 'with data state, custom icon';

export const Editable = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Really really really long card title?')}
        id="facilitycard"
        isEditable
        content={{
          attributes: [
            {
              label: 'Monthly summary',
              dataSourceId: 'monthlySummary',
              unit: text('unit', 'Wh'),
            },
            {
              label: 'Yearly summary',
              dataSourceId: 'yearlySummary',
              unit: text('unit', 'Wh'),
            },
          ],
        }}
        breakpoint={breakpoint}
        size={size}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
        values={{
          monthlySummary: number('Monthly summary value (values.monthlySummary)', 1045),
          yearlySummary: number('Yearly summary value (values.yearlySummary)', 100644),
        }}
      />
    </div>
  );
};

Editable.storyName = 'with isEditable';

export const DataFilters = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize(breakpoint, size).x}px`),
        margin: '5px',
      }}
    >
      <ValueCard
        title={text('title', 'Facility Conditions per device')}
        id="facilitycard"
        content={{
          attributes: object('content.attributes', [
            {
              label: 'Device 1 Comfort',
              dataSourceId: 'comfortLevel',
              unit: '%',
              dataFilter: { deviceid: '73000' },
            },
            {
              label: 'Device 2 Comfort',
              dataSourceId: 'comfortLevel',
              unit: '%',
              dataFilter: { deviceid: '73001' },
            },
          ]),
        }}
        breakpoint={breakpoint}
        size={size}
        values={object('values', [
          { deviceid: '73000', comfortLevel: '100', unit: '%' },
          { deviceid: '73001', comfortLevel: '50', unit: '%' },
        ])}
        isNumberValueCompact={boolean('isNumberValueCompact', false)}
        locale={select('locale', ['de', 'fr', 'en', 'ja'], 'en')}
        fontSize={number('fontSize', 42)}
        onAttributeClick={action('onAttributeClick')}
      />
    </div>
  );
};

DataFilters.storyName = 'with dataFilters';
