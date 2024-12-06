import React from 'react';
import { cloneDeep } from 'lodash-es';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { boolean, text, select, object } from '@storybook/addon-knobs';
import {
  Add as AddIcon,
  TrashCan,
  BeeBat,
  Activity,
  ViewOff,
  Error,
  DrillDown,
  Add,
  Edit,
} from '@carbon/react/icons';
import { ComboBox, DatePickerInput, NumberInput } from '@carbon/react';

import { Checkbox } from '../Checkbox';
import { TextInput } from '../TextInput';
import EmptyState from '../EmptyState';
import Dropdown from '../Dropdown/Dropdown';
import { EMPTY_STRING_DISPLAY_VALUE } from '../../constants/Filters';

import { PIN_COLUMN } from './tableUtilities';

const STATUS = {
  RUNNING: 'RUNNING',
  NOT_RUNNING: 'NOT_RUNNING',
  BROKEN: 'BROKEN',
};

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
const getLetter = (index) =>
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(index % 62);
const getWord = (index, step = 1) => words[(step * index) % words.length];
const getSentence = (index) =>
  `${getWord(index, 1)} ${getWord(index, 2)} ${getWord(index, 3)} ${index}`;
const getString = (index, length) =>
  Array(length)
    .fill(0)
    .map((i, idx) => getLetter(index * (idx + 14) * (idx + 1)))
    .join('');

const getStatus = (idx) => {
  const modStatus = idx % 3;
  switch (modStatus) {
    case 1:
      return STATUS.NOT_RUNNING;
    case 2:
      return STATUS.BROKEN;
    case 0:
    default:
      return STATUS.RUNNING;
  }
};

const getBoolean = (index) => {
  return index % 2 === 0;
};

export const getSelectTextWrappingOptions = () => [
  'always',
  'never',
  'auto',
  'alwaysTruncate',
  'expand',
];

export const getSelectDataOptions = () => [
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
  {
    id: 'option-D',
    text: 'option-D',
  },
  {
    id: 'option-E',
    text: 'option-E',
  },
  {
    id: 'option-F',
    text: 'option-F',
  },
];

const itemToString = (item) => (item ? item.text : '');

const getSelectDataOptionsWithEmptyOption = () => {
  const selectOptions = getSelectDataOptions();
  selectOptions.splice(2, 1, {
    id: '',
    text: EMPTY_STRING_DISPLAY_VALUE,
  });
  return selectOptions;
};

export const getTableActions = () => ({
  pagination: {
    /** Specify a callback for when the current page or page size is changed. This callback is passed an object parameter containing the current page and the current page size */
    onChangePage: action('onChangePage'),
  },
  toolbar: {
    onApplyFilter: action('onApplyFilter'),
    onToggleFilter: action('onToggleFilter'),
    onShowRowEdit: action('onShowRowEdit'),
    onToggleColumnSelection: action('onToggleColumnSelection'),
    /** Specify a callback for when the user clicks toolbar button to clear all filters. Recieves a parameter of the current filter values for each column */
    onClearAllFilters: action('onClearAllFilters'),
    onCancelBatchAction: action('onCancelBatchAction'),
    onApplyBatchAction: action('onApplyBatchAction'),
    onApplySearch: action('onApplySearch'),
    /** advanced filter actions */
    onCancelAdvancedFilter: action('onCancelAdvancedFilter'),
    onRemoveAdvancedFilter: action('onRemoveAdvancedFilter'),
    onCreateAdvancedFilter: action('onCreateAdvancedFilter'),
    onChangeAdvancedFilter: action('onChangeAdvancedFilter'),
    onApplyAdvancedFilter: action('onApplyAdvancedFilter'),
    onToggleAdvancedFilter: action('onToggleAdvancedFilter'),
    onToggleAggregations: action('onToggleAggregations'),
    // TODO: removed to mimic the current state of consumers in the wild
    // since they won't be adding this prop to any of their components
    // can be readded in V3.
    // onToggleAggregations: action('onToggleAggregations'),
    onApplyToolbarAction: action('onApplyToolbarAction'),
    onSearchExpand: action('onSearchExpand'),
  },
  table: {
    onRowClicked: action('onRowClicked'),
    onRowSelected: action('onRowSelected'),
    onSelectAll: action('onSelectAll'),
    onEmptyStateAction: action('onEmptyStateAction'),
    onErrorStateAction: action('onErrorStateAction'),
    onApplyRowAction: action('onApplyRowAction'),
    onRowExpanded: action('onRowExpanded'),
    onChangeOrdering: action('onChangeOrdering'),
    onColumnSelectionConfig: action('onColumnSelectionConfig'),
    onChangeSort: action('onChangeSort'),
    onColumnResize: action('onColumnResize'),
    onOverflowItemClicked: action('onOverflowItemClicked'),
    onSaveMultiSortColumns: action('onSaveMultiSortColumns'),
    onCancelMultiSortColumns: action('onCancelMultiSortColumns'),
    onAddMultiSortColumn: action('onAddMultiSortColumn'),
    onRemoveMultiSortColumn: action('onRemoveMultiSortColumn'),
    onFilterRowIconClick: action('onFilterRowIconClick'),
  },
});

export const renderStatusIcon = ({ value: status }) => {
  switch (status) {
    case STATUS.NOT_RUNNING:
      return (
        <svg height="10" width="10">
          <circle cx="5" cy="5" r="3" stroke="none" strokeWidth="1" fill="gray" />
        </svg>
      );
    case STATUS.BROKEN:
      return (
        <svg height="10" width="10">
          <circle cx="5" cy="5" r="3" stroke="none" strokeWidth="1" fill="red" />
        </svg>
      );

    case STATUS.RUNNING:
    default:
      return (
        <svg height="10" width="10">
          <circle cx="5" cy="5" r="3" stroke="none" strokeWidth="1" fill="green" />
        </svg>
      );
  }
};

// Example custom sort method for the status field.  Will sort the broken to the top, then the running, then the not_running
export const customColumnSort = ({ data, columnId, direction }) => {
  // clone inputData because sort mutates the array
  const sortedData = data.map((i) => i);
  sortedData.sort((a, b) => {
    let compare = -1;
    // same status
    if (a.values[columnId] === b.values[columnId]) {
      compare = 0;
    } else if (a.values[columnId] === STATUS.RUNNING && b.values[columnId] === STATUS.NOT_RUNNING) {
      compare = -1;
    } else if (a.values[columnId] === STATUS.NOT_RUNNING && b.values[columnId] === STATUS.RUNNING) {
      compare = 1;
    } else if (b.values[columnId] === STATUS.BROKEN) {
      compare = 1;
    } else if (a.values[columnId] === STATUS.BROKEN) {
      compare = -1;
    }

    return direction === 'ASC' ? compare : -compare;
  });
  return sortedData;
};

