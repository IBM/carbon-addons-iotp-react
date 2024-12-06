import { mount } from 'enzyme';
import React from 'react';
import { Add } from '@carbon/react/icons';
import { render, screen, waitFor } from '@testing-library/react';

import { CARD_SIZES, CARD_TYPES, COLORS } from '../../constants/LayoutConstants';
import { tableColumns, tableData } from '../../utils/sample';
import imageFile from '../ImageCard/landscape.jpg';

import Dashboard from './Dashboard';

const CustomIcon = () => <div>Custom element</div>;
const cardValues = [
  {
    title: 'Alerts (Section 1)',
    id: 'facilitycard-value',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.VALUE,
    isExpanded: true,
    content: {
      title: 'Alerts',
      attributes: [
        { label: 'Sev 3', dataSourceId: 'data', color: COLORS.RED },
        { label: 'Sev 2', dataSourceId: 'data2', color: COLORS.PURPLE },
        { label: 'Sev 1', dataSourceId: 'data3', color: COLORS.BLUE },
      ],
    },
    dataSource: {},
  },
  {
    title: 'Alerts (Section 2)',
    tooltip: 'This view showcases the variety of alert severities present in your context.',
    id: 'facilitycard-pie',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.PIE,
    availableActions: {
      delete: true,
    },
    content: {
      title: 'Alerts',
      data: [
        { label: 'Sev 3', value: 2, color: COLORS.RED },
        { label: 'Sev 2', value: 7, color: COLORS.PURPLE },
        { label: 'Sev 1', value: 32, color: COLORS.BLUE },
      ],
    },
    dataSource: {},
  },
  {
    title: 'Alerts',
    id: 'alert-table1',
    size: CARD_SIZES.LARGE,
    type: CARD_TYPES.TABLE,
    availableActions: {
      expand: true,
    },
    content: {
      data: tableData,
      columns: tableColumns,
    },
    dataSource: {},
  },
  {
    title: 'Floor Map',
    id: 'floor map picture',
    size: CARD_SIZES.MEDIUM,
    type: CARD_TYPES.IMAGE,
    onSetupCard() {
      return { ...cardValues[3] };
    },
    availableActions: {
      range: true,
    },
    content: {
      alt: 'Floor Map',
      image: 'firstfloor',
      src: imageFile,
    },
    dataSource: {},
    values: {
      hotspots: [
        {
          x: 35,
          y: 65,
          icon: 'arrowDown',
          content: <span style={{ padding: '10px' }}>Elevators</span>,
        },
        {
          x: 45,
          y: 25,
          color: '#0f0',
          content: <span style={{ padding: '10px' }}>Stairs</span>,
        },
        {
          x: 45,
          y: 50,
          color: '#00f',
          content: <span style={{ padding: '10px' }}>Vent Fan</span>,
        },
        {
          x: 45,
          y: 75,
          icon: 'arrowUp',
          content: <span style={{ padding: '10px' }}>Humidity Sensor</span>,
        },
      ],
    },
  },
  {
    title: 'Alerts (Section 1)',
    id: 'facilitycard-donut',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.DONUT,
    availableActions: {
      delete: true,
    },
    content: {
      title: 'Alerts',
      data: [
        { label: 'Sev 3', value: 6, color: COLORS.RED },
        { label: 'Sev 2', value: 9, color: COLORS.PURPLE },
        { label: 'Sev 1', value: 18, color: COLORS.BLUE },
      ],
    },
    dataSource: {},
  },
];

