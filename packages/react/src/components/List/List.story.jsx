import React, { useEffect, useState } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text, object, number } from '@storybook/addon-knobs';
import { Add, Edit, Star } from '@carbon/react/icons';
import { cloneDeep } from 'lodash-es';

import Button from '../Button';
import { OverflowMenu } from '../OverflowMenu';
import { OverflowMenuItem } from '../OverflowMenuItem';
import { Tag } from '../Tag';
import { EditingStyle, DragAndDrop } from '../../utils/DragAndDropUtils';

import List from './List';
// import ListREADME from './List.mdx'; //carbon 11

export const sampleHierarchy = {
  MLB: {
    'American League': {
      'Chicago White Sox': {
        'Leury Garcia': 'CF',
        'Yoan Moncada': '3B',
        'Jose Abreu': '1B',
        'Welington Castillo': 'C',
        'Eloy Jimenez': 'LF',
        'Charlie Tilson': 'RF',
        'Tim Anderson': 'SS',
        'Yolmer Sanchez': '2B',
        'Dylan Covey': 'P',
      },
      'New York Yankees': {
        'DJ LeMahieu': '2B',
        'Luke Voit': '1B',
        'Gary Sanchez': 'C',
        'Kendrys Morales': 'DH',
        'Gleyber Torres': 'SS',
        'Clint Frazier': 'RF',
        'Brett Gardner': 'LF',
        'Gio Urshela': '3B',
        'Cameron Maybin': 'RF',
        'Robinson Cano': '2B',
      },
      'Houston Astros': {
        'George Springer': 'RF',
        'Jose Altuve': '2B',
        'Michael Brantley': 'LF',
        'Alex Bregman': '3B',
        'Yuli Gurriel': '1B',
        'Yordan Alvarez': 'DH',
        'Carlos Correa': 'SS',
        'Robinson Chirinos': 'C',
        'Josh Reddick': 'CF',
      },
    },
    'National League': {
      'Atlanta Braves': {
        'Ronald Acuna Jr.': 'CF',
        'Dansby Swanson': 'SS',
        'Freddie Freeman': '1B',
        'Josh Donaldson': '3B',
        'Nick Markakis': 'RF',
        'Austin Riley': 'LF',
        'Brian McCann': 'C',
        'Ozzie Albies': '2B',
        'Kevin Gausman': 'P',
      },
      'New York Mets': {
        'Jeff McNeil': '3B',
        'Amed Rosario': 'SS',
        'Michael Conforto is a super duper long name that will get cut off': 'RF',
        'Pete Alonso': '1B',
        'Wilson Ramos': 'C',
        'Robinson Cano': '2B',
        'JD Davis': 'LF',
        'Brandon Nimmo': 'CF',
        'Jacob Degrom': 'P',
      },
      'Washington Nationals': {
        'Trea Turner': 'SS',
        'Adam Eaton': 'RF',
        'Anthony Rendon': '3B',
        'Juan Soto': 'LF',
        'Howie Kendrick': '2B',
        'Ryan Zimmerman': '1B',
        'Yian Gomes': 'C',
        'Victor Robles': 'CF',
        'Max Scherzer': 'P',
      },
    },
  },
};

const buildHierarchy = (obj, renderRowActions, renderIcon, prefix = '', level = 0) => {
  return Object.keys(obj).map((key) => ({
    id: `${prefix}${key}`,
    content: {
      value: key,
      secondaryValue: typeof obj[key] === 'string' ? obj[key] : undefined,
      rowActions: renderRowActions(key, level, obj),
      icon: renderIcon(key, level, obj),
    },
    children:
      typeof obj[key] === 'object'
        ? buildHierarchy(obj[key], renderRowActions, renderIcon, `${prefix}${key}_`, level + 1)
        : null,
  }));
};

const headerButton = (
  <Button
    renderIcon={Add}
    hasIconOnly
    size="sm"
    iconDescription="Add"
    key="expandable-list-button-add"
    onClick={() => action('header button clicked')}
  />
);

export default {
  title: '1 - Watson IoT/List/List',

  parameters: {
    component: List,
    // docs: {
    //   page: ListREADME,
    // }, //carbon 11
  },

  excludeStories: ['sampleHierarchy'],
};

