/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState, useLayoutEffect, createRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TableHead as CarbonTableHead,
  TableRow,
  TableExpandHeader,
  Checkbox,
  OverflowMenuItem,
} from '@carbon/react';
import { isNil, isEmpty, isEqual, debounce } from 'lodash-es';
import classnames from 'classnames';
import warning from 'warning';
import { useLangDirection } from 'use-lang-direction';
import { FilterEdit } from '@carbon/react/icons';

import {
  TableColumnsPropTypes,
  I18NPropTypes,
  defaultI18NPropTypes,
  ActiveTableToolbarPropType,
  TableSortPropType,
  TableColumnGroupPropType,
  TableOrderingPropType,
  PinColumnPropTypes,
} from '../TablePropTypes';
import TableCellRenderer from '../TableCellRenderer/TableCellRenderer';
import { tableTranslateWithId } from '../../../utils/componentUtilityFunctions';
import { settings } from '../../../constants/Settings';
import { WrapCellTextPropTypes } from '../../../constants/SharedPropTypes';
import { OverflowMenu } from '../../OverflowMenu';
import { usePrevious } from '../../../hooks/usePrevious';
import deprecate from '../../../internal/deprecate';
import { pinColumnClassNames } from '../tableUtilities';

import ColumnHeaderRow from './ColumnHeaderRow/ColumnHeaderRow';
import FilterHeaderRow from './FilterHeaderRow/FilterHeaderRow';
import TableHeader from './TableHeader';
import ColumnResize from './ColumnResize';
import {
  createNewWidthsMap,
  calculateWidthOnHide,
  calculateWidthsOnToggle,
  calculateWidthOnShow,
  visibleColumnsHaveWidth,
  getIDsOfAddedVisibleColumns,
  getIDsOfRemovedColumns,
  isColumnVisible,
  getOriginalWidthOfColumn,
  DEFAULT_COLUMN_WIDTH,
  addMissingColumnWidths,
  checkColumnWidthFormat,
  hasVisibleColumns,
  adjustInitialColumnWidths,
} from './columnWidthUtilityFunctions';
import ColumnGrouping from './ColumnGrouping/ColumnGrouping';

const { iotPrefix } = settings;

const propTypes = {
  tableId: PropTypes.string.isRequired,
  /** Important table options that the head needs to know about */
  options: PropTypes.shape({
    hasRowExpansion: PropTypes.bool,
    hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
    useRadioButtonSingleSelect: PropTypes.bool,
    hasRowActions: PropTypes.bool,
    hasResize: PropTypes.bool,
    hasSingleRowEdit: PropTypes.bool,
    hasRowNesting: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        /** If the hierarchy only has 1 nested level of children */
        hasSingleNestedHierarchy: PropTypes.bool,
      }),
    ]),
    wrapCellText: WrapCellTextPropTypes.isRequired,
    truncateCellText: PropTypes.bool.isRequired,
    hasMultiSort: PropTypes.bool,
    useAutoTableLayoutForResize: PropTypes.bool,
    /** Preserves the widths of existing columns when one or more columns are added, removed, hidden, shown or resized. */
    preserveColumnWidths: PropTypes.bool,
    hasFilterRowIcon: PropTypes.bool,
    hasDragAndDrop: PropTypes.bool,
    /** Freezes table header and footer */
    pinHeaderAndFooter: PropTypes.bool,
    /** column to pin in the table */
    pinColumn: PinColumnPropTypes,
  }),
  /** List of columns */
  columns: TableColumnsPropTypes.isRequired,
  enablePercentageColumnWidth: PropTypes.bool,
  /** Specify the properties of each column group in the table. Defaults to empty column. */
  columnGroups: TableColumnGroupPropType,
  /** internationalized labels */
  selectAllText: PropTypes.string,
  clearFilterText: PropTypes.string,
  filterText: PropTypes.string,
  clearSelectionText: PropTypes.string,
  openMenuText: PropTypes.string,
  closeMenuText: PropTypes.string,

  /** Current state of the table */
  tableState: PropTypes.shape({
    /** is the tableHead currently disabled */
    isDisabled: PropTypes.bool,
    /** Which toolbar is currently active */
    activeBar: ActiveTableToolbarPropType,
    /** What's currently selected in the table? */
    selection: PropTypes.shape({
      isSelectAllIndeterminate: PropTypes.bool,
      isSelectAllSelected: PropTypes.bool,
    }).isRequired,
    /** What sorting is currently applied */
    sort: PropTypes.oneOfType([TableSortPropType, PropTypes.arrayOf(TableSortPropType)]).isRequired,
    /** Specify the order, visibility and group belonging of the table columns */
    ordering: TableOrderingPropType.isRequired,
    /** Optional list of applied column filters */
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
  }).isRequired,
  actions: PropTypes.shape({
    onSelectAll: PropTypes.func,
    onChangeSort: PropTypes.func,
    onChangeOrdering: PropTypes.func,
    onColumnSelectionConfig: PropTypes.func,
    onApplyFilter: PropTypes.func,
    onColumnResize: PropTypes.func,
    onOverflowItemClicked: PropTypes.func,
    onFilterRowIconClick: PropTypes.func,
  }).isRequired,
  /** lightweight  */
  lightweight: PropTypes.bool,
  i18n: I18NPropTypes,
  /** should we filter on each keypress */
  hasFastFilter: PropTypes.bool,
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** shows an additional column that can expand/shrink as the table is resized  */
  showExpanderColumn: PropTypes.bool,
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
  filterRowIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  filterRowIconDescription: PropTypes.string,
};

