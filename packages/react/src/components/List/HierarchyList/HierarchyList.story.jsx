import React, { createElement, useMemo, useState } from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, boolean, object, number, array } from '@storybook/addon-knobs';
import { Add } from '@carbon/react/icons';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';

import Button from '../../Button';
import { EditingStyle, DragAndDrop } from '../../../utils/DragAndDropUtils';
import { sampleHierarchy } from '../List.story';

import HierarchyList from './HierarchyList';

const addButton = (
  <Button
    renderIcon={Add}
    hasIconOnly
    size="sm"
    iconDescription="Add"
    key="hierarchy-list-button-add"
    onClick={() => action('header button onClick')}
  />
);

export default {
  title: '1 - Watson IoT/List/HierarchyList',

  parameters: {
    component: HierarchyList,
  },
};

export const StatefulListWithNestedSearching = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      buttons={[addButton]}
      isFullHeight={boolean('isFullHeight', true)}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              secondaryValue: sampleHierarchy.MLB['American League'][team][player],
            },
            isSelectable: true,
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              secondaryValue: sampleHierarchy.MLB['National League'][team][player],
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'sm')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      i18n={object('i18n', {
        searchPlaceHolderText: 'Search',
      })}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

StatefulListWithNestedSearching.storyName = 'Stateful list with nested searching';

export const WithDeepNesting = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      buttons={[addButton]}
      isFullHeight={boolean('isFullHeight', true)}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              secondaryValue: sampleHierarchy.MLB['American League'][team][player],
            },
            isSelectable: true,
            children: [
              {
                id: `${team}_${player}_lorem`,
                content: {
                  value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                  secondaryValue: 'Secondary',
                },
                isSelectable: true,
              },
              {
                id: `${team}_${player}_lorem_action`,
                content: {
                  value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                  rowActions: () => (
                    <OverflowMenu title="data-item-menu" size="sm" flipped={document.dir !== 'rtl'}>
                      <OverflowMenuItem
                        itemText="Configure"
                        onClick={() => console.log('Configure')}
                      />
                      <OverflowMenuItem
                        itemText="Delete"
                        onClick={() => console.log('Delete')}
                        isDelete
                        hasDivider
                      />
                    </OverflowMenu>
                  ),
                },
                isSelectable: true,
              },
            ],
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              secondaryValue: sampleHierarchy.MLB['National League'][team][player],
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'sm')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      i18n={object('i18n', {
        searchPlaceHolderText: 'Search',
      })}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
      enableHorizontalScrollbar={boolean('Enable horizontal scrollbar', true)}
    />
  </div>
);

WithDeepNesting.storyName = 'With deep nesting';

export const WithDefaultSelectedId = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      defaultSelectedId={text('Default Selected Id', 'New York Mets_Pete Alonso')}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'lg')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithDefaultSelectedId.storyName = 'With defaultSelectedId';

export const WithOverflowMenu = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              rowActions: () => (
                <OverflowMenu title="data-item-menu" size="sm" flipped={document.dir !== 'rtl'}>
                  <OverflowMenuItem itemText="Configure" onClick={() => console.log('Configure')} />
                  <OverflowMenuItem
                    itemText="Delete"
                    onClick={() => console.log('Delete')}
                    isDelete
                    hasDivider
                  />
                </OverflowMenu>
              ),
            },
            isSelectable: true,
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
              rowActions: [
                <OverflowMenu title="data-item-menu" flipped>
                  <OverflowMenuItem itemText="Configure" onClick={() => console.log('Configure')} />
                  <OverflowMenuItem
                    itemText="Delete"
                    onClick={() => console.log('Delete')}
                    isDelete
                    hasDivider
                  />
                </OverflowMenu>,
              ],
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'lg')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array(
        'A comma separated list of expandedIds (expandedIds)',
        ['Chicago White Sox'],
        ','
      )}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithOverflowMenu.storyName = 'With OverflowMenu and controlled expandedIds';