const onClick = jest.fn();
jest.spyOn(console, 'error').mockImplementation(() => {});
let wrapper = mount(
  <Dashboard
    description="This is a description for this Dashboard"
    title="My Dashboard"
    layouts={{ lg: [{ id: 'bogus', x: 0, y: 0 }] }}
    actions={[
      { id: 'edit', labelText: 'Edit', icon: 'edit' },
      { id: 'add', labelText: 'Add', icon: <Add size={20} /> },
      {
        id: 'custom',
        labelText: 'Custom',
        customActionComponent: <CustomIcon />,
      },
    ]}
    cards={cardValues}
    onDashboardAction={onClick}
    testId="DASHBOARD"
  />
);
describe('Dashboard', () => {
  it('should be selectable with testId', () => {
    render(
      <Dashboard
        description="This is a description for this Dashboard"
        title="My Dashboard"
        layouts={{ lg: [{ id: 'bogus', x: 0, y: 0 }] }}
        actions={[
          { id: 'edit', labelText: 'Edit', icon: 'edit' },
          { id: 'add', labelText: 'Add', icon: <Add size={20} /> },
          {
            id: 'custom',
            labelText: 'Custom',
            customActionComponent: <CustomIcon />,
          },
        ]}
        cards={cardValues}
        onDashboardAction={onClick}
        testId="DASHBOARD"
      />
    );

    expect(screen.getByTestId('DASHBOARD')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD-header')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD-grid')).toBeDefined();
  });
  it('verify dashboard still renders with bad layout', () => {
    // should still render even with incorrect layout
    expect(wrapper).toBeDefined();
  });

  it('verify onDashboardAction is called on click', () => {
    wrapper.find('#action-icon--edit').at(1).simulate('click');
    expect(wrapper.prop('onDashboardAction')).toHaveBeenCalled();
  });

  it('verify onFetchData is called by each card if loading changes to true', () => {
    return new Promise(async (done, reject) => {
      try {
        const mockOnFetchData = jest.fn().mockImplementation((card) => Promise.resolve(card));

        const mockOnSetRefresh = jest.fn().mockImplementation((refreshDate) => {
          if (refreshDate) {
            // Wait for the final set refresh call to exit the testcase
            done();
          }
        });
        const mockSetIsLoading = jest.fn();

        const { rerender } = render(
          <Dashboard
            title="My Dashboard"
            layouts={{ lg: [{ id: 'bogus', x: 0, y: 0 }] }}
            actions={[
              { id: 'edit', labelText: 'Edit', icon: 'edit' },
              { id: 'add', labelText: 'Add', icon: <Add size={20} /> },
            ]}
            cards={cardValues}
            onDashboardAction={onClick}
            hasLastUpdated={false}
            onFetchData={mockOnFetchData}
            onSetRefresh={mockOnSetRefresh}
            setIsLoading={mockSetIsLoading}
          />
        );
        rerender(
          <Dashboard
            isLoading
            title="My Dashboard"
            layouts={{ lg: [{ id: 'bogus', x: 0, y: 0 }] }}
            actions={[
              { id: 'edit', labelText: 'Edit', icon: 'edit' },
              { id: 'add', labelText: 'Add', icon: <Add size={20} /> },
            ]}
            cards={cardValues}
            onDashboardAction={onClick}
            hasLastUpdated={false}
            onFetchData={mockOnFetchData}
            onSetRefresh={mockOnSetRefresh}
            setIsLoading={mockSetIsLoading}
          />
        );

        await waitFor(() => expect(mockOnFetchData).toHaveBeenCalledTimes(5));
      } catch (e) {
        reject(e);
      }
    });
  });
  it('verify onLayoutChange is called when the dashboard renders', () => {
    const mockOnLayoutChange = jest.fn();

    wrapper = mount(
      <Dashboard
        title="My Dashboard"
        layouts={{ lg: [{ id: 'bogus', x: 0, y: 0 }] }}
        actions={[
          { id: 'edit', labelText: 'Edit', icon: 'edit' },
          { id: 'add', labelText: 'Add', icon: <Add size={20} /> },
        ]}
        cards={cardValues}
        onDashboardAction={onClick}
        hasLastUpdated={false}
        onLayoutChange={mockOnLayoutChange}
      />
    );
    expect(mockOnLayoutChange).toHaveBeenCalled();
  });
});
