import React from 'react';
import { Add, ArrowRight } from '@carbon/react/icons';

const getSentence = (index, words) => {
  const getWord = (i, step = 1) => words[(step * i) % words.length];
  return `${getWord(index, 1)} ${getWord(index, 2)} ${getWord(index, 3)} ${index}`;
};

export const getSelectData = () => [
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

export const getWords = () => [
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

export const getMockActions = (mockFunctionProvider) => ({
  pagination: {
    onChangePage: mockFunctionProvider(),
  },
  toolbar: {
    onApplyFilter: mockFunctionProvider(),
    onToggleFilter: mockFunctionProvider(),
    onToggleColumnSelection: mockFunctionProvider(),
    onClearAllFilters: mockFunctionProvider(),
    onCancelBatchAction: mockFunctionProvider(),
    onApplyBatchAction: mockFunctionProvider(),
    onApplySearch: mockFunctionProvider(),
    onDownloadCSV: mockFunctionProvider(),
    onShowRowEdit: mockFunctionProvider(),
    onSearchExpand: mockFunctionProvider(),
  },
  table: {
    onRowSelected: mockFunctionProvider(),
    onRowClicked: mockFunctionProvider(),
    onRowExpanded: mockFunctionProvider(),
    onSelectAll: mockFunctionProvider(),
    onChangeSort: mockFunctionProvider(),
    onApplyRowAction: mockFunctionProvider(),
    onEmptyStateAction: mockFunctionProvider(),
    onChangeOrdering: mockFunctionProvider(),
    onColumnResize: mockFunctionProvider(),
    onRowLoadMore: mockFunctionProvider(),
  },
});

export const getTableColumns = (selectData) => [
  {
    id: 'string',
    name: 'String',
    filter: { placeholderText: 'pick a string' },
    isSortable: true,
  },
  {
    id: 'node',
    name: 'React node',
    isSortable: true,
  },
  {
    id: 'date',
    name: 'Date',
    filter: {
      placeholderText: 'pick a date',
      filterFunction: () => {},
    },
  },
  {
    id: 'select',
    name: 'Select',
    filter: { placeholderText: 'pick an option', options: selectData },
  },
  {
    id: 'number',
    name: 'Number',
    filter: { placeholderText: 'pick a number' },
  },
  {
    id: 'boolean',
    name: 'Boolean',
    filter: { placeholderText: 'true or false' },
  },
  {
    id: 'secretField',
    name: 'Secret Information',
    filter: {},
  },
  {
    id: 'object',
    name: 'Object Id',
    renderDataFunction: ({ value }) => {
      return value?.id;
    },
    filter: {
      placeholderText: 'pick your option',
      options: selectData,
      isMultiselect: true,
      filterFunction: () => {},
    },
  },
];

const getNewRow = (idx, suffix = '') => ({
  id: `row-${idx}${suffix ? `_${suffix}` : ''}`,
  values: {
    string: `test string ${idx} ${suffix}`,
  },
});

export const getNestedRows = () => {
  return Array(3)
    .fill(0)
    .map((i, idx) => ({
      id: `row-${idx}`,
      values: {
        string: `row-${idx}`,
      },
      children:
        idx !== 1
          ? [getNewRow(idx, 'A', true), getNewRow(idx, 'B', true)]
          : idx === 1
          ? [
              getNewRow(idx, 'A', true),
              {
                ...getNewRow(idx, 'B'),
                hasLoadMore: true,
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
    }));
};

export const getNestedRowIds = () => [
  'row-0',
  'row-0_A',
  'row-0_B',
  'row-1',
  'row-1_A',
  'row-1_B',
  'row-1_B-1',
  'row-1_B-2',
  'row-1_B-2-A',
  'row-1_B-2-B',
  'row-1_B-3',
  'row-1_C',
  'row-1_D',
  'row-1_D-1',
  'row-1_D-2',
  'row-1_D-3',
  'row-2',
  'row-2_A',
  'row-2_B',
];

export const getTableData = (numberOfRows, words, selectData) =>
  Array(numberOfRows)
    .fill(0)
    .map((i, idx) => ({
      id: `row-${idx}`,
      values: {
        string: getSentence(idx, words),
        node: <Add size={20} />,
        date: new Date(100000000000 + 1000000000 * idx * idx).toISOString().split('T')[0],
        select: selectData[idx % 3].id,
        number: idx * idx,
        boolean: idx % 2 === 0,
        secretField: `xxxxxxx${idx}`,
        object: { id: `id-${idx}` },
      },
    }));

export const addRowActions = (data) =>
  data.map((row) => ({
    ...row,
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
