import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Add } from '@carbon/react/icons';

import { settings } from '../../../../constants/Settings';

import TableBodyRow from './TableBodyRow';

const { iotPrefix } = settings;

const mockActions = {
  onRowSelected: jest.fn(),
  onRowClicked: jest.fn(),
  onRowExpanded: jest.fn(),
  onApplyRowAction: jest.fn(),
};

const tableRowProps = {
  totalColumns: 1,
  id: 'tableRow',
  tableId: 'tableId',
  selectRowAria: 'selectedRow',
  ordering: [{ columnId: 'col1', isHidden: false }],
  values: { col1: 'value1' },
  columns: [
    {
      id: 'col1',
      name: 'col1',
    },
  ],
};

describe('TableBodyRow', () => {
  afterEach(() => {
    mockActions.onRowSelected.mockClear();
    mockActions.onRowClicked.mockClear();
    mockActions.onRowExpanded.mockClear();
    mockActions.onApplyRowAction.mockClear();
  });

  it('shouldExpandOnRowClick', () => {
    // Should expand
    const { rerender, container } = render(
      <TableBodyRow
        options={{
          hasRowExpansion: true,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        tableActions={mockActions}
        nestingChildCount={2}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(container.querySelector('tr'));
    userEvent.click(screen.queryByRole('button', { name: 'Click to expand.' }));
    expect(mockActions.onRowClicked).toHaveBeenCalled();
    expect(mockActions.onRowExpanded).toHaveBeenCalledWith('tableRow', true);

    // Should collapse
    rerender(
      <TableBodyRow
        isExpanded
        options={{
          hasRowExpansion: true,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        tableActions={mockActions}
        nestingChildCount={2}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(screen.queryByRole('button', { name: 'Click to collapse.' }));
    expect(mockActions.onRowClicked).toHaveBeenCalled();
    expect(mockActions.onRowExpanded).toHaveBeenCalledWith('tableRow', false);

    mockActions.onRowClicked.mockClear();
    mockActions.onRowExpanded.mockClear();

    rerender(
      <TableBodyRow
        options={{ hasRowExpansion: true, wrapCellText: 'always', truncateCellText: true }}
        tableActions={mockActions}
        nestingChildCount={2}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(container.querySelector('tr'));
    expect(mockActions.onRowClicked).toHaveBeenCalled();
    expect(mockActions.onRowExpanded).not.toHaveBeenCalled();

    mockActions.onRowClicked.mockClear();
    mockActions.onRowExpanded.mockClear();

    rerender(
      <TableBodyRow
        options={{
          hasRowExpansion: true,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isExpanded
        tableActions={mockActions}
        nestingChildCount={2}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowClicked).toHaveBeenCalled();
    expect(mockActions.onRowExpanded).toHaveBeenCalled();
  });

  it('should not show expand icon when there are no children', () => {
    const { container } = render(
      <TableBodyRow
        {...tableRowProps}
        options={{
          hasRowExpansion: false,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
          hasRowNesting: true,
        }}
        tableActions={mockActions}
        nestingChildCount={0}
        clickToExpandAria="click to expand"
        clickToCollapseAria="click to collapse"
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    // Clicking on the row should expand if there are children
    fireEvent.click(container.querySelector('tr'));

    // Ignores the callback even though shouldExpandOnRowClick is true
    expect(mockActions.onRowExpanded).not.toHaveBeenCalled();

    const expandButton = screen.getByTestId('expand-icon-button-tableRow');

    // Verify tooltip text
    expect(within(expandButton).getByText('click to expand')).toBeTruthy();

    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);

    // This assertion tells us that the expand button is still in the DOM (the component never flipped to isExpanded)
    // And that the button/icon is not visible--the childless class hides the button with a display: none;
    expect(
      expandButton.closest(`.${iotPrefix}--expandable-tablerow--childless`)
    ).toBeInTheDocument();
  });

  it('should fire the onRowExpanded when using hasRowExpansion', () => {
    const { container } = render(
      <TableBodyRow
        {...tableRowProps}
        options={{
          hasRowExpansion: true,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
          hasRowNesting: false,
        }}
        tableActions={mockActions}
        nestingChildCount={0}
        clickToExpandAria="click to expand"
        clickToCollapseAria="click to collapse"
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    // Clicking on the row should expand if there are children
    fireEvent.click(container.querySelector('tr'));

    // Ignores the callback even though shouldExpandOnRowClick is true
    expect(mockActions.onRowExpanded).toHaveBeenCalledTimes(1);

    const expandButton = screen.getByTestId('expand-icon-button-tableRow');

    // Verify tooltip text
    expect(within(expandButton).getByText('click to expand')).toBeTruthy();

    expect(expandButton).toBeInTheDocument();
    expect(expandButton).toHaveStyle('display: inline-block');

    fireEvent.click(expandButton);
    expect(mockActions.onRowExpanded).toHaveBeenCalledTimes(2);
  });

  it('verify rendering with undefined column', () => {
    const tableRowPropsWithUndefined = {
      tableId: 'tableId',
      totalColumns: 1,
      id: 'tableRow',
      columns: [
        { id: 'col1', name: 'col1' },
        { id: 'col2', name: 'col2' },
      ],
      ordering: [{ columnId: 'col1' }, { columnId: 'col2' }],
      values: { col1: 'value1', col2: undefined },
      options: {
        wrapCellText: 'always',
        truncateCellText: true,
      },
    };
    const { container } = render(
      <TableBodyRow tableActions={mockActions} {...tableRowPropsWithUndefined} />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(container).toBeDefined();
  });

  it('verify custom cell renderer', () => {
    const customRenderDataFunction = ({ value, columnId, rowId, row }) => (
      <div id={value}>
        {value} {columnId} {rowId} {JSON.stringify(row)}
      </div>
    );
    const tableRowPropsWithCustomRenderer = {
      tableId: 'tableId',
      totalColumns: 1,
      id: 'tableRow',
      ordering: [
        { columnId: 'col1', renderDataFunction: customRenderDataFunction },
        { columnId: 'col2' },
      ],
      columns: [
        { id: 'col1', name: 'col1' },
        { id: 'col2', name: 'col2' },
      ],
      values: { col1: 'value1', col2: 'value2' },
    };
    const { container } = render(
      <TableBodyRow
        options={{ hasRowExpansion: true, wrapCellText: 'always', truncateCellText: true }}
        tableActions={mockActions}
        {...tableRowPropsWithCustomRenderer}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    const customCell = container.querySelectorAll('#value1')[0];
    expect(customCell).toBeDefined();
    expect(customCell.innerHTML).toContain('value1');
    expect(customCell.innerHTML).toContain('col1');
    expect(customCell.innerHTML).toContain('col2');
    expect(customCell.innerHTML).toContain('value2');
  });

  it('hasRowMultiSelect', () => {
    const mockRowSelection = jest.fn();
    const mockRowClicked = jest.fn();
    const tableRowPropsWithSelection = {
      tableId: 'tableId',
      totalColumns: 2,
      id: 'tableRow',
      options: { hasRowSelection: 'multi', wrapCellText: 'always', truncateCellText: true },
      tableActions: {
        onRowSelected: mockRowSelection,
        onRowClicked: mockRowClicked,
      },
      columns: [
        { id: 'col1', name: 'col1' },
        { id: 'col2', name: 'col2' },
      ],
      ordering: [{ columnId: 'col1' }, { columnId: 'col2' }],
      values: { col1: 'value1', col2: undefined },
    };
    render(<TableBodyRow tableActions={mockActions} {...tableRowPropsWithSelection} />, {
      container: document.body.appendChild(document.createElement('tbody')),
    });
    userEvent.click(screen.queryByLabelText('Select row'));
    expect(mockRowSelection).toHaveBeenCalledWith(tableRowProps.id, true);
  });

  it('hasRowSingleSelection', () => {
    const { container } = render(
      <TableBodyRow
        options={{ hasRowSelection: 'single', wrapCellText: 'always', truncateCellText: true }}
        tableActions={mockActions}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(container.querySelector('tr'));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, true);
    expect(mockActions.onRowClicked).toHaveBeenCalled();
  });

  it('shows radio button when rows hasRowSingleSelection', () => {
    render(
      <TableBodyRow
        options={{
          hasRowSelection: 'single',
          wrapCellText: 'always',
          truncateCellText: true,
          useRadioButtonSingleSelect: true,
        }}
        tableActions={mockActions}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(screen.getByRole('radio', { name: tableRowProps.selectRowAria }));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, true);
  });

  it('shows radio button on row with expansion', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
          wrapCellText: 'always',
          truncateCellText: true,
          useRadioButtonSingleSelect: true,
        }}
        isExpanded
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(screen.getByRole('radio', { name: tableRowProps.selectRowAria })).toHaveClass(
      'bx--radio-button'
    );
  });

  it('calls onRowSelected when expanded rows with hasRowSelection:"single" are clicked', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isExpanded
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, true);
  });

  it('calls onRowSelected when expanded rows with hasRowSelection:"single" and radio button are clicked', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
          wrapCellText: 'always',
          truncateCellText: true,
          useRadioButtonSingleSelect: true,
        }}
        isExpanded
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, true);
    expect(screen.getByRole('radio', { name: tableRowProps.selectRowAria })).toHaveClass(
      'bx--radio-button'
    );
  });

  it('calls onRowSelected & onRowClicked when selected rows with hasRowSelection:"single" are clicked', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isSelected
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
    expect(mockActions.onRowClicked).not.toHaveBeenCalled();
    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, false);
    expect(mockActions.onRowClicked).toHaveBeenCalledWith(tableRowProps.id);
  });

  it('calls only onRowSelected when selected rows with hasRowSelection:"single" and radio button are clicked', () => {
    const { container } = render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          wrapCellText: 'always',
          truncateCellText: true,
          useRadioButtonSingleSelect: true,
        }}
        isSelectable
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
    expect(mockActions.onRowClicked).not.toHaveBeenCalled();
    userEvent.click(container.querySelector('input'));
    expect(mockActions.onRowSelected).toHaveBeenCalledWith(tableRowProps.id, true);
    // Click on radio button does not fire onRowClicked
    expect(mockActions.onRowClicked).not.toHaveBeenCalledWith(tableRowProps.id);
  });

  it('does not call onRowSelected when expanded rows with hasRowSelection:"single" are clicked if isSelectable:"false"', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isSelectable={false}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
  });

  it('does not call onRowSelected when expanded rows with hasRowSelection:"single" and useRadioButtonSingleSelect are clicked if isSelectable:"false"', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
          wrapCellText: 'always',
          truncateCellText: true,
          useRadioButtonSingleSelect: true,
        }}
        isSelectable={false}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
  });

  it('calls onRowExpanded when non expanded rows with hasRowSelection:"single" are clicked', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowExpansion: true,
          hasRowSelection: 'single',
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isExpanded={false}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).toHaveBeenCalled();
  });

  it('does not call onRowSelected when non expanded rows with hasRowSelection:"single" and isSelectable:false', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: 'single',
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isSelected={false}
        isSelectable={false}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
  });

  it('does not call onRowSelected when non expanded rows with isSelectable:false', () => {
    render(
      <TableBodyRow
        {...tableRowProps}
        tableActions={mockActions}
        options={{
          hasRowSelection: false,
          shouldExpandOnRowClick: true,
          wrapCellText: 'always',
          truncateCellText: true,
        }}
        isSelected={false}
        isSelectable
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    userEvent.click(screen.getByRole('cell', { name: 'value1' }));
    expect(mockActions.onRowSelected).not.toHaveBeenCalled();
  });

  it('adds an extra cell for the expander column when showExpanderColumn is true', () => {
    const { container } = render(
      <TableBodyRow
        showExpanderColumn
        tableActions={mockActions}
        options={{ wrapCellText: 'always', truncateCellText: true }}
        {...tableRowProps}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    expect(container.querySelectorAll('td').length).toEqual(2);
  });

  it('aligns cell text', () => {
    render(
      <TableBodyRow
        options={{ wrapCellText: 'always', truncateCellText: true }}
        tableActions={mockActions}
        {...tableRowProps}
        columns={[
          {
            id: 'col1',
            name: 'col1',
          },
          {
            id: 'col2',
            name: 'col2',
            align: 'start',
          },
          {
            id: 'col3',
            name: 'col3',
            align: 'center',
          },
          {
            id: 'col4',
            name: 'col4',
            align: 'end',
          },
        ]}
        ordering={[
          { columnId: 'col1' },
          { columnId: 'col2' },
          { columnId: 'col3' },
          { columnId: 'col4' },
        ]}
        values={{ col1: 'value1', col2: 'value2', col3: 'value3', col4: 'value4' }}
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    expect(screen.getByRole('cell', { name: 'value1' })).toHaveClass(`data-table-start`);
    expect(screen.getByRole('cell', { name: 'value2' })).toHaveClass(`data-table-start`);
    expect(screen.getByRole('cell', { name: 'value3' })).toHaveClass(`data-table-center`);
    expect(screen.getByRole('cell', { name: 'value4' })).toHaveClass(`data-table-end`);
  });

  it('lets table cells call their editDataFunction and displays the result', () => {
    const editDataFunction = jest.fn().mockReturnValue('edited column data');
    render(
      <TableBodyRow
        options={{ wrapCellText: 'always', truncateCellText: true }}
        tableActions={mockActions}
        {...tableRowProps}
        ordering={[{ columnId: 'col1', editDataFunction }]}
        rowEditMode
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );

    expect(editDataFunction).toHaveBeenCalledWith({
      columnId: 'col1',
      row: { col1: 'value1' },
      rowId: 'tableRow',
      value: 'value1',
    });

    expect(screen.getByRole('cell', { name: 'edited column data' })).toBeVisible();
  });

  it('calls onClearRowError when errors are dismissed', () => {
    const onClearRowError = jest.fn();
    render(
      <TableBodyRow
        {...tableRowProps}
        options={{ hasRowActions: true, wrapCellText: 'always', truncateCellText: true }}
        tableActions={{ onClearRowError, onApplyRowAction: jest.fn() }}
        rowActions={[{ id: 'addAction', renderIcon: Add, iconDescription: 'See more' }]}
        rowActionsError={{
          title: 'an-error',
          message: 'it-did-occur',
          learnMoreURL: 'https://example.com',
        }}
        actionFailedText="action-failed"
        dismissText="dismiss"
      />,
      {
        container: document.body.appendChild(document.createElement('tbody')),
      }
    );
    userEvent.click(
      within(screen.getByTestId('row-action-container-background')).getByRole('button')
    );

    userEvent.click(screen.getByText('dismiss'));
    expect(onClearRowError).toHaveBeenCalledWith(tableRowProps.id);
  });
});
