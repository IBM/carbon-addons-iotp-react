import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import fileDownload from 'js-file-download';

import { settings } from '../../constants/Settings';
import { getIntervalChartData } from '../../utils/sample';
import { CARD_SIZES, COLORS, TIME_SERIES_TYPES } from '../../constants/LayoutConstants';

import TimeSeriesCard from './TimeSeriesCard';

const { prefix } = settings;

jest.mock('js-file-download');

const timeSeriesCardProps = {
  title: 'Temperature',
  id: 'facility-temperature',
  isLoading: false,
  content: {
    series: [
      {
        label: 'Temp',
        dataSourceId: 'temperature',
        // color: text('color', COLORS.PURPLE),
      },
    ],
    xLabel: 'Time',
    yLabel: 'Temperature (˚F)',
    timeDataSourceId: 'timestamp',
  },
  values: getIntervalChartData('hour', 1, { min: 50, max: 100 }, 100),
  interval: 'hour',
  breakpoint: 'lg',
  size: 'LARGE',
  onCardAction: () => {},
};

describe('TimeSeriesCard', () => {
  it('should be selectable by testID or testId', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <TimeSeriesCard
        {...timeSeriesCardProps}
        size={CARD_SIZES.MEDIUM}
        isExpanded
        testID="TIME_SERIES_CARD"
      />
    );

    expect(screen.getByTestId('TIME_SERIES_CARD')).toBeDefined();
    expect(screen.getByTestId('TimeSeries-table')).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      `Warning: The 'testID' prop has been deprecated. Please use 'testId' instead.`
    );
    jest.resetAllMocks();

    rerender(
      <TimeSeriesCard
        {...timeSeriesCardProps}
        size={CARD_SIZES.MEDIUM}
        isExpanded
        testId="time_series_card"
      />
    );

    expect(screen.getByTestId('time_series_card')).toBeDefined();
    expect(screen.getByTestId('TimeSeries-table')).toBeDefined();
  });

  it('does not show line chart when loading', () => {
    const { container, rerender } = render(
      <TimeSeriesCard {...timeSeriesCardProps} isLoading size={CARD_SIZES.MEDIUM} />
    );
    expect(container.querySelectorAll('#mock-line-chart')).toHaveLength(0);
    expect(container.querySelectorAll(`.${prefix}--skeleton__text`)).toHaveLength(3);

    rerender(<TimeSeriesCard {...timeSeriesCardProps} size={CARD_SIZES.MEDIUM} />);
    expect(container.querySelectorAll('#mock-line-chart')).toHaveLength(1);
    expect(container.querySelectorAll(`.${prefix}--skeleton__text`)).toHaveLength(0);
  });
  it('does not fail to render if no data is given', () => {
    // For whatever reason, these devices do not give back real data so the No data message
    // should render instead of the line graph
    const emptyValues = [{ deviceid: 'robot1' }, { deviceid: 'robot2' }];
    render(
      <TimeSeriesCard {...timeSeriesCardProps} values={emptyValues} size={CARD_SIZES.MEDIUM} />
    );

    expect(screen.getByText('No data is available for this time range.')).toBeInTheDocument();
  });
  it('shows table with data when expanded', () => {
    const { container } = render(
      <TimeSeriesCard {...timeSeriesCardProps} isExpanded size={CARD_SIZES.MEDIUMTHIN} />
    );
    expect(container.querySelectorAll('#mock-line-chart')).toHaveLength(1);
    // Carbon Table should be there
    expect(container.querySelectorAll('#TimeSeries-table')).toHaveLength(1);
  });

  it('type bar shows', () => {
    const originalDev = global.__DEV__;
    const originalError = console.error;
    const error = jest.fn();
    console.error = error;
    global.__DEV__ = true;
    const { container } = render(
      <TimeSeriesCard
        {...timeSeriesCardProps}
        content={{
          ...timeSeriesCardProps.content,
          chartType: TIME_SERIES_TYPES.BAR,
        }}
        size={CARD_SIZES.MEDIUMWIDE}
      />
    );
    expect(container.querySelectorAll('#mock-bar-chart-stacked')).toHaveLength(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        'The prop `chartType` for Card has been deprecated. BarChartCard now handles all bar chart functionality including time-based bar charts.'
      )
    );

    console.error = originalError;
    global.__DEV__ = originalDev;
  });

  it('show line chart when only 1 color is set', () => {
    const timeSeriesCardWithOneColorProps = {
      title: 'Temperature',
      id: 'facility-temperature',
      isLoading: false,
      content: {
        series: [
          {
            label: 'Temperature Device 1',
            dataSourceId: 'temperature',
            dataFilter: {
              ENTITY_ID: 'Sensor2-1',
            },
            color: COLORS.MAGENTA,
          },
          {
            label: 'Temperature Device 2',
            dataSourceId: 'temperature',
            dataFilter: {
              ENTITY_ID: 'Sensor2-3',
            },
            // no color set here
          },
        ],
        xLabel: 'Time',
        yLabel: 'Temperature (˚F)',
        timeDataSourceId: 'timestamp',
      },
      values: getIntervalChartData('day', 12, { min: 10, max: 100 }, 100).reduce(
        (acc, dataPoint) => {
          // make "two devices worth of data" so that we can filter
          acc.push(dataPoint);
          acc.push({
            ...dataPoint,
            temperature: dataPoint.temperature / 2,
            ENTITY_ID: 'Sensor2-3',
          });
          return acc;
        },
        []
      ),
      interval: 'hour',
      breakpoint: 'lg',
      size: CARD_SIZES.LARGE,
      onCardAction: () => {},
    };
    const { container } = render(<TimeSeriesCard {...timeSeriesCardWithOneColorProps} />);
    expect(container.querySelectorAll('#mock-line-chart')).toHaveLength(1);
  });

  it('tableColumn headers should use the label, not the dataSourceId', () => {
    const props = {
      ...timeSeriesCardProps,
      isExpanded: true,
      size: CARD_SIZES.LARGEWIDE,
    };
    // use the xlarge card size for additional code coverage on maxTicksPerSize
    render(<TimeSeriesCard {...props} />);

    // the dataSourceId is temperature so this should show the appreviated label Temp instead
    expect(screen.getByText('Temp')).toBeInTheDocument();
  });

  it('should show no data', () => {
    const props = {
      ...timeSeriesCardProps,
      content: {
        ...timeSeriesCardProps.content,
        timeDataSourceId: undefined,
      },
      values: undefined,
      isExpanded: true,
      size: CARD_SIZES.MEDIUM,
      isEditable: false,
    };
    render(<TimeSeriesCard {...props} />);

    expect(screen.getByText(/No data/i)).toBeInTheDocument();
  });

  // adding to increase branching test coverage.
  it('is editable, resizable, expanded, and csv download works', () => {
    const props = {
      ...timeSeriesCardProps,
      content: {
        ...timeSeriesCardProps.content,
        series: {
          label: 'Temp',
          dataSourceId: 'temperature',
        },
        unit: '˚F',
        yLabel: undefined,
        xLabel: undefined,
        zoomBar: {
          enabled: true,
          axes: 'top',
        },
        addSpaceOnEdges: 1,
      },
      values: [
        {
          temperature: 100,
          timestamp: new Date(2021, 2, 5, 15, 30, 0),
        },
      ],
      domainRange: [new Date(), new Date()],
      interval: 'quarter',
      isExpanded: true,
      isResizable: true,
      size: CARD_SIZES.MEDIUM,
    };

    const { container } = render(<TimeSeriesCard {...props} />);

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.queryAllByText('Timestamp')[0]).toBeInTheDocument();
    expect(container.querySelector('#mock-line-chart')).toBeInTheDocument();
    userEvent.click(screen.getByLabelText('Download table content'));
    expect(fileDownload).toHaveBeenCalledWith(
      `temperature,timestamp\n100,03/05/2021 15:30:00\n`,
      'Temperature.csv'
    );
  });

  it('should display a proptype error when using unsupported sizes', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <TimeSeriesCard {...timeSeriesCardProps} size={CARD_SIZES.SMALL} />
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('`TimeSeriesCard` prop `size` cannot be `SMALL`')
    );

    rerender(<TimeSeriesCard {...timeSeriesCardProps} size={CARD_SIZES.SMALLWIDE} />);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('`TimeSeriesCard` prop `size` cannot be `SMALLWIDE`')
    );

    rerender(<TimeSeriesCard {...timeSeriesCardProps} size={CARD_SIZES.SMALLFULL} />);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('`TimeSeriesCard` prop `size` cannot be `SMALLFULL`')
    );

    jest.resetAllMocks();
  });
});
