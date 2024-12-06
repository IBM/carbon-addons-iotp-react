import React from 'react';
import { mount } from '@cypress/react';
import { onlyOn } from '@cypress/skip-test';
import { Button } from '@carbon/react';
import { ArrowRight, TrashCan } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';

import { DEFAULT_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from './TableHead/columnWidthUtilityFunctions';
import Table from './Table';
import {
  addRowActions,
  getSelectData,
  getTableColumns,
  getTableData,
  getWords,
} from './Table.test.helpers';

const { iotPrefix } = settings;

describe('Table visual regression tests', () => {
  const words = getWords();
  const selectData = getSelectData();

  it('matches snapshot 1', () => {
    cy.viewport(1680, 900);
    const tableData = addRowActions(getTableData(20, words, selectData));
    const columnsOverflowMenu = getTableColumns(selectData)
      .map((col, idx) => (!idx ? { ...col, overflowMenuItems: selectData } : col))
      .map((col) => ({ ...col, align: 'start', tooltip: 'More info here' }));

    mount(
      <div data-testid="snapshot-1-container">
        <Table
          secondaryTitle="Visual snapshot test table"
          tooltip="This is a toltip"
          testId="snapshot-1"
          columns={columnsOverflowMenu}
          columnGroups={[
            { id: 'groupA', name: 'Group A' },
            { id: 'groupB', name: 'Group B' },
          ]}
          data={tableData}
          expandedData={tableData.map((data) => ({
            rowId: data.id,
            content: <div style={{ padding: '8px' }}>Expanded content</div>,
          }))}
          options={{
            hasAggregations: true,
            hasColumnSelection: true,
            hasFilter: true,
            hasPagination: true,
            hasResize: true,
            hasRowEdit: true,
            hasRowExpansion: true,
            hasRowActions: true,
            hasRowSelection: 'multi',
            hasSearch: true,
            hasSort: true,
            hasSingleRowEdit: true,
            wrapCellText: 'always',
          }}
          size="2xl"
          view={{
            aggregations: {
              label: 'Total:',
              columns: [
                {
                  id: 'number',
                  align: 'start',
                  isSortable: false,
                  value: 'No value',
                },
              ],
            },
            pagination: { isItemPerPageHidden: true },
            filters: [
              { columnId: 'string', value: 't' },
              { columnId: 'number', value: 10 },
              { columnId: 'boolean', value: false },
              { columnId: 'object', value: ['option-C'] },
            ],
            table: {
              ordering: [
                {
                  columnId: 'string',
                  columnGroupId: 'groupA',
                },
                {
                  columnId: 'node',
                  columnGroupId: 'groupA',
                },
                {
                  columnId: 'date',
                },
                {
                  columnId: 'select',
                },
                {
                  columnId: 'number',
                  columnGroupId: 'groupB',
                },
                {
                  columnId: 'boolean',
                  columnGroupId: 'groupB',
                },
                {
                  columnId: 'secretField',
                },
                {
                  columnId: 'object',
                },
              ],
              isSelectAllSelected: false,
              expandedIds: ['row-2'],
              rowActions: [{ rowId: 'row-1', isEditMode: true }],
              singleRowEditButtons: (
                <React.Fragment>
                  <Button
                    key="cancel"
                    style={{ marginRight: '0.5rem' }}
                    size="sm"
                    kind="tertiary"
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                  <Button key="save" size="sm" onClick={() => {}}>
                    Save
                  </Button>
                </React.Fragment>
              ),
            },
            toolbar: {
              activeBar: 'filter',
              customToolbarContent: <div style={{ margin: '1rem' }}>Custom content</div>,
              search: { defaultValue: 'testing' },
              isDisabled: true,
            },
          }}
          locale="fr"
        />
      </div>
    );

    cy.get(`.${iotPrefix}--table-head--overflow`).click();
    onlyOn('headless', () => {
      cy.findByTestId('snapshot-1-container').compareSnapshot('snapshot-1');
    });
  });

  it('matches snapshot 2', () => {
    cy.viewport(1680, 900);
    const tableData = getTableData(20, words, selectData);
    tableData[0].children = [
      { ...tableData[0], id: 'row-0-A' },
      { ...tableData[0], id: 'row-0-B' },
    ];
    tableData[1].children = [
      { ...tableData[1], id: 'row-1-A', children: [{ ...tableData[1], id: 'row-1-A-1' }] },
    ];

    const columns = getTableColumns(selectData).map((col) => ({
      ...col,
      align: 'center',
    }));
    columns[0].width = '300px';
    columns[1].width = `${MIN_COLUMN_WIDTH}px`;
    columns[1].isSortable = false;
    columns[2].width = `${DEFAULT_COLUMN_WIDTH}px`;
    columns[3].isSortable = true;
    columns[5].width = `1200px`;

    mount(
      <div data-testid="snapshot-2-container">
        <Table
          testId="snapshot-2"
          columns={columns}
          data={tableData}
          options={{
            hasAggregations: true,
            hasColumnSelection: true,
            hasColumnSelectionConfig: true,
            hasPagination: true,
            hasResize: true,
            hasRowNesting: true,
            hasRowSelection: 'single',
            hasSearch: true,
            hasSort: true,
            hasSingleRowEdit: true,
            preserveColumnWidths: true,
            wrapCellText: 'alwaysTruncate',
          }}
          size="md"
          view={{
            aggregations: {
              label: undefined,
              columns: [
                {
                  id: 'number',
                  align: 'center',
                  isSortable: true,
                  value: (val) => `${val.reduce((acc, curr) => acc + curr)} $`,
                },
              ],
            },
            pagination: { isItemPerPageHidden: false },
            table: {
              isSelectAllSelected: false,
              selectedIds: ['row-4'],
              expandedIds: ['row-0', 'row-1', 'row-1-A'],
              sort: {
                columnId: 'select',
                direction: 'ASC',
              },
              ordering: columns.map(({ id }) => ({
                columnId: id,
                isHidden: id === 'secretField',
              })),
            },
            toolbar: {
              activeBar: 'column',
              search: { defaultExpanded: true },
            },
          }}
        />
      </div>
    );

    cy.findByTestId(`snapshot-2-table-head-column-string`).click();
    onlyOn('headless', () => {
      cy.findByTestId('snapshot-2-container').compareSnapshot('snapshot-2');
    });
  });

  it('matches snapshot 3', () => {
    cy.viewport(1680, 900);
    const tableData = addRowActions(getTableData(20, words, selectData)).slice(0, 10);
    const columns = getTableColumns(selectData).map((col) => ({
      ...col,
      align: 'end',
    }));

    tableData[0].rowActions = [
      {
        id: 'drilldown',
        renderIcon: ArrowRight,
        iconDescription: 'Drill in',
        labelText: 'Drill in',
        isOverflow: false,
      },
      {
        id: 'Add',
        iconDescription: 'Add',
        labelText: 'Add',
        isOverflow: false,
      },
      {
        id: 'Edit',
        renderIcon: 'edit',
        iconDescription: 'Edit',
        labelText: 'Edit',
        isEdit: true,
        isOverflow: true,
      },
      {
        id: 'Delete',
        iconDescription: 'Delete',
        labelText: 'Delete',
        isDelete: true,
        isOverflow: true,
      },
      {
        id: 'Test',
        hasDivider: true,
        labelText: 'Test',
        isOverflow: true,
        disabled: true,
      },
    ];

    const advancedFilters = [
      {
        filterId: 'story-filter',
        filterTitleText: 'Story Filter',
        filterRules: {
          id: '14p5ho3pcu',
          groupLogic: 'ALL',
          rules: [],
        },
        filterColumns: columns,
      },
    ];

    mount(
      <div data-testid="snapshot-3-container">
        <Table
          testId="snapshot-3"
          columns={columns}
          data={tableData}
          useZebraStyles
          options={{
            hasMultiSort: true,
            hasRowActions: true,
            hasRowSelection: 'multi',
            wrapCellText: 'auto',
          }}
          size="xs"
          view={{
            advancedFilters,
            selectedAdvancedFilterIds: ['story-filter'],
            table: {
              isSelectAllIndeterminate: true,
              isSelectAllSelected: true,
              selectedIds: ['row-4'],
              sort: [
                {
                  columnId: 'node',
                  direction: 'DESC',
                },
                {
                  columnId: 'string',
                  direction: 'ASC',
                },
              ],
              ordering: columns.map(({ id }) => ({
                columnId: id,
                isHidden: id === 'secretField',
              })),
            },
            toolbar: {
              batchActions: [
                {
                  iconDescription: 'Delete Item',
                  id: 'delete',
                  labelText: 'Delete',
                  renderIcon: TrashCan,
                },
              ],
              advancedFilterFlyoutOpen: false,
            },
          }}
        />
      </div>
    );

    cy.get(`.${iotPrefix}--row-actions-cell--overflow-menu`).first().click();
    onlyOn('headless', () => {
      cy.findByTestId('snapshot-3-container').compareSnapshot('snapshot-3');
    });
  });

  it('shouldLazyRender rows on scroll when shouldLazyRender:true', () => {
    // cypress hack to get screen to re-render correctly after last test
    cy.viewport(1680, 400);

    const tableData = getTableData(50, words, selectData);
    const columns = getTableColumns(selectData);

    mount(
      <Table
        id="test-table"
        columns={columns}
        data={tableData}
        options={{
          shouldLazyRender: true,
        }}
      />
    );
    // 50 for rows, 1 for header
    cy.get('tr').should('have.length', 51);
    cy.findAllByTestId(/lazy-row/i).should('have.length', 42);
    cy.get('tr').eq(10).scrollIntoView({ duration: 1500 });
    cy.findAllByTestId(/lazy-row/i).should('have.length', 32);
    cy.get('tr').last().scrollIntoView({ duration: 1500 });
    cy.findAllByTestId(/lazy-row/i).should('have.length', 0);

    // reset back to default
    cy.viewport(1680, 900);
  });
});
