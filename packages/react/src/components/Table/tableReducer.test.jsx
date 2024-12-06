import React from 'react';
import { merge, omit } from 'lodash-es';
import { Add } from '@carbon/react/icons';

import { fillArrWithRowIds } from '../../utils/tableReducer';

import { tableReducer, filterData, searchData, filterSearchAndSort } from './tableReducer';
import {
  tableRegister,
  tablePageChange,
  tableToolbarToggle,
  tableFilterApply,
  tableFilterClear,
  tableActionCancel,
  tableActionApply,
  tableColumnSort,
  tableColumnOrder,
  tableRowSelect,
  tableRowSelectAll,
  tableRowExpand,
  tableSearchApply,
  tableRowActionStart,
  tableRowActionComplete,
  tableRowActionEdit,
  tableRowActionError,
  tableAdvancedFiltersToggle,
  tableAdvancedFiltersRemove,
  tableAdvancedFiltersChange,
  tableAdvancedFiltersCreate,
  tableAdvancedFiltersCancel,
  tableAdvancedFiltersApply,
  tableToggleAggregations,
  tableSaveMultiSortColumns,
  tableCancelMultiSortColumns,
  tableClearMultiSortColumns,
} from './tableActionCreators';
import {
  addChildRows,
  getTableColumns,
  getInitialState,
  getTableDataWithEmptySelectFilter,
  decorateTableColumns,
  getTableData,
} from './Table.story.helpers';

const initialState = getInitialState();

const tableColumns = getTableColumns();

