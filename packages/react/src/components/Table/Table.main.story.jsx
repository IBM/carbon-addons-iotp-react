import React, { useMemo } from 'react';
import { action } from '@storybook/addon-actions';
import { object, select, boolean, text, number } from '@storybook/addon-knobs';
import { cloneDeep, debounce, merge, uniqueId } from 'lodash-es';
import { ToastNotification, BreadcrumbItem } from '@carbon/react';
import { SettingsAdjust } from '@carbon/react/icons';

import StoryNotice from '../../internal/StoryNotice';
import Button from '../Button';
import { DragAndDrop } from '../../utils/DragAndDropUtils';
import RuleBuilder from '../RuleBuilder/RuleBuilder';
import useStoryState from '../../internal/storyState';
import FlyoutMenu, { FlyoutMenuDirection } from '../FlyoutMenu/FlyoutMenu';
import { csvDownloadHandler } from '../../utils/componentUtilityFunctions';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

// import TableREADME from './mdx/Table.mdx'; //carbon 11
// import SortingREADME from './mdx/Sorting.mdx'; //Carbon 11
// import DragAndDropREADME from './mdx/DragAndDrop.mdx'; //carbon11
// import RowExpansionREADME from './mdx/RowExpansion.mdx';
// import SelectionAndBatchActionsREADME from './mdx/SelectionAndBatchActions.mdx';
// import InlineActionsREADME from './mdx/InlineActions.mdx';
// import RowNestingREADME from './mdx/RowNesting.mdx';
// import FilteringREADME from './mdx/Filtering.mdx';
// import AggregationsREADME from './mdx/Aggregations.mdx';
// import SearchingREADME from './mdx/Searching.mdx';
// import StatesREADME from './mdx/States.mdx';
// import PaginationREADME from './mdx/Pagination.mdx';
// import ToolbarREADME from './mdx/Toolbar.mdx';
// import EditDataREADME from './mdx/EditData.mdx';
// import PinnedHeaderAndFooterREADME from './mdx/PinnedHeaderAndFooter.mdx';
// import PinnedColumnREADME from './mdx/PinnedColumn.mdx';
import Table from './Table';
import StatefulTable from './StatefulTable';
import {
  addChildRows,
  addRowAction,
  addColumnGroupIds,
  getTableActions,
  getTableColumns,
  getTableCustomColumns,
  getTableData,
  getTableDataWithEmptySelectFilter,
  getTableToolbarActions,
  getExpandedData,
  getDefaultOrdering,
  getEditDataFunction,
  getRowActionStates,
  getAdvancedFilters,
  getMoreAdvancedFilters,
  getTableKnobs,
  getI18nKnobs,
  getBatchActions,
  objectWithSubstitution,
  getDrillDownRowAction,
  getOverflowTextOnlyRowAction,
  getOverflowDeleteRowAction,
  getOverflowAddRowAction,
  getOverflowEditRowAction,
  getHiddenOverflowRowAction,
  getHiddenRowAction,
  addMoreChildRowsToParent,
  getCustomEmptyState,
  getCustomErrorState,
  getCustomToolbarContentElement,
  getSelectDataOptions,
  decorateTableColumns,
} from './Table.story.helpers';
import MockApiClient from './AsyncTable/MockApiClient';
import AsyncTable from './AsyncTable/AsyncTable';
import { PIN_COLUMN } from './tableUtilities';

// Dataset used to speed up stories using row edit
const storyTableData = getTableData();
export default {
  title: '1 - Watson IoT/Table',
  parameters: {
    component: Table,
    // docs: {
    //   page: TableREADME,
    // },
  },
};

/**
 * The main playground story for the Table/StatefulTable.
 * All props (that can be combined) are enabled in dev mode in order to help catch
 * regressions and see how changes affect existing functionality. But for the consumers
 * of the library it would probably be overwhelming to see all functionality at once,
 * hence a simple table is shown in production.
 * @returns story function
 */