export const BasicSingleColumn = () => {
  const BasicSingleColumn = () => {
    const [searchValue, setSearchValue] = useState(null);
    const useSearch = boolean('use search (search)', false);
    const hasFastSearch = boolean(
      'Trigger search onChange (true) or onBlur/Enter (false) (search.hasFastSearch)',
      true
    );
    const demoEmptyList = boolean('demo empty list', false);

    return (
      <div style={{ width: 400 }}>
        <List
          emptyState={text('Empty state text (emptyState)', 'No list items to show')}
          emptySearchState={text('Empty search state text (emptySearchState)', 'No results found')}
          isLargeRow={boolean('show large rows (isLargeRow)', false)}
          title={text('title', 'NY Yankees')}
          items={
            demoEmptyList
              ? []
              : Object.entries(sampleHierarchy.MLB['American League']['New York Yankees'])
                  .map(([key]) => ({
                    id: key,
                    content: { value: key },
                  }))
                  .filter(
                    ({ id }) =>
                      !searchValue || id.toLowerCase().includes(searchValue?.toLowerCase())
                  )
          }
          search={
            useSearch
              ? {
                  onChange: (evt) => setSearchValue(evt.target.value),
                  hasFastSearch,
                }
              : undefined
          }
          isFiltering={!!searchValue}
          isLoading={boolean('isLoading', false)}
          isVirtualList={boolean('isVirtualList', false)}
        />
      </div>
    );
  };
  return <BasicSingleColumn />;
};
BasicSingleColumn.storyName = 'basic (single column)';
BasicSingleColumn.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const BasicSingleColumnWithSearch = () => {
  const ListWithSearch = () => {
    const [searchValue, setSearchValue] = useState(null);
    return (
      <div style={{ width: 400 }}>
        <List
          title={text('title', 'NY Yankees')}
          items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees'])
            .map(([key]) => ({
              id: key,
              content: { value: key },
            }))
            .filter(
              ({ id }) => !searchValue || id.toLowerCase().includes(searchValue?.toLowerCase())
            )}
          isFiltering={!!searchValue}
          isLoading={boolean('isLoading', false)}
          search={{
            onChange: (evt) => setSearchValue(evt.target.value),
            hasFastSearch: boolean(
              'Trigger search onChange (true) or onBlur/Enter (false) (search.hasFastSearch)',
              true
            ),
          }}
          isVirtualList={boolean('isVirtualList', false)}
        />
      </div>
    );
  };

  return <ListWithSearch />;
};

BasicSingleColumnWithSearch.storyName = 'basic (single column) with search';
BasicSingleColumnWithSearch.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithAsyncLoadingAndSearch = () => {
  const numberOfItems = number('number of items to render', 100);
  const generateItems = (number = numberOfItems) =>
    [...Array(number)].map((_, i) => ({
      id: `item-${i}`,
      content: {
        value: `Item ${i}`,
        secondaryValue: `Item ${i} Subvalue`,
      },
    }));

  const simulateGettingItemsFromServer = (searchValue) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const itemsFromServer = generateItems(numberOfItems).filter(
          ({ content }) =>
            content.value.includes(searchValue) || content.secondaryValue.includes(searchValue)
        );
        resolve(itemsFromServer);
      }, 1500);
    });

  const ListWithAsyncLoadingAndSearch = () => {
    const [searchValue, setSearchValue] = useState('');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const searchServerForItems = async () => {
        setIsLoading(true);
        const newItems = await simulateGettingItemsFromServer(searchValue);
        setItems(newItems);
        setIsLoading(false);
      };

      searchServerForItems();
    }, [searchValue]);
    return (
      <div style={{ width: 400 }}>
        <List
          title={text('title', 'Async loading and search')}
          items={items}
          isFiltering={!!searchValue}
          isLoading={isLoading}
          search={{
            onChange: (evt) => setSearchValue(evt.target.value),
            hasFastSearch: false,
          }}
          isVirtualList={boolean('isVirtualList', false)}
        />
      </div>
    );
  };

  return <ListWithAsyncLoadingAndSearch />;
};

WithAsyncLoadingAndSearch.storyName = 'with async loading and search';
WithAsyncLoadingAndSearch.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const SelectableItems = () => {
  const ListWithSelectableItems = () => {
    const [selected, setSelected] = useState();
    return (
      <div style={{ width: 400 }}>
        <List
          title={text('title', 'NY Yankees')}
          items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
            ([key]) => ({
              id: key,
              content: { value: key },
              isSelectable: true,
            })
          )}
          isLoading={boolean('isLoading', false)}
          handleSelect={(id) => setSelected(id)}
          selectedIds={[selected]}
          isVirtualList={boolean('isVirtualList', false)}
        />
      </div>
    );
  };
  return <ListWithSelectableItems />;
};