describe('table reducer', () => {
  it('nothing', () => {
    expect(tableReducer(undefined, { type: 'BOGUS' })).toEqual({});
  });
  it('return the same state if there is a missmatching instanceId', () => {
    // We use an action that will be forwarded to the base reducer
    expect(tableReducer(initialState, tablePageChange({ page: 3, pageSize: 10 }, 'id1'))).toBe(
      initialState
    );
  });
  it('row action tests', () => {
    const updatedRowActionState = tableReducer(initialState, tableRowActionStart('row-1'));
    const newRowActions = updatedRowActionState.view.table.rowActions;
    expect(newRowActions).toHaveLength(1);
    expect(newRowActions[0].rowId).toEqual('row-1');
    expect(newRowActions[0].isRunning).toEqual(true);

    // Set the error for the running one
    const updatedRowActionState2 = tableReducer(
      updatedRowActionState,
      tableRowActionError('row-1', 'error')
    );
    const newRowActions2 = updatedRowActionState2.view.table.rowActions;
    expect(newRowActions2).toHaveLength(1);
    expect(newRowActions2[0].rowId).toEqual('row-1');
    expect(newRowActions2[0].error).toEqual('error');

    // Clear the action
    const updatedRowActionState3 = tableReducer(initialState, tableRowActionComplete('row-1'));
    const newRowActions3 = updatedRowActionState3.view.table.rowActions;
    expect(newRowActions3).toHaveLength(0);

    // Enable a rows edit mode
    const updatedRowActionState4 = tableReducer(initialState, tableRowActionEdit('row-1'));
    const newRowActions4 = updatedRowActionState4.view.table.rowActions;
    expect(newRowActions4[0].rowId).toEqual('row-1');
    expect(newRowActions4[0].isEditMode).toBeTruthy();
  });
  describe('filter tests', () => {
    it('TABLE_FILTER_CLEAR', () => {
      expect(tableReducer(initialState, tableFilterClear()).view.filters).toEqual([]);
    });
    it('TABLE_FILTER_APPLY filter should filter data', () => {
      const updatedState = tableReducer(
        initialState,
        tableFilterApply({ [tableColumns[0].id]: '1' })
      );
      // Apply the filter
      expect(updatedState.view.filters).toEqual([{ columnId: tableColumns[0].id, value: '1' }]);
      // data should result in less records
      expect(updatedState.view.table.filteredData.length).toBeLessThan(initialState.data.length);
    });
  });
  describe('pagination', () => {
    it('TABLE_PAGE_CHANGE ', () => {
      const updatedState = tableReducer(
        {
          ...initialState,
          view: {
            ...initialState.view,
            pagination: { ...initialState.view.pagination, totalItems: 100 },
          },
        },
        tablePageChange({ page: 3, pageSize: 10 })
      );
      expect(initialState.data.length).toEqual(100);
      expect(updatedState.view.pagination.page).toEqual(3);
    });
    it('TABLE_PAGE_CHANGE with invalid page', () => {
      const updatedState = tableReducer(initialState, tablePageChange({ page: 65, pageSize: 10 }));
      expect(updatedState.view.pagination.page).toEqual(1);
    });
    it('TABLE_PAGE_CHANGE pageSize change resets page', () => {
      const state1 = tableReducer(
        {
          view: {
            pagination: {
              pageSize: 10,
              pageSizes: [10, 20, 30],
              page: 1,
              totalItems: 100,
            },
          },
        },
        tablePageChange({ page: 4, pageSize: 10 })
      );
      expect(state1.view.pagination.page).toEqual(4);

      const state2 = tableReducer(state1, tablePageChange({ pageSize: 30 }));
      expect(state2.view.pagination.page).toEqual(1);

      const state3 = tableReducer(
        {
          view: {
            pagination: {
              pageSize: 30,
              pageSizes: [10, 20, 30],
              page: 3,
              totalItems: 100,
            },
          },
        },
        tablePageChange({ pageSize: 10 })
      );
      expect(state3.view.pagination.page).toEqual(1);
    });
  });
  describe('toolbar actions', () => {
    it('TABLE_TOOLBAR_TOGGLE ', () => {
      const updatedState = tableReducer(initialState, tableToolbarToggle('column'));
      expect(updatedState.view.toolbar.activeBar).toEqual('column');

      const updatedState2 = tableReducer(updatedState, tableToolbarToggle('column'));
      expect(updatedState2.view.toolbar.activeBar).not.toEqual('column');
    });
    it('TABLE_SEARCH_APPLY filter should search data', () => {
      const searchString = 'searchString';
      const updatedState = tableReducer(initialState, tableSearchApply(searchString));
      // Apply the search
      expect(updatedState.view.toolbar.search.defaultValue).toEqual(searchString);
      expect(updatedState.view.pagination.page).toEqual(1);
    });

    it('TABLE_ADVANCED_FILTER_TOGGLE', () => {
      const openState = merge({}, initialState, {
        view: { toolbar: { advancedFilterFlyoutOpen: true } },
      });
      const toggleAction = tableAdvancedFiltersToggle();
      const closedState = tableReducer(openState, toggleAction);
      expect(closedState.view.toolbar.advancedFilterFlyoutOpen).toBe(false);

      const newOpenState = tableReducer(closedState, toggleAction);
      expect(newOpenState.view.toolbar.advancedFilterFlyoutOpen).toBe(true);
    });

    it('TABLE_TOGGLE_AGGREGATIONS', () => {
      const showingState = merge({}, initialState, {
        view: { aggregations: { isHidden: false } },
      });

      const toggleAction = tableToggleAggregations();
      const hiddenState = tableReducer(showingState, toggleAction);
      expect(hiddenState.view.aggregations.isHidden).toBe(true);

      const newShowingState = tableReducer(hiddenState, toggleAction);
      expect(newShowingState.view.aggregations.isHidden).toBe(false);
    });
  });
  describe('table actions', () => {
    it('TABLE_ACTION_CANCEL ', () => {
      const tableWithSelection = tableReducer(initialState, tableRowSelectAll(true));
      // All should be selected
      expect(tableWithSelection.view.table.selectedIds.length).toEqual(initialState.data.length);

      const tableAfterCancel = tableReducer(initialState, tableActionCancel());
      expect(tableAfterCancel.view.table.selectedIds).toEqual([]);
      expect(tableAfterCancel.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterCancel.view.table.isSelectAllIndeterminate).toEqual(false);
    });
    it('TABLE_ACTION_APPLY ', () => {
      // Select everything first
      const tableWithSelection = tableReducer(initialState, tableRowSelectAll(true));

      // All should be selected
      expect(tableWithSelection.view.table.selectedIds.length).toEqual(initialState.data.length);

      // If it's not delete we should clear the selection
      const tableAfterCustomAction = tableReducer(tableWithSelection, tableActionApply('custom'));
      expect(tableAfterCustomAction.view.table.selectedIds).toEqual([]);
      expect(tableAfterCustomAction.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterCustomAction.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableAfterCustomAction.data).toEqual(initialState.data);
      expect(tableAfterCustomAction.view.table.filteredData).toEqual(
        initialState.view.table.filteredData
      );

      // If it is delete we should update data and filtered data
      const tableAfterDeleteAction = tableReducer(tableWithSelection, tableActionApply('delete'));
      expect(tableAfterDeleteAction.view.table.selectedIds).toEqual([]);
      expect(tableAfterDeleteAction.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterDeleteAction.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableAfterDeleteAction.data).toEqual([]);
      expect(tableAfterDeleteAction.view.table.filteredData).toEqual([]);
    });
  });
  describe('table column actions', () => {
    it('TABLE_COLUMN_SORT', () => {
      const sortColumnAction = tableColumnSort(tableColumns[0].id);
      // First sort ASC
      expect(initialState.view.table.sort).toBeUndefined();
      const tableSorted = tableReducer(initialState, sortColumnAction);
      expect(tableSorted.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSorted.view.table.sort.direction).toEqual('ASC');
      // Order should be changed in the filteredData
      expect(initialState.data).not.toEqual(tableSorted.view.table.filteredData);

      // Then sort descending
      const tableSortedDesc = tableReducer(tableSorted, sortColumnAction);
      expect(tableSortedDesc.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSortedDesc.view.table.sort.direction).toEqual('DESC');
      // The previous sorted data shouldn't match
      expect(tableSortedDesc.view.table.filteredData).not.toEqual(
        tableSorted.view.table.filteredData
      );

      const tableSortedNone = tableReducer(tableSortedDesc, sortColumnAction);
      const filteredTable = tableReducer(initialState, tableRegister({ data: initialState.data }));

      expect(tableSortedNone.view.table.sort).toBeUndefined();
      // Data should no longer be sorted but should be filtered
      expect(filteredTable.view.table.filteredData).toEqual(
        tableSortedNone.view.table.filteredData
      );
    });

    it('TABLE_COLUMN_SORT with search', () => {
      const searchString = 'toyota';
      const sortColumnAction = tableColumnSort(tableColumns[0].id);

      const tableFiltered = tableReducer(initialState, tableSearchApply(searchString));
      expect(tableFiltered.view.toolbar.search.defaultValue).toEqual(searchString);
      expect(tableFiltered.view.pagination.page).toEqual(1);

      // First sort ASC
      expect(tableFiltered.view.table.sort).toBeUndefined();
      const tableSorted = tableReducer(tableFiltered, sortColumnAction);
      expect(tableSorted.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSorted.view.table.sort.direction).toEqual('ASC');
      // Order should be changed in the filteredData
      expect(tableFiltered.data).not.toEqual(tableSorted.view.table.filteredData);

      // Then sort DESC
      const tableSortedDesc = tableReducer(tableSorted, sortColumnAction);
      expect(tableSortedDesc.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSortedDesc.view.table.sort.direction).toEqual('DESC');
      // The previous sorted data shouldn't match
      expect(tableSorted.data).not.toEqual(tableSortedDesc.view.table.filteredData);

      // Then sort by default
      const tableSortedNone = tableReducer(tableSortedDesc, sortColumnAction);
      const filteredTable = tableReducer(initialState, tableRegister({ data: initialState.data }));
      const filteredTableSearch = tableReducer(filteredTable, tableSearchApply(searchString));

      expect(tableSortedNone.view.table.sort).toBeUndefined();
      // Data should no longer be sorted but should be filtered
      expect(filteredTableSearch.view.table.filteredData).toEqual(
        tableSortedNone.view.table.filteredData
      );
    });

    it('TABLE_COLUMN_SORT multisort', () => {
      const multiSortState = merge({}, initialState, {
        view: {
          table: {
            sort: [
              {
                columnId: 'string',
                direction: 'ASC',
              },
              {
                columnId: 'date',
                direction: 'ASC',
              },
            ],
          },
        },
      });
      const sortColumnAction = tableColumnSort('string');
      const tableSorted = tableReducer(multiSortState, sortColumnAction);

      expect(tableSorted.view.table.sort).toEqual([
        {
          columnId: 'string',
          direction: 'DESC',
        },
        {
          columnId: 'date',
          direction: 'ASC',
        },
      ]);
    });

    it('TABLE_COLUMN_SORT custom sort function', () => {
      const sortColumnAction = tableColumnSort(tableColumns[4].id);
      const mockSortFunction = jest.fn().mockReturnValue(initialState.data);
      // Splice in our custom mock sort function
      initialState.columns.splice(4, 1, {
        ...initialState.columns[4],
        sortFunction: mockSortFunction,
      });
      // First sort ASC
      tableReducer(initialState, sortColumnAction);
      expect(mockSortFunction).toHaveBeenCalled();
    });
    it('TABLE_COLUMN_ORDER', () => {
      expect(initialState.view.table.ordering[0].isHidden).toBe(false);
      // Hide the first column
      const columnHideAction = tableColumnOrder([{ columnId: tableColumns[0].id, isHidden: true }]);
      const tableWithHiddenColumn = tableReducer(initialState, columnHideAction);
      expect(tableWithHiddenColumn.view.table.ordering[0].isHidden).toBe(true);
    });

    it('TABLE_MULTI_SORT_SAVE', () => {
      expect(initialState.view.table.filteredData).toBeUndefined();
      const sortConf = [
        {
          columnId: 'select',
          direction: 'DESC',
        },
        {
          columnId: 'string',
          direction: 'DESC',
        },
      ];
      const multiSortAction = tableSaveMultiSortColumns(sortConf);
      const newState = tableReducer(initialState, multiSortAction);
      expect(newState.view.table.sort).toEqual(sortConf);
      expect(newState.view.table.filteredData[0].id).toEqual('row-82');
      expect(newState.view.table.showMultiSortModal).toBe(false);

      const newSortConf = [
        {
          columnId: 'select',
          direction: 'DESC',
        },
        {
          columnId: 'string',
          direction: 'ASC',
        },
      ];
      const newMultiSortAction = tableSaveMultiSortColumns(newSortConf);
      const newState2 = tableReducer(initialState, newMultiSortAction);
      expect(newState2.view.table.sort).toEqual(newSortConf);
      expect(newState2.view.table.filteredData[0].id).toEqual('row-34');
      expect(newState.view.table.showMultiSortModal).toBe(false);
    });

    it('TABLE_MULTI_SORT_CANCEL', () => {
      const openState = merge({}, initialState, {
        view: { table: { showMultiSortModal: true } },
      });
      const multiSortCancelAction = tableCancelMultiSortColumns();
      const cancelledState = tableReducer(openState, multiSortCancelAction);
      expect(cancelledState.view.table.showMultiSortModal).toBe(false);

      const cancelledState2 = tableReducer(cancelledState, multiSortCancelAction);
      expect(cancelledState2.view.table.showMultiSortModal).toBe(false);
    });

    it('TABLE_MULTI_SORT_CLEAR', () => {
      const openState = merge({}, initialState, {
        view: {
          table: {
            filteredData: ['bogus data'],
            showMultiSortModal: true,
            sort: [
              {
                columnId: 'select',
                direction: 'DESC',
              },
              {
                columnId: 'string',
                direction: 'ASC',
              },
            ],
          },
        },
      });

      const multiSortClearAction = tableClearMultiSortColumns();
      const clearedState = tableReducer(openState, multiSortClearAction);
      expect(clearedState.view.table.showMultiSortModal).toBe(false);
      expect(clearedState.view.table.sort).toBeUndefined();
      expect(clearedState.view.table.filteredData).toHaveLength(14);
    });
  });
  describe('Table Row Operations', () => {
    it('TABLE_ROW_SELECT', () => {
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select a row
      const tableWithSelectedRow = tableReducer(initialState, tableRowSelect(['row-1'], 'multi'));
      expect(tableWithSelectedRow.view.table.selectedIds).toEqual(['row-1']);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Unselect the row
      const tableWithUnSelectedRow = tableReducer(
        tableWithSelectedRow,
        tableRowSelect([], 'multi')
      );
      expect(tableWithUnSelectedRow.view.table.selectedIds).toEqual([]);
      expect(tableWithUnSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithUnSelectedRow.view.table.isSelectAllIndeterminate).toEqual(false);
    });
    it('TABLE_ROW_SELECT--SINGLE', () => {
      // set the table to single select
      const updatedInitialState = {
        ...initialState,
        view: {
          ...initialState.view,
          table: {
            ...initialState.view.table,
            hasRowSelection: 'single',
          },
        },
      };
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select a row
      const tableWithSelectedRow = tableReducer(
        updatedInitialState,
        tableRowSelect(['row-1'], 'single')
      );
      expect(tableWithSelectedRow.view.table.selectedIds).toEqual(['row-1']);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Select a second row, should deselect a previously selected row
      const tableWithPreviouslySelectedRow = tableReducer(
        {
          ...updatedInitialState,
          view: {
            ...updatedInitialState.view,
            table: {
              ...updatedInitialState.view.table,
              selectedIds: ['row-1'],
            },
          },
        },
        tableRowSelect(['row-2'], 'single')
      );
      expect(tableWithPreviouslySelectedRow.view.table.selectedIds).toEqual(['row-2']);
      expect(tableWithPreviouslySelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithPreviouslySelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);
    });

    it('TABLE_ROW_SELECT should indicate that all rows have been selected, including nesting', () => {
      const initialState = getInitialState();
      initialState.data = getTableData().map((row, index) => addChildRows(row, index));
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select all
      const tableWithSelectedAll = tableReducer(initialState, tableRowSelectAll(true));
      const allRowsId = [];
      initialState.data.forEach((row) => fillArrWithRowIds(row, allRowsId));
      expect(tableWithSelectedAll.view.table.selectedIds.length).toEqual(allRowsId.length);
      expect(tableWithSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithSelectedAll.view.table.isSelectAllSelected).toEqual(true);

      // Unselect some nested row
      const nestedRowIdIndex = allRowsId.findIndex((id) => id === 'row-4_B-2-A');
      const rowsId = [
        ...allRowsId.slice(0, nestedRowIdIndex),
        ...allRowsId.slice(nestedRowIdIndex + 1, allRowsId.length),
      ];
      const tableWithUnSelectedRow = tableReducer(
        tableWithSelectedAll,
        tableRowSelect(rowsId, 'multi')
      );
      expect(tableWithUnSelectedRow.view.table.selectedIds.length).toEqual(allRowsId.length - 1);
      expect(tableWithUnSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithUnSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Select a row
      const tableWithSelectedRow = tableReducer(
        tableWithUnSelectedRow,
        tableRowSelect(allRowsId, 'multi')
      );
      expect(tableWithSelectedRow.view.table.selectedIds.length).toEqual(allRowsId.length);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(true);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(false);
    });

    it('TABLE_ROW_SELECT with filtered data', () => {
      // Init with filtering
      const filteredTable = tableReducer(initialState, tableRegister({ data: initialState.data }));
      expect(filteredTable.view.table.filteredData).toHaveLength(14);
      expect(filteredTable.data).toHaveLength(initialState.data.length);

      // Select a row
      const tableWithSelectedRow = tableReducer(filteredTable, tableRowSelect(['row-1'], 'multi'));
      expect(tableWithSelectedRow.view.table.selectedIds).toEqual(['row-1']);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Unselect the row
      const tableWithUnSelectedRow = tableReducer(
        tableWithSelectedRow,
        tableRowSelect([], 'multi')
      );
      expect(tableWithUnSelectedRow.view.table.selectedIds).toEqual([]);
      expect(tableWithUnSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithUnSelectedRow.view.table.isSelectAllIndeterminate).toEqual(false);

      // Reset filter
      const tableFilteredReset = tableReducer(tableWithUnSelectedRow, tableFilterApply({}));
      expect(tableFilteredReset.view.filters).toEqual([]);
      expect(tableFilteredReset.view.table.filteredData).toHaveLength(initialState.data.length);
      expect(tableFilteredReset.data).toHaveLength(initialState.data.length);
    });

    it('TABLE_ROW_SELECT_ALL', () => {
      expect(initialState.view.table.selectedIds).toEqual([]);
      // Select all
      const tableWithSelectedAll = tableReducer(initialState, tableRowSelectAll(true));
      expect(tableWithSelectedAll.view.table.selectedIds.length).toEqual(
        tableWithSelectedAll.data.length
      );
      expect(tableWithSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithSelectedAll.view.table.isSelectAllSelected).toEqual(true);
      // Unselect all
      const tableWithUnSelectedAll = tableReducer(initialState, tableRowSelectAll(false));
      expect(tableWithUnSelectedAll.view.table.selectedIds.length).toEqual(0);
      expect(tableWithUnSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithUnSelectedAll.view.table.isSelectAllSelected).toEqual(false);
    });

    it('TABLE_ROW_SELECT_ALL with nested rows', () => {
      const initialState = getInitialState();
      initialState.data = getTableData().map((row, index) => addChildRows(row, index));
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select all
      const tableWithSelectedAll = tableReducer(initialState, tableRowSelectAll(true));
      const allRowsId = [];
      initialState.data.forEach((row) => fillArrWithRowIds(row, allRowsId));
      expect(tableWithSelectedAll.view.table.selectedIds.length).toEqual(allRowsId.length);
      expect(tableWithSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithSelectedAll.view.table.isSelectAllSelected).toEqual(true);

      // Unselect all
      const tableWithUnSelectedAll = tableReducer(tableWithSelectedAll, tableRowSelectAll(false));
      expect(tableWithUnSelectedAll.view.table.selectedIds.length).toEqual(0);
      expect(tableWithUnSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithUnSelectedAll.view.table.isSelectAllSelected).toEqual(false);
    });

    it('TABLE_ROW_SELECT_ALL with filtered data', () => {
      // Init with filtering
      const filteredTable = tableReducer(initialState, tableRegister({ data: initialState.data }));
      expect(filteredTable.view.table.filteredData).toHaveLength(14);
      expect(filteredTable.data).toHaveLength(initialState.data.length);

      // Select all
      const tableWithSelectedAll = tableReducer(filteredTable, tableRowSelectAll(true));
      expect(tableWithSelectedAll.view.table.filteredData).toHaveLength(14);
      expect(tableWithSelectedAll.view.table.selectedIds).toHaveLength(14);

      // Unselect all
      const tableWithUnSelectedAll = tableReducer(tableWithSelectedAll, tableRowSelectAll(false));
      expect(tableWithSelectedAll.view.table.filteredData).toHaveLength(14);
      expect(tableWithUnSelectedAll.view.table.selectedIds.length).toEqual(0);

      // Reset filter
      const tableFilteredReset = tableReducer(tableWithUnSelectedAll, tableFilterApply({}));
      expect(tableFilteredReset.view.filters).toEqual([]);
      expect(tableFilteredReset.view.table.filteredData).toHaveLength(initialState.data.length);
      expect(tableFilteredReset.data).toHaveLength(initialState.data.length);
    });

    it('TABLE_ROW_SELECT_ALL with nested rows should skip non selectable rows', () => {
      const initialState = getInitialState();
      initialState.data = getTableData().map((row, index) => addChildRows(row, index));
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Changing rows to be non selectable
      initialState.data[0].isSelectable = false;
      initialState.data[1].isSelectable = false;

      // Select all
      const tableWithSelectedAll = tableReducer(initialState, tableRowSelectAll(true));
      const allRowsId = [];
      initialState.data.forEach((row) => fillArrWithRowIds(row, allRowsId));
      expect(tableWithSelectedAll.view.table.selectedIds.length).toEqual(allRowsId.length);
      expect(tableWithSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithSelectedAll.view.table.isSelectAllSelected).toEqual(true);
    });

    it('TABLE_ROW_EXPAND', () => {
      expect(initialState.view.table.expandedIds).toEqual([]);
      // Expanded row
      const tableWithExpandedRow = tableReducer(initialState, tableRowExpand('row-1', true));
      expect(tableWithExpandedRow.view.table.expandedIds).toEqual(['row-1']);
      const tableWith2ExpandedRows = tableReducer(
        tableWithExpandedRow,
        tableRowExpand('row-2', true)
      );
      expect(tableWith2ExpandedRows.view.table.expandedIds).toEqual(['row-1', 'row-2']);

      // Collapsed row
      const tableWithCollapsedRow = tableReducer(initialState, tableRowExpand('row-1', false));
      expect(tableWithCollapsedRow.view.table.expandedIds).toEqual([]);

      // With expandRowsExclusively
      const tableSingleWithExpandedRow = tableReducer(initialState, tableRowExpand('row-1', true));
      const newTableSingleWithExpandedRow = tableReducer(
        tableSingleWithExpandedRow,
        tableRowExpand('row-2', true, null, { expandRowsExclusively: true })
      );
      expect(newTableSingleWithExpandedRow.view.table.expandedIds).toEqual(['row-2']);
    });
    it('REGISTER_TABLE', () => {
      const tableWithDataSizeChanges = tableReducer(
        initialState,
        tableRegister({ view: { table: { pagination: { pageSize: 10 } } } })
      );

      expect(tableWithDataSizeChanges.view.pagination).toEqual({
        pageSize: 10,
        pageSizes: undefined,
        page: 1,
        totalItems: 100,
      });
      const changePagesState = tableReducer(
        tableWithDataSizeChanges,
        tablePageChange({ page: 3, pageSize: 10 })
      );
      expect(changePagesState.data.length).toEqual(100);
      expect(changePagesState.view.pagination.page).toEqual(3);

      const reduceDataLength = tableReducer(
        changePagesState,
        tableRegister({ data: changePagesState.data.slice(0, 10) })
      );
      expect(reduceDataLength.data.length).toEqual(10);
      expect(reduceDataLength.view.pagination.page).toEqual(1);

      const changePageSizeState = tableReducer(reduceDataLength, tablePageChange({ pageSize: 3 }));
      expect(changePageSizeState.data.length).toEqual(10);
      expect(changePageSizeState.view.pagination.page).toEqual(1);

      const movePageState = tableReducer(
        changePageSizeState,
        tablePageChange({ page: 3, pageSize: 3 })
      );
      expect(movePageState.data.length).toEqual(10);
      expect(movePageState.view.pagination.page).toEqual(3);

      const increaseDataLength = tableReducer(
        movePageState,
        tableRegister({ data: changePagesState.data })
      );
      expect(increaseDataLength.data.length).toEqual(100);
      expect(increaseDataLength.view.pagination).toEqual({
        pageSize: 3,
        page: 1,
        pageSizes: undefined,
        totalItems: 100,
      });

      // Data should be filtered once table registers
      expect(initialState.view.table.filteredData).toBeUndefined();
      const tableWithFilteredData = tableReducer(
        merge({}, initialState, {
          view: {
            table: {
              isSelectAllSelected: true,
              isSelectAllIndeterminate: true,
            },
          },
        }),
        tableRegister({ data: initialState.data, isLoading: false })
      );
      expect(tableWithFilteredData.data).toEqual(initialState.data);
      expect(tableWithFilteredData.view.table.filteredData.length).toBeGreaterThan(0);
      expect(tableWithFilteredData.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithFilteredData.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithFilteredData.view.table.filteredData.length).not.toEqual(
        initialState.data.length
      );
      expect(tableWithFilteredData.view.table.loadingState.isLoading).toEqual(false);

      // Initial state with sort specified but no filters
      const initialStateWithSortAndNoFilters = merge({}, omit(initialState, 'view.filters'), {
        view: {
          table: { sort: { columnId: 'string', direction: 'ASC' } },
          filters: [],
        },
      });
      const tableWithSortedData = tableReducer(
        initialStateWithSortAndNoFilters,
        tableRegister({ data: initialState.data, isLoading: false })
      );
      expect(tableWithSortedData.data).toEqual(initialState.data);
      expect(tableWithSortedData.view.table.loadingState.isLoading).toEqual(false);
      expect(tableWithSortedData.view.table.filteredData.length).toEqual(
        initialStateWithSortAndNoFilters.data.length
      );
      // But they shouldn't be equal because the order changed
      expect(tableWithSortedData.view.table.filteredData).not.toEqual(
        initialStateWithSortAndNoFilters.data
      );

      // is Loading should be set false and rowCount should be correct
      expect(tableWithSortedData.view.table.loadingState.isLoading).toEqual(false);
      expect(tableWithSortedData.view.table.loadingState.rowCount).toEqual(0);

      // load more
      const initialStateLoadMore = {
        ...initialState,
        data: [
          {
            ...initialState.data[0],
            hasLoadMore: true,
            children: [initialState.data[1], initialState.data[2], initialState.data[3]],
          },
          {
            ...initialState.data[4],
            hasLoadMore: true,
            children: [initialState.data[5], initialState.data[6], initialState.data[7]],
          },
          {
            ...initialState.data[8],
            hasLoadMore: true,
            children: [initialState.data[9], initialState.data[10], initialState.data[11]],
          },
          {
            ...initialState.data[12],
            hasLoadMore: true,
            children: [initialState.data[13], initialState.data[14], initialState.data[15]],
          },
        ],
        view: {
          ...initialState.view,
          table: {
            ...initialState.table,
            loadingMoreIds: ['row-0', 'row-4', 'row-12'],
          },
        },
      };

      // with loading more data
      const tableWithLoadingMoreData = tableReducer(
        initialStateLoadMore,
        tableRegister({ data: initialStateLoadMore.data, isLoading: false })
      );

      expect(tableWithLoadingMoreData.view.table.loadingMoreIds).toHaveLength(3);

      // after loaded data is completely loaded
      const initialStateWithLoadMoreComplete = {
        ...initialStateLoadMore,
        data: initialStateLoadMore.data.map((i, idx) =>
          idx === 0
            ? {
                ...i,
                hasLoadMore: false,
                children: [...i.children, initialState.data[16], initialState.data[17]],
              }
            : i
        ),
      };

      const tableWithLoadingMoreDataComplete = tableReducer(
        initialStateLoadMore,
        tableRegister({ data: initialStateWithLoadMoreComplete.data, isLoading: false })
      );

      expect(tableWithLoadingMoreDataComplete.view.table.loadingMoreIds).toHaveLength(2);

      const addTableRowActionsFromProps = tableReducer(
        initialState,
        tableRegister({
          view: {
            table: { rowActions: [{ rowId: 'row-0', isEditMode: true }] },
            toolbar: { activeBar: 'rowEdit' },
          },
        })
      );

      expect(addTableRowActionsFromProps.view.table.rowActions).toHaveLength(1);
      expect(addTableRowActionsFromProps.view.table.rowActions).toEqual([
        {
          rowId: 'row-0',
          isEditMode: true,
        },
      ]);
      expect(addTableRowActionsFromProps.view.toolbar.activeBar).toEqual('rowEdit');

      const addSecondTableRowActionsFromProps = tableReducer(
        addTableRowActionsFromProps,
        tableRegister({
          view: {
            table: {
              rowActions: [
                { rowId: 'row-0', isEditMode: true },
                { rowId: 'row-1', isEditMode: true },
              ],
            },
            toolbar: { activeBar: 'rowEdit' },
          },
        })
      );

      expect(addSecondTableRowActionsFromProps.view.table.rowActions).toHaveLength(2);
      expect(addSecondTableRowActionsFromProps.view.table.rowActions).toEqual([
        {
          rowId: 'row-0',
          isEditMode: true,
        },
        {
          rowId: 'row-1',
          isEditMode: true,
        },
      ]);
      expect(addSecondTableRowActionsFromProps.view.toolbar.activeBar).toEqual('rowEdit');

      const removeOneTableRowActionsFromProps = tableReducer(
        addTableRowActionsFromProps,
        tableRegister({
          view: {
            table: {
              rowActions: [{ rowId: 'row-1', isEditMode: true }],
            },
            toolbar: { activeBar: 'rowEdit' },
          },
        })
      );

      expect(removeOneTableRowActionsFromProps.view.table.rowActions).toHaveLength(1);
      expect(removeOneTableRowActionsFromProps.view.table.rowActions).toEqual([
        {
          rowId: 'row-1',
          isEditMode: true,
        },
      ]);
      expect(removeOneTableRowActionsFromProps.view.toolbar.activeBar).toEqual('rowEdit');

      const turnOffRowEditActiveBar = tableReducer(
        removeOneTableRowActionsFromProps,
        tableRegister({
          view: {
            toolbar: {
              activeBar: undefined,
            },
            table: {
              rowActions: [],
            },
          },
        })
      );

      expect(turnOffRowEditActiveBar.view.table.rowActions).toHaveLength(0);
      expect(turnOffRowEditActiveBar.view.table.rowActions).toEqual([]);
      expect(turnOffRowEditActiveBar.view.toolbar.activeBar).toBeUndefined();

      // It updates element used for row editing
      const initialRowEditState = merge({}, initialState, {
        view: {
          toolbar: { rowEditBarButtons: <div>initial</div> },
          table: { singleRowEditButtons: <div>initial</div> },
        },
      });
      const modifiedRowEditState = tableReducer(
        initialRowEditState,
        tableRegister({
          view: {
            toolbar: { rowEditBarButtons: <div>updated</div> },
            table: { singleRowEditButtons: <div>updated</div> },
          },
        })
      );
      expect(modifiedRowEditState.view.toolbar.rowEditBarButtons).toEqual(<div>updated</div>);
      expect(modifiedRowEditState.view.table.singleRowEditButtons).toEqual(<div>updated</div>);
    });

    it('REGISTER_TABLE with empty string filtering', () => {
      const modifiedInitialState = getInitialState();
      const hasEmptyFilterOption = true;
      const hasMultiSelectFilter = false;

      modifiedInitialState.columns = decorateTableColumns(
        getTableColumns(),
        hasEmptyFilterOption,
        hasMultiSelectFilter
      );

      modifiedInitialState.data = getTableDataWithEmptySelectFilter();

      modifiedInitialState.view.filters = [
        {
          columnId: 'select',
          value: '',
        },
      ];

      const tableWithEmptyStringFilter = tableReducer(modifiedInitialState, tableRegister({}));

      expect(tableWithEmptyStringFilter.view.table.filteredData).toHaveLength(33);
    });

    it('REGISTER_TABLE with all rows selected', () => {
      const initialState = getInitialState();
      initialState.data = getTableData().map((row, index) => addChildRows(row, index));
      const allRowsId = [];
      initialState.data.forEach((row) => fillArrWithRowIds(row, allRowsId));

      const tableWithEmptyStringFilter = tableReducer(
        initialState,
        tableRegister({
          view: { table: { selectedIds: allRowsId } },
          hasRowSelection: 'multi',
        })
      );

      expect(tableWithEmptyStringFilter.view.table.isSelectAllSelected).toBe(true);
    });
  });
});

describe('filter, search and sort', () => {
  it('filterData', () => {
    const mockData = [
      { values: { number: 10, node: <Add size={20} />, string: 'string', null: null } },
    ];
    const mockDataWithMultiselect = [
      {
        values: {
          number: 10,
          select: 'option-B',
          string: 'string',
          null: null,
        },
      },
      {
        values: { number: 8, select: 'option-A', string: 'string', null: null },
      },
      {
        values: { number: 8, select: 'option-C', string: 'string', null: null },
      },
    ];
    const stringFilter = { columnId: 'string', value: 'String' };
    const numberFilter = { columnId: 'number', value: 10 };
    const multiselectFilter = {
      columnId: 'select',
      value: ['option-A', 'option-B'],
    };
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    // case insensitive
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    expect(filterData(mockData, [numberFilter])).toHaveLength(1);
    expect(filterData(mockDataWithMultiselect, [multiselectFilter])).toHaveLength(2);
  });

  it('filterData with custom comparison', () => {
    const dateValue = new Date();
    const mockData = [
      {
        values: {
          number: 10,
          node: <Add size={20} />,
          string: 'string',
          null: null,
          date: dateValue.toISOString().split('T')[0],
        },
      },
    ];
    const stringFilter = { columnId: 'string', value: 'String' };
    const numberFilter = { columnId: 'number', value: 10 };
    const dateFilter = { columnId: 'date', value: dateValue };

    const customFilterFunction = (columnFilterValue, value) => columnFilterValue === value;
    const customDateFilterFunction = (columnFilterValue, value) =>
      columnFilterValue.split('T')[0] === new Date(value).toISOString().split('T')[0];
    expect(
      filterData(
        mockData,
        [stringFilter],
        [{ id: 'string', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(0);
    // partial
    expect(
      filterData(
        mockData,
        [{ columnId: 'string', value: 'str' }],
        [{ id: 'string', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(0);
    // case insensitive
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    expect(
      filterData(
        mockData,
        [numberFilter],
        [{ id: 'number', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(1);
    // date
    expect(
      filterData(
        mockData,
        [dateFilter],
        [{ id: 'date', filter: { filterFunction: customDateFilterFunction } }]
      )
    ).toHaveLength(1);
  });

  it('searchData', () => {
    const mockData = [
      {
        values: {
          number: 10,
          node: <Add size={20} />,
          string: 'string',
          null: null,
          boolean: true,
        },
      },
      {
        values: {
          number: 30,
          node: <Add size={20} />,
          string: 'text',
          null: null,
          boolean: false,
        },
      },
    ];
    expect(searchData(mockData, 10)).toHaveLength(1);
    expect(searchData(mockData, 'string')).toHaveLength(1);
    // case insensitive
    expect(searchData(mockData, 'STRING')).toHaveLength(1);

    // search boolean values
    expect(searchData(mockData, 'false')).toHaveLength(1);
    expect(searchData(mockData, 'true')).toHaveLength(1);
  });

  it('filterSearchAndSort', () => {
    const mockData = [
      { values: { number: 10, node: <Add size={20} />, string: 'string', null: null } },
    ];
    expect(filterSearchAndSort(mockData)).toHaveLength(1);
    expect(filterSearchAndSort(mockData, {}, { value: 10 })).toHaveLength(1);
    expect(filterSearchAndSort(mockData, {}, { value: 20 })).toHaveLength(0);
    expect(
      filterSearchAndSort(mockData, {}, {}, [{ columnId: 'string', value: 'string' }])
    ).toHaveLength(1);
    expect(
      filterSearchAndSort(mockData, {}, {}, [{ columnId: 'string', value: 'none' }])
    ).toHaveLength(0);
  });
  it('filterSearchAndSort with custom sort function', () => {
    const mockData = [
      { values: { number: 10, node: <Add size={20} />, severity: 'High', null: null } },
      { values: { number: 10, node: <Add size={20} />, severity: 'Low', null: null } },
      {
        values: { number: 10, node: <Add size={20} />, severity: 'Medium', null: null },
      },
    ];
    const mockSortFunction = jest.fn().mockReturnValue(mockData);
    expect(
      filterSearchAndSort(
        mockData,
        { columnId: 'severity', direction: 'ASC' },
        {},
        [],
        [{ id: 'severity', sortFunction: mockSortFunction }]
      )
    ).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();
  });

  it('filterSearchAndSort with multisort and custom sort function', () => {
    const mockData = [
      { values: { number: 10, node: <Add size={20} />, severity: 'High', null: null } },
      { values: { number: 10, node: <Add size={20} />, severity: 'Low', null: null } },
      {
        values: { number: 10, node: <Add size={20} />, severity: 'Medium', null: null },
      },
    ];

    const mockSortFunction = jest.fn(({ data, columnId, direction }) => {
      const sortedData = data.slice();

      sortedData.sort((a, b) => {
        const aSev = a.values[columnId];
        const bSev = b.values[columnId];
        let compare = -1;
        switch (`${aSev}-${bSev}`) {
          case 'Low-Medium':
          case 'Low-High':
          case 'Medium-High':
            compare = -1;
            break;
          case 'Medium-Low':
          case 'High-Low':
          case 'High-Medium':
            compare = 1;
            break;
          default:
            compare = 0;
            break;
        }

        return direction === 'ASC' ? compare : -compare;
      });

      return sortedData;
    });

    const sortedResult = filterSearchAndSort(
      mockData.slice(),
      [
        { columnId: 'number', direction: 'ASC' },
        { columnId: 'severity', direction: 'ASC' },
      ],
      {},
      [],
      [
        { id: 'severity', sortFunction: mockSortFunction, isSortable: true },
        { id: 'number', isSortable: true },
      ]
    );
    expect(sortedResult).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();

    // low
    expect(sortedResult[0]).toEqual(mockData[1]);
    // medium
    expect(sortedResult[1]).toEqual(mockData[2]);
    // high
    expect(sortedResult[2]).toEqual(mockData[0]);

    // flip the direction now
    const sortedResultDesc = filterSearchAndSort(
      mockData.slice(),
      [
        { columnId: 'number', direction: 'ASC' },
        { columnId: 'severity', direction: 'DESC' },
      ],
      {},
      [],
      [
        { id: 'severity', sortFunction: mockSortFunction, isSortable: true },
        { id: 'number', isSortable: true },
      ]
    );
    expect(sortedResultDesc).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();
    // high
    expect(sortedResultDesc[0]).toEqual(mockData[0]);
    // medium
    expect(sortedResultDesc[1]).toEqual(mockData[2]);
    // low
    expect(sortedResultDesc[2]).toEqual(mockData[1]);
  });

  it('TABLE_ADVANCED_FILTER_REMOVE', () => {
    const myState = merge({}, initialState, {
      view: { selectedAdvancedFilterIds: ['id1', 'id2'] },
    });
    const removeAction = tableAdvancedFiltersRemove('id1');
    const newState = tableReducer(myState, removeAction);
    expect(newState.view.selectedAdvancedFilterIds).toEqual(['id2']);
  });

  it('TABLE_ADVANCED_FILTER_CHANGE', () => {
    const changeAction = tableAdvancedFiltersChange();
    const state = tableReducer(initialState, changeAction);
    expect(state).toBe(initialState);
  });

  it('TABLE_ADVANCED_FILTER_CREATE', () => {
    const changeAction = tableAdvancedFiltersCreate();
    const state = tableReducer(initialState, changeAction);
    expect(state).toBe(initialState);
  });

  it('TABLE_ADVANCED_FILTER_CANCEL', () => {
    const openState = merge({}, initialState, {
      view: { toolbar: { advancedFilterFlyoutOpen: true } },
    });
    const changeAction = tableAdvancedFiltersCancel();
    const cancelledState = tableReducer(openState, changeAction);
    expect(cancelledState.view.toolbar.advancedFilterFlyoutOpen).toBe(false);

    const cancelledState2 = tableReducer(cancelledState, changeAction);
    expect(cancelledState2.view.toolbar.advancedFilterFlyoutOpen).toBe(false);
  });

  it('TABLE_ADVANCED_FILTER_APPLY', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'story-filter',
            filterTitleText: 'test filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'rsiru4rjba',
                  columnId: 'date',
                  operand: 'CONTAINS',
                  value: '19',
                },
                {
                  id: '34bvyub9jq',
                  columnId: 'boolean',
                  operand: 'NEQ',
                  value: 'true',
                },
                {
                  id: '89h2eiuhd9c',
                  columnId: 'number',
                  operand: 'GT',
                  value: 100,
                },
              ],
            },
          },
        ],
      },
    });
    expect(myState.view.table.filteredData).toBeUndefined();

    const actionPayload = {
      simple: { select: 'option-C', string: 'whiteboard' },
      advanced: { filterIds: ['story-filter'] },
    };
    const applyAction = tableAdvancedFiltersApply(actionPayload);
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.toolbar.advancedFilterFlyoutOpen).toBe(false);
    expect(newState.view.selectedAdvancedFilterIds).toEqual(['story-filter']);
    expect(newState.view.table.filteredData).toHaveLength(1);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - NEQ', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'date',
                  operand: 'CONTAINS',
                  value: '19',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(36);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - LT', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'number',
                  operand: 'LT',
                  value: '100',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(1);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - LTOET', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'number',
                  operand: 'LTOET',
                  value: '100',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(2);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - EQ', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'string',
                  operand: 'EQ',
                  value: 'as eat scott 3',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(1);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - GTOET', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'number',
                  operand: 'GTOET',
                  value: '100',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(65);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - GT', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'number',
                  operand: 'GT',
                  value: '100',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(64);
  });

  it('TABLE_ADVANCED_FILTER_APPLY - CONTAINS', () => {
    const myState = merge({}, initialState, {
      view: {
        advancedFilters: [
          {
            filterId: 'test-filter',
            filterRules: {
              groupLogic: 'ALL',
              rules: [
                {
                  id: 'testContains',
                  columnId: 'string',
                  operand: 'CONTAINS',
                  value: 'scott',
                },
              ],
            },
          },
        ],
      },
    });

    const applyAction = tableAdvancedFiltersApply({ advanced: { filterIds: ['test-filter'] } });
    const newState = tableReducer(myState, applyAction);
    expect(newState.view.table.filteredData).toHaveLength(20);
  });
});
