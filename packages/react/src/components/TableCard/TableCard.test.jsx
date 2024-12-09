import React from 'react';
import { render, within, screen, createEvent, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bee32 } from '@carbon/icons-react';
import fileDownload from 'js-file-download';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { tableColumns, tableData, actions2, actions1 } from '../../utils/sample';

import TableCard from './TableCard';

jest.mock('js-file-download');

describe('TableCard', () => {
  it('should be selectable by testID or testId', () => {
    const onCardAction = jest.fn();

    const tableDataWithActions = tableData.map((item) => {
      return {
        ...item,
        actions: actions2,
      };
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <TableCard
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );
    expect(screen.getByTestId('TABLE_CARD')).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      `Warning: The 'testID' prop has been deprecated. Please use 'testId' instead.`
    );
    console.error.mockReset();

    rerender(
      <TableCard
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testId="table_card"
      />
    );
    expect(screen.getByTestId('table_card')).toBeDefined();
  });

  it('Row specific link variables populate correctly', () => {
    const tableLinkColumns = [
      ...tableColumns,
      {
        dataSourceId: 'deviceId',
        label: 'deviceId',
      },
      {
        dataSourceId: 'Link',
        label: 'Link',
        linkTemplate: {
          href: 'https://ibm.com/{deviceId}',
          target: '_blank',
        },
      },
    ];

    // introduce row specific deviceId data
    const deviceidRowData = [
      '73000',
      '73000',
      '73001',
      '73000',
      '73002',
      '73004',
      '73004',
      '73003',
      '73005',
      '73003',
      '73005',
    ];

    const tableLinkData = tableData.map((row, i) => {
      return {
        ...row,
        values: {
          ...row.values,
          deviceId: deviceidRowData[i],
          Link: 'Link',
        },
      };
    });

    const thresholds = [
      {
        dataSourceId: 'pressure',
        comparison: '>=',
        value: 1,
        severity: 1,
        label: 'Pressure',
        showSeverityLabel: true,
        severityLabel: 'Critical',
      },
    ];

    render(
      <TableCard
        title="{assetId} Open Alerts"
        id="table-list"
        tooltip="Here's a Tooltip"
        content={{
          columns: tableLinkColumns,
          thresholds,
        }}
        values={tableLinkData}
        size={CARD_SIZES.LARGE}
        cardVariables={{ assetId: 'the best asset' }}
      />
    );
    expect(screen.getAllByText('Link').length).toEqual(11);
    expect(document.querySelector('a').getAttribute('href')).toEqual('https://ibm.com/73003');
  });

  it('Clicked row actions', () => {
    const onCardAction = jest.fn();

    const tableDataWithActions = tableData.map((item) => {
      return {
        ...item,
        actions: actions2,
      };
    });

    render(
      <TableCard
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
      />
    );

    userEvent.click(screen.getAllByLabelText('open')[0]);
    expect(onCardAction.mock.calls).toHaveLength(1);
  });

  describe('Columns displayed', () => {
    it('XLarge', () => {
      const { container } = render(
        <TableCard
          title="Open Alerts"
          content={{
            columns: tableColumns,
          }}
          values={tableData}
          size={CARD_SIZES.LARGEWIDE}
        />
      );
      expect(container.querySelectorAll('th').length).toBe(tableColumns.length);
    });

    it('Large', () => {
      const { container } = render(
        <TableCard
          title="Open Alerts"
          content={{
            columns: tableColumns,
          }}
          values={tableData}
          size={CARD_SIZES.LARGE}
        />
      );

      const totalColumns = tableColumns.filter(
        (item) => item.priority === 1 || item.priority === 2
      );
      expect(container.querySelectorAll('th').length).toBe(totalColumns.length);
    });
    it('Large with actions', () => {
      const tableDataWithActions = tableData.map((item) => {
        return {
          ...item,
          actions: actions2,
        };
      });

      const { container } = render(
        <TableCard
          title="Open Alerts"
          content={{
            columns: tableColumns,
          }}
          values={tableDataWithActions}
          size={CARD_SIZES.LARGE}
        />
      );

      const totalColumns = tableColumns.filter(
        (item) => item.priority === 1 || item.priority === 2
      );
      expect(container.querySelectorAll('th').length).toBe(totalColumns.length + 1); // +1 for action column
    });
  });

  it('Columns should use custom render fuction when present', () => {
    const mockRenderFunc = jest.fn(() => {
      return <p className="myCustomRenderedCell" />;
    });
    const columnWithRenderFunction = [
      {
        dataSourceId: 'alert',
        label: 'Alert',
        priority: 1,
        renderDataFunction: mockRenderFunc,
      },
      {
        dataSourceId: 'hour',
        label: 'Hour',
        priority: 2,
        type: 'TIMESTAMP',
      },
    ];
    const { container, rerender } = render(
      <TableCard
        title="Open Alerts"
        content={{
          columns: columnWithRenderFunction,
        }}
        values={[tableData[0]]}
        size={CARD_SIZES.LARGE}
      />
    );
    expect(container.querySelectorAll('.myCustomRenderedCell').length).toBe(1);
    expect(mockRenderFunc).toHaveBeenCalledWith({
      columnId: 'alert',
      row: {
        alert: 'AHI005 Asset failure',
        count: 1.2039201932,
        hour: '07/23/2019 05:26:10',
        long_description: 'long description for a given event payload',
        pressure: 0,
      },
      rowId: 'row-1',
      value: 'AHI005 Asset failure',
    });

    const columnNormal = [
      {
        dataSourceId: 'alert',
        label: 'Alert 2',
        priority: 1,
      },
    ];
    rerender(
      <TableCard
        title="Open Alerts"
        content={{
          columns: columnNormal,
        }}
        values={[tableData[0]]}
        size={CARD_SIZES.LARGE}
      />
    );
    expect(container.querySelectorAll('.myCustomRenderedCell').length).toBe(0);
  });

  describe('thresholds', () => {
    it('threshold columns should render in correct column regardless of order', () => {
      // The pressure header comes after the count header, but the ordering should not matter when
      // it comes to rendering the threshold columns
      const customThresholds = [
        {
          dataSourceId: 'pressure',
          comparison: '>=',
          value: 10,
          severity: 1,
          icon: 'bee',
          color: 'black',
          label: 'Pressure Sev',
        },
        {
          dataSourceId: 'count',
          comparison: '<',
          value: 5,
          severity: 3,
        },
        {
          dataSourceId: 'count',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '=',
          value: 7,
          severity: 2,
        },
      ];
      render(
        <TableCard
          id="table-list"
          title="Open Alerts"
          content={{
            columns: tableColumns,
            thresholds: customThresholds,
          }}
          values={tableData}
          size={CARD_SIZES.LARGEWIDE}
        />
      );

      // If the ordering was being affected, Count Severity would not appear. Instead, Pressure Severity would appear
      expect(screen.getByTitle('Count Severity')).toBeInTheDocument();
      expect(screen.queryByTitle('Pressure Severity')).not.toBeInTheDocument();
      expect(screen.getByTitle('Pressure Sev')).toBeInTheDocument();
    });

    it('threshold columns should render in correct column regardless of quantity', () => {
      // If there are more than 2 thresholds, they should still render to the left of the datasource column
      const customThresholds = [
        {
          dataSourceId: 'pressure',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '<',
          value: 5,
          severity: 3,
        },
        {
          dataSourceId: 'count',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '=',
          value: 7,
          severity: 2,
        },
        {
          dataSourceId: 'hour',
          comparison: '<',
          value: 1563877570000,
          severity: 1, // High threshold, medium, or low used for sorting and defined filtration
        },
      ];
      // First the component needs to be rendered
      render(
        <TableCard
          id="table-list"
          title="Open Alerts"
          content={{
            columns: tableColumns,
            thresholds: customThresholds,
          }}
          values={tableData}
          size={CARD_SIZES.LARGEWIDE}
        />
      );

      // Then get all of the th elements. This is how the ordering will be determined
      const tableHeader = document.getElementsByTagName('th');
      // The within function comes in SUPER handy here
      const countSeverityIndex = 1;
      const { getByText } = within(tableHeader[countSeverityIndex]);
      expect(getByText('Count Severity')).toBeTruthy();

      const hourSeverityIndex = 3;
      within(tableHeader[hourSeverityIndex]);
      expect(screen.getByText('Hour Severity')).toBeTruthy();

      const pressureSeverityIndex = 5;
      within(tableHeader[pressureSeverityIndex]);
      expect(screen.getByText('Pressure Severity')).toBeTruthy();
    });

    it('threshold icon labels should not display when showSeverityLabel is false', () => {
      const customThresholds = [
        {
          dataSourceId: 'pressure',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '<',
          value: 5,
          severity: 3,
          showSeverityLabel: false,
        },
        {
          dataSourceId: 'count',
          comparison: '=',
          value: 7,
          severity: 2,
          showSeverityLabel: false,
        },
      ];
      render(
        <TableCard
          id="table-list"
          title="Open Alerts"
          content={{
            columns: tableColumns,
            thresholds: customThresholds,
            expandedRows: [
              {
                id: 'pressure',
                label: 'Pressure',
              },
            ],
          }}
          values={tableData}
          size={CARD_SIZES.LARGEWIDE}
        />
      );

      // The Pressure threshold is the only threshold that has a 'Critical' severity
      // and doesn't have showSeverityLabel: false, so it should be the only severity text to appear
      expect(screen.queryAllByText(/Critical/g)).toHaveLength(3);
      expect(screen.queryByText(/Moderate/g)).not.toBeInTheDocument();
      expect(screen.queryByText(/Low/g)).not.toBeInTheDocument();
    });
    it('threshold icon label should not display default strings', () => {
      const customThresholds = [
        {
          dataSourceId: 'pressure',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '<',
          value: 5,
          severity: 3,
          severityLabel: 'Lowest',
        },
        {
          dataSourceId: 'count',
          comparison: '=',
          value: 7,
          severity: 2,
          severityLabel: 'Medium',
        },
      ];
      render(
        <TableCard
          id="table-list"
          title="Open Alerts"
          content={{
            columns: tableColumns,
            thresholds: customThresholds,
          }}
          values={tableData}
          size={CARD_SIZES.LARGE}
        />
      );

      // Critical should exist as that is the only threshold that doesn't have custom label text
      expect(screen.queryAllByText(/^Critical$/g)).toHaveLength(3);
      // These are default labels, so they should not exist
      expect(screen.queryByText(/^Moderate$/g)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Low$/g)).not.toBeInTheDocument();
      // These are the custom labels that should appear instead of the defaults above
      expect(screen.queryAllByText(/^Medium$/g)).toHaveLength(1);
      expect(screen.queryAllByText(/^Lowest$/g)).toHaveLength(5);
    });

    it('can be resized without crashing', () => {
      const { rerender } = render(
        <TableCard
          id="table-list"
          title="Testing resize"
          content={{
            columns: tableColumns,
          }}
          values={tableData}
          size={CARD_SIZES.LARGE}
        />
      );

      rerender(
        <TableCard
          id="table-list"
          title="Testing resize"
          content={{
            columns: tableColumns,
          }}
          values={tableData}
          size={CARD_SIZES.LARGEWIDE}
        />
      );

      rerender(
        <TableCard
          id="table-list"
          title="Testing resize"
          content={{
            columns: tableColumns,
          }}
          values={tableData}
          size={CARD_SIZES.LARGE}
        />
      );

      expect(screen.getByText('Testing resize')).toBeInTheDocument();
    });
  });

  it('last column is not dublicated when changeing sizes', () => {
    const { rerender } = render(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGE}
      />
    );

    rerender(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGEWIDE}
      />
    );

    rerender(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGE}
      />
    );

    expect(screen.queryAllByText('Pressure')).toHaveLength(1);
  });

  it('can accept filter options', () => {
    const { container } = render(
      <TableCard
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        filters={[{ columnId: 'alert', value: 'failure' }]}
        size={CARD_SIZES.LARGE}
      />
    );

    const totalRows = tableData.filter((item) => item.values.alert.match(/failure/));
    expect(container.querySelectorAll('tr').length).toBe(totalRows.length + 1); // +1 for action column
  });

  it('hides low priority columns for LARGE and LARGETHIN sizes', () => {
    const { rerender } = render(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGE}
      />
    );

    // Column Count has priority 3 so it should be hidden
    expect(screen.queryAllByTitle('Count')).toHaveLength(0);

    rerender(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGEWIDE}
      />
    );

    expect(screen.queryAllByTitle('Count')).toHaveLength(1);
  });

  it('shows toolbar expand button only when low priority columns are hidden', () => {
    const { rerender } = render(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGE}
      />
    );
    expect(screen.getByTitle('Expand to fullscreen')).toBeVisible();

    rerender(
      <TableCard
        id="table-list"
        title="Testing resize"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        size={CARD_SIZES.LARGEWIDE}
      />
    );

    expect(screen.queryAllByTitle('Expand to fullscreen')).toHaveLength(0);
  });

  describe('i18n', () => {
    const content = {
      columns: tableColumns.map((item) =>
        item.dataSourceId === 'count' ? { ...item, precision: 3 } : { ...item }
      ),
      thresholds: [
        {
          dataSourceId: 'count',
          comparison: '<',
          value: 5,
          severity: 3,
        },
        {
          dataSourceId: 'count',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
        {
          dataSourceId: 'count',
          comparison: '=',
          value: 7,
          severity: 2,
        },
        {
          dataSourceId: 'pressure',
          comparison: '>=',
          value: 10,
          severity: 1,
        },
      ],
      expandedRows: [
        {
          id: 'hour',
          label: 'Time',
          type: 'TIMESTAMP',
        },
      ],
    };

    const i18n = {
      criticalLabel: '__Critical__',
      moderateLabel: '__Moderate__',
      lowLabel: '__Low__',
      selectSeverityPlaceholder: '__Select a severity__',
      severityLabel: '__Severity__',
      searchLabel: '__Search__',
      searchPlaceholder: '__Search__',
      filterButtonAria: '__Filters__',
      defaultFilterStringPlaceholdText: '__Type and hit enter to apply__',
      pageBackwardAria: '__Previous page__',
      pageForwardAria: '__Next page__',
      pageNumberAria: '__Page Number__',
      itemsRangeWithTotal: (min, max, total) => `__${min}–${max} of ${total} items__`,
      pageRange: (current, total) => `__${current} of ${total} pages__`,
      clickToExpandAria: '__Click to expand content__',
      clickToCollapseAria: '__Click to collapse content__',
      clearAllFilters: '__Clear all filters__',
      clearFilterAria: '__Clear filter__',
      filterAria: '__Filter__',
      openMenuAria: '__Open menu__',
      closeMenuAria: '__Close menu__',
      clearSelectionAria: '__Clear selection__',
      emptyMessage: '__There is no data__',
      emptyMessageWithFilters: '__No results match the current filters__',
      emptyButtonLabel: '__Create some data__',
      emptyButtonLabelWithFilters: '__Clear all filters__',
      inProgressText: '__In Progress__',
      actionFailedText: '__Action Failed__',
      learnMoreText: '__Learn More__',
      dismissText: '__Dismiss__',
      downloadIconDescription: '__Download table content__',
    };

    it('manages i18n correctly', () => {
      render(
        <TableCard
          id="table-i18n"
          title="Testing i18n"
          content={content}
          size={CARD_SIZES.LARGEWIDE}
          values={tableData}
          i18n={i18n}
        />
      );

      expect(screen.queryAllByText('__Critical__')[0]).toBeInTheDocument();
      expect(screen.queryAllByText('__Moderate__')[0]).toBeInTheDocument();
      expect(screen.queryAllByText('__Low__')[0]).toBeInTheDocument();
      expect(screen.queryByTitle('Count __Severity__')).toBeInTheDocument();
      expect(screen.queryAllByLabelText('__Search__')[0]).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('__Search__')).toBeInTheDocument();
      expect(screen.queryByText('__Filters__')).toBeInTheDocument();
      expect(screen.queryByText('__Previous page__')).toBeInTheDocument();
      expect(screen.queryByText('__Next page__')).toBeInTheDocument();
      expect(screen.queryByText('__1–10 of 11 items__')).toBeInTheDocument();
      expect(screen.queryAllByLabelText('__Click to expand content__')[0]).toBeInTheDocument();
      expect(screen.queryByText('__Download table content__')).toBeInTheDocument();
    });

    it('translates filters', () => {
      const { rerender } = render(
        <TableCard
          id="table-i18n"
          title="Testing i18n"
          content={content}
          size={CARD_SIZES.LARGEWIDE}
          values={tableData}
          filters={[{ columnId: 'alert', value: 'failure' }]}
          i18n={i18n}
        />
      );

      // expect(screen.queryByText('__Click to collapse content__')).toBeInTheDocument();
      expect(screen.queryByText(/__Clear all filters__/gi)).toBeInTheDocument();
      expect(screen.queryByLabelText('__Filters__')).toBeInTheDocument();
      userEvent.click(screen.queryByLabelText('__Filters__'));
      expect(screen.queryByTitle('__Clear filter__')).toBeInTheDocument();
      expect(
        screen.queryAllByPlaceholderText('__Type and hit enter to apply__')[0]
      ).toBeInTheDocument();

      rerender(
        <TableCard
          id="table-i18n"
          title="Testing i18n"
          content={content}
          size={CARD_SIZES.LARGEWIDE}
          values={[]}
          filters={[{ columnId: 'alert', value: 'failure' }]}
          i18n={i18n}
        />
      );
      expect(screen.queryByText('__No results match the current filters__')).toBeInTheDocument();
    });

    it('translates no data', () => {
      render(
        <TableCard
          id="table-i18n"
          title="Testing i18n"
          content={content}
          size={CARD_SIZES.LARGEWIDE}
          values={[]}
          i18n={i18n}
        />
      );

      expect(screen.queryByText('__There is no data__')).toBeInTheDocument();
    });
  });

  it('should call onCardAction when clicking actions in overflow menus', () => {
    const onCardAction = jest.fn();

    const tableDataWithActions = tableData.map((item) => {
      return {
        ...item,
        actions: actions1,
      };
    });

    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );

    const firstRow = container.querySelectorAll('tbody > tr')[0];
    userEvent.click(within(firstRow).getByLabelText('Open and close list of options'));
    const viewButton = screen.getByText('View');
    const clickEvent = createEvent.click(viewButton);
    const mockEventCalls = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    };
    Object.assign(clickEvent, mockEventCalls);
    fireEvent(viewButton, clickEvent);
    expect(onCardAction).toHaveBeenCalledWith('table-test', 'TABLE_CARD_ROW_ACTION', {
      actionId: 'view',
      rowId: 'row-10',
    });
    expect(mockEventCalls.stopPropagation).toHaveBeenCalled();
    expect(mockEventCalls.preventDefault).toHaveBeenCalled();
  });

  it('should not render and overflow menu when actionList is empty', () => {
    const onCardAction = jest.fn();

    const tableDataWithActions = tableData.map((item) => {
      return {
        ...item,
        actions: [],
      };
    });

    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );

    const firstRow = container.querySelectorAll('tbody > tr')[0];
    expect(within(firstRow).queryByLabelText('Open and close list of options')).toBeNull();
  });

  it('should render an action icon that is a node.', () => {
    const onCardAction = jest.fn();

    const tableDataWithActions = tableData.map((item, index) => {
      return {
        ...item,
        actions:
          index % 2 === 0
            ? [
                {
                  id: 'custom-icon',
                  label: 'custom-icon',
                  icon: () => <Bee32 data-testid="bee-icon" />,
                },
              ]
            : undefined,
      };
    });

    render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableDataWithActions.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );

    expect(screen.queryAllByTestId('bee-icon')).toHaveLength(1);
  });

  it('should filter the table when searching', () => {
    const onCardAction = jest.fn();
    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );
    userEvent.click(screen.getByRole('search'));
    userEvent.type(screen.getByPlaceholderText('Search'), 'AHI003{enter}');
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(1);
    userEvent.click(screen.getByLabelText('Clear search input'));
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(10);
  });

  it('should filter the table when filtering', () => {
    const onCardAction = jest.fn();
    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );
    userEvent.click(screen.getByText('Filters'));
    const alertFilterInput = screen.getAllByPlaceholderText('Type and hit enter to apply')[0];
    expect(alertFilterInput).toHaveAttribute('id', 'alert');
    expect(alertFilterInput).toBeVisible();
    userEvent.type(alertFilterInput, 'AHI005{enter}');
    expect(alertFilterInput).toHaveValue('AHI005');
    userEvent.click(screen.getByText('AHI005 Asset failure'));
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(1);
    userEvent.click(screen.getByText('Clear all filters'));
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(10);
  });

  it('should change pages', () => {
    const onCardAction = jest.fn();
    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData.slice(0, 11)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(10);
    userEvent.click(screen.getByLabelText('Next page'));
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(1);
  });

  it('should call onCardAction when toolbar options are clicked.', () => {
    const onCardAction = jest.fn();
    render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );

    userEvent.click(screen.getByRole('button', { name: /expand/i }));
    expect(onCardAction).toHaveBeenLastCalledWith('table-test', 'OPEN_EXPANDED_CARD');
    userEvent.click(screen.getAllByTitle('Select time range')[0]);
    userEvent.click(screen.getByText('Last 24 hrs'));
    expect(onCardAction).toHaveBeenLastCalledWith('table-test', 'CHANGE_TIME_RANGE', {
      range: 'last24Hours',
    });
    userEvent.click(screen.getAllByLabelText('Sort rows by this header in ascending order')[0]);
  });

  it('should download csv files when download is clicked', () => {
    const onCardAction = jest.fn();
    render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
      />
    );

    userEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(fileDownload).toHaveBeenCalledWith(
      `alert,count,hour,long_description,pressure\nAHI005 Asset failure,1.2039201932,07/23/2019 05:26:10,long description for a given event payload,0\nAHI003 process need to optimize adjust X variables,1.10329291,07/23/2019 04:26:10,long description for a given event payload,2\n`,
      'Open Alerts.csv'
    );
  });

  it('should show the default `--` in expanded rows with no label (with or without linkTemplates)', () => {
    const onCardAction = jest.fn();
    render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
          expandedRows: [
            {
              id: 'alert',
              linkTemplate: {
                href: 'https://www.ibm.com',
                target: '_blank',
              },
            },
            {
              id: 'count',
            },
          ],
        }}
        values={tableData.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGE}
        testID="TABLE_CARD"
        cardVariables={{
          company: 'ibm',
        }}
      />
    );

    userEvent.click(screen.getAllByLabelText('Click to expand content')[0]);
    expect(screen.getAllByText('--')).toHaveLength(2);
    expect(screen.getAllByText('AHI005 Asset failure')[1]).toHaveAttribute('target', '_blank');
  });

  it("should hide columns that don't have priority:1 when using a largethin card.", () => {
    const { error } = console;
    console.error = jest.fn();
    const onCardAction = jest.fn();
    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
        }}
        values={tableData.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGETHIN}
        testID="TABLE_CARD"
        cardVariables={{
          company: 'ibm',
        }}
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid prop `size` of value `LARGETHIN` supplied to `TableCard`')
    );
    console.error = error;
  });

  it('fallback to dataSourceId or empty string if no label/dataSourceId is given for the column', () => {
    const onCardAction = jest.fn();

    const { rerender } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns.map((c) => {
            if (c.label === 'Alert') {
              return {
                ...c,
                label: undefined,
              };
            }

            return c;
          }),
        }}
        values={tableData.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGETHIN}
        testID="TABLE_CARD"
        cardVariables={{
          company: 'ibm',
        }}
      />
    );

    expect(screen.getByTitle('alert')).toBeVisible();

    jest.spyOn(console, 'error').mockImplementation(() => {});
    rerender(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns.map((c) => {
            if (c.label === 'Alert') {
              return {
                ...c,
                label: undefined,
                dataSourceId: undefined,
              };
            }

            return c;
          }),
        }}
        values={tableData.slice(0, 2)}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGETHIN}
        testID="TABLE_CARD"
        cardVariables={{
          company: 'ibm',
        }}
      />
    );

    expect(screen.queryByTitle('alert')).toBeNull();
    expect(screen.queryByTitle('Alert')).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed prop type: The prop `content.columns[0].dataSourceId` is marked as required in `TableCard`'
      )
    );
    console.error.mockReset();
  });

  it('should only show thresholds if showOnContent is true', () => {
    const onCardAction = jest.fn();
    const { container } = render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: tableColumns,
          thresholds: [
            {
              dataSourceId: 'pressure',
              comparison: '>=',
              value: 10,
              severity: 1,
              label: 'Pressure severity',
              showSeverityLabel: true,
              severityLabel: 'TOO HIGH',
              showOnContent: true,
            },
          ],
        }}
        values={tableData}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGETHIN}
        testID="TABLE_CARD"
      />
    );

    expect(screen.getAllByTitle(/>= 10/i)).toHaveLength(6);
    // this is only five, because the other rows with pressure:0 don't
    // meet the filter. Should 0 be considered a value?
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(5);
  });

  it('should render even with undefined columns', () => {
    const { error } = console;
    console.error = jest.fn();
    const onCardAction = jest.fn();
    render(
      <TableCard
        id="table-test"
        title="Open Alerts"
        content={{
          columns: undefined,
        }}
        values={[]}
        onCardAction={onCardAction}
        size={CARD_SIZES.LARGETHIN}
        testId="TABLE_CARD"
      />
    );

    expect(screen.getByTestId('TABLE_CARD')).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'The prop `content.columns` is marked as required in `TableCard`, but its value is `undefined`'
      )
    );
    console.error = error;
  });
});
