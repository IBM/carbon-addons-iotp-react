import React, { useState } from 'react';
import { Add, Close, Edit } from '@carbon/react/icons';
import { boolean, select, text, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { spacing03 } from '@carbon/layout';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';

import { DragAndDrop, EditingStyle } from '../../../utils/DragAndDropUtils';

import SimpleList from './SimpleList';
import SimpleListREADME from './SimpleList.mdx';

export const getListItems = (num) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: { value: `Item ${idx + 1}` },
      isSelectable: true,
    }));

const listItemsWithEmptyRow = getListItems(5).concat({
  id: '6',
  content: { value: '' },
});

const getRowActions = (dir) => () =>
  [
    <Button
      key="simple-list-action-edit"
      renderIcon={Edit}
      hasIconOnly
      kind="ghost"
      size="sm"
      onClick={() => action('edit')()}
      iconDescription="Edit"
      tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
    />,
    <Button
      key="simple-list-action-add"
      renderIcon={Add}
      hasIconOnly
      kind="ghost"
      size="sm"
      onClick={() => action('add')()}
      iconDescription="Add"
      tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
    />,
    <Button
      key="simple-list-action-close"
      renderIcon={Close}
      hasIconOnly
      kind="ghost"
      size="sm"
      onClick={() => action('close')()}
      iconDescription="Close"
      tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
    />,
  ];

const getRowActionsOverFlowMenu = (dir) => () =>
  [
    <OverflowMenu size="sm" flipped={dir !== 'rtl'} key="simple-list-overflow-menu">
      <OverflowMenuItem itemText="Edit" />
      <OverflowMenuItem itemText="Add" />
      <OverflowMenuItem itemText="Delete" />
      <OverflowMenuItem itemText="Danger option" hasDivider isDelete />
    </OverflowMenu>,
  ];

export const getListItemsWithActions = (num, dir) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: {
        value: `Item ${idx + 1}`,
        rowActions: getRowActions(dir),
      },
    }));

const getListItemsWithOverflowMenu = (num) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: {
        value: `Item ${idx + 1}`,
        rowActions: getRowActionsOverFlowMenu(document.dir),
      },
    }));

const getFatRowListItems = (num) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: {
        value: `Item ${idx + 1}`,
        secondaryValue: `This is a description or some secondary bit of data for Item ${idx + 100}`,
        rowActions: [],
      },
    }));

const getFatRowListItemsWithActions = (num) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: {
        value: `Item ${idx + 1}`,
        secondaryValue: `This is a description or some secondary bit of data for Item ${idx + 100}`,
        rowActions: getRowActions(document.dir),
      },
    }));

const getFatRowListItemsWithOverflowMenu = (num) =>
  Array(num)
    .fill(0)
    .map((i, idx) => ({
      id: (idx + 1).toString(),
      content: {
        value: `Item ${idx + 1}`,
        secondaryValue: `This is a description or some secondary bit of data for Item ${idx + 100}`,
        rowActions: getRowActionsOverFlowMenu(document.dir),
      },
    }));

const buttonsToRender = (dir) => [
  <Button
    key="simple-list-header-edit"
    renderIcon={Edit}
    hasIconOnly
    kind="ghost"
    size="sm"
    onClick={() => {}}
    iconDescription="Edit"
    tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
  />,
  <Button
    key="simple-list-header-close"
    renderIcon={Close}
    hasIconOnly
    kind="secondary"
    size="sm"
    onClick={() => {}}
    iconDescription="Close"
    tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
  />,
  <Button
    key="simple-list-header-add"
    renderIcon={Add}
    hasIconOnly
    size="sm"
    iconDescription="Add"
    tooltipPosition={dir !== 'rtl' ? 'left' : 'right'}
  />,
];

export default {
  title: '1 - Watson IoT/List/SimpleList',

  parameters: {
    component: SimpleList,
    docs: {
      page: SimpleListREADME,
    },
  },

  excludeStories: [
    'getListItems',
    'getListItemsWithActions',
    'getRowActions',
    'getRowActionsOverFlowMenu',
  ],
};

