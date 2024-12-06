import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Column, Filter, Download, Edit, OverflowMenuVertical } from '@carbon/react/icons';
import {
  TableToolbar as CarbonTableToolbar,
  TableToolbarContent,
  TableBatchActions,
  TableBatchAction,
  OverflowMenuItem,
} from '@carbon/react';
import classnames from 'classnames';
import { useLangDirection } from 'use-lang-direction';
import { isNil, pick } from 'lodash-es';

import { Tooltip } from '../../Tooltip';
import { OverflowMenu } from '../../OverflowMenu';
import Button from '../../Button';
import deprecate from '../../../internal/deprecate';
import {
  TableSearchPropTypes,
  defaultI18NPropTypes,
  ActiveTableToolbarPropType,
  TableColumnsPropTypes,
  TableFiltersPropType,
  TableOrderingPropType,
  TableToolbarActionsPropType,
  TableRowsPropTypes,
  TableSharedOverflowMenuPropTypes,
  TableSharedActionPropTypes,
} from '../TablePropTypes';
import { tableTranslateWithId } from '../../../utils/componentUtilityFunctions';
import { settings } from '../../../constants/Settings';
import { RuleGroupPropType } from '../../RuleBuilder/RuleBuilderPropTypes';
import useDynamicOverflowMenuItems from '../../../hooks/useDynamicOverflowMenuItems';
import { renderTableOverflowItemText } from '../tableUtilities';

import TableToolbarAdvancedFilterFlyout from './TableToolbarAdvancedFilterFlyout';
import TableToolbarSVGButton from './TableToolbarSVGButton';
import TableToolbarSearch from './TableToolbarSearch';

const { iotPrefix } = settings;