export const Playground = () => {
  // STATES
  const [showRowEditBar, setShowRowEditBar] = useStoryState(false);
  const [rowActionsState, setRowActionsState] = useStoryState(getRowActionStates());

  // KNOBS
  // The order of appearance is defined by the function getTableKnobs.
  const {
    selectedTableType,
    tableMaxWidth,
    secondaryTitle,
    numberOfRows,
    useZebraStyles,
    size,
    tableTooltipText,
    demoInitialColumnSizes,
    hasResize,
    preserveColumnWidths,
    useAutoTableLayoutForResize,
    demoColumnTooltips,
    demoColumnGroupAssignments,
    demoColumnOverflowMenuItems,
    columnGroups,
    hasColumnSelection,
    hasColumnSelectionConfig,
    demoSingleSort,
    hasMultiSort,
    hasAggregations,
    aggregationLabel,
    aggregationsColumns,
    hasFilter,
    hasAdvancedFilter,
    hasPagination,
    pageSizes,
    maxPages,
    isItemPerPageHidden,
    paginationSize,
    hasOnlyPageData,
    hasRowExpansion,
    hasRowNesting,
    demoHasLoadMore,
    shouldExpandOnRowClick,
    expandedIds,
    hasRowSelection,
    selectedIds,
    selectionCheckboxEnabled,
    hasSearch,
    hasFastSearch,
    searchFieldDefaultExpanded,
    wrapCellText,
    cellTextAlignment,
    preserveCellWhiteSpace,
    hasRowActions,
    shouldLazyRender,
    hasRowEdit,
    hasSingleRowEdit,
    demoRenderDataFunction,
    demoToolbarActions,
    demoCustomToolbarContent,
    demoDownloadCSV,
    toolbarIsDisabled,
    tableIsLoading,
    demoEmptyColumns,
    loadingRowCount,
    loadingColumnCount,
    demoEmptyState,
    demoCustomEmptyState,
    error: errorKnob,
    demoCustomErrorState,
    locale,
    batchActions,
    searchIsExpanded,
    useRadioButtonSingleSelect,
    hideClearAllFiltersButton,
    hasEmptyFilterOption,
    hasMultiSelectFilter,
    hasFilterRowIcon,
    pinColumn,
    pinHeaderAndFooter,
    emptyStateIcon,
  } = getTableKnobs({
    getDefaultValue: (name) =>
      // For this story always disable the following knobs by default
      [
        'hasUserViewManagement',
        'demoInitialColumnSizes',
        'hasRowExpansion',
        'toolbarIsDisabled',
        'hasMultiSort',
        'stickyHeader',
        'useAutoTableLayoutForResize',
        'isItemPerPageHidden',
        'hasColumnSelection',
        'hasColumnSelectionConfig',
        'shouldLazyRender',
        'preserveCellWhiteSpace',
        'tableIsLoading',
        'demoEmptyColumns',
        'demoEmptyState',
        'demoCustomEmptyState',
        'demoCustomErrorState',
        'demoColumnOverflowMenuItems',
        'hasOnlyPageData',
        'useRadioButtonSingleSelect',
        'hideClearAllFiltersButton',
        'hasEmptyFilterOption',
        'hasMultiSelectFilter',
        'hasFilterRowIcon',
        'pinHeaderAndFooter',
      ].includes(name)
        ? false
        : // For this story always enable the following knobs by default
        ['selectionCheckboxEnabled'].includes(name)
        ? true
        : name === 'secondaryTitle'
        ? 'Table playground'
        : name === 'pinColumn'
        ? false
        : // For this story enable the other knobs by defaults if we are in dev environment
          __DEV__,
    useGroups: true,
  });

  // CUSTOM DEMO JSX
  const rowEditBarButtons = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '12px' }} className=".bx--type-light">
        This is shallow demo implementation of the row edit functionality. Data modifications are
        not saved.
      </div>
      <Button key="cancel" size="sm" kind="tertiary" onClick={() => setShowRowEditBar(false)}>
        Cancel demo
      </Button>
    </div>
  );

  const singleRowEditButtons = (
    <Button
      key="cancel"
      size="sm"
      kind="tertiary"
      onClick={() => {
        setRowActionsState([...getRowActionStates()]);
      }}
    >
      Cancel Row edit demo
    </Button>
  );

  const customToolbarContentElement = getCustomToolbarContentElement();
  const customEmptyState = getCustomEmptyState();
  const customErrorState = getCustomErrorState();
  // INITIAL DATA STATE
  const [data, setData] = useStoryState(
    [...(demoEmptyState || demoCustomEmptyState ? [] : storyTableData)]
      .slice(0, numberOfRows)
      .map((row, index) => (hasRowActions ? addRowAction(row, hasSingleRowEdit, index) : row))
      .map((row, index) => (hasRowNesting ? addChildRows(row, index) : row))
      .map((row) => (!selectionCheckboxEnabled ? { ...row, isSelectable: false } : row))
      .map((row) => (demoHasLoadMore ? { ...row, hasLoadMore: true } : row)),
    // Reset initial state and trigger a story re-render when any
    // of the following values change
    [
      demoEmptyState,
      demoCustomEmptyState,
      hasRowActions,
      hasSingleRowEdit,
      hasRowNesting,
      selectionCheckboxEnabled,
      demoHasLoadMore,
      numberOfRows,
    ]
  );
  const onRowLoadMore = (parentId) => {
    action('onRowLoadMore')(parentId);
    setTimeout(() => {
      setData((prevData) => addMoreChildRowsToParent(prevData, parentId));
    }, 1000);
  };

  // PROPS ADJUSTED BASED ON KNOBS
  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const style = tableMaxWidth !== 'none' ? { maxWidth: tableMaxWidth } : null;
  const tableTooltip = tableTooltipText ? <div>{tableTooltipText}</div> : null;
  const activeBar =
    hasColumnSelection || hasColumnSelectionConfig
      ? 'column'
      : showRowEditBar
      ? 'rowEdit'
      : undefined;
  const toolbarActions = demoToolbarActions ? getTableToolbarActions() : undefined;
  const customToolbarContent = demoCustomToolbarContent ? customToolbarContentElement : undefined;
  const expandedData = hasRowExpansion ? getExpandedData(data) : [];
  const columns = [
    ...(demoEmptyColumns
      ? []
      : decorateTableColumns(getTableColumns(), hasEmptyFilterOption, hasMultiSelectFilter)),
  ]
    .map((column, index) => ({
      ...column,
      isSortable: (hasMultiSort || demoSingleSort) && index !== 1,
      width: demoInitialColumnSizes ? (index % 2 === 0 ? '100px' : '200px') : undefined,
      tooltip: demoColumnTooltips ? `A tooltip for ${column.name}` : undefined,
      align: cellTextAlignment,
      editDataFunction: getEditDataFunction(() => {}),
      overflowMenuItems: demoColumnOverflowMenuItems ? getSelectDataOptions() : undefined,
    }))
    .map((column) => {
      if (demoRenderDataFunction) return column;
      const { renderDataFunction, ...columnNoRenderDataFunction } = column;
      return columnNoRenderDataFunction;
    });

  const ordering = getDefaultOrdering(columns).map((col, index) =>
    demoColumnGroupAssignments ? addColumnGroupIds(col, index) : col
  );

  /**
   * Simple way to move rows into other rows. The moved rows are removed from the root data array or
   * their parent rows. They are appended to the target rows. This does NOT update the expanded
   * state on any rows. This is a simple example implementation that may not cover all cases.
   *
   * @param {string[]} fromRowIds The IDs to of the rows to move.
   * @param {string} toRowId The ID of the row to accept the moved rows.
   */
  function moveRows(fromRowIds, toRowId) {
    const fromIdSet = new Set(fromRowIds);
    const fromRows = [];
    let toRow;

    function recurse(rows) {
      for (let i = rows.length - 1; i >= 0; i -= 1) {
        const row = rows[i];

        if (toRowId === row.id) {
          toRow = row;
        }

        if (row.children) {
          recurse(row.children);
        }

        if (fromIdSet.has(row.id)) {
          fromRows.push(row);
          rows.splice(i, 1);
        }
      }
    }

    recurse(data);

    if (!toRow.children) {
      toRow.children = fromRows;
    } else {
      toRow.children = toRow.children.concat(fromRows);
    }

    setData(data);
  }

  const myTableActions = merge(getTableActions(), {
    table: {
      onDrag: (draggedRows) => {
        const dragIdSet = new Set(draggedRows.map((r) => r.id));
        const dropIds = [];

        /**
         * Picks all the IDs of the rows we can drop on. Excludes the dragged row and all children.
         */
        function gatherDropIds(rows) {
          for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i];

            // eslint-disable-next-line no-continue
            if (dragIdSet.has(row.id)) continue;
            // Skip a dragged row and its children.

            dropIds.push(row.id);

            if (row.children) gatherDropIds(row.children);
          }
        }

        gatherDropIds(data);

        return {
          preview: <NaiveMultiRowDragPreview rows={draggedRows} />,
          dropIds,
        };
      },
      onDrop: (dragRowIds, dropRowId) => {
        console.info(`>>> Dropped ${dragRowIds} onto ${dropRowId}`);
        moveRows(dragRowIds, dropRowId);
      },
      onRowLoadMore,
    },
    toolbar: {
      onShowRowEdit: () => {
        action('onShowRowEdit')();
        setShowRowEditBar(true);
      },
      onDownloadCSV: demoDownloadCSV
        ? (dataToDownload) => {
            csvDownloadHandler(dataToDownload, 'Table playground data');
            action('onDownloadCSV')(dataToDownload);
          }
        : undefined,
    },
  });
  const advancedFilters = hasAdvancedFilter ? getAdvancedFilters() : undefined;
  const emptyState = demoCustomEmptyState ? customEmptyState : undefined;
  const errorState = demoCustomErrorState ? customErrorState : undefined;
  const error = demoCustomErrorState ? 'Error!' : errorKnob;

  // For demo and test purposes we generate an new key for the table when
  // some knobs change that normally wouldn't trigger a rerender in the StatefulTable.
  const knobRegeneratedKey = `table${demoInitialColumnSizes}${JSON.stringify(aggregationsColumns)}
  ${aggregationLabel}${demoCustomEmptyState}${loadingRowCount}${loadingColumnCount}${maxPages}
  ${isItemPerPageHidden}${paginationSize}${demoToolbarActions}${toolbarIsDisabled}
  ${searchFieldDefaultExpanded}${searchIsExpanded}${error}${demoCustomErrorState}`;

  return (
    <DragAndDrop>
      <MyTable
        key={knobRegeneratedKey}
        id="table"
        style={style}
        secondaryTitle={secondaryTitle}
        useZebraStyles={useZebraStyles}
        tooltip={tableTooltip}
        columns={columns}
        columnGroups={columnGroups}
        data={data}
        expandedData={expandedData}
        actions={myTableActions}
        size={size}
        options={{
          hasAggregations,
          hasColumnSelection,
          hasColumnSelectionConfig,
          hasFilter: hasFilter && !hasAdvancedFilter,
          hasAdvancedFilter,
          hasMultiSort,
          hasPagination,
          hasOnlyPageData,
          hasResize,
          hasRowExpansion,
          hasRowNesting,
          hasRowSelection,
          shouldExpandOnRowClick,
          hasFastSearch,
          hasSearch,
          preserveColumnWidths,
          useAutoTableLayoutForResize,
          wrapCellText,
          preserveCellWhiteSpace,
          hasRowActions,
          shouldLazyRender,
          hasRowEdit,
          hasSingleRowEdit,
          useRadioButtonSingleSelect,
          hasFilterRowIcon,
          pinColumn,
          pinHeaderAndFooter,
        }}
        view={{
          advancedFilters,
          aggregations: {
            label: aggregationLabel,
            columns: aggregationsColumns,
          },
          toolbar: {
            activeBar,
            isDisabled: toolbarIsDisabled,
            customToolbarContent,
            toolbarActions,
            rowEditBarButtons,
            batchActions,
            search: {
              defaultExpanded: searchFieldDefaultExpanded,
              isExpanded: searchIsExpanded,
            },
            hideClearAllFiltersButton,
          },
          table: {
            emptyState,
            errorState,
            expandedIds,
            selectedIds,
            rowActions: rowActionsState,
            singleRowEditButtons,
            loadingState: {
              isLoading: tableIsLoading,
              rowCount: loadingRowCount,
              columnCount: loadingColumnCount,
            },
            ordering,
          },
          pagination: {
            pageSizes,
            maxPages,
            isItemPerPageHidden,
            size: paginationSize,
          },
        }}
        i18n={getI18nKnobs()}
        error={error}
        locale={locale}
        emptyStateIcon={emptyStateIcon}
      />
    </DragAndDrop>
  );
};
Playground.storyName = 'Playground';

