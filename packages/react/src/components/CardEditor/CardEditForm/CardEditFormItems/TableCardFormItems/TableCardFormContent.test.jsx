import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CARD_SIZES, CARD_TYPES } from '../../../../../constants/LayoutConstants';
import { dashboardEditorActions } from '../../../../DashboardEditor/dashboardEditorMockData';

import TableCardFormContent from './TableCardFormContent';

const commonCardConfig = {
  id: 'id',
  title: 'My Table Card',
  size: CARD_SIZES.LARGE,
  type: CARD_TYPES.TABLE,
  content: {},
};
const mockOnChange = jest.fn();
const commonProps = {
  cardConfig: commonCardConfig,
  dataItems: [
    { dataItemId: 'temperature', dataSourceId: 'temperature', label: 'Temperature' },
    { dataItemId: 'pressure', dataSourceId: 'pressure', label: 'Pressure' },
    {
      dataItemId: 'deviceid',
      dataSourceId: 'deviceid',
      label: 'deviceid',
      destination: 'groupBy',
      dataItemType: 'DIMENSION',
    },
  ],
  availableDimensions: {
    manufacturer: ['Rentech', 'GHI'],
    deviceid: ['73000', '73001'],
  },
  onChange: mockOnChange,
  selectedTimeRange: 'this week',
  setSelectedDataItems: jest.fn(),
  translateWithId: jest.fn((id) => {
    switch (id) {
      default:
        return '';
      case 'clear.all':
        return 'Clear selection';
    }
  }),
  ...dashboardEditorActions,
};