export const getTableColumns = () => [
  {
    id: 'string',
    name: 'String',
    filter: { placeholderText: 'enter a string' },
  },

  {
    id: 'date',
    name: 'Date',
    filter: {
      isDate: true,
      placeholderText: 'enter a date',
      dateOptions: {
        dateFormat: 'Y-m-d',
        locale: 'en',
      },
      filterFunction: (columnValue, filterValue) => {
        if (filterValue instanceof Date) {
          const date = new Date(filterValue).toISOString();
          return columnValue.split('T')[0] === date.split('T')[0];
        }
        return columnValue.includes(filterValue);
      },
    },
  },
  {
    id: 'select',
    name: 'Select',
    filter: { placeholderText: 'pick an option', options: getSelectDataOptions() },
  },
  {
    id: 'secretField',
    name: 'Secret Information',
  },
  {
    id: 'status',
    name: 'Status',
    renderDataFunction: renderStatusIcon,
    sortFunction: customColumnSort,
  },
  {
    id: 'number',
    name: 'Number',
    filter: { placeholderText: 'enter a number' },
  },
  {
    id: 'boolean',
    name: 'Boolean',
    filter: { placeholderText: 'true or false' },
  },
  {
    id: 'node',
    name: 'React Node',
  },
  {
    id: 'object',
    name: 'Object Id',
    renderDataFunction: ({ value }) => {
      return value?.id;
    },
    sortFunction: ({ data, columnId, direction }) => {
      // clone inputData because sort mutates the array
      const sortedData = data.map((i) => i);
      sortedData.sort((a, b) => {
        const aId = a.values[columnId].id;
        const bId = b.values[columnId].id;
        const compare = aId.localeCompare(bId);

        return direction === 'ASC' ? compare : -compare;
      });

      return sortedData;
    },
    filter: {
      placeholderText: 'Filter object values...',
      filterFunction: (columnValue, filterValue) => {
        return columnValue.id.includes(filterValue);
      },
    },
  },
];

export const getTableCustomColumns = () => [
  {
    id: 'string',
    name: 'String',
    filter: { placeholderText: 'enter a string' },
  },

  {
    id: 'date',
    name: 'Date',
    filter: {
      customInput: ({ onChange, value }) => (
        <DatePickerInput placeholder="enter a data" value={value} onChange={onChange} />
      ),
    },
  },
  {
    id: 'select',
    name: 'Select',
    filter: {
      customInput: ({ value, onChange }) => (
        <ComboBox
          placeholder="Filter col"
          value={value}
          itemToString={itemToString}
          items={getSelectDataOptions()}
          onChange={onChange}
        />
      ),
    },
  },
  {
    id: 'secretField',
    name: 'Secret Information',
    filter: {
      customInput: ({ value, onChange, id }) => (
        <TextInput placeholder="Filter col" value={value} id={id} onChange={onChange} />
      ),
    },
  },
  {
    id: 'status',
    name: 'Status',
    renderDataFunction: renderStatusIcon,
    sortFunction: customColumnSort,
  },
  {
    id: 'number',
    name: 'Number',
    filter: {
      customInput: ({ value, onChange }) => (
        <NumberInput
          placeholder="enter a number"
          step={1}
          allowEmpty
          onChange={onChange}
          value={value}
        />
      ),
    },
  },
  {
    id: 'boolean',
    name: 'Boolean',
  },
  {
    id: 'node',
    name: 'React Node',
  },
  {
    id: 'object',
    name: 'Object Id',
    renderDataFunction: ({ value }) => {
      return value?.id;
    },
    sortFunction: ({ data, columnId, direction }) => {
      // clone inputData because sort mutates the array
      const sortedData = data.map((i) => i);
      sortedData.sort((a, b) => {
        const aId = a.values[columnId].id;
        const bId = b.values[columnId].id;
        const compare = aId.localeCompare(bId);

        return direction === 'ASC' ? compare : -compare;
      });

      return sortedData;
    },
  },
];

export const getTableToolbarActions = () => [
  {
    id: 'edit',
    labelText: 'Edit',
    renderIcon: 'edit',
    disabled: true,
    isOverflow: true,
  },
  {
    id: 'long',
    labelText: 'A really long text that should be truncated',
    disabled: false,
    isOverflow: true,
  },
  {
    id: 'long-icon',
    labelText: 'A really long text that should be truncated with an icon',
    renderIcon: () => <BeeBat />,
    disabled: false,
    isOverflow: true,
  },
  {
    id: 'delete',
    labelText: 'Delete',
    isDelete: true,
    hasDivider: true,
    isOverflow: true,
    renderIcon: TrashCan,
  },
  {
    id: 'hidden',
    labelText: 'Hidden',
    hidden: true,
    isOverflow: true,
  },
  {
    id: 'toggle',
    labelText: 'Toggle something',
    renderIcon: () => <ViewOff />,
    isActive: true,
  },
];

export const getNewRow = (idx, suffix = '', withActions = false) => ({
  id: `row-${idx}${suffix ? `_${suffix}` : ''}`,
  values: {
    string: getSentence(idx) + suffix,
    date: new Date(100000000000 + 1000000000 * idx * idx).toISOString().split('T')[0],
    select: getSelectDataOptions()[idx % 3].id,
    secretField: getString(idx, 10) + suffix,
    number: idx % 3 === 0 ? null : idx * idx,
    status: getStatus(idx),
    boolean: getBoolean(idx),
    node: <AddIcon size={20} />,
    object: { id: getString(idx, 5) },
  },
  isDraggable: true,
  rowActions: withActions
    ? [
        {
          id: 'drilldown',
          renderIcon: <DrillDown size={16} />,
          iconDescription: 'Drill in',
          labelText: 'Drill in',
        },
        {
          id: 'Add',
          renderIcon: <Add size={16} />,
          iconDescription: 'Add',
          labelText: 'Add',
          isOverflow: true,
        },
      ]
    : undefined,
});

export const getTableData = () =>
  Array(100)
    .fill(0)
    .map((i, idx) => getNewRow(idx));

export const getTableDataWithEmptySelectFilter = () =>
  Array(100)
    .fill(0)
    .map((i, idx) => {
      const row = getNewRow(idx);
      return {
        ...row,
        values: {
          ...row.values,
          select: getSelectDataOptionsWithEmptyOption()[idx % 3].id,
        },
      };
    });

export const getDrillDownRowAction = () => ({
  id: 'drilldown',
  renderIcon: DrillDown,
  iconDescription: 'Drill in',
  labelText: 'Drill in to find out more after observing',
});

export const getOverflowEditRowAction = () => ({
  id: 'edit',
  renderIcon: Edit,
  labelText: 'Edit',
  isOverflow: true,
  iconDescription: 'Edit',
  isEdit: true,
  disabled: true,
});

export const getOverflowAddRowAction = () => ({
  id: 'Add',
  renderIcon: Add,
  iconDescription: 'Add',
  labelText: 'Add',
  isOverflow: true,
  hasDivider: true,
});

export const getOverflowDeleteRowAction = () => ({
  id: 'delete',
  renderIcon: TrashCan,
  labelText: 'Delete',
  isOverflow: true,
  iconDescription: 'Delete',
  isDelete: true,
});

export const getOverflowTextOnlyRowAction = () => ({
  id: 'textOnly',
  labelText: 'Text only sample action',
  isOverflow: true,
});

export const getHiddenRowAction = () => ({
  id: 'hidden',
  labelText: 'Hidden',
  isOverflow: false,
  hidden: true,
});

export const getHiddenOverflowRowAction = () => ({
  id: 'hiddenOverflow',
  labelText: 'Hidden overflow',
  isOverflow: true,
  hidden: true,
});

export const getRowActions = (index) =>
  [
    index % 4 !== 0 ? getDrillDownRowAction() : null,
    getOverflowEditRowAction(),
    getHiddenRowAction(),
    getHiddenOverflowRowAction(),
    getOverflowAddRowAction(),
    getOverflowDeleteRowAction(),
    getOverflowTextOnlyRowAction(),
  ].filter((i) => i);