function NaiveMultiRowDragPreview({ rows }) {
  return (
    <>
      {rows.map((row, i) => {
        return (
          <div key={i} style={i > 0 ? { marginTop: '1rem' } : null}>
            {row.values.type ? `${row.values.type} ${row.values.name}` : row.values.string}
          </div>
        );
      })}
    </>
  );
}

export function WithDragAndDrop() {
  const { hasBreadcrumbDrop } = getTableKnobs({
    knobsToCreate: ['hasBreadcrumbDrop'],
    getDefaultValue: () => true,
  });

  const columns = [
    {
      id: 'type',
      name: 'Type',
      width: '75px',
    },
    {
      id: 'name',
      name: 'Name (w/ count)',
      filter: { placeholderText: 'enter a string' },
    },
    {
      id: 'date',
      name: 'Date',
      filter: { placeholderText: 'enter a string' },
    },
  ];

  /**
   * Creates some initial data to show. Adds in types for folders and files to give a drag and drop
   * example. This story actually changes the data when dropping, but this can be used to get the
   * original data back.
   * @returns Array of rows.
   */
  function getInitialData() {
    const initialData = getTableData()
      .slice(0, 10)
      .map((row, i) => {
        const newRow = Object.assign({}, row);
        const isFolder = i % 3 === 0;
        newRow.values.type = isFolder ? '📁' : '📄';
        newRow.values.count = 0;
        newRow.values.name = newRow.values.string;
        newRow.isDraggable = !isFolder;
        return newRow;
      });

    return initialData;
  }

  const [data, setData] = useStoryState(getInitialData());

  function isFolder(row) {
    return row.values.type === '📁';
  }

  function reset() {
    setData(getInitialData());
  }

  return (
    <>
      <p>
        Demos drag and drop with some draggable rows (files) and only some that can be dropped on
        (folders).
      </p>
      <button type="button" style={{ marginBottom: '1rem' }} onClick={reset}>
        Reset Rows
      </button>
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
        secondaryTitle="Table"
        columns={columns}
        data={data}
        options={{
          hasDragAndDrop: true,
          hasBreadcrumbDrop,
          hasResize: true,
          hasRowSelection: 'multi',
          hasFilter: true,
          hasColumnSelection: true,
        }}
        actions={{
          table: {
            onDrag: (rows) => {
              action('onDrag')(rows.map((r) => r.id));

              return {
                dropIds: data.filter(isFolder).map((row) => row.id),
                preview: <NaiveMultiRowDragPreview rows={rows} />,
              };
            },
            onDrop: (dragRowIds, dropRowIdOrNode) => {
              action('onDrop')(dragRowIds, dropRowIdOrNode);
              const newData = data.filter((row) => !dragRowIds.includes(row.id));
              if (typeof dropRowIdOrNode === 'string') {
                const folderRow = newData.find((row) => dropRowIdOrNode === row.id);
                folderRow.values.count += dragRowIds.length;
                folderRow.values.name = `${folderRow.values.string} (${folderRow.values.count} inside)`;
              } else if (
                dropRowIdOrNode instanceof Element ||
                (dropRowIdOrNode && dropRowIdOrNode.nodeType === Node.ELEMENT_NODE)
              ) {
                const name =
                  dropRowIdOrNode.title && dropRowIdOrNode.title !== ''
                    ? dropRowIdOrNode.title
                    : dropRowIdOrNode.innerText;
                console.info(`>>> Dropped ${dragRowIds} onto breadcrumb node ${name}`);
              }
              setData(newData);
            },
          },
        }}
      />
    </>
  );
}

WithDragAndDrop.storyName = 'With drag and drop rows';
WithDragAndDrop.parameters = {
  component: Table,
  // docs: {
  //   page: DragAndDropREADME,
  // },
};