export const WithNestedReorder = () => {
  const HierarchyListWithReorder = () => {
    const [items, setItems] = useState([
      ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
        id: team,
        isCategory: true,
        content: {
          value: team,
        },
        children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
          id: `${team}_${player}`,
          content: {
            value: player,
          },
          isSelectable: true,
        })),
      })),
      ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
        id: team,
        isCategory: true,
        content: {
          value: team,
        },
        children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
          id: `${team}_${player}`,
          content: {
            value: player,
          },
          isSelectable: true,
        })),
      })),
    ]);

    const allowsEdit = boolean('Allow Item Movement', true);

    return (
      <div style={{ width: 400, height: 400 }}>
        <HierarchyList
          title={text('Title', 'MLB Expanded List')}
          defaultSelectedId={text('Default Selected Id', 'New York Mets_Pete Alonso')}
          items={items}
          editingStyle={select(
            'Editing Style',
            [EditingStyle.SingleNesting, EditingStyle.MultipleNesting],
            EditingStyle.SingleNesting
          )}
          pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'lg')}
          isLoading={boolean('isLoading', false)}
          isLargeRow={boolean('isLargeRow', false)}
          onListUpdated={(updatedItems) => {
            setItems(updatedItems);
          }}
          itemWillMove={() => {
            return allowsEdit;
          }}
          hasSearch={boolean('hasSearch', true)}
          onSelect={action('onSelect')}
          hasDeselection={boolean('hasDeselection', true)}
          hasMultiSelect={boolean('hasMultiSelect', false)}
          isVirtualList={boolean('hasVirtualList', false)}
          lockedIds={object('lockedIds', ['New York Mets_Jeff McNeil'])}
          expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
          onExpandedChange={action('onExpandedChange')}
        />
      </div>
    );
  };

  return <HierarchyListWithReorder />;
};

WithNestedReorder.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithNestedReorderingRestricted = () => {
  const HierarchyListWithReorderAndRestrictions = () => {
    const [items, setItems] = useState([
      ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
        id: team,
        isCategory: true,
        content: {
          value: team,
        },
        children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
          id: `${team}_${player}`,
          content: {
            value: player,
          },
          isSelectable: true,
        })),
      })),
      ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
        id: team,
        isCategory: true,
        content: {
          value: team,
        },
        children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
          id: `${team}_${player}`,
          content: {
            value: player,
          },
          isSelectable: true,
        })),
      })),
    ]);

    const demoDropRestrictions = boolean(
      'Demo drop restrictions to preserve teams (using getAllowedDropIds)',
      true
    );

    return (
      <div style={{ width: 400, height: 400 }}>
        <HierarchyList
          title={text('Title', 'Preserve team compositions')}
          items={items}
          editingStyle={EditingStyle.Single}
          onListUpdated={(updatedItems) => {
            setItems(updatedItems);
          }}
          // Prevent nested dropping, so that a team cannot be dropped in a team
          itemWillMove={(...args) => args[2] !== 'nested'}
          hasSearch={boolean('hasSearch', true)}
          isVirtualList={boolean('hasVirtualList', false)}
          expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
          onExpandedChange={action('onExpandedChange')}
          getAllowedDropIds={
            demoDropRestrictions
              ? (dragId) => {
                  const teamIsDragged = items.find(({ id }) => id === dragId);
                  return teamIsDragged
                    ? // Return team ids
                      items.map(({ id }) => id)
                    : // Return teammate ids
                      items
                        .find((team) => team.children.find(({ id }) => dragId === id))
                        .children.map(({ id }) => id);
                }
              : null
          }
        />
      </div>
    );
  };

  return <HierarchyListWithReorderAndRestrictions />;
};

WithNestedReorderingRestricted.storyName = 'With nested reordering restricted';
WithNestedReorderingRestricted.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithDefaultExpandedIds = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'xl')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      defaultExpandedIds={['Chicago White Sox', 'New York Yankees']}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithDefaultExpandedIds.storyName = 'With defaultExpandedIds';

export const WithMixedHierarchies = () => (
  <div style={{ width: 400 }}>
    <HierarchyList
      title={text('Title', 'Items with mixed nested hierarchies')}
      items={[
        {
          id: 'Tasks',
          content: {
            value: 'Tasks',
          },
          children: [
            {
              id: 'Task 1',
              content: {
                value: 'Task 1',
                secondaryValue: () => <div> SecondaryValue </div>,
              },
              isSelectable: true,
            },
          ],
        },
        {
          id: 'My Reports',
          content: {
            value: 'My Reports',
            secondaryValue: () => <div> SecondaryValue </div>,
          },
          isSelectable: true,
        },
        {
          id: 'Requests',
          content: {
            value: 'Requests',
          },
          children: [
            {
              id: 'Request 1',
              content: {
                value: 'Request 1',
              },
              isSelectable: true,
            },
            {
              id: 'Request 2',
              content: {
                value: 'Request 2',
              },
              children: [
                {
                  id: 'Request 2 details',
                  content: {
                    value: 'Request 2 details',
                  },
                },
              ],
            },
            {
              id: 'Request 3',
              content: {
                value: 'Request 3',
              },
              isSelectable: true,
            },
          ],
        },
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'xl')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithMixedHierarchies.storyName = 'with mixed hierarchies';

export const WithSelectableCategories = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'MLB Expanded List')}
      defaultSelectedId={text('Default Selected Id', 'Chicago White Sox_Jose Abreu')}
      items={[
        ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
          id: team,
          isCategory: true,
          isSelectable: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
        ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
          id: team,
          isCategory: true,
          content: {
            value: team,
          },
          children: Object.keys(sampleHierarchy.MLB['National League'][team]).map((player) => ({
            id: `${team}_${player}`,
            content: {
              value: player,
            },
            isSelectable: true,
          })),
        })),
      ]}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], 'lg')}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', false)}
      expandedIds={array('A comma separated list of expandedIds (expandedIds)', [], ',')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithSelectableCategories.storyName = 'With selectable categories';

export const WithLargeNumberOfItems = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'Big List')}
      isFullHeight={boolean('isFullHeight', false)}
      items={[...Array(number('number of items to render', 1000))].map((_, i) => ({
        id: `item-${i}`,
        content: {
          value:
            i === 20
              ? `Item ${i} that has an extra long label that will definitely be truncated`
              : `Item ${i}`,
          secondaryValue:
            i === 10
              ? `Item ${i} that has an extra long label that will definitely be truncated`
              : `Item ${i} Subvalue`,
        },
      }))}
      editingStyle={EditingStyle.Single}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], undefined)}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      onListUpdated={action('onListUpdated')}
      hasDeselection={boolean('hasDeselection', true)}
      i18n={object('i18n', {
        searchPlaceHolderText: 'Search',
      })}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      isVirtualList={boolean('hasVirtualList', true)}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithLargeNumberOfItems.storyName = 'with virtual list and large number of items';

