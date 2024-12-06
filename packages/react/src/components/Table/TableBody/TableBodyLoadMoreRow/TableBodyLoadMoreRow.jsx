import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@carbon/react';

import { settings } from '../../../../constants/Settings';
import Button from '../../../Button';
import SkeletonRow from '../SkeletonRow';
import { TableColumnsPropTypes } from '../../TablePropTypes';
import { HtmlElementRefProp } from '../../../../constants/SharedPropTypes';

const { iotPrefix } = settings;

const propTypes = {
  /** The unique row id */
  id: PropTypes.string.isRequired,
  /** The unique id for the table */
  tableId: PropTypes.string.isRequired,
  /** The unique id for the table test */
  testId: PropTypes.string.isRequired,
  /**  total columns has the overall total */
  totalColumns: PropTypes.number.isRequired,
  columns: TableColumnsPropTypes,
  /** call back function for when load more row is clicked */
  onRowLoadMore: PropTypes.func.isRequired,
  /** I18N label for load more */
  loadMoreText: PropTypes.string.isRequired,
  /** boolean to decide if is in loading state or not */
  isLoadingMore: PropTypes.bool.isRequired,
  hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
  hasRowExpansion: PropTypes.bool,
  hasRowNesting: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      /** If the hierarchy only has 1 nested level of children */
      hasSingleNestedHierarchy: PropTypes.bool,
    }),
  ]),
  hasRowActions: PropTypes.bool,
  /** shows an additional column that can expand/shrink as the table is resized  */
  showExpanderColumn: PropTypes.bool,
  rowVisibilityRef: HtmlElementRefProp,
};

const defaultProps = {
  columns: [],
  hasRowActions: false,
  hasRowExpansion: false,
  hasRowNesting: false,
  hasRowSelection: false,
  showExpanderColumn: false,
  rowVisibilityRef: undefined,
};

const TableBodyLoadMoreRow = ({
  id,
  tableId,
  testId,
  rowVisibilityRef,
  onRowLoadMore,
  loadMoreText,
  hasRowActions,
  hasRowExpansion,
  hasRowNesting,
  hasRowSelection,
  showExpanderColumn,
  columns,
  totalColumns,
  isLoadingMore,
}) => {
  return isLoadingMore ? (
    <SkeletonRow
      id={id}
      columns={columns}
      rowVisibilityRef={rowVisibilityRef}
      tableId={tableId}
      testId={testId}
      hasRowActions={hasRowActions}
      hasRowExpansion={hasRowExpansion}
      hasRowNesting={hasRowNesting}
      hasRowSelection={hasRowSelection}
      showExpanderColumn={showExpanderColumn}
    />
  ) : (
    <TableRow isSelected={false}>
      <TableCell
        key={`${tableId}-${id}-row-load-more-cell`}
        colSpan={totalColumns}
        className={`${iotPrefix}--load-more-cell`}
        data-testid={`${testId}-${id}-load-more`}
      >
        <Button
          className={`${iotPrefix}--load-more-cell--content`}
          onClick={() => onRowLoadMore(id)}
          kind="ghost"
          loading={isLoadingMore}
        >
          {loadMoreText}
        </Button>
      </TableCell>
    </TableRow>
  );
};

TableBodyLoadMoreRow.defaultProps = defaultProps;
TableBodyLoadMoreRow.propTypes = propTypes;

export default TableBodyLoadMoreRow;