export const WithSorting = () => {
  const { selectedTableType, demoSingleSort, hasMultiSort } = getTableKnobs({
    knobsToCreate: ['selectedTableType', 'demoSingleSort', 'hasMultiSort'],
    getDefaultValue: (name) => name !== 'hasMultiSort',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData().slice(0, 50);
  const columns = getTableColumns().map((column) => ({
    ...column,
    isSortable: demoSingleSort,
    tooltip:
      column.id === 'object'
        ? `This column has a custom sort function based on the object id property`
        : column.id === 'status'
        ? `This column has a custom sort function that orders on BROKEN, RUNNING and then NOT_RUNNING`
        : undefined,
  }));

  const sort = object('Sort state (view.table.sort)', {
    columnId: 'select',
    direction: 'ASC',
  });

  return (
    <DragAndDrop>
      <MyTable
        actions={getTableActions()}
        columns={columns}
        data={data}
        options={{
          hasMultiSort,
        }}
        view={{
          table: {
            sort,
          },
        }}
      />
    </DragAndDrop>
  );
};

WithSorting.storyName = 'With sorting';
WithSorting.parameters = {
  component: Table,
  // docs: {
  //   page: SortingREADME,
  // },
};

export const WithSearching = () => {
  const {
    selectedTableType,
    hasSearch,
    hasFastSearch,
    searchFieldDefaultExpanded,
    searchIsExpanded,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasSearch',
      'hasFastSearch',
      'searchFieldDefaultExpanded',
      'searchIsExpanded',
    ],
    getDefaultValue: (name) => name !== 'searchFieldDefaultExpanded' && name !== 'searchIsExpanded',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = storyTableData;
  const columns = getTableColumns();

  const defaultValue = text(
    'Default search value controlled by the app (view.toolbar.search.defaultValue)',
    'helping'
  );

  const knobRegeneratedKey = `${searchFieldDefaultExpanded}${searchIsExpanded}`;

  return (
    <MyTable
      key={knobRegeneratedKey}
      actions={getTableActions()}
      columns={columns}
      data={data}
      options={{
        hasSearch,
        hasFastSearch,
      }}
      view={{
        toolbar: {
          search: {
            defaultValue,
            defaultExpanded: searchFieldDefaultExpanded,
            isExpanded: searchIsExpanded,
          },
        },
      }}
    />
  );
};

WithSearching.storyName = 'With searching';
WithSearching.parameters = {
  component: Table,
  // docs: {
  //   page: SearchingREADME,
  // },
};

export const WithRowExpansion = () => {
  const { selectedTableType, hasRowExpansion, shouldExpandOnRowClick } = getTableKnobs({
    knobsToCreate: ['selectedTableType', 'hasRowExpansion', 'shouldExpandOnRowClick'],
    getDefaultValue: () => true,
  });

  const initiallyExpandedIds = object('expandedIds', ['row-1']);

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData().slice(0, 10);
  const columns = getTableColumns();

  const expandedData = object('expandedData', [
    {
      rowId: 'row-1',
      content: 'My expanded content for row 1',
    },
    {
      rowId: 'row-3',
      content: 'My expanded content for row 3',
    },
  ]);

  return (
    <>
      <style>{`.iot--expanded-tablerow td[colspan="10"] { padding: 2rem !important;}`}</style>
      <MyTable
        actions={getTableActions()}
        columns={columns}
        data={data}
        expandedData={expandedData}
        options={{
          hasRowExpansion,
          shouldExpandOnRowClick,
        }}
        view={{ table: { expandedIds: initiallyExpandedIds } }}
      />
    </>
  );
};

WithRowExpansion.storyName = 'With row expansion';
WithRowExpansion.parameters = {
  component: Table,
  // docs: {
  //   page: RowExpansionREADME,
  // },
};

export const WithRowNesting = () => {
  const {
    selectedTableType,
    hasRowNesting,
    // shouldExpandOnRowClick,
    demoHasLoadMore,
    wrapCellText,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasRowNesting',
      'shouldExpandOnRowClick',
      'demoHasLoadMore',
      'wrapCellText',
    ],
    getDefaultValue: () => true,
  });

  const initiallyExpandedIds = object('Expanded ids (view.table.expandedIds)', ['row-1']);
  const demoDeepNesting = !hasRowNesting.hasSingleNestedHierarchy;
  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const initialData =
    storyTableData &&
    storyTableData
      .slice(0, 10)
      .map((row, index) => {
        return addChildRows(row, index, demoDeepNesting);
      })
      .map((row) => ({
        ...row,
        hasLoadMore: demoHasLoadMore,
      }));
  const columns = getTableColumns();
  const actions = getTableActions();

  const [loadingMoreIds, setLoadingMoreIds] = useStoryState([]);
  const [data, setData] = useStoryState(initialData, [demoHasLoadMore, demoDeepNesting]);
  const [expandedIds, setExpandedIds] = useStoryState(initiallyExpandedIds, initiallyExpandedIds);

  const onRowLoadMore = (parentId) => {
    action('onRowLoadMore')(parentId);
    if (selectedTableType !== 'StatefulTable') {
      setLoadingMoreIds((prev) => [...prev, parentId]);
    }
    setTimeout(() => {
      setData((prevData) => {
        if (selectedTableType !== 'StatefulTable') {
          setLoadingMoreIds((ids) => ids.filter((loadId) => loadId !== parentId));
        }
        return addMoreChildRowsToParent(prevData, parentId);
      });
    }, 2000);
  };

  const onRowExpanded = (rowId, expanded) => {
    action('onRowExpanded')(rowId, expanded);
    const temp = expanded ? [...expandedIds, rowId] : expandedIds.filter((id) => id !== rowId);
    setExpandedIds(temp);
  };
  return (
    <MyTable
      actions={{
        ...actions,
        table: {
          ...actions.table,
          onRowExpanded,
          onRowLoadMore,
        },
      }}
      columns={columns}
      data={data}
      options={{
        hasRowNesting,
        //   shouldExpandOnRowClick,
        wrapCellText,
      }}
      view={{
        table: {
          expandedIds,
          loadingMoreIds: selectedTableType !== 'StatefulTable' ? loadingMoreIds : [],
        },
      }}
    />
  );
};

WithRowNesting.storyName = 'With row nesting';
WithRowNesting.parameters = {
  component: Table,
  // docs: {
  //   page: RowNestingREADME,
  // },
};

export const WithAggregations = () => {
  const { selectedTableType, hasAggregations, aggregationLabel, aggregationsColumns } =
    getTableKnobs({
      knobsToCreate: [
        'selectedTableType',
        'hasAggregations',
        'aggregationLabel',
        'aggregationsColumns',
      ],
      getDefaultValue: () => true,
    });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData().slice(0, 10);
  const columns = getTableColumns();
  const actions = getTableActions();

  const knobRegeneratedKey = `table${JSON.stringify(aggregationsColumns)}${aggregationLabel}`;

  return (
    <MyTable
      key={knobRegeneratedKey}
      actions={actions}
      columns={columns}
      data={data}
      options={{ hasAggregations }}
      view={{
        aggregations: {
          label: aggregationLabel,
          columns: aggregationsColumns,
        },
      }}
    />
  );
};