export const addRowAction = (row, hasSingleRowEdit, index) => ({
  ...row,
  rowActions: getRowActions(index).map((rowAction) =>
    rowAction.id === 'edit' && hasSingleRowEdit
      ? {
          ...rowAction,
          disabled: false,
        }
      : rowAction
  ),
});

export const addChildRows = (row, idx, demoDeepNesting = true) => ({
  ...row,
  children:
    idx % 4 !== 0
      ? [getNewRow(idx, 'A', true), getNewRow(idx, 'B', true)]
      : demoDeepNesting && idx === 4
      ? [
          getNewRow(idx, 'A', true),
          {
            ...getNewRow(idx, 'B'),
            children: [
              getNewRow(idx, 'B-1', true),
              {
                ...getNewRow(idx, 'B-2'),
                children: [getNewRow(idx, 'B-2-A', true), getNewRow(idx, 'B-2-B', true)],
              },
              getNewRow(idx, 'B-3', true),
            ],
          },
          getNewRow(idx, 'C', true),
          {
            ...getNewRow(idx, 'D', true),
            children: [
              getNewRow(idx, 'D-1', true),
              getNewRow(idx, 'D-2', true),
              getNewRow(idx, 'D-3', true),
            ],
          },
        ]
      : undefined,
});

export const addMoreChildRowsToParent = (data, parentId) => {
  const clonedData = cloneDeep(data);
  const parentRowIndex = clonedData.findIndex((row) => row.id === parentId);
  const parentRow = clonedData[parentRowIndex];
  const suffix = parentRow.children.length;
  parentRow.children.push(getNewRow(parentRowIndex, `${suffix}`, false));
  parentRow.children.push(getNewRow(parentRowIndex, `${suffix + 1}`, false));
  parentRow.children.push(getNewRow(parentRowIndex, `${suffix + 2}`, false));
  parentRow.children.push(getNewRow(parentRowIndex, `${suffix + 3}`, false));
  return clonedData;
};

export const getExpandedData = (data) =>
  data.map((row) => ({
    rowId: row.id,
    content: <div style={{ marginLeft: '64px' }}>Expanded demo content {row.id}</div>,
  }));

export const getDefaultOrdering = (tableColumns) =>
  tableColumns.map(({ id }) => ({
    columnId: id,
    isHidden: id === 'secretField',
  }));

export const getRowActionStates = () => [
  {
    rowId: 'row-4',
    isRunning: true,
  },
  {
    rowId: 'row-5',
    error: {
      title: 'Import failed',
      message: 'Contact your administrator',
    },
  },
];

export const getBatchActions = () => {
  return [
    {
      id: 'delete',
      labelText: 'Delete',
      renderIcon: TrashCan,
      iconDescription: 'Delete Item',
    },
    {
      id: 'createActivity',
      labelText: 'Create activity',
      renderIcon: Activity,
      iconDescription: 'Create activity from item',
    },
    {
      id: 'process',
      labelText: 'Process',
    },
    {
      id: 'hidden-not-overflow',
      labelText: 'Hidden',
      hidden: true,
    },
    {
      id: 'reject',
      labelText: 'Reject',
      renderIcon: Error,
      iconDescription: 'Reject these items',
      isOverflow: true,
    },
    {
      id: 'reassign',
      labelText: 'Reassign',
      iconDescription: 'Reassign these items to another person',
      isOverflow: true,
      hasDivider: true,
      disabled: true,
    },
    {
      id: 'hidden',
      labelText: 'Hide these items',
      iconDescription: 'This action is hidden in the overflow menu',
      isOverflow: true,
      hasDivider: true,
      hidden: true,
    },
    {
      id: 'expunge',
      labelText: 'Expunge these records',
      iconDescription: 'Expunge these records from the database',
      renderIcon: TrashCan,
      isOverflow: true,
      hasDivider: true,
      isDelete: true,
    },
  ];
};

export const getCustomToolbarContentElement = () => (
  <div
    key="custom-content-1"
    className=".bx--type-light"
    style={{ alignItems: 'center', display: 'flex', padding: '0 1rem' }}
  >
    Custom content
  </div>
);

const revertSubstituteReactElements = (data, substitutions) => {
  return data.map((obj, index) => {
    const objCopy = { ...obj };

    if (substitutions[index]) {
      const [key, originalValue] = substitutions[index];
      // Add back original value unless it has been deleted
      objCopy[key] = objCopy.hasOwnProperty(key) ? originalValue : undefined;
    }
    return objCopy;
  });
};

const substituteReactElements = (data, msg) => {
  const substitutions = [];
  const modifiedData = data.map((originalObj, index) => {
    const objCopy = { ...originalObj };
    Object.entries(originalObj).forEach(([key, value]) => {
      if (value.render) {
        objCopy[key] = `${value.render.name} (${msg})`;
        substitutions[index] = [key, value];
      } else if (typeof value === 'function') {
        const returnValRenderName = value()?.type?.render?.name || '';
        objCopy[key] = `${returnValRenderName} (${msg})`;
        substitutions[index] = [key, value];
      }
    });
    return objCopy;
  });
  return {
    modifiedData,
    revert: (dataToRevert) => revertSubstituteReactElements(dataToRevert, substitutions),
  };
};

/**
 * Drop in replacement for knob 'object' with the added possibility to substitute
 * react elements like icons with strings. Uses the render.name as substitute.
 * @param {*} name
 * @param {*} value
 * @param {*} groupId
 * @param {*} msg Message to be appended to substituted text
 * @returns
 */
export const objectWithSubstitution = (
  name,
  value,
  groupId,
  msg = 'icon substituted with text - no edit'
) => {
  const { modifiedData, revert } = substituteReactElements(value, msg);
  const knobData = object(name, modifiedData, groupId);
  return revert(knobData);
};

const convertUTCDateToLocalDate = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};
// eslint-disable-next-line react/prop-types
export const getEditDataFunction =
  (onDataChange) =>
  // eslint-disable-next-line react/prop-types
  ({ value, columnId, rowId }) => {
    const elementId = `${columnId}-${rowId}`;

    return columnId === 'node' ? (
      value
    ) : columnId === 'date' ? (
      <TextInput
        id={elementId}
        onChange={(e) => {
          const dateCleared = e.currentTarget.value === '';
          const newVal = dateCleared
            ? value
            : new Date(e.currentTarget.value).toISOString().split('T')[0];
          onDataChange(newVal, columnId, rowId);
        }}
        type="date"
        light
        defaultValue={convertUTCDateToLocalDate(new Date(value))}
        labelText=""
        hideLabel
      />
    ) : columnId === 'select' ? (
      <Dropdown
        id={elementId}
        light
        items={getSelectDataOptions()}
        initialSelectedItem={value}
        onChange={({ selectedItem: { id } }) => onDataChange(id, columnId, rowId)}
        label=""
      />
    ) : columnId === 'boolean' ? (
      <Checkbox
        defaultChecked={value}
        id={elementId}
        labelText=""
        hideLabel
        onChange={(e) => onDataChange(e, columnId, rowId)}
      />
    ) : columnId === 'object' ? (
      <TextInput
        id={elementId}
        onChange={(e) => onDataChange({ ...value, id: e.currentTarget.value }, columnId, rowId)}
        type="text"
        light
        // eslint-disable-next-line react/prop-types
        defaultValue={value.id}
        labelText=""
        hideLabel
      />
    ) : columnId === 'number' ? (
      <TextInput
        id={elementId}
        onChange={(e) => onDataChange(e.currentTarget.value, columnId, rowId)}
        type="number"
        light
        defaultValue={value}
        labelText=""
        hideLabel
      />
    ) : (
      <TextInput
        id={elementId}
        onChange={(e) => onDataChange(e.currentTarget.value, columnId, rowId)}
        type="text"
        light
        defaultValue={value}
        labelText=""
        hideLabel
      />
    );
  };

