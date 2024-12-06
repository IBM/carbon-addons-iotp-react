import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SkeletonText, Checkbox } from '@carbon/react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { VariableSizeList } from 'react-window';

import { settings } from '../../../constants/Settings';
import ListItem from '../ListItem/ListItem';
import EmptyState from '../../EmptyState';
import Button from '../../Button';
import { EditingStyle, editingStyleIsMultiple } from '../../../utils/DragAndDropUtils';
import { ListItemPropTypes } from '../ListPropTypes';
import { useResize } from '../../../internal/UseResizeObserver';
import { HtmlElementRefProp } from '../../../constants/SharedPropTypes';

import {
  ITEM_COLUMN_GAP,
  ITEM_HEIGHT,
  ITEM_HEIGHT_LARGE,
  ITEM_LEVEL_OFFSET,
} from './listConstants';

const { iotPrefix } = settings;

const propTypes = {
  /** content shown if list is empty */
  emptyState: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  /** content shown if list is empty on search */
  emptySearchState: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  /** i18n strings */
  i18n: PropTypes.shape({
    searchPlaceHolderText: PropTypes.string,
    expand: PropTypes.string,
    close: PropTypes.string,
    loadMore: PropTypes.string,
  }),
  /** data source of list items */
  items: PropTypes.arrayOf(PropTypes.shape(ListItemPropTypes)),
  /** if true shows empty search state, instead of empty state, when there are no search results */
  isFiltering: PropTypes.bool,
  /** use full height in list */
  // eslint-disable-next-line consistent-return
  isFullHeight: (props, propName, componentName) => {
    if (__DEV__) {
      /* istanbul ignore else */
      if (props[propName] === true) {
        return new Error(
          `${componentName}: Using '${propName}' with 'isVirtualList' could have negative performance consequences. Using the them together is discouraged.`
        );
      }
    }
  },
  /** use large/fat row in list */
  isLargeRow: PropTypes.bool,
  /** optional skeleton to be rendered while loading data */
  isLoading: PropTypes.bool,
  /** true if the list should have multiple selectable rows using checkboxes */
  isCheckboxMultiSelect: PropTypes.bool,
  testId: PropTypes.string,
  /** Multiple currently selected items */
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  /** ids of row expanded */
  expandedIds: PropTypes.arrayOf(PropTypes.string),
  /** callback used to limit which items that should get drop targets rendered.
   * receives the id of the item that is being dragged and returns a list of ids. */
  getAllowedDropIds: PropTypes.func,
  /** call back function of select */
  handleSelect: PropTypes.func,
  /** call back function of expansion */
  toggleExpansion: PropTypes.func,
  /** callback function for reorder */
  onItemMoved: PropTypes.func,
  /** callback function when reorder will occur - can cancel the move by returning false */
  itemWillMove: PropTypes.func,
  /** call back function for when load more row is clicked  (rowId) => {} */
  handleLoadMore: PropTypes.func,
  /** ids of selectable rows with indeterminate selection state */
  indeterminateIds: PropTypes.arrayOf(PropTypes.string),
  /** RowIds for rows currently loading more child rows */
  loadingMoreIds: PropTypes.arrayOf(PropTypes.string),
  /** the ids of locked items that cannot be reordered */
  lockedIds: PropTypes.arrayOf(PropTypes.string),
  /** list editing style */
  editingStyle: PropTypes.oneOf([
    EditingStyle.Single,
    EditingStyle.Multiple,
    EditingStyle.SingleNesting,
    EditingStyle.MultipleNesting,
  ]),
  /** icon can be left or right side of list row primary value */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  virtualListRef: HtmlElementRefProp,
};

const defaultProps = {
  editingStyle: null,
  emptyState: 'No list items to show',
  emptySearchState: 'No results found',
  expandedIds: [],
  getAllowedDropIds: null,
  handleLoadMore: () => {},
  handleSelect: () => {},
  i18n: {
    searchPlaceHolderText: 'Enter a value',
    expand: 'Expand',
    close: 'Close',
    loadMore: 'View more...',
  },
  iconPosition: 'left',
  isFiltering: false,
  isFullHeight: false,
  isLargeRow: false,
  isLoading: false,
  isCheckboxMultiSelect: false,
  items: [],
  itemWillMove: () => {
    return true;
  },
  indeterminateIds: [],
  loadingMoreIds: [],
  lockedIds: [],
  onItemMoved: () => {},
  selectedIds: [],
  testId: 'list',
  toggleExpansion: () => {},
  virtualListRef: undefined,
};

const getAdjustedNestingLevel = (items, currentLevel) =>
  items.some((item) => item?.children && item.children.length > 0)
    ? currentLevel + 1
    : currentLevel;

