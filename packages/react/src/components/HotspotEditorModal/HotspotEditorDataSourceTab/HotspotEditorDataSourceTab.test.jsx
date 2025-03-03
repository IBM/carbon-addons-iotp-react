import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CARD_TYPES } from '../../../constants/LayoutConstants';
import {
  dashboardEditorActions as commonActions,
  dataSeriesFormActions,
} from '../../DashboardEditor/dashboardEditorMockData';

import HotspotEditorDataSourceTab from './HotspotEditorDataSourceTab';

const dataItems = [
  {
    dataItemId: 'temp_last',
    dataSourceId: 'temp_last',
    label: '{high} temp',
    unit: '{unitVar}',
  },
  {
    dataItemId: 'temperature',
    dataSourceId: 'temperature',
    label: 'Temperature',
    unit: '°',
  },
  {
    dataItemId: 'pressure',
    dataSourceId: 'pressure',
    label: 'Pressure',
    unit: 'psi',
  },
  {
    dataItemId: 'elevators',
    dataSourceId: 'elevators',
    label: 'Elevators',
    unit: 'floor',
  },
  {
    dataItemId: 'other_metric',
    dataSourceId: 'other_metric',
    label: 'Other metric',
    unit: 'lbs',
  },
];

const dataItemsV2 = [
  {
    dataItemId: 'temp_last',
    dataSourceId: 'temp_last',
    label: '{high} temp',
    unit: '{unitVar}',
    hasStreamingMetricEnabled: true,
  },
  {
    dataItemId: 'elevators',
    dataSourceId: 'elevators',
    label: 'Elevators',
    unit: 'floor',
    hasStreamingMetricEnabled: true,
  },
];

let cardConfigWithPresets;