export const addColumnGroupIds = (col, index) => {
  return index === 1 || index === 2
    ? { ...col, columnGroupId: 'groupA' }
    : index === 5 || index === 6 || index === 7
    ? { ...col, columnGroupId: 'groupB' }
    : col;
};

export const getAdvancedFilters = () => [
  {
    filterId: 'story-filter',
    /** Text for main tilte of page */
    filterTitleText: 'date CONTAINS 19, boolean=true',
    /** Text for metadata for the filter */
    filterMetaText: `last updated: 2021-03-11 15:34:01`,
    /** tags associated with particular filter */
    filterTags: ['fav', 'other-tag'],
    /** users that have access to particular filter */
    filterAccess: [
      {
        username: 'Example-User',
        email: 'example@pal.com',
        name: 'Example User',
        access: 'edit',
      },
      {
        username: 'Other-User',
        email: 'other@pal.com',
        name: 'Other User',
        access: 'read',
      },
    ],
    /** All possible users that can be granted access */
    filterUsers: [
      {
        id: 'teams',
        name: 'Teams',
        groups: [
          {
            id: 'team-a',
            name: 'Team A',
            users: [
              {
                username: '@tpeck',
                email: 'tpeck@pal.com',
                name: 'Templeton Peck',
              },
              {
                username: '@jsmith',
                email: 'jsmith@pal.com',
                name: 'John Smith',
              },
            ],
          },
        ],
      },
      {
        username: 'Example-User',
        email: 'example@pal.com',
        name: 'Example User',
      },
      {
        username: 'Test-User',
        email: 'test@pal.com',
        name: 'Test User',
      },
      {
        username: 'Other-User',
        email: 'other@pal.com',
        name: 'Other User',
      },
    ],
    /**
     * the rules passed into the component. The RuleBuilder is a controlled component, so
     * this works the same as passing defaultValue to a controlled input component.
     */
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
    filterColumns: getTableColumns(),
  },
  {
    filterId: 'next-filter',
    /** Text for main tilte of page */
    filterTitleText: 'select=Option c, boolean=false',
    /** Text for metadata for the filter */
    filterMetaText: `last updated: 2021-03-11 15:34:01`,
    /** tags associated with particular filter */
    filterTags: ['fav', 'other-tag'],
    /** users that have access to particular filter */
    filterAccess: [
      {
        username: 'Example-User',
        email: 'example@pal.com',
        name: 'Example User',
        access: 'edit',
      },
      {
        username: 'Other-User',
        email: 'other@pal.com',
        name: 'Other User',
        access: 'read',
      },
    ],
    /** All possible users that can be granted access */
    filterUsers: [
      {
        id: 'teams',
        name: 'Teams',
        groups: [
          {
            id: 'team-a',
            name: 'Team A',
            users: [
              {
                username: '@tpeck',
                email: 'tpeck@pal.com',
                name: 'Templeton Peck',
              },
              {
                username: '@jsmith',
                email: 'jsmith@pal.com',
                name: 'John Smith',
              },
            ],
          },
        ],
      },
      {
        username: 'Example-User',
        email: 'example@pal.com',
        name: 'Example User',
      },
      {
        username: 'Test-User',
        email: 'test@pal.com',
        name: 'Test User',
      },
      {
        username: 'Other-User',
        email: 'other@pal.com',
        name: 'Other User',
      },
    ],
    /**
     * the rules passed into the component. The RuleBuilder is a controlled component, so
     * this works the same as passing defaultValue to a controlled input component.
     */
    filterRules: {
      id: '14p5ho3pcu',
      groupLogic: 'ALL',
      rules: [
        {
          id: 'rsiru4rjba',
          columnId: 'select',
          operand: 'EQ',
          value: 'option-C',
        },
        {
          id: '34bvyub9jq',
          columnId: 'boolean',
          operand: 'EQ',
          value: 'false',
        },
      ],
    },
    filterColumns: getTableColumns(),
  },
];

export const getMoreAdvancedFilters = () => [
  {
    filterId: 'story-filter1',
    /** Text for main tilte of page */
    filterTitleText:
      'string CONTAINS toyota Some really long text to enable overflow menu to display Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac leo augue. Vivamus id orci arcu.',
    /**
     * the rules passed into the component. The RuleBuilder is a controlled component, so
     * this works the same as passing defaultValue to a controlled input component.
     */
    filterRules: {
      id: 'kmnhf092gub',
      groupLogic: 'ALL',
      rules: [
        {
          id: 'asdadguen87',
          columnId: 'string',
          operand: 'CONTAINS',
          value: 'toyota',
        },
      ],
    },
    filterColumns: getTableColumns(),
  },
  {
    filterId: 'story-filter2',
    /** Text for main tilte of page */
    filterTitleText: 'select=option-A',
    /**
     * the rules passed into the component. The RuleBuilder is a controlled component, so
     * this works the same as passing defaultValue to a controlled input component.
     */
    filterRules: {
      id: '9jf87klobuf',
      groupLogic: 'ALL',
      rules: [
        {
          id: 'iijn109fmwhd',
          columnId: 'select',
          operand: 'CONTAINS',
          value: 'option-A',
        },
      ],
    },
    filterColumns: getTableColumns(),
  },
];

const getParsedIntOrUndefined = (value) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const getCustomEmptyState = () => (
  <EmptyState
    icon="not-authorized"
    title="Custom empty state"
    body="This is an custom empty state with custom icon, texts and action button"
    action={{
      label: 'Fix this',
      onClick: action('onErrorStateAction'),
      kind: 'ghost',
    }}
  />
);

export const getCustomErrorState = () => (
  <EmptyState
    icon="error404"
    title="Custom error state"
    body="Custom Error State message with custom icon, texts and action button"
    action={{
      label: 'Reload',
      onClick: action('onErrorStateAction'),
      kind: 'ghost',
    }}
  />
);
/**
 * Helper function that generate the Table knobs.
 *
 * If param knobsToCreate is unspecified then all knobs will be created, otherwise only the
 * knobs whose names are in the array. This conditional creation is needed since StoryBook
 * will show a knob as soon as it is created by a story, regardless of whether it is
 * placed in a local variable or not.
 */