SelectableItems.storyName = 'with selectable items';

export const WithSecondaryValue = () => (
  <div style={{ width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key, value]) => ({
          id: key,
          content: {
            value: key,
            secondaryValue: value,
          },
        })
      )}
      isLargeRow={boolean('isLargeRow', false)}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithSecondaryValue.storyName = 'with secondaryValue';

export const WithIsLargeRowAndIcon = () => (
  <div style={{ width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      isLargeRow
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key, value]) => ({
          id: key,
          content: {
            value: key,
            secondaryValue: value,
            icon: <Star />,
          },
        })
      )}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithIsLargeRowAndIcon.storyName = 'with isLargeRow and icon';

export const WithRowActionsSingle = () => (
  <div style={{ width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key, value]) => ({
          id: key,
          content: {
            value: key,
            secondaryValue: value,
            rowActions: () => [
              <Button
                key={`${key}-list-item-button-${value}`}
                style={{ color: 'black' }}
                renderIcon={Edit}
                hasIconOnly
                kind="ghost"
                size="sm"
                onClick={() => action('row action clicked')}
                iconDescription="Edit"
                tooltipPosition={document.dir === 'ltr' ? 'left' : 'right'}
              />,
            ],
          },
        })
      )}
      isLargeRow={boolean('isLargeRow', false)}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);
WithRowActionsSingle.storyName = 'with row actions (single)';

export const WithRowActionsMultiple = () => (
  <div style={{ width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key, value]) => ({
          id: key,
          content: {
            value: key,
            secondaryValue: value,
            rowActions: () => [
              <OverflowMenu
                size="sm"
                flipped={document.dir !== 'rtl'}
                key={`${key}-list-item-button-${value}`}
              >
                <OverflowMenuItem itemText="Edit" />
                <OverflowMenuItem itemText="Add" />
                <OverflowMenuItem itemText="Delete" hasDivider isDelete />
              </OverflowMenu>,
            ],
          },
        })
      )}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithRowActionsMultiple.storyName = 'with row actions (multiple)';

export const WithHierarchy = () => (
  <div style={{ width: 400 }}>
    <List
      title="Sports Teams"
      buttons={[headerButton]}
      iconPosition="left"
      items={buildHierarchy(
        sampleHierarchy,
        (key, level) =>
          level === 1
            ? [
                <Button
                  key={`${key}-list-item-button-${level}`}
                  style={{ color: 'black' }}
                  renderIcon={Edit}
                  hasIconOnly
                  kind="ghost"
                  size="sm"
                  onClick={() => action('row action clicked')}
                  iconDescription="Edit"
                  tooltipPosition={document.dir === 'ltr' ? 'left' : 'right'}
                />,
              ]
            : level === 2
            ? [
                <OverflowMenu
                  size="sm"
                  flipped={document.dir !== 'rtl'}
                  key={`${key}-list-item-button-${level}`}
                >
                  <OverflowMenuItem itemText="Edit" />
                  <OverflowMenuItem itemText="Add" />
                  <OverflowMenuItem itemText="Delete" hasDivider isDelete />
                </OverflowMenu>,
              ]
            : [],
        (key, level) => (level === 3 ? <Star /> : null)
      )}
      expandedIds={[
        'MLB',
        'MLB_American League',
        'MLB_National League',
        'MLB_American League_New York Yankees',
      ]}
      toggleExpansion={action('toggleExpansion')}
      isLargeRow={boolean('isLargeRow', false)}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithHierarchy.storyName = 'with hierarchy';

export const WithCategoriesFixedHeight = () => (
  <div style={{ width: 400, height: 600 }}>
    <List
      title="Major League Baseball"
      buttons={[headerButton]}
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
          })),
        })),
      ]}
      expandedIds={['New York Yankees', 'Atlanta Braves']}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithCategoriesFixedHeight.storyName = 'with categories, fixed height';

