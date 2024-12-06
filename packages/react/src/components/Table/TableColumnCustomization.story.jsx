import React, { useState } from 'react';
import { Column } from '@carbon/react/icons';
import { action } from '@storybook/addon-actions';
import { boolean, object, select } from '@storybook/addon-knobs';
import { v4 as uuidv4 } from 'uuid';

import { DragAndDrop } from '../../utils/DragAndDropUtils';
import Button from '../Button';

import Table from './Table';
import StatefulTable from './StatefulTable';
import TableColumnCustomizationModal from './TableColumnCustomizationModal/TableColumnCustomizationModal';
import TableColumnCustomizationREADME from './mdx/TableColumnCustomization.mdx';
import { getTableData, getTableColumns } from './Table.story.helpers';

const tableData = getTableData();
const tableColumns = getTableColumns();

export default {
  title: '1 - Watson IoT/Table/Column customization',

  parameters: {
    component: Table,
    docs: {
      page: TableColumnCustomizationREADME,
    },
  },

  excludeStories: [],
};

/**
 * This story combines all the props and components that can be used to
 * customize the columns.
 */
export const Playground = () => {
  const selectedTableType = select('Type of Table', ['Table', 'StatefulTable'], 'Table');
  const tableContainerWidth = select('Table container width', ['auto', '300px', '800px'], 'auto');
  const hasResize = boolean('Resizable columns (hasResize)', true);
  const preserveColumnWidths = boolean(
    'Preserve sibling column widths for resize/show/hide (preserveColumnWidths)',
    true
  );
  const useAutoTableLayoutForResize = boolean(
    'Use CSS table-layout "auto" instead of "fixed" (useAutoTableLayoutForResize)',
    false
  );
  const initialColumnsWidth = select(
    'Use initial columns width (columns[i].width)',
    [undefined, '100px', '300px'],
    undefined
  );
  const demoOverflowMenu = boolean('Demo column overflow menu', true);
  const demoHiddenColumn = boolean('Demo hidden column', true);
  const demoColumnTooltips = boolean('Demo column tooltips', false);

  const demoGroupExample = boolean('Demo assigning columns to groups', false);
  const columnGroups = object('Column groups definition (columnGroups)', [
    { id: 'groupA', name: 'Group A' },
    { id: 'groupB', name: 'Group B' },
  ]);

  const showColumnCustomizationModal = boolean(
    'Show column customization modal (TableColumnCustomizationModal.showModal)',
    false
  );
  const demoHasLoadMore = boolean(
    'Demo load more example (TableColumnCustomizationModal.hasLoadMore)',
    false
  );
  const demoPinnedColumn = boolean(
    'Demo pinned column (TableColumnCustomizationModal.pinnedColumnId)',
    false
  );
  const hasVisibilityToggle = boolean(
    'Allow toggling visibility (TableColumnCustomizationModal.hasVisibilityToggle)',
    false
  );
  const primaryValue = select(
    'Column key used for primary value (TableColumnCustomizationModal.primaryValue)',
    ['id', 'name'],
    'name'
  );
  const secondaryValue = select(
    'Column key used for secondary value (TableColumnCustomizationModal.secondaryValue)',
    ['id', 'name', 'NONE'],
    'NONE'
  );

  const smallDataSet = tableData.slice(0, 5);
  const allAvailableColumns = tableColumns;
  const initialActiveColumns = allAvailableColumns.slice(0, 6);
  const getInitialOrdering = () => [
    { columnId: 'string' },
    { columnId: 'date' },
    { columnId: 'select' },
    { columnId: 'secretField', isHidden: demoHiddenColumn },
    { columnId: 'status' },
    { columnId: 'number' },
  ];

  const columnGroupMapping = [
    { id: 'groupA', name: 'Group A', columnIds: ['date', 'select'] },
    { id: 'groupB', name: 'Group B', columnIds: ['status', 'secretField', 'number', 'boolean'] },
  ];

  const appendGrouping = (col) => {
    const group = columnGroupMapping.find((group) => group.columnIds.includes(col.columnId));
    return group
      ? {
          ...col,
          columnGroupId: group.id,
        }
      : col;
  };

  const [showModal, setShowModal] = useState(false);
  const [loadedColumns, setLoadedColumns] = useState(allAvailableColumns.slice(0, 7));
  const [loadingMoreIds, setLoadingMoreIds] = useState([]);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [activeColumns, setActiveColumns] = useState(initialActiveColumns);
  const [ordering, setOrdering] = useState(getInitialOrdering());
  const [modalKey, setModalKey] = useState('initial-key');

  const getOverflowMenuItems = (name) => [
    {
      id: 'action-A',
      text: `${name} action A`,
    },
    {
      id: 'action-B',
      text: `${name} action B`,
    },
  ];

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  return (
    <>
      <div style={{ width: tableContainerWidth }}>
        <MyTable
          key={`table${initialColumnsWidth}`} // Regenarate to show change in story
          columns={activeColumns.map((col) => ({
            ...col,
            width: initialColumnsWidth,
            tooltip: demoColumnTooltips
              ? col.id === 'select'
                ? `This tooltip displays extra information about the select box. You can choose from a variety of options. Pick one today!`
                : `A tooltip for ${col.name} here`
              : undefined,
            overflowMenuItems: demoOverflowMenu ? getOverflowMenuItems(col.name) : undefined,
          }))}
          columnGroups={demoGroupExample ? columnGroups : undefined}
          data={smallDataSet}
          options={{
            hasResize,
            preserveColumnWidths,
            useAutoTableLayoutForResize,
          }}
          view={{
            table: { ordering: demoGroupExample ? ordering.map(appendGrouping) : ordering },
            toolbar: {
              customToolbarContent: (
                <Button
                  kind="ghost"
                  renderIcon={(props) => <Column size={20} {...props} />}
                  iconDescription="Customize columns"
                  hasIconOnly
                  onClick={() => setShowModal(true)}
                />
              ),
            },
          }}
          actions={{
            table: {
              onOverflowItemClicked: action('onOverflowItemClicked'),
              onColumnResize: action('onColumnResize'),
              onChangeOrdering: action('onChangeOrdering'),
            },
          }}
        />
      </div>
      <TableColumnCustomizationModal
        key={modalKey}
        groupMapping={demoGroupExample ? columnGroupMapping : []}
        hasLoadMore={demoHasLoadMore && canLoadMore}
        hasVisibilityToggle={hasVisibilityToggle}
        availableColumns={loadedColumns}
        initialOrdering={ordering}
        loadingMoreIds={loadingMoreIds}
        onClose={() => {
          setShowModal(false);
          action('onClose');
        }}
        onChange={action('onChange')}
        onLoadMore={(id) => {
          setLoadingMoreIds([id]);
          setTimeout(() => {
            setLoadedColumns(allAvailableColumns);
            setLoadingMoreIds([]);
            setCanLoadMore(false);
          }, 2000);
          action('onLoadMore')(id);
        }}
        onReset={() => {
          setModalKey(uuidv4());
          action('onReset');
        }}
        onSave={(updatedOrdering, updatedColumns) => {
          setOrdering(updatedOrdering);
          setActiveColumns(updatedColumns);
          setShowModal(false);
          action('onSave')(updatedOrdering, updatedColumns);
        }}
        open={showModal || showColumnCustomizationModal}
        pinnedColumnId={demoPinnedColumn ? 'string' : undefined}
        primaryValue={primaryValue}
        secondaryValue={secondaryValue === 'NONE' ? undefined : secondaryValue}
      />
    </>
  );
};