WithAggregations.storyName = 'With aggregations';
WithAggregations.parameters = {
  component: Table,
  // docs: {
  //   page: AggregationsREADME,
  // },
};

export const WithFiltering = () => {
  const {
    selectedTableType,
    hasFilter,
    hasAdvancedFilter,
    hideClearAllFiltersButton,
    hasEmptyFilterOption,
    hasMultiSelectFilter,
    hasFilterRowIcon,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasFilter',
      'hasAdvancedFilter',
      'hideClearAllFiltersButton',
      'hasEmptyFilterOption',
      'hasMultiSelectFilter',
      'hasFilterRowIcon',
    ],
    getDefaultValue: (knobName) => {
      if (knobName === 'hasAdvancedFilter') {
        return false;
      }

      if (knobName === 'hideClearAllFiltersButton') {
        return false;
      }

      if (knobName === 'hasEmptyFilterOption') {
        return false;
      }

      if (knobName === 'hasMultiSelectFilter') {
        return false;
      }

      if (knobName === 'hasFilterRowIcon') {
        return false;
      }

      return true;
    },
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = hasEmptyFilterOption
    ? getTableDataWithEmptySelectFilter().slice(0, 30)
    : getTableData().slice(0, 30);

  const columns = decorateTableColumns(
    getTableColumns(),
    hasEmptyFilterOption,
    hasMultiSelectFilter
  ).map((col) =>
    col.id === 'object'
      ? {
          ...col,
          tooltip: `This column has objects as values and needs a custom filter function that
      filters based on an object property.`,
        }
      : col
  );

  // Normal filter settings
  let activeFilters;
  let activeBar;
  if (!hasAdvancedFilter) {
    activeFilters = object('Active filters (view.filters)', [
      {
        columnId: 'string',
        value: 'whiteboard',
      },
      {
        columnId: 'select',
        value: 'option-B',
      },
    ]);
    activeBar = select(
      'Show filter toolbar (view.toolbar.activeBar)',
      ['filter', undefined],
      'filter'
    );
  }

  // Advanced filter settings
  let displayOverflowFilterTags;
  const [showBuilder, setShowBuilder] = useStoryState(false);
  const [advancedFilters, setAdvancedFilters] = useStoryState(
    hasAdvancedFilter ? getAdvancedFilters() : undefined
  );
  const selectedAdvancedFilterIds = hasAdvancedFilter
    ? object(
        'Active advanced filters (view.selectedAdvancedFilterIds) ☢️',
        displayOverflowFilterTags
          ? ['story-filter']
          : ['story-filter', 'story-filter1', 'story-filter2']
      )
    : undefined;
  const advancedFilterFlyoutOpen = hasAdvancedFilter
    ? boolean('Show advanced filter flyout (view.toolbar.advancedFilterFlyoutOpen) ☢️', true)
    : undefined;
  const actions = merge(getTableActions(), {
    toolbar: { onCreateAdvancedFilter: () => setShowBuilder(true) },
  });
  const storyNotice = hasAdvancedFilter ? (
    <StoryNotice experimental componentName="StatefulTable with advancedFilters" />
  ) : null;

  if (hasAdvancedFilter) {
    displayOverflowFilterTags = boolean(
      'Enable overflow menu in filter tags for advanced filters  ☢️',
      false
    );
  }

  const operands = {
    CONTAINS: (a, b) => a.includes(b),
    NEQ: (a, b) => a !== b,
    LT: (a, b) => a < b,
    LTOET: (a, b) => a <= b,
    EQ: (a, b) => a === b,
    GTOET: (a, b) => a >= b,
    GT: (a, b) => a > b,
  };
  const filteredData =
    selectedTableType === 'Table' && hasAdvancedFilter
      ? data.filter(({ values }) => {
          // return false if a value doesn't match a valid filter
          return advancedFilters[0].filterRules.rules.reduce(
            (acc, { columnId, operand, value: filterValue }) => {
              const columnValue = values[columnId].toString();
              const comparitor = operands[operand];
              if (advancedFilters[0].filterRules.groupLogic === 'ALL') {
                return acc && comparitor(columnValue, filterValue);
              }

              return comparitor(columnValue, filterValue);
            },
            true
          );
        })
      : data;

  if (displayOverflowFilterTags) {
    setAdvancedFilters((prevFilters) => [...prevFilters, ...getMoreAdvancedFilters()]);
  }

  const knobRegeneratedKey = `${JSON.stringify(activeFilters)}`;
  return (
    <>
      {storyNotice}
      <MyTable
        key={knobRegeneratedKey}
        actions={actions}
        columns={columns}
        data={filteredData}
        options={{
          hasFilter: hasFilter && !hasAdvancedFilter ? hasFilter : false,
          hasAdvancedFilter,
          hasFilterRowIcon,
        }}
        view={{
          advancedFilters,
          selectedAdvancedFilterIds,
          filters: activeFilters,
          toolbar: {
            activeBar,
            advancedFilterFlyoutOpen,
            hideClearAllFiltersButton,
          },
        }}
      />
      {showBuilder && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
          }}
        >
          <RuleBuilder
            onSave={(newFilter) => {
              setAdvancedFilters((prev) => [
                ...prev,
                {
                  filterId: uniqueId('filter-id'),
                  ...newFilter,
                },
              ]);
              setShowBuilder(false);
            }}
            onCancel={() => setShowBuilder(false)}
            filter={{
              filterColumns: columns.map(({ id, name }) => ({ id, name })),
            }}
          />
        </div>
      )}
    </>
  );
};

WithFiltering.storyName = 'With filtering';
WithFiltering.parameters = {
  component: Table,
  // docs: {
  //   page: FilteringREADME,
  // },
};