export const WithEmptyState = () => (
  <div style={{ width: 400, height: 600 }}>
    <List
      title="Major League Baseball"
      buttons={[headerButton]}
      items={[]}
      isLoading={boolean('isLoading', false)}
      isFullHeight={boolean('isFullHeight', true)}
      emptyState={text('hasEmptyState', 'No list items to show')}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithEmptyState.storyName = 'with empty state';

export const WithCheckboxMultiSelection = () => {
  const MultiSelectList = () => {
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelection = (id) => {
      setSelectedIds((currentSelectedIds) => {
        const isDeselecting = currentSelectedIds.includes(id);
        return isDeselecting
          ? currentSelectedIds.filter((selectedId) => selectedId !== id)
          : [...currentSelectedIds, id];
      });
    };

    return (
      <div style={{ width: 400 }}>
        <List
          title="Sports Teams"
          buttons={[headerButton]}
          iconPosition="left"
          items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
            ([key]) => ({
              id: key,
              content: { value: key },
              isSelectable: true,
            })
          )}
          selectedIds={selectedIds}
          isLoading={boolean('isLoading', false)}
          isVirtualList={boolean('isVirtualList', false)}
          isCheckboxMultiSelect
          handleSelect={handleSelection}
        />
      </div>
    );
  };
  return <MultiSelectList />;
};

WithCheckboxMultiSelection.storyName = 'with checkbox multi-selection';

export const WithCheckboxMultiSelectionAndHierarchy = () => {
  const MultiSelectList = () => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedIds, setExpandedIds] = useState([]);
    const demoLongValue = boolean('demo long value string', false);
    const demoLongSecondaryValue = boolean('demo long secondary value string', false);
    const demoRowActions = boolean('demo row actions', false);
    const demoTags = boolean('demo tags', false);

    const searchNestedItems = (items, value, parentMatch) => {
      let filteredItems = [];
      cloneDeep(items).forEach((item) => {
        if (item.id === value) {
          filteredItems.push(item.id);
          if (item.children) {
            const children = searchNestedItems(item.children, item.id, true);
            filteredItems = filteredItems.concat(children);
          }
        } else if (parentMatch) {
          filteredItems.push(item.id);
        }
      });
      return filteredItems;
    };

    const findParent = (items, id) =>
      items.find((parent) => parent?.children && parent.children.find((child) => child.id === id));

    const parentSelectionAffected = (parent, currentSelectedIds, isDeselecting) => {
      const deselectParent =
        isDeselecting &&
        parent?.children.filter((child) => currentSelectedIds.includes(child.id)).length === 1;
      const selectParent =
        !isDeselecting &&
        parent?.children.filter((child) => currentSelectedIds.includes(child.id)).length ===
          parent.children.length - 1;
      return deselectParent || selectParent;
    };

    const handleSelection = (items, id) => {
      action('handleSelect')();
      setSelectedIds((currentSelectedIds) => {
        const isDeselecting = currentSelectedIds.includes(id);
        const parent = findParent(items, id);
        const affectedIds = [...new Set([...searchNestedItems(items, id), id])];

        if (parent && parentSelectionAffected(parent, currentSelectedIds, isDeselecting)) {
          affectedIds.push(parent.id);
        }

        return isDeselecting
          ? currentSelectedIds.filter(
              (selectedId) => !affectedIds.includes(selectedId) && selectedId !== id
            )
          : [...currentSelectedIds, ...affectedIds];
      });
    };

    const nestedItems = [
      ...Object.keys(sampleHierarchy.MLB['American League']).map((team) => ({
        id: team,
        isCategory: true,
        isSelectable: true,
        content: {
          value: demoLongValue
            ? `${team} - this value is extra long so that it will overflow`
            : team,
        },
        children: Object.keys(sampleHierarchy.MLB['American League'][team]).map((player) => ({
          id: `${team}-${player}`,
          isSelectable: true,
          content: {
            value: demoLongValue
              ? `${player} - this value is extra long so that it will overflow`
              : player,
            secondaryValue: demoLongSecondaryValue
              ? `${sampleHierarchy.MLB['American League'][team][player]} - this second value is extra long so that it will overflow `
              : undefined,
            tags: demoTags
              ? [
                  <Tag type="blue" title="descriptor" key="tag1">
                    default
                  </Tag>,
                ]
              : [],
            rowActions: () =>
              demoRowActions
                ? [
                    <OverflowMenu
                      size="sm"
                      flipped={document.dir !== 'rtl'}
                      key={`${team}-list-item-button-${player}`}
                    >
                      <OverflowMenuItem itemText="Edit" />
                      <OverflowMenuItem itemText="Add" />
                      <OverflowMenuItem itemText="Delete" hasDivider isDelete />
                    </OverflowMenu>,
                  ]
                : [],
          },
        })),
      })),
      ...Object.keys(sampleHierarchy.MLB['National League']).map((team) => ({
        id: team,
        isCategory: true,
        isSelectable: true,
        content: {
          value: team,
        },
        children: [],
      })),
    ];

    const indeterminateIds = nestedItems
      .filter(
        (parent) =>
          parent.children &&
          parent.children.some((sibling) => selectedIds.includes(sibling.id)) &&
          parent.children.some((sibling) => !selectedIds.includes(sibling.id))
      )
      .map((parent) => parent.id);

    return (
      <div style={{ width: 400 }}>
        <List
          title="Sports Teams"
          buttons={[headerButton]}
          iconPosition="left"
          items={nestedItems}
          selectedIds={selectedIds.filter((id) => !indeterminateIds.includes(id))}
          expandedIds={expandedIds}
          indeterminateIds={indeterminateIds}
          toggleExpansion={(id) => {
            if (expandedIds.filter((rowId) => rowId === id).length > 0) {
              // remove id from array
              setExpandedIds(expandedIds.filter((rowId) => rowId !== id));
            } else {
              setExpandedIds(expandedIds.concat([id]));
            }
          }}
          isLargeRow={boolean('isLargeRow', false)}
          isLoading={boolean('isLoading', false)}
          isVirtualList={boolean('isVirtualList', false)}
          isCheckboxMultiSelect
          handleSelect={(id) => handleSelection(nestedItems, id)}
        />
      </div>
    );
  };
  return <MultiSelectList />;
};

