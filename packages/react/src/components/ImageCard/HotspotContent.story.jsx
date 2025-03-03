import React from 'react';
import { text, object, select } from '@storybook/addon-knobs';
import { Tooltip } from '@carbon/react';
import { Warning, Information } from '@carbon/react/icons';
import { red60 } from '@carbon/colors';

import HotspotContent from './HotspotContent';

const getMockValues = () => object('values', { temperature: 35.35, humidity: 99 });

export default {
  title: '1 - Watson IoT/Card/ImageCard/HotspotContent',

  parameters: {
    component: HotspotContent,

    info: 'This Hotspot content is recommended to be used with a Carbon tooltip',
  },
};

export const Basic = () => {
  return (
    <Tooltip
      defaultOpen
      label={
        <HotspotContent
          title={text('title', 'Hotspot title')}
          description={text('description', 'description')}
          values={getMockValues()}
          attributes={object('attributes', [
            { dataSourceId: 'temperature', label: 'Temperature' },
            { dataSourceId: 'humidity', label: 'Humidity' },
          ])}
        />
      }
      align="right"
    >
      <Information />
    </Tooltip>
  );
};

Basic.storyName = 'basic';

export const BasicWithUnitsAndPrecision = () => {
  return (
    <Tooltip
      defaultOpen
      label={
        <HotspotContent
          title={text('title', 'Hotspot title')}
          description={text('description', 'description')}
          values={getMockValues()}
          attributes={object('attributes', [
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
              precision: 3,
              unit: 'C',
            },
            {
              dataSourceId: 'humidity',
              label: 'Humidity',
              precision: 0,
              unit: '%',
            },
          ])}
        />
      }
      align="right"
    >
      <Information />
    </Tooltip>
  );
};

BasicWithUnitsAndPrecision.storyName = 'basic with units and precision';

export const WithThresholds = () => {
  return (
    <Tooltip
      defaultOpen
      label={
        <HotspotContent
          title={text('title', 'Hotspot title')}
          description={text('description', 'description')}
          values={getMockValues()}
          attributes={object('attributes', [
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
              precision: 3,
              unit: 'C',
              thresholds: [{ comparison: '>', value: 30, icon: 'Warning', color: red60 }],
            },
            {
              dataSourceId: 'humidity',
              label: 'Humidity',
              precision: 0,
              unit: '%',
            },
          ])}
          hotspotThreshold={object('hotspotThreshold', {
            dataSourceId: 'humidity',
            comparison: '<',
            value: 100,
            icon: 'Warning',
            color: red60,
          })}
          renderIconByName={(icon, props) =>
            icon === 'Warning' ? (
              <Warning {...props}>
                <title>{props.title}</title>
              </Warning>
            ) : null
          }
        />
      }
      align="right"
    >
      <Information />
    </Tooltip>
  );
};

WithThresholds.storyName = 'with thresholds';

WithThresholds.parameters = {
  knobs: {
    escapeHTML: false, // needed for greater than less than
  },
};

export const Locale = () => {
  return (
    <Tooltip
      defaultOpen
      label={
        <HotspotContent
          title={text('title', 'Hotspot title')}
          description={text('description', 'description')}
          values={getMockValues()}
          attributes={object('attributes', [
            {
              dataSourceId: 'temperature',
              label: 'Temperature',
              precision: 3,
              unit: 'C',
              thresholds: [
                {
                  comparison: '>',
                  value: 30.5,
                  icon: 'Warning',
                  color: red60,
                },
              ],
            },
            {
              dataSourceId: 'humidity',
              label: 'Humidity',
              precision: 0,
              unit: '%',
            },
          ])}
          locale={select('locale', ['fr', 'en'], 'fr')}
          hotspotThreshold={object('hotspotThreshold', {
            dataSourceId: 'humidity',
            comparison: '<',
            value: 100.0,
            icon: 'Warning',
            color: red60,
          })}
          renderIconByName={(icon, props) =>
            icon === 'Warning' ? (
              <Warning {...props}>
                <title>{props.title}</title>
              </Warning>
            ) : null
          }
        />
      }
      align="right"
    >
      <Information />
    </Tooltip>
  );
};

Locale.storyName = 'locale';

Locale.parameters = {
  knobs: {
    escapeHTML: false, // needed for greater than less than
  },
};