export const WithCustomInputFiltering = () => {
  const {
    selectedTableType,
    hideClearAllFiltersButton,
    hasEmptyFilterOption,
    hasMultiSelectFilter,
    hasFilterRowIcon,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hideClearAllFiltersButton',
      'hasEmptyFilterOption',
      'hasMultiSelectFilter',
      'hasFilterRowIcon',
    ],
    getDefaultValue: (knobName) => {
      if (knobName === 'hideClearAllFiltersButton') {
        return false;
      }

      if (knobName === 'hasEmptyFilterOption') {
        return false;
      }

      if (knobName === 'hasMultiSelectFilter') {
        return false;
      }

      if (knobName === 'hasFilterRowIcon') {
        return false;
      }

      return true;
    },
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = hasEmptyFilterOption
    ? getTableDataWithEmptySelectFilter().slice(0, 30)
    : getTableData().slice(0, 30);

  const columns = decorateTableColumns(
    getTableCustomColumns(),
    hasEmptyFilterOption,
    hasMultiSelectFilter
  ).map((col) =>
    col.id === 'object'
      ? {
          ...col,
          tooltip: `This column has objects as values and needs a custom filter function that
      filters based on an object property.`,
        }
      : col
  );

  const activeFilters = object('Active filters (view.filters)', [
    {
      columnId: 'string',
      value: 'whiteboard',
    },
  ]);
  const activeBar = select(
    'Show filter toolbar (view.toolbar.activeBar)',
    ['filter', undefined],
    'filter'
  );

  const knobRegeneratedKey = `${JSON.stringify(activeFilters)}`;
  return (
    <>
      <MyTable
        key={knobRegeneratedKey}
        columns={columns}
        data={data}
        options={{
          hasFilter: true,
          hasFilterRowIcon,
        }}
        view={{
          filters: activeFilters,
          toolbar: {
            activeBar,
            hideClearAllFiltersButton,
          },
        }}
      />
    </>
  );
};

WithCustomInputFiltering.storyName = 'With custom input filtering';
WithCustomInputFiltering.parameters = {
  component: Table,
  // docs: {
  //   page: FilteringREADME,
  // },
};

export const WithSelectionAndBatchActions = () => {
  const {
    selectedTableType,
    hasRowSelection,
    selectionCheckboxEnabled,
    useRadioButtonSingleSelect,
    demoToolbarActions,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasRowSelection',
      'selectionCheckboxEnabled',
      'useRadioButtonSingleSelect',
      'demoToolbarActions',
    ],
    getDefaultValue: () => true,
  });

  const isStateful = selectedTableType === 'StatefulTable';
  const isMultiSelect = hasRowSelection === 'multi';
  const selectdIdsDescription = `${isStateful ? 'Initially selected' : 'Selected'}
    id${isMultiSelect ? 's' : ''} (view.table.selectedIds)`;
  const selectedIds =
    hasRowSelection === 'multi'
      ? object(selectdIdsDescription, ['row-3', 'row-4'])
      : object(selectdIdsDescription, ['row-3']);

  const batchActions = isMultiSelect
    ? objectWithSubstitution(
        'Batch actions for selected rows (view.toolbar.batchActions)',
        getBatchActions()
      )
    : undefined;

  const MyTable = isStateful ? StatefulTable : Table;
  const data = getTableData()
    .slice(0, 10)
    .map((row) => (!selectionCheckboxEnabled ? { ...row, isSelectable: false } : row));
  const columns = getTableColumns();

  return (
    <MyTable
      key={demoToolbarActions}
      actions={getTableActions()}
      columns={columns}
      data={data}
      options={{
        hasRowSelection,
        useRadioButtonSingleSelect,
        hasSearch: true,
        hasBatchActionToolbar: demoToolbarActions,
      }}
      view={{
        table: {
          selectedIds,
        },
        toolbar: demoToolbarActions ? { batchActions } : undefined,
      }}
    />
  );
};

WithSelectionAndBatchActions.storyName = 'With selection and batch actions';
WithSelectionAndBatchActions.parameters = {
  component: Table,
  // docs: {
  //   page: SelectionAndBatchActionsREADME,
  // },
};

export const WithInlineActions = () => {
  const WithInlineActionsTable = () => {
    const { selectedTableType, hasRowActions } = getTableKnobs({
      knobsToCreate: ['selectedTableType', 'hasRowActions'],
      getDefaultValue: () => true,
    });

    const rowActions = [
      objectWithSubstitution('Row actions for row-0 (data[0].rowActions)', [
        getDrillDownRowAction(),
      ]),
      objectWithSubstitution('Row actions for row-1 (data[1].rowActions)', [
        getDrillDownRowAction(),
        getOverflowTextOnlyRowAction(),
        getHiddenOverflowRowAction(),
      ]),
      objectWithSubstitution('Row actions for row-2 (data[2].rowActions)', [
        getOverflowEditRowAction(),
        getOverflowAddRowAction(),
        getOverflowDeleteRowAction(),
      ]),
      objectWithSubstitution('Row actions for row-3 (data[3].rowActions)', [
        getHiddenRowAction(),
        getHiddenOverflowRowAction(),
      ]),
      null,
      null,
      null,
      null,
      null,
      objectWithSubstitution('Row actions for row-9 (data[9].rowActions)', [
        getOverflowEditRowAction(),
        getOverflowAddRowAction(),
        getOverflowDeleteRowAction(),
      ]),
    ];

    const rowActionsState = object(
      'State of the row actions (view.table.rowActions)',
      getRowActionStates()
    );

    // const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
    const MyTable = useMemo(() => {
      return selectedTableType === 'StatefulTable' ? StatefulTable : Table;
    }, [selectedTableType]);
    const data = getTableData()
      .slice(0, 10)
      .map((row, index) => {
        if (hasRowActions) {
          return { ...row, rowActions: rowActions[index] ?? [] };
        }
        return row;
      });
    const columns = getTableColumns();

    return (
      <MyTable
        // actions={getTableActions()}
        columns={columns}
        data={data}
        options={{
          hasRowActions,
        }}
        view={{ table: { rowActions: rowActionsState } }}
      />
    );
  };
  return <WithInlineActionsTable />;
};
WithInlineActions.storyName = 'With inline actions';
WithInlineActions.parameters = {
  component: Table,
  // docs: {
  //   page: InlineActionsREADME,
  // },
};

export const WithPinnedHeaderAndFooter = () => {
  const {
    selectedTableType,
    demoSingleSort,
    pinHeaderAndFooter,
    hasFilter,
    columnGroups,
    demoColumnGroupAssignments,
    hasRowSelection,
    hasPagination,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'demoSingleSort',
      'pinHeaderAndFooter',
      'hasFilter',
      'columnGroups',
      'demoColumnGroupAssignments',
      'hasRowSelection',
      'hasPagination',
    ],
    getDefaultValue: (name) => name !== 'hasMultiSort',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData().slice(0, 50);
  const columns = getTableColumns().map((column) => ({
    ...column,
    isSortable: demoSingleSort,
    tooltip:
      column.id === 'object'
        ? `This column has a custom sort function based on the object id property`
        : column.id === 'status'
        ? `This column has a custom sort function that orders on BROKEN, RUNNING and then NOT_RUNNING`
        : undefined,
  }));

  const ordering = getDefaultOrdering(columns).map((col, index) =>
    demoColumnGroupAssignments ? addColumnGroupIds(col, index) : col
  );

  return (
    <div style={{ height: '400px' }}>
      <MyTable
        actions={getTableActions()}
        columns={columns}
        columnGroups={columnGroups}
        data={data}
        options={{
          pinHeaderAndFooter,
          hasResize: true,
          hasPagination,
          hasFilter,
          hasRowSelection,
        }}
        view={{
          table: {
            ordering,
          },
        }}
      />
    </div>
  );
};