const propTypes = {
  /** id of table */
  tableId: PropTypes.string.isRequired,
  secondaryTitle: PropTypes.string,
  tooltip: PropTypes.node,
  /** global table options */
  options: PropTypes.shape({
    hasAdvancedFilter: PropTypes.bool,
    hasAggregations: PropTypes.bool,
    /* option to hide batch action toolbar */
    hasBatchActionToolbar: PropTypes.bool,
    /** If true, search is applied as typed. If false, only after 'Enter' is pressed */
    hasFastSearch: PropTypes.bool,
    hasFilter: PropTypes.bool,
    hasSearch: PropTypes.bool,
    hasColumnSelection: PropTypes.bool,
    hasRowEdit: PropTypes.bool,
    hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
    onApplySearch: PropTypes.func,
    onDownloadCSV: PropTypes.func,
    onApplyAdvancedFilter: PropTypes.func,
    /** Optional boolean to render rowCount in header
     *  NOTE: Deprecated in favor of secondaryTitle for custom use
     */
    hasRowCountInHeader: deprecate(
      PropTypes.bool,
      '\n The prop `hasRowCountInHeader` has been deprecated in favor `secondaryTitle`'
    ),
    // True if use can save/load views
    hasUserViewManagement: PropTypes.bool,
  }).isRequired,
  /** internationalized labels */
  i18n: PropTypes.shape({
    clearAllFilters: PropTypes.string,
    columnSelectionButtonAria: PropTypes.string,
    filterButtonAria: PropTypes.string,
    editButtonAria: PropTypes.string,
    searchLabel: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    batchCancel: PropTypes.string,
    itemsSelected: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    itemSelected: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    filterNone: PropTypes.string,
    filterAscending: PropTypes.string,
    filterDescending: PropTypes.string,
    toggleAggregations: PropTypes.string,
    toolbarLabelAria: PropTypes.string,
    rowCountInHeader: PropTypes.func,
    downloadIconDescription: PropTypes.string,
    /** aria-label applied to the tooltip in the toolbar (if given) */
    toolbarTooltipLabel: PropTypes.string,
    /** button label for batch action overflow menu */
    batchActionsOverflowMenuText: PropTypes.string,
    /** I18N label for search icon in toolbar */
    toolbarSearchIconDescription: PropTypes.string,
  }),
  /**
   * Action callbacks to update tableState
   */
  actions: PropTypes.shape({
    onCancelBatchAction: PropTypes.func,
    onApplyBatchAction: PropTypes.func,
    onClearAllFilters: PropTypes.func,
    onToggleAggregations: PropTypes.func,
    onToggleColumnSelection: PropTypes.func,
    onToggleFilter: PropTypes.func,
    onToggleAdvancedFilter: PropTypes.func,
    onCreateAdvancedFilter: PropTypes.func,
    onChangeAdvancedFilter: PropTypes.func,
    onCancelAdvancedFilter: PropTypes.func,
    onApplyAdvancedFilter: PropTypes.func,
    onShowRowEdit: PropTypes.func,
    onApplySearch: PropTypes.func,
    onDownloadCSV: PropTypes.func,
    onApplyToolbarAction: PropTypes.func,
    onSearchExpand: PropTypes.func,
  }).isRequired,
  /**
   * Inbound tableState
   */
  tableState: PropTypes.shape({
    /** is the toolbar currently disabled */
    isDisabled: PropTypes.bool,
    /** Which toolbar is currently active */
    activeBar: ActiveTableToolbarPropType,
    /** total number of selected rows */
    totalSelected: PropTypes.number,
    totalItemsCount: PropTypes.number,
    advancedFilterFlyoutOpen: PropTypes.bool,
    totalFilters: PropTypes.number,
    filters: TableFiltersPropType,
    columns: TableColumnsPropTypes,
    ordering: TableOrderingPropType,
    /** row selection option */
    hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
    /** optional content to render inside the toolbar  */
    customToolbarContent: PropTypes.node,
    /** available batch actions */
    batchActions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          ...TableSharedActionPropTypes,
          iconDescription: PropTypes.string,
        }),
        PropTypes.shape({
          ...TableSharedOverflowMenuPropTypes,
          iconDescription: PropTypes.string,
        }),
      ])
    ),
    search: TableSearchPropTypes,
    /** buttons to be shown with when activeBar is 'rowEdit' */
    rowEditBarButtons: PropTypes.node,

    /** a stripped down version of the RuleBuilderFilterPropType */
    advancedFilters: PropTypes.arrayOf(
      PropTypes.shape({
        /** Unique id for particular filter */
        filterId: PropTypes.string.isRequired,
        /** Text for main title of page */
        filterTitleText: PropTypes.string.isRequired,
        filterRules: RuleGroupPropType.isRequired,
      })
    ),
    /** currently selected advanced filters */
    selectedAdvancedFilterIds: PropTypes.arrayOf(PropTypes.string),
    /** toolbar actions that can appear in an overflow menu in the toolbar (same menu as toggle aggregations) */
    toolbarActions: TableToolbarActionsPropType,
    /** force hide Clear all filters button in toolbar */
    hideClearAllFiltersButton: PropTypes.bool,
  }).isRequired,
  /** Row value data for the body of the table */
  data: TableRowsPropTypes.isRequired,

  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
};

const defaultProps = {
  i18n: {
    ...defaultI18NPropTypes,
  },
  secondaryTitle: null,
  tooltip: null,
  testId: '',
};

