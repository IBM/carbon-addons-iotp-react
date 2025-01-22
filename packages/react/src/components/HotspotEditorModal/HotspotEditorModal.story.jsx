import React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, select, withKnobs } from '@storybook/addon-knobs';
import { gray50, red50, green50, blue50 } from '@carbon/colors';
import { InformationSquareFilled, InformationFilled } from '@carbon/react/icons';

import { CARD_SIZES, CARD_TYPES } from '../../constants/LayoutConstants';
import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';

import landscape from './landscape.jpg';
import HotspotEditorModal from './HotspotEditorModal';
// import HotspotEditorModalREADME from './HotspotEditorModalREADME.mdx'; //carbon 11

export const Experimental = () => <StoryNotice componentName="ColorDropdown" experimental />;
Experimental.storyName = experimentalStoryTitle;
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
    onAddAggregations: action('onAddAggregations'),
  },
};

const selectableIcons = [
  {
    id: 'InformationSquareFilled24',
    icon: InformationSquareFilled,
    text: 'Information square filled',
  },
  {
    id: 'InformationFilled24',
    icon: InformationFilled,
    text: 'Information filled',
  },
];

const selectableColors = [
  { carbonColor: gray50, name: 'gray' },
  { carbonColor: red50, name: 'red' },
  { carbonColor: green50, name: 'green' },
  { carbonColor: blue50, name: 'blue' },
];

const cardConfig = {
  content: {
    alt: 'Floor Map',
    image: 'firstfloor',
    src: landscape,
  },
  id: 'floor map picture',
  size: CARD_SIZES.MEDIUM,
  title: 'Floor Map',
  type: CARD_TYPES.IMAGE,
  values: {
    hotspots: [],
  },
};

const dataItems = [
  {
    dataItemId: 'temp_last',
    dataSourceId: 'temp_last',
    label: '{high} temp',
    unit: '{unitVar}',
  },
  {
    dataItemId: 'temperature',
    dataSourceId: 'temperature',
    label: 'Temperature',
    unit: '°',
  },
  {
    dataItemId: 'pressure',
    dataSourceId: 'pressure',
    label: 'Pressure',
    unit: 'psi',
  },
];

const getDemoHotspots = (reqObj) => {
  action('onFetchDynamicDemoHotspots')(reqObj);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            x: 10,
            y: 30,
          },
          {
            x: 90,
            y: 60,
          },
        ]),
      1000
    )
  );
};

export default {
  title: '2 - Watson IoT Experimental/☢️ DashboardEditor/☢️ HotSpotEditorModal',
  decorators: [withKnobs],
  parameters: {
    component: HotspotEditorModal,
    // docs: {
    //   inlineStories: false,
    //   page: HotspotEditorModalREADME,
    // },
  },
};

export const Empty = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <HotspotEditorModal
      key={myDisplayOption}
      backgroundColors={selectableColors}
      borderColors={selectableColors}
      cardConfig={cardConfig}
      dataItems={dataItems}
      defaultHotspotType="fixed"
      fontColors={selectableColors}
      hotspotIconFillColors={selectableColors}
      hotspotIcons={selectableIcons}
      label={landscape}
      onClose={action('onClose')}
      onFetchDynamicDemoHotspots={getDemoHotspots}
      onSave={action('onSave')}
      displayOption={myDisplayOption}
      actions={commonActions}
    />
  );
};

export const EmptyWithGetValidDataItemsCallback = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <HotspotEditorModal
      key={myDisplayOption}
      backgroundColors={selectableColors}
      borderColors={selectableColors}
      cardConfig={cardConfig}
      dataItems={dataItems}
      getValidDataItems={(cardConf) => {
        action('getValidDataItems')(cardConf);
        return dataItems;
      }}
      defaultHotspotType="fixed"
      fontColors={selectableColors}
      hotspotIconFillColors={selectableColors}
      hotspotIcons={selectableIcons}
      label={landscape}
      onClose={action('onClose')}
      onFetchDynamicDemoHotspots={getDemoHotspots}
      onSave={action('onSave')}
      displayOption={myDisplayOption}
      actions={commonActions}
    />
  );
};
EmptyWithGetValidDataItemsCallback.storyName = 'Empty with getValidDataItems callback';

