import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';
import update from 'immutability-helper';

import imageFile from '../../ImageCard/landscape.jpg';
import { CARD_SIZES, CARD_TYPES } from '../../../constants/LayoutConstants';
import { useHotspotEditorState } from '../hooks/hotspotStateHook';

import HotspotEditorDataSourceTab from './HotspotEditorDataSourceTab';
// import HotspotEditorDataSourceTabREADME from './HotspotEditorDataSourceTabREADME.mdx'; carbon 11

const commonActions = {
  onEditDataItem: (cardConfig, dataItem) =>
    dataItem.hasStreamingMetricEnabled
      ? [
          { id: 'none', text: 'None' },
          { id: 'last', text: 'Last' },
        ]
      : [],
  dataSeriesFormActions: {
    hasAggregationsDropDown: (editDataItem) =>
      editDataItem?.dataItemType !== 'DIMENSION' && editDataItem?.type !== 'TIMESTAMP',
    hasDataFilterDropdown: action('hasDataFilterDropdown'),
    onAddAggregations: action('onAddAggregations'),
  },
};

export default {
  title: '2 - Watson IoT Experimental/☢️ HotSpotEditorModal/HotspotEditorDataSourceTab',
  decorators: [withKnobs],
  parameters: {
    component: HotspotEditorDataSourceTab,
    // docs: {
    //   page: HotspotEditorDataSourceTabREADME,
    // }, carbon 11
  },
};

const dataItems = [
  {
    dataSourceId: 'temp_last',
    dataItemId: 'temp_last',
    label: '{high} temp',
    unit: '{unitVar}',
  },
  {
    dataSourceId: 'temperature',
    dataItemId: 'temperature',
    label: 'Temperature',
    unit: '°',
  },
  {
    dataSourceId: 'pressure',
    dataItemId: 'pressure',
    label: 'Pressure',
    unit: 'psi',
  },
  {
    dataSourceId: 'elevators',
    dataItemId: 'elevators',
    label: 'Elevators',
    unit: 'floor',
  },
  {
    dataSourceId: 'other_metric',
    dataItemId: 'other_metric',
    label: 'Other metric',
    unit: 'lbs',
  },
];
const cardConfig = {
  title: 'Floor Map',
  id: 'floor map picture',
  size: CARD_SIZES.MEDIUM,
  type: CARD_TYPES.IMAGE,
  content: {
    hotspots: [
      {
        x: 45,
        y: 25,
        color: '#0f0',
        content: {
          title: 'Stairs',
          attributes: [],
        },
      },
    ],
  },
};
const cardConfigWithPresets = {
  title: 'Floor Map',
  id: 'floor map picture',
  size: CARD_SIZES.MEDIUM,
  type: CARD_TYPES.IMAGE,
  content: {
    alt: 'Floor Map',
    image: 'firstfloor',
    src: imageFile,
    hotspots: [
      {
        title: 'elevators',
        label: 'Elevators',
        x: 35,
        y: 65,
        icon: 'arrowDown',
        content: {
          title: 'sensor readings',
          attributes: [
            {
              dataSourceId: 'temp_last',
              dataItemId: 'temp_last',
              label: '{high} temp',
              unit: '{unitVar}',
            },
            {
              dataSourceId: 'temperature',
              dataItemId: 'temperature',
              label: 'Temperature in Celsius',
              unit: '°',
            },
            {
              dataSourceId: 'pressure',
              dataItemId: 'pressure',
              label: 'Pressure',
              unit: 'psi',
            },
            {
              dataSourceId: 'elevators',
              dataItemId: 'elevators',
              label: 'Elevators',
              unit: 'floor',
            },
          ],
        },
      },
    ],
  },
  thresholds: [
    {
      dataSourceId: 'temp_last',
      comparison: '>=',
      color: '#da1e28',
      icon: 'Checkmark',
      value: 98,
    },
    {
      dataSourceId: 'pressure',
      comparison: '>=',
      color: 'red60',
      icon: 'Warning alt',
      value: 137,
    },
  ],
};

export const WithStateInStory = () => {
  const WithState = () => {
    const { selectedHotspot, updateHotspotDataSource } = useHotspotEditorState({
      initialState: {
        selectedHotspot: cardConfig.content.hotspots[0],
      },
    });

    return (
      <div>
        <HotspotEditorDataSourceTab
          hotspot={selectedHotspot}
          cardConfig={update(cardConfig, {
            content: {
              hotspots: { $set: [selectedHotspot] },
            },
          })}
          dataItems={dataItems}
          translateWithId={() => {}}
          onChange={(newData) => {
            updateHotspotDataSource(newData);
            action('onChange')(newData);
          }}
          actions={commonActions}
        />
      </div>
    );
  };

  return <WithState />;
};

WithStateInStory.storyName = 'Example with state in story';

export const WithPresetValues = () => {
  const WithState = () => {
    const { selectedHotspot, updateHotspotDataSource } = useHotspotEditorState({
      initialState: {
        selectedHotspot: cardConfigWithPresets.content.hotspots[0],
      },
    });

    return (
      <div>
        <HotspotEditorDataSourceTab
          hotspot={selectedHotspot}
          cardConfig={update(cardConfigWithPresets, {
            content: {
              hotspots: { $set: [selectedHotspot] },
            },
          })}
          dataItems={dataItems}
          translateWithId={() => {}}
          onChange={(newData) => {
            updateHotspotDataSource(newData);
            action('onChange')(newData);
          }}
          actions={commonActions}
        />
      </div>
    );
  };

  return <WithState />;
};

WithPresetValues.storyName = 'With preset values';