describe('HotspotEditorDataSourceTab', () => {
  beforeEach(() => {
    cardConfigWithPresets = {
      type: CARD_TYPES.IMAGE,
      content: {
        hotspots: [
          {
            title: 'elevators',
            content: {
              attributes: [
                {
                  dataItemId: 'temp_last',
                  dataSourceId: 'temp_last',
                  label: '{high} temp',
                  unit: '{unitVar}',
                },
                {
                  dataItemId: 'elevators',
                  dataSourceId: 'elevators',
                  label: 'Elevators',
                  unit: 'floor',
                },
              ],
            },
          },
        ],
      },
    };
  });

  it('calls onChange & removes attribute when existig item is clicked in multiselect', () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        title="elevators"
        cardConfig={cardConfigWithPresets}
        dataItems={dataItems}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: /select data items/i,
      })
    );
    const options = screen.getByRole('option', { name: /elevators/i });
    userEvent.click(options);
    // Card config with the elevators hotspot removed
    expect(onChange).toHaveBeenCalledWith({
      attributes: [
        {
          dataItemId: 'temp_last',
          dataSourceId: 'temp_last',
          label: '{high} temp',
          unit: '{unitVar}',
        },
      ],
    });
  });

  it('calls onChange & adds attribute when new item is clicked in multiselect', () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        cardConfig={cardConfigWithPresets}
        dataItems={dataItems}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: /select data items/i,
      })
    );
    userEvent.click(screen.getByRole('option', { name: /Other metric/i }));

    // Card config with the elevators hotspot removed
    expect(onChange).toHaveBeenCalledWith({
      attributes: [
        {
          dataItemId: 'temp_last',
          dataSourceId: 'temp_last',
          label: '{high} temp',
          unit: '{unitVar}',
        },
        {
          dataItemId: 'elevators',
          dataSourceId: 'elevators',
          label: 'Elevators',
          unit: 'floor',
        },
        {
          dataItemId: 'other_metric',
          dataSourceId: 'other_metric',
          label: 'Other metric',
          unit: 'lbs',
        },
      ],
    });
  });

  it('pops the data items modal with downsample methods', async () => {
    const onChange = jest.fn();
    const commonActionsWithData = {
      actions: {
        onEditDataItem: jest.fn().mockImplementation(() => [
          { id: 'none', text: 'None' },
          { id: 'max', text: 'Maximum' },
          { id: 'min', text: 'Minimum' },
        ]),
        dataSeriesFormActions,
      },
    };
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        cardConfig={cardConfigWithPresets}
        dataItems={dataItemsV2}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActionsWithData}
      />
    );
    userEvent.click(screen.getAllByRole('button')[2]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
  it('pops the data items modal without downsample methods', async () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        cardConfig={cardConfigWithPresets}
        dataItems={dataItemsV2}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(screen.getAllByRole('button')[2]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('calls onChange with the new threshold for particular data item', async () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        cardConfig={cardConfigWithPresets}
        dataItems={dataItems}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActions}
      />
    );

    // edit button
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    userEvent.click(
      screen.getByRole('button', {
        name: HotspotEditorDataSourceTab.defaultProps.i18n.dataItemEditorDataItemAddThreshold,
      })
    );
    // save
    userEvent.click(screen.getByRole('button', { name: 'Update' }));
    // Card config with the elevators hotspot removed
    expect(onChange).toHaveBeenCalledWith({
      dataItemId: 'temp_last',
      dataSourceId: 'temp_last',
      label: '{high} temp',
      unit: '{unitVar}',
      thresholds: [
        {
          color: '#da1e28',
          comparison: '>',
          dataSourceId: 'temp_last',
          value: 0,
        },
      ],
    });
  });

  it('calls onChange with the new threshold that has a dataSourceId', async () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorDataSourceTab
        hotspot={cardConfigWithPresets.content.hotspots[0]}
        cardConfig={cardConfigWithPresets}
        dataItems={dataItems}
        onChange={onChange}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    // edit button
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    // add threshold
    userEvent.click(screen.getByRole('button', { name: 'Add threshold' }));
    // increment value of threshold
    userEvent.click(screen.getByTitle('Increment number'));
    // save
    userEvent.click(screen.getByRole('button', { name: 'Update' }));
    // Card config with the elevators hotspot removed
    expect(onChange).toHaveBeenCalledWith({
      dataItemId: 'temp_last',
      dataSourceId: 'temp_last',
      label: '{high} temp',
      unit: '{unitVar}',
      thresholds: [
        {
          color: '#da1e28',
          comparison: '>',
          dataSourceId: 'temp_last',
          value: 1,
        },
      ],
    });
  });

  it('correctly preselects data items with custom labels', () => {
    const customLabel = 'Temperature Celsius';
    render(
      <HotspotEditorDataSourceTab
        hotspot={{
          title: 'elevators',
          content: {
            attributes: [
              {
                dataItemId: 'temperature',
                dataSourceId: 'temperature',
                label: customLabel,
                unit: '°',
              },
            ],
          },
        }}
        thresholds={cardConfigWithPresets.thresholds || []}
        cardConfig={cardConfigWithPresets}
        dataItems={[
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature',
            label: 'Temperature', // standard label
            unit: '°',
          },
        ]}
        onChange={() => {}}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: /select data items/i,
      })
    );

    expect(
      within(screen.getByRole('option', { name: customLabel })).getByText(customLabel)
    ).toHaveAttribute('data-contained-checkbox-state', 'true');
  });

  it('multiselect handles changes to hotspot.content.attributes prop', () => {
    const { rerender } = render(
      <HotspotEditorDataSourceTab
        hotspot={{
          title: 'elevators',
          content: {
            attributes: [],
          },
        }}
        thresholds={cardConfigWithPresets.thresholds || []}
        cardConfig={cardConfigWithPresets}
        dataItems={[
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature',
            label: 'Temperature',
            unit: '°',
          },
        ]}
        onChange={() => {}}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: /select data items/i,
      })
    );

    expect(screen.getByRole('option', { name: /Temperature/i })).toBeVisible();

    rerender(
      <HotspotEditorDataSourceTab
        hotspot={{
          title: 'elevators',
          content: {
            attributes: [
              {
                dataItemId: 'temperature',
                dataSourceId: 'temperature',
                label: 'Modified Label', // This is modified
                unit: '°',
              },
            ],
          },
        }}
        thresholds={cardConfigWithPresets.thresholds || []}
        cardConfig={cardConfigWithPresets}
        dataItems={[
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature',
            label: 'Temperature',
            unit: '°',
          },
        ]}
        onChange={() => {}}
        translateWithId={() => {}}
        {...commonActions}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: /select data items/i,
      })
    );

    expect(screen.getByRole('option', { name: /Modified Label/i })).toBeVisible();
  });
});
