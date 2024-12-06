import { mount } from 'enzyme';
import React from 'react';
import { merge, pick, cloneDeep } from 'lodash-es';
import { screen, render, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Screen, ViewOff } from '@carbon/react/icons';
import { BreadcrumbItem } from '@carbon/react';

import { settings } from '../../constants/Settings';
import { EMPTY_STRING_DISPLAY_VALUE } from '../../constants/Filters';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

import * as reducer from './baseTableReducer';
import StatefulTable from './StatefulTable';
import TableSkeletonWithHeaders from './TableSkeletonWithHeaders/TableSkeletonWithHeaders';
import {
  getMockActions,
  getNestedRows,
  getNestedRowIds,
  getSelectData,
  getTableColumns,
} from './Table.test.helpers';
import RowActionsCell from './TableBody/RowActionsCell/RowActionsCell';
import {
  addChildRows,
  getInitialState,
  getRowActions,
  getTableData,
  decorateTableColumns,
  getTableDataWithEmptySelectFilter,
} from './Table.story.helpers';

const { prefix, iotPrefix } = settings;
const mockActions = getMockActions(jest.fn);
const selectData = getSelectData();
const tableColumns = getTableColumns(selectData);
const tableData = getTableData();
const initialState = getInitialState();

describe('stateful table with real reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('row drag and drop', () => {
    it('can drop single and multi on a accepting row', () => {
      const data = [
        {
          id: '0',
          values: {
            string: 'row 0',
          },
          isDraggable: true,
        },
        {
          id: '1',
          values: {
            string: 'row 1',
          },
          isDraggable: true,
        },
        {
          id: '2',
          values: {
            string: 'row 2',
          },
          isDraggable: true,
        },
      ];

      let lastDragRowIds;
      let lastDropRowId;

      const { container } = render(
        <StatefulTable
          id="dndTable"
          columns={tableColumns}
          data={data}
          options={{ hasDragAndDrop: true, hasRowSelection: 'multi' }}
          actions={{
            table: {
              onDrag() {
                return {
                  dropIds: ['2'],
                  preview: 'mock preview',
                };
              },
              onDrop(dragRowIds, dropRowId) {
                lastDragRowIds = dragRowIds;
                lastDropRowId = dropRowId;
              },
            },
          }}
        />
      );

      const dragHandles = container.querySelectorAll(`.${iotPrefix}--table-drag-handle`);
      expect(dragHandles.length).toBe(3);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3 + 1); // include the checkbox in the header

      //
      // Drag row 0 to row 2

      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 1, clientY: 1 });
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 20, clientY: 20 });
      fireEvent.mouseEnter(dragHandles[0]);
      fireEvent.mouseLeave(dragHandles[0]);

      fireEvent.mouseMove(dragHandles[2], { buttons: 1, clientX: 10, clientY: 10 }); // Testing mouse move less that and more than required threshold to start drag
      fireEvent.mouseEnter(dragHandles[2]);
      fireEvent.mouseLeave(dragHandles[2]);

      fireEvent.mouseMove(dragHandles[1], { buttons: 1, clientX: 1, clientY: 1 });
      fireEvent.mouseEnter(dragHandles[1]);
      fireEvent.mouseLeave(dragHandles[1]);

      fireEvent.mouseMove(dragHandles[2], { buttons: 1, clientX: 100, clientY: 100 }); // Testing mouse move less that and more than required threshold to start drag
      fireEvent.mouseEnter(dragHandles[2]);
      fireEvent.mouseUp(dragHandles[2]);

      expect(lastDragRowIds).toEqual(['0']);
      expect(lastDropRowId).toBe('2');

      //
      // Select two rows (0 and 1) and drag both to row 2
      userEvent.click(checkboxes[1]);
      userEvent.click(checkboxes[2]);

      fireEvent.mouseDown(dragHandles[0]);
      // click should be stopped and ignored
      fireEvent.click(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(dragHandles[2], { buttons: 1, clientX: 10, clientY: 10 });
      fireEvent.mouseMove(dragHandles[2], { buttons: 1, clientX: 10, clientY: 10 });
      fireEvent.mouseEnter(dragHandles[2]);
      fireEvent.mouseEnter(dragHandles[2]);
      fireEvent.mouseUp(dragHandles[2]);

      expect(lastDragRowIds).toEqual(['0', '1']);
      expect(lastDropRowId).toBe('2');
    });

    it('does not drop if canceled or wrong row', () => {
      const data = [
        {
          id: '0',
          values: {
            string: 'row 0',
          },
          isDraggable: true,
        },
        {
          id: '1',
          values: {
            string: 'row 1',
          },
          isDraggable: true,
        },
      ];

      const handleDrag = jest.fn();

      const { container } = render(
        <StatefulTable
          id="dndTable"
          columns={tableColumns}
          data={data}
          options={{ hasDragAndDrop: true }}
          actions={{
            table: {
              onDrag() {
                handleDrag();
                return {
                  dropIds: ['1'],
                  preview: 'mock preview',
                };
              },
              onDrop() {
                throw new Error('should not drop after Esc key');
              },
            },
          }}
        />
      );

      const dragHandles = container.querySelectorAll(`.${iotPrefix}--table-drag-handle`);
      expect(dragHandles.length).toBe(2);

      //
      // Press escape during a drag
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(dragHandles[1], { buttons: 1, clientX: 10, clientY: 10 });
      fireEvent.mouseEnter(dragHandles[1]);
      // This should stop the drag and onDrop never fires
      fireEvent.keyDown(container, { key: 'a' }); // this is ignored, but needed for code coverage
      fireEvent.keyDown(container, { key: 'Escape' });
      fireEvent.mouseUp(dragHandles[1]);

      //
      // mouse out of window with mouse up during a drag (implicit cancel)
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(dragHandles[1], { buttons: 1, clientX: 10, clientY: 10 });
      // Simulate mouse going up without a mouseup (pointer was out of the window when it happened)
      fireEvent.mouseMove(dragHandles[1], { buttons: 0, clientX: 10, clientY: 10 });
      fireEvent.mouseUp(dragHandles[1]);

      //
      // drop not on a drop row
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 10, clientY: 10 });
      fireEvent.mouseUp(dragHandles[0], { buttons: 0, clientX: 20, clientY: 20 });

      // Make sure we started the drags
      expect(handleDrag).toHaveBeenCalledTimes(3);
    });

    it('does drop over breadcrumb node', () => {
      // Reduce screen size to show overflow menu inside the breadcrumb
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const data = [
        {
          id: '0',
          values: {
            string: 'row 0',
          },
          isDraggable: true,
        },
        {
          id: '1',
          values: {
            string: 'row 1',
          },
          isDraggable: true,
        },
      ];

      const handleDrag = jest.fn();
      let lastDroppedOnNode;

      const { container } = render(
        <>
          <div style={{ width: '40vw', padding: 10 }}>
            <Breadcrumb hasOverflow>
              <BreadcrumbItem href="#" title="Folder with very long name is created for example">
                Folder with very long name is created for example
              </BreadcrumbItem>
              <BreadcrumbItem href="#" title="2 Devices">
                2 Devices
              </BreadcrumbItem>
              <BreadcrumbItem href="#" title="A really long folder name">
                A really long folder name
              </BreadcrumbItem>
              <BreadcrumbItem href="#" title="4 Another folder">
                4 Another folder
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage title="5th level folder">
                5th level folder
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <StatefulTable
            id="dndTable"
            columns={tableColumns}
            data={data}
            options={{ hasDragAndDrop: true, hasBreadcrumbDrop: true }}
            actions={{
              table: {
                onDrag() {
                  handleDrag();
                  return {
                    dropIds: ['Folder 1'],
                    preview: 'mock preview',
                  };
                },
                onDrop(dragRowId, droppedOnNode) {
                  lastDroppedOnNode = droppedOnNode;
                },
              },
            }}
          />
        </>
      );

      const breadcrumbNodes = container.querySelectorAll(`.${prefix}--breadcrumb-item`);
      // will return 3 as screen size is reduced
      expect(breadcrumbNodes.length).toBe(3);

      const dragHandles = container.querySelectorAll(`.${iotPrefix}--table-drag-handle`);
      expect(dragHandles.length).toBe(2);

      // mimicks drop over breadcrumb node
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(breadcrumbNodes[0], { buttons: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseEnter(breadcrumbNodes[0]);
      fireEvent.mouseUp(breadcrumbNodes[0]);

      expect(lastDroppedOnNode).toEqual(breadcrumbNodes[0]);
      expect(lastDroppedOnNode.title).toEqual('Folder with very long name is created for example');

      // mimicks hover over breadcrumb node but won't drop
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(breadcrumbNodes[0], { clientX: 100, clientY: 100 });
      fireEvent.mouseEnter(breadcrumbNodes[0]);
      fireEvent.mouseLeave(breadcrumbNodes[0]);
      // Added to avoid warning of wrraping in act() in case of state change due to mouse events
      fireEvent.keyDown(container, { key: 'a' }); // this is ignored, but needed for code coverage
      fireEvent.keyDown(container, { key: 'Escape' });

      const ellipsisNode = container.querySelectorAll(`.${prefix}--overflow-menu`);

      userEvent.click(ellipsisNode[0]);
      const overflowMenuNode = screen.getByText('A really long folder name').closest('li');

      // mimicks drop over breadcrumb node inside overflow menu
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(overflowMenuNode, { clientX: 100, clientY: 100 });
      fireEvent.mouseEnter(overflowMenuNode);
      fireEvent.mouseUp(overflowMenuNode);

      expect(lastDroppedOnNode).toEqual(overflowMenuNode);

      // mimicks hover over breadcrumb node inside overflow menu but won't drop
      fireEvent.mouseDown(dragHandles[0]);
      fireEvent.mouseMove(dragHandles[0], { buttons: 1, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(overflowMenuNode, { clientX: 100, clientY: 100 });
      fireEvent.mouseEnter(overflowMenuNode);
      fireEvent.mouseLeave(overflowMenuNode);

      delete HTMLElement.prototype.clientWidth;
      delete HTMLElement.prototype.scrollWidth;
    });
  });

  it('should clear filters', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<StatefulTable {...initialState} actions={mockActions} />);

    const whiteboardFilter = await screen.findByDisplayValue('whiteboard');
    expect(whiteboardFilter).toBeInTheDocument();
    expect(screen.getByDisplayValue('option-B')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear all filters'));
    expect(mockActions.toolbar.onClearAllFilters).toHaveBeenCalled();
    expect(screen.queryByDisplayValue('whiteboard')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('option-B')).not.toBeInTheDocument();
  });
  it('verify stateful table can support loading state', () => {
    const statefulTable = mount(
      <StatefulTable
        {...merge({}, initialState, {
          view: { table: { loadingState: { isLoading: true } } },
        })}
        actions={mockActions}
      />
    );
    expect(statefulTable.find(TableSkeletonWithHeaders)).toHaveLength(1);
  });
  it('stateful table verify page change', () => {
    const statefulTable = mount(
      <StatefulTable
        {...merge(
          {},
          { ...pick(initialState, 'data', 'options', 'columns') },
          {
            view: {
              pagination: { page: 9 },
            },
          }
        )}
        actions={mockActions}
      />
    );
    statefulTable.find(`button.${prefix}--pagination__button--forward`).simulate('click');
    expect(statefulTable.text()).toContain('100 of 100');
  });
  it('should show singleRowEditButtons when choosing to edit a row', async () => {
    const statefulTable = mount(
      <StatefulTable
        {...merge({}, initialState, {
          view: {
            table: {
              rowActions: [],
              singleRowEditButtons: <div data-testid="myButtons">myButtons</div>,
            },
          },
        })}
        options={{
          hasRowActions: true,
          hasSingleRowEdit: true,
        }}
        actions={mockActions}
      />
    );
    expect(statefulTable.text()).not.toContain('myButtons');
    await act(async () => {
      await statefulTable.find(RowActionsCell).first().props().onApplyRowAction('edit', 'row-1');
    });

    expect(true).toBeTruthy();
    expect(statefulTable.text()).toContain('myButtons');
  });
  it('render nestedRows', async () => {
    const tableId = 'tableId';
    const data = getTableData()
      .slice(0, 10)
      .map((row, index) => {
        const parent = addChildRows(row, index, true);
        parent.rowActions = getRowActions(index);
        return parent;
      });

    render(
      <StatefulTable
        id={tableId}
        actions={mockActions}
        columns={getTableColumns()}
        data={data}
        options={{
          hasRowActions: true,
          hasRowNesting: true,
          shouldExpandOnRowClick: true,
        }}
      />
    );

    expect(screen.queryByText('whiteboard can eat 2A')).toBeNull();
    userEvent.click(
      screen
        .getByText('whiteboard can eat 2')
        .closest('tr')
        .querySelector(`.${prefix}--table-expand__button`)
    );
    expect(screen.getByText('whiteboard can eat 2A')).toBeTruthy();
    userEvent.click(screen.getByTestId(`${tableId}-row-2_A-row-actions-cell-overflow`));
    await act(async () => {
      const addBtn = await screen.findByText('Add');
      userEvent.click(addBtn);
    });

    expect(mockActions.table.onApplyRowAction).toHaveBeenCalled();
    userEvent.click(
      screen
        .getByText('can pinocchio whiteboard 4')
        .closest('tr')
        .querySelector(`.${prefix}--table-expand__button`)
    );
    userEvent.click(
      screen
        .getByText('can pinocchio whiteboard 4B')
        .closest('tr')
        .querySelector(`.${prefix}--table-expand__button`)
    );
    userEvent.click(
      screen
        .getByText('can pinocchio whiteboard 4B-2')
        .closest('tr')
        .querySelector(`.${prefix}--table-expand__button`)
    );
    expect(screen.getByText('can pinocchio whiteboard 4B-2-B')).toBeTruthy();
    userEvent.click(screen.getByTestId(`${tableId}-row-4_B-2-B-row-actions-cell-overflow`));
    await act(async () => {
      const addBtn = await screen.findByText('Add');
      userEvent.click(addBtn);
    });
    expect(mockActions.table.onApplyRowAction).toHaveBeenCalled();
  });
  it('handles row expansion with expandRowsExclusively', () => {
    render(
      <StatefulTable
        columns={tableColumns}
        data={tableData}
        actions={mockActions}
        options={{
          hasRowExpansion: { expandRowsExclusively: true },
        }}
        view={{
          table: {
            expandedIds: ['row-1'],
          },
        }}
      />
    );

    expect(screen.getAllByRole('button', { name: 'Click to collapse content' })).toHaveLength(1);
    userEvent.click(screen.getAllByRole('button', { name: 'Click to expand content' })[2]);

    expect(screen.getAllByRole('button', { name: 'Click to collapse content' })).toHaveLength(1);
    expect(mockActions.table.onRowExpanded).toHaveBeenCalledWith('row-3', true);
  });

  it('multiselect should filter properly with pre-selected filter', async () => {
    render(
      <StatefulTable
        {...initialState}
        columns={initialState.columns.map((column) => {
          if (column.filter) {
            return {
              ...column,
              filter: {
                ...column.filter,
                isMultiselect: !!column.filter?.options,
              },
            };
          }
          return column;
        })}
        view={{
          ...initialState.view,
          filters: [{ columnId: 'select', value: 'option-B' }], // start with filtering by option-B
          pagination: {
            ...initialState.view.pagination,
            maxPages: 10,
          },
          toolbar: {
            activeBar: 'filter',
          },
        }}
        secondaryTitle={`Row count: ${initialState.data.length}`}
        actions={mockActions}
        options={{
          ...initialState.options,
          hasFilter: 'onKeyPress',
          wrapCellText: 'always',
          hasSingleRowEdit: true,
        }}
      />
    );
    // start off with a filter of option-B.
    // Note: each options length count has an extra item due to the multiselect having the same title attribute as the row cell
    const initialFilteredRowsOptionA = screen.queryByTitle('option-A');
    const initialFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const initialFilteredRowsOptionC = screen.queryByTitle('option-C');
    const initialItemCount = screen.getByText('1–10 of 33 items'); // confirm row count in the pagination
    expect(initialFilteredRowsOptionA).toBeNull();
    expect(initialFilteredRowsOptionB).toHaveLength(10);
    expect(initialFilteredRowsOptionC).toBeNull();
    expect(initialItemCount).toBeInTheDocument();
    // next add an additional filter with option-A
    // open the multiselect
    userEvent.click(screen.getByPlaceholderText('pick an option'));
    userEvent.click(screen.getByRole('option', { name: 'option-A' })); // fire click on option-A in our multiselect
    const secondFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const secondFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const secondFilteredRowsOptionC = screen.queryByTitle('option-C');
    const secondItemCount = screen.getByText('1–10 of 67 items'); // confirm row count in the pagination
    expect(secondFilteredRowsOptionA).toHaveLength(5);
    expect(secondFilteredRowsOptionB).toHaveLength(5);
    expect(secondFilteredRowsOptionC).toBeNull();
    expect(secondItemCount).toBeInTheDocument();
    // next remove filter for option-B
    // open the multiselect
    userEvent.click(screen.getAllByPlaceholderText('pick an option')[0]);
    userEvent.click(screen.getByRole('option', { name: 'option-B' })); // fire click on option-B in our multiselect
    const thirdFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const thirdFilteredRowsOptionB = screen.queryByTitle('option-B');
    const thirdFilteredRowsOptionC = screen.queryByTitle('option-C');
    const thirdItemCount = screen.getByText('1–10 of 34 items'); // confirm row count in the pagination
    expect(thirdFilteredRowsOptionA).toHaveLength(10);
    expect(thirdFilteredRowsOptionB).toBeNull();
    expect(thirdFilteredRowsOptionC).toBeNull();
    expect(thirdItemCount).toBeInTheDocument();
    // next clear all filters from the multiselect
    const clearSelectBox = screen.getByLabelText('Clear selection');
    expect(clearSelectBox).toBeInTheDocument();
    userEvent.click(clearSelectBox);
    const fourthFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const fourthFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const fourthFilteredRowsOptionC = screen.queryAllByTitle('option-C');
    const fourthItemCount = screen.getByText('1–10 of 100 items'); // confirm row count in the pagination
    expect(fourthFilteredRowsOptionA).toHaveLength(4);
    expect(fourthFilteredRowsOptionB).toHaveLength(3);
    expect(fourthFilteredRowsOptionC).toHaveLength(3);
    expect(fourthItemCount).toBeInTheDocument();
  });
  it('select should filter properly with empty string value', async () => {
    const hasEmptyFilterOption = true;
    const hasMultiSelectFilter = false;

    const { container } = render(
      <StatefulTable
        columns={decorateTableColumns(
          getTableColumns(),
          hasEmptyFilterOption,
          hasMultiSelectFilter
        )}
        data={getTableDataWithEmptySelectFilter()}
        actions={mockActions}
        options={initialState.options}
        view={{
          filters: [
            {
              columnId: 'select',
              value: 'option-B',
            },
          ],
          toolbar: {
            activeBar: 'filter',
          },
          pagination: {
            pageSize: 10,
            pageSizes: [10, 20, 30],
            page: 1,
          },
        }}
      />
    );

    // start off with a filter of option-B.
    // Note: each options length count has an extra item due to the multiselect having the same title attribute as the row cell
    const initialFilteredRowsOptionA = screen.queryByTitle('option-A');
    const initialFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const initialItemCount = screen.getByText('1–10 of 33 items');
    expect(initialFilteredRowsOptionA).toBeNull();
    expect(initialFilteredRowsOptionB).toHaveLength(11);
    expect(initialItemCount).toBeInTheDocument();

    // next select a filter with empty string option
    userEvent.click(screen.getByPlaceholderText('pick an option'));
    userEvent.click(screen.getByRole('option', { name: EMPTY_STRING_DISPLAY_VALUE }));
    const secondFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const secondFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const secondItemCount = screen.getByText('1–10 of 33 items');
    expect(secondFilteredRowsOptionA).toEqual([]);
    expect(secondFilteredRowsOptionB).toEqual([]);
    expect(secondItemCount).toBeInTheDocument();
    expect(container.querySelectorAll('tr')).toHaveLength(12);

    // next select a filter with option-A
    userEvent.click(screen.getByPlaceholderText('pick an option'));
    userEvent.click(screen.getByRole('option', { name: 'option-A' }));
    const thirdFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const thirdFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const thirdItemCount = screen.getByText('1–10 of 34 items');
    expect(thirdFilteredRowsOptionA).toHaveLength(11);
    expect(thirdFilteredRowsOptionB).toEqual([]);
    expect(thirdItemCount).toBeInTheDocument();

    // next clear all filters from the select
    const clearSelectBox = screen.getByLabelText('Clear selection');
    expect(clearSelectBox).toBeInTheDocument();
    userEvent.click(clearSelectBox);
    const fourthFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const fourthFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const fourthItemCount = screen.getByText('1–10 of 100 items');
    expect(fourthFilteredRowsOptionA).toHaveLength(4);
    expect(fourthFilteredRowsOptionB).toHaveLength(3);
    expect(fourthItemCount).toBeInTheDocument();
  });

  it('multiselect should filter properly with empty string value', async () => {
    const hasEmptyFilterOption = true;
    const hasMultiSelectFilter = true;

    const { container } = render(
      <StatefulTable
        columns={decorateTableColumns(
          getTableColumns(),
          hasEmptyFilterOption,
          hasMultiSelectFilter
        )}
        data={getTableDataWithEmptySelectFilter()}
        actions={mockActions}
        options={initialState.options}
        view={{
          filters: [
            {
              columnId: 'select',
              value: 'option-B',
            },
          ],
          toolbar: {
            activeBar: 'filter',
          },
          pagination: {
            pageSize: 10,
            pageSizes: [10, 20, 30],
            page: 1,
          },
        }}
      />
    );

    // start off with a filter of option-B.
    // Note: each options length count has an extra item due to the multiselect having the same title attribute as the row cell
    const initialFilteredRowsOptionA = screen.queryByTitle('option-A');
    const initialFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const initialItemCount = screen.getByText('1–10 of 33 items');
    expect(initialFilteredRowsOptionA).toBeNull();
    expect(initialFilteredRowsOptionB).toHaveLength(10);
    expect(initialItemCount).toBeInTheDocument();

    // next select a filter with empty string option
    userEvent.click(screen.getByPlaceholderText('pick an option'));
    userEvent.click(screen.getByRole('option', { name: EMPTY_STRING_DISPLAY_VALUE }));
    const secondFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const secondFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const secondItemCount = screen.getByText('1–10 of 66 items');
    expect(secondFilteredRowsOptionA).toEqual([]);
    expect(secondFilteredRowsOptionB).toHaveLength(5);
    expect(secondItemCount).toBeInTheDocument();
    expect(container.querySelectorAll('tr')).toHaveLength(12);

    // next remove select from filter with option-B
    userEvent.click(screen.getByPlaceholderText('pick an option'));
    userEvent.click(screen.getByRole('option', { name: 'option-B' }));
    const thirdFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const thirdFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const thirdItemCount = screen.getByText('1–10 of 33 items');
    expect(thirdFilteredRowsOptionA).toEqual([]);
    expect(thirdFilteredRowsOptionB).toEqual([]);
    expect(thirdItemCount).toBeInTheDocument();
    expect(container.querySelectorAll('tr')).toHaveLength(12);

    // next clear all filters from the select
    const clearSelectBox = screen.getByLabelText('Clear selection');
    expect(clearSelectBox).toBeInTheDocument();
    userEvent.click(clearSelectBox);
    const fourthFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const fourthFilteredRowsOptionB = screen.queryAllByTitle('option-B');
    const fourthItemCount = screen.getByText('1–10 of 100 items');
    expect(fourthFilteredRowsOptionA).toHaveLength(4);
    expect(fourthFilteredRowsOptionB).toHaveLength(3);
    expect(fourthItemCount).toBeInTheDocument();
  });
  it('multiselect should filter properly with no pre-selected filters', async () => {
    render(
      <StatefulTable
        {...initialState}
        columns={initialState.columns.map((column) => {
          if (column.filter) {
            return {
              ...column,
              filter: {
                ...column.filter,
                isMultiselect: !!column.filter?.options,
              },
            };
          }
          return column;
        })}
        view={{
          ...initialState.view,
          filters: [], // start with no filters
          pagination: {
            ...initialState.view.pagination,
            maxPages: 10,
          },
          toolbar: {
            activeBar: 'filter',
          },
          table: {
            ...initialState.view.table,
            sort: {
              select: {
                columnId: 'select',
                direction: 'DESC',
              },
            },
          },
        }}
        secondaryTitle={`Row count: ${initialState.data.length}`}
        actions={mockActions}
        options={{
          ...initialState.options,
          hasFilter: 'onKeyPress',
          wrapCellText: 'always',
          hasSingleRowEdit: true,
        }}
      />
    );
    // start off with no filters.
    const initialFilteredRowsOptionA = screen.getAllByTitle('option-A');
    const initialFilteredRowsOptionB = screen.getAllByTitle('option-B');
    const initialFilteredRowsOptionC = screen.getAllByTitle('option-C');
    const initialItemCount = screen.getByText('1–10 of 100 items'); // confirm row count in the pagination
    expect(screen.queryByLabelText('Clear selection')).toBeNull(); // there should be no clear button when there are no filters selected
    expect(initialFilteredRowsOptionA).toHaveLength(4);
    expect(initialFilteredRowsOptionB).toHaveLength(3);
    expect(initialFilteredRowsOptionC).toHaveLength(3);
    expect(initialItemCount).toBeInTheDocument();
    // next add an a filter with option-A
    // open the multiselect
    userEvent.click(screen.getAllByPlaceholderText('pick an option')[0]);
    userEvent.click(screen.getByRole('option', { name: 'option-A' })); // fire click on option-A in our multiselect
    const secondFilteredRowsOptionA = screen.queryAllByTitle('option-A');
    const secondFilteredRowsOptionB = screen.queryByTitle('option-B');
    const secondFilteredRowsOptionC = screen.queryByTitle('option-C');
    const secondItemCount = screen.getByText('1–10 of 34 items'); // confirm row count in the pagination
    expect(secondFilteredRowsOptionA).toHaveLength(10);
    expect(secondFilteredRowsOptionB).toBeNull();
    expect(secondFilteredRowsOptionC).toBeNull();
    expect(secondItemCount).toBeInTheDocument();
    // next clear all filters from the multiselect
    const clearSelectBox = screen.getByLabelText('Clear selection');
    expect(clearSelectBox).toBeInTheDocument();
    fireEvent.click(clearSelectBox);
    const fourthFilteredRowsOptionA = await screen.findAllByTitle('option-A');
    const fourthFilteredRowsOptionB = await screen.findAllByTitle('option-B');
    const fourthFilteredRowsOptionC = await screen.findAllByTitle('option-C');
    const fourthItemCount = screen.getByText('1–10 of 100 items'); // confirm row count in the pagination
    expect(fourthFilteredRowsOptionA).toHaveLength(4);
    expect(fourthFilteredRowsOptionB).toHaveLength(3);
    expect(fourthFilteredRowsOptionC).toHaveLength(3);
    expect(fourthItemCount).toBeInTheDocument();
    userEvent.click(screen.getByTitle('Select'));
    expect(mockActions.table.onChangeSort).toHaveBeenCalledWith('select', undefined);
  });
  it('re-renders custom toolbar elements', () => {
    const tableId = 'tableId';
    const TestComp = ({ myMessage }) => {
      return <div>{myMessage}</div>;
    };
    const AppWrapper = ({ message }) => {
      return (
        <StatefulTable
          id={tableId}
          {...merge({}, initialState, {
            view: {
              toolbar: {
                customToolbarContent: <TestComp myMessage={message} />,
              },
            },
          })}
          actions={mockActions}
        />
      );
    };
    const { rerender } = render(<AppWrapper message="message1" />);
    expect(screen.queryByText('message1')).toBeVisible();
    rerender(<AppWrapper message="message2" />);
    expect(screen.queryByText('message2')).toBeVisible();
  });
  it('returns columns, view and search value in callback onUserViewModified', () => {
    let viewProps;
    const onUserViewModified = jest
      .fn()
      .mockImplementation(({ view, columns, state: { currentSearchValue } }) => {
        viewProps = {
          columns,
          view: {
            filters: view.filters,
            table: { ordering: view.table.ordering, sort: view.table.sort },
            toolbar: {
              activeBar: view.toolbar.activeBar,
              search: {
                ...view.toolbar.search,
                defaultValue: currentSearchValue,
              },
            },
          },
        };
      });
    render(
      <StatefulTable
        {...merge({}, initialState, {
          view: { toolbar: { search: { defaultValue: 'Initial search' } } },
        })}
        options={{ ...initialState.options, hasUserViewManagement: true }}
        actions={{ ...mockActions, onUserViewModified }}
        data={[initialState.data[0]]}
      />
    );
    fireEvent.click(screen.getByText('Clear all filters'));
    expect(viewProps).toEqual({
      columns: initialState.columns,
      view: {
        filters: [],
        table: { ordering: initialState.view.table.ordering, sort: {} },
        toolbar: {
          activeBar: initialState.view.toolbar.activeBar,
          search: {
            ...initialState.view.toolbar.search,
            defaultValue: 'Initial search',
          },
        },
      },
    });
    const searchField = screen.queryByRole('searchbox');
    fireEvent.change(searchField, { target: { value: 'testval1' } });
    expect(viewProps).toEqual({
      columns: initialState.columns,
      view: {
        filters: [],
        table: { ordering: initialState.view.table.ordering, sort: {} },
        toolbar: {
          activeBar: initialState.view.toolbar.activeBar,
          search: {
            ...initialState.view.toolbar.search,
            defaultValue: 'testval1',
          },
        },
      },
    });
  });
  it('stateful table total items can be set independently', () => {
    const totalItems = 500;
    render(
      <StatefulTable
        {...merge(
          {},
          { ...pick(initialState, 'data', 'options', 'columns') },
          {
            view: {
              pagination: { totalItems },
            },
          }
        )}
      />
    );
    expect(initialState.data.length).toEqual(100);
    expect(screen.queryByText('1–10 of 500 items')).toBeTruthy();
  });
  it('stateful table every third row unselectable', () => {
    const modifiedData = initialState.data.map((eachRow, index) => ({
      ...eachRow,
      isSelectable: index % 3 !== 0,
    }));
    const dataCount = modifiedData.filter((data) => data.isSelectable).length;
    render(
      <StatefulTable
        {...merge({}, { ...pick(initialState, 'columns', 'actions') })}
        options={{
          hasRowSelection: 'multi',
          hasRowExpansion: false,
        }}
        data={modifiedData}
        view={{ table: { selectedIds: [] } }}
      />
    );
    // check if checkboxes displayed correctly
    const checkboxes = screen.getAllByLabelText('Select row');
    checkboxes.forEach((box, i) => {
      if (i % 3 !== 0) {
        expect(box).toHaveProperty('disabled', false);
      } else {
        expect(box).toHaveProperty('disabled', true);
      }
    });
    // select all elements
    const selectAllCheckbox = screen.getByLabelText('Select all items');
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(selectAllCheckbox).toHaveProperty('checked', false);
    fireEvent.click(selectAllCheckbox);
    // check that only selectable items are counted
    expect(selectAllCheckbox).toHaveProperty('checked', true);
    expect(screen.getByText(`${dataCount} items selected`)).toBeInTheDocument();
    // check if selectable checkboxes checked
    checkboxes.forEach((box, i) => {
      if (i % 3 !== 0) {
        expect(box).toHaveProperty('checked', true);
      } else {
        expect(box).toHaveProperty('checked', false);
      }
    });
  });
  it('should execute callback upon opening/closing search input', async () => {
    render(
      <StatefulTable
        columns={tableColumns}
        data={[tableData[0]]}
        actions={mockActions}
        options={{
          hasSearch: true,
        }}
        view={{
          toolbar: {
            search: {
              defaultValue: '',
            },
          },
        }}
        id="table"
      />
    );
    const searchField = screen.queryByRole('searchbox');
    fireEvent.focus(searchField);
    expect(mockActions.toolbar.onSearchExpand).toHaveBeenCalledTimes(1);
    expect(mockActions.toolbar.onSearchExpand.mock.calls[0][0]).toEqual([expect.anything(), true]);
    act(() => fireEvent.blur(searchField));
    await waitFor(() => {
      expect(mockActions.toolbar.onSearchExpand.mock.calls[1][0]).toEqual([
        expect.anything(),
        false,
      ]);
    });
  });
  it('should display empty table state when no search results', () => {
    render(
      <StatefulTable
        columns={tableColumns}
        data={[tableData[0]]}
        actions={mockActions}
        options={{
          hasSearch: true,
        }}
        view={{
          toolbar: {
            search: {
              defaultValue: '',
            },
          },
        }}
        id="table"
      />
    );
    const searchField = screen.queryByRole('searchbox');
    fireEvent.change(searchField, { target: { value: 'irrelevant search 123123' } });
    expect(screen.getByTestId('EmptyState')).toBeInTheDocument();
    expect(screen.getByTestId('EmptyState')).toBeVisible();
  });
  it('should apply callback when clear filter button clicked', async () => {
    render(
      <StatefulTable
        columns={tableColumns}
        data={[tableData[0]]}
        actions={mockActions}
        options={{
          hasSearch: true,
        }}
        view={{
          toolbar: {
            search: {
              defaultValue: 'irrelevant search 123123',
            },
          },
        }}
        id="table"
        i18n={{
          emptyButtonLabelWithFilters: 'Clear all filters',
        }}
      />
    );
    expect(screen.getByTestId('EmptyState')).toBeInTheDocument();
    expect(screen.getByTestId('EmptyState')).toBeVisible();
    const clearFiltersButton = screen.getByRole('button', { name: 'Clear all filters' });
    fireEvent.click(clearFiltersButton);
    expect(mockActions.toolbar.onClearAllFilters).toHaveBeenCalledTimes(1);
  });
  it('should preserve search when all filters has been cleared', async () => {
    const initialStateCopy = cloneDeep(initialState);
    initialStateCopy.view.toolbar.search = {
      defaultValue: 'irrelevant search 123123',
    };
    render(<StatefulTable {...initialStateCopy} actions={mockActions} />);

    const emptyState = screen.getByTestId('EmptyState');
    const clearAllFiltersButton = screen.getByText('Clear all filters');
    const whiteboardFilter = await screen.findByDisplayValue('whiteboard');
    const comboBoxFilter = screen.getByDisplayValue('option-B');

    expect(emptyState).toBeInTheDocument();
    expect(clearAllFiltersButton).toBeInTheDocument();
    expect(whiteboardFilter).toBeInTheDocument();
    expect(comboBoxFilter).toBeInTheDocument();

    const clearFiltersButton = screen.getByRole('button', { name: 'Clear all filters' });
    fireEvent.click(clearFiltersButton);

    // Filtering by search has been preserved
    expect(emptyState).toBeInTheDocument();

    // Column filters has been reset
    expect(clearAllFiltersButton).not.toBeInTheDocument();
    expect(whiteboardFilter).not.toBeInTheDocument();
    expect(comboBoxFilter).not.toBeInTheDocument();
  });
  it('should use callback fallbacks when props not passed', () => {
    expect(() =>
      render(
        <StatefulTable
          {...initialState}
          actions={{
            pagination: null,
            toolbar: null,
            table: null,
            onUserViewModified: null,
          }}
        />
      )
    ).not.toThrowError();
  });
  it('should hide "Clear all filters" button if prop hideClearAllFiltersButton enabled', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const initialStateCopy = cloneDeep(initialState);
    initialStateCopy.view.toolbar.hideClearAllFiltersButton = true;

    render(<StatefulTable {...initialStateCopy} actions={mockActions} />);

    const whiteboardFilter = await screen.findByDisplayValue('whiteboard');
    expect(whiteboardFilter).toBeInTheDocument();
    expect(screen.getByDisplayValue('option-B')).toBeInTheDocument();
    expect(screen.queryByText('Clear all filters')).toBeNull();
  });

  it('should hide "Clear all filters" button if prop hideClearAllFiltersButton enabled and activeBar is undefined', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const initialStateCopy = cloneDeep(initialState);
    initialStateCopy.view.toolbar.hideClearAllFiltersButton = true;
    initialStateCopy.view.toolbar.activeBar = undefined;

    render(<StatefulTable {...initialStateCopy} actions={mockActions} />);

    expect(screen.queryByText('Clear all filters')).toBeNull();
  });

  it('should hide "Clear all filters" after rerender with new props', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(<StatefulTable {...initialState} actions={mockActions} />);

    const whiteboardFilter = await screen.findByDisplayValue('whiteboard');
    expect(whiteboardFilter).toBeInTheDocument();
    expect(screen.getByDisplayValue('option-B')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();

    const initialStateCopy = cloneDeep(initialState);
    initialStateCopy.view.toolbar.hideClearAllFiltersButton = true;

    rerender(<StatefulTable {...initialStateCopy} actions={mockActions} />);

    expect(whiteboardFilter).toBeInTheDocument();
    expect(screen.getByDisplayValue('option-B')).toBeInTheDocument();
    expect(screen.queryByText('Clear all filters')).toBeNull();
  });

  describe('AdvancedFilters', () => {
    it('properly filters the table when advancedRules have simple logic', async () => {
      const { container } = render(
        <StatefulTable
          id="advanced-filters-with-simple-logic"
          {...initialState}
          options={{
            ...initialState.options,
            hasFilter: false,
            hasAdvancedFilter: true,
          }}
          view={{
            ...initialState.view,
            toolbar: {
              ...initialState.view.toolbar,
              advancedFilterFlyoutOpen: true,
            },
            selectedAdvancedFilterIds: ['my-filter', 'next-filter'],
            advancedFilters: [
              {
                filterId: 'my-filter',
                filterTitleText: 'My Filter',
                filterRules: {
                  id: '14p5ho3pcu',
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
                      operand: 'EQ',
                      value: 'true',
                    },
                  ],
                },
              },
              {
                filterId: 'next-filter',
                filterTitleText: 'Next Filter',
                filterRules: {
                  id: '14p5ho3pcu',
                  groupLogic: 'ANY',
                  rules: [
                    {
                      id: 'rsiru4rjb1',
                      columnId: 'string',
                      operand: 'CONTAINS',
                      value: 'eat',
                    },
                    {
                      id: '34bvyub9j2',
                      columnId: 'number',
                      operand: 'EQ',
                      value: '4096',
                    },
                  ],
                },
              },
            ],
          }}
        />
      );
      expect(container.querySelectorAll('tbody > tr')).toHaveLength(3);
    });
    it('properly filters the table when advancedRules have complex logic', async () => {
      const { container } = render(
        <StatefulTable
          id="advanced-filters-with-simple-logic"
          {...initialState}
          options={{
            ...initialState.options,
            hasFilter: false,
            hasAdvancedFilter: true,
          }}
          view={{
            ...initialState.view,
            toolbar: {
              ...initialState.view.toolbar,
              advancedFilterFlyoutOpen: true,
            },
            selectedAdvancedFilterIds: ['my-filter', 'next-filter'],
            advancedFilters: [
              {
                filterId: 'my-filter',
                filterTitleText: 'My Filter',
                filterRules: {
                  id: '14p5ho3pcu',
                  groupLogic: 'ANY',
                  rules: [
                    {
                      id: 'rsiru4rjba',
                      columnId: 'date',
                      operand: 'CONTAINS',
                      value: '19',
                    },
                    {
                      id: '14p5ho3pcu',
                      groupLogic: 'ANY',
                      rules: [
                        {
                          id: 'rsiru4rjb1',
                          columnId: 'string',
                          operand: 'CONTAINS',
                          value: 'eat',
                        },
                        {
                          id: '34bvyub9j2',
                          columnId: 'number',
                          operand: 'EQ',
                          value: '4096',
                        },
                        {
                          id: '14p5ho3pcu',
                          groupLogic: 'ANY',
                          rules: [
                            {
                              id: '34bvyub9jq',
                              columnId: 'boolean',
                              operand: 'EQ',
                              value: 'true',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          }}
        />
      );
      expect(container.querySelectorAll('tbody > tr')).toHaveLength(10);
      expect(screen.getByText('1–10 of 11 items')).toBeVisible();
    });
    it('toolbar icon is disabled when isDisabled prop set to true', () => {
      render(
        <StatefulTable
          id="advanced-filters-disabled-icon"
          {...initialState}
          options={{
            ...initialState.options,
            hasFilter: false,
            hasAdvancedFilter: true,
          }}
          view={{
            ...initialState.view,
            toolbar: {
              ...initialState.view.toolbar,
              isDisabled: true,
              advancedFilterFlyoutOpen: false,
            },
            selectedAdvancedFilterIds: ['my-filter'],
            advancedFilters: [
              {
                filterId: 'my-filter',
                filterTitleText: 'My Filter',
                filterRules: {
                  id: '14p5ho3pcu',
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
                      operand: 'EQ',
                      value: 'true',
                    },
                  ],
                },
              },
            ],
          }}
        />
      );
      const advancedFilterToolbarIcon = screen.getByTestId('advanced-filter-flyout-button');
      expect(advancedFilterToolbarIcon).toBeVisible();
      expect(advancedFilterToolbarIcon).toBeDisabled();
    });
  });
  it('properly changes state of child and parent row selections', () => {
    const onRowSelectedMock = jest.fn();
    const selectRowLabel = 'Select row';
    render(
      <StatefulTable
        columns={[
          {
            id: 'string',
            name: 'String',
            isSortable: false,
          },
        ]}
        data={getNestedRows()}
        options={{ hasRowSelection: 'multi', hasRowNesting: true }}
        view={{
          table: {
            selectedIds: [],
            expandedIds: ['row-0', 'row-1', 'row-1_B', 'row-1_B-2', 'row-1_D'],
          },
        }}
        actions={{ table: { onRowSelected: onRowSelectedMock } }}
      />
    );
    fireEvent.click(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-2')]
    );
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1')]
    ).toBePartiallyChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_A')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B')]
    ).toBePartiallyChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-1')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-2')]
    ).toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-2-A')]
    ).toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-2-B')]
    ).toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-3')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_B-3')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_C')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_D')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_D-1')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_D-2')]
    ).not.toBeChecked();
    expect(
      screen.getAllByLabelText(selectRowLabel)[getNestedRowIds().indexOf('row-1_D-3')]
    ).not.toBeChecked();
    expect(onRowSelectedMock).toHaveBeenCalledWith('row-1_B-2', true, [
      'row-1_B-2',
      'row-1_B-2-A',
      'row-1_B-2-B',
    ]);
  });

  it('should open the multi-sort modal', () => {
    render(
      <StatefulTable
        id="multi-sort-table"
        columns={[
          {
            id: 'string',
            name: 'String',
            isSortable: true,
          },
          {
            id: 'boolean',
            name: 'Boolean',
            isSortable: true,
          },
        ]}
        options={{
          hasMultiSort: true,
        }}
        data={tableData.slice(0, 2)}
      />
    );

    userEvent.click(screen.getAllByRole('button', { name: 'Open and close list of options' })[0]);
    userEvent.click(screen.getByText('Multi-sort'));
    expect(screen.getByText('Select columns to sort')).toBeVisible();
  });

  it('should only update resize state when hasUserViewManagement:true', () => {
    const onColumnResize = jest.fn();
    jest.spyOn(reducer, 'baseTableReducer');
    const { rerender } = render(
      <StatefulTable
        id="multi-sort-table"
        columns={[
          {
            id: 'string',
            name: 'String',
          },
          {
            id: 'boolean',
            name: 'Boolean',
          },
        ]}
        options={{
          hasUserViewManagement: true,
          hasResize: true,
        }}
        data={tableData.slice(0, 2)}
        actions={{
          table: {
            onColumnResize,
          },
        }}
      />
    );

    const resizeFirstColumn = () => {
      const handles = screen.getAllByLabelText('Resize column');
      fireEvent.mouseDown(handles[0]);
      fireEvent.mouseMove(handles[0], {
        clientX: 176,
      });
      fireEvent.mouseUp(handles[0]);
    };

    resizeFirstColumn();

    expect(reducer.baseTableReducer).toHaveBeenLastCalledWith(
      // table state.
      expect.objectContaining({
        columns: [
          { id: 'string', name: 'String' },
          { id: 'boolean', name: 'Boolean' },
        ],
      }),
      // dispatched action
      expect.objectContaining({
        instanceId: null,
        payload: [
          { id: 'string', name: 'String', width: '180px' },
          { id: 'boolean', name: 'Boolean', width: '120px' },
        ],
        type: 'TABLE_COLUMN_RESIZE',
      })
    );

    expect(onColumnResize).toHaveBeenCalledWith([
      { id: 'string', name: 'String', width: '180px' },
      { id: 'boolean', name: 'Boolean', width: '120px' },
    ]);

    jest.clearAllMocks();

    rerender(
      <StatefulTable
        id="multi-sort-table"
        columns={[
          {
            id: 'string',
            name: 'String',
          },
          {
            id: 'boolean',
            name: 'Boolean',
          },
        ]}
        options={{
          hasUserViewManagement: false,
          hasResize: true,
        }}
        data={tableData.slice(0, 2)}
        actions={{
          table: {
            onColumnResize,
          },
        }}
      />
    );

    resizeFirstColumn();

    expect(reducer.baseTableReducer).not.toHaveBeenCalled();

    expect(onColumnResize).toHaveBeenCalledWith([
      { id: 'string', name: 'String', width: '180px' },
      { id: 'boolean', name: 'Boolean', width: '120px' },
    ]);

    jest.resetAllMocks();
  });

  it('should render a loading state without columns', () => {
    const { container } = render(
      <StatefulTable
        id="loading-table"
        columns={[]}
        data={[]}
        view={{ table: { loadingState: { isLoading: true, rowCount: 10, columnCount: 3 } } }}
      />
    );

    const headerRows = container.querySelectorAll(
      `.${iotPrefix}--table-skeleton-with-headers--table-row--head`
    );
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0].querySelectorAll('td')).toHaveLength(3);

    const allRows = container.querySelectorAll(
      `.${iotPrefix}--table-skeleton-with-headers--table-row`
    );
    expect(allRows).toHaveLength(10);
  });

  it('should show data after loading is finished', () => {
    const { container, rerender } = render(
      <StatefulTable
        id="loading-table"
        columns={[]}
        data={[]}
        view={{ table: { loadingState: { isLoading: true, rowCount: 10, columnCount: 3 } } }}
      />
    );

    const allRows = container.querySelectorAll(
      `.${iotPrefix}--table-skeleton-with-headers--table-row`
    );
    expect(allRows).toHaveLength(10);
    expect(screen.queryByTitle('String')).toBeNull();
    expect(screen.queryByTitle('Date')).toBeNull();

    rerender(
      <StatefulTable
        id="loading-table"
        columns={initialState.columns}
        data={initialState.data}
        view={{ table: { loadingState: { isLoading: false, rowCount: 10, columnCount: 3 } } }}
      />
    );
    expect(
      container.querySelectorAll(`.${iotPrefix}--table-skeleton-with-headers--table-row`)
    ).toHaveLength(0);

    // 100 rows plus the header
    expect(container.querySelectorAll('tr')).toHaveLength(101);
    expect(screen.getByTitle('String')).toBeVisible();
    expect(screen.getByTitle('Date')).toBeVisible();
  });

  describe('toolbarActions in toolbar', () => {
    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(() => ({ width: 100, height: 100 }));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should add items to the toolbarActions overflow menu', async () => {
      const onApplyToolbarAction = jest.fn();
      const toolbarActions = [
        {
          id: 'in-toolbar',
          labelText: 'Do something',
          renderIcon: Screen,
        },
        {
          id: 'edit',
          labelText: 'Edit something',
          disabled: true,
          isOverflow: true,
        },
        {
          id: 'hide',
          labelText: 'Hide something',
          renderIcon: ViewOff,
          hasDivider: true,
          isOverflow: true,
        },
        {
          id: 'delete',
          labelText: 'Delete something',
          isDelete: true,
          isOverflow: true,
        },
        {
          id: 'hidden',
          labelText: 'Hidden option',
          hidden: true,
          isOverflow: true,
        },
      ];

      render(
        <StatefulTable
          columns={tableColumns}
          data={[tableData[0]]}
          actions={merge(mockActions, { toolbar: { onApplyToolbarAction } })}
          view={{
            toolbar: {
              toolbarActions,
            },
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Do something' })).toBeVisible();
      userEvent.click(screen.getByRole('button', { name: 'Do something' }));
      expect(onApplyToolbarAction).toHaveBeenCalledWith({
        id: 'in-toolbar',
        labelText: 'Do something',
        renderIcon: expect.anything(),
      });

      userEvent.click(screen.getByRole('button', { name: 'Open and close list of options' }));
      expect(screen.getByRole('menuitem', { name: 'Edit something' })).toBeVisible();
      expect(screen.getByRole('menuitem', { name: 'Edit something' })).toBeDisabled();
      expect(screen.getByRole('menuitem', { name: /Hide something/ })).toBeVisible();
      expect(screen.queryByRole('menuitem', { name: 'Hidden option' })).toBeNull();
      expect(screen.getByRole('menuitem', { name: /Delete something/ })).toBeVisible();
      expect(screen.getByRole('menuitem', { name: /Delete something/ }).parentNode).toHaveClass(
        `${prefix}--overflow-menu-options__option--danger`
      );
      userEvent.click(screen.getByRole('menuitem', { name: /Hide something/ }));
      expect(onApplyToolbarAction).toHaveBeenCalledWith({
        id: 'hide',
        labelText: 'Hide something',
        renderIcon: expect.anything(),
        hasDivider: true,
        isOverflow: true,
      });
    });
  });

  it('should set select all checkbox to indeterminate state', () => {
    const rows = tableData.slice(0, 5);
    const selectedIds = rows.map((row) => row.id);
    const selectionThatWouldCauseAnIndeterminateState = selectedIds.slice(1, 5);
    render(
      <StatefulTable
        id="tableid4"
        columns={tableColumns}
        data={rows}
        options={{ hasRowSelection: 'multi' }}
        view={{
          table: {
            selectedIds: selectionThatWouldCauseAnIndeterminateState,
          },
        }}
      />
    );
    expect(screen.getByLabelText('Select all items')).toHaveProperty('indeterminate', true);
  });
});