export const Basic = () => (
  <div style={{ width: 500 }}>
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getListItems(number('items to render', 30))}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'xl')}
      isLoading={boolean('isLoading', false)}
      hasPagination={boolean('hasPagination', true)}
    />
  </div>
);

Basic.storyName = 'basic';

export const ListWithEmptyRow = () => (
  <div
    style={{
      width: 500,
      height: 500,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={listItemsWithEmptyRow}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'xl')}
      isLoading={boolean('isLoading', false)}
      hasPagination={boolean('hasPagination', true)}
    />
  </div>
);

ListWithEmptyRow.storyName = 'list with empty row';

export const ListWithLargeRow = () => (
  <div
    style={{
      width: 500,
      height: 600,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getFatRowListItems(20)}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'sm')}
      isLoading={boolean('isLoading', false)}
      isLargeRow
      hasPagination={boolean('hasPagination', true)}
    />
  </div>
);

ListWithLargeRow.storyName = 'list with large row';

export const ListWithMultipleActions = () => (
  <div
    style={{
      width: 500,
      height: 600,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getListItemsWithActions(5, document.dir)}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'sm')}
      isLoading={boolean('isLoading', false)}
      hasPagination={boolean('hasPagination', true)}
    />
  </div>
);

ListWithMultipleActions.storyName = 'list with multiple actions';

export const ListWithOverflowMenu = () => (
  <div
    style={{
      width: 500,
      height: 600,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getListItemsWithOverflowMenu(5)}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'sm')}
      isLoading={boolean('isLoading', false)}
      hasPagination={boolean('hasPagination', true)}
    />
  </div>
);

ListWithOverflowMenu.storyName = 'list with overflow menu';

export const LargeRowListWithMultipleActions = () => (
  <div
    style={{
      width: 500,
      height: 600,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getFatRowListItemsWithActions(5)}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'sm')}
      hasPagination={boolean('hasPagination', true)}
      isLargeRow
      isLoading={boolean('isLoading', false)}
    />
  </div>
);

LargeRowListWithMultipleActions.storyName = 'large row list with multiple actions';

export const LargeRowListWithOverflowMenu = () => (
  <div
    style={{
      width: 500,
      height: 600,
      background: '#fee',
      padding: spacing03,
    }}
  >
    <SimpleList
      title={text('Text', 'Simple List')}
      hasSearch={boolean('hasSearch', true)}
      i18n={{
        searchPlaceHolderText: 'Enter a search',
        pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
      }}
      buttons={buttonsToRender(document.dir)}
      items={getFatRowListItemsWithOverflowMenu(5)}
      isFullHeight={boolean('isFullHeight', true)}
      pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'sm')}
      hasPagination={boolean('hasPagination', true)}
      isLargeRow
      isLoading={boolean('isLoading', false)}
    />
  </div>
);

LargeRowListWithOverflowMenu.storyName = 'large row list with overflow menu';

export const ListWithReorder = () => {
  const SimpleListWithReorder = () => {
    const [items, setItems] = useState(getListItems(15));

    return (
      <div style={{ width: 500 }}>
        <SimpleList
          title={text('Text', 'Simple List')}
          hasSearch={boolean('hasSearch', true)}
          i18n={{
            searchPlaceHolderText: 'Enter a search',
            pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
            items: '%d items',
          }}
          buttons={buttonsToRender(document.dir)}
          items={items}
          isFullHeight={boolean('isFullHeight', true)}
          pageSize={select('pageSize', ['sm', 'lg', 'xl'], 'xl')}
          isLoading={boolean('isLoading', false)}
          hasPagination={boolean('hasPagination', true)}
          editingStyle={select(
            'Editing Style',
            [EditingStyle.Single, EditingStyle.Multiple],
            EditingStyle.Single
          )}
          onListUpdated={(updatedItems) => {
            setItems(updatedItems);
          }}
        />
      </div>
    );
  };

  return <SimpleListWithReorder />;
};

ListWithReorder.storyName = 'with reorder';
ListWithReorder.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];
