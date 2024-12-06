import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isNil, uniqBy, cloneDeep, merge } from 'lodash-es';
import { CloseOutline } from '@carbon/react/icons';
import warning from 'warning';
import classNames from 'classnames';

import ComposedModal from '../../ComposedModal/ComposedModal';
import { settings } from '../../../constants/Settings';
import { OverridePropTypes } from '../../../constants/SharedPropTypes';
import ListBuilder from '../../ListBuilder/ListBuilder';
import { EditingStyle } from '../../../utils/DragAndDropUtils';

import { useVisibilityToggle } from './visibilityToggleHook';

const { iotPrefix } = settings;
const ITEM_VALUE_KEYS = {
  ID: 'id',
  NAME: 'name',
};

export const propTypes = {
  /** The list of all the selectable columns  */
  availableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  /** Will show a modal error notification with the supplied string if present */
  error: PropTypes.string,
  /** Defines the groups and which columns they contain. The order of the groups is relevant. */
  groupMapping: PropTypes.arrayOf(
    PropTypes.shape({
      /** The id of the column group */
      id: PropTypes.string.isRequired,
      /** The name of the column group */
      name: PropTypes.string.isRequired,
      /** The ids of the columns belonging to the group. The order is irrelevant. */
      columnIds: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  /** If true selected columns can be hidden/shown  */
  hasVisibilityToggle: PropTypes.bool,
  /** If true shows a "Load more" button at the end of the list of available columns */
  hasLoadMore: PropTypes.bool,
  i18n: PropTypes.shape({
    availableColumnsEmptyText: PropTypes.string,
    availableColumnsLabel: PropTypes.string,
    cancelButtonLabel: PropTypes.string,
    clearSearchIconDescription: PropTypes.string,
    closeIconDescription: PropTypes.string,
    collapseIconDescription: PropTypes.string,
    expandIconDescription: PropTypes.string,
    hideIconDescription: PropTypes.string,
    loadMoreButtonLabel: PropTypes.string,
    modalTitle: PropTypes.string,
    modalBody: PropTypes.string,
    removeIconDescription: PropTypes.string,
    resetButtonLabel: PropTypes.string,
    saveButtonLabel: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    selectedColumnsEmptyText: PropTypes.string,
    selectedColumnsLabel: PropTypes.string,
    showIconDescription: PropTypes.string,
  }),
  /** Array of objects representing the order and visibility of the columns */
  initialOrdering: PropTypes.arrayOf(
    PropTypes.shape({
      /** The id of the column */
      columnId: PropTypes.string.isRequired,
      /* Visibility of column in table, defaults to false */
      isHidden: PropTypes.bool,
    })
  ).isRequired,
  /** Disables the primary (save) button when true */
  isPrimaryButtonDisabled: PropTypes.bool,
  /** RowIds for rows currently loading more available columns */
  loadingMoreIds: PropTypes.arrayOf(PropTypes.string),
  /** Called when columns are selected, deselected, hidden, shown and reordered */
  onChange: PropTypes.func,
  /**  Clear the currently shown error, triggered if the user closes the ErrorNotification */
  onClearError: PropTypes.func,
  /** Called with the id of the last item when the load more button is clicked */
  onLoadMore: PropTypes.func,
  /** Called on cancel button click and on the top right close icon click */
  onClose: PropTypes.func.isRequired,
  /** Called with the updated ordering and columns array when save button is clicked */
  onSave: PropTypes.func.isRequired,
  /** Called when the reset button is clicked */
  onReset: PropTypes.func,

  /** Determines if the modal is open or closed (i.e. visible or not to the user) */
  open: PropTypes.bool.isRequired,
  /** Allows overriding the two main components using the attributes 'composedModal and 'listBuilder' */
  overrides: PropTypes.shape({
    composedModal: OverridePropTypes,
    listBuilder: OverridePropTypes,
  }),
  /** The id of a column that is pinned as the first column and cannot be deselected */
  pinnedColumnId: PropTypes.string,
  /** The column key used as primary display value for the items in the lists */
  primaryValue: PropTypes.oneOf(Object.values(ITEM_VALUE_KEYS)),
  /** The column key used as secondary display value for the items in the lists.
   * Defaults to undefined but if present will appear below the default value
   * and make the list items taller.  */
  secondaryValue: PropTypes.oneOf([...Object.values(ITEM_VALUE_KEYS), undefined]),
  /** if true the list for available columns will show a loader only */
  showLoaderInAvailableList: PropTypes.bool,
  /** if true the list for selected columns will show a loader only */
  showLoaderInSelectedList: PropTypes.bool,
  /** Id that can be used for testing */
  testId: PropTypes.string,
};

export const defaultProps = {
  error: undefined,
  groupMapping: [],
  hasLoadMore: false,
  hasVisibilityToggle: false,
  i18n: {
    availableColumnsEmptyText: 'No available columns to show',
    availableColumnsLabel: 'Available columns',
    cancelButtonLabel: 'Cancel',
    clearSearchIconDescription: 'Clear search input',
    closeIconDescription: 'Close',
    collapseIconDescription: 'Collapse',
    expandIconDescription: 'Expand',
    hideIconDescription: 'Column is visible, click to hide.',
    loadMoreButtonLabel: 'Load more...',
    modalTitle: 'Customize columns',
    modalBody:
      'Select the available columns to be displayed on the table. Drag the selected columns to reorder them.',
    removeIconDescription: 'Remove from list',
    resetButtonLabel: 'Reset',
    saveButtonLabel: 'Save',
    searchPlaceholder: 'Search',
    selectedColumnsEmptyText: 'No columns selected',
    selectedColumnsLabel: 'Selected columns',
    showIconDescription: 'Column is hidden, click to show.',
  },
  isPrimaryButtonDisabled: false,
  loadingMoreIds: [],
  onChange: () => {},
  onClearError: () => {},
  onLoadMore: () => {},
  onReset: () => {},
  overrides: undefined,
  pinnedColumnId: undefined,
  primaryValue: ITEM_VALUE_KEYS.NAME,
  secondaryValue: undefined,
  showLoaderInAvailableList: false,
  showLoaderInSelectedList: false,
  testId: 'table-column-customization-modal',
};

const removeItemFromGroup = (items, groupItem, id) => {
  const modifiedGroupItem = {
    ...groupItem,
    children: groupItem.children.filter((item) => item.id !== id),
  };
  return items.map((item) => (item.id === groupItem.id ? modifiedGroupItem : item));
};

const handleRemoveWithinGroup = (previous, groupId, id) => {
  const groupItem = previous.find((item) => item.id === groupId);
  const removeGroup = groupItem?.children.length === 1;

  return removeGroup
    ? previous.filter((item) => item.id !== groupId)
    : removeItemFromGroup(previous, groupItem, id);
};

const createGroupItem = (id, name, children) => ({
  id,
  isCategory: true,
  content: {
    value: name,
  },
  children,
});

const findAndCloneItem = (id, availableColumnItems) => {
  const matchingTopLevelItem = cloneDeep(
    availableColumnItems.find(
      (topLevelItem) =>
        topLevelItem.id === id ||
        (topLevelItem.children?.length && topLevelItem.children.find((child) => child.id === id))
    )
  );
  return matchingTopLevelItem.id === id
    ? matchingTopLevelItem
    : matchingTopLevelItem.children.find((child) => child.id === id);
};

const findAndCloneInitialTopLevelItem = (id, availableColumnItems) => {
  const column = availableColumnItems.find((item) => item.id === id);
  if (column === undefined && __DEV__) {
    warning(
      false,
      `Can't find column with id '${id}'. Make sure all columns referenced in prop 'initialOrdering' also exists in  prop 'availableColumns'.`
    );
  }
  return column ? cloneDeep(column) : undefined;
};

const createAvailableItem = (column) => ({
  id: column.id,
  content: { value: column.name },
  isSelectable: true,
});

const createPinnedItemArray = (pinnedColumnId, availableColumns) => {
  const pinnedColumn = pinnedColumnId && availableColumns.find(({ id }) => id === pinnedColumnId);
  return pinnedColumn ? [{ ...createAvailableItem(pinnedColumn), disabled: true }] : [];
};

const createGroupItems = (availableColumns, groupMapping) => {
  const groupItems = groupMapping.map(({ id: groupId, name, columnIds }) => {
    const childItems = columnIds.flatMap((childId) => {
      const childColumn = availableColumns.find((column) => column.id === childId);
      return childColumn ? createAvailableItem(childColumn) : [];
    });
    return createGroupItem(groupId, name, childItems);
  });
  return groupItems;
};

const createNormalItems = (availableColumns, groupMapping, pinnedColumnId) =>
  availableColumns
    .filter((item) => {
      const belongsInGroup = groupMapping.some((groupDef) => groupDef.columnIds.includes(item.id));
      return !belongsInGroup && item.id !== pinnedColumnId;
    })
    .map((column) => createAvailableItem(column));

const setItemValues = (item, primaryKey, secondaryKey) => {
  const columnName = item.content.value;
  const columnId = item.id;
  return {
    ...item,
    content: {
      value: primaryKey === ITEM_VALUE_KEYS.ID ? columnId : columnName,
      secondaryValue:
        secondaryKey === ITEM_VALUE_KEYS.ID
          ? columnId
          : secondaryKey === ITEM_VALUE_KEYS.NAME
          ? columnName
          : undefined,
    },
  };
};

const setItemsValues = (items, primaryKey, secondaryKey) =>
  items.map((item) =>
    item.isCategory
      ? { ...item, children: setItemsValues(item.children, primaryKey, secondaryKey) }
      : setItemValues(item, primaryKey, secondaryKey)
  );

const transformToAvailableItems = ({
  availableColumns,
  pinnedColumnId,
  hasLoadMore,
  groupMapping,
  primaryValueKey,
  secondaryValueKey,
}) => {
  if (availableColumns.length === 0) return [];

  const pinnedItems = createPinnedItemArray(pinnedColumnId, availableColumns);
  const groupItems = createGroupItems(availableColumns, groupMapping);
  const normalItems = createNormalItems(availableColumns, groupMapping, pinnedColumnId);
  const availableItems = setItemsValues(
    [...pinnedItems, ...groupItems, ...normalItems],
    primaryValueKey,
    secondaryValueKey
  );

  if (hasLoadMore && availableItems.length) {
    availableItems[availableItems.length - 1].hasLoadMore = true;
  }
  return availableItems;
};

const transformToSelectedGroupItem = (initialOrdering, groupItem) => {
  const selectedChildItems = groupItem.children
    // Only keep children that are in the initial ordering
    .filter(({ id }) => initialOrdering.find((column) => column.columnId === id))
    // Sort the children according to the initialOrdering
    .sort(
      (a, b) =>
        initialOrdering.findIndex((ord) => ord.columnId === a) -
        initialOrdering.findIndex((ord) => ord.columnId === b)
    );
  return { ...groupItem, children: selectedChildItems };
};

const transformToSelectedItems = (initialOrdering, availableColumnItems, groupMapping) => {
  const orderedSelectedColumnItems = initialOrdering
    .map(({ columnId }) => {
      const groupDef = groupMapping.find((group) => group.columnIds.includes(columnId));
      const groupItem = groupDef
        ? availableColumnItems.find(({ id }) => id === groupDef.id)
        : undefined;
      const selectedItem = groupDef
        ? transformToSelectedGroupItem(initialOrdering, groupItem)
        : findAndCloneInitialTopLevelItem(columnId, availableColumnItems);

      if (selectedItem?.hasLoadMore) delete selectedItem.hasLoadMore;

      return selectedItem;
    })
    .filter((column) => (column?.children ? column?.children.length : column));

  return orderedSelectedColumnItems.length
    ? uniqBy(orderedSelectedColumnItems, (item) => item.id)
    : [];
};

const preventDropInOtherGroup = (...args) => args[2] !== 'nested';

const TableColumnCustomizationModal = ({
  error,
  groupMapping,
  hasLoadMore,
  hasVisibilityToggle,
  i18n,
  initialOrdering,
  isPrimaryButtonDisabled,
  availableColumns,
  loadingMoreIds,
  onChange,
  onClearError,
  onClose,
  onLoadMore,
  onReset,
  onSave: onSaveCallback,
  open,
  overrides,
  pinnedColumnId,
  primaryValue,
  secondaryValue,
  showLoaderInAvailableList,
  showLoaderInSelectedList,
  testId,
}) => {
  const {
    availableColumnsEmptyText,
    availableColumnsLabel,
    cancelButtonLabel,
    clearSearchIconDescription,
    closeIconDescription,
    collapseIconDescription,
    expandIconDescription,
    loadMoreButtonLabel,
    modalTitle,
    modalBody,
    removeIconDescription,
    resetButtonLabel,
    saveButtonLabel,
    searchPlaceholder,
    selectedColumnsEmptyText,
    selectedColumnsLabel,
    hideIconDescription,
    showIconDescription,
  } = merge({}, defaultProps.i18n, i18n);
  const nrOfItemsNotNeedingSearch = 12;

  const availableColumnItems = useMemo(
    () =>
      availableColumns.length
        ? transformToAvailableItems({
            availableColumns,
            pinnedColumnId,
            hasLoadMore,
            groupMapping,
            primaryValueKey: primaryValue,
            secondaryValueKey: secondaryValue,
          })
        : [],
    [availableColumns, pinnedColumnId, hasLoadMore, primaryValue, secondaryValue, groupMapping]
  );

  const [searchValue, setSearchValue] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(
    initialOrdering.filter((col) => col.isHidden).map((col) => col.columnId)
  );
  const [selectedColumnItems, setSelectedColumnItems] = useState(() => {
    return !availableColumnItems.length
      ? []
      : transformToSelectedItems(initialOrdering, availableColumnItems, groupMapping);
  });

  const initialSelectionForAsyncLoadedColumnsRequired = useRef(
    initialOrdering.length && !availableColumnItems.length
  );

  useEffect(() => {
    if (initialSelectionForAsyncLoadedColumnsRequired.current && availableColumnItems.length) {
      initialSelectionForAsyncLoadedColumnsRequired.current = false;
      setSelectedColumnItems(
        transformToSelectedItems(initialOrdering, availableColumnItems, groupMapping)
      );
    }
  }, [initialOrdering, availableColumnItems, groupMapping, selectedColumnItems]);

  const onSave = () => {
    // Column group mapping is not exported as part of save
    // since static group structures are supported but the modifications of
    // groups is currently not.
    const updatedOrdering = selectedColumnItems
      .flatMap((item) => (item.isCategory ? item.children.map(({ id }) => id) : item.id))
      .map((id) => ({ columnId: id, isHidden: hiddenIds.includes(id) }));
    const updatedColumns = updatedOrdering.map(({ columnId }) =>
      availableColumns.find(({ id }) => id === columnId)
    );
    onSaveCallback(updatedOrdering, updatedColumns);
  };

  const handleRemove = useCallback(
    (event, id) => {
      setSelectedColumnItems((previous) => {
        const group = groupMapping.find((selectionGroup) => selectionGroup.columnIds.includes(id));
        return group
          ? handleRemoveWithinGroup(previous, group.id, id)
          : previous.filter((item) => item.id !== id);
      });
      onChange('deselect', id);
    },
    [groupMapping, onChange]
  );

  const handleLoadMore = (id) => {
    onLoadMore(id);
  };

  const selectedItems = useVisibilityToggle({
    handleRemove,
    hasVisibilityToggle,
    hiddenIds,
    hideIconDescription,
    onChange,
    removeIconDescription,
    selectedColumnItems,
    setHiddenIds,
    showIconDescription,
    testId,
  }).map((item) => {
    return item.id === pinnedColumnId
      ? { ...item, disabled: false, content: { ...item.content, rowActions: () => {} } }
      : item;
  });

  const handleAdd = (event, id) => {
    setSelectedColumnItems((prev) => {
      const newItem = findAndCloneItem(id, availableColumnItems);
      const isGroupItem = newItem.isCategory;
      const parentGroup =
        !isGroupItem && groupMapping.find((group) => group.columnIds.includes(id));
      const groupId = isGroupItem ? newItem.id : parentGroup?.id;
      const previousGroupItem = groupId && prev.find((item) => item.id === groupId);

      delete newItem.hasLoadMore;

      const itemToAdd =
        parentGroup && !previousGroupItem
          ? createGroupItem(parentGroup.id, parentGroup.name, [newItem])
          : parentGroup && previousGroupItem
          ? { ...previousGroupItem, children: [...previousGroupItem.children, newItem] }
          : isGroupItem && previousGroupItem
          ? { ...previousGroupItem, children: [...newItem.children] }
          : newItem;

      const insertAtIndex = previousGroupItem ? prev.indexOf(previousGroupItem) : prev.length;
      const deleteCount = groupId ? 1 : 0;
      const prevCopy = [...prev];
      prevCopy.splice(insertAtIndex, deleteCount, itemToAdd);

      return prevCopy;
    });
    onChange('select', id);
  };

  const i18nFooter = {
    primaryButtonLabel: saveButtonLabel,
    secondaryButtonLabel: cancelButtonLabel,
  };

  const allGroupIds = groupMapping.map(({ id }) => id);

  const MyComposedModal = overrides?.composedModal?.component || ComposedModal;
  const MyListBuilder = overrides?.listBuilder?.component || ListBuilder;

  return (
    <MyComposedModal
      className={classNames(`${iotPrefix}--column-customization-modal`, {
        [`${iotPrefix}--column-customization-modal--error-state`]: error,
      })}
      error={error}
      footer={{
        isPrimaryButtonDisabled,
        ...i18nFooter,
      }}
      header={{
        // label is needed since it generates the aria-label,
        // but we hide the actual label element using css
        label: modalTitle,
        title: modalTitle,
        helpText: modalBody,
      }}
      iconDescription={closeIconDescription}
      onClearError={onClearError}
      onClose={onClose}
      onSubmit={onSave}
      open={open}
      testId={testId}
      {...overrides?.composedModal?.props}
    >
      <MyListBuilder
        allDefaultExpandedIds={allGroupIds}
        getAllowedDropIds={
          groupMapping.length
            ? (dragId) => {
                const topLevelItemIsDragged = selectedItems.find(({ id }) => id === dragId);
                return topLevelItemIsDragged
                  ? selectedItems.map(({ id }) => id)
                  : selectedItems
                      .find((item) => item.children?.find(({ id }) => dragId === id))
                      ?.children.map(({ id }) => id);
              }
            : null
        }
        handleLoadMore={handleLoadMore}
        hasItemsSearch={availableColumns.length > nrOfItemsNotNeedingSearch}
        hasSelectedItemsSearch={false}
        hasReset
        i18n={{
          allListEmptyText: availableColumnsEmptyText,
          allListSearchPlaceholderText: searchPlaceholder,
          allListTitle: () => availableColumnsLabel,
          clearSearchIconDescription,
          collapseIconDescription,
          expandIconDescription,
          loadMoreButtonLabel,
          removeIconDescription,
          resetLabel: resetButtonLabel,
          selectedListTitle: () => selectedColumnsLabel,
          selectedListEmptyText: selectedColumnsEmptyText,
        }}
        isLargeRow={!isNil(secondaryValue)}
        items={availableColumnItems}
        itemWillMove={preventDropInOtherGroup}
        itemsSearchValue={searchValue}
        loadingMoreIds={loadingMoreIds}
        lockedIds={[pinnedColumnId]}
        onAdd={handleAdd}
        onSelectedListReordered={(reorderedSelected) => {
          setSelectedColumnItems(reorderedSelected);
          onChange(
            reorderedSelected.flatMap((item) =>
              item.isCategory ? item.children.map(({ id }) => id) : item.id
            )
          );
        }}
        // Called when available items checkboxes are unchecked. The selected items
        // have their own remove callbacks in their actions.
        onRemove={handleRemove}
        onReset={onReset}
        onItemsSearchChange={(value) => {
          setSearchValue(value);
        }}
        removeIcon={CloseOutline}
        selectedItems={selectedItems}
        selectedDefaultExpandedIds={allGroupIds}
        selectedEditingStyle={EditingStyle.Single}
        showLoaderInAvailableList={showLoaderInAvailableList}
        showLoaderInSelectedList={showLoaderInSelectedList}
        testId={`${testId}-list-builder`}
        useCheckboxes
        {...overrides?.listBuilder?.props}
      />
    </MyComposedModal>
  );
};

TableColumnCustomizationModal.propTypes = propTypes;
TableColumnCustomizationModal.defaultProps = defaultProps;
export default TableColumnCustomizationModal;
