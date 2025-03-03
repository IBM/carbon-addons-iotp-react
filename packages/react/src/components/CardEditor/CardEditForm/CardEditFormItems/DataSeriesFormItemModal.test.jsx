import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { omit } from 'lodash-es';
import userEvent from '@testing-library/user-event';

import { settings } from '../../../../constants/Settings';
import { CARD_TYPES } from '../../../../constants/LayoutConstants';

import DataSeriesFormItemModal from './DataSeriesFormItemModal';

const { iotPrefix, prefix } = settings;

describe('DataSeriesFormItemModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnChange = jest.fn();
  const mockSetShowEditor = jest.fn();
  const mockSetEditDataItem = jest.fn();
  const mockSetEditDataSeries = jest.fn();

  const groupedBarConfig = {
    title: 'Untitled',
    size: 'MEDIUM',
    type: 'BAR',
    content: {
      type: 'GROUPED',
      layout: 'VERTICAL',
      series: [
        {
          dataSourceId: 'temperature',
          label: 'temperature',
          color: '#6929c4',
        },
      ],
      categoryDataSourceId: 'firmware',
    },
    dataSource: {
      groupBy: ['firmware'],
    },
  };

  const timeSeriesCardConfig = {
    id: 'Timeseries',
    title: 'Untitled',
    size: 'MEDIUMWIDE',
    type: 'TIMESERIES',
    content: {
      series: [
        {
          label: 'Temperature',
          dataSourceId: 'temperature',
          color: '#6929c4',
        },
        {
          label: 'Pressure',
          dataSourceId: 'pressure',
        },
      ],
      xLabel: 'Time',
      yLabel: 'Temperature (˚F)',
      includeZeroOnXaxis: true,
      includeZeroOnYaxis: true,
      timeDataSourceId: 'timestamp',
    },
    interval: 'day',
  };

  const valueCardConfig = {
    id: 'Standard',
    title: 'value card',
    type: 'VALUE',
    size: 'MEDIUM',
    content: {
      attributes: [
        {
          dataSourceId: 'key1',
          unit: '%',
          precision: 3,
          label: 'Key 1',
        },
        {
          dataSourceId: 'key2',
          unit: 'lb',
          label: 'Key 2',
          precision: 3,
        },
      ],
    },
  };

  const editGroupedBarDataItem = {
    dataSourceId: 'temperature',
    label: 'temperature',
    color: '#6929c4',
  };

  const editTimeseriesDataItem = {
    label: 'Temperature',
    dataSourceId: 'temperature',
    color: 'red',
    aggregationMethods: [
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  };

  const editTimeseriesDataItemAggregated = {
    label: 'Temperature Max',
    dataSourceId: 'temperature_max',
    color: 'red',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
    aggregationMethod: 'max',
    grain: 'hourly',
  };

  const editDataSeriesTimeSeries = [
    {
      label: 'Temperature',
      dataSourceId: 'temperature',
      color: 'red',
    },
  ];

  const editValueDataItem = {
    dataSourceId: 'key1',
    unit: '%',
    precision: 3,
    label: 'Key 1',
  };

  const availableDimensions = {
    deviceid: ['73000', '73001', '73002'],
    manufacturer: ['Rentech', 'GHI Industries'],
  };

  const editTimeseriesDataItemAggregationMethodsV2 = {
    label: 'Temperature',
    dataSourceId: 'temperature',
    dataItemType: 'METRIC',
    color: 'red',
    aggregationMethods: [
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  };

  const commonProps = {
    onChange: mockOnChange,
    setShowEditor: mockSetShowEditor,
    setEditDataItem: mockSetEditDataItem,
    setEditDataSeries: mockSetEditDataSeries,
    availableDimensions,
    // TODO: May be we can use dashboardEditorActions from the mock data.
    actions: {
      onEditDataItem: jest.fn().mockImplementation(() => []),
      dataSeriesFormActions: {
        hasAggregationsDropDown: jest.fn(() => true),
        hasGrainsDropDown: jest.fn(() => true),
        hasDataFilterDropdown: jest.fn(() => true),
      },
    },
    options: {
      hasColorDropdown: true,
      hasUnit: true,
      hasDecimalPlacesDropdown: true,
      hasThresholds: true,
      hasTooltip: true,
    },
  };

  it('Renders for timeseries card data', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const label = screen.getByText('Custom label');
    const legendColorLabel = screen.getByText('Line color');
    expect(label).toBeInTheDocument();
    expect(legendColorLabel).toBeInTheDocument();

    const tooltip = screen.getByText('Tooltip');
    expect(tooltip).toBeInTheDocument();

    const dataFilter = screen.getByRole('listbox', { name: 'Data filter' });
    expect(dataFilter).toBeInTheDocument();

    const aggregationDropdown = screen.getByRole('listbox', { name: 'Aggregation method' });
    expect(aggregationDropdown).toBeInTheDocument();
  });

  it('Renders card data with out any options', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
        options={undefined}
      />
    );

    const label = screen.queryByText('Custom label');
    expect(label).toBeInTheDocument();

    const unit = screen.queryByText('Unit');
    expect(unit).not.toBeInTheDocument();

    const tooltip = screen.queryByText('Tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('Renders for timeseries card data without datafilter', () => {
    render(
      <DataSeriesFormItemModal
        {...{
          ...commonProps,
          actions: {
            ...commonProps.actions,
            dataSeriesFormActions: {
              ...commonProps.actions.dataSeriesFormActions,
              hasDataFilterDropdown: jest.fn(() => false),
            },
          },
        }}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const dataFilter = screen.queryByText('Data filter');
    expect(dataFilter).not.toBeInTheDocument();
  });
  it('Renders for timeseries card data without aggregation dropdown', () => {
    render(
      <DataSeriesFormItemModal
        {...{
          ...commonProps,
          actions: {
            ...commonProps.actions,
            dataSeriesFormActions: {
              ...commonProps.actions.dataSeriesFormActions,
              hasAggregationsDropDown: jest.fn(() => false),
            },
          },
        }}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const dataFilter = screen.queryByText('Aggregation method');
    expect(dataFilter).not.toBeInTheDocument();
  });
  it('Non-timebased simple bar should hide grain', () => {
    const simpleNonTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'SIMPLE',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        categoryDataSourceId: 'deviceid',
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={simpleNonTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );
    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Timebased simple bar should show grain', () => {
    const simpleTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'SIMPLE',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        timeDataSourceId: 'timestamp',
      },
      dataSource: {},
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={simpleTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );
    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Non-timebased stacked bar should hide grain', () => {
    const stackedNonTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'STACKED',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        categoryDataSourceId: 'deviceid',
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedNonTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('timebased stacked bar should show grain', () => {
    const stackedTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'STACKED',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        timeDataSourceId: 'timestamp',
      },
      dataSource: {},
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Non-timebased table card should hide grain', () => {
    const stackedNonTimeBasedTableCard = {
      title: 'table without timestamp',
      size: 'LARGE',
      type: 'TABLE',
      content: {
        columns: [
          {
            dataItemId: 'deviceid',
            dataSourceId: 'deviceid',
            label: 'deviceid',
            dataItemType: 'DIMENSION',
            destination: 'groupBy',
          },
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_308e4cf2-7da1-4dd1-be90-d99db81da6f5',
            label: 'Torque',
          },
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature_b7853ab7-49ab-4337-9682-4be94b31fd06',
            label: 'Temperature',
          },
        ],
        allowNavigation: true,
        showHeader: true,
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedNonTimeBasedTableCard}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('timebased table card should show grain', () => {
    const stackedTimeBasedTableCard = {
      title: 'table without timestamp',
      size: 'LARGE',
      type: 'TABLE',
      content: {
        columns: [
          {
            dataSourceId: 'timestamp',
            dataItemId: 'timestamp',
            label: 'Timestamp',
            type: 'TIMESTAMP',
            sort: 'DESC',
          },
          {
            dataItemId: 'deviceid',
            dataSourceId: 'deviceid',
            label: 'deviceid',
            dataItemType: 'DIMENSION',
            destination: 'groupBy',
          },
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_308e4cf2-7da1-4dd1-be90-d99db81da6f5',
            label: 'Torque',
            aggregationMethod: 'max',
          },
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature_b7853ab7-49ab-4337-9682-4be94b31fd06',
            label: 'Temperature',
          },
        ],
        allowNavigation: true,
        showHeader: true,
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedTimeBasedTableCard}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Renders for value card data', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const customLabel = screen.getByText('Custom label');
    const unitLabel = screen.getByText('Unit');
    const dataFilterLabel = screen.getByText('Data filter');
    expect(customLabel).toBeInTheDocument();
    expect(unitLabel).toBeInTheDocument();
    expect(dataFilterLabel).toBeInTheDocument();
  });
  it('supports default and i18n for dataItemEditorDataItemHelperText', () => {
    const { rerender } = render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={{
          dataItemId: 'test-key1',
        }}
      />
    );

    expect(screen.getByText('Data item source: test-key1')).toBeInTheDocument();

    rerender(
      <DataSeriesFormItemModal
        {...commonProps}
        i18n={{
          dataItemSource: 'test-data-item-source',
          dataItemEditorDataItemHelperText: (dataItemSource, dataItemId) =>
            `${dataItemSource} - ${dataItemId}`,
        }}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={{
          dataItemId: 'test-key1',
        }}
      />
    );

    expect(screen.getByText('test-data-item-source - test-key1')).toBeInTheDocument();
  });
  it('Adds a custom label in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const customLabelInput = screen.getByDisplayValue('Key 1');
    expect(customLabelInput).toBeInTheDocument();

    fireEvent.change(customLabelInput, {
      target: { value: 'newLabel' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataSourceId: 'key1',
      label: 'newLabel',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes unit in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const unitInput = screen.getByDisplayValue('%');
    expect(unitInput).toBeInTheDocument();

    fireEvent.change(unitInput, {
      target: { value: 'PSI' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: 'PSI',
    });
  });
  it('Changes precision in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const precisionSelector = screen.getByText('3');
    expect(precisionSelector).toBeInTheDocument();

    fireEvent.click(precisionSelector);

    const selectorOption = screen.getByText('2');
    expect(selectorOption).toBeInTheDocument();

    fireEvent.click(selectorOption);
    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Removes precision in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={{ ...editValueDataItem, precision: 3 }}
      />
    );

    const precisionSelector = screen.getByText('3');
    expect(precisionSelector).toBeInTheDocument();

    fireEvent.click(precisionSelector);

    const notSetOption = screen.getByText('Not set');
    expect(notSetOption).toBeInTheDocument();

    fireEvent.click(notSetOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Removes dataFilter in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={{
          ...editValueDataItem,
          dataFilter: { manufacturer: 'Rentech' },
        }}
      />
    );

    const dataFilterSelector = screen.getByText('manufacturer');
    expect(dataFilterSelector).toBeInTheDocument();

    fireEvent.click(dataFilterSelector);

    const noneOption = screen.getAllByText('None')[1];
    expect(noneOption).toBeInTheDocument();

    fireEvent.click(noneOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Changes dataFilter in a ValueCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const dataFilterDimensionInput = screen.getAllByText('None')[1];
    expect(dataFilterDimensionInput).toBeInTheDocument();

    fireEvent.click(dataFilterDimensionInput);

    const deviceIdOption = screen.getByText('deviceid');
    expect(deviceIdOption).toBeInTheDocument();

    fireEvent.click(deviceIdOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataFilter: {
        deviceid: '73000',
      },
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes dataFilter value in a ValueCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={{
          dataFilter: {
            deviceid: '73000',
          },
          dataSourceId: 'key1',
          label: 'Key 1',
          precision: 3,
          unit: '%',
        }}
      />
    );

    const dataFilterValueInput = screen.getByText('73000');
    expect(dataFilterValueInput).toBeInTheDocument();

    fireEvent.click(dataFilterValueInput);

    const valueOption = screen.getByText('73001');
    expect(valueOption).toBeInTheDocument();

    fireEvent.click(valueOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataFilter: {
        deviceid: '73001',
      },
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes the label in a TimeseriesCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const labelInput = screen.getByDisplayValue('Temperature');
    expect(labelInput).toBeInTheDocument();

    fireEvent.change(labelInput, {
      target: { value: 'newLabel' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      label: 'newLabel',
      dataSourceId: 'temperature',
      color: 'red',
      aggregationMethods: [
        {
          id: 'last',
          text: 'Last',
        },
        {
          id: 'mean',
          text: 'Mean',
        },
        {
          id: 'max',
          text: 'Max',
        },
        {
          id: 'min',
          text: 'Min',
        },
      ],
    });
  });
  it('Changes the color in a TimeseriesCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const colorDropdown = screen.getAllByTitle('Open menu')[2];
    expect(colorDropdown).toBeInTheDocument();

    fireEvent.click(colorDropdown);

    const magentaColor = screen.getAllByRole('option')[5];
    expect(magentaColor).toBeInTheDocument();

    fireEvent.click(magentaColor);
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItemAggregated,
      color: '#520408',
    });
  });
  it('Changes grain on aggregated item', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const grainDropdown = screen.getByText('Hourly');
    expect(grainDropdown).toBeInTheDocument();

    fireEvent.click(grainDropdown);

    const grainOption = screen.getAllByRole('option')[2];
    expect(grainOption).toBeInTheDocument();

    fireEvent.click(grainOption);
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItemAggregated,
      grain: 'weekly',
    });
  });
  it('Renders an aggregation selector in summary dashboards and fires setEditDataItem', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const aggregationDropdown = screen.getAllByText('None')[0];
    expect(aggregationDropdown).toBeInTheDocument();

    fireEvent.click(aggregationDropdown);

    const aggregationOption = screen.getByText('Min');
    expect(aggregationOption).toBeInTheDocument();

    fireEvent.click(aggregationOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Switching between non-aggregated to aggregated should default the grain', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    // First set the aggregator from None to Min, should default a grain
    const aggregationDropdown = screen.getAllByText('None')[0];
    expect(aggregationDropdown).toBeInTheDocument();

    fireEvent.click(aggregationDropdown);

    const aggregationOption = screen.getByText('Min');
    expect(aggregationOption).toBeInTheDocument();

    fireEvent.click(aggregationOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItem,
      aggregationMethod: 'min',
      grain: 'hourly',
    });
  });
  it('Switching between aggregated to nonaggregated should clear the grain', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    // Now set the aggregator back from Max to None
    const aggregationDropdown2 = screen.getAllByLabelText('Aggregation method')[0];
    fireEvent.click(aggregationDropdown2);
    const aggregationOptionNone = screen.getAllByRole('option')[0];
    expect(aggregationOptionNone).toBeInTheDocument();

    fireEvent.click(aggregationOptionNone);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...omit(editTimeseriesDataItemAggregated, 'grain'),
      aggregationMethod: 'none',
    });
  });
  it('Renders a read only aggregation field in instance dashboards', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Closes the editor and empties out the editDataItem', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(mockSetEditDataItem).toHaveBeenCalled();
    expect(mockSetShowEditor).toHaveBeenCalled();
  });
  it('Renders the DataSeriesEditorTable', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
      />
    );

    const modalTitle = screen.getByText('Customize data series');
    expect(modalTitle).toBeInTheDocument();
  });

  it('Renders the DataSeriesEditorTable as size md by default', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
      />
    );

    const mdContainer = screen
      .getByText('Customize data series')
      .closest(`.${prefix}--modal-container--md`);
    expect(mdContainer).toBeInTheDocument();

    const largeContainer = screen
      .queryByText('Customize data series')
      .closest(`.${iotPrefix}--composed-modal--large`);
    expect(largeContainer).not.toBeInTheDocument();
  });

  it('Renders the DataSeriesEditorTable as size large if isLarge prop is true', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
        isLarge
      />
    );

    const largeContainer = screen
      .getByText('Customize data series')
      .closest(`.${iotPrefix}--composed-modal--large`);
    expect(largeContainer).toBeInTheDocument();
  });

  it('should show static aggregation methods when isSummaryDashboard:true', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={{
          ...editTimeseriesDataItem,
          aggregationMethod: 'min',
        }}
        editDataSeries={editDataSeriesTimeSeries}
        isSummaryDashboard
        validDataItems={[
          {
            dataItemId: 'testDataItem',
            dataSourceId: 'temperature',
            aggregationMethod: 'min',
            grain: 'hourly',
          },
        ]}
      />
    );

    expect(screen.getByText('Min')).toBeVisible();
    expect(screen.getByText('Hourly')).toBeVisible();
  });

  it("should fallback to an empty string when editDataItem.aggregationMethod doesn't exist", () => {
    const { container } = render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
        isSummaryDashboard
        validDataItems={[
          {
            dataItemId: 'testItemId',
            dataSourceId: 'temperature',
            aggregationMethod: 'min',
            grain: 'hourly',
          },
        ]}
      />
    );

    expect(screen.getByText('Aggregation method')).toBeVisible();
    expect(
      container.querySelectorAll(`.${iotPrefix}--card-edit-form--input-group--item-half-content`)
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(`.${iotPrefix}--card-edit-form--input-group--item-half-content`)[0]
    ).toHaveTextContent('');
  });

  it('should call setEditDataItem when changing units on an IMAGE card.', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: 'IMAGE',
          content: {
            hideMinimap: true,
            hideHotspots: false,
            hideZoomControls: false,
            displayOption: 'contain',
          },
        }}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.type(screen.getByPlaceholderText('Example: %'), '℉');
    expect(setEditDataItem).toHaveBeenCalledWith({ unit: '℉' });
  });

  it('should call setEditDataItem when changing precision on an IMAGE card.', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: 'IMAGE',
          content: {
            hideMinimap: true,
            hideHotspots: false,
            hideZoomControls: false,
            displayOption: 'contain',
          },
        }}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.click(screen.getByText('Not set'));
    userEvent.click(screen.getByText('3'));
    expect(setEditDataItem).toHaveBeenCalledWith({
      precision: 3,
    });
  });

  it('should call setEditDataItem and remove precision when unsetting precision on an IMAGE card.', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: 'IMAGE',
          content: {
            hideMinimap: true,
            hideHotspots: false,
            hideZoomControls: false,
            displayOption: 'contain',
          },
        }}
        editDataItem={{
          precision: 3,
        }}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.click(screen.getByText('3'));
    userEvent.click(screen.getByText('Not set'));
    expect(setEditDataItem).toHaveBeenCalled();
  });

  it("should fallback to 'Not set' on a VALUE card when no precision given", () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: CARD_TYPES.VALUE,
          content: {},
        }}
        editDataItem={{
          aggregationMethod: 'min',
        }}
        setEditDataItem={setEditDataItem}
      />
    );

    expect(screen.getByText('Not set')).toBeVisible();
  });

  it('should call setEditDataItem when changing thresholds on VALUE cards', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: CARD_TYPES.VALUE,
          content: {},
        }}
        editDataItem={{}}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Add threshold' }));
    expect(setEditDataItem).toHaveBeenLastCalledWith({
      thresholds: [{ color: '#da1e28', comparison: '>', value: 0 }],
    });
    userEvent.click(screen.getByLabelText('Increment number'));
    expect(setEditDataItem).toHaveBeenLastCalledWith({
      thresholds: [{ color: '#da1e28', comparison: '>', value: 1 }],
    });
  });

  it('should call setEditDataItem and onChange when submitting', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              {
                label: 'Tagpath',
                dataSourceId: 'footTraffic',
              },
            ],
          },
        }}
        editDataItem={{}}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Add threshold' }));
    userEvent.click(screen.getByLabelText('Increment number'));
    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(setEditDataItem).toHaveBeenLastCalledWith({});
    expect(setEditDataItem).toHaveBeenCalledTimes(3);
    expect(commonProps.onChange).toHaveBeenCalledWith({
      content: { attributes: [{ dataSourceId: 'footTraffic', label: 'Tagpath' }, {}] },
      id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
      size: 'MEDIUM',
      title: 'Untitled',
      type: 'VALUE',
    });
  });

  it('should simply return editDataItem as the new card on save when using an IMAGE card', () => {
    const setEditDataItem = jest.fn();
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={{
          id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
          title: 'Untitled',
          size: 'MEDIUM',
          type: CARD_TYPES.IMAGE,
          content: {
            hideMinimap: true,
            hideHotspots: false,
            hideZoomControls: false,
            displayOption: 'contain',
          },
        }}
        editDataItem={{}}
        setEditDataItem={setEditDataItem}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Add threshold' }));
    userEvent.click(screen.getByLabelText('Increment number'));
    userEvent.click(screen.getByText('Not set'));
    userEvent.click(screen.getByText('3'));
    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(setEditDataItem).toHaveBeenCalledTimes(4);
    expect(setEditDataItem).toHaveBeenLastCalledWith({});
    // called with an empty object since editDataItem is passed as {}
    // and IMAGE cards just return what was given.
    expect(commonProps.onChange).toHaveBeenCalledWith({});
  });
  it('When no Downsample method for timebased stacked bar should show grain and aggregation methods', () => {
    const stackedTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'STACKED',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        timeDataSourceId: 'timestamp',
      },
      dataSource: {},
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    expect(screen.queryByLabelText('DownSample Method')).not.toBeInTheDocument();
    expect(screen.getByText('Aggregation method')).toBeVisible();
  });
  it('Version is V2 for timeseries card should show Downsample method and hide grain and aggregation methods', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregationMethodsV2}
      />
    );
    expect(screen.queryByLabelText('Aggregation Method')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    expect(screen.getByText('Aggregation method')).toBeVisible();
  });

  it("should fallback to an empty string when V2 editDataItem.aggregationMethod doesn't exist", () => {
    const { container } = render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregationMethodsV2}
        editDataSeries={editDataSeriesTimeSeries}
        isSummaryDashboard
        validDataItems={[
          {
            dataItemId: 'testItemId',
            dataSourceId: 'temperature',
            aggregationMethod: 'min',
          },
        ]}
      />
    );
    expect(screen.getByText('Aggregation method')).toBeVisible();
    expect(
      container.querySelectorAll(`.${iotPrefix}--card-edit-form--input-group--item-half-content`)
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(`.${iotPrefix}--card-edit-form--input-group--item-half-content`)[0]
    ).toHaveTextContent('');
  });
});
