import React, { useMemo } from 'react';
import { SkeletonText, Checkbox } from '@carbon/react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash-es';

import { settings } from '../../../constants/Settings';
import ListItem from '../ListItem/ListItem';
import EmptyState from '../../EmptyState';
import Button from '../../Button';
import { EditingStyle, editingStyleIsMultiple } from '../../../utils/DragAndDropUtils';
import { ListItemPropTypes } from '../ListPropTypes';
import { HtmlElementRefProp } from '../../../constants/SharedPropTypes';
import { ITEM_COLUMN_GAP, ITEM_LEVEL_OFFSET } from '../VirtualListContent/listConstants';
import { usePrevious } from '../../../hooks/usePrevious';

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
  isFullHeight: PropTypes.bool,
  /** use large/fat row in list */
  isLargeRow: PropTypes.bool,
  /** optional skeleton to be rendered while loading data */
  isLoading: PropTypes.bool,
  /** the ids of locked items that cannot be reordered */
  lockedIds: PropTypes.arrayOf(PropTypes.string),
  /** true if the list should have multiple selectable rows using checkboxes */
  isCheckboxMultiSelect: PropTypes.bool,
  testId: PropTypes.string,
  /** Multiple currently selected items */
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  /** ids of row expanded */
  expandedIds: PropTypes.arrayOf(PropTypes.string),
  /** callback function of select */
  handleSelect: PropTypes.func,
  /** callback used to limit which items that should get drop targets rendered.
   * receives the id of the item that is being dragged and returns a list of ids. */
  getAllowedDropIds: PropTypes.func,
  /** call back function of expansion */
  toggleExpansion: PropTypes.func,
  /** callback function for reorder */
  onItemMoved: PropTypes.func,
  /** callback function when reorder will occur - can cancel the move by returning false */
  itemWillMove: PropTypes.func,
  /** callback function for when load more row is clicked  (rowId) => {} */
  handleLoadMore: PropTypes.func,
  /** ids of selectable rows with indeterminate selection state */
  indeterminateIds: PropTypes.arrayOf(PropTypes.string),
  /** RowIds for rows currently loading more child rows */
  loadingMoreIds: PropTypes.arrayOf(PropTypes.string),
  /** list editing style */
  editingStyle: PropTypes.oneOf([
    EditingStyle.Single,
    EditingStyle.Multiple,
    EditingStyle.SingleNesting,
    EditingStyle.MultipleNesting,
  ]),
  /** icon can be left or right side of list row primary value */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  selectedItemRef: HtmlElementRefProp,
  /** called after the row has expanded or collapsed and is passed the array of expanded ids */
  onExpandedChange: PropTypes.func,
  /** enables horizontal scrollbar to appear if content is wider then container */
  enableHorizontalScrollbar: PropTypes.bool,
};

const ConditionalWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

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
  selectedItemRef: React.createRef(),
  testId: 'list',
  toggleExpansion: () => {},
  onExpandedChange: null,
  enableHorizontalScrollbar: false,
};

const getAdjustedNestingLevel = (items, currentLevel) =>
  items.some((item) => item?.children && item.children.length > 0)
    ? currentLevel + 1
    : currentLevel;