const defaultProps = {
  columnGroups: [],
  options: {},
  lightweight: false,
  selectAllText: 'Select all',
  clearFilterText: 'Clear filter',
  filterText: 'Filter',
  clearSelectionText: 'Clear selection',
  openMenuText: 'Open menu',
  closeMenuText: 'Close menu',
  i18n: {
    ...defaultI18NPropTypes,
  },
  hasFastFilter: true,
  enablePercentageColumnWidth: false,
  testId: '',
  showExpanderColumn: false,
  size: undefined,
  filterRowIcon: FilterEdit,
  filterRowIconDescription: 'Edit filters',
};

const generateOrderedColumnRefs = (ordering) =>
  ordering.map((col) => col.columnId).reduce((acc, id) => ({ ...acc, [id]: createRef() }), {});

// This increases the min width of columns when the overflow button and sort is present
const PADDING_WITH_OVERFLOW = 24;
const PADDING_WITH_OVERFLOW_AND_SORT = 58;

const TableHead = ({
  testID,
  testId,
  tableId,
  options,
  options: {
    hasRowExpansion,
    hasRowSelection,
    hasRowNesting,
    hasResize,
    wrapCellText,
    truncateCellText,
    hasSingleRowEdit,
    hasMultiSort,
    useAutoTableLayoutForResize,
    preserveColumnWidths,
    useRadioButtonSingleSelect,
    hasDragAndDrop,
    pinHeaderAndFooter,
    pinColumn,
  },
  columns,
  columnGroups,
  tableState: {
    selection: { isSelectAllIndeterminate, isSelectAllSelected },
    sort,
    activeBar,
    ordering,
    filters,
    isDisabled,
  },
  actions: {
    onSelectAll,
    onChangeSort,
    onApplyFilter,
    onChangeOrdering,
    onColumnSelectionConfig,
    onColumnResize,
    onOverflowItemClicked,
    onFilterRowIconClick,
  },
  selectAllText,
  clearFilterText,
  filterText,
  clearSelectionText,
  openMenuText,
  closeMenuText,
  lightweight,
  i18n,
  hasFastFilter,
  showExpanderColumn,
  size,
  enablePercentageColumnWidth,
  filterRowIcon,
  filterRowIconDescription,
}) => {
  const filterBarActive = activeBar === 'filter';
  const initialColumnWidths = {};
  const columnRef = generateOrderedColumnRefs(ordering);
  const columnResizeRefs = generateOrderedColumnRefs(ordering);
  const [currentColumnWidths, setCurrentColumnWidths] = useState({});
  const [percentageMode, setPercentageMode] = useState(enablePercentageColumnWidth);

  if (isEmpty(currentColumnWidths)) {
    columns.forEach((col) => {
      initialColumnWidths[col.id] = col.width;
    });
  }

  const forwardMouseEvent = (e) => {
    Object.entries(columnResizeRefs).forEach(([, ref]) => {
      if (ref.current) {
        ref.current.forwardMouseEvent(e);
      }
    });
  };

  const measureColumnWidths = useCallback(() => {
    return ordering
      .filter((col) => !col.isHidden)
      .map((col) => {
        const ref = columnRef[col.columnId];
        return {
          id: col.columnId,
          width: ref.current && ref.current.getBoundingClientRect().width,
        };
      });
  }, [ordering, columnRef]);

  const updateColumnWidths = (newColumnWidths) => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      width:
        newColumnWidths[col.id].width !== undefined
          ? `${newColumnWidths[col.id].width}px`
          : col.width,
    }));
    setCurrentColumnWidths(newColumnWidths);
    if (onColumnResize) {
      onColumnResize(updatedColumns);
    }
  };

  const onManualColumnResize = (modifiedColumnWidths) => {
    if (percentageMode) {
      const modifiedColumns = [...columns];
      Object.keys(modifiedColumns).forEach((key) => {
        if (modifiedColumns[key].hasOwnProperty('width')) {
          delete modifiedColumns[key].width;
        }
      });

      // while Resizing setting all column width to default DEFAULT_COLUMN_WIDTH 150px
      const columnPropInlcudingWidths = addMissingColumnWidths({
        ordering,
        columns: modifiedColumns,
        currentColumnWidths: {},
      });

      const newColumnWidths = createNewWidthsMap(ordering, columnPropInlcudingWidths);
      setCurrentColumnWidths(newColumnWidths);
      setPercentageMode(false);
    } else {
      const newColumnWidths = createNewWidthsMap(
        ordering,
        currentColumnWidths,
        modifiedColumnWidths
      );
      updateColumnWidths(newColumnWidths);
    }
  };

  const onColumnToggle = (columnId, newOrdering) => {
    if (hasResize) {
      if (preserveColumnWidths) {
        const isToggleShow = isColumnVisible(newOrdering, columnId);
        const columnHasNoWidth = getOriginalWidthOfColumn(columns, columnId) === undefined;
        if (isToggleShow && columnHasNoWidth) {
          const newColumnWidths = createNewWidthsMap(newOrdering, currentColumnWidths, [
            { id: columnId, width: DEFAULT_COLUMN_WIDTH },
          ]);
          updateColumnWidths(newColumnWidths);
        }
      } else {
        const newColumnWidths = calculateWidthsOnToggle({
          currentColumnWidths,
          newOrdering,
          columnId,
          columns,
        });
        updateColumnWidths(newColumnWidths);
      }
    }
    onChangeOrdering(newOrdering);
  };

  const handleOverflowItemClick = (e, option) => {
    e.stopPropagation();

    if (onOverflowItemClicked) {
      onOverflowItemClicked(option.id, option.meta);
    }
  };

  useLayoutEffect(() => {
    const measureAndAdjustColumns = () => {
      if (hasResize && columns.length) {
        const measuredWidths = measureColumnWidths();
        const adjustedWidths = adjustInitialColumnWidths(ordering, columns, measuredWidths);
        const newWidthsMap = createNewWidthsMap(ordering, currentColumnWidths, adjustedWidths);
        setCurrentColumnWidths(newWidthsMap);
      }
    };

    // An initial measuring is needed since there might not be an initial value from the columns prop
    // which means that the layout engine will have to set the widths dynamically
    // before we know what they are.
    if (isEmpty(currentColumnWidths)) {
      measureAndAdjustColumns();
    }

    // For non fixed tables with resizable columns we need to recalculate the
    // column widths after window resize.
    const handleWindowResize = debounce(() => {
      if (useAutoTableLayoutForResize) {
        measureAndAdjustColumns();
      }
    }, 100);
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, [
    hasResize,
    columns,
    ordering,
    currentColumnWidths,
    measureColumnWidths,
    useAutoTableLayoutForResize,
  ]);

  // Handle external modification of columns prop and ordering prop
  const previousColumns = usePrevious(columns);
  const previousOrdering = usePrevious(ordering);
  useEffect(
    () => {
      // We need to update the currentColumnWidths (state) after the initial render
      // if the widths of the column prop are externally updated or if columns are added/removed.
      const externallyModified =
        !isEqual(columns, previousColumns) || !isEqual(ordering, previousOrdering);
      if (
        hasResize &&
        columns.length &&
        !isEmpty(currentColumnWidths) &&
        externallyModified &&
        !percentageMode
      ) {
        /* eslint-disable no-param-reassign */
        Object.keys(columns).forEach((key) => {
          if (columns[key].width && columns[key].width.includes('%')) {
            delete columns[key].width;
          }
        });

        checkColumnWidthFormat(columns);

        // PRESERVE WIDTHS
        // Preserve column when possible widths when columns are externally modified
        if (preserveColumnWidths) {
          const columnPropInlcudingWidths = addMissingColumnWidths({
            ordering,
            columns,
            currentColumnWidths,
          });

          const newColumnWidths = createNewWidthsMap(ordering, columnPropInlcudingWidths);
          if (!isEqual(currentColumnWidths, newColumnWidths)) {
            setCurrentColumnWidths(newColumnWidths);
            // Notify the application if any columns were assigned the rendered or default widths
            if (!isEqual(columnPropInlcudingWidths, columns)) {
              onColumnResize(columnPropInlcudingWidths);
            }
          }
          return;
        }

        // MODIFY WIDTHS
        // Modify existing columns widths when columns are externally modified
        const removedColumnIDs = getIDsOfRemovedColumns(ordering, currentColumnWidths);
        const addedVisibleColumnIDs = getIDsOfAddedVisibleColumns(ordering, currentColumnWidths);
        const adjustedForRemoved =
          removedColumnIDs.length > 0
            ? calculateWidthOnHide(currentColumnWidths, ordering, removedColumnIDs)
            : currentColumnWidths;
        const adjustedForRemovedAndAdded =
          addedVisibleColumnIDs.length > 0
            ? calculateWidthOnShow(adjustedForRemoved, ordering, addedVisibleColumnIDs, columns)
            : adjustedForRemoved;

        if (addedVisibleColumnIDs.length > 0 || removedColumnIDs.length > 0) {
          setCurrentColumnWidths(adjustedForRemovedAndAdded);
        } else if (hasVisibleColumns(ordering) && visibleColumnsHaveWidth(ordering, columns)) {
          const propsColumnWidths = createNewWidthsMap(ordering, columns);
          if (!isEqual(currentColumnWidths, propsColumnWidths)) {
            setCurrentColumnWidths(propsColumnWidths);
          }
        }
      }
    },
    // We explicitly do NOT want to trigger this effect if currentColumnWidths is modified
    // since it would be directly overridden by the column props. This effect can be removed
    // with issue https://github.com/IBM/carbon-addons-iot-react/issues/1224
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasResize, columns, ordering, previousColumns, percentageMode]
  );

  useEffect(() => {
    let tableWidth;
    let columnWidth;
    const filteredColumns = columns.filter((colOrder) => {
      const hiddenCol = ordering.find((col) => col.columnId === colOrder.id);
      return !hiddenCol || !hiddenCol.isHidden;
    });

    const hasOverflowMenu = filteredColumns.some(
      (column) => column.overflowMenuItems && column.overflowMenuItems.length > 0
    );
    const totalColumns = filteredColumns.length;
    if (
      enablePercentageColumnWidth &&
      filteredColumns.length &&
      percentageMode &&
      !hasOverflowMenu
    ) {
      /* istanbul ignore next */
      if (
        (hasRowSelection === 'multi' ||
          (useRadioButtonSingleSelect && hasRowSelection === 'single')) &&
        !(hasRowExpansion || hasRowNesting)
      ) {
        tableWidth = `calc(100% - 54px)`;
        columnWidth = `calc(${tableWidth} / ${totalColumns})`;
      } else if (
        (hasRowExpansion || hasRowNesting) &&
        !(
          hasRowSelection === 'multi' ||
          (useRadioButtonSingleSelect && hasRowSelection === 'single')
        )
      ) {
        tableWidth = `calc(100% - 40px)`;
        columnWidth = `calc(${tableWidth} / ${totalColumns})`;
      } else if (
        (hasRowExpansion || hasRowNesting) &&
        (hasRowSelection === 'multi' ||
          (useRadioButtonSingleSelect && hasRowSelection === 'single'))
      ) {
        tableWidth = `calc(100% - 94px)`;
        columnWidth = `calc(${tableWidth} / ${totalColumns})`;
      } else {
        columnWidth = `${parseInt(100 / filteredColumns.length, 10)}%`;
      }

      const updatedColumns = filteredColumns.map((col) => {
        const updatedCol = { ...col };
        updatedCol.width = columnWidth;
        return updatedCol;
      });

      const columnPropIncludingWidths = addMissingColumnWidths({
        ordering,
        columns: updatedColumns,
        currentColumnWidths,
      });
      const newColumnWidths = createNewWidthsMap(ordering, columnPropIncludingWidths);
      if (!isEqual(currentColumnWidths, newColumnWidths)) {
        setCurrentColumnWidths(newColumnWidths);
      }
    }
  }, [
    columns,
    ordering,
    hasRowExpansion,
    hasRowNesting,
    hasRowSelection,
    useRadioButtonSingleSelect,
    currentColumnWidths,
    enablePercentageColumnWidth,
    percentageMode,
  ]);

  const visibleColumns = ordering.filter((col) => !col.isHidden);
  const lastVisibleColumn = visibleColumns.slice(-1)[0];
  const showColumnGroups = columnGroups.some(({ id }) =>
    visibleColumns.find(({ columnGroupId }) => id === columnGroupId)
  );
  const langDir = useLangDirection();

  return (
    <CarbonTableHead
      className={classnames(
        {
          lightweight,
          [`${iotPrefix}--table-head--with-column-groups`]: showColumnGroups,
        },
        pinColumnClassNames({ pinColumn, hasRowSelection, hasRowExpansion, hasRowNesting })
      )}
      onMouseMove={hasResize ? forwardMouseEvent : null}
      onMouseUp={hasResize ? forwardMouseEvent : null}
      // TODO: remove deprecated 'testID' in v3
      data-testid={testID || testId}
    >
      <TableRow
        className={classnames({
          [`${iotPrefix}--table-header__column-row`]: showColumnGroups,
          [`${iotPrefix}--table-header__column-row--prevent-small-sizes`]: showColumnGroups,
        })}
      >
        {hasDragAndDrop && (
          <TableHeader width="2rem" initialWidth="2rem">
            {/* This just takes up space, but is unlabeled. */}
          </TableHeader>
        )}

        {hasRowExpansion || hasRowNesting ? (
          <TableExpandHeader
            id={`${tableId}-expand`}
            // TODO: remove deprecated 'testID' in v3
            data-testid={`${testID || testId}-row-expansion-column`}
            className={classnames({
              [`${iotPrefix}--table-expand-resize`]: hasResize,
            })}
          />
        ) : null}

        {hasRowSelection === 'multi' ? (
          <TableHeader
            // TODO: remove deprecated 'testID' in v3
            testId={`${testID || testId}-row-selection-column`}
            className={classnames(`${iotPrefix}--table-header-checkbox`, {
              [`${iotPrefix}--table-header-checkbox-resize`]: hasResize,
            })}
            translateWithId={(...args) => tableTranslateWithId(...args)}
          >
            {/* TODO: Replace checkbox with TableSelectAll component when onChange bug is fixed
                    https://github.com/IBM/carbon-components-react/issues/1088 */}
            <Checkbox
              disabled={isDisabled}
              id={`${tableId}-head`}
              labelText={selectAllText}
              hideLabel
              indeterminate={isSelectAllIndeterminate}
              checked={isSelectAllSelected}
              onChange={() => onSelectAll(!isSelectAllSelected)}
            />
          </TableHeader>
        ) : hasRowSelection === 'single' && useRadioButtonSingleSelect ? (
          <TableHeader
            // TODO: remove deprecated 'testID' in v3
            testId={`${testID || testId}-row-selection-column`}
            className={classnames(`${iotPrefix}--table-header-radiobutton`, {
              [`${iotPrefix}--table-header-radiobutton-resize`]: hasResize,
            })}
            translateWithId={(...args) => tableTranslateWithId(...args)}
          />
        ) : null}
        {ordering.map((item, columnIndex) => {
          const matchingColumnMeta = columns.find((column) => column.id === item.columnId);
          const hasSingleSort =
            matchingColumnMeta && sort && sort.columnId === matchingColumnMeta.id;
          const multiSortColumn =
            hasMultiSort &&
            matchingColumnMeta &&
            Array.isArray(sort) &&
            sort.find((c) => c.columnId === matchingColumnMeta.id);
          const hasSort = hasSingleSort || hasMultiSort;
          const sortOrder =
            hasMultiSort && Array.isArray(sort)
              ? sort.findIndex((c) => c.columnId === matchingColumnMeta.id) + 1
              : -1;

          const sortDirection = hasSingleSort
            ? sort.direction
            : hasMultiSort && multiSortColumn?.direction
            ? multiSortColumn.direction
            : 'NONE';

          const align =
            matchingColumnMeta && matchingColumnMeta.align ? matchingColumnMeta.align : 'start';
          const hasOverflow = Array.isArray(matchingColumnMeta?.overflowMenuItems);

          // Increases the minimum width of the Header when the overflow button is present
          const paddingExtra = hasOverflow
            ? matchingColumnMeta.isSortable
              ? PADDING_WITH_OVERFLOW_AND_SORT
              : PADDING_WITH_OVERFLOW
            : 0;

          const columnBelongsToExistingGroup = columnGroups.some(
            ({ id }) => id === item.columnGroupId
          );

          const rightmostColumn = langDir === 'ltr' ? lastVisibleColumn : visibleColumns[0];
          const flipTooltipDirection = rightmostColumn === item;

          return !item.isHidden && matchingColumnMeta ? (
            <TableHeader
              // TODO: remove deprecated 'testID' in v3
              spanGroupRow={showColumnGroups && !columnBelongsToExistingGroup}
              testId={`${testID || testId}-column-${matchingColumnMeta.id}`}
              width={initialColumnWidths[matchingColumnMeta.id]}
              initialWidth={initialColumnWidths[matchingColumnMeta.id]}
              id={`column-${matchingColumnMeta.id}`}
              key={`column-${matchingColumnMeta.id}`}
              data-column={matchingColumnMeta.id}
              isSortable={matchingColumnMeta.isSortable && !isDisabled}
              isSortHeader={hasSort}
              hasTooltip={!!matchingColumnMeta.tooltip}
              ref={columnRef[matchingColumnMeta.id]}
              hasMultiSort={hasMultiSort}
              hasOverflow={hasOverflow}
              thStyle={{
                width: currentColumnWidths[matchingColumnMeta.id]?.width,
              }}
              onClick={() => {
                if (matchingColumnMeta.isSortable && onChangeSort) {
                  onChangeSort(matchingColumnMeta.id);
                }
              }}
              translateWithId={(...args) => tableTranslateWithId(i18n, ...args)}
              sortDirection={sortDirection}
              align={align}
              className={classnames(`table-header-label-${align}`, {
                [`${iotPrefix}--table-head--table-header`]: initialColumnWidths !== undefined,
                'table-header-sortable': matchingColumnMeta.isSortable && !isDisabled,
                [`${iotPrefix}--table-header-resize`]: hasResize,
                [`${iotPrefix}--table-head--table-header--with-overflow`]:
                  hasOverflow || (hasMultiSort && matchingColumnMeta.isSortable && !isDisabled),
                [`${iotPrefix}--table-header--last-data-column`]:
                  showColumnGroups && item === lastVisibleColumn,
              })}
              // data-floating-menu-container is a work around for this carbon issue: https://github.com/carbon-design-system/carbon/issues/4755
              data-floating-menu-container
            >
              <TableCellRenderer
                className={`${iotPrefix}--table-head--text`}
                wrapText={wrapCellText}
                truncateCellText={truncateCellText}
                allowTooltip={false}
                tooltip={matchingColumnMeta.tooltip}
                tooltipDirection={flipTooltipDirection ? 'bottom-end' : undefined}
              >
                {matchingColumnMeta.name}
              </TableCellRenderer>

              {hasOverflow || (hasMultiSort && matchingColumnMeta.isSortable && !isDisabled) ? (
                <OverflowMenu
                  size="md"
                  className={`${iotPrefix}--table-head--overflow`}
                  direction="bottom"
                  data-testid="table-head--overflow"
                  flipped={columnIndex === ordering.length - 1}
                  onClick={(e) => e.stopPropagation()}
                >
                  {hasOverflow &&
                    matchingColumnMeta.overflowMenuItems.map((menuItem) => (
                      <OverflowMenuItem
                        data-testid={`${testID || testId}-column-overflow-menu-item-${menuItem.id}`}
                        itemText={menuItem.text}
                        key={`${columnIndex}--overflow-item-${menuItem.id}`}
                        onClick={(e) => handleOverflowItemClick(e, menuItem)}
                      />
                    ))}
                  {hasMultiSort && (
                    <OverflowMenuItem
                      data-testid={`${testID || testId}-column-overflow-menu-item-multi-sort`}
                      itemText={i18n.multiSortOverflowItem}
                      key={`${columnIndex}--overflow-item-multi-sort`}
                      onClick={(e) =>
                        handleOverflowItemClick(e, {
                          id: 'multi-sort',
                          meta: { columnId: matchingColumnMeta.id },
                        })
                      }
                    />
                  )}
                </OverflowMenu>
              ) : null}
              {sortOrder > 0 && !isDisabled && (
                <span className={`${iotPrefix}--table-header-label__sort-order`}>{sortOrder}</span>
              )}
              {hasResize && (item !== lastVisibleColumn || showExpanderColumn) ? (
                <ColumnResize
                  showExpanderColumn={showExpanderColumn}
                  onResize={onManualColumnResize}
                  ref={columnResizeRefs[matchingColumnMeta.id]}
                  currentColumnWidths={currentColumnWidths}
                  columnId={matchingColumnMeta.id}
                  ordering={ordering}
                  paddingExtra={paddingExtra}
                  preserveColumnWidths={preserveColumnWidths}
                />
              ) : null}
            </TableHeader>
          ) : null;
        })}

        {showExpanderColumn ? (
          <TableHeader
            // TODO: remove deprecated 'testID' in v3
            testId={`${testID || testId}-expander-column`}
            className={classnames(`${iotPrefix}--table-header-expander-column`)}
          />
        ) : null}
        {options.hasRowActions ? (
          <TableHeader
            // TODO: remove deprecated 'testID' in v3
            testId={`${testID || testId}-row-actions-column`}
            className={classnames(`${iotPrefix}--table-header-row-action-column`, {
              [`${iotPrefix}--table-header-row-action-column--extra-wide`]: hasSingleRowEdit,
            })}
          />
        ) : null}
      </TableRow>
      {showColumnGroups ? (
        // Column grouping should visually appear above the normal column headers but since we
        // need the normal column headers to control the width of the columns, and since rowspan
        // only works downward, we place the groups below the normal columns and then switch
        // places using scss.
        <ColumnGrouping
          appendedColumns={+showExpanderColumn + !!options.hasRowActions}
          testId={`${testId}-column-grouping`}
          prependedColumns={
            +!!(
              hasRowSelection === 'multi' ||
              (useRadioButtonSingleSelect && hasRowSelection === 'single')
            ) +
            !!(hasRowExpansion || hasRowNesting) +
            !!hasDragAndDrop
          }
          columnGroups={columnGroups}
          ordering={ordering}
        />
      ) : null}
      {filterBarActive && (
        <FilterHeaderRow
          // TODO: remove deprecated 'testID' in v3
          testId={`${testID || testId}-filter-header-row`}
          key={!hasFastFilter && JSON.stringify(filters)}
          columns={columns.map((column) => ({
            ...column.filter,
            id: column.id,
            isFilterable: !isNil(column.filter),
            isMultiselect: column.filter?.isMultiselect,
            width: column.width,
            customInput: column.filter?.customInput,
          }))}
          hasFastFilter={hasFastFilter}
          clearFilterText={clearFilterText}
          filterText={filterText}
          clearSelectionText={clearSelectionText}
          openMenuText={openMenuText}
          closeMenuText={closeMenuText}
          ordering={ordering}
          filters={filters}
          tableOptions={options}
          onApplyFilter={onApplyFilter}
          lightweight={lightweight}
          isDisabled={isDisabled}
          showExpanderColumn={showExpanderColumn}
          size={size}
          langDir={langDir}
          showColumnGroups={showColumnGroups}
          filterRowIcon={filterRowIcon}
          filterRowIconDescription={filterRowIconDescription}
          onFilterRowIconClick={onFilterRowIconClick}
          pinHeaderAndFooter={pinHeaderAndFooter}
          hasDragAndDrop={hasDragAndDrop}
        />
      )}
      {activeBar === 'column' && (
        <ColumnHeaderRow
          // TODO: remove deprecated 'testID' in v3
          testId={`${testID || testId}-column-header-row`}
          columns={columns.map((column) => ({
            id: column.id,
            name: column.name,
          }))}
          ordering={ordering}
          options={options}
          onChangeOrdering={onChangeOrdering}
          onColumnToggle={onColumnToggle}
          lightweight={lightweight}
          onColumnSelectionConfig={onColumnSelectionConfig}
          columnSelectionConfigText={i18n.columnSelectionConfig}
          isDisabled={isDisabled}
          showExpanderColumn={showExpanderColumn}
          hasDragAndDrop={hasDragAndDrop}
        />
      )}
    </CarbonTableHead>
  );
};

TableHead.propTypes = propTypes;
TableHead.defaultProps = defaultProps;

export default TableHead;