export const getTableKnobs = ({ knobsToCreate, getDefaultValue, useGroups = false }) => {
  const TABLE_GROUP = useGroups ? 'Table general' : undefined;
  const TITLE_TOOLBAR_GROUP = useGroups ? 'Toolbar' : undefined;
  const ROW_RENDER_GROUP = useGroups ? 'Data rendering' : undefined;
  const ROW_EDIT_GROUP = useGroups ? 'Data editing' : undefined;
  const SORT_FILTER_GROUP = useGroups ? 'Sort & filter' : undefined;
  const SEARCH_GROUP = useGroups ? 'Search' : undefined;
  const COLUMN_GROUP = useGroups ? 'Column configuration' : undefined;
  const AGGREGATION_GROUP = useGroups ? 'Aggregations' : undefined;
  const PAGINATION_GROUP = useGroups ? 'Pagination' : undefined;
  const NESTING_EXPANSION_GROUP = useGroups ? 'Nesting & expansion' : undefined;
  const SELECTIONS_ACTIONS_GROUP = useGroups ? 'Selections & actions' : undefined;
  const STATES_GROUP = useGroups ? 'Main view states' : undefined;
  const DND_GROUP = useGroups ? 'Drag & drop' : undefined;
  const shouldCreate = (name) => !knobsToCreate || knobsToCreate.includes(name);

  return {
    selectedTableType: shouldCreate('selectedTableType')
      ? select(
          'Type of Table',
          ['Table', 'StatefulTable'],
          (() => {
            const tableType = getDefaultValue('selectedTableType');
            return typeof tableType === 'string' ? tableType : 'StatefulTable';
          })(),
          TABLE_GROUP
        )
      : null,

    tableMaxWidth: shouldCreate('tableMaxWidth')
      ? select('Demo table max-width', ['300px', '600px', '900px', 'none'], 'none', TABLE_GROUP)
      : null,
    size: shouldCreate('size')
      ? select('Row height (size)', ['xs', 'sm', 'md', 'lg', 'xl'], 'lg', TABLE_GROUP)
      : null,
    numberOfRows: shouldCreate('numberOfRows')
      ? select('Demo number of rows in data', [100, 50, 20, 5, 0], 100, TABLE_GROUP)
      : null,
    emptyStateIcon: shouldCreate('emptyStateIcon')
      ? select(
          'Demo empty Table Icon',
          ['error', 'error404', 'empty', 'not-authorized', 'no-result', 'success'],
          'no-result',
          TABLE_GROUP
        )
      : null,
    hasUserViewManagement: shouldCreate('hasUserViewManagement')
      ? boolean(
          'Enables table to handle creating/saving/loading of user views (options.hasUserViewManagement)',
          getDefaultValue('hasUserViewManagement'),
          TABLE_GROUP
        )
      : null,
    pinHeaderAndFooter: shouldCreate('pinHeaderAndFooter')
      ? boolean(
          'Pin header and footer (options.pinHeaderAndFooter)',
          getDefaultValue('pinHeaderAndFooter'),
          TABLE_GROUP
        )
      : null,

    // TITLE_TOOLBAR_GROUP
    secondaryTitle: shouldCreate('secondaryTitle')
      ? text(
          'Title shown in toolbar (secondaryTitle)',
          getDefaultValue('secondaryTitle'),
          TITLE_TOOLBAR_GROUP
        )
      : null,
    tableTooltipText: shouldCreate('tableTooltipText')
      ? text(
          'Table title toltip (tooltip)',
          getDefaultValue('tableTooltipText') ? 'I must be wrapped in a react node' : '',
          TITLE_TOOLBAR_GROUP
        )
      : null,
    stickyHeader: shouldCreate('stickyHeader')
      ? boolean(
          'Sticky header (stickyHeader) ☢️',
          getDefaultValue('stickyHeader'),
          TITLE_TOOLBAR_GROUP
        )
      : null,
    demoToolbarActions: shouldCreate('demoToolbarActions')
      ? boolean(
          'Demo toolbar actions (view.toolbar.toolbarActions)',
          getDefaultValue('demoToolbarActions'),
          TITLE_TOOLBAR_GROUP
        )
      : null,
    demoCustomToolbarContent: shouldCreate('demoCustomToolbarContent')
      ? boolean(
          'Demo custom toolbar content (view.toolbar.customToolbarContent)',
          getDefaultValue('demoCustomToolbarContent'),
          TITLE_TOOLBAR_GROUP
        )
      : null,
    toolbarIsDisabled: shouldCreate('toolbarIsDisabled')
      ? boolean(
          'Disable the table toolbar (view.toolbar.isDisabled)',
          getDefaultValue('toolbarIsDisabled'),
          TITLE_TOOLBAR_GROUP
        )
      : null,
    demoDownloadCSV: shouldCreate('demoDownloadCSV')
      ? boolean(
          'Demo download data as CSV',
          getDefaultValue('demoDownloadCSV'),
          TITLE_TOOLBAR_GROUP
        )
      : null,

    // SORT_FILTER_GROUP
    demoSingleSort: shouldCreate('demoSingleSort')
      ? boolean(
          'Enable sort on single dimension (columns[i].isSortable)',
          getDefaultValue('demoSingleSort'),
          SORT_FILTER_GROUP
        )
      : null,
    hasMultiSort: shouldCreate('hasMultiSort')
      ? boolean(
          'Enable sort on multiple dimensions (options.hasMultiSort)',
          getDefaultValue('hasMultiSort'),
          SORT_FILTER_GROUP
        )
      : null,
    hasFilter: shouldCreate('hasFilter')
      ? select(
          'Enable simple filtering by column value (options.hasFilter)',
          ['onKeyPress', 'onEnterAndBlur', true, false],
          getDefaultValue('hasFilter'),
          SORT_FILTER_GROUP
        )
      : null,
    hasAdvancedFilter: shouldCreate('hasAdvancedFilter')
      ? boolean(
          'Enable advanced filters (options.hasAdvancedFilter) ☢️',
          getDefaultValue('hasAdvancedFilter'),
          SORT_FILTER_GROUP
        )
      : null,
    hideClearAllFiltersButton: shouldCreate('hideClearAllFiltersButton')
      ? boolean(
          'Hide clear all filters button (view.toolbar.hideClearAllFiltersButton)',
          getDefaultValue('hideClearAllFiltersButton'),
          SORT_FILTER_GROUP
        )
      : null,
    hasEmptyFilterOption: shouldCreate('hasEmptyFilterOption')
      ? boolean(
          'Show empty string option in Select filter',
          getDefaultValue('hasEmptyFilterOption'),
          SORT_FILTER_GROUP
        )
      : null,
    hasMultiSelectFilter: shouldCreate('hasMultiSelectFilter')
      ? boolean(
          'Allow multi-select in Select filter',
          getDefaultValue('hasMultiSelectFilter'),
          SORT_FILTER_GROUP
        )
      : null,
    hasFilterRowIcon: shouldCreate('hasFilterRowIcon')
      ? boolean(
          'Display icon button in filter row',
          getDefaultValue('hasFilterRowIcon'),
          SORT_FILTER_GROUP
        )
      : null,

    // SEARCH_GROUP
    hasSearch: shouldCreate('hasSearch')
      ? boolean(
          'Enable searching on the table values (options.hasSearch)',
          getDefaultValue('hasSearch'),
          SEARCH_GROUP
        )
      : null,
    hasFastSearch: shouldCreate('hasFastSearch')
      ? boolean(
          'Trigger search while typing (options.hasFastSearch)',
          getDefaultValue('hasFastSearch'),
          SEARCH_GROUP
        )
      : null,
    searchFieldDefaultExpanded: shouldCreate('searchFieldDefaultExpanded')
      ? boolean(
          'Expand search field by default on initialization (view.toolbar.search.defaultExpanded)',
          getDefaultValue('searchFieldDefaultExpanded'),
          SEARCH_GROUP
        )
      : null,
    searchIsExpanded: shouldCreate('searchIsExpanded')
      ? boolean(
          'Force the toolbar search field to always be expanded (view.toolbar.search.isExpanded)',
          false,
          SEARCH_GROUP
        )
      : null,

    // AGGREGATION_GROUP
    hasAggregations: shouldCreate('hasAggregations')
      ? boolean(
          'Aggregate column values in footer (options.hasAggregations)',
          getDefaultValue('hasAggregations'),
          AGGREGATION_GROUP
        )
      : null,
    aggregationLabel: shouldCreate('aggregationLabel')
      ? text('Aggregation label (view.aggregations.label)', 'Total', AGGREGATION_GROUP)
      : null,
    aggregationsColumns: shouldCreate('aggregationsColumns')
      ? object(
          'Aggregations columns settings',
          [
            {
              id: 'number',
              align: 'start',
              isSortable: false,
            },
            {
              id: 'object',
              isSortable: false,
              value: '5',
            },
          ],
          AGGREGATION_GROUP
        )
      : null,

    // PAGINATION_GROUP
    hasPagination: shouldCreate('hasPagination')
      ? boolean(
          'Enable pagination (options.hasPagination)',
          getDefaultValue('hasPagination'),
          PAGINATION_GROUP
        )
      : null,
    pageSizes: shouldCreate('pageSizes')
      ? object(
          'Selectable page sizes (view.pagination.pageSizes)',
          [10, 20, 30, 50],
          PAGINATION_GROUP
        )
      : null,
    maxPages: shouldCreate('maxPages')
      ? getParsedIntOrUndefined(
          // use text knob and string instead of number since number() does not work with knob groups
          text(
            'Upper limit for number of pages (view.pagination.maxPages)',
            undefined,
            PAGINATION_GROUP
          ),
          10
        )
      : null,
    isItemPerPageHidden: shouldCreate('isItemPerPageHidden')
      ? boolean(
          'Hide items per page selection (options.pagination.isItemPerPageHidden)',
          getDefaultValue('isItemPerPageHidden'),
          PAGINATION_GROUP
        )
      : null,
    paginationSize: shouldCreate('paginationSize')
      ? select(
          'Size of pagination buttons (options.pagination.size)',
          ['sm', 'md', 'lg'],
          'lg',
          PAGINATION_GROUP
        )
      : null,
    hasOnlyPageData: shouldCreate('hasOnlyPageData')
      ? boolean(
          'Data prop only represents the currently visible page (options.hasOnlyPageData)',
          getDefaultValue('hasOnlyPageData'),
          PAGINATION_GROUP
        )
      : null,

    // COLUMN_GROUP
    demoInitialColumnSizes: shouldCreate('demoInitialColumnSizes')
      ? boolean(
          'Demo initial columns sizes',
          getDefaultValue('demoInitialColumnSizes'),
          COLUMN_GROUP
        )
      : null,
    hasResize: shouldCreate('hasResize')
      ? boolean(
          'Enable resizing of column widths (options.hasResize)',
          getDefaultValue('hasResize'),
          COLUMN_GROUP
        )
      : null,
    preserveColumnWidths: shouldCreate('preserveColumnWidths')
      ? boolean(
          'Preserve sibling widths on column resize/show/hide (options.preserveColumnWidths)',
          getDefaultValue('preserveColumnWidths'),
          COLUMN_GROUP
        )
      : null,
    useAutoTableLayoutForResize: shouldCreate('useAutoTableLayoutForResize')
      ? boolean(
          'Use CSS table-layout:auto (options.useAutoTableLayoutForResize)',
          getDefaultValue('useAutoTableLayoutForResize'),
          COLUMN_GROUP
        )
      : null,
    demoColumnTooltips: shouldCreate('demoColumnTooltips')
      ? boolean('Demo column tooltips', getDefaultValue('demoColumnTooltips'), COLUMN_GROUP)
      : null,
    demoColumnGroupAssignments: shouldCreate('demoColumnGroupAssignments')
      ? boolean(
          'Demo assigning columns to groups',
          getDefaultValue('demoColumnGroupAssignments'),
          COLUMN_GROUP
        )
      : null,
    columnGroups: shouldCreate('columnGroups')
      ? object(
          'Column groups definition (columnGroups)',
          [
            {
              id: 'groupA',
              name: 'Group A that has a very long name that should be truncated',
            },
            { id: 'groupB', name: 'Group B' },
          ],
          COLUMN_GROUP
        )
      : null,

    hasColumnSelection: shouldCreate('hasColumnSelection')
      ? boolean(
          'Enable legacy column management (options.hasColumnSelection)',
          getDefaultValue('hasColumnSelection'),
          COLUMN_GROUP
        )
      : null,
    hasColumnSelectionConfig: shouldCreate('hasColumnSelectionConfig')
      ? boolean(
          'Show config button in legacy column management (options.hasColumnSelectionConfig)',
          getDefaultValue('hasColumnSelectionConfig'),
          COLUMN_GROUP
        )
      : null,
    demoColumnOverflowMenuItems: shouldCreate('demoColumnOverflowMenuItems')
      ? boolean(
          'Demo column overflow menu (columns[i].overflowMenuItems)',
          getDefaultValue('demoColumnOverflowMenuItems'),
          COLUMN_GROUP
        )
      : null,
    pinColumn: shouldCreate('pinColumn')
      ? select(
          'Column position to pin (options.pinColumn)',
          Object.values(PIN_COLUMN),
          getDefaultValue('pinColumn') ? PIN_COLUMN.FIRST : PIN_COLUMN.NONE,
          COLUMN_GROUP
        )
      : null,

    // SELECTIONS_ACTIONS_GROUP
    hasRowSelection: shouldCreate('hasRowSelection')
      ? select(
          'Enable row selection type (options.hasRowSelection)',
          ['multi', 'single', false],
          getDefaultValue('hasRowSelection') ? 'multi' : false.valueOf,
          SELECTIONS_ACTIONS_GROUP
        )
      : null,
    useRadioButtonSingleSelect: shouldCreate('useRadioButtonSingleSelect')
      ? boolean(
          'Use radio button for single select (options.useRadioButtonSingleSelect)',
          getDefaultValue('useRadioButtonSingleSelect'),
          SELECTIONS_ACTIONS_GROUP
        )
      : null,
    selectedIds: shouldCreate('selectedIds')
      ? object(
          'Batch actions for selected rows (view.table.selectedIds)',
          [],
          SELECTIONS_ACTIONS_GROUP
        )
      : null,
    selectionCheckboxEnabled: shouldCreate('selectionCheckboxEnabled')
      ? boolean(
          'Demo row as selectable (data[i].isSelectable)',
          getDefaultValue('selectionCheckboxEnabled'),
          SELECTIONS_ACTIONS_GROUP
        )
      : null,
    batchActions: shouldCreate('batchActions')
      ? objectWithSubstitution(
          'Batch actions for selected rows (view.toolbar.batchActions)',
          getBatchActions(),
          SELECTIONS_ACTIONS_GROUP
        )
      : null,
    hasRowActions: shouldCreate('hasRowActions')
      ? boolean(
          'Demo inline actions (options.hasRowActions)',
          getDefaultValue('hasRowActions'),
          SELECTIONS_ACTIONS_GROUP
        )
      : null,

    // NESTING_EXPANSION_GROUP
    hasRowExpansion: shouldCreate('hasRowExpansion')
      ? select(
          'Demo rows with additional expandable content (options.hasRowExpansion)',
          {
            true: true,
            false: false,
            '{ expandRowsExclusively: true }': { expandRowsExclusively: true },
          },
          getDefaultValue('hasRowExpansion'),
          NESTING_EXPANSION_GROUP
        )
      : null,
    hasRowNesting: shouldCreate('hasRowNesting')
      ? select(
          'Demo nested rows (options.hasRowNesting)',
          {
            true: true,
            false: false,
            '{ hasSingleNestedHierarchy: true }': { hasSingleNestedHierarchy: true },
          },
          getDefaultValue('hasRowNesting'),
          NESTING_EXPANSION_GROUP
        )
      : null,
    expandedIds: shouldCreate('expandedIds')
      ? object('Expanded ids (view.table.expandedIds)', [], NESTING_EXPANSION_GROUP)
      : null,
    shouldExpandOnRowClick: shouldCreate('shouldExpandOnRowClick')
      ? boolean(
          'Expand row on click (options.shouldExpandOnRowClick)',
          getDefaultValue('shouldExpandOnRowClick'),
          NESTING_EXPANSION_GROUP
        )
      : null,
    demoHasLoadMore: shouldCreate('demoHasLoadMore')
      ? boolean(
          'Demo load more child rows (data[i].hasLoadMore)',
          getDefaultValue('demoHasLoadMore'),
          NESTING_EXPANSION_GROUP
        )
      : null,

    // ROW_RENDER_GROUP
    shouldLazyRender: shouldCreate('shouldLazyRender')
      ? boolean(
          'Enable only loading table rows as they become visible (options.shouldLazyRender)',
          getDefaultValue('shouldLazyRender'),
          ROW_RENDER_GROUP
        )
      : null,
    useZebraStyles: shouldCreate('useZebraStyles')
      ? boolean(
          'Alternate colors in table rows (useZebraStyles)',
          getDefaultValue('useZebraStyles'),
          ROW_RENDER_GROUP
        )
      : null,
    wrapCellText: shouldCreate('wrapCellText')
      ? select(
          'Cell text overflow strategy (options.wrapCellText)',
          getSelectTextWrappingOptions(),
          'always',
          ROW_RENDER_GROUP
        )
      : null,
    cellTextAlignment: shouldCreate('cellTextAlignment')
      ? select(
          'Align cell text (columns[i].align)',
          ['start', 'center', 'end'],
          'start',
          ROW_RENDER_GROUP
        )
      : null,
    locale: shouldCreate('locale')
      ? text('Locale used to format table values (locale)', '', ROW_RENDER_GROUP)
      : null,
    preserveCellWhiteSpace: shouldCreate('preserveCellWhiteSpace')
      ? boolean(
          'Keep extra whitespace within a table cell (options.preserveCellWhiteSpace)',
          getDefaultValue('preserveCellWhiteSpace'),
          ROW_RENDER_GROUP
        )
      : null,
    demoRenderDataFunction: shouldCreate('demoRenderDataFunction')
      ? boolean(
          'Demo custom data render function (columns[i].renderDataFunction)',
          true,
          ROW_RENDER_GROUP
        )
      : null,

    // ROW_EDIT_GROUP
    hasRowEdit: shouldCreate('hasRowEdit')
      ? boolean(
          'Enables row editing for the entire table (options.hasRowEdit)',
          getDefaultValue('hasRowEdit'),
          ROW_EDIT_GROUP
        )
      : null,
    hasSingleRowEdit: shouldCreate('hasSingleRowEdit')
      ? boolean(
          'Enables row editing for a single row (options.hasSingleRowEdit)',
          getDefaultValue('hasSingleRowEdit'),
          ROW_EDIT_GROUP
        )
      : null,

    // STATES_GROUP
    tableIsLoading: shouldCreate('tableIsLoading')
      ? boolean(
          'Show table loading state (view.table.loadingState.isLoading)',
          getDefaultValue('tableIsLoading'),
          STATES_GROUP
        )
      : null,
    demoEmptyColumns: shouldCreate('demoEmptyColumns')
      ? boolean(
          'Demo empty columns in loading state (columns)',
          getDefaultValue('demoEmptyColumns'),
          STATES_GROUP
        )
      : null,
    loadingRowCount: shouldCreate('loadingRowCount')
      ? parseInt(
          text(
            'Number of additional rows in loading state (view.table.loadingState.rowCount)',
            '7', // use text and string instead of number since number() does not work with knob groups
            STATES_GROUP
          ),
          10
        )
      : null,
    loadingColumnCount: shouldCreate('loadingColumnCount')
      ? parseInt(
          text(
            'Number of columns in loading state (view.table.loadingState.columnCount)',
            '6', // use text and string instead of number since number() does not work with knob groups
            STATES_GROUP
          ),
          10
        )
      : null,
    demoEmptyState: shouldCreate('demoEmptyState')
      ? boolean('Demo empty state (data)', getDefaultValue('demoEmptyState'), STATES_GROUP)
      : null,
    demoCustomEmptyState: shouldCreate('demoCustomEmptyState')
      ? boolean(
          'Demo custom empty state (view.table.emptyState)',
          getDefaultValue('demoCustomEmptyState'),
          STATES_GROUP
        )
      : null,
    error: shouldCreate('error')
      ? text('Show error state with this string (error)', '', STATES_GROUP)
      : null,
    demoCustomErrorState: shouldCreate('demoCustomErrorState')
      ? boolean(
          'Demo custom error state (view.table.errorState)',
          getDefaultValue('demoCustomErrorState'),
          STATES_GROUP
        )
      : null,

    // DND_GROUP
    hasDragAndDrop: shouldCreate('hasDragAndDrop')
      ? boolean('Drag and drop (hasDragAndDrop)', getDefaultValue('hasDragAndDrop'), DND_GROUP)
      : null,
    hasBreadcrumbDrop: shouldCreate('hasBreadcrumbDrop')
      ? boolean(
          'Enable drop over breadcrumb (hasBreadcrumbDrop)',
          getDefaultValue('hasBreadcrumbDrop'),
          DND_GROUP
        )
      : null,
  };
};