const VirtualListContent = ({
  editingStyle,
  emptyState,
  emptySearchState,
  expandedIds,
  handleLoadMore,
  handleSelect,
  i18n,
  iconPosition,
  indeterminateIds,
  isFiltering,
  isFullHeight,
  isLargeRow,
  isLoading,
  isCheckboxMultiSelect,
  items,
  itemWillMove,
  getAllowedDropIds,
  loadingMoreIds,
  lockedIds,
  onItemMoved,
  selectedIds,
  testId,
  toggleExpansion,
  virtualListRef: virtualListRefProp,
}) => {
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const rowSize = isLargeRow ? ITEM_HEIGHT_LARGE : ITEM_HEIGHT;
  const [listHeight, setListHeight] = useState(0);
  const listOuterRef = useResize(useRef(null));
  const didScrollRef = useRef(false);
  const internalVirtualListRef = useRef(null);
  const virtualListRef = virtualListRefProp || internalVirtualListRef;

  const renderLoadMore = (item, isLoadingMore, level, style) => {
    const indentation = `${level * ITEM_LEVEL_OFFSET - ITEM_COLUMN_GAP}px`;
    return isLoadingMore ? (
      <div
        style={style}
        key={`${item.id}-list-item-load-more`}
        className={`${iotPrefix}--list-item`}
      >
        <div
          style={{
            width: indentation,
          }}
        />
        <SkeletonText
          className={`${iotPrefix}--list--load-more-skeleton`}
          width="30%"
          data-testid={`${testId}-loading-more`}
        />
      </div>
    ) : (
      <Button
        key={`${item.id}-list-item-load-more`}
        className={`${iotPrefix}--list-item ${iotPrefix}--load-more-row`}
        onClick={() => handleLoadMore(item.id)}
        data-testid={`${testId}-${item.id}-load-more`}
        kind="ghost"
        style={style}
      >
        <div
          style={{
            width: indentation,
          }}
        />
        <div className={`${iotPrefix}--load-more-row--content`}>{mergedI18n.loadMore}</div>
      </Button>
    );
  };

  const flatten = useCallback(
    (initialItems, parentId = null, currentLevel = 0) => {
      return initialItems.reduce((carry, item) => {
        let tmp = carry;
        const isExpanded = expandedIds.filter((rowId) => rowId === item.id).length > 0;
        const parentIsExpanded = expandedIds.some((rowId) => parentId === rowId);

        if (parentId === null || isExpanded || parentIsExpanded) {
          tmp = carry.concat({
            ...item,
            parentId,
            level: currentLevel,
          });
        }

        if (isExpanded && item.children) {
          tmp = tmp.concat(flatten(item.children, item.id, currentLevel + 1));

          if (item.hasLoadMore && isExpanded) {
            tmp = tmp.concat([
              {
                ...item,
                parentId: item.id,
                level: currentLevel,
                isLoadMoreRow: true,
              },
            ]);
          }
        }

        if (!item.children && item.hasLoadMore) {
          tmp = tmp.concat([
            {
              ...item,
              level: currentLevel,
              isLoadMoreRow: true,
            },
          ]);
        }

        return tmp;
      }, []);
    },
    [expandedIds]
  );

  const flattenHelper = useCallback(() => {
    const flattenedItems = flatten(items);
    const parents = flattenedItems.filter(
      (item) =>
        item.level === 0 || expandedIds.includes(item.id) || expandedIds.includes(item.parentId)
    ).length;

    return {
      flattenedItems,
      parents,
    };
  }, [expandedIds, flatten, items]);

  const [flattened, setFlattened] = useState(() => {
    const { flattenedItems, parents } = flattenHelper();

    return {
      items: flattenedItems,
      parents,
      height: parents * rowSize,
    };
  });

  useEffect(() => {
    if (virtualListRef.current) {
      virtualListRef.current.resetAfterIndex(0);
    }
  }, [expandedIds, flattened, virtualListRef, rowSize]);

  useEffect(() => {
    const { flattenedItems, parents } = flattenHelper();

    setFlattened({
      items: flattenedItems,
      parents,
      height: parents * rowSize,
    });
  }, [flattenHelper, rowSize]);

  const renderItemAndChildren = (item, index, parentId, level, style) => {
    const hasChildren = item?.children && item.children.length > 0;
    const isSelected = selectedIds.some((id) => item.id === id);
    const isExpanded = expandedIds.filter((rowId) => rowId === item.id).length > 0;
    const isLoadingMore = loadingMoreIds.includes(item.id);
    const isLocked = lockedIds.includes(item.id);
    const isIndeterminate = indeterminateIds.includes(item.id);
    const parentIsExpanded = expandedIds.filter((rowId) => rowId === item.parentId).length > 0;

    const {
      content: { value, secondaryValue, icon, rowActions, tags },
      isSelectable,
      isCategory,
      disabled,
    } = item;

    if (item.isLoadMoreRow) {
      if (parentIsExpanded || item.level === 0) {
        const loadMoreLevel = parentIsExpanded ? level + 1 : level;
        return renderLoadMore(item, isLoadingMore, loadMoreLevel, style);
      }

      return null;
    }

    return [
      <div
        key={`${item.id}-list-item-parent-${level}-${value}`}
        className={`${iotPrefix}--list-item-parent`}
        style={style}
      >
        <ListItem
          id={item.id}
          index={index}
          key={`${item.id}-list-item-${level}-${value}`}
          nestingLevel={item?.children && item.children.length > 0 ? level - 1 : level}
          value={value}
          icon={
            editingStyleIsMultiple(editingStyle) || (isSelectable && isCheckboxMultiSelect) ? (
              <Checkbox
                id={`${item.id}-checkbox`}
                name={item.value}
                data-testid={`${item.id}-checkbox`}
                labelText=""
                onChange={() => handleSelect(item.id, parentId)}
                onClick={(event) => {
                  // This is needed as a workaround for a carbon checkbox bug
                  // https://github.com/carbon-design-system/carbon/issues/10122#issuecomment-984692702
                  event.stopPropagation();
                }}
                checked={isSelected}
                disabled={disabled || isLocked}
                indeterminate={isIndeterminate}
              />
            ) : (
              icon
            )
          }
          disabled={disabled}
          iconPosition={iconPosition}
          editingStyle={isLocked ? null : editingStyle}
          secondaryValue={secondaryValue}
          rowActions={rowActions}
          onSelect={() => handleSelect(item.id, parentId)}
          onExpand={toggleExpansion}
          onItemMoved={onItemMoved}
          itemWillMove={itemWillMove}
          getAllowedDropIds={getAllowedDropIds}
          selected={isSelected}
          expanded={isExpanded}
          isExpandable={hasChildren}
          isLargeRow={isLargeRow}
          isLocked={isLocked}
          isCategory={isCategory}
          isSelectable={editingStyle === null && isSelectable}
          i18n={mergedI18n}
          tags={tags}
          preventRowFocus={isCheckboxMultiSelect}
        />
      </div>,
    ];
  };

  const getItemSize = (index) => {
    const item = flattened?.items?.[index];

    if (!item) {
      return 0;
    }

    const isExpanded = expandedIds.filter((rowId) => rowId === item.parentId).length > 0;

    if (item.isLoadMoreRow && (isExpanded || item.level === 0)) {
      return ITEM_HEIGHT;
    }

    if (!item.parentId || isExpanded) {
      return rowSize;
    }

    return 0;
  };

  // eslint-disable-next-line react/prop-types
  const ListRow = ({ index, style }) => {
    const item = flattened?.items?.[index];

    if (!item || !item?.content) {
      return null;
    }

    const isExpanded =
      expandedIds.filter((rowId) => rowId === item.id || rowId === item.parentId).length > 0;

    if (item.parentId && !isExpanded) {
      return null;
    }

    return renderItemAndChildren(
      item,
      index,
      item.parentId,
      getAdjustedNestingLevel(items, item.level),
      style
    );
  };

  const renderEmptyContent = () => {
    const emptyContent = isFiltering ? emptySearchState : emptyState;
    return typeof emptyContent === 'string' ? (
      <div
        className={classnames(`${iotPrefix}--list--empty-state`, {
          [`${iotPrefix}--list--empty-state__full-height`]: isFullHeight,
        })}
      >
        <EmptyState icon={isFiltering ? 'no-result' : 'empty'} title={emptyContent} body="" />
      </div>
    ) : (
      emptyContent
    );
  };

  const handleItemsRendered = useCallback(() => {
    const parentList = listOuterRef.current.closest(`.${iotPrefix}--list`);
    if (parentList) {
      const rect = parentList.getBoundingClientRect();
      const { height } = rect;
      setListHeight(height);
    }

    if (didScrollRef.current === false && selectedIds?.length > 0 && virtualListRef.current) {
      const selectedIndex = flattened.items.findIndex((item) => item.id === selectedIds[0]);
      if (selectedIndex >= 0) {
        virtualListRef.current.scrollToItem(selectedIndex, 'start');
        didScrollRef.current = true;
      }
    }
  }, [flattened.items, listOuterRef, selectedIds, virtualListRef]);

  if (!isLoading && flattened.items.length) {
    return (
      <VariableSizeList
        ref={virtualListRef}
        itemCount={flattened.items.length}
        height={isFullHeight ? flattened.height : Math.min(listHeight, flattened.height)}
        itemSize={getItemSize}
        className={classnames(
          `${iotPrefix}--list--content`,
          `${iotPrefix}--list--content--virtual`,
          {
            // If FullHeight, the content's overflow shouldn't be hidden
            [`${iotPrefix}--list--content__full-height`]: isFullHeight,
          }
        )}
        outerRef={listOuterRef}
        style={{
          overflow: isFullHeight ? 'unset' : 'auto',
        }}
        onItemsRendered={handleItemsRendered}
      >
        {ListRow}
      </VariableSizeList>
    );
  }
  return (
    <div
      className={classnames(
        {
          // If FullHeight, the content's overflow shouldn't be hidden
          [`${iotPrefix}--list--content__full-height`]: isFullHeight,
        },
        `${iotPrefix}--list--content`
      )}
    >
      {isLoading ? (
        <SkeletonText
          className={`${iotPrefix}--list--skeleton`}
          width="90%"
          data-testid={`${testId}-loading`}
        />
      ) : (
        renderEmptyContent()
      )}
    </div>
  );
};

VirtualListContent.propTypes = propTypes;
VirtualListContent.defaultProps = defaultProps;

export default VirtualListContent;