WithCheckboxMultiSelectionAndHierarchy.storyName = 'with checkbox multi-selection and hierarchy';
WithCheckboxMultiSelectionAndHierarchy.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithTags = () => {
  const demoRowActions = boolean('demoRowActions', false);
  return (
    <div style={{ width: 400 }}>
      <List
        title={text('title', 'NY Yankees')}
        items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
          ([key, value]) => ({
            id: key,
            content: {
              value: key,
              secondaryValue: value,
              tags: [
                <Tag type="blue" title="descriptor" key="tag1">
                  default
                </Tag>,
              ],
              rowActions: () =>
                demoRowActions
                  ? [
                      <OverflowMenu
                        size="sm"
                        flipped={document.dir !== 'rtl'}
                        key={`${key}-list-item-button-${value}`}
                      >
                        <OverflowMenuItem itemText="Edit" />
                        <OverflowMenuItem itemText="Add" />
                        <OverflowMenuItem itemText="Delete" hasDivider isDelete />
                      </OverflowMenu>,
                    ]
                  : [],
            },
          })
        )}
        isLargeRow={boolean('isLargeRow', false)}
        isLoading={boolean('isLoading', false)}
        isVirtualList={boolean('isVirtualList', false)}
      />
    </div>
  );
};

WithTags.storyName = 'with tags';

export const WithPagination = () => (
  <div style={{ height: 300, overflow: 'auto', width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key]) => ({
          id: key,
          content: { value: key },
        })
      )}
      isLoading={boolean('isLoading', false)}
      pagination={{
        page: 1,
        onPage() {},
        maxPage: 10,
        pageOfPagesText: (page) => `Page ${page}`,
      }}
      isFullHeight={boolean('isFullHeight', true)}
      isVirtualList={boolean('isVirtualList', false)}
    />
  </div>
);

WithPagination.storyName = 'with pagination';

