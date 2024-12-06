import React from 'react';
import { render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { gray50, red50, green50, blue50 } from '@carbon/colors';
import { InformationSquareFilled, InformationFilled } from '@carbon/react/icons';
import userEvent from '@testing-library/user-event';

import { CARD_SIZES, CARD_TYPES } from '../../constants/LayoutConstants';

import landscape from './landscape.jpg';
import HotspotEditorModal from './HotspotEditorModal';
import { hotspotTypes } from './hooks/hotspotStateHook';

const getHotspots = () => [
  {
    x: 75,
    y: 10,
    type: 'text',
    content: { title: 'Storage' },
    backgroundColor: gray50,
    backgroundOpacity: 50,
  },
  {
    x: 35,
    y: 65,
    icon: 'InformationFilled24',
    color: green50,
    content: {
      title: 'My Device',
      description: 'Description',
      attributes: [
        {
          dataItemId: 'temperature',
          dataSourceId: 'temperature',
          label: 'Temp',
          precision: 2,
        },
      ],
    },
  },
  {
    x: 'temp_last',
    y: 'temperature',
    type: 'dynamic',
    content: { title: 'dynamic test title' },
    icon: 'InformationFilled24',
    color: red50,
  },
];

const getCardConfig = () => ({
  content: {
    alt: 'Floor Map',
    image: 'firstfloor',
    src: landscape,
  },
  id: 'floor map picture',
  size: CARD_SIZES.MEDIUM,
  title: 'Floor Map',
  type: CARD_TYPES.IMAGE,
  values: {
    hotspots: getHotspots(),
  },
});

const getSelectableColors = () => [
  { carbonColor: gray50, name: 'gray' },
  { carbonColor: red50, name: 'red' },
  { carbonColor: green50, name: 'green' },
  { carbonColor: blue50, name: 'blue' },
];

const getSelectableIcons = () => [
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

const getDataItems = () => [
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
];

const getDemoDynamicHotspots = () => [
  {
    x: 10,
    y: 30,
  },
  {
    x: 90,
    y: 60,
  },
];

const commonActions = {
  actions: {
    onEditDataItem: jest.fn().mockImplementation(() => []),
    dataSeriesFormActions: {
      hasAggregationsDropDown: jest.fn(
        (editDataItem) =>
          editDataItem?.dataItemType !== 'DIMENSION' && editDataItem?.type !== 'TIMESTAMP'
      ),
      hasDataFilterDropdown: jest.fn(),
      onAddAggregations: jest.fn(),
    },
  },
};

const loading = HotspotEditorModal.defaultProps.i18n.loadingDynamicHotspotsText;

describe('HotspotEditorModal', () => {
  beforeAll(() => {
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 1000, height: 1000 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('shows correct content when the main  tab is clicked', async () => {
    const { i18n } = HotspotEditorModal.defaultProps;
    const onSave = jest.fn();
    const onFetchDynamicDemoHotspots = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
    });

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
        onSave={onSave}
        {...commonActions}
      />
    );

    // Let the callback onFetchDynamicDemoHotspots finish
    await waitFor(() => expect(screen.queryByText(loading)).toBeFalsy());

    expect(screen.getByRole('tab', { name: i18n.fixedTypeDataSourceTabLabelText })).toBeVisible();
    expect(screen.getByRole('tab', { name: i18n.fixedTypeTooltipTabLabelText })).toBeVisible();
    expect(screen.queryByRole('tab', { name: i18n.textStyleLabelText })).not.toBeInTheDocument();

    // Switch main tab to Labels
    userEvent.click(screen.getByRole('tab', { name: i18n.labelsText }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: i18n.textStyleLabelText })).toBeVisible()
    );
    expect(
      screen.queryByRole('tab', { name: i18n.fixedTypeTooltipTabLabelText })
    ).not.toBeInTheDocument();

    // Switch main tab back to Hotspots
    userEvent.click(screen.getByRole('tab', { name: i18n.hotspotsText }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: i18n.fixedTypeTooltipTabLabelText })).toBeVisible()
    );
    expect(screen.getByRole('tab', { name: i18n.fixedTypeDataSourceTabLabelText })).toBeVisible();
    expect(screen.queryByRole('tab', { name: i18n.textStyleLabelText })).not.toBeInTheDocument();
  }, 30000);

  it('should be selectable by testId', async () => {
    const { rerender } = render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={() => {
          return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
        }}
        onSave={jest.fn()}
        testId="hotspot_editor_modal"
        {...commonActions}
      />
    );

    expect(screen.getByTestId('ComposedModal')).toBeDefined();
    expect(screen.getByTestId('hotspot_editor_modal-loading-hotspots')).toBeDefined();

    rerender(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={() => {
          return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
        }}
        onSave={jest.fn()}
        testId="hotspot_editor_modal"
        showTooManyHotspotsInfo
        {...commonActions}
      />
    );

    await waitFor(() => expect(screen.getByTestId('hotspot-35-65')).toBeTruthy());
    expect(screen.getByTestId('ComposedModal')).toBeDefined();
    expect(screen.getByTestId('hotspot_editor_modal-data-source-tab')).toBeDefined();
    expect(screen.getByTestId('dynamic-hotspot-source-picker')).toBeDefined();
    expect(screen.getByTestId('dynamic-hotspot-source-picker-x-coordinate-dropdown')).toBeDefined();
    expect(screen.getByTestId('dynamic-hotspot-source-picker-y-coordinate-dropdown')).toBeDefined();
    expect(screen.getByTestId('hotspot_editor_modal-too-many-hotspots-notification')).toBeDefined();
  });

  it('renders initial hotspots', async () => {
    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={() => {
          return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
        }}
        onSave={jest.fn()}
        {...commonActions}
      />
    );

    await waitFor(() => expect(screen.getByTestId('hotspot-75-10')).toBeTruthy());

    const textHotspot = screen.getByText('Storage');
    expect(textHotspot).toBeVisible();

    const fixedHotspot = screen.getByTestId('hotspot-35-65');
    expect(fixedHotspot).toBeVisible();

    const dynamicHotspot1 = screen.getByTestId('hotspot-10-30');
    const dynamicHotspot2 = screen.getByTestId('hotspot-90-60');
    expect(dynamicHotspot1).toBeVisible();
    expect(dynamicHotspot2).toBeVisible();
  });

  it('disables datasource tab for Hotspots of type "fixed" with element content', async () => {
    const myCardConfig = getCardConfig();
    myCardConfig.values.hotspots = [
      {
        title: 'using element content',
        x: 45,
        y: 25,
        type: 'fixed',
        color: green50,
        content: <span>fixed - content is an element</span>,
      },
      {
        x: 65,
        y: 75,
        type: 'text',
        color: green50,
        content: <span>text - content is an element</span>,
      },
      {
        x: 75,
        y: 10,
        type: 'fixed',
        content: { title: 'Normal' },
      },
    ];
    const dataSourceTabName = 'Data source';

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={myCardConfig}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={() => {
          return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
        }}
        onSave={jest.fn()}
        {...commonActions}
      />
    );

    // Wait for the hotspots to have ben rendered
    await waitFor(() => expect(screen.getByTestId('hotspot-45-25')).toBeTruthy());

    // We use aria-disabled to check if the tab is enabled of not
    expect(screen.getByRole('tab', { name: dataSourceTabName })).toHaveAttribute(
      'aria-disabled',
      'false'
    );

    const fixedHotspotWithElementContent = within(screen.getByTestId('hotspot-45-25')).getByRole(
      'button'
    );
    userEvent.click(fixedHotspotWithElementContent);
    expect(screen.getByText('fixed - content is an element')).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: dataSourceTabName })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );

    expect(screen.queryByLabelText('Data items')).not.toBeInTheDocument();
  });

  it('disables datasource tab for Hotspots of type "text" with element content', async () => {
    const myCardConfig = getCardConfig();
    myCardConfig.values.hotspots = [
      {
        x: 65,
        y: 75,
        type: 'text',
        color: green50,
        content: <span>text - content is an element</span>,
      },
    ];
    const dataSourceTabName = 'Data source';

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={myCardConfig}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={() => {
          return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
        }}
        onSave={jest.fn()}
        {...commonActions}
      />
    );

    // Wait for the hotspots to have ben rendered
    await waitFor(() => expect(screen.getByTestId('hotspot-65-75')).toBeTruthy());

    // We use aria-disabled to check if the tab is enabled of not
    expect(screen.getByRole('tab', { name: dataSourceTabName })).toHaveAttribute(
      'aria-disabled',
      'false'
    );

    const textHotspotWithElementContent = within(screen.getByTestId('hotspot-65-75')).getByRole(
      'complementary'
    );
    userEvent.click(textHotspotWithElementContent);
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: dataSourceTabName })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );

    expect(screen.queryByLabelText('Data items')).not.toBeInTheDocument();
  });

  it('exports cardConfig with initial settings', async () => {
    const onSave = jest.fn();
    const onFetchDynamicDemoHotspots = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
    });

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
        onSave={onSave}
        {...commonActions}
      />
    );

    // Let the callback onFetchDynamicDemoHotspots finish
    await waitFor(() => expect(screen.queryByText(loading)).toBeFalsy());

    expect(onFetchDynamicDemoHotspots).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(getCardConfig());
  });

  it('exports cardConfig with modified dynamic hotspot settings', async () => {
    const onSave = jest.fn();
    const onFetchDynamicDemoHotspots = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => resolve(getDemoDynamicHotspots()));
    });
    const [sourceTempLast, sourceTemperature, sourcePressure] = getDataItems();

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={getCardConfig()}
        dataItems={getDataItems()}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
        onSave={onSave}
        {...commonActions}
      />
    );

    // Let the callback onFetchDynamicDemoHotspots finish
    await waitFor(() => expect(screen.queryByText(loading)).toBeFalsy());

    // Select one of the dynamic demo hotspots
    userEvent.click(within(screen.getByTestId('hotspot-10-30')).getByRole('button'));
    // The initial dynamic hotspot title is showing
    const titleInputElement = screen.getByDisplayValue('dynamic test title');

    // click in the input to focus on it.
    userEvent.click(titleInputElement);

    expect(titleInputElement).toHaveValue('dynamic test title');

    // Modify the title and verify the result
    userEvent.type(titleInputElement, ' - modified');
    expect(titleInputElement).toHaveValue('dynamic test title - modified');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          hotspots: expect.arrayContaining([
            expect.objectContaining({
              content: { title: 'dynamic test title - modified' },
            }),
          ]),
        }),
      })
    );

    // Selecting a new data source for x/y will clear existing dynamic
    // hotspot content
    // open source x dropdown
    fireEvent.click(screen.getByText(sourceTempLast.label));
    // select pressure alternative
    fireEvent.click(screen.getAllByText(sourcePressure.label)[0]);
    await waitFor(() => expect(screen.queryByText(loading)).toBeFalsy());
    // open source y dropdown
    fireEvent.click(screen.getByText(sourceTemperature.label));
    // select pressure alternative
    fireEvent.click(screen.getAllByText(sourcePressure.label)[1]);
    await waitFor(() => expect(screen.queryByText(loading)).toBeFalsy());

    // Select one of the dynamic demo hotspots
    userEvent.click(within(screen.getByTestId('hotspot-10-30')).getByRole('button'));

    const emptyTitleInputElement = screen.getByTitle('Enter title for the tooltip');

    // click in the input to focus on it.
    userEvent.click(emptyTitleInputElement);

    userEvent.type(emptyTitleInputElement, 'new test title');

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          hotspots: expect.arrayContaining([
            {
              content: { title: 'new test title' },
              type: 'dynamic',
              x: sourcePressure.dataSourceId,
              y: sourcePressure.dataSourceId,
            },
          ]),
        }),
      })
    );
  }, 30000);

  it('exports cardConfig with modified static hotspot settings', async () => {
    const onSave = jest.fn();
    const myCardConfig = {
      ...getCardConfig(),
      values: {
        hotspots: getHotspots().filter((hotspot) => hotspot.type !== hotspotTypes.DYNAMIC),
      },
    };

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={myCardConfig}
        dataItems={[]}
        getValidDataItems={getDataItems}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={jest.fn()}
        onSave={onSave}
        {...commonActions}
      />
    );

    await waitFor(() => expect(screen.getByTestId('hotspot-35-65')).toBeTruthy());

    // Select one of the fixed demo hotspots
    userEvent.click(within(screen.getByTestId('hotspot-35-65')).getByRole('button'));
    // The initial fixed hotspot title is showing
    const titleInputElement = screen.getByDisplayValue('My Device');

    // Click anywhere to remove focus the selected hotspot
    fireEvent.click(screen.getAllByRole('link', { name: /focus sentinel/i })[0]);

    // Modify the title and verify the result
    userEvent.type(titleInputElement, ' - modified');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Change to the data source tab
    fireEvent.click(screen.getByText('Data source'));

    // Add the data item alternative 'pressure'
    fireEvent.click(screen.getByText('Select data items'));
    fireEvent.click(screen.getByRole('option', { name: /pressure/i }));

    await fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Add threshold' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          hotspots: expect.arrayContaining([
            expect.objectContaining({
              content: expect.objectContaining({
                attributes: expect.arrayContaining([
                  {
                    dataItemId: 'temperature',
                    dataSourceId: 'temperature',
                    label: 'Temp',
                    precision: 2,
                  },
                  {
                    dataItemId: 'pressure',
                    dataSourceId: 'pressure',
                    label: 'Pressure',
                    unit: 'psi',
                    thresholds: [
                      {
                        color: '#da1e28',
                        comparison: '>',
                        dataSourceId: 'pressure',

                        value: 0,
                      },
                    ],
                  },
                ]),
              }),
            }),
          ]),
        }),
      })
    );
  });

  it('exports cardConfig with modified text hotspot settings', async () => {
    const onSave = jest.fn();
    const myCardConfig = {
      ...getCardConfig(),
      values: {
        hotspots: getHotspots().filter((hotspot) => hotspot.type !== hotspotTypes.DYNAMIC),
      },
    };

    render(
      <HotspotEditorModal
        backgroundColors={getSelectableColors()}
        borderColors={getSelectableColors()}
        cardConfig={myCardConfig}
        dataItems={[]}
        getValidDataItems={getDataItems}
        defaultHotspotType="fixed"
        fontColors={getSelectableColors()}
        hotspotIconFillColors={getSelectableColors()}
        hotspotIcons={getSelectableIcons()}
        label={landscape}
        onClose={jest.fn()}
        onFetchDynamicDemoHotspots={jest.fn()}
        onSave={onSave}
        showTooManyHotspotsInfo
        {...commonActions}
      />
    );

    await waitFor(() => expect(screen.getByTestId('hotspot-75-10')).toBeTruthy());

    fireEvent.click(screen.getByRole('tab', { name: /Labels/i }));
    userEvent.click(screen.getByText('Storage'));
    userEvent.click(screen.getByTestId('hotspot-bold'));

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          hotspots: expect.arrayContaining([
            expect.objectContaining({
              type: hotspotTypes.TEXT,
              bold: true,
            }),
          ]),
        }),
      })
    );
  });
});