Playground.storyName = 'Playground';
Playground.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithPredefinedWidthsAndResize = () => {
  const selectedTableType = select('Type of Table', ['Table', 'StatefulTable'], 'Table');
  const tableContainerWidth = select('Table container width', ['none', '300px', '800px'], 'none');

  const hasResize = boolean('Resizable columns (hasResize)', true);
  const preserveColumnWidths = boolean(
    'Preserve sibling column widths for resize/show/hide (preserveColumnWidths)',
    true
  );
  const useAutoTableLayoutForResize = boolean(
    'Use CSS table-layout "auto" instead of "fixed" (useAutoTableLayoutForResize)',
    false
  );
  const ordering = object('Ordering (view.table.ordering)', [
    { columnId: 'string' },
    { columnId: 'date' },
    { columnId: 'select' },
    { columnId: 'secretField' },
  ]);

  const columns = object('Columns definitions (columns)', [
    { id: 'string', name: 'String', width: '100px' },
    { id: 'date', name: 'Date', width: '250px' },
    { id: 'select', name: 'Select', width: '100px' },
    { id: 'secretField', name: 'Secret Information', width: '300px' },
  ]);

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  return (
    <div style={{ width: tableContainerWidth }}>
      <MyTable
        id="table"
        columns={columns}
        data={tableData.slice(0, 10)}
        options={{ hasResize, preserveColumnWidths, useAutoTableLayoutForResize }}
        view={{
          table: { ordering },
        }}
        actions={{
          table: {
            onColumnResize: action('onColumnResize'),
          },
        }}
      />
    </div>
  );
};

WithPredefinedWidthsAndResize.storyName = 'With predefined widths and resize';

export const WithColumnGrouping = () => {
  const selectedTableType = select('Type of Table', ['Table', 'StatefulTable'], 'Table');
  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  const ordering = object('Ordering (view.table.ordering)', [
    {
      columnId: 'string',
      columnGroupId: 'groupA',
    },
    {
      columnId: 'date',
      columnGroupId: 'groupA',
    },
    {
      columnId: 'select',
      columnGroupId: 'groupB',
    },
    {
      columnId: 'secretField',
      columnGroupId: 'groupB',
    },
  ]);

  return (
    <MyTable
      id="table"
      columns={tableColumns.slice(0, 4)}
      columnGroups={object('Column groups (columnGroups)', [
        {
          id: 'groupA',
          name: 'Group A',
        },
        {
          id: 'groupB',
          name: 'Group B',
        },
      ])}
      data={tableData.slice(0, 10)}
      view={{
        table: { ordering },
      }}
    />
  );
};

WithColumnGrouping.storyName = 'With column grouping';

export const TableLegacyColumnManagement = () => {
  const selectedTableType = select('Type of Table', ['Table', 'StatefulTable'], 'StatefulTable');
  const hasColumnSelection = boolean(
    'Enables legacy UI to show/hide/reorder columns (options.hasColumnSelection)',
    true
  );

  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;
  return (
    <MyTable
      id="table"
      columns={tableColumns}
      data={tableData.slice(0, 10)}
      options={{ hasColumnSelection }}
      actions={{
        toolbar: { onToggleColumnSelection: action('onToggleColumnSelection') },
        table: {
          onChangeOrdering: action('onChangeOrdering'),
        },
      }}
    />
  );
};

TableLegacyColumnManagement.storyName = 'With legacy column management';
