import React from 'react';
import PropTypes from 'prop-types';
import { TableBody, TableCell, TableRow, SkeletonText } from '@carbon/react';
import classnames from 'classnames';

import { settings } from '../../../constants/Settings';
import deprecate from '../../../internal/deprecate';

const { iotPrefix } = settings;

const propTypes = {
  hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
  hasRowExpansion: PropTypes.bool,
  hasRowNesting: PropTypes.bool,
  hasRowActions: PropTypes.bool,
  rowCount: PropTypes.number,
  /* used to show X number of loading skeletons when columns are unknown */
  columnCount: PropTypes.number,
  columns: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired })),
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** shows an additional column that can expand/shrink as the table is resized  */
  showExpanderColumn: PropTypes.bool,
};

const defaultProps = {
  hasRowSelection: false,
  hasRowExpansion: false,
  hasRowActions: false,
  hasRowNesting: false,
  rowCount: 10,
  columnCount: 5,
  columns: [],
  testId: '',
  showExpanderColumn: false,
};

/** This component is exactly like the DataTableSkeleton component from carbon, but it shows your headers while it loads */
const TableSkeletonWithHeaders = ({
  hasRowSelection,
  hasRowExpansion,
  hasRowActions,
  hasRowNesting,
  columns,
  rowCount,
  columnCount,
  testID,
  testId,
  showExpanderColumn,
}) => {
  const rows = [...Array(rowCount > 0 ? rowCount - 1 : 0)];
  const loadingColumns = columns.length
    ? columns
    : [...Array(columnCount > 0 ? columnCount : 1)].map((c, i) => ({ id: i }));
  return (
    <TableBody data-testid={testID || testId}>
      <TableRow
        className={classnames(`${iotPrefix}--table-skeleton-with-headers--table-row`, {
          [`${iotPrefix}--table-skeleton-with-headers--table-row--head`]: !columns.length,
        })}
      >
        {hasRowSelection === 'multi' ? <TableCell /> : null}
        {hasRowExpansion || hasRowNesting ? <TableCell /> : null}
        {loadingColumns.map((column) => (
          <TableCell key={`skeletonCol-${column.id}`}>
            <SkeletonText />
          </TableCell>
        ))}
        {showExpanderColumn ? (
          <TableCell data-testid={`${testID || testId}-expander-column`} />
        ) : null}
        {hasRowActions ? <TableCell /> : null}
      </TableRow>
      {rows.map((row, rowIndex) => (
        <TableRow
          key={`skeletonRow-${rowIndex}`}
          className={`${iotPrefix}--table-skeleton-with-headers--table-row`}
        >
          {hasRowSelection === 'multi' ? <TableCell /> : null}
          {hasRowExpansion || hasRowNesting ? <TableCell /> : null}
          {loadingColumns.map((v, colIndex) => (
            <TableCell key={`emptycell-${colIndex}`}>
              {rowIndex === 0 && !columns.length ? <SkeletonText /> : null}
            </TableCell>
          ))}
          {showExpanderColumn ? (
            <TableCell
              data-testid={`${testID || testId}-skeletonRow-${rowIndex}-expander-column`}
            />
          ) : null}
          {hasRowActions ? <TableCell /> : null}
        </TableRow>
      ))}
    </TableBody>
  );
};

TableSkeletonWithHeaders.propTypes = propTypes;
TableSkeletonWithHeaders.defaultProps = defaultProps;

export default TableSkeletonWithHeaders;
