import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TableHeader, TableRow, FormItem, TextInput, FilterableMultiSelect } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { memoize, debounce, isEqual, isNil } from 'lodash-es';
import classnames from 'classnames';
import warning from 'warning';

import {
  defaultFunction,
  handleEnterKeyDown,
  isEmptyString,
  getFilterValue,
  getAppliedFilterText,
  getMultiselectFilterValue,
  getMultiSelectItems,
} from '../../../../utils/componentUtilityFunctions';
import { settings } from '../../../../constants/Settings';
import { FILTER_EMPTY_STRING } from '../../../../constants/Filters';
import ComboBox from '../../../ComboBox/ComboBox';
import TableToolbarSVGButton from '../../TableToolbar/TableToolbarSVGButton';

const { iotPrefix, prefix } = settings;

const getFilterForState = (filters, col) => {
  const appliedFilter = filters.find((i) => i.columnId === col.id);
  if (appliedFilter && col.options && isEmptyString(appliedFilter.value)) {
    return FILTER_EMPTY_STRING;
  }

  if (appliedFilter && !isNil(appliedFilter.value)) {
    return appliedFilter.value;
  }

  return '';
};

class FilterHeaderRow extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        /** When false, no filter shows */
        isFilterable: PropTypes.bool,
        /** i18N text for translation */
        placeholderText: PropTypes.string,
        /** if options is empty array, assume text input for filter */
        options: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
              .isRequired,
            text: PropTypes.string.isRequired,
          })
        ),
        /** if isMultiselect and isFilterable are true, the table is filtered based on a multiselect */
        isMultiselect: PropTypes.bool,
        /**
         * customInput should be a React component that will accept the following props. value, onChange, id, column, columns etc.
         * The expectation is that the input component will use value as the default value and onChange will be called when the value changes.  The FilterTableRow will debounce the values so the component does not need to do this
         */
        customInput: PropTypes.elementType,
      })
    ).isRequired,
    /** internationalized string */
    filterText: PropTypes.string,
    clearFilterText: PropTypes.string,
    clearSelectionText: PropTypes.string,
    openMenuText: PropTypes.string,
    closeMenuText: PropTypes.string,
    ordering: PropTypes.arrayOf(
      PropTypes.shape({
        columnId: PropTypes.string.isRequired,
        /* Visibility of column in table, defaults to false */
        isHidden: PropTypes.bool,
      })
    ).isRequired,
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        columnId: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.bool,
          PropTypes.arrayOf(PropTypes.string),
        ]).isRequired,
      })
    ),
    /** Callback when filter is applied sends object of keys and values with the filter values */
    onApplyFilter: PropTypes.func,
    /** properties global to the table */
    tableOptions: PropTypes.shape({
      hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
      hasRowExpansion: PropTypes.bool,
      hasRowNesting: PropTypes.bool,
      hasRowActions: PropTypes.bool,
      useRadioButtonSingleSelect: PropTypes.bool,
      hasFilterRowIcon: PropTypes.bool,
      hasResize: PropTypes.bool,
    }),
    /** filter can be hidden by the user but filters will still apply to the table */
    isVisible: PropTypes.bool,
    /** disabled filters are shown and active but cannot be modified */
    isDisabled: PropTypes.bool,
    lightweight: PropTypes.bool,
    /** should we filter as the user types or after they press enter */
    hasFastFilter: PropTypes.bool,

    testId: PropTypes.string,
    /** shows an additional column that can expand/shrink as the table is resized  */
    showExpanderColumn: PropTypes.bool.isRequired,
    /** Size prop from Carbon to shrink row height (and header height in some instances) */
    size: function checkProps(props, propName, componentName) {
      if (['compact', 'short', 'normal', 'tall'].includes(props[propName])) {
        warning(
          false,
          `The value \`${props[propName]}\` has been deprecated for the ` +
            `\`${propName}\` prop on the ${componentName} component. It will be removed in the next major ` +
            `release. Please use 'xs', 'sm', 'md', 'lg', or 'xl' instead.`
        );
      }
    },
    /** language direction for current table */
    langDir: PropTypes.oneOf(['rtl', 'ltr']),
    /** indicator if columns have grouping */
    showColumnGroups: PropTypes.bool,
    /** icon element for filter row icon */
    filterRowIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    /** tooltip text for filter row icon button */
    filterRowIconDescription: PropTypes.string,
    /** call back function for when icon button in filter row is clicked  (evt) => {} */
    onFilterRowIconClick: PropTypes.func.isRequired,
    /** Freezes table header and footer */
    pinHeaderAndFooter: PropTypes.bool,
    /** Set to true if the table support drag and drop. Inserts a cell in the "drag handle" column
     * for spacing. */
    hasDragAndDrop: PropTypes.bool,
  };

  static defaultProps = {
    tableOptions: { hasRowSelection: 'multi' },
    filters: [],
    isVisible: true,
    isDisabled: false,
    onApplyFilter: defaultFunction,
    filterText: 'Filter',
    clearFilterText: 'Clear filter',
    clearSelectionText: 'Clear selection',
    openMenuText: 'Open menu',
    closeMenuText: 'Close menu',
    lightweight: false,
    hasFastFilter: true,
    testId: '',
    size: undefined,
    langDir: 'ltr',
    showColumnGroups: false,
    filterRowIcon: null,
    filterRowIconDescription: 'Edit filters',
    pinHeaderAndFooter: false,
    hasDragAndDrop: false,
  };

  state = {
    dropdownMaxHeight: 'unset',
    filterValues: this.props.columns.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: getFilterForState(this.props.filters, curr),
      }),
      {}
    ),
    filterIconTopOffset: 96,
  };

  // TODO: we should really do this through a useEffect hook when we refactor to functional component
  static getDerivedStateFromProps(props, state) {
    // If the filter props change from the outside, we need to reset the filterValues inside local state
    if (!isEqual(props.filters, state.prevPropsFilters)) {
      const newFilters = props.columns.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.id]: getFilterForState(props.filters, curr),
        }),
        {}
      );

      if (!isEqual(newFilters, state.filterValues)) {
        return { filterValues: newFilters, prevPropsFilters: props.filters };
      }
      // Need to store the updated filters from before
      return { prevPropsFilters: props.filters };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.rowRef = React.createRef();
    this.firstFilterableRef = React.createRef();
    this.filterCellRef = React.createRef();
  }

  componentDidMount() {
    this.updateDropdownHeight();
    this.updateFocus();
    this.updateFilterIconPosition();
  }

  componentDidUpdate(prevProps, prevState) {
    const { dropdownMaxHeight } = this.state;
    const { size } = this.props;
    if (dropdownMaxHeight !== prevState.dropdownMaxHeight || size !== prevProps.size) {
      this.updateDropdownHeight();
    }
  }

  updateDropdownHeight = () => {
    if (this.rowRef.current) {
      const tableContainer = this.rowRef.current.closest(`.${prefix}--data-table-content`);
      const tableHead = this.rowRef.current.closest(`thead`);
      if (tableContainer) {
        const { height: containerHeight } = tableContainer.getBoundingClientRect();
        const { height: headHeight } = tableHead.getBoundingClientRect();

        const height = containerHeight - headHeight - 16;

        this.setState({
          dropdownMaxHeight: `${height}px`,
        });
      }
    }
  };

  updateFilterIconPosition = () => {
    /* istanbul ignore else */
    if (!this.props.tableOptions.hasFilterRowIcon) {
      return;
    }

    /* istanbul ignore next */
    if (this.filterCellRef.current) {
      const siblingTopOffset = this.filterCellRef.current.getBoundingClientRect().top;
      const tableTopOffset = this.filterCellRef.current
        .closest(`.${iotPrefix}--table-container`)
        .getBoundingClientRect().top;
      this.setState((prevState) => {
        if (this.props.pinHeaderAndFooter) {
          // Subtract 48px of toolbar height
          return {
            ...prevState,
            filterIconTopOffset: siblingTopOffset - tableTopOffset - 48,
          };
        }

        return {
          ...prevState,
          filterIconTopOffset: siblingTopOffset - tableTopOffset,
        };
      });
    }
  };

  setFirstFilterableRef = (node) => {
    if (!this.firstFilterableRef.current && node) {
      this.firstFilterableRef.current = node;
    }
  };

  updateFocus = () => {
    if (this.firstFilterableRef.current) {
      if (typeof this.firstFilterableRef.current.focus === 'function') {
        this.firstFilterableRef.current.focus();
      } else if (typeof this.firstFilterableRef.current.textInput.current.focus === 'function') {
        this.firstFilterableRef.current.textInput.current.focus();
      }
    }
  };

  /**
   * take the state with the filter values and send to our listener
   */
  handleApplyFilter = () => {
    const { onApplyFilter } = this.props;
    const { filterValues } = this.state;
    onApplyFilter(filterValues);
  };

  // when a user clicks or hits ENTER, we'll clear the input
  handleClearFilter = (event, column) => {
    this.setState(
      (state) => ({
        filterValues: {
          ...state.filterValues,
          [column.id]: '',
        },
      }),
      this.handleApplyFilter
    );
  };

  handleTranslation = (idToTranslate) => {
    const { clearSelectionText, openMenuText, closeMenuText } = this.props;
    switch (idToTranslate) {
      default:
        return '';
      case 'clear.selection':
        return clearSelectionText;
      case 'clear.all':
        return clearSelectionText;
      case 'open.menu':
        return openMenuText;
      case 'close.menu':
        return closeMenuText;
    }
  };

  render() {
    const {
      columns,
      ordering,
      clearFilterText,
      filterText,
      tableOptions: {
        hasRowSelection,
        hasRowExpansion,
        hasRowNesting,
        hasRowActions,
        useRadioButtonSingleSelect,
        hasFilterRowIcon,
        hasResize,
      },
      isVisible,
      lightweight,
      isDisabled,
      hasFastFilter,
      testId,
      showExpanderColumn,
      langDir,
      showColumnGroups,
      filterRowIcon,
      filterRowIconDescription,
      onFilterRowIconClick,
      hasDragAndDrop,
    } = this.props;
    const { dropdownMaxHeight, filterValues, filterIconTopOffset } = this.state;
    const visibleColumns = ordering.filter((c) => !c.isHidden);
    return isVisible ? (
      <TableRow
        data-testid={testId}
        style={{
          '--filter-header-dropdown-max-height': dropdownMaxHeight,
        }}
      >
        {hasDragAndDrop ? (
          /* istanbul ignore next */ <TableHeader
            className={`${iotPrefix}--filter-header-row--header`}
          />
        ) : null}
        {hasRowSelection === 'multi' ||
        (hasRowSelection === 'single' && useRadioButtonSingleSelect) ? (
          <TableHeader className={`${iotPrefix}--filter-header-row--header`} ref={this.rowRef} />
        ) : null}
        {hasRowExpansion || hasRowNesting ? (
          <TableHeader className={`${iotPrefix}--filter-header-row--header`} />
        ) : null}
        {visibleColumns.map((c, i) => {
          const column = columns.find((item) => c.columnId === item.id);
          const columnStateValue = filterValues[column.id]; // eslint-disable-line react/destructuring-assignment
          const filterColumnOptions = (options) => {
            options.sort((a, b) => {
              return a.text.localeCompare(b.text, { sensitivity: 'base' });
            });
            return options;
          };
          const memoizeColumnOptions = memoize(filterColumnOptions); // TODO: this memoize isn't really working, should refactor to a higher column level
          const isLastColumn = visibleColumns.length - 1 === i;
          const lastVisibleColumn = visibleColumns.slice(-1)[0];
          const isLastVisibleColumn = column.id === lastVisibleColumn.columnId;
          /* istanbul ignore next */
          const CustomInput = column.customInput;
          // undefined check has the effect of making isFilterable default to true
          // if unspecified
          const headerContent =
            column.isFilterable !== undefined && !column.isFilterable ? (
              <div />
            ) : /* istanbul ignore next */
            column.customInput !== undefined ? (
              <CustomInput
                ref={this.setFirstFilterableRef}
                id={`column-${i}`}
                onChange={(event) => {
                  if (event.persist) {
                    event.persist();
                  }
                  this.setState(
                    (state) => ({
                      filterValues: {
                        ...state.filterValues,
                        [column.id]: event.selectedItem
                          ? getFilterValue(event.selectedItem)
                          : event.selectedItems?.length > 0
                          ? event.selectedItems.map(getMultiselectFilterValue)
                          : event.target.value,
                      },
                    }),
                    debounce(this.handleApplyFilter, 1000)
                  );
                }}
                column={column}
                columns={columns}
                value={filterValues[column.id]}
              />
            ) : column.options ? (
              column.isMultiselect ? (
                <FilterableMultiSelect
                  ref={this.setFirstFilterableRef}
                  key={columnStateValue}
                  className={classnames(
                    `${iotPrefix}--filterheader-multiselect`,
                    `${iotPrefix}--filterheader-multiselect__menu--fit-content`,
                    {
                      [`${iotPrefix}--filterheader-multiselect__menu--flip-horizontal`]:
                        isLastColumn,
                    }
                  )}
                  id={`column-${i}`}
                  aria-label={filterText}
                  placeholder={column.placeholderText || 'Choose an option'}
                  translateWithId={this.handleTranslation}
                  items={memoizeColumnOptions(column.options)}
                  label={column.placeholderText || 'Choose an option'}
                  itemToString={(item) => item.text}
                  initialSelectedItems={getMultiSelectItems(column, columnStateValue)}
                  onChange={(evt) => {
                    this.setState(
                      (state) => ({
                        filterValues: {
                          ...state.filterValues,
                          [column.id]: evt.selectedItems.map(getMultiselectFilterValue),
                        },
                      }),
                      this.handleApplyFilter
                    );
                  }}
                  light
                  disabled={isDisabled}
                />
              ) : (
                <ComboBox
                  ref={this.setFirstFilterableRef}
                  menuFitContent
                  horizontalDirection={isLastColumn ? 'start' : 'end'}
                  key={columnStateValue}
                  className={`${iotPrefix}--filterheader-combo`}
                  id={`column-${i}`}
                  aria-label={filterText}
                  translateWithId={this.handleTranslation}
                  items={memoizeColumnOptions(column.options)}
                  itemToString={(item) => (item ? item.text : '')}
                  initialSelectedItem={{
                    id: columnStateValue,
                    text: getAppliedFilterText(column, columnStateValue),
                  }}
                  placeholder={column.placeholderText || 'Choose an option'}
                  onChange={(selectedItem) => {
                    this.setState(
                      (state) => ({
                        filterValues: {
                          ...state.filterValues,
                          [column.id]: getFilterValue(selectedItem),
                        },
                      }),
                      this.handleApplyFilter
                    );
                  }}
                  light={lightweight}
                  disabled={isDisabled}
                />
              )
            ) : (
              <FormItem className={`${iotPrefix}--filter-header-row--form-item`}>
                <TextInput
                  ref={this.setFirstFilterableRef}
                  id={column.id}
                  labelText={column.id}
                  hideLabel
                  light={lightweight}
                  placeholder={column.placeholderText || 'Type and hit enter to apply'}
                  title={filterValues[column.id] || column.placeholderText} // eslint-disable-line react/destructuring-assignment
                  onChange={(event) => {
                    event.persist();
                    this.setState(
                      (state) => ({
                        filterValues: {
                          ...state.filterValues,
                          [column.id]: event.target.value,
                        },
                      }),
                      hasFastFilter ? debounce(this.handleApplyFilter, 150) : null // only apply the filter at debounced interval
                    );
                  }}
                  onKeyDown={
                    !hasFastFilter
                      ? (event) => handleEnterKeyDown(event, this.handleApplyFilter)
                      : null
                  } // if fast filter off, then filter on key press
                  onBlur={!hasFastFilter ? this.handleApplyFilter : null} // if fast filter off, then filter on blur
                  value={filterValues[column.id]} // eslint-disable-line react/destructuring-assignment
                  disabled={isDisabled}
                />
                {filterValues[column.id] ? ( // eslint-disable-line react/destructuring-assignment
                  <div
                    role="button"
                    className={classnames(`${prefix}--list-box__selection`, {
                      [`${iotPrefix}--clear-filters-button--disabled`]: isDisabled,
                    })}
                    tabIndex={isDisabled ? '-1' : '0'}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      if (!isDisabled) {
                        this.handleClearFilter(event, column);
                      }
                    }}
                    onKeyDown={(event) =>
                      handleEnterKeyDown(event, () => {
                        if (!isDisabled) {
                          this.handleClearFilter(event, column);
                        }
                      })
                    }
                    title={clearFilterText}
                  >
                    <Close description={clearFilterText} />
                  </div>
                ) : null}
              </FormItem>
            );

          return (
            <TableHeader
              className={classnames(
                `${iotPrefix}--tableheader-filter`,
                `${iotPrefix}--filter-header-row--header`,
                {
                  // This "header-width" class does not make sense for undefined column widths and the corresponding
                  // CSS has been removed. Class is kept only for backwards compatibilty in the DOM.
                  [`${iotPrefix}--filter-header-row--header-width`]: column.width === undefined,
                  [`${iotPrefix}--filter-header-row--last-column`]: isLastVisibleColumn,
                  [`${iotPrefix}--filter-header-row--with-icon`]:
                    isLastVisibleColumn && hasFilterRowIcon,
                  [`${iotPrefix}--filter-header-row--with-margin`]:
                    isLastVisibleColumn &&
                    hasFilterRowIcon &&
                    (!showColumnGroups || !hasRowActions),
                }
              )}
              data-column={column.id}
              key={`FilterHeader${column.id}`}
              width={column.width}
              ref={isLastVisibleColumn ? this.filterCellRef : undefined}
            >
              {headerContent}
              {hasFilterRowIcon && isLastVisibleColumn ? (
                <>
                  <TableToolbarSVGButton
                    testId="filter-row-icon"
                    className={classnames(`${iotPrefix}--filter-header-icon`, {
                      [`${iotPrefix}--filter-header-icon--with-border`]:
                        hasResize && showColumnGroups && !hasRowActions,
                      [`${iotPrefix}--filter-header-icon--with-margin`]: hasRowActions,
                    })}
                    description={filterRowIconDescription}
                    onClick={onFilterRowIconClick}
                    renderIcon={filterRowIcon}
                    size="field"
                    style={{
                      top: `${filterIconTopOffset}px`,
                    }}
                    tooltipAlignment={langDir === 'ltr' ? 'end' : 'start'}
                  />
                  {hasRowActions ? (
                    <div
                      className={`${iotPrefix}--filter-header-row--icon-support`}
                      style={{
                        top: `${filterIconTopOffset}px`,
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </TableHeader>
          );
        })}
        {hasRowActions ? (
          <TableHeader className={`${iotPrefix}--filter-header-row--header`} />
        ) : null}
        {showExpanderColumn ? (
          <TableHeader
            data-testid={`${testId}-expander-column`}
            className={`${iotPrefix}--filter-header-row--header`}
          />
        ) : null}
      </TableRow>
    ) : null;
  }
}
export default FilterHeaderRow;
