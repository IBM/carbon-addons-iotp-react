import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TableToolbarSearch as CarbonTableToolbarSearch } from '@carbon/react';
import classNames from 'classnames';

import { settings } from '../../../constants/Settings';
import {
  handleSpecificKeyDown,
  tableTranslateWithId,
} from '../../../utils/componentUtilityFunctions';
import { TableSearchPropTypes, defaultI18NPropTypes } from '../TablePropTypes';

const { iotPrefix } = settings;

const propTypes = {
  /** id of table */
  tableId: PropTypes.string.isRequired,
  /** global table options */
  options: PropTypes.shape({
    /** If true, search is applied as typed. If false, only after 'Enter' is pressed */
    hasFastSearch: PropTypes.bool,
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
    onApplySearch: PropTypes.func,
    onSearchExpand: PropTypes.func,
  }).isRequired,
  /**
   * Inbound tableState
   */
  tableState: PropTypes.shape({
    /** is the toolbar currently disabled */
    isDisabled: PropTypes.bool,
    search: TableSearchPropTypes,
  }).isRequired,
  testId: PropTypes.string,
  langDir: PropTypes.oneOf(['ltr', 'rtl']),
  tooltipAlignment: PropTypes.oneOf(['start', 'center', 'end']),
};

const defaultProps = {
  i18n: {
    ...defaultI18NPropTypes,
  },
  testId: '',
  langDir: 'ltr',
  tooltipAlignment: 'center',
};

const TableToolbarSearch = ({
  tableId,
  i18n,
  options: { hasFastSearch, hasUserViewManagement },
  actions: { onApplySearch, onSearchExpand },
  tableState: { search: searchProp, isDisabled },
  testId,
  langDir,
  tooltipAlignment,
}) => {
  /* istanbul ignore next */
  const { isExpanded: searchIsExpanded, onExpand, ...search } = searchProp ?? {};

  /**
   * Needed to force update component if search input is cleared from outside of TableToolbar
   * Reference: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
   */
  const [forceRenderCount, setForceRenderCount] = useState(0);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [adjustedTooltipAlignment, setAdjustedTooltipAlignment] = useState(tooltipAlignment);

  useEffect(() => {
    /* istanbul ignore else */
    if (document.activeElement?.tagName === 'INPUT') {
      return;
    }

    setForceRenderCount((prevValue) => prevValue + 1);
  }, [search.defaultValue]);

  /* istanbul ignore next */
  const handleSearchMouseEnter = useCallback(() => {
    setShowSearchTooltip(true);
  }, []);

  /* istanbul ignore next */
  const handleSearchMouseLeave = useCallback(() => {
    setShowSearchTooltip(false);
  }, []);

  return (
    <div className={`${iotPrefix}--table-toolbar__search-wrapper`}>
      <CarbonTableToolbarSearch
        {...search}
        onPointerEnter={handleSearchMouseEnter}
        onPointerLeave={handleSearchMouseLeave}
        key={
          // If hasUserViewManagement is active the whole table is regenerated when a new
          // view is loaded so we probably don't need this key-gen fix to preset a search text.
          // The userViewManagement also needs to be able to set the search.defaultValue
          // while typing without loosing input focus.
          hasUserViewManagement
            ? `table-toolbar-search-${forceRenderCount}`
            : `table-toolbar-search-user-view-${forceRenderCount}`
        }
        defaultValue={search.defaultValue || search.value}
        className="table-toolbar-search"
        translateWithId={(...args) => tableTranslateWithId(i18n, ...args)}
        id={`${tableId}-toolbar-search`}
        onChange={(event, defaultValue) => {
          const value = event?.target?.value || (defaultValue ?? '');
          /* istanbul ignore else */
          if (hasFastSearch) {
            onApplySearch(value);
          }
        }}
        onKeyDown={
          hasFastSearch
            ? undefined
            : handleSpecificKeyDown(['Enter'], (e) => onApplySearch(e.target.value))
        }
        onClear={() => onApplySearch('')}
        onBlur={
          !hasFastSearch
            ? (e, handleExpand) => {
                const { value } = e.target;
                onApplySearch(value);
                if (!value) {
                  handleExpand(e, false);
                }
              }
            : undefined
        }
        disabled={isDisabled}
        // TODO: remove deprecated 'testID' in v3
        data-testid={`${testId}-search`}
        expanded={searchIsExpanded || undefined}
        onExpand={(...args) => {
          /* istanbul ignore if */
          if (onExpand) onExpand(args); // Deprecated callback
          /* istanbul ignore else */
          if (onSearchExpand) onSearchExpand(args);
        }}
      />
      <div
        className={classNames(
          `${iotPrefix}--table-toolbar__search-tooltip`,
          `${iotPrefix}--table-toolbar__search-tooltip--${adjustedTooltipAlignment}`,
          {
            [`${iotPrefix}--table-toolbar__search-tooltip--hide`]: !showSearchTooltip,
          }
        )}
        ref={(node) => {
          /* istanbul ignore if */
          if (node && node.parentNode) {
            const tooltipRect = node.getBoundingClientRect();
            const toolbarRect = node.parentNode.parentNode.getBoundingClientRect();
            /* istanbul ignore else */
            if (
              langDir === 'ltr' &&
              tooltipRect.left + tooltipRect.width > toolbarRect.left + toolbarRect.width
            ) {
              setAdjustedTooltipAlignment('end');
              return;
            }
            /* istanbul ignore if */
            if (langDir === 'rtl' && tooltipRect.left < toolbarRect.left) {
              setAdjustedTooltipAlignment('start');
            }
          }
        }}
      >
        {i18n.toolbarSearchIconDescription}
      </div>
    </div>
  );
};

TableToolbarSearch.propTypes = propTypes;
TableToolbarSearch.defaultProps = defaultProps;

export default TableToolbarSearch;
