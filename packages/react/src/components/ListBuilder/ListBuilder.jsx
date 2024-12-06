import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Reset, Subtract } from '@carbon/react/icons';
import warning from 'warning';
import { isNil } from 'lodash-es';

import HierarchyList from '../List/HierarchyList';
import { settings } from '../../constants/Settings';
import Button from '../Button/Button';
import deprecate from '../../internal/deprecate';
import List from '../List/List';
import { ButtonIconPropType } from '../../constants/SharedPropTypes';
import { EditingStyle } from '../../utils/DragAndDropUtils';

const { iotPrefix } = settings;

export const ListBuilderItemPropTypes = {
  /** the id of this item */
  id: PropTypes.string,
  content: PropTypes.shape({
    /** the value of this item */
    value: PropTypes.string,

    /**
     * a function that returns an array of elements to trigger actions if the list builder has complex structure or logic
     * otherwise, this will be populated by the ListBuilder as a simple add or remove button.
     */
    rowActions: PropTypes.func,
  }),
  /** is this item disabled */
  disabled: PropTypes.bool,
  /** allows for groups or categories, see SelectUsersModal for a complex example */
  isCategory: PropTypes.bool,
  /** allows for groups or categories, see SelectUsersModal for a complex example */
  children: PropTypes.arrayOf(PropTypes.object),
};

const propTypes = {
  /** an array of the ids of the items in the "all list" that should be expanded  */
  allDefaultExpandedIds: PropTypes.arrayOf(PropTypes.string),
  /** callback used to limit which items that should get drop targets rendered.
   * receives the id of the item that is being dragged and returns a list of ids. */
  getAllowedDropIds: PropTypes.func,
  // TODO: remove deprecated testID in v3.
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** will increase the height of the list items to make to room for a secondary value */
  isLargeRow: PropTypes.bool,
  /** the list of all items available to select in the ListBuilder */
  items: PropTypes.arrayOf(PropTypes.shape(ListBuilderItemPropTypes)),
  /** current search value of the items search */
  itemsSearchValue: PropTypes.string,
  /** if the items contain children or groups, a proper count can be passed here. */
  itemCount: PropTypes.number,
  /** callback function returned before an item in the selected list is repositioned.
   * Returning false cancels the move */
  itemWillMove: PropTypes.func,
  /** the ids of locked items that cannot be reordered in the selected list */
  lockedIds: PropTypes.arrayOf(PropTypes.string),
  /** RowIds for rows currently loading more rows */
  loadingMoreIds: PropTypes.arrayOf(PropTypes.string),
  /** an array of all selected items */
  selectedItems: PropTypes.arrayOf(PropTypes.shape(ListBuilderItemPropTypes)),
  /** an array of the ids of the selected items that should be expanded  */
  selectedDefaultExpandedIds: PropTypes.arrayOf(PropTypes.string),
  /** (event, id) => void */
  onAdd: PropTypes.func,
  /** receives an updated array of the selected items after reordering */
  onSelectedListReordered: PropTypes.func,
  /** (event, id) => void */
  onRemove: PropTypes.func,
  /** Called when the items search value changes. Receives the latest value as a string.
   * Required when useCheckboxes is true */
  onItemsSearchChange: PropTypes.func,
  /** Called when the reset button is clicked */
  onReset: PropTypes.func,
  /** if true checkboxes will be used for selection so selected items can stay in the left list */
  useCheckboxes: PropTypes.bool,
  /** call back function for when load more row is clicked  (rowId) => {} */
  handleLoadMore: PropTypes.func,
  /** true if the items list should have search */
  hasItemsSearch: PropTypes.bool,
  /** true if the selected items list should have search */
  hasSelectedItemsSearch: PropTypes.bool,
  /** true if the reset button should be shown */
  hasReset: PropTypes.bool,
  i18n: PropTypes.shape({
    /** (count) => `Items (${count} available)` */
    allListTitle: PropTypes.func,
    /** (count) => `${count} items selected` */
    selectedListTitle: PropTypes.func,
    /** remove icons description on selected items */
    removeIconDescription: PropTypes.string,
    /** add aria label on unselected items */
    addLabel: PropTypes.string,
    /** placeholder text for the search box for all items */
    allListSearchPlaceholderText: PropTypes.string,
    /** placeholder text for the search box for selected items */
    selectedListSearchPlaceholderText: PropTypes.string,
    /** expand icon description when using nested groups */
    expandIconDescription: PropTypes.string,
    /** collapse icon description when using nested groups */
    collapseIconDescription: PropTypes.string,
    /** reset button label */
    resetLabel: PropTypes.string,
    /** label for the "Load more" button */
    loadMoreButtonLabel: PropTypes.string,
    /** message shown if the all items list is empty */
    allListEmptyText: PropTypes.string,
    /** message shown if selected list is empty */
    selectedListEmptyText: PropTypes.string,
    /** icon description label for the clear search icon */
    clearSearchIconDescription: PropTypes.string,
    expand: deprecate(
      PropTypes.string,
      `The 'expand' prop has been deprecated. Please use 'expandIconDescription' instead.`
    ),
    close: deprecate(
      PropTypes.string,
      `The 'close' prop has been deprecated. Please use 'collapseIconDescription' instead.`
    ),
  }),
  /** the icon used as button to remove items from the selected list */
  removeIcon: ButtonIconPropType,
  /** the editing style of the hirerchy list showing the selected items */
  selectedEditingStyle: PropTypes.oneOf([EditingStyle.Single, EditingStyle.SingleNesting]),
  /** if true the list for available columns will show a loader only */
  showLoaderInAvailableList: PropTypes.bool,
  /** if true the list for selected columns will show a loader only */
  showLoaderInSelectedList: PropTypes.bool,
};

