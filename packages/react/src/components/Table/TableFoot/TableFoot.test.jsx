import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Add, ArrowRight } from '@carbon/react/icons';

import { settings } from '../../../constants/Settings';
import { getTableColumns } from '../Table.story.helpers';
import Table from '../Table';

import TableFoot from './TableFoot';

const tableColumns = getTableColumns();

const { iotPrefix } = settings;

const ordering = [
  { columnId: 'a' },
  {
    columnId: 'b',
    isHidden: true,
  },
  { columnId: 'c' },
  { columnId: 'd' },
];

const selectData = [
  {
    id: 'option-A',
    text: 'option-A',
  },
  {
    id: 'option-B',
    text: 'option-B',
  },
  {
    id: 'option-C',
    text: 'option-C',
  },
];

const words = [
  'toyota',
  'helping',
  'whiteboard',
  'as',
  'can',
  'bottle',
  'eat',
  'chocolate',
  'pinocchio',
  'scott',
];
const getWord = (index, step = 1) => words[(step * index) % words.length];
const getSentence = (index) =>
  `${getWord(index, 1)} ${getWord(index, 2)} ${getWord(index, 3)} ${index}`;

const tableData = Array(20)
  .fill(0)
  .map((i, idx) => ({
    id: `row-${idx}`,
    values: {
      string: getSentence(idx),
      node: <Add size={20} />,
      date: new Date(100000000000 + 1000000000 * idx * idx).toISOString(),
      select: selectData[idx % 3].id,
      number: idx * idx,
    },
    rowActions: [
      {
        id: 'drilldown',
        renderIcon: ArrowRight,
        iconDescription: 'Drill in',
        labelText: 'Drill in',
        isOverflow: true,
      },
      {
        id: 'Add',
        renderIcon: Add,
        iconDescription: 'Add',
        labelText: 'Add',
        isOverflow: true,
      },
    ],
  }));

