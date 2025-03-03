import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CARD_TYPES, BAR_CHART_TYPES } from '../../../../../constants/LayoutConstants';
import { dashboardEditorActions as commonActions } from '../../../../DashboardEditor/dashboardEditorMockData';

import DataSeriesFormItem, {
  formatDataItemsForDropdown,
  defineCardSpecificTooltip,
} from './DataSeriesFormContent';

const cardConfig = {
  id: 'Timeseries',
  title: 'Untitled',
  size: 'MEDIUMWIDE',
  type: 'TIMESERIES',
  content: {
    series: [
      {
        label: 'Temperature',
        dataSourceId: 'temperature',
        color: 'red',
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
    addSpaceOnEdges: 1,
  },
  interval: 'day',
};
const barChartCardConfig = {
  id: 'BarChart',
  title: 'BarChartCard',
  size: 'MEDIUM',
  type: 'BAR',
  content: {
    type: 'STACKED',
    series: [
      {
        dataItemId: 'temperature',
        label: 'Temperature',
        dataSourceId: 'temperature',
        color: 'red',
      },
    ],
    xLabel: 'Time',
    yLabel: 'Temperature (˚F)',
    timeDataSourceId: 'timestamp',
  },
  interval: 'day',
};
const groupedBarCardConfig = {
  title: 'GroupedBarChart',
  size: 'MEDIUM',
  type: 'BAR',
  content: {
    type: 'GROUPED',
    layout: 'VERTICAL',
    series: [
      {
        dataSourceId: 'temperature',
        label: 'temperature',
      },
    ],
    categoryDataSourceId: 'firmware',
  },
  dataSource: {
    groupBy: ['firmware'],
  },
};
const valueCardConfig = {
  id: 'ValueCard',
  title: 'Value Card',
  type: 'VALUE',
  size: 'MEDIUM',
  content: {
    attributes: [
      {
        dataSourceId: 'key2',
        unit: 'lb',
        label: 'Key 2',
      },
    ],
    precision: 5,
  },
  fontSize: 16,
};

const dataItems = [
  { dataSourceId: 'temperature', label: 'Temperature', dataItemId: 'temperature' },
  { dataSourceId: 'pressure', label: 'Pressure', dataItemId: 'pressure' },
];
const mockOnChange = jest.fn();
const mockGetValidDataItems = jest.fn(() => dataItems);
const mockSetSelectedDataItems = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});
describe('DataSeriesFormItem', () => {
  describe('formatDataItemsForDropdown', () => {
    it('should correctly format the items for the dropdown', () => {
      expect(formatDataItemsForDropdown(dataItems)).toEqual([
        { id: 'temperature', text: 'Temperature' },
        { id: 'pressure', text: 'Pressure' },
      ]);
    });
  });
  describe('dataItems', () => {
    it('should prioritize getValidDataItems', () => {
      render(
        <DataSeriesFormItem
          cardConfig={cardConfig}
          onChange={mockOnChange}
          getValidDataItems={mockGetValidDataItems}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );
      expect(mockGetValidDataItems).toHaveBeenCalled();
    });
    it('handles initial dataItems', () => {
      render(
        <DataSeriesFormItem
          cardJson={{ ...cardConfig, content: {} }}
          onChange={mockOnChange}
          getValidDataItems={mockGetValidDataItems}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );
      expect(screen.getByText('Data')).toBeInTheDocument();
    });
    it('does not render the Data section if no data items are passed', () => {
      render(
        <DataSeriesFormItem
          cardJson={{ ...cardConfig, content: {} }}
          onChange={mockOnChange}
          dataItems={[]}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );
      expect(screen.queryByText('Data')).toBeNull();
    });
    it('should remove the category if the card is a stacked timeseries bar', () => {
      render(
        <DataSeriesFormItem
          cardConfig={barChartCardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );
      const dataItemDropDown = screen.getByRole('combobox', {
        name: 'Data item',
      });
      expect(dataItemDropDown).toBeInTheDocument();
      fireEvent.click(dataItemDropDown);

      const pressureOption = screen.getByRole('option', {
        name: 'Pressure',
      });
      expect(pressureOption).toBeInTheDocument();
      fireEvent.click(pressureOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        id: 'BarChart',
        interval: 'day',
        size: 'MEDIUM',
        title: 'BarChartCard',
        type: 'BAR',
        content: {
          series: [
            {
              dataItemId: 'temperature',
              aggregationMethod: undefined,
              color: 'red',
              dataSourceId: expect.anything(), // this is the dataSourceId followed by a uuid
              label: 'Temperature',
            },
            {
              dataItemId: 'pressure',
              aggregationMethod: undefined,
              color: '#1192e8',
              dataSourceId: expect.anything(),
              label: 'Pressure',
            },
          ],
          timeDataSourceId: 'timestamp',
          type: 'STACKED',
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
        },
      });
    });
    it('sets selected data items in a simple bar chart', () => {
      render(
        <DataSeriesFormItem
          cardConfig={{
            ...barChartCardConfig,
            content: { ...barChartCardConfig.content, type: 'SIMPLE' },
          }}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );
      const dataItemDropDown = screen.getByText('temperature');
      expect(dataItemDropDown).toBeInTheDocument();
      fireEvent.click(dataItemDropDown);

      const pressureOption = screen.getByText('pressure');
      expect(pressureOption).toBeInTheDocument();
      fireEvent.click(pressureOption);

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockSetSelectedDataItems).toHaveBeenCalled();
    });
    it('handles row actions for dataItems for complexDataSeries', () => {
      render(
        <DataSeriesFormItem
          cardConfig={barChartCardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );

      const dataItemRowAction = screen.getByRole('button', {
        name: 'Remove',
      });
      fireEvent.click(dataItemRowAction);

      expect(mockSetSelectedDataItems).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalled();
    });
    it('handles remove row action for ValueCards', () => {
      render(
        <DataSeriesFormItem
          cardConfig={valueCardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          onEditDataItem={jest.fn().mockImplementation(() => [])}
          {...commonActions}
        />
      );

      const dataItemRowAction = screen.getByRole('button', {
        name: 'Remove',
      });
      fireEvent.click(dataItemRowAction);

      expect(mockSetSelectedDataItems).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalled();
    });
    it('fires onChange for GroupedBar charts', () => {
      render(
        <DataSeriesFormItem
          cardConfig={{
            ...groupedBarCardConfig,
            content: { ...groupedBarCardConfig.content, series: [] },
          }}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );

      const dataItemsDropdown = screen.getByTestId('editor--data-series--combobox');
      expect(dataItemsDropdown).toBeInTheDocument();

      fireEvent.click(dataItemsDropdown);

      const pressureOption = screen.getByText('Pressure');
      expect(pressureOption).toBeInTheDocument();

      fireEvent.click(pressureOption);
      expect(mockOnChange).toHaveBeenCalled();
    });
    it('Opens the editor modal', async () => {
      render(
        <DataSeriesFormItem
          cardConfig={groupedBarCardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );

      const editButton = screen.getByRole('button', {
        name: 'Edit',
      });
      expect(editButton).toBeInTheDocument();

      await fireEvent.click(editButton);

      const modalTitle = screen.getByText('Customize data series');
      expect(modalTitle).toBeInTheDocument();
    });
    it('handles row actions for dataItems for simpleDataSeries', () => {
      render(
        <DataSeriesFormItem
          cardConfig={valueCardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );

      const dataItemRowAction = screen.getByRole('button', {
        name: 'Edit',
      });
      fireEvent.click(dataItemRowAction);

      const editDataItemModal = screen.getByText('Data item');
      expect(editDataItemModal).toBeInTheDocument();
    });
    it('handles row actions for dataItems for timeSeries', async () => {
      render(
        <DataSeriesFormItem
          cardConfig={{
            ...cardConfig,
            content: {
              ...cardConfig.content,
              series: [cardConfig.content.series[1]],
            },
          }}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn()}
          {...commonActions}
        />
      );

      const dataItemRowAction = screen.getByRole('button', {
        name: 'Edit',
      });
      await fireEvent.click(dataItemRowAction);

      const editDataItemModal = screen.getByText('Customize data series');
      expect(editDataItemModal).toBeInTheDocument();
    });
  });
  describe('defineCardSpecificTooltip', () => {
    const i18n = {
      dataItemEditorSectionSimpleBarTooltipText:
        'Display a metric using bars. Plot over time or by a dimension from Group by.',
      dataItemEditorSectionGroupedBarTooltipText:
        'Group categories side by side in bars. Show groupings of related metrics or different categories of a single metric.',
      dataItemEditorSectionStackedBarTooltipText:
        'Stack bars by categories of a single dimension or into multiple related metrics.',
      dataItemEditorSectionTimeSeriesTooltipText: 'Plot time series metrics over time.',
      dataItemEditorSectionValueTooltipText:
        'Display metric values, dimension values, or alert counts. Select from Data item. ',
      dataItemEditorSectionCustomTooltipText:
        'Show or hide alert fields. Choose dimensions to add as extra columns. ',
    };
    const dataSeriesItemLinks = {
      simpleBar: 'simplebar.com',
      groupedBar: 'groupedbar.com',
      stackedBar: 'stackedbar.com',
      timeSeries: 'timeseries.com',
      value: 'value.com',
      custom: 'custom.com',
    };
    it('should return simple bar tooltip', () => {
      expect(
        defineCardSpecificTooltip(
          { type: CARD_TYPES.BAR, content: { type: BAR_CHART_TYPES.SIMPLE } },
          dataSeriesItemLinks,
          i18n
        )
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionSimpleBarTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.simpleBar,
      });
    });
    it('should return grouped bar tooltip', () => {
      expect(
        defineCardSpecificTooltip(
          { type: CARD_TYPES.BAR, content: { type: BAR_CHART_TYPES.GROUPED } },
          dataSeriesItemLinks,
          i18n
        )
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionGroupedBarTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.groupedBar,
      });
    });
    it('should return stacked bar tooltip', () => {
      expect(
        defineCardSpecificTooltip(
          { type: CARD_TYPES.BAR, content: { type: BAR_CHART_TYPES.STACKED } },
          dataSeriesItemLinks,
          i18n
        )
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionStackedBarTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.stackedBar,
      });
    });
    it('should return timeseries tooltip', () => {
      expect(
        defineCardSpecificTooltip({ type: CARD_TYPES.TIMESERIES }, dataSeriesItemLinks, i18n)
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionTimeSeriesTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.timeSeries,
      });
    });
    it('should return value tooltip', () => {
      expect(
        defineCardSpecificTooltip({ type: CARD_TYPES.VALUE }, dataSeriesItemLinks, i18n)
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionValueTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.value,
      });
    });
    it('should return custom tooltip', () => {
      expect(
        defineCardSpecificTooltip({ type: CARD_TYPES.CUSTOM }, dataSeriesItemLinks, i18n)
      ).toEqual({
        tooltipText: i18n.dataItemEditorSectionCustomTooltipText,
        linkText: i18n.dataItemEditorSectionTooltipLinkText,
        href: dataSeriesItemLinks.custom,
      });
    });
  });
  describe('dataItem editor', () => {
    it('should open dataItem editor, edit, and submit', async () => {
      render(
        <DataSeriesFormItem
          cardConfig={cardConfig}
          onChange={mockOnChange}
          dataItems={dataItems}
          setSelectedDataItems={mockSetSelectedDataItems}
          translateWithId={jest.fn().mockImplementation((idToTranslate) => {
            switch (idToTranslate) {
              default:
                return '';
              case 'clear.all':
                return 'Clear all';
              case 'clear.selection':
                return 'Clear selection';
              case 'open.menu':
                return 'Open';
              case 'close.menu':
                return 'Close';
            }
          })}
          {...commonActions}
        />
      );
      const dataItemsDropdown = screen.getByRole('button', {
        name: 'Open',
      });
      expect(dataItemsDropdown).toBeInTheDocument();
      fireEvent.click(dataItemsDropdown);
      // click on a data item
      const pressureDataItem = await screen.findAllByText('Pressure');
      expect(pressureDataItem[0]).toBeInTheDocument();
      fireEvent.click(pressureDataItem[0]);
      // assert that onChange was called
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockSetSelectedDataItems).toHaveBeenCalled();
      // click the edit icon on the data item
      const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
      expect(editButton).toBeInTheDocument();
      await fireEvent.click(editButton);

      userEvent.type(screen.getByDisplayValue('Temperature'), 'changed label');
      expect(mockOnChange).toHaveBeenCalled();
      // submit the changes
      const submitButton = screen.getByText('Save');
      fireEvent.click(submitButton);
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