WithPinnedHeaderAndFooter.storyName = 'With pinned header and footer';
WithPinnedHeaderAndFooter.parameters = {
  component: Table,
  // docs: {
  //   page: PinnedHeaderAndFooterREADME,
  // },
};

export const WithMainViewStates = () => {
  const {
    selectedTableType,
    tableIsLoading,
    demoEmptyColumns,
    loadingRowCount,
    loadingColumnCount,
    demoEmptyState,
    demoCustomEmptyState,
    error: errorKnob,
    demoCustomErrorState,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'tableIsLoading',
      'demoEmptyColumns',
      'loadingRowCount',
      'loadingColumnCount',
      'demoEmptyState',
      'demoCustomEmptyState',
      'error',
      'demoCustomErrorState',
    ],
    getDefaultValue: (name) =>
      name !== 'demoEmptyColumns' &&
      name !== 'demoEmptyState' &&
      name !== 'demoCustomEmptyState' &&
      name !== 'demoCustomErrorState',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = demoCustomEmptyState || demoEmptyState ? [] : getTableData();
  const columns = getTableColumns();
  const emptyState = demoCustomEmptyState ? getCustomEmptyState() : undefined;

  // The "error" prop needs a value in order for the view.table.errorState
  // to appear.
  const error = demoCustomErrorState ? 'Error!' : errorKnob;
  const errorState = demoCustomErrorState ? getCustomErrorState() : undefined;

  const knobRegeneratedKey = `table${demoCustomEmptyState}${demoEmptyState}${demoCustomErrorState}`;

  return (
    <MyTable
      key={knobRegeneratedKey}
      actions={getTableActions()}
      columns={demoEmptyColumns ? [] : columns}
      data={data}
      options={{}}
      error={error}
      view={{
        table: {
          errorState,
          emptyState,
          loadingState: {
            rowCount: loadingRowCount,
            columnCount: loadingColumnCount,
            isLoading: tableIsLoading,
          },
        },
      }}
    />
  );
};
WithMainViewStates.storyName = 'With main view states';
WithMainViewStates.parameters = {
  component: Table,
  // docs: {
  //   page: StatesREADME,
  // },
};

export const WithPagination = () => {
  const {
    selectedTableType,
    hasPagination,
    pageSizes,
    maxPages,
    isItemPerPageHidden,
    paginationSize,
    hasOnlyPageData,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasPagination',
      'pageSizes',
      'maxPages',
      'isItemPerPageHidden',
      'paginationSize',
      'hasOnlyPageData',
    ],
    getDefaultValue: (name) => name !== 'hasOnlyPageData' && name !== 'isItemPerPageHidden',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData();
  const columns = getTableColumns();

  const pageSize = select('Selected pageSize (view.pagination.pageSize)', pageSizes, 10);
  const page = number('Current page (view.pagination.page)', 1);
  const totalItems = number('Total items in data prop (view.pagination.totalItems)', data.length);

  const knobRegeneratedKey = `table${isItemPerPageHidden}${maxPages}${paginationSize}${pageSize}`;

  return (
    <MyTable
      key={knobRegeneratedKey}
      actions={getTableActions()}
      columns={columns}
      data={data}
      options={{ hasPagination, hasOnlyPageData }}
      view={{
        pagination: {
          page,
          pageSize,
          pageSizes,
          totalItems,
          maxPages,
          isItemPerPageHidden,
          size: paginationSize,
        },
      }}
    />
  );
};
WithPagination.storyName = 'With pagination';
WithPagination.parameters = {
  component: Table,
  // docs: {
  //   page: PaginationREADME,
  // },
};

export const WithToolbar = () => {
  const {
    selectedTableType,
    secondaryTitle,
    tableTooltipText,
    demoCustomToolbarContent,
    toolbarIsDisabled,
    demoDownloadCSV,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'secondaryTitle',
      'tableTooltipText',
      'demoCustomToolbarContent',
      'toolbarIsDisabled',
      'demoDownloadCSV',
    ],
    getDefaultValue: (name) =>
      name === 'secondaryTitle' ? 'Table with toolbar and actions' : name !== 'toolbarIsDisabled',
  });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const data = getTableData();
  const columns = getTableColumns();

  const flyoutMenu = (
    <FlyoutMenu
      key="custom-content-2"
      direction={FlyoutMenuDirection.BottomEnd}
      iconDescription="Toggle flyout Menu"
      buttonProps={{ size: 'default', renderIcon: SettingsAdjust }}
      onApply={action('Flyout Menu Apply Clicked')}
      onCancel={action('Flyout Menu Cancel Clicked')}
      hideTooltip={false}
    >
      Example of custom toolbar content inserting a FlyoutMenu
    </FlyoutMenu>
  );
  const tableTooltip = tableTooltipText ? <div>{tableTooltipText}</div> : null;
  const customToolbarContent = demoCustomToolbarContent ? (
    <>
      {getCustomToolbarContentElement()}
      {flyoutMenu}
    </>
  ) : undefined;
  const toolbarActions = objectWithSubstitution(
    'Toolbar actions (view.toolbar.toolbarActions)',
    getTableToolbarActions(),
    undefined,
    'substituted with text - no edit'
  );

  // For demo and test purposes we generate an new key for the table when
  // some knobs change that normally wouldn't trigger a rerender in the StatefulTable.
  const knobRegeneratedKey = `table${toolbarIsDisabled}${JSON.stringify(toolbarActions)}`;

  const onDownloadCSV = demoDownloadCSV
    ? (filteredData) => csvDownloadHandler(filteredData, 'my table data')
    : undefined;

  return (
    <MyTable
      key={knobRegeneratedKey}
      actions={merge(getTableActions(), {
        toolbar: {
          onDownloadCSV,
        },
      })}
      columns={columns}
      data={data}
      secondaryTitle={secondaryTitle}
      tooltip={tableTooltip}
      view={{
        toolbar: {
          isDisabled: toolbarIsDisabled,
          customToolbarContent,
          toolbarActions: () => {
            return toolbarActions;
          },
        },
      }}
    />
  );
};
WithToolbar.storyName = 'With toolbar';
WithToolbar.parameters = {
  component: Table,
  // docs: {
  //   page: ToolbarREADME,
  // },
};