describe('TableFoot', () => {
  it('should be selectable by testId', () => {
    const label = 'Total';
    const tableFootTestId = 'table_foot';

    render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          tableState={{
            aggregations: { label, columns: [{ id: 'c', value: '10' }] },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByTestId(tableFootTestId)).toBeDefined();
  });

  it('shows aggregation label in first column unless that column has an aggregated value', () => {
    const label = 'Total';
    const tableTestId = 'table-test';
    const tableFootTestId = 'table-foot';
    const firstColumnTestId = `${tableFootTestId}-aggregation-${ordering[0].columnId}`;

    const { rerender } = render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          tableState={{
            aggregations: { label, columns: [{ id: 'c', value: '10' }] },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByTestId(firstColumnTestId).textContent).toEqual(label);

    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          tableState={{
            aggregations: { label, columns: [{ id: 'a', value: '10' }] },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByTestId(firstColumnTestId).textContent).not.toEqual(label);

    const modifiedColumns = [
      {
        id: 'moreNumbers',
        name: 'More Numbers',
      },
      ...tableColumns,
    ];
    const modifiedData = tableData.map((data) => ({
      ...data,
      values: { moreNumbers: 1, ...data.values },
    }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    rerender(
      <Table
        id={tableTestId}
        columns={modifiedColumns}
        data={modifiedData}
        options={{ hasAggregations: true }}
        view={{
          aggregations: {
            label,
            columns: [{ id: 'number' }, { id: 'moreNumbers' }],
          },
        }}
      />
    );

    console.error.mockReset();
    const newFirstAggregationCell = screen.getByTestId(
      `${tableTestId}-${tableFootTestId}-aggregation-${modifiedColumns[0].id}`
    );
    expect(newFirstAggregationCell.textContent).not.toEqual(label);
    expect(newFirstAggregationCell.textContent).toEqual('20');
  });

  it('adds empty cells for rowExpension, rowSelection, rowActions & resize expander column', () => {
    const tableFootTestId = 'table-foot';
    const label = 'Total';
    const firstColumnTestId = `${tableFootTestId}-aggregation-${ordering[0].columnId}`;
    const thirdColumnTestId = `${tableFootTestId}-aggregation-${ordering[2].columnId}`;

    const { rerender, container } = render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {},
            ordering: [],
          }}
          showExpanderColumn
        />
      </table>
    );

    expect(container.querySelectorAll('tr').length).toEqual(1);
    expect(container.querySelectorAll('td').length).toEqual(2);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasAggregations: true,
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: { label, columns: [{ id: 'c', value: '10' }] },
            ordering,
          }}
          showExpanderColumn
        />
      </table>
    );

    expect(screen.getByTestId(firstColumnTestId).textContent).toEqual(label);
    expect(screen.getByTestId(thirdColumnTestId).textContent).toEqual('10');
    expect(container.querySelectorAll('tr').length).toEqual(1);
    expect(container.querySelectorAll('td').length).toEqual(5);
  });

  it('has the correct classes for alignment and sorting', () => {
    const tableFootTestId = 'table-foot';
    const label = 'Total';
    const firstColumnTestId = `${tableFootTestId}-aggregation-${ordering[0].columnId}`;
    const thirdColumnTestId = `${tableFootTestId}-aggregation-${ordering[2].columnId}`;
    const fourthColumnTestId = `${tableFootTestId}-aggregation-${ordering[3].columnId}`;

    render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'a', value: '300', align: 'center', isSortable: false },
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    const aColumnTotalCell = screen.getByTestId(firstColumnTestId);
    expect(aColumnTotalCell).toHaveClass('data-table-center');
    expect(aColumnTotalCell).not.toHaveClass(`${iotPrefix}-table-foot--value__sortable`);

    const cColumnTotalCell = screen.getByTestId(thirdColumnTestId);
    expect(cColumnTotalCell).toHaveClass(
      'data-table-end',
      `${iotPrefix}-table-foot--value__sortable`
    );

    const dColumnTotalCell = screen.getByTestId(fourthColumnTestId);
    expect(dColumnTotalCell).toHaveClass('data-table-start');
  });

  it('should have the correct colSpan on label based on props', () => {
    const tableFootTestId = 'table-foot';
    const label = 'Total';

    const { container, rerender } = render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowNesting: true,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '3');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowNesting: false,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '3');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: true,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '3');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: false,
            hasRowSelection: 'multi',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '2');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: false,
            hasRowSelection: 'single',
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '1');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: false,
            hasRowSelection: false,
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '1');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: true,
            hasRowSelection: false,
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '2');
    expect(container.querySelectorAll('td')).toHaveLength(4);
    rerender(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowNesting: true,
            hasRowSelection: false,
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(screen.getByText('Total')).toHaveAttribute('colspan', '2');
    expect(container.querySelectorAll('td')).toHaveLength(4);
  });

  it('should add a spacer cell when colSpan:2 and aggregation in first column', () => {
    const tableFootTestId = 'table-foot';
    const label = 'Total';
    const { container } = render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: true,
            hasRowNesting: true,
            hasRowSelection: false,
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'a', value: '300', align: 'center', isSortable: false },
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(container.querySelectorAll('td')).toHaveLength(5);
  });
  it('should add a not spacer cell when aggregation in first column with no nesting, expansion, or selection', () => {
    const tableFootTestId = 'table-foot';
    const label = 'Total';
    const { container } = render(
      <table>
        <TableFoot
          testId={tableFootTestId}
          options={{
            hasRowActions: true,
            hasRowExpansion: false,
            hasRowNesting: false,
            hasRowSelection: false,
          }}
          tableState={{
            aggregations: {
              label,
              columns: [
                { id: 'a', value: '300', align: 'center', isSortable: false },
                { id: 'c', value: '10', align: 'end', isSortable: true },
                { id: 'd', value: '100' },
              ],
            },
            ordering,
          }}
        />
      </table>
    );

    expect(container.querySelectorAll('td')).toHaveLength(4);
  });
});