const defaultProps = {
  allDefaultExpandedIds: [],
  getAllowedDropIds: null,
  handleLoadMore: undefined,
  hasItemsSearch: true,
  hasSelectedItemsSearch: true,
  hasReset: false,
  testId: 'list-builder',
  isLargeRow: false,
  items: [],
  itemsSearchValue: null,
  itemCount: null,
  itemWillMove: () => true,
  loadingMoreIds: [],
  lockedIds: [],
  selectedItems: [],
  selectedDefaultExpandedIds: [],
  onAdd: null,
  onSelectedListReordered: () => {},
  onRemove: null,
  onReset: () => {},
  onItemsSearchChange: null,
  i18n: {
    allListTitle: (count) => {
      return `Items (${count} available)`;
    },
    selectedListTitle: (count) => {
      return `${count} Selected`;
    },
    removeIconDescription: 'Remove item from list',
    addLabel: 'Add item to list',
    allListSearchPlaceholderText: 'Enter a value to search all items',
    selectedListSearchPlaceholderText: 'Enter a value to search selected items',
    expandIconDescription: 'Expand',
    collapseIconDescription: 'Collapse',
    resetLabel: 'Reset',
    loadMoreButtonLabel: 'Load more...',
  },
  useCheckboxes: false,
  removeIcon: Subtract,
  selectedEditingStyle: undefined,
  showLoaderInAvailableList: false,
  showLoaderInSelectedList: false,
};

const getSelectedItemIds = (nestedSelectedItems) =>
  nestedSelectedItems.flatMap((selectedItem) =>
    selectedItem.isCategory ? getSelectedItemIds(selectedItem.children) : selectedItem.id
  );

const getSelectedParentIds = (nestedSelectedItems, selectedChildIds, allListItems) => {
  const parentsWithChildSelection = nestedSelectedItems.filter(
    (item) => item.isCategory && item.children?.length
  );
  return parentsWithChildSelection.flatMap((currentParent) => {
    const originalParent = allListItems.find(({ id }) => currentParent.id === id);
    return originalParent.children.every(({ id }) => selectedChildIds.includes(id))
      ? [currentParent.id]
      : [];
  });
};

