import React from 'react';
import { TableCell, SkeletonText } from '@carbon/react';
import PropTypes from 'prop-types';

import { TableColumnsPropTypes } from '../TablePropTypes';
import { HtmlElementRefProp } from '../../../constants/SharedPropTypes';

const propTypes = {
  /** The unique row id */
  id: PropTypes.string.isRequired,
  /** The unique id for the table */
  tableId: PropTypes.string.isRequired,
  /** The unique id for the table test */
  testId: PropTypes.string,
  columns: TableColumnsPropTypes,
  /** since some columns might not be currently visible */
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
  testId: 'skeleton-row',
  columns: [],
  hasRowActions: false,
  hasRowExpansion: false,
  hasRowNesting: false,
  hasRowSelection: false,
  showExpanderColumn: false,
  rowVisibilityRef: undefined,
};

const SkeletonRow = ({
  id,
  tableId,
  testId,
  rowVisibilityRef,
  hasRowActions,
  hasRowExpansion,
  hasRowNesting,
  hasRowSelection,
  showExpanderColumn,
  columns,
}) => {
  return (
    <tr key={`lazy-row-${id}`} ref={rowVisibilityRef} data-testid={`${tableId}-${testId}`}>
      {hasRowSelection === 'multi' ? <TableCell /> : null}
      {hasRowExpansion || hasRowNesting ? <TableCell /> : null}
      {columns.map((v, colIndex) => (
        <TableCell key={`empty-cell-${colIndex}`}>
          <SkeletonText />
        </TableCell>
      ))}
      {showExpanderColumn ? <TableCell /> : null}
      {hasRowActions ? <TableCell /> : null}
    </tr>
  );
};

SkeletonRow.defaultProps = defaultProps;
SkeletonRow.propTypes = propTypes;

export default SkeletonRow;