const ListContent = ({
  isLoading,
  isCheckboxMultiSelect,
  isFiltering,
  isFullHeight,
  items,
  testId,
  emptyState,
  emptySearchState,
  selectedIds,
  expandedIds,
  indeterminateIds,
  loadingMoreIds,
  handleSelect,
  editingStyle,
  getAllowedDropIds,
  iconPosition,
  toggleExpansion,
  onItemMoved,
  itemWillMove,
  isLargeRow,
  lockedIds,
  handleLoadMore,
  i18n,
  selectedItemRef,
  onExpandedChange,
  enableHorizontalScrollbar,
}) => {
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const renderLoadMore = (item, isLoadingMore, level) => {
    const indentation = `${level * ITEM_LEVEL_OFFSET - ITEM_COLUMN_GAP}px`;
    return isLoadingMore ? (
      <div key={`${item.id}-list-item-load-more`} className={`${iotPrefix}--list-item`}>
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

  const renderItemAndChildren = (item, index, parentId, level) => {
    const hasChildren = item?.children && item.children.length > 0;
    const isSelected = selectedIds.some((id) => item.id === id);
    const isExpanded = expandedIds.filter((rowId) => rowId === item.id).length > 0;
    const isLoadingMore = loadingMoreIds.includes(item.id);
    const isLocked = lockedIds.includes(item.id);
    const isIndeterminate = indeterminateIds.includes(item.id);

    const {
      content: { value, title, secondaryValue, icon, rowActions, tags },
      isSelectable,
      isCategory,
      disabled,
    } = item;

    return [
      <div
        key={`${item.id}-list-item-parent-${level}-${value}`}
        // data-floating-menu-container is a work around for this carbon issue: https://github.com/carbon-design-system/carbon/issues/4755
        data-floating-menu-container
        className={`${iotPrefix}--list-item-parent`}
      >
        <ListItem
          id={item.id}
          index={index}
          key={`${item.id}-list-item-${level}-${value}`}
          nestingLevel={item?.children && item.children.length > 0 ? level - 1 : level}
          title={title}
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
          selectedItemRef={isSelected ? selectedItemRef : null}
          tags={tags}
          preventRowFocus={isCheckboxMultiSelect}
        />
      </div>,
      ...(hasChildren && isExpanded
        ? item.children
            .map((child, nestedIndex) => {
              return renderItemAndChildren(child, nestedIndex, item.id, level + 1);
            })
            .concat(item.hasLoadMore ? [renderLoadMore(item, isLoadingMore, level + 1)] : [])
        : []),
      ...(!hasChildren && item.hasLoadMore ? [renderLoadMore(item, isLoadingMore, level)] : []),
    ];
  };
  const previousExpandedIds = usePrevious(expandedIds, expandedIds);
  const selectionChanged = !isEqual(expandedIds, previousExpandedIds);
  // get the lastId of the diff between previous and current, this handles closes
  const previousLastId =
    selectionChanged && previousExpandedIds.filter((id) => !expandedIds.includes(id)).slice(-1)[0];
  // get the lastId of the diff between current and previous, this handles opens
  const lastId =
    selectionChanged && expandedIds.filter((id) => !previousExpandedIds.includes(id)).slice(-1)[0];

  const notifyOnLastExpansionChange = (itemId) => {
    const isLastItem = lastId === itemId || previousLastId === itemId;
    if (isLastItem && expandedIds.includes(itemId) !== previousExpandedIds.includes(itemId)) {
      // the setTimeout within the request animation frame helps to ensure the event is fired
      // immediately after a repaint. See:
      // https://firefox-source-docs.mozilla.org/performance/bestpractices.html#how-do-i-avoid-triggering-uninterruptible-reflow
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          onExpandedChange(expandedIds);
        });
      }, 0);
    }
  };

  const listItems = items.map((item, index) => {
    notifyOnLastExpansionChange(item.id);
    return renderItemAndChildren(item, index, null, getAdjustedNestingLevel(items, 0));
  });

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

  return (
    <div
      className={classnames(
        {
          // If FullHeight, the content's overflow shouldn't be hidden
          [`${iotPrefix}--list--content__full-height`]: isFullHeight,
          [`${iotPrefix}--list--content--w-horizontal-scrollbar`]: enableHorizontalScrollbar,
        },
        `${iotPrefix}--list--content`
      )}
    >
      <ConditionalWrapper
        condition={isFullHeight && enableHorizontalScrollbar}
        wrapper={(children) => (
          <div className={`${iotPrefix}--list--content__full-height__support`}>{children}</div>
        )}
      >
        <ConditionalWrapper
          condition={enableHorizontalScrollbar}
          wrapper={(children) => (
            <div className={`${iotPrefix}--list--content__scrollbar__support`}>{children}</div>
          )}
        >
          {!isLoading ? (
            <>{listItems.length ? listItems : renderEmptyContent()}</>
          ) : (
            <SkeletonText
              className={`${iotPrefix}--list--skeleton`}
              width="90%"
              data-testid={`${testId}-loading`}
            />
          )}
        </ConditionalWrapper>
      </ConditionalWrapper>
    </div>
  );
};

ListContent.propTypes = propTypes;
ListContent.defaultProps = defaultProps;

export default ListContent;