export const getI18nKnobs = (useGroup = true) => {
  const I18N_GROUP = useGroup ? 'i18n' : undefined;

  return {
    pageBackwardAria: text('i18n.pageBackwardAria', 'Previous page', I18N_GROUP),
    pageForwardAria: text('i18n.pageForwardAria', 'Next page', I18N_GROUP),
    pageNumberAria: text('i18n.pageNumberAria', 'Page Number', I18N_GROUP),
    itemsPerPage: text('i18n.itemsPerPage', 'Items per page:', I18N_GROUP),
    overflowMenuAria: text('i18n.overflowMenuAria', 'More actions', I18N_GROUP),
    clickToExpandAria: text('i18n.clickToExpandAria', 'Click to expand content', I18N_GROUP),
    clickToCollapseAria: text('i18n.clickToCollapseAria', 'Click to collapse content', I18N_GROUP),
    selectAllAria: text('i18n.selectAllAria', 'Select all items', I18N_GROUP),
    selectRowAria: text('i18n.selectRowAria', 'Select row', I18N_GROUP),
    clearAllFilters: text('i18n.clearAllFilters', 'Clear all filters', I18N_GROUP),
    columnSelectionButtonAria: text(
      'i18n.columnSelectionButtonAria',
      'Column Selection',
      I18N_GROUP
    ),
    columnSelectionConfig: text('i18n.columnSelectionConfig', 'Manage columns', I18N_GROUP),
    filterButtonAria: text('i18n.filterButtonAria', 'Filters', I18N_GROUP),
    editButtonAria: text('i18n.editButtonAria', 'Edit rows', I18N_GROUP),
    searchLabel: text('i18n.searchLabel', 'Search', I18N_GROUP),
    searchPlaceholder: text('i18n.searchPlaceholder', 'Search', I18N_GROUP),
    clearFilterAria: text('i18n.clearFilterAria', 'Clear filter', I18N_GROUP),
    filterAria: text('i18n.filterAria', 'Filter', I18N_GROUP),
    openMenuAria: text('i18n.openMenuAria', 'Open menu', I18N_GROUP),
    closeMenuAria: text('i18n.closeMenuAria', 'Close menu', I18N_GROUP),
    clearSelectionAria: text('i18n.clearSelectionAria', 'Clear selection', I18N_GROUP),
    batchCancel: text('i18n.batchCancel', 'Clear selections', I18N_GROUP),
    applyButtonText: text('i18n.applyButtonText', 'Apply filters', I18N_GROUP),
    cancelButtonText: text('i18n.cancelButtonText', 'Cancel', I18N_GROUP),
    advancedFilterLabelText: text(
      'i18n.advancedFilterLabelText',
      'Select an existing filter or',
      I18N_GROUP
    ),
    createNewAdvancedFilterText: text(
      'i18n.createNewAdvancedFilterText',
      'create a new advanced filter',
      I18N_GROUP
    ),
    advancedFilterPlaceholderText: text(
      'i18n.advancedFilterPlaceholderText',
      'Select a filter',
      I18N_GROUP
    ),
    simpleFiltersTabLabel: text('i18n.simpleFiltersTabLabel', 'Simple filters', I18N_GROUP),
    advancedFiltersTabLabel: text('i18n.advancedFiltersTabLabel', 'Advanced filters', I18N_GROUP),
    emptyMessage: text(
      'i18n.emptyMessage',
      'Empty state message. There is no more data. Test word break with extra strings. ',
      I18N_GROUP
    ),
    emptyMessageWithFilters: text(
      'i18n.emptyMessageWithFilters',
      'No results match the current filters',
      I18N_GROUP
    ),
    emptyButtonLabel: text('i18n.emptyButtonLabel', 'Create some data', I18N_GROUP),
    emptyButtonLabelWithFilters: text(
      'i18n.emptyButtonLabelWithFilters',
      'Clear all filters',
      I18N_GROUP
    ),
    filterNone: text('i18n.filterNone', 'Unsort rows by this header', I18N_GROUP),
    filterAscending: text(
      'i18n.filterAscending',
      'Sort rows by this header in ascending order',
      I18N_GROUP
    ),
    filterDescending: text(
      'i18n.filterDescending',
      'Sort rows by this header in descending order',
      I18N_GROUP
    ),
    toggleAggregations: text('i18n.toggleAggregations', 'Toggle aggregations', I18N_GROUP),
    multiSortModalTitle: text('i18n.multiSortModalTitle', 'Select columns to sort', I18N_GROUP),
    multiSortModalPrimaryLabel: text('i18n.multiSortModalPrimaryLabel', 'Sort', I18N_GROUP),
    multiSortModalSecondaryLabel: text('i18n.multiSortModalSecondaryLabel', 'Cancel', I18N_GROUP),
    multiSortSelectColumnLabel: text(
      'i18n.multiSortSelectColumnLabel',
      'Select a column',
      I18N_GROUP
    ),
    multiSortSelectColumnSortByTitle: text(
      'i18n.multiSortSelectColumnSortByTitle',
      'Sort by',
      I18N_GROUP
    ),
    multiSortSelectColumnThenByTitle: text(
      'i18n.multiSortSelectColumnThenByTitle',
      'Then by',
      I18N_GROUP
    ),
    multiSortDirectionLabel: text('i18n.multiSortDirectionLabel', 'Select a direction', I18N_GROUP),
    multiSortDirectionTitle: text('i18n.multiSortDirectionTitle', 'Sort order', I18N_GROUP),
    multiSortAddColumn: text('i18n.multiSortAddColumn', 'Add column', I18N_GROUP),
    multiSortRemoveColumn: text('i18n.multiSortRemoveColumn', 'Remove column', I18N_GROUP),
    multiSortAscending: text('i18n.multiSortAscending', 'Ascending', I18N_GROUP),
    multiSortDescending: text('i18n.multiSortDescending', 'Descending', I18N_GROUP),
    multiSortCloseModal: text('i18n.multiSortCloseModal', 'Close', I18N_GROUP),
    multiSortOpenMenu: text('i18n.multiSortOpenMenu', 'Open menu', I18N_GROUP),
    multiSortCloseMenu: text('i18n.multiSortCloseMenu', 'Close menu', I18N_GROUP),
    multiSortDragHandle: text('i18n.multiSortDragHandle', 'Drag handle', I18N_GROUP),
    toolbarTooltipLabel: text('i18n.toolbarTooltipLabel', 'Toolbar tooltip', I18N_GROUP),
    batchActionsOverflowMenuText: text('i18n.batchActionsOverflowMenuText', '', I18N_GROUP),
  };
};