describe('TableCardFormContent', () => {
  it('should render dataitems and dimensions', () => {
    render(<TableCardFormContent {...commonProps} />);
    // check for the temperature and pressure to be shown under data items
    const dataItemComboBox = screen.getByTestId('combo-box');
    expect(dataItemComboBox).toBeInTheDocument();
    fireEvent.click(dataItemComboBox);
    expect(screen.queryByText('temperature')).toBeDefined();
    expect(screen.queryByText('pressure')).toBeDefined();
    expect(screen.queryByText('manufacturer')).toBeNull();

    // check for the dimensions to be shown
    fireEvent.click(screen.getByLabelText(/Select dim/));
    expect(screen.queryByText('manufacturer')).toBeDefined();
    expect(screen.queryAllByText('deviceid')).toBeDefined();
  });
  it('puts special data items in groupBy section', () => {
    render(<TableCardFormContent {...commonProps} />);
    // check for the temperature and pressure to be shown under data items
    const dataItemComboBox = screen.getByTestId('combo-box');
    expect(dataItemComboBox).toBeInTheDocument();
    fireEvent.click(dataItemComboBox);
    expect(screen.queryAllByText('deviceid')).toBeDefined();
    expect(screen.queryByText('pressure')).toBeDefined();

    fireEvent.click(screen.queryAllByText('deviceid')[0]);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            columnType: 'TIMESTAMP',
            label: 'Timestamp',
            sort: 'DESC',
            dataItemId: 'timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'deviceid',
            destination: 'groupBy',
            // dataSourceId is generated with a uuid to stay unique
            dataSourceId: 'deviceid',
            dataItemId: 'deviceid',
            dataItemType: 'DIMENSION',
          },
        ],
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    });
  });
  it('fires onChange when dataItem deviceId is selected', () => {
    render(<TableCardFormContent {...commonProps} />);
    // check for the temperature and pressure to be shown under data items
    const dataItemComboBox = screen.getByTestId('combo-box');
    expect(dataItemComboBox).toBeInTheDocument();
    fireEvent.click(dataItemComboBox);
    expect(screen.queryByText('temperature')).toBeDefined();
    expect(screen.queryByText('pressure')).toBeDefined();

    fireEvent.click(screen.queryByText('temperature'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            columnType: 'TIMESTAMP',
            label: 'Timestamp',
            sort: 'DESC',
            dataItemId: 'timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Temperature',
            // dataSourceId is generated with a uuid to stay unique
            dataSourceId: expect.stringContaining('temperature'),
            dataItemId: 'temperature',
          },
        ],
      },
    });
  });
  it('prioritizes getValidDataItems for the dropdown', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        dataItems={[
          { dataItemId: 'inValidDataItem', dataSourceId: 'inValidDataItem', label: 'Data Item' },
        ]}
        getValidDataItems={() => [
          { dataItemId: 'validDataItem', dataSourceId: 'validDataItem', label: 'Data Item' },
        ]}
      />
    );
    // check for the temperature and pressure to be shown under data items
    const dataItemComboBox = screen.getByTestId('combo-box');
    expect(dataItemComboBox).toBeInTheDocument();
    fireEvent.click(dataItemComboBox);
    expect(screen.queryByText('validDataItem')).toBeDefined();
    expect(screen.queryByText('inValidDataItem')).toBeNull();
  });
  it('selecting dimensions should call onChange', () => {
    const mockOnChange = jest.fn();
    render(<TableCardFormContent {...commonProps} onChange={mockOnChange} />);
    expect(mockOnChange).not.toHaveBeenCalled();
    // check for the temperature and pressure to be shown under data items
    fireEvent.click(screen.getByLabelText(/Select dim/));
    expect(screen.queryByText('manufacturer')).toBeDefined();
    fireEvent.click(screen.queryByText('manufacturer'));
    // the callback for onChange should be called
    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            columnType: 'TIMESTAMP',
            dataItemId: 'timestamp',
            dataSourceId: 'timestamp',
            label: 'Timestamp',
            type: 'TIMESTAMP',
            sort: 'DESC',
          },
          {
            dataItemId: 'manufacturer',
            dataSourceId: 'manufacturer',
            destination: 'groupBy',
            label: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
        ],
      },
      dataSource: { groupBy: ['manufacturer'] },
    });
  });
  it('un-selecting dimension should call onChange with removed dimension', () => {
    const mockOnChange = jest.fn();
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemType: 'DIMENSION',
                destination: 'groupBy',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
          dataSource: { groupBy: ['manufacturer'] },
        }}
        onChange={mockOnChange}
      />
    );
    expect(mockOnChange).not.toHaveBeenCalled();
    // check for the temperature and pressure to be shown under data items
    fireEvent.click(screen.getByRole('button', { name: /Select dim/ }));
    expect(screen.queryByText('manufacturer')).toBeDefined();
    fireEvent.click(screen.queryByText('manufacturer'));
    // the callback for onChange should be called
    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
      dataSource: {},
    });
  });
  it('edit mode with dataitems and dimension columns show work correctly', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();
  });
  it('remove button should remove items from the data items list', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    const removeManufacturerButton = screen.getAllByRole('button', { name: 'Remove' })[1];
    expect(removeManufacturerButton).toBeInTheDocument();

    fireEvent.click(removeManufacturerButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
    });
  });
  it('remove button should remove items from the groupBy list', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
          dataSource: {
            groupBy: ['manufacturer'],
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    const removeManufacturerButton = screen.getAllByRole('button', { name: 'Remove' })[1];
    expect(removeManufacturerButton).toBeInTheDocument();

    fireEvent.click(removeManufacturerButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
    });
  });
  it('remove button should remove items from the groupBy list but leave the dataSource alone', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
          dataSource: {
            groupBy: ['manufacturer'],
            timeGrain: 'hour',
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    const removeManufacturerButton = screen.getAllByRole('button', { name: 'Remove' })[1];
    expect(removeManufacturerButton).toBeInTheDocument();

    fireEvent.click(removeManufacturerButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
      dataSource: {
        timeGrain: 'hour',
      },
    });
  });
  it('remove button should remove items from the columns but leave groupby alone', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
          dataSource: {
            groupBy: ['manufacturer'],
            timeGrain: 'hour',
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    const removeTemperatureButton = screen.getAllByRole('button', { name: 'Remove' })[2];
    expect(removeTemperatureButton).toBeInTheDocument();

    fireEvent.click(removeTemperatureButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
        ],
      },
      dataSource: {
        groupBy: ['manufacturer'],
        timeGrain: 'hour',
      },
    });
  });
  it('should remove threshold attribute from content when last threshold gets deleted', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
            thresholds: [
              {
                dataSourceId: 'manufacturer',
                comparison: '>',
                value: 5,

                color: '#da1e28',
                severity: 1,
              },
            ],
          },
          dataSource: {
            attributes: [
              {
                id: 'manufacturer',
                attribute: 'manufacturer',
                eventName: 'event1',
              },
            ],
          },
        }}
      />
    );

    const removeTemperatureButton = screen.getAllByRole('button', { name: 'Remove' })[1];
    expect(removeTemperatureButton).toBeInTheDocument();

    fireEvent.click(removeTemperatureButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Temperature',
            dataSourceId: 'temperature',
          },
        ],
      },
    });
  });
  it('edit mode with dataitems adds threshold correctly', async () => {
    const mockOnChange = jest.fn();
    const mockCardConfig = {
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
    };
    render(
      <TableCardFormContent {...commonProps} onChange={mockOnChange} cardConfig={mockCardConfig} />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    // Popup the Data Item Editor
    await fireEvent.click(screen.queryAllByLabelText('Edit')[1]);
    expect(screen.queryByText('Customize data series')).toBeDefined();
    fireEvent.click(screen.queryByText(/Add threshold/));
    fireEvent.click(screen.queryByText('Save'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockCardConfig,
      content: {
        ...mockCardConfig.content,
        thresholds: [
          {
            color: '#da1e28',
            comparison: '>',
            dataSourceId: 'manufacturer',

            value: 0,
          },
        ],
      },
    });
  });

  it('edit mode with dataitems edits threshold correctly', async () => {
    const mockOnChange = jest.fn();
    const mockCardConfig = {
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
          {
            label: 'Temperature',
            dataSourceId: 'temperature',
          },
        ],
        thresholds: [
          {
            color: '#da1e28',
            comparison: '<',
            dataSourceId: 'temperature',

            value: 10,
          },
          {
            color: '#da1e28',
            comparison: '<',
            dataSourceId: 'manufacturer',

            value: 0,
          },
        ],
      },
    };
    render(
      <TableCardFormContent {...commonProps} onChange={mockOnChange} cardConfig={mockCardConfig} />
    );

    const th1Expected = expect.objectContaining({
      color: '#da1e28',
      comparison: '<',
      dataSourceId: 'temperature',

      value: 10,
    });

    const th2Expected = expect.objectContaining({
      color: '#da1e28',
      comparison: '<',
      dataSourceId: 'manufacturer',

      value: 0,
    });

    const th3Expected = expect.objectContaining({
      color: '#da1e28',
      comparison: '>',
      dataSourceId: 'manufacturer',

      value: 0,
    });

    // Ensure save does not duplicate thresholds
    await fireEvent.click(screen.queryAllByLabelText('Edit')[1]);
    expect(screen.queryByText('Customize data series')).toBeDefined();
    fireEvent.click(screen.queryByText(/Add threshold/));
    fireEvent.click(screen.queryByText('Save'));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          thresholds: expect.arrayContaining([th1Expected, th2Expected, th3Expected]),
        }),
      })
    );
  });

  it('edit mode with dataitems leaves threshold blank correctly', async () => {
    const mockOnChange = jest.fn();
    const mockCardConfig = {
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
    };
    render(
      <TableCardFormContent {...commonProps} onChange={mockOnChange} cardConfig={mockCardConfig} />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    // Popup the Data Item Editor
    await fireEvent.click(screen.queryAllByLabelText('Edit')[1]);
    expect(screen.queryByText('Customize data series')).toBeDefined();
    fireEvent.click(screen.queryByText('Save'));
    expect(mockOnChange).toHaveBeenCalledWith(mockCardConfig);
  });
  it('should set thresholds in dataSection if they exist', async () => {
    const mockOnChange = jest.fn();
    const mockCardConfig = {
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
        thresholds: [
          {
            color: '#da1e28',
            comparison: '>',
            dataSourceId: 'manufacturer',

            value: 1,
          },
        ],
      },
    };
    render(
      <TableCardFormContent
        {...commonProps}
        onChange={mockOnChange}
        cardConfig={mockCardConfig}
        onEditDataItem={jest.fn().mockImplementation(() => [
          { id: 'none', text: 'None' },
          { id: 'mean', text: 'Mean' },
        ])}
      />
    );

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    expect(screen.queryByText('Customize data series')).toBeDefined();
    expect(screen.getByTitle('#da1e28')).toBeVisible();
  });
  it("should fallback to dataItemId if label isn't given in column", () => {
    const mockOnChange = jest.fn();
    const mockCardConfig = {
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          {
            label: 'Manufacturer',
            dataSourceId: 'manufacturer',
            dataItemType: 'DIMENSION',
          },
          { dataItemId: '__temperature__', dataSourceId: 'temperature' },
        ],
        thresholds: [
          {
            color: '#da1e28',
            comparison: '>',
            dataSourceId: 'manufacturer',

            value: 1,
          },
        ],
      },
    };
    render(
      <TableCardFormContent {...commonProps} onChange={mockOnChange} cardConfig={mockCardConfig} />
    );

    expect(screen.getByTitle('__temperature__')).toBeVisible();
  });
  it('should not render groupBy dimensions if availableDimensions is empty', () => {
    const mockOnChange = jest.fn();
    render(
      <TableCardFormContent {...commonProps} onChange={mockOnChange} availableDimensions={{}} />
    );

    expect(screen.queryByTitle('Select dimension(s)')).toBeNull();
  });
  it('should render hrefs in tooltips from dataSeriesItemLinks', () => {
    const mockOnChange = jest.fn();
    render(
      <TableCardFormContent
        {...commonProps}
        onChange={mockOnChange}
        dataSeriesItemLinks={{
          table: 'https://www.ibm.com',
        }}
        i18n={{
          dataItemEditorSectionTooltipLinkText: 'Click here!',
        }}
      />
    );

    userEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Click here!')).toBeVisible();
    expect(screen.getByText('Click here!')).toHaveAttribute('href', 'https://www.ibm.com');
  });

  it('Edit button should edit items from the data items list', () => {
    render(
      <TableCardFormContent
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                label: 'Timestamp',
                dataSourceId: 'timestamp',
                type: 'TIMESTAMP',
              },
              {
                label: 'Manufacturer',
                dataSourceId: 'manufacturer',
                dataItemType: 'DIMENSION',
              },
              { label: 'Temperature', dataSourceId: 'temperature' },
            ],
          },
        }}
      />
    );
    // All of the existing columns should be rendered in the data section
    expect(screen.queryByText('Temperature')).toBeDefined();
    expect(screen.queryByText('Timestamp')).toBeDefined();
    expect(screen.queryByText('Manufacturer')).toBeDefined();

    const editManufacturerButton = screen.getAllByRole('button', { name: 'Edit' })[1];
    expect(editManufacturerButton).toBeInTheDocument();

    fireEvent.click(editManufacturerButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...commonCardConfig,
      content: {
        columns: [
          {
            label: 'Timestamp',
            dataSourceId: 'timestamp',
            type: 'TIMESTAMP',
          },
          { label: 'Temperature', dataSourceId: 'temperature' },
        ],
      },
    });
  });
});
