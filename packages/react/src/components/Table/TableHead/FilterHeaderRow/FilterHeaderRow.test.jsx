import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '@carbon/react';

import * as utils from '../../../../utils/componentUtilityFunctions';
import { settings } from '../../../../constants/Settings';
import { keyboardKeys } from '../../../../constants/KeyCodeConstants';
import { FILTER_EMPTY_STRING } from '../../../../constants/Filters';

import FilterHeaderRow from './FilterHeaderRow';

const { iotPrefix } = settings;

describe('FilterHeaderRow', () => {
  const commonFilterProps = { onApplyFilter: jest.fn() };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockClear();
  });
  afterAll(() => {
    console.error.mockRestore();
  });

  it('should be selectable by testId', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: true }]}
        testId="filter_header_row"
      />
    );
    expect(screen.getByTestId('filter_header_row')).toBeDefined();
  });

  it('text input change updates state', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: true }]}
      />
    );

    const input = screen.getByPlaceholderText('Type and hit enter to apply');
    userEvent.type(input, 'mytext');
    expect(input).toHaveValue('mytext');
  });

  it('each column is marked with data-column', () => {
    const { container } = render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1' }]}
      />
    );
    const columns = container.querySelectorAll("th[data-column='col1']");
    expect(columns).toHaveLength(1);
  });

  it('text input clear button clears filter', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1' }]}
      />
    );
    const input = screen.getByPlaceholderText('Type and hit enter to apply');
    userEvent.type(input, 'mytext');
    expect(input).toHaveValue('mytext');
    userEvent.click(screen.getByTitle('Clear filter'));
    expect(input).toHaveValue('');
  });

  it('filter input is hidden when isFilterable is false', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: false }]}
      />
    );
    expect(screen.queryByPlaceholderText('Type and hit enter to apply')).not.toBeInTheDocument();
  });

  it('prevent filter modifications when isDisabled is true ', () => {
    const { container } = render(
      <FilterHeaderRow
        {...commonFilterProps}
        isDisabled
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2', options: [{ id: 'opt1', text: 'option1' }] }]}
        filters={[{ columnId: 'col1', value: 'myVal' }]}
      />
    );

    expect(screen.getByPlaceholderText('Type and hit enter to apply')).toHaveAttribute('disabled');
    expect(screen.getByPlaceholderText('Choose an option')).toHaveAttribute('disabled');
    expect(
      container.querySelectorAll(`.${iotPrefix}--clear-filters-button--disabled`)
    ).toHaveLength(1);

    userEvent.click(screen.getByTitle('Clear filter'));
    expect(screen.getByTitle('myVal')).toHaveValue('myVal');
  });

  it('adds an extra cell for the expander column when showExpanderColumn is true', () => {
    const { container, rerender } = render(
      <FilterHeaderRow
        showExpanderColumn={false}
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2' }]}
        filters={[]}
      />
    );
    expect(container.querySelectorAll('th').length).toEqual(3);

    rerender(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2' }]}
        filters={[]}
      />
    );
    expect(container.querySelectorAll('th').length).toEqual(4);
  });

  it('should derive the new state when new filters are given by props', () => {
    const { rerender } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'test1',
          },
        ]}
      />
    );

    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[0]).toHaveValue('test1');
    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[1]).toHaveValue('');

    rerender(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'test1',
          },
          {
            columnId: 'col2',
            value: 'test2',
          },
        ]}
      />
    );

    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[0]).toHaveValue('test1');
    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[1]).toHaveValue('test2');
    // hitting buttons other than enter doesn't clear the filters
    fireEvent.keyDown(screen.getAllByTitle('Clear filter')[0], {
      key: keyboardKeys.ESCAPE,
    });
    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[0]).toHaveValue('test1');
    fireEvent.keyDown(screen.getAllByTitle('Clear filter')[0], {
      key: keyboardKeys.ENTER,
    });
    expect(screen.getAllByPlaceholderText('Type and hit enter to apply')[0]).toHaveValue('');
  });

  it('should fallback to hard-coded i18n strings on multiselect when i18n props in columns are falsey', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
          {
            id: 'col3',
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
              {
                id: 'three',
                text: 'Three',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'test1',
          },
          {
            columnId: 'col2',
            value: 'test2',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByLabelText('Three'));
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByLabelText('Two'));
    expect(screen.getByText('2')).toBeVisible();
  });

  it('call onChange in a ComboBox to set the filters', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
          {
            id: 'col3',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
              {
                id: 'three',
                text: 'Three',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'test1',
          },
          {
            columnId: 'col2',
            value: 'test2',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('Three'));
    expect(screen.getByPlaceholderText('Choose an option')).toHaveValue('Three');
  });

  it('allows combobox menu to fit the widths of the items ', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
          {
            id: 'col3',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
              {
                id: 'three',
                text: 'Three',
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getByTestId('combo-wrapper')).toHaveClass(
      `${iotPrefix}--combobox__menu--fit-content`
    );
  });

  it('allows MultiSelect menu to fit the widths of the items ', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
      />
    );

    expect(
      screen
        .getByRole('combobox')
        .closest(`.${iotPrefix}--filterheader-multiselect__menu--fit-content`)
    ).toBeInTheDocument();
  });

  it('opens the combobox menu flipped to the left if the filter is in the last column ', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
          {
            id: 'col2',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
          {
            id: 'col3',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
      />
    );

    const firstColumnCombobox = screen.getAllByTestId('combo-wrapper')[0];
    expect(firstColumnCombobox).not.toHaveClass(`${iotPrefix}--combobox__menu--flip-horizontal`);

    const middleColumnCombobox = screen.getAllByTestId('combo-wrapper')[1];
    expect(middleColumnCombobox).not.toHaveClass(`${iotPrefix}--combobox__menu--flip-horizontal`);

    const lastColumnCombobox = screen.getAllByTestId('combo-wrapper')[2];
    expect(lastColumnCombobox).toHaveClass(`${iotPrefix}--combobox__menu--flip-horizontal`);
  });

  it('opens the MultiSelect menu flipped to the left if the filter is in the last column ', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
          {
            id: 'col2',
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
          {
            id: 'col3',
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
      />
    );

    const firstColumnMultiSelect = screen.getAllByRole('combobox')[0];
    expect(
      firstColumnMultiSelect.closest(
        `.${iotPrefix}--filterheader-multiselect__menu--flip-horizontal`
      )
    ).toBeNull();

    const middleColumnMultiSelect = screen.getAllByRole('combobox')[1];
    expect(
      middleColumnMultiSelect.closest(
        `.${iotPrefix}--filterheader-multiselect__menu--flip-horizontal`
      )
    ).toBeNull();

    const lastColumnMultiSelect = screen.getAllByRole('combobox')[2];
    expect(
      lastColumnMultiSelect.closest(
        `.${iotPrefix}--filterheader-multiselect__menu--flip-horizontal`
      )
    ).toBeTruthy();
  });

  it('should apply filters on Enter if !hasFastFilter', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }, { columnId: 'col3' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
          {
            id: 'col3',
            isFilterable: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
              {
                id: 'three',
                text: 'Three',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'test1',
          },
          {
            columnId: 'col2',
            value: 'test2',
          },
        ]}
        hasFastFilter={false}
      />
    );

    const input = screen.getByTitle('test2');
    userEvent.clear(input);
    jest.spyOn(utils, 'handleEnterKeyDown');
    userEvent.type(input, 'test-2{enter}');
    expect(input).toHaveValue('test-2');
    expect(utils.handleEnterKeyDown).toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it("should not display a header when hasRowSelection !== 'multi'", () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'single',
        }}
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(3);
  });

  it('should display an extra header when hasRowExpansion', () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'single',
          hasRowExpansion: true,
        }}
        isVisible
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(4);
  });

  it('should display an extra header when hasRowNesting', () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'single',
          hasRowNesting: true,
        }}
        isVisible
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(4);
  });

  it('should display an extra header when hasRowActions', () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'single',
          hasRowActions: true,
        }}
        isVisible
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(4);
  });

  it('should display three extra headers when all tableOptions are supplied', () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'multi',
          hasRowActions: true,
          hasRowExpansion: true,
        }}
        isVisible
      />
    );

    expect(container.querySelectorAll('th')).toHaveLength(6);
  });
  it('should nothing when isVisible is false', () => {
    const { container } = render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true },
          { id: 'col2', isFilterable: true },
        ]}
        tableOptions={{
          hasRowSelection: 'multi',
          hasRowActions: true,
          hasRowExpansion: true,
        }}
        isVisible={false}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should focus on first filterable text field when opened', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: true, placeholderText: 'col1' },
          { id: 'col2', isFilterable: true, placeholderText: 'col2' },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('col1')).toHaveFocus();
    expect(screen.getByPlaceholderText('col2')).not.toHaveFocus();
  });

  it('should focus on first filterable text field when opened even if not first column', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          { id: 'col1', isFilterable: false },
          { id: 'col2', isFilterable: true, placeholderText: 'col2' },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('col2')).toHaveFocus();
  });

  it('should focus on first combobox field when opened', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            placeholderText: 'col1',
            isMultiselect: false,
            options: [{ id: 'option-1', text: 'Option 1' }],
          },
          { id: 'col2', isFilterable: true, placeholderText: 'col2' },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('col1')).toHaveFocus();
    expect(screen.getByPlaceholderText('col2')).not.toHaveFocus();
  });

  it('should focus on first filterable multiselect field when opened', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            placeholderText: 'col1',
            isMultiselect: true,
            options: [{ id: 'option-1', text: 'Option 1' }],
          },
          { id: 'col2', isFilterable: true, placeholderText: 'col2' },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('col1')).toHaveFocus();
    expect(screen.getByPlaceholderText('col2')).not.toHaveFocus();
  });

  it('should call filter handler with empty string filter', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            options: [
              {
                id: '',
                text: 'empty string',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: 'two',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('empty string'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText('Choose an option')).toHaveValue('empty string');
  });

  it('should display custom input when not undefined', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1', customInput: () => <div>customInput</div> }, { id: 'col2' }]}
      />
    );

    expect(screen.getAllByText('customInput')[0]).toBeInTheDocument();
  });

  it('should display custom input and filter data in the table', async () => {
    const initialValue = 'initial value';
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[
          {
            id: 'col1',
            customInput: ({ onChange, id }) => (
              <TextInput
                placeholder="Filter col1"
                value={initialValue}
                id={id}
                onChange={onChange}
              />
            ),
          },
          { id: 'col2' },
        ]}
      />
    );

    // Get the custom input field by its placeholder text
    const filterInput = screen.getByPlaceholderText('Filter col1');
    expect(filterInput).toHaveValue('initial value');
    // Simulate typing in the filter input
    fireEvent.change(filterInput, { target: { value: 'Value A' }, persist: jest.fn() });
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledTimes(1);
  });

  it('should pass empty string filter value to handler', () => {
    const columnId = 'col1';
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: columnId,
            isFilterable: true,
            options: [
              {
                id: '',
                text: 'empty string',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId,
            value: 'two',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('empty string'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledWith({
      [columnId]: FILTER_EMPTY_STRING,
    });
  });

  it('should render filter with initial select empty string option', () => {
    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: 'col1',
            isFilterable: true,
            options: [
              {
                id: '',
                text: 'empty string',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
        filters={[
          {
            columnId: 'col1',
            value: '',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    expect(screen.getByPlaceholderText('Choose an option')).toHaveValue('empty string');
  });

  it('should pass an array of selected items to callback when isMultiselect', () => {
    jest.resetAllMocks();
    const columnIdOne = 'col1';

    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: columnIdOne,
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: 'one',
                text: 'One',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
        filters={[
          {
            columnIdOne,
            value: 'one',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('One'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledWith({
      [columnIdOne]: ['One'],
    });

    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('Two'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledWith({
      [columnIdOne]: ['One', 'Two'],
    });
  });

  it('should pass an array of selected items to callback when isMultiselect with empty string filter', () => {
    jest.resetAllMocks();
    const columnIdOne = 'col1';

    render(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[
          {
            id: columnIdOne,
            isFilterable: true,
            isMultiselect: true,
            options: [
              {
                id: '',
                text: 'Emptiness',
              },
              {
                id: 'two',
                text: 'Two',
              },
            ],
          },
        ]}
        filters={[
          {
            columnIdOne,
            value: 'two',
          },
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Choose an option')).toBeVisible();
    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('Emptiness'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledWith({
      [columnIdOne]: [FILTER_EMPTY_STRING],
    });

    userEvent.click(screen.getByPlaceholderText('Choose an option'));
    userEvent.click(screen.getByText('Two'));
    expect(commonFilterProps.onApplyFilter).toHaveBeenCalledWith({
      [columnIdOne]: [FILTER_EMPTY_STRING, 'Two'],
    });
  });

  describe('filter row icon button', () => {
    const originalClosest = HTMLTableCellElement.prototype.closest;

    beforeEach(() => {
      HTMLTableCellElement.prototype.closest = jest.fn(() => {
        const getBoundingClientRect = () => ({
          top: 10,
        });
        return {
          getBoundingClientRect,
        };
      });
    });

    afterEach(() => {
      HTMLTableCellElement.prototype.closest = originalClosest;
    });

    it('renders without crashing', () => {
      render(
        <FilterHeaderRow
          {...commonFilterProps}
          ordering={[{ columnId: 'col1' }]}
          columns={[{ id: 'col1' }]}
          tableOptions={{
            hasFilterRowIcon: true,
          }}
        />
      );

      expect(screen.getByTestId('filter-row-icon')).toBeVisible();
    });

    it('should display additional classes', () => {
      const { container } = render(
        <FilterHeaderRow
          {...commonFilterProps}
          ordering={[{ columnId: 'col1' }]}
          columns={[{ id: 'col1' }]}
          tableOptions={{
            hasFilterRowIcon: true,
          }}
          showColumnGroups
          hasRowActions
        />
      );

      expect(container.querySelector('th')).toHaveClass(
        `${iotPrefix}--filter-header-row--with-icon`
      );
      expect(container.querySelector('th')).toHaveClass(
        `${iotPrefix}--filter-header-row--with-margin`
      );
    });

    it('should display icon button only on last table cell', () => {
      render(
        <FilterHeaderRow
          {...commonFilterProps}
          ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
          columns={[{ id: 'col1' }, { id: 'col2' }]}
          tableOptions={{
            hasFilterRowIcon: true,
          }}
        />
      );

      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByTestId('filter-row-icon')).toBeVisible();
    });

    it('should display icon button even if last column input not exists', () => {
      render(
        <FilterHeaderRow
          {...commonFilterProps}
          ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
          columns={[{ id: 'col1' }, { id: 'col2', isFilterable: false }]}
          tableOptions={{
            hasFilterRowIcon: true,
          }}
        />
      );

      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByTestId('filter-row-icon')).toBeVisible();
    });
  });
});
