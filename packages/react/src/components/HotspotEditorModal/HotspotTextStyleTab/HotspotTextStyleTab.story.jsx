import React, { useState } from 'react';
import { merge } from 'lodash-es';
import { action } from '@storybook/addon-actions';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import {
  purple70,
  cyan50,
  teal70,
  magenta70,
  red50,
  red90,
  green60,
  blue80,
  magenta50,
  purple50,
  teal50,
  cyan90,
} from '@carbon/colors';

import { hotspotTypes, useHotspotEditorState } from '../hooks/hotspotStateHook';

import HotspotTextStyleTab from './HotspotTextStyleTab';
import HotspotTextStyleTabREADME from './HotspotTextStyleTabREADME.mdx';

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

export default {
  title: '2 - Watson IoT Experimental/☢️ DashboardEditor/☢️ HotSpotEditorModal/HotspotTextStyleTab',
  decorators: [withKnobs],

  parameters: {
    component: HotspotTextStyleTab,
    docs: {
      page: HotspotTextStyleTabREADME,
    },
  },
};

const colors = [
  { carbonColor: purple70, name: 'purple70' },
  { carbonColor: cyan50, name: 'cyan50' },
  { carbonColor: teal70, name: 'teal70' },
  { carbonColor: magenta70, name: 'magenta70' },
  { carbonColor: red50, name: 'red50' },
  { carbonColor: red90, name: 'red90' },
  { carbonColor: green60, name: 'green60' },
  { carbonColor: blue80, name: 'blue80' },
  { carbonColor: magenta50, name: 'magenta50' },
  { carbonColor: purple50, name: 'purple50' },
  { carbonColor: teal50, name: 'teal50' },
  { carbonColor: cyan90, name: 'cyan90' },
];

export const Default = () => {
  const isLight = boolean('light', true);
  const WithState = () => {
    const [formValues, setFormValues] = useState({});

    return (
      <HotspotTextStyleTab
        minFontSize={1}
        maxFontSize={50}
        minOpacity={0}
        maxOpacity={100}
        minBorderWidth={0}
        maxBorderWidth={50}
        fontColors={colors}
        backgroundColors={colors}
        borderColors={colors}
        formValues={formValues}
        onChange={(change) => {
          setFormValues(merge({}, formValues, change));
          action('onChange')(change);
        }}
        onDelete={(change) => {
          action('onDelete')(change);
        }}
        translateWithId={() => {}}
        light={isLight}
        actions={commonActions}
      />
    );
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <WithState />
    </div>
  );
};

Default.storyName = 'Example with externaly managed state';

export const UsingHotspotStateHook = () => {
  const WithState = () => {
    const { selectedHotspot, deleteSelectedHotspot, updateTextHotspotStyle } =
      useHotspotEditorState({
        initialState: { selectedHotspot: { type: hotspotTypes.TEXT } },
      });

    return (
      <HotspotTextStyleTab
        minFontSize={1}
        maxFontSize={50}
        minOpacity={0}
        maxOpacity={100}
        minBorderWidth={0}
        maxBorderWidth={50}
        fontColors={colors}
        backgroundColors={colors}
        borderColors={colors}
        formValues={selectedHotspot}
        onChange={updateTextHotspotStyle}
        onDelete={deleteSelectedHotspot}
        translateWithId={() => {}}
        actions={commonActions}
      />
    );
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <WithState />
    </div>
  );
};

UsingHotspotStateHook.storyName = 'Using HotspotStateHook';
