import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, object } from '@storybook/addon-knobs';
import { EscalatorDown } from '@carbon/pictograms-react';
import { Basketball, Code } from '@carbon/react/icons';
import { TextInput, Select, SelectItem } from '@carbon/react';

import munichBuilding from '../ImageCard/MunichBuilding.png';
import {
  CARD_TYPES,
  CARD_SIZES,
  DASHBOARD_EDITOR_CARD_TYPES,
} from '../../constants/LayoutConstants';
import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';

import CardEditor from './CardEditor';

export const Experimental = () => <StoryNotice componentName="CardEditor" experimental />;
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
    hasDataFilterDropdown: action('hasDataFilterDropdown'),
    onAddAggregations: action('onAddAggregations'),
  },
};

const CardEditorInteractive = () => {
  const defaultCard = {
    title: 'New card',
    size: CARD_SIZES.SMALL,
    type: 'VALUE',
  };

  const [counter, setCounter] = useState(1);
  const [data, setData] = useState({ ...defaultCard, id: `card-${counter}` });

  return (
    <div>
      <div style={{ position: 'absolute' }}>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          height: 'calc(100vh - 6rem)',
        }}
      >
        <CardEditor
          cardConfig={data}
          onShowGallery={() => setData(null)}
          onAddCard={(type) => {
            setData({ ...defaultCard, id: `card-${counter + 1}`, type });
            setCounter(counter + 1);
          }}
          onChange={(newCardConfig) => setData(newCardConfig)}
        />
      </div>
    </div>
  );
};

export default {
  title: '2 - Watson IoT Experimental/☢️ DashboardEditor/☢️ CardEditor',
  decorators: [withKnobs],

  parameters: {
    component: CardEditor,
  },
};

export const Default = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        content: {
          attributes: [
            {
              dataSourceId: 'discharge_flow_rate',
              label: 'Discharge flow',
              precision: 3,
            },
            {
              dataSourceId: 'discharge_perc',
              label: 'Max Discharge %',
              precision: 3,
            },
          ],
        },
        dataSource: {
          attributes: [
            {
              aggregator: 'mean',
              attribute: 'discharge_flow_rate',
              id: 'discharge_flow_rate',
            },
            {
              aggregator: 'max',
              attribute: 'discharge_perc',
              id: 'discharge_perc',
            },
          ],
        },
        id: 'calculated',
        size: 'MEDIUMTHIN',
        title: 'Calculated',
        type: 'VALUE',
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      onAddCard={action('onAddCard')}
    />
  </div>
);

Default.storyName = 'default';