export const WithExistingHotspots = () => {
  const myCardConfig = {
    ...cardConfig,
    values: {
      ...cardConfig.values,
      hotspots: [
        {
          x: 45,
          y: 25,
          color: green50,
          content: <span style={{ padding: '1rem' }}>content is an element</span>,
        },
        {
          x: 65,
          y: 75,
          type: 'text',
          color: green50,
          content: <span>content is an element</span>,
        },
        {
          x: 0,
          y: 0,
          content: <span>0:0</span>,
          color: 'green',
          width: 20,
          height: 20,
        },
        {
          x: 0,
          y: 99.9,
          content: <span>0:99</span>,
          color: 'green',
          width: 20,
          height: 20,
        },
        {
          x: 99.9,
          y: 99.9,
          content: <span>99:99</span>,
          color: 'green',
          width: 20,
          height: 20,
        },
        {
          x: 99.9,
          y: 0,
          content: <span>99:0</span>,
          color: 'green',
          width: 20,
          height: 20,
        },
        {
          x: 75,
          y: 10,
          type: 'text',
          content: { title: 'Storage' },
          backgroundColor: gray50,
          backgroundOpacity: 50,
          fontSize: 12,
          fontColor: gray50,
          borderColor: gray50,
          borderWidth: 1,
        },
        {
          x: 35,
          y: 65,
          icon: 'InformationFilled24',
          color: green50,
          content: {
            title: 'My Device',
            description: 'Description',
            values: {
              deviceid: '73000',
              temperature: 35.05,
            },
            attributes: [
              {
                dataSourceId: 'temperature',
                label: 'Custom label temp',
                unit: '°',
                thresholds: [
                  {
                    comparison: '>',
                    value: 30.5,
                    icon: 'Warning',
                    color: '#da1e28',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  };

  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <HotspotEditorModal
      key={myDisplayOption}
      availableDimensions={{
        manufacturer: ['Rentech', 'GHI Industries'],
        deviceid: ['73000', '73001', '73002'],
      }}
      backgroundColors={selectableColors}
      borderColors={selectableColors}
      cardConfig={myCardConfig}
      dataItems={dataItems}
      defaultHotspotType="fixed"
      fontColors={selectableColors}
      hotspotIconFillColors={selectableColors}
      hotspotIcons={selectableIcons}
      label={landscape}
      onClose={action('onClose')}
      onFetchDynamicDemoHotspots={getDemoHotspots}
      onSave={action('onSave')}
      displayOption={myDisplayOption}
      actions={commonActions}
    />
  );
};

export const WithExistingDynamicHotspots = () => {
  const myCardConfig = {
    ...cardConfig,
    values: {
      ...cardConfig.values,
      hotspots: [
        {
          x: 'temp_last',
          y: 'temperature',
          type: 'dynamic',
          content: { title: 'dynamic hotspot title' },
          icon: 'InformationFilled24',
          color: red50,
        },
      ],
    },
  };

  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <HotspotEditorModal
      key={myDisplayOption}
      backgroundColors={selectableColors}
      borderColors={selectableColors}
      cardConfig={myCardConfig}
      dataItems={dataItems}
      defaultHotspotType="fixed"
      fontColors={selectableColors}
      hotspotIconFillColors={selectableColors}
      hotspotIcons={selectableIcons}
      maxHotspots={2}
      label={landscape}
      onClose={action('onClose')}
      onFetchDynamicDemoHotspots={getDemoHotspots}
      onSave={action('onSave')}
      showTooManyHotspotsInfo={boolean('showTooManyHotspotsInfo', true)}
      displayOption={myDisplayOption}
      actions={commonActions}
    />
  );
};
