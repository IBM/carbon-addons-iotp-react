import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CARD_SIZES, CARD_TYPES } from '../../../../../constants/LayoutConstants';

import TableCardFormSettings, { updateColumnSort } from './TableCardFormSettings';

const commonCardConfig = {
  id: 'id',
  title: 'My Table Card',
  size: CARD_SIZES.LARGE,
  type: CARD_TYPES.TABLE,
  content: { columns: [], showHeader: true, allowNavigation: true },
};
const commonProps = {
  cardConfig: commonCardConfig,
  onChange: jest.fn(),
  availableDimensions: {
    manufacturer: ['Rentech', 'GHI'],
    deviceid: ['73000', '73001'],
  },
  translateWithId: jest.fn(),
};
describe('TableCardFormSettings', () => {
  it('updateColumnSort where a column is already sorted', () => {
    const mockColumns = [
      { dataSourceId: 'timestamp', sort: 'DESC' },
      { dataSourceId: 'manufacturer' },
    ];
    expect(updateColumnSort(mockColumns, 'manufacturer', 'ASC')).toEqual([
      { dataSourceId: 'timestamp', sort: undefined },
      { dataSourceId: 'manufacturer', sort: 'ASC' },
    ]);
    expect(updateColumnSort(mockColumns, 'timestamp', 'ASC')).toEqual([
      { dataSourceId: 'timestamp', sort: 'ASC' },
      { dataSourceId: 'manufacturer' },
    ]);
  });
  it('updateColumnSort same sort', () => {
    const mockColumns = [
      { dataSourceId: 'timestamp', sort: 'DESC' },
      { dataSourceId: 'manufacturer' },
    ];
    expect(updateColumnSort(mockColumns, 'timestamp', 'DESC')).toEqual([
      { dataSourceId: 'timestamp', sort: 'DESC' },
      { dataSourceId: 'manufacturer' },
    ]);
  });
  it('updateColumnSort with no previous column sort', () => {
    const mockColumns = [{ dataSourceId: 'timestamp' }, { dataSourceId: 'manufacturer' }];
    expect(updateColumnSort(mockColumns, 'manufacturer', 'ASC')).toEqual([
      { dataSourceId: 'timestamp' },
      { dataSourceId: 'manufacturer', sort: 'ASC' },
    ]);
  });
  it('sort by drop down does not render with no columns', () => {
    render(<TableCardFormSettings {...commonProps} />);
    expect(screen.queryByLabelText('Sort by')).toBeNull();
    expect(screen.queryByText('Ascending')).toBeNull();
    expect(screen.queryByText('Descending')).toBeNull();
  });
  it('sort by drop down renders with columns', () => {
    render(
      <TableCardFormSettings
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                dataSourceId: 'timestamp',
                label: 'Timestamp',
                type: 'TIMESTAMP',
              },
            ],
          },
        }}
      />
    );
    expect(screen.queryAllByLabelText('Sort by')).toBeDefined();
    expect(screen.queryByText('Ascending')).toBeDefined();
    expect(screen.queryByText('Descending')).toBeDefined();
  });
  it('sort by drop down populates correctly', () => {
    render(
      <TableCardFormSettings
        {...commonProps}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                dataSourceId: 'timestamp',
                label: 'Timestamp',
                type: 'TIMESTAMP',
              },
              {
                dataSourceId: 'manufacturer',
                label: 'Manufacturer',
                sort: 'DESC',
              },
            ],
          },
        }}
      />
    );
    expect(screen.queryAllByLabelText('Sort by')[0].innerHTML).toEqual(
      expect.stringContaining('manufacturer')
    );
  });
  it('changing sort calls onChange', () => {
    const mockOnChange = jest.fn();
    render(
      <TableCardFormSettings
        {...commonProps}
        onChange={mockOnChange}
        cardConfig={{
          ...commonCardConfig,
          content: {
            columns: [
              {
                dataSourceId: 'timestamp',
                label: 'Timestamp',
                type: 'TIMESTAMP',
              },
              {
                dataSourceId: 'manufacturer',
                label: 'Manufacturer',
                sort: 'DESC',
              },
            ],
          },
        }}
      />
    );
    fireEvent.click(screen.getAllByLabelText('Sort by')[0]);
    fireEvent.click(screen.getByText('timestamp'));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          columns: [
            {
              dataSourceId: 'timestamp',
              label: 'Timestamp',
              type: 'TIMESTAMP',
              sort: 'DESC',
            },
            {
              dataSourceId: 'manufacturer',
              label: 'Manufacturer',
              sort: undefined,
            },
          ],
        }),
      })
    );
  });
  it('handles maximumDataPoints onChange', () => {
    const mockOnChange = jest.fn();
    render(<TableCardFormSettings {...commonProps} onChange={mockOnChange} />);
    const maximumDataPointsInput = screen.getByLabelText('Maximum data points');
    expect(maximumDataPointsInput).toBeInTheDocument();
    userEvent.type(maximumDataPointsInput, '2');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ maximumDataPoints: 2 }),
      })
    );
  });

  it('toggle showHeader should call onChange', () => {
    const mockOnChange = jest.fn();
    render(<TableCardFormSettings {...commonProps} onChange={mockOnChange} />);
    expect(mockOnChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Show table header'));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ showHeader: false }),
      })
    );
  });
  it('toggle allowNavigation should call onChange', () => {
    const mockOnChange = jest.fn();
    render(<TableCardFormSettings {...commonProps} onChange={mockOnChange} />);
    expect(mockOnChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Allow navigation to assets'));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ allowNavigation: false }),
      })
    );
  });

  it('should call onChange when setting column sort', () => {
    const mockOnChange = jest.fn();
    render(
      <TableCardFormSettings
        {...{
          ...commonProps,
          cardConfig: {
            ...commonProps.cardConfig,
            content: {
              ...commonProps.cardConfig.content,
              columns: [
                {
                  dataItemId: 'temperature',
                  dataSourceId: 'temperature',
                  label: 'Temperature',
                },
                {
                  dataItemId: 'pressure',
                  dataSourceId: 'pressure',
                  label: 'Pressure',
                },
              ],
            },
          },
        }}
        onChange={mockOnChange}
      />
    );

    expect(mockOnChange).not.toHaveBeenCalled();
    userEvent.click(screen.getByText('Ascending'));
    expect(mockOnChange).toHaveBeenCalledWith({
      content: {
        allowNavigation: true,
        columns: [
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature',
            label: 'Temperature',
          },
          {
            sort: 'ASC',
          },
        ],
        showHeader: true,
      },
      id: 'id',
      size: 'LARGE',
      title: 'My Table Card',
      type: 'TABLE',
    });
  });

  it('dataItems should default to an empty array and no sort options available if columns is not an array', () => {
    const mockOnChange = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <TableCardFormSettings
        {...{
          ...commonProps,
          cardConfig: {
            ...commonProps.cardConfig,
            content: {
              ...commonProps.cardConfig.content,
              columns: undefined,
            },
          },
        }}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Ascending')).toBeNull();
    expect(screen.queryByText('Descending')).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed prop type: The prop `cardConfig.content.columns` is marked as required'
      )
    );
    console.error.mockReset();
  });
});
