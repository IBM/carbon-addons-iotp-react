import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { red50, green50, blue50 } from '@carbon/colors';
import { InformationSquareFilled, InformationFilled } from '@carbon/react/icons';

import { hotspotTypes, useHotspotEditorState } from '../hooks/hotspotStateHook';

import HotspotEditorTooltipTab from './HotspotEditorTooltipTab';
// import HotspotEditorTooltipTabREADME from './HotspotEditorTooltipTabREADME.mdx'; //carbon 11

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

const colors = [
  { carbonColor: red50, name: 'red' },
  { carbonColor: green50, name: 'green' },
  { carbonColor: blue50, name: 'blue' },
];

export default {
  title:
    '2 - Watson IoT Experimental/☢️ DashboardEditor/☢️ HotSpotEditorModal/HotspotEditorTooltipTab',
  decorators: [withKnobs],
  parameters: {
    component: HotspotEditorTooltipTab,
    // docs: {
    //   page: HotspotEditorTooltipTabREADME,
    // }, //carbon 11
  },
};

export const WithStateInStory = () => {
  const WithState = () => {
    const [formValues, setFormValues] = useState({});
    const handleOnChange = (change) => {
      setFormValues({
        ...formValues,
        ...change,
        content: { ...formValues.content, ...change.content },
      });
      action('onChange')(change);
    };
    return (
      <div>
        <HotspotEditorTooltipTab
          showInfoMessage={boolean('showInfoMessage', false)}
          hotspotIcons={selectableIcons}
          hotspotIconFillColors={colors}
          formValues={formValues}
          onChange={handleOnChange}
          onDelete={action('onDelete')}
          translateWithId={() => {}}
          actions={commonActions}
        />
      </div>
    );
  };

  return <WithState />;
};

WithStateInStory.storyName = 'Example with externaly managed state';

export const WithHotspotStateHook = () => {
  const WithStateHook = () => {
    const { selectedHotspot, deleteSelectedHotspot, updateHotspotTooltip } = useHotspotEditorState({
      initialState: {
        selectedHotspot: {
          type: hotspotTypes.FIXED,
          content: {},
        },
        currentType: hotspotTypes.FIXED,
      },
    });

    return (
      <div>
        <HotspotEditorTooltipTab
          showDeleteButton={!(selectedHotspot?.type === hotspotTypes.DYNAMIC)}
          showInfoMessage={!selectedHotspot}
          hotspotIcons={selectableIcons}
          hotspotIconFillColors={colors}
          formValues={selectedHotspot}
          onChange={updateHotspotTooltip}
          onDelete={deleteSelectedHotspot}
          translateWithId={() => {}}
          actions={commonActions}
        />
      </div>
    );
  };

  return <WithStateHook />;
};

WithHotspotStateHook.storyName = 'Example using the HotspotStateHook';

export const WithPresetValuesAndCustomColors = () => {
  return (
    <div>
      <HotspotEditorTooltipTab
        showInfoMessage={boolean('showInfoMessage', false)}
        hotspotIconFillColors={colors}
        hotspotIcons={selectableIcons}
        formValues={{
          content: {
            title: 'West building',
            description: 'This is the largest building there is',
          },
          icon: selectableIcons[0],
          color: colors[1],
        }}
        onChange={action('onChange')}
        onDelete={action('onDelete')}
        translateWithId={() => {}}
        actions={commonActions}
      />
    </div>
  );
};

export const WithInfoMessage = () => {
  return (
    <div>
      <HotspotEditorTooltipTab
        showInfoMessage={boolean('showInfoMessage', true)}
        hotspotIcons={selectableIcons}
        hotspotIconFillColors={colors}
        formValues={{}}
        onChange={action('onChange')}
        onDelete={action('onDelete')}
        translateWithId={() => {}}
        actions={commonActions}
      />
    </div>
  );
};
