import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { TableCell, TableRow } from '@carbon/react';
import classnames from 'classnames';

import { settings } from '../../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  options: PropTypes.shape({
    hasRowExpansion: PropTypes.bool,
    hasRowSelection: PropTypes.oneOf(['multi', 'single', false]), // TODO: don't duplicate this one
    hasRowActions: PropTypes.bool,
    hasRowNesting: PropTypes.bool,
  }),
  tableState: PropTypes.shape({
    aggregations: PropTypes.shape({
      label: PropTypes.string,
      columns: PropTypes.arrayOf(
        PropTypes.shape({
          /** id of the column that should have its values aggregated */
          id: PropTypes.string.isRequired,
          /** the value to be displayed */
          value: PropTypes.string,
          /** allow aligning the results the same as the column */
          align: PropTypes.oneOf(['start', 'center', 'end']),
          /** allows the aggregation to align with sortable columns extra padding */
          isSortable: PropTypes.bool,
        })
      ),
    }),
    /** TODO: Move this prop out and reuse in TableHead */
    /** What column ordering is currently applied to the table */
    ordering: PropTypes.arrayOf(
      PropTypes.shape({
        columnId: PropTypes.string.isRequired,
        isHidden: PropTypes.bool,
      })
    ).isRequired,
  }).isRequired,
  testId: PropTypes.string,
  showExpanderColumn: PropTypes.bool,
};

const defaultProps = {
  options: {},
  testId: 'table-foot',
  showExpanderColumn: false,
};

const TableFoot = ({
  testId,
  options: { hasRowExpansion, hasRowSelection, hasRowActions, hasRowNesting },
  tableState: { aggregations, ordering },
  showExpanderColumn,
}) => {
  const visibleColumns = ordering.filter((col) => !col.isHidden);

  const hasMultiSelect = hasRowSelection === 'multi';
  const hasExpandOrNest = hasRowExpansion || hasRowNesting;
  const labelColSpan =
    hasMultiSelect && hasExpandOrNest ? 3 : hasExpandOrNest || hasMultiSelect ? 2 : 1;

  return (
    <tfoot className={`${iotPrefix}-table-foot`} data-testid={testId}>
      <TableRow key="aggregate-row">
        {visibleColumns.map((orderedCol, index) => {
          const aggregated = aggregations.columns.find((col) => orderedCol.columnId === col.id);
          const isLabelCell = !aggregated && index === 0;
          const cellTestId = `${testId}-aggregation-${orderedCol.columnId}`;
          const cellKey = `${orderedCol.columnId}${index}`;

          return isLabelCell ? (
            <TableCell
              className={`${iotPrefix}-table-foot--label`}
              data-testid={cellTestId}
              key={cellKey}
              colSpan={labelColSpan}
            >
              {aggregations.label}
            </TableCell>
          ) : aggregated ? (
            <Fragment key={`aggregated-cell-fragment-${index}`}>
              {index === 0 && (hasMultiSelect || hasExpandOrNest) ? (
                <TableCell colSpan={hasMultiSelect && hasExpandOrNest ? 2 : 1} />
              ) : null}
              <TableCell
                className={classnames({
                  [`${iotPrefix}-table-foot--value`]: true,
                  'data-table-end': aggregated.align === 'end',
                  'data-table-start': !aggregated.align || aggregated.align === 'start',
                  'data-table-center': aggregated.align === 'center',
                  [`${iotPrefix}-table-foot--value__sortable`]: aggregated.isSortable,
                })}
                align={aggregated.align ? aggregated.align : undefined}
                data-testid={cellTestId}
                key={cellKey}
              >
                {aggregated.value}
              </TableCell>
            </Fragment>
          ) : (
            <TableCell data-testid={cellTestId} key={cellKey}>
              &nbsp;
            </TableCell>
          );
        })}
        {hasRowActions ? <TableCell /> : null}
        {showExpanderColumn ? <TableCell data-testid={`${testId}-expander-column`} /> : null}
      </TableRow>
    </tfoot>
  );
};

TableFoot.propTypes = propTypes;
TableFoot.defaultProps = defaultProps;

export default TableFoot;
