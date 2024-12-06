import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { green50 } from '@carbon/colors';
import { Help } from '@carbon/react/icons';

import { validThresholdIcons, validThresholdColors } from '../../../DashboardEditor/editorUtils';

import ThresholdsFormItem from './ThresholdsFormItem';

describe('ThresholdsFormItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnChange = jest.fn();
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

  const thresholds = [
    {
      value: 5,
      comparison: '>',
      color: 'red',
      icon: 'Warning',
    },
  ];

  const commonProps = {
    cardConfig,
    icons: validThresholdIcons,
    colors: validThresholdColors,
    onChange: mockOnChange,
  };

  it('Adding thresholds invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} selectedIcon={{ name: 'Warning alt' }} />);

    const addBtn = screen.getByText('Add threshold');
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(mockOnChange).toHaveBeenCalledWith([
      { color: '#da1e28', comparison: '>', icon: 'Warning alt', value: 0 },
    ]);

    const firstIcon = screen.getAllByRole('img')[0];
    expect(firstIcon).toBeInTheDocument();

    fireEvent.click(firstIcon, {
      target: { name: 'chevron--down' },
    });

    const secondOption = screen.getAllByRole('option')[2];
    expect(secondOption).toBeInTheDocument();

    fireEvent.click(secondOption);
    expect(mockOnChange).toHaveBeenCalledWith([
      { color: '#da1e28', comparison: '>', icon: 'Warning alt', value: 0 },
    ]);
  });
  it('Adding thresholds with specified icon and color invokes onChange with specified values', () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        selectedIcon={{ carbonIcon: <Help size={24} />, name: 'Help' }}
        selectedColor={{ carbonColor: green50, name: 'green50' }}
      />
    );

    const addBtn = screen.getByText('Add threshold');
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(mockOnChange).toHaveBeenCalledWith([
      { color: '#24a148', comparison: '>', icon: 'Help', value: 0 },
    ]);
  });
  it('with colorless thresholds', () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        thresholds={thresholds.map((threshold) => ({
          ...threshold,
          color: null,
        }))}
        icons={validThresholdIcons}
        selectedIcon={{ carbonIcon: <Help size={24} />, name: 'Help' }}
        selectedColor={{ carbonColor: green50, name: 'green50' }}
      />
    );

    const thresholdsTitle = screen.getByText('Thresholds');
    expect(thresholdsTitle).toBeInTheDocument();
  });
  it('Removing thresholds invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const trashBtn = screen.getByLabelText('Remove');
    expect(trashBtn).toBeInTheDocument();

    fireEvent.click(trashBtn);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
  it('Changing threshold value invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const valueInput = screen.getByLabelText(
      'Numeric input field with increment and decrement buttons'
    );
    expect(valueInput).toBeInTheDocument();

    fireEvent.change(valueInput, {
      target: { value: 25 },
    });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        value: 25,
        comparison: '>',
        color: 'red',
        icon: 'Warning',
      },
    ]);
  });
  it('Changing threshold comparison invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const comparisonInput = screen.getAllByLabelText('Open menu')[4];
    expect(comparisonInput).toBeInTheDocument();

    fireEvent.click(comparisonInput);

    const equalsOperator = screen.getByText('=');
    expect(equalsOperator).toBeInTheDocument();

    fireEvent.click(equalsOperator);
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        value: 5,
        comparison: '=',
        color: 'red',
        icon: 'Warning',
      },
    ]);
  });
  it('Changing threshold color invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const colorInput = screen.getAllByLabelText('Open menu')[3];
    expect(colorInput).toBeInTheDocument();

    fireEvent.click(colorInput);

    const yellowColor = screen.getAllByRole('option')[3];
    expect(yellowColor).toBeInTheDocument();

    fireEvent.click(yellowColor);
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        value: 5,
        comparison: '>',
        color: '#f1c21b',
        icon: 'Warning',
      },
    ]);
  });
  it('Changing threshold icon invokes onChange', () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const iconInput = screen.getAllByLabelText('Open menu')[2];
    expect(iconInput).toBeInTheDocument();

    fireEvent.click(iconInput);

    const errorIcon = screen.getAllByRole('option')[3];
    expect(errorIcon).toBeInTheDocument();

    fireEvent.click(errorIcon);
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        value: 5,
        comparison: '>',
        color: 'red',
        icon: 'Error',
      },
    ]);
  });
  it("should allow text input when comparison is '='", () => {
    render(<ThresholdsFormItem {...commonProps} thresholds={thresholds} />);

    const comparisonInput = screen.getAllByLabelText('Open menu')[4];
    expect(comparisonInput).toBeInTheDocument();

    fireEvent.click(comparisonInput);

    const equalsOperator = screen.getByText('=');
    expect(equalsOperator).toBeInTheDocument();

    fireEvent.click(equalsOperator);
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        value: 5,
        comparison: '=',
        color: 'red',
        icon: 'Warning',
      },
    ]);
    expect(screen.getByTestId('threshold-0-text-input')).toBeDefined();
    userEvent.type(screen.getByTestId('threshold-0-text-input'), '{backspace}orange');
    expect(mockOnChange).toHaveBeenLastCalledWith([
      {
        value: 'orange',
        comparison: '=',
        color: 'red',
        icon: 'Warning',
      },
    ]);
  });

  it('sets 0 if threshold.value is undefined', () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        thresholds={[
          {
            value: undefined,
            comparison: '>',
            color: 'red',
            icon: 'Warning',
          },
        ]}
      />
    );
    expect(
      screen.getByRole('spinbutton', {
        name: 'Numeric input field with increment and decrement buttons',
      })
    ).toHaveValue(0);
  });

  it("should fallback to > on a comparison dropdown when a comparison doesn't exist", () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        thresholds={[
          {
            value: 25,
            color: 'red',
            icon: 'Warning',
          },
        ]}
      />
    );

    expect(screen.getByText('>')).toBeVisible();
  });

  it('should remove the existing threshold when clicking the trash can', () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        thresholds={[
          {
            value: 5,
            comparison: '>',
            color: 'red',
            icon: 'Warning',
          },
          {
            value: 1,
            comparison: '>',
            color: 'red',
            icon: 'Warning',
          },
        ]}
      />
    );

    userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    expect(commonProps.onChange).toHaveBeenCalledWith([
      {
        value: 1,
        comparison: '>',
        color: 'red',
        icon: 'Warning',
      },
    ]);
  });

  it('should fallback to the value when creating a number fails in the onChange handler', () => {
    render(
      <ThresholdsFormItem
        {...commonProps}
        thresholds={[
          {
            value: 5,
            comparison: '>',
            color: 'red',
            icon: 'Warning',
          },
        ]}
      />
    );

    fireEvent.change(
      screen.getByLabelText('Numeric input field with increment and decrement buttons'),
      { target: { value: '000' } }
    );
    expect(commonProps.onChange).toHaveBeenCalledWith([
      {
        value: '000',
        comparison: '>',
        color: 'red',
        icon: 'Warning',
      },
    ]);
  });
  it('should render radiobutton group for columnType boolean', () => {
    render(<ThresholdsFormItem {...commonProps} columnType="BOOLEAN" />);

    fireEvent.click(screen.getByText('Add threshold'));

    const radioButton = screen.getByLabelText('True');
    fireEvent.click(radioButton);
    expect(commonProps.onChange).toHaveBeenLastCalledWith([
      { color: '#da1e28', comparison: '=', value: true },
    ]);
  });
});