export const WithLoadMore = () => {
  const ListWithExpandIds = () => {
    const [expandedIds, setExpandedIds] = useState([]);
    const [loadingMoreIds, setLoadingMoreIds] = useState([]);

    const [listItems, setListItems] = useState([
      {
        id: 'org',
        content: { value: 'Organization' },
        children: [
          { id: 'site-01', content: { value: 'Site 1' } },
          {
            id: 'site-02',
            content: { value: 'Site 2' },
            children: [
              { id: 'system-01', content: { value: 'System 1' } },
              { id: 'system-02', content: { value: 'System 2' } },
            ],
            hasLoadMore: true,
          },
          {
            id: 'site-03',
            content: { value: 'Site 3' },
            children: [
              { id: 'system-03', content: { value: 'System 3' } },
              { id: 'system-04', content: { value: 'System 4' } },
            ],
            hasLoadMore: true,
          },
        ],
      },
      { id: 'org2', content: { value: 'Organization 2' }, hasLoadMore: true },
    ]);
    return (
      <div style={{ width: 400 }}>
        <List
          title="Sports Teams"
          iconPosition="left"
          items={listItems}
          expandedIds={expandedIds}
          toggleExpansion={(id) =>
            setExpandedIds((prev) =>
              prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
            )
          }
          loadingMoreIds={loadingMoreIds}
          isLoading={boolean('isLoading', false)}
          isVirtualList={boolean('isVirtualList', false)}
          handleLoadMore={(id) => {
            action('handleLoadMore')(id);
            setLoadingMoreIds((prev) => [...prev, id]);
            setTimeout(() => {
              setListItems((prevItems) => [
                {
                  id: 'org',
                  content: { value: 'Organization' },
                  children: [
                    { id: 'site-01', content: { value: 'Site 1' } },
                    {
                      id: 'site-02',
                      content: { value: 'Site 2' },
                      children:
                        id === 'site-02'
                          ? [
                              { id: 'system-01', content: { value: 'System 1' } },
                              { id: 'system-02', content: { value: 'System 2' } },
                              { id: 'system-03', content: { value: 'System 3' } },
                              { id: 'system-04', content: { value: 'System 4' } },
                            ]
                          : prevItems[0]?.children[1]?.children,
                      hasLoadMore:
                        id === 'site-02' ? false : prevItems[0]?.children[1]?.hasLoadMore,
                    },
                    {
                      id: 'site-03',
                      content: { value: 'Site 3' },
                      children:
                        id === 'site-03'
                          ? [
                              { id: 'system-03', content: { value: 'System 3' } },
                              { id: 'system-04', content: { value: 'System 4' } },
                              { id: 'system-05', content: { value: 'System 5' } },
                              { id: 'system-06', content: { value: 'System 6' } },
                            ]
                          : prevItems[0]?.children[2]?.children,
                      hasLoadMore:
                        id === 'site-03' ? false : prevItems[0]?.children[2]?.hasLoadMore,
                    },
                  ],
                },
                {
                  id: 'org2',
                  content: { value: 'Organization 2' },
                  hasLoadMore: id === 'org2' ? false : prevItems[1]?.hasLoadMore,
                },
                ...(id === 'org2'
                  ? [{ id: 'org3', content: { value: 'Organization 3' } }]
                  : prevItems[2]
                  ? [prevItems[2]]
                  : []),
              ]);
              setLoadingMoreIds((prev) => prev.filter((prevId) => prevId !== id));
            }, 2000);
          }}
        />
      </div>
    );
  };
  return <ListWithExpandIds />;
};

WithLoadMore.storyName = 'with load more';
WithLoadMore.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

export const WithVirtualList = () => (
  <div style={{ height: 300, overflow: 'auto', width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key]) => ({
          id: key,
          content: { value: key },
        })
      )}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', true)}
      isFullHeight={boolean('isFullHeight', true)}
      isLargeRow={boolean('isLargeRow', false)}
    />
  </div>
);

WithVirtualList.storyName = 'with virtual list';

export const WithReorderAndLockedRows = () => (
  <div style={{ width: 400 }}>
    <List
      title={text('title', 'NY Yankees')}
      items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
        ([key]) => ({
          id: key,
          content: { value: key },
        })
      )}
      isLoading={boolean('isLoading', false)}
      isVirtualList={boolean('isVirtualList', false)}
      editingStyle={EditingStyle.Single}
      lockedIds={['DJ LeMahieu', 'Luke Voit']}
      onItemMoved={action('onItemMoved')}
      itemWillMove={(args) => {
        action('itemWillMove')(args);
        return true;
      }}
    />
  </div>
);

WithReorderAndLockedRows.storyName = 'with reorder and locked rows';

export const WithReorderAndDropTargetRestrictions = () => {
  const allowedDropIds = object('getAllowedDropIds return value', ['Luke Voit', 'Gleyber Torres']);
  return (
    <div style={{ height: 300, overflow: 'auto', width: 400 }}>
      <List
        title={text('title', 'NY Yankees')}
        items={Object.entries(sampleHierarchy.MLB['American League']['New York Yankees']).map(
          ([key]) => ({
            id: key,
            content: { value: key },
          })
        )}
        isVirtualList={boolean('isVirtualList', false)}
        editingStyle={EditingStyle.Single}
        getAllowedDropIds={() => allowedDropIds}
      />
    </div>
  );
};

WithReorderAndDropTargetRestrictions.storyName = 'with reorder and drop target restrictions';