// Copied in from old table story where it was previously exported
// to also be used in testing and other stories embedding a table
export const getInitialState = () => {
  const tableColumns = getTableColumns();
  return {
    columns: tableColumns.map((i, idx) => ({
      ...i,
      isSortable: idx !== 1,
    })),
    data: getTableData().map((i, idx) => ({
      ...i,
      rowActions: getRowActions(idx),
    })),
    expandedData: [
      {
        rowId: 'row-1',
        content: <div>HELLO CONTENT</div>,
      },
    ],
    options: {
      hasFilter: true,
      hasSearch: true,
      hasPagination: true,
      hasRowSelection: 'multi',
      hasRowExpansion: true,
      hasRowActions: true,
      hasColumnSelection: true,
      shouldExpandOnRowClick: false,
      hasRowEdit: true,
    },
    view: {
      filters: [
        {
          columnId: 'string',
          value: 'whiteboard',
        },
        {
          columnId: 'select',
          value: 'option-B',
        },
      ],
      pagination: {
        pageSize: 10,
        pageSizes: [10, 20, 30],
        page: 1,
      },
      table: {
        loadingMoreIds: [],
        isSelectAllSelected: false,
        selectedIds: [],
        sort: undefined,
        ordering: tableColumns.map(({ id }) => ({
          columnId: id,
          isHidden: id === 'secretField',
        })),
        expandedIds: [],
        rowActions: [],
        singleRowEditButtons: <span>singleRowEditButtons implementation needed</span>,
      },
      toolbar: {
        activeBar: 'filter',
        batchActions: [
          {
            id: 'delete',
            labelText: 'Delete',
            // renderIcon: TrashCan16,
            iconDescription: 'Delete',
          },
        ],
        rowEditBarButtons: <div>App implementation of rowEdit bar buttons expected</div>,
      },
    },
  };
};

const withEmptySelectFilter = (columns) => {
  const selectFilterIndex = columns.findIndex((el) => el.id === 'select');
  columns.splice(selectFilterIndex, 1, {
    id: 'select',
    name: 'Select',
    filter: {
      ...columns[selectFilterIndex].filter,
      options: getSelectDataOptionsWithEmptyOption(),
    },
  });
  return columns;
};

const withMultiSelect = (columns) => {
  const selectFilterIndex = columns.findIndex((el) => el.id === 'select');
  columns.splice(selectFilterIndex, 1, {
    id: 'select',
    name: 'Select',
    filter: {
      ...columns[selectFilterIndex].filter,
      isMultiselect: true,
    },
  });
  return columns;
};

export const decorateTableColumns = (columnsInit, hasEmptyFilterOption, hasMultiSelectFilter) => {
  if (hasEmptyFilterOption && !hasMultiSelectFilter) {
    return withEmptySelectFilter(columnsInit);
  }

  if (hasMultiSelectFilter && !hasEmptyFilterOption) {
    return withMultiSelect(columnsInit);
  }

  if (hasMultiSelectFilter && hasEmptyFilterOption) {
    return withMultiSelect(withEmptySelectFilter(columnsInit));
  }

  return columnsInit;
};
