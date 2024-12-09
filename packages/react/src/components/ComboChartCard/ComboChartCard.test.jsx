import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import fileDownload from 'js-file-download';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { comboHealthData } from '../../utils/comboChartDataSample';

import ComboChartCard from './ComboChartCard';

jest.mock('js-file-download');

const commonContent = {
  xLabel: 'Date',
  yLabel: 'Score',
  series: [
    {
      dataSourceId: 'health',
      label: 'Health',
    },
    {
      dataSourceId: 'age',
      label: 'Age',
    },
    {
      dataSourceId: 'condition',
      label: 'Condition',
    },
    {
      dataSourceId: 'rul',
      label: 'RUL',
    },
  ],
  thresholds: [
    {
      value: 100,
      label: 'Custom label',
      fillColor: 'green',
    },
    {
      value: 70,
      fillColor: 'yellow',
    },
    {
      value: 33,
      fillColor: 'red',
    },
  ],
  comboChartTypes: [
    {
      type: 'area',
      correspondingDatasets: ['Health'],
    },
    {
      type: 'line',
      correspondingDatasets: ['Age', 'Condition', 'RUL'],
    },
  ],
  includeZeroOnXaxis: true,
  includeZeroOnYaxis: true,
  addSpaceOnEdges: 0,
  timeDataSourceId: 'date',
};

const commonOptions = {
  id: 'combo-chart',
  size: CARD_SIZES.MEDIUMWIDE,
  title: 'ComboChartCard Test',
  content: commonContent,
  values: comboHealthData,
};

/*
  FYI: the underlying Carbon Charts controls have been mocked.
  Check __mocks__/@carbon/charts-react/ for details
*/

describe('ComboChartCard', () => {
  it('is selectable by testID ot testId ', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ComboChartCard {...commonOptions} testID="COMBO_CHART_CARD_TEST" />
    );
    expect(console.error).toHaveBeenCalledWith(
      `Warning: The 'testID' prop has been deprecated. Please use 'testId' instead.`
    );
    console.error.mockReset();
    expect(screen.getByTestId('COMBO_CHART_CARD_TEST')).toBeDefined();
    rerender(<ComboChartCard {...commonOptions} testId="combo-chart-card-test" />);
    expect(screen.getByTestId('combo-chart-card-test')).toBeDefined();
  });

  it('Renders basic card ', () => {
    render(<ComboChartCard {...commonOptions} />);
    expect(screen.queryByText(commonOptions.title)).toBeDefined();
    expect(screen.queryAllByText('data table toolbar')).toHaveLength(0);
  });

  it('Renders table when expanded', () => {
    render(<ComboChartCard {...commonOptions} isExpanded />);
    expect(screen.getByLabelText('data table toolbar')).toBeDefined();
  });

  it('When expanded and loading it does not show the table', () => {
    render(<ComboChartCard {...commonOptions} isExpanded isLoading />);
    expect(screen.queryAllByText('data table toolbar')).toHaveLength(0);
  });
  it('can render a single series', () => {
    render(
      <ComboChartCard
        id="combo-chart"
        size={CARD_SIZES.WIDE}
        title="Combochart card test"
        content={{
          xLabel: 'Date',
          yLabel: 'Score',
          series: {
            dataSourceId: 'health',
            label: 'Health',
          },
          comboChartTypes: [
            {
              type: 'area',
              correspondingDatasets: ['Health'],
            },
          ],
          timeDataSourceId: 'date',
        }}
        isExpanded
        isLoading
        isResizable
        values={comboHealthData}
      />
    );
    expect(screen.queryByText(commonOptions.title)).toBeDefined();
  });

  it('is editable, resizable, expanded, and csv download works', () => {
    const { container } = render(
      <ComboChartCard
        id="combo-chart"
        size={CARD_SIZES.SMALL}
        title="Health"
        content={{
          xLabel: 'Date',
          yLabel: 'Score',
          series: {
            dataSourceId: 'health',
            label: 'Health',
          },
          comboChartTypes: [
            {
              type: 'area',
              correspondingDatasets: ['Health'],
            },
          ],
          timeDataSourceId: 'date',
          addSpaceOnEdges: 0,
        }}
        isExpanded
        isResizable
        values={comboHealthData.slice(0, 2)}
      />
    );

    expect(screen.getByText('Date')).toBeInTheDocument();
    // expect(screen.getByText('Score')).toBeInTheDocument();
    expect(container.querySelector('#mock-combo-chart')).toBeInTheDocument();
    userEvent.click(screen.getByLabelText('Download table content'));
    expect(fileDownload).toHaveBeenCalledWith(
      `health,age,condition,rul,date\n83,77,95,92,12/15/2018 00:00:00\n85,78,97,93,12/01/2018 00:00:00\n`,
      `Health.csv`
    );
  });
});