export const WithPinnedColumn = () => {
  const {
    selectedTableType,
    hasRowSelection,
    selectionCheckboxEnabled,
    useRadioButtonSingleSelect,
    pinColumn,
  } = getTableKnobs({
    knobsToCreate: [
      'selectedTableType',
      'hasRowSelection',
      'selectionCheckboxEnabled',
      'useRadioButtonSingleSelect',
      'demoToolbarActions',
      'pinColumn',
    ],
    getDefaultValue: (name) => (name === 'pinColumn' ? PIN_COLUMN.FIRST : true),
  });

  const isStateful = selectedTableType === 'StatefulTable';
  const MyTable = isStateful ? StatefulTable : Table;

  const data = getTableData()
    .slice(0, 10)
    .map((row) => (!selectionCheckboxEnabled ? { ...row, isSelectable: false } : row));
  const columns = getTableColumns();

  return (
    <MyTable
      actions={getTableActions()}
      columns={columns}
      data={data}
      options={{
        hasRowSelection,
        useRadioButtonSingleSelect,
        hasSearch: true,
        pinColumn,
      }}
      view={{}}
    />
  );
};
WithPinnedColumn.storyName = 'With pinned column';
WithPinnedColumn.parameters = {
  component: Table,
  // docs: {
  //   page: PinnedColumnREADME,
  // },
};

export const WithDataEditing = () => {
  const { selectedTableType, hasRowActions, hasRowEdit, hasSingleRowEdit, preserveCellWhiteSpace } =
    getTableKnobs({
      knobsToCreate: [
        'selectedTableType',
        'hasRowActions',
        'hasRowEdit',
        'hasSingleRowEdit',
        'preserveCellWhiteSpace',
      ],
      getDefaultValue: (knobName) => (knobName === 'selectedTableType' ? 'Table' : true),
    });

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const editAction = getOverflowEditRowAction();
  editAction.disabled = false;
  const initialData = storyTableData.slice(0, 10).map((i) => ({
    ...i,
    rowActions: [editAction],
  }));

  const [showRowEditBar, setShowRowEditBar] = useStoryState(false);
  const [currentData, setCurrentData] = useStoryState(initialData);
  const [rowEditData, setRowEditedData] = useStoryState([]);
  const [previousData, setPreviousData] = useStoryState([]);
  const [showToast, setShowToast] = useStoryState(false);
  const [rowActionsState, setRowActionsState] = useStoryState([]);
  const [isPristine, setIsPristine] = useStoryState(true);

  const disableRowActions = (data, disabled) => {
    const rowAction = getOverflowEditRowAction();
    rowAction.disabled = disabled;
    return data.map((row) => ({ ...row, rowActions: [rowAction] }));
  };

  const onDataChange = debounce((newValue, columnId, rowId) => {
    setRowEditedData((previousData) =>
      previousData.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [columnId]: newValue } } : row
      )
    );
    setIsPristine(false);
  });

  const onShowMultiRowEdit = () => {
    setRowEditedData(cloneDeep(currentData));
    setShowRowEditBar(true);
    setShowToast(false);
    setCurrentData((prev) => disableRowActions(prev, true));
  };
  const onCancelRowEdit = () => {
    setRowEditedData([]);
    setShowRowEditBar(false);
    setRowActionsState([]);
    setIsPristine(true);
    setCurrentData((prev) => disableRowActions(prev, false));
  };
  const onSaveRowEdit = () => {
    // because of the nature of rendering these buttons dynamically (and asyncronously via dispatch)
    // in the StatefulTable we need to wrap these calls inside the setRowEditedData callback to ensure
    // we're always working with the correctly updated data.
    setRowEditedData((prev) => {
      setShowToast(true);
      setPreviousData(disableRowActions(currentData, false));
      setCurrentData(disableRowActions(prev, false));
      setShowRowEditBar(false);
      setRowActionsState([]);
      setIsPristine(true);
      return [];
    });
  };
  const onUndoRowEdit = () => {
    setCurrentData(previousData);
    setPreviousData([]);
    setShowToast(false);
  };

  const onApplyRowAction = (action, rowId) => {
    if (action === 'edit') {
      setRowEditedData(cloneDeep(currentData));
      setCurrentData(disableRowActions(currentData, true));
      setRowActionsState([{ rowId, isEditMode: true }]);
    }
  };

  const saveCancelButtons = (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button key="cancel" size="sm" kind="tertiary" onClick={onCancelRowEdit}>
        Cancel
      </Button>
      <Button key="save" size="sm" onClick={onSaveRowEdit} disabled={isPristine}>
        Save
      </Button>
    </div>
  );

  // We define some initial column widths to prevent the columns from adjusting
  // in size when edit mode is activated
  const columnWidths = {
    string: '250px',
    date: '220px',
    select: '160px',
    secretField: '165px',
    status: '165px',
    number: '95px',
    boolean: '90px',
    node: '115px',
    object: '110px',
  };
  const columns = getTableColumns().map((column) => ({
    ...column,
    // This is a simplified example.
    // The app should also handle input validation etc
    editDataFunction: getEditDataFunction(onDataChange),
    width: columnWidths[column.id],
  }));

  const myToast = (
    <ToastNotification
      style={{ position: 'absolute', zIndex: '99' }}
      hideCloseButton={false}
      kind="success"
      notificationType="inline"
      role="alert"
      subtitle={
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
          <span>Changed your mind?</span>
          <Button
            style={{ color: 'white', marginLeft: '12px' }}
            kind="ghost"
            onClick={onUndoRowEdit}
            size="sm"
            type="button"
          >
            Undo edits
          </Button>
        </div>
      }
      timeout={5000}
      title="Your changes have been saved."
    />
  );

  return (
    <div>
      {showToast ? myToast : null}
      <MyTable
        id="table"
        secondaryTitle="My editable table"
        view={{
          toolbar: {
            activeBar: showRowEditBar ? 'rowEdit' : undefined,
            rowEditBarButtons: saveCancelButtons,
          },
          table: {
            rowActions: rowActionsState,
            singleRowEditButtons: saveCancelButtons,
          },
        }}
        // WORKAROUND for #3406
        // Ideally we would only ever use the currentData here, but the stateful table doesn't pick
        // up isolated changes to view.toolbar.rowEditBarButtons or view.table.singleRowEditButtons so we
        // have to trigger the TABLE_REGISTER action by some other means in order to render the changes
        // made to the disabled state of the save button. That is why we then use rowEditData.
        data={selectedTableType === 'StatefulTable' && !isPristine ? rowEditData : currentData}
        actions={{
          table: { onApplyRowAction },
          toolbar: { onShowRowEdit: onShowMultiRowEdit },
        }}
        options={{
          preserveColumnWidths: true,
          hasResize: true,
          hasRowEdit,
          hasSingleRowEdit,
          preserveCellWhiteSpace,
          hasRowActions,
        }}
        columns={columns}
      />
    </div>
  );
};
WithDataEditing.storyName = 'With data editing';
WithDataEditing.parameters = {
  component: Table,
  // docs: {
  //   page: EditDataREADME,
  // },
};

export const WithAsynchronousDataSource = () => {
  const apiClient = new MockApiClient(100, number('Fetch Duration (ms)', 500));
  return <AsyncTable fetchData={apiClient.getData} />;
};
WithAsynchronousDataSource.storyName = 'With asynchronous data source';
WithAsynchronousDataSource.parameters = {
  component: Table,
  // docs: {
  //   page: TableREADME,
  // },
};