export const ForTimeSeries = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        id: 'timeseries',
        title: 'time-series-card',
        size: 'MEDIUMWIDE',
        type: 'TIMESERIES',
        content: {
          series: [
            {
              dataSourceId: 'torque max',
              label: 'Torque Max',
              color: '#6929c4',
            },
            {
              dataSourceId: 'torque mean',
              label: 'Torque Mean',
              color: '#1192e8',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature',
          unit: '˚F',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
        },
        interval: 'day',
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      actions={commonActions}
      dataItems={[
        { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
        { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
        { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
        { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
        { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
      ]}
      onAddCard={action('onAddCard')}
    />
  </div>
);

ForTimeSeries.storyName = 'for TimeSeries';

export const WithNoCardDefinedGalleryView = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      onAddCard={action('onAddCard')}
    />
  </div>
);

export const WithNoCardDefinedGalleryViewAndCustomCards = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      i18n={{
        TIMESERIES: 'ITEM 1',
        SIMPLE_BAR: 'ITEM 2',
        GROUPED_BAR: 'ITEM 3',
        STACKED_BAR: 'ITEM 4',
        VALUE: 'ITEM 5',
        IMAGE: 'ITEM 6',
        TABLE: 'ITEM 7',
        ALERT: 'ITEM 8',
        LIST: 'ITEM 9',
        CUSTOM: 'ITEM 10',
        COOL_NEW_CARD: 'Missing Icon',
      }}
      supportedCardTypes={[
        'VALUE',
        DASHBOARD_EDITOR_CARD_TYPES.TIMESERIES,
        DASHBOARD_EDITOR_CARD_TYPES.LIST,
        DASHBOARD_EDITOR_CARD_TYPES.ALERT,
        'CUSTOM',
        'COOL_NEW_CARD',
      ]}
      icons={{
        VALUE: <EscalatorDown />,
        CUSTOM: <Code size={24} />,
        ALERT: <Basketball size={32} />,
      }}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      onAddCard={action('onAddCard')}
    />
  </div>
);

WithNoCardDefinedGalleryView.storyName = 'with no card defined (gallery view)';

export const Interactive = () => <CardEditorInteractive />;

Interactive.storyName = 'interactive';

export const ForImage = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        id: 'image',
        title: 'image-card',
        size: 'MEDIUMWIDE',
        type: 'IMAGE',
        content: {
          id: 'munich_image',
          src: munichBuilding,
          alt: 'Munich',
        },
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      dataItems={[
        { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
        { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
        { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
        { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
        { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
      ]}
      onAddCard={action('onAddCard')}
      actions={commonActions}
    />
  </div>
);

ForImage.storyName = 'for Image';

export const WithTooltipLink = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        content: {
          attributes: [
            {
              dataSourceId: 'discharge_flow_rate',
              label: 'Discharge flow',
              precision: 3,
            },
            {
              dataSourceId: 'discharge_perc',
              label: 'Max Discharge %',
              precision: 3,
            },
          ],
        },
        dataSource: {
          attributes: [
            {
              aggregator: 'mean',
              attribute: 'discharge_flow_rate',
              id: 'discharge_flow_rate',
            },
            {
              aggregator: 'max',
              attribute: 'discharge_perc',
              id: 'discharge_perc',
            },
          ],
        },
        id: 'calculated',
        size: 'MEDIUMTHIN',
        title: 'Calculated',
        type: 'VALUE',
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      onAddCard={action('onAddCard')}
      dataSeriesItemLinks={{ value: 'www.ibm.com' }}
      actions={commonActions}
      dataItems={[
        {
          dataItemId: 'discharge_flow_rate',
          dataSourceId: 'discharge_flow_rate',
          label: 'discharge_flow_rate',
        },
      ]}
    />
  </div>
);

Default.storyName = 'default';

const renderCustomEditContent = (onChange, cardConfig) => {
  return [
    {
      header: { title: 'customTitle', tooltip: { tooltipText: 'Custom Tooltip' } },
      content: (
        <TextInput
          id="custom-content-textinput"
          value={cardConfig.title}
          labelText="Title"
          onChange={(event) => onChange({ ...cardConfig, title: event.currentTarget.value })}
          actions={commonActions}
        />
      ),
    },
  ];
};

export const TimeSeriesCardWithCustom = () => {
  return (
    <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
      <CardEditor
        cardConfig={{
          renderEditContent: renderCustomEditContent,
          type: CARD_TYPES.TIMESERIES,
          content: {
            attributes: [
              {
                dataSourceId: 'discharge_flow_rate',
                label: 'Discharge flow',
                precision: 3,
              },
              {
                dataSourceId: 'discharge_perc',
                label: 'Max Discharge %',
                precision: 3,
              },
            ],
          },
          dataSource: {
            attributes: [
              {
                aggregator: 'mean',
                attribute: 'discharge_flow_rate',
                id: 'discharge_flow_rate',
              },
              {
                aggregator: 'max',
                attribute: 'discharge_perc',
                id: 'discharge_perc',
              },
            ],
          },
          id: 'calculated',
          size: 'MEDIUMTHIN',
          title: 'Calculated',
        }}
        dataItems={[
          { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
          { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
          { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
          { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
          { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
        ]}
        errors={{}}
        onShowGallery={action('onShowGallery')}
        onChange={action('onChange')}
        onAddCard={action('onAddCard')}
        dataSeriesItemLinks={{ value: 'www.ibm.com' }}
        actions={commonActions}
      />
    </div>
  );
};

TimeSeriesCardWithCustom.storyName = 'custom edit content for time series card';

// returns custom selector
const renderCustomDataTypeSelector = (onChange, card, dataTypes, selectedDataType) => {
  return [
    {
      content: (
        <Select
          labelText="Data source"
          onChange={(event) => {
            const updatedCard = { ...card, dataType: event.currentTarget.value };
            action('onChange')(updatedCard);
            onChange(updatedCard);
          }}
          id="select-1"
          defaultValue={selectedDataType}
          actions={commonActions}
        >
          {dataTypes.map((dataType) => (
            <SelectItem key={dataType} value={dataType} text={dataType} />
          ))}
        </Select>
      ),
    },
  ];
};

const dataTypes = ['DataType1', 'DataType2'];
export const TableCardWithCustom = () => {
  const StatefulTableEditor = () => {
    const [localCardState, setLocalCardState] = useState({
      renderEditContent: (onChange, cardConfig) =>
        renderCustomDataTypeSelector(onChange, cardConfig, dataTypes, dataTypes[1]),
      title: 'Table card with custom edit content',
      id: `table card`,
      size: CARD_SIZES.LARGEWIDE,
      type: CARD_TYPES.TABLE,
      content: {
        columns: [
          { dataSourceId: 'timestamp', label: 'Timestamp', type: 'TIMESTAMP' },
          { dataSourceId: 'Campus_EGL', label: 'Campus' },
          {
            dataSourceId: 'peopleCount_EnterpriseBuilding_mean',
            label: 'People',
          },
          {
            dataSourceId: 'headCount_EnterpriseBuilding_mean',
            label: 'Headcount',
          },
          {
            dataSourceId: 'capacity_EnterpriseBuilding_mean',
            label: 'capacity',
          },
        ],
      },
    });
    return (
      <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
        <CardEditor
          cardConfig={localCardState}
          dataItems={[
            { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
            { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
            { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
            { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
            { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
          ]}
          errors={{}}
          onShowGallery={action('onShowGallery')}
          onChange={(card) => setLocalCardState(card)}
          onAddCard={action('onAddCard')}
          dataSeriesItemLinks={{ value: 'www.ibm.com' }}
          getValidDataItems={action('getValidDataItems')}
          getValidDimensions={(cardConfig) => {
            action('getValidDimensions')(cardConfig);
            return { dimension1: ['value1', 'value2'], dimension2: ['value3', 'value4'] };
          }}
          actions={commonActions}
        />
      </div>
    );
  };
  return <StatefulTableEditor />;
};

TableCardWithCustom.storyName = 'custom edit content for table card';

export const DynamicallyAddSpecialContentToCardEditForm = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={{
        title: 'Table card with dynamic custom edit content',
        id: `table card`,
        size: CARD_SIZES.LARGEWIDE,
        type: CARD_TYPES.TABLE,
        content: {
          columns: [
            { dataSourceId: 'timestamp', label: 'Timestamp', type: 'TIMESTAMP' },
            { dataSourceId: 'Campus_EGL', label: 'Campus' },
            {
              dataSourceId: 'peopleCount_EnterpriseBuilding_mean',
              label: 'People',
            },
            {
              dataSourceId: 'headCount_EnterpriseBuilding_mean',
              label: 'Headcount',
            },
            {
              dataSourceId: 'capacity_EnterpriseBuilding_mean',
              label: 'capacity',
            },
          ],
        },
      }}
      // dynamically adds the custom edit content at render time
      onRenderCardEditForm={(cardConfig) => ({
        ...cardConfig,
        renderEditContent: (onChange, cardConfig) =>
          renderCustomDataTypeSelector(onChange, cardConfig, dataTypes, dataTypes[1]),
      })}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      onAddCard={action('onAddCard')}
      actions={commonActions}
    />
  </div>
);

DynamicallyAddSpecialContentToCardEditForm.storyName = 'Dynamically add edit form content';

export const ForV2TimeSeries = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        id: 'timeseries',
        title: 'time-series-card',
        size: 'MEDIUMWIDE',
        type: 'TIMESERIES',
        content: {
          series: [
            {
              dataSourceId: 'v2pressure',
              label: 'V2 Pressure',
              color: '#1192e8',
              aggregationMethod: 'none',
              aggregationMethods: [],
              hasStreamingMetricEnabled: true,
            },
          ],
          dataSource: {
            attributes: [
              {
                aggregationMethod: 'max',
                attribute: 'v2pressure',
                id: 'v2pressure',
              },
            ],
          },
          xLabel: 'Time',
          yLabel: 'Temperature',
          unit: '˚F',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
        },
        interval: 'day',
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      dataItems={[
        { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
        { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
        { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
        { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
        { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
        {
          dataItemId: 'v2pressure',
          dataSourceId: 'v2pressure',
          label: 'V2 Pressure',
          aggregationMethod: 'min',
          aggregationMethods: [
            { id: 'none', text: 'None' },
            { id: 'max', text: 'Maximum' },
            { id: 'min', text: 'Minimum' },
            { id: 'mean', text: 'Mean' },
            { id: 'last', text: 'Last' },
            { id: 'sum', text: 'Sum' },
            { id: 'standerd', text: 'Standerd deviation' },
          ],
        },
      ]}
      onAddCard={action('onAddCard')}
      actions={commonActions}
    />
  </div>
);

ForV2TimeSeries.storyName = 'for V2 TimeSeries';

ForV2TimeSeries.storyName = 'for V2 TimeSeries';

export const ForBarChart = () => (
  <div style={{ position: 'absolute', right: 0, height: 'calc(100vh - 6rem)' }}>
    <CardEditor
      cardConfig={object('cardConfig', {
        id: 'bar-chart',
        title: 'bar-chart-card',
        size: 'MEDIUMWIDE',
        type: 'BAR',
        content: {
          series: [
            {
              dataSourceId: 'torque max',
              label: 'Torque Max',
              color: '#6929c4',
            },
            {
              dataSourceId: 'torque mean',
              label: 'Torque Mean',
              color: '#1192e8',
            },
          ],
          layout: 'VERTICAL',
          xLabel: 'Time',
          yLabel: 'Temperature',
          timeDataSourceId: 'timestamp',
        },
        interval: 'day',
      })}
      errors={{}}
      onShowGallery={action('onShowGallery')}
      onChange={action('onChange')}
      actions={commonActions}
      dataItems={[
        { dataItemId: 'torque', dataSourceId: 'torque_max', label: 'Torque Max' },
        { dataItemId: 'torque', dataSourceId: 'torque_min', label: 'Torque Min' },
        { dataItemId: 'torque', dataSourceId: 'torque_mean', label: 'Torque Mean' },
        { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
        { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
      ]}
      onAddCard={action('onAddCard')}
    />
  </div>
);

ForBarChart.storyName = 'for BarChart';