const ListBuilder = ({
  allDefaultExpandedIds,
  getAllowedDropIds,
  handleLoadMore,
  hasItemsSearch,
  hasSelectedItemsSearch,
  hasReset,
  // TODO: remove deprecated testID in v3.
  testID,
  testId,
  isLargeRow,
  items,
  itemsSearchValue,
  itemCount,
  itemWillMove,
  loadingMoreIds,
  lockedIds,
  selectedItems,
  selectedDefaultExpandedIds,
  i18n,
  onAdd,
  onSelectedListReordered,
  onRemove,
  onItemsSearchChange,
  onReset,
  useCheckboxes,
  removeIcon,
  selectedEditingStyle,
  showLoaderInAvailableList,
  showLoaderInSelectedList,
}) => {
  // When the checkbox design is used there are currently a few restrictions
  // and additional requirements
  if (__DEV__ && useCheckboxes) {
    if (!onItemsSearchChange) {
      warning(
        false,
        'The `onItemsSearchChange` prop must be provided when `useCheckboxes` is true.'
      );
    }
  }

  const mergedI18n = {
    ...defaultProps.i18n,
    ...i18n,
  };
  const {
    allListTitle,
    selectedListTitle,
    resetLabel,
    allListEmptyText,
    selectedListEmptyText,
    clearSearchIconDescription,
  } = mergedI18n;

  const handleAdd = useCallback(
    (id) => (event) => {
      event.persist();
      onAdd(event, id);
    },
    [onAdd]
  );
  const handleRemove = useCallback(
    (id) => (event) => {
      event.persist();
      onRemove(event, id);
    },
    [onRemove]
  );

  const allListItems = useMemo(
    () =>
      items?.map((item) => {
        const rowActions = !useCheckboxes
          ? item.content.rowActions !== undefined
            ? item.content.rowActions
            : // The "Select" button from the old design. New design uses checkboxes.
              () => [
                <Button
                  key={`${item.id}-list-item-button`}
                  // TODO: remove deprecated testID in v3.
                  testId={`${testID || testId}-add-button-${item.id}`}
                  role="button"
                  aria-label={mergedI18n.addLabel}
                  renderIcon={ArrowRight}
                  hasIconOnly
                  kind="ghost"
                  size="sm"
                  onClick={handleAdd(item.id)}
                  iconDescription={mergedI18n.addLabel}
                />,
              ]
          : undefined;

        return {
          ...item,
          isSelectable: useCheckboxes
            ? item.hasOwnProperty('isSelectable')
              ? item.isSelectable
              : true
            : undefined,
          content: {
            ...item.content,
            rowActions,
          },
        };
      }) ?? [],
    [handleAdd, items, mergedI18n.addLabel, testID, testId, useCheckboxes]
  );

  const filteredListItems = useMemo(() => {
    const lowerCaseSearchValue =
      typeof itemsSearchValue === 'string' && itemsSearchValue.toLowerCase();
    const isMatch = ({ id, content: { value } }) =>
      id.toLowerCase().includes(lowerCaseSearchValue) ||
      value.toLowerCase().includes(lowerCaseSearchValue);

    return useCheckboxes && !isNil(itemsSearchValue) && itemsSearchValue !== ''
      ? allListItems.flatMap((item) => {
          const directMatch = isMatch(item);
          const matchingChildren = item.children?.length && item.children.filter(isMatch);
          const matchingItem = directMatch || matchingChildren?.length ? { ...item } : [];
          return matchingChildren?.length
            ? { ...matchingItem, children: matchingChildren }
            : matchingItem;
        })
      : allListItems;
  }, [allListItems, itemsSearchValue, useCheckboxes]);

  const selectedListItems = useMemo(() => {
    const appendRemoveAction = (item) => {
      const rowActions =
        item.content.rowActions !== undefined
          ? item.content.rowActions
          : () => [
              <Button
                key={`${item.id}-list-item-button`}
                // TODO: remove deprecated testID in v3.
                testId={`${testID || testId}-remove-button-${item.id}`}
                renderIcon={removeIcon}
                hasIconOnly
                kind="ghost"
                size="sm"
                onClick={handleRemove(item.id)}
                iconDescription={mergedI18n.removeIconDescription}
              />,
            ];
      const modifiedChildren = item.children
        ? item.children.map((child) => appendRemoveAction(child))
        : undefined;

      return {
        ...item,
        content: {
          ...item.content,
          rowActions,
        },
        ...(modifiedChildren ? { children: modifiedChildren } : {}),
      };
    };

    return selectedItems?.map((item) => appendRemoveAction(item)) ?? [];
  }, [handleRemove, mergedI18n.removeIconDescription, selectedItems, testID, testId, removeIcon]);

  const flattenedSelectedIds = useMemo(() => {
    if (!useCheckboxes) return [];
    const selectedChildIds = getSelectedItemIds(selectedItems, allListItems);
    const selectedParentIds = getSelectedParentIds(selectedItems, selectedChildIds, allListItems);
    return [...selectedChildIds, ...selectedParentIds];
  }, [selectedItems, allListItems, useCheckboxes]);

  const indeterminateIds = useMemo(() => {
    if (!useCheckboxes) return [];
    return allListItems
      .filter(
        (parent) =>
          parent.children &&
          parent.children.some((sibling) => flattenedSelectedIds.includes(sibling.id)) &&
          parent.children.some((sibling) => !flattenedSelectedIds.includes(sibling.id))
      )
      .map((parent) => parent.id);
  }, [allListItems, flattenedSelectedIds, useCheckboxes]);

  const [checkboxListExpandedIds, setCheckboxListExpandedIds] = useState(allDefaultExpandedIds);

  const renderCheckboxList = () => {
    return (
      <List
        toggleExpansion={(id) => {
          setCheckboxListExpandedIds((prev) => {
            return prev.includes(id) ? prev.filter((expId) => id !== expId) : [...prev, id];
          });
        }}
        expandedIds={checkboxListExpandedIds}
        isLargeRow={isLargeRow}
        isLoading={showLoaderInAvailableList}
        indeterminateIds={indeterminateIds}
        emptyState={allListEmptyText}
        handleLoadMore={handleLoadMore}
        loadingMoreIds={loadingMoreIds}
        title={allListTitle(itemCount ?? allListItems.length)}
        items={filteredListItems}
        isVirtualList
        selectedIds={flattenedSelectedIds}
        isCheckboxMultiSelect
        handleSelect={(id) => {
          // Stay backwards compatible with the non-checkbox design where an event was
          // passed before the selected id
          return flattenedSelectedIds.find((selectedId) => selectedId === id)
            ? onRemove(null, id)
            : onAdd(null, id);
        }}
        search={
          hasItemsSearch
            ? {
                onChange: (evt) => {
                  onItemsSearchChange(evt.target.value, evt);
                },
              }
            : undefined
        }
        i18n={{
          clearSearchIconDescription,
          searchPlaceHolderText: mergedI18n.allListSearchPlaceholderText,
          loadMore: mergedI18n.loadMoreButtonLabel,
        }}
      />
    );
  };

  return (
    <div data-testid={testID || testId} className={`${iotPrefix}--list-builder__container`}>
      <div
        className={`${iotPrefix}--list-builder__all`}
        // TODO: remove deprecated testID in v3.
        data-testid={`${testID || testId}__all`}
      >
        {useCheckboxes ? (
          renderCheckboxList()
        ) : (
          <HierarchyList
            defaultExpandedIds={allDefaultExpandedIds}
            isLargeRow={isLargeRow}
            isLoading={showLoaderInAvailableList}
            emptyState={allListEmptyText}
            title={allListTitle(itemCount ?? allListItems.length)}
            items={allListItems}
            hasSearch={hasItemsSearch}
            hasPagination={false}
            searchId={`${iotPrefix}--list-builder__all--search`}
            i18n={{
              clearSearchIconDescription,
              searchPlaceHolderText: mergedI18n.allListSearchPlaceholderText,
              expand: mergedI18n.expandIconDescription || mergedI18n.expand,
              close: mergedI18n.collapseIconDescription || mergedI18n.close,
            }}
          />
        )}
      </div>
      <div
        className={`${iotPrefix}--list-builder__selected`}
        // TODO: remove deprecated testID in v3.
        data-testid={`${testID || testId}__selected`}
      >
        <HierarchyList
          isLargeRow={isLargeRow}
          isLoading={showLoaderInSelectedList}
          emptyState={selectedListEmptyText}
          buttons={
            hasReset
              ? [
                  <Button
                    className={`${iotPrefix}--list-builder__reset-button`}
                    testId={`${testId}__selected__reset-button`}
                    renderIcon={Reset}
                    kind="ghost"
                    size="sm"
                    iconDescription={resetLabel}
                    key="hierarchy-list-button-add"
                    onClick={onReset}
                  >
                    {resetLabel}
                  </Button>,
                ]
              : []
          }
          editingStyle={selectedEditingStyle}
          defaultExpandedIds={selectedDefaultExpandedIds}
          getAllowedDropIds={getAllowedDropIds}
          title={selectedListTitle(selectedListItems.length)}
          items={selectedListItems}
          itemWillMove={itemWillMove}
          onListUpdated={onSelectedListReordered}
          lockedIds={lockedIds}
          hasSearch={hasSelectedItemsSearch}
          hasPagination={false}
          searchId={`${iotPrefix}--list-builder__selected--search`}
          i18n={{
            searchPlaceHolderText: mergedI18n.selectedListSearchPlaceholderText,
            expand: mergedI18n.expandIconDescription || mergedI18n.expand,
            close: mergedI18n.collapseIconDescription || mergedI18n.close,
          }}
        />
      </div>
    </div>
  );
};

ListBuilder.propTypes = propTypes;
ListBuilder.defaultProps = defaultProps;
export default ListBuilder;