export const WithEmptyState = () => (
  <div style={{ width: 400, height: 400 }}>
    <HierarchyList
      title={text('Title', 'Big List')}
      isFullHeight={boolean('isFullHeight', true)}
      items={[]}
      editingStyle={EditingStyle.Single}
      hasSearch={boolean('hasSearch', true)}
      pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], undefined)}
      isLoading={boolean('isLoading', false)}
      isLargeRow={boolean('isLargeRow', false)}
      onSelect={action('onSelect')}
      hasDeselection={boolean('hasDeselection', true)}
      i18n={object('i18n', {
        searchPlaceHolderText: 'Search',
      })}
      hasMultiSelect={boolean('hasMultiSelect', false)}
      emptyState={text('emptyState', '__a custom empty state__')}
      onExpandedChange={action('onExpandedChange')}
    />
  </div>
);

WithEmptyState.storyName = 'with empty state';

const generateNestedItems = (numberToRender) => {
  return [...Array(numberToRender)].map((_, i) => ({
    id: `item-${i}`,
    content: {
      value: `Item ${i}`,
    },
    isCategory: true,
    children: Array.from({ length: 10 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i)).map(
      (letter, ci) => ({
        id: `item-${i}-${ci}`,
        content: {
          value: `Item ${i}-${letter}`,
        },
      })
    ),
  }));
};

const generateItemIds = (numberToRender) => [...Array(numberToRender)].map((_, i) => `item-${i}`);

export const WithLargeNumberOfExpandableItems = () => {
  const [expandedIds, setExpandedIds] = useState(
    array('A comma separated list of expandedIds (expandedIds)', [], ',')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const numberToRender = number('number of items to render', 200);
  const [allItems, parentIds] = useMemo(
    () => [generateNestedItems(numberToRender), generateItemIds(numberToRender)],
    [numberToRender]
  );
  return (
    <>
      <Button
        onClick={() => {
          window.requestAnimationFrame(() => {
            setIsLoading(true);
            if (allOpen) {
              setExpandedIds([]);
            } else {
              setExpandedIds(parentIds);
            }
          });
        }}
        loading={isLoading}
      >
        {isLoading ? (allOpen ? 'Closing all' : 'Opening all') : allOpen ? 'Close all' : 'Open all'}
      </Button>
      <div style={{ width: 400, height: 400 }}>
        <HierarchyList
          title={text('Title', 'Big List')}
          isFullHeight={boolean('isFullHeight', false)}
          items={allItems}
          hasSearch={boolean('hasSearch', true)}
          pageSize={select('Page Size', ['sm', 'lg', 'xl', undefined], undefined)}
          isLoading={boolean('isLoading', false)}
          isLargeRow={boolean('isLargeRow', false)}
          onSelect={action('onSelect')}
          onListUpdated={action('onListUpdated')}
          hasDeselection={boolean('hasDeselection', true)}
          i18n={object('i18n', {
            searchPlaceHolderText: 'Search',
          })}
          hasMultiSelect={boolean('hasMultiSelect', false)}
          expandedIds={expandedIds}
          onExpandedChange={(...args) => {
            setIsLoading(false);
            action('onExpandedChange')(...args);
            setAllOpen((prev) => !prev);
          }}
          isVirtualList={boolean('hasVirtualList', false)}
        />
      </div>
    </>
  );
};

WithLargeNumberOfExpandableItems.storyName = 'With large number of expandable items';
WithLargeNumberOfExpandableItems.decorators = [
  createElement,
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];