const TableToolbar = ({
  tableId,
  className,
  i18n,
  secondaryTitle,
  tooltip,
  options: {
    hasAdvancedFilter,
    hasAggregations,
    hasColumnSelection,
    hasFastSearch,
    hasFilter,
    hasSearch,
    hasRowSelection,
    hasRowCountInHeader,
    hasRowEdit,
    hasUserViewManagement,
    hasBatchActionToolbar,
  },
  actions: {
    onCancelBatchAction,
    onApplyBatchAction,
    onClearAllFilters,
    onToggleAggregations,
    onToggleColumnSelection,
    onToggleFilter,
    onShowRowEdit,
    onApplySearch,
    onDownloadCSV,
    onApplyAdvancedFilter,
    onCancelAdvancedFilter,
    onCreateAdvancedFilter,
    onChangeAdvancedFilter,
    onToggleAdvancedFilter,
    onApplyToolbarAction,
    onSearchExpand,
  },
  tableState: {
    advancedFilterFlyoutOpen,
    advancedFilters,
    totalSelected,
    totalFilters,
    batchActions,
    search: searchProp,
    activeBar,
    customToolbarContent,
    isDisabled,
    totalItemsCount,
    rowEditBarButtons,
    filters,
    selectedAdvancedFilterIds,
    columns,
    ordering,
    toolbarActions,
    hideClearAllFiltersButton,
  },
  data,
  // TODO: remove deprecated 'testID' in v3
  testID,
  testId,
}) => {
  const shouldShowBatchActions = hasRowSelection === 'multi' && totalSelected > 0;
  const langDir = useLangDirection();

  const [isOpen, setIsOpen, renderToolbarOverflowActions] = useDynamicOverflowMenuItems({
    actions: toolbarActions,
    className: `${iotPrefix}--table-toolbar-aggregations__overflow-menu-content`,
    isDisabled,
    onClick: onApplyToolbarAction,
    testId: testID || testId,
  });

  const actions = useMemo(() => {
    const renderedActions =
      typeof toolbarActions === 'function' ? toolbarActions() : toolbarActions;

    return renderedActions?.length ? renderedActions : [];
  }, [toolbarActions]);

  const hasToolbarOverflowActions =
    actions.filter((action) => action.isOverflow && action.hidden !== true).length > 0;

  const visibleToolbarActions = actions.filter(
    (action) => !action.isOverflow && action.hidden !== true
  );

  const visibleBatchActions = batchActions.filter(
    (action) => !action.isOverflow && action.hidden !== true
  );

  const visibleOverflowBatchActions = batchActions.filter(
    (action) => action.isOverflow && action.hidden !== true
  );

  const hasVisibleBatchActions = visibleBatchActions.length > 0;
  const hasVisibleOverflowBatchActions = visibleOverflowBatchActions.length > 0;

  const totalSelectedText = useMemo(() => {
    if (totalSelected > 1) {
      if (typeof i18n.itemsSelected === 'function') {
        return i18n.itemsSelected(totalSelected);
      }
      return `${totalSelected} ${i18n.itemsSelected}`;
    }
    if (typeof i18n.itemSelected === 'function') {
      return i18n.itemSelected(totalSelected);
    }
    return `${totalSelected} ${i18n.itemSelected}`;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [i18n.itemSelected, i18n.itemsSelected, totalSelected]);

  return (
    <CarbonTableToolbar
      // TODO: remove deprecated 'testID' in v3
      data-testid={testID || testId}
      className={classnames(`${iotPrefix}--table-toolbar`, className)}
      aria-label={i18n.toolbarLabelAria}
    >
      {hasBatchActionToolbar ? (
        <TableBatchActions
          // TODO: remove deprecated 'testID' in v3
          data-testid={`${testID || testId}-batch-actions`}
          className={`${iotPrefix}--table-batch-actions`}
          onCancel={onCancelBatchAction}
          shouldShowBatchActions={shouldShowBatchActions}
          totalSelected={totalSelected}
          translateWithId={(...args) => tableTranslateWithId(i18n, ...args)}
        >
          {hasVisibleBatchActions &&
            visibleBatchActions.map(({ id, labelText, disabled, ...others }) => (
              <TableBatchAction
                key={id}
                onClick={() => onApplyBatchAction(id)}
                tabIndex={shouldShowBatchActions ? 0 : -1}
                disabled={!shouldShowBatchActions || disabled}
                {...others}
              >
                {labelText}
              </TableBatchAction>
            ))}
          {hasVisibleOverflowBatchActions ? (
            <OverflowMenu
              data-testid={`${testID || testId}-batch-actions-overflow-menu`}
              className={`${iotPrefix}--table-overflow-batch-actions`}
              flipped={langDir === 'ltr'}
              direction="bottom"
              onClick={(e) => e.stopPropagation()}
              renderIcon={(props) => <OverflowMenuVertical size={16} {...props} />}
              tabIndex={shouldShowBatchActions ? 0 : -1}
              size="md"
              menuOptionsClass={`${iotPrefix}--table-overflow-batch-actions__menu`}
              withCarbonTooltip
              tooltipPosition="bottom"
              buttonLabel={i18n.batchActionsOverflowMenuText}
            >
              {visibleOverflowBatchActions.map(
                ({
                  id,
                  labelText,
                  disabled,
                  hasDivider,
                  isDelete,
                  renderIcon,
                  iconDescription,
                }) => (
                  <OverflowMenuItem
                    data-testid={`${testID || testId}-batch-actions-overflow-menu-item-${id}`}
                    itemText={renderTableOverflowItemText({
                      action: { renderIcon, labelText: labelText || iconDescription },
                      className: `${iotPrefix}--table-toolbar-aggregations__overflow-menu-content`,
                    })}
                    disabled={!shouldShowBatchActions || disabled}
                    onClick={() => onApplyBatchAction(id)}
                    key={`table-batch-actions-overflow-menu-${id}`}
                    requireTitle={!renderIcon}
                    hasDivider={hasDivider}
                    isDelete={isDelete}
                    aria-label={labelText}
                  />
                )
              )}
            </OverflowMenu>
          ) : null}
        </TableBatchActions>
      ) : null}
      {secondaryTitle ? (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
        <label className={`${iotPrefix}--table-toolbar-secondary-title`}>{secondaryTitle}</label>
      ) : !hasBatchActionToolbar && shouldShowBatchActions ? (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
        <label className={`${iotPrefix}--table-toolbar-secondary-title`}>{totalSelectedText}</label>
      ) : null}
      {
        // Deprecated in favor of secondaryTitle for a more general use-case
        hasRowCountInHeader ? (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
          <label className={`${iotPrefix}--table-toolbar-secondary-title`}>
            {i18n.rowCountInHeader(totalItemsCount)}
          </label>
        ) : null
      }
      {tooltip && (
        <div className={`${iotPrefix}--table-tooltip-container`}>
          <Tooltip
            triggerId={`card-tooltip-trigger-${tableId}`}
            tooltipId={`card-tooltip-${tableId}`}
            triggerText=""
            iconDescription={i18n.toolbarTooltipLabel}
          >
            {tooltip}
          </Tooltip>
        </div>
      )}
      {activeBar === 'rowEdit' ? (
        <div className={`${iotPrefix}--table-row-edit-actions`}>{rowEditBarButtons}</div>
      ) : (
        <TableToolbarContent
          // TODO: remove deprecated 'testID' in v3
          data-testid={`${testID || testId}-content`}
          className={`${iotPrefix}--table-toolbar-content`}
        >
          {hasSearch ? (
            <TableToolbarSearch
              tableId={tableId}
              i18n={i18n}
              options={{
                hasFastSearch,
                hasUserViewManagement,
              }}
              actions={{
                onApplySearch,
                onSearchExpand,
              }}
              tableState={{
                search: searchProp,
                isDisabled,
              }}
              testId={testID || testId}
              langDir={langDir}
            />
          ) : null}
          {totalFilters > 0 && !hideClearAllFiltersButton ? (
            <Button
              kind="secondary"
              onClick={onClearAllFilters}
              disabled={isDisabled}
              testId={`${testId}-clear-filters-button`}
            >
              {i18n.clearAllFilters}
            </Button>
          ) : null}
          {onDownloadCSV ? (
            <TableToolbarSVGButton
              onClick={() => {
                // hand back the filtered data
                onDownloadCSV(data);
              }}
              description={i18n.downloadIconDescription}
              testId="download-button"
              renderIcon={(props) => <Download size={16} {...props} />}
              disabled={isDisabled}
              langDir={langDir}
            />
          ) : null}
          {hasColumnSelection ? (
            <TableToolbarSVGButton
              isActive={activeBar === 'column'}
              onClick={onToggleColumnSelection}
              description={i18n.columnSelectionButtonAria}
              testId="column-selection-button"
              renderIcon={(props) => <Column size={16} {...props} />}
              disabled={isDisabled}
              langDir={langDir}
            />
          ) : null}
          {hasFilter ? (
            <TableToolbarSVGButton
              isActive={activeBar === 'filter'}
              onClick={onToggleFilter}
              description={i18n.filterButtonAria}
              testId="filter-button"
              renderIcon={(props) => <Filter size={16} {...props} />}
              disabled={isDisabled}
              langDir={langDir}
            />
          ) : null}
          {hasAdvancedFilter ? (
            <TableToolbarAdvancedFilterFlyout
              actions={{
                onApplyAdvancedFilter,
                onCancelAdvancedFilter,
                onCreateAdvancedFilter,
                onChangeAdvancedFilter,
                onToggleAdvancedFilter,
              }}
              columns={columns.map((column) => ({
                ...column.filter,
                id: column.id,
                name: column.name,
                isDate: column.filter?.isDate,
                isFilterable: !isNil(column.filter),
                isMultiselect: column.filter?.isMultiselect,
              }))}
              tableState={{
                filters,
                advancedFilters,
                selectedAdvancedFilterIds,
                advancedFilterFlyoutOpen,
                ordering,
                hasFastFilter: hasAdvancedFilter === 'onKeyPress',
                isDisabled,
              }}
              i18n={{
                ...pick(
                  i18n,
                  'filterText',
                  'clearFilterText',
                  'clearSelectionText',
                  'openMenuText',
                  'closeMenuText',
                  'applyButtonText',
                  'cancelButtonText',
                  'advancedFilterLabelText',
                  'createNewAdvancedFilterText',
                  'advancedFilterPlaceholderText',
                  'simpleFiltersTabLabel',
                  'advancedFiltersTabLabel'
                ),
              }}
            />
          ) : null}
          {hasRowEdit ? (
            <TableToolbarSVGButton
              isActive={activeBar === 'rowEdit'}
              description={i18n.editButtonAria}
              onClick={onShowRowEdit}
              testId="row-edit-button"
              renderIcon={(props) => <Edit size={16} {...props} />}
              disabled={isDisabled}
              langDir={langDir}
            />
          ) : null}
          {visibleToolbarActions.map((action) => {
            return (
              <TableToolbarSVGButton
                isActive={action.isActive}
                description={action.labelText || action.iconDescription}
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyToolbarAction(action);
                }}
                testId={`${tableId}-toolbar-actions-button-${action.id}`}
                key={`${tableId}-toolbar-actions-button-${action.id}`}
                renderIcon={action.renderIcon}
                disabled={isDisabled || action.disabled}
                langDir={langDir}
              />
            );
          })}
          {hasAggregations || hasToolbarOverflowActions ? (
            <OverflowMenu
              className={`${iotPrefix}--table-toolbar-aggregations__overflow-menu`}
              direction="bottom"
              flipped={langDir === 'ltr'}
              data-testid="table-head--overflow"
              onClick={(e) => e.stopPropagation()}
              renderIcon={(props) => <OverflowMenuVertical size={16} {...props} />}
              iconClass={`${iotPrefix}--table-toolbar-aggregations__overflow-icon`}
              onOpen={() => setIsOpen(true)}
              onClose={() => setIsOpen(false)}
              withCarbonTooltip
              tooltipPosition="bottom"
            >
              {hasAggregations && (
                <OverflowMenuItem
                  data-testid={`${testID || testId}-toolbar-overflow-menu-item-aggregations`}
                  itemText={i18n.toggleAggregations}
                  key="table-aggregations-overflow-item"
                  onClick={() => {
                    setIsOpen(false);
                    onToggleAggregations();
                  }}
                  disabled={isDisabled}
                />
              )}
              {isOpen && renderToolbarOverflowActions()}

              {
                /**
                 * a placeholder node to ensure the menu will always open. If there are no children,
                 * the renderToolbarOverflowAction method above will never fire, because the
                 * OverflowMenu doesn't open properly if no children are provided.
                 */
                !isOpen && <OverflowMenuItem itemText="" disabled />
              }
            </OverflowMenu>
          ) : null}
          {
            // Default card header actions should be to the right of the table-specific actions
            customToolbarContent || null
          }
        </TableToolbarContent>
      )}
    </CarbonTableToolbar>
  );
};

TableToolbar.propTypes = propTypes;
TableToolbar.defaultProps = defaultProps;

export default TableToolbar;
