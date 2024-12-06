import React from 'react';
import PropTypes from 'prop-types';
import { TableBody, TableCell, TableRow } from '@carbon/react';

import EmptyState from '../../EmptyState';
import { settings } from '../../../constants/Settings';
import deprecate from '../../../internal/deprecate';

const { iotPrefix } = settings;

const propTypes = {
  /** The unique id of the table */
  id: PropTypes.string,
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** set of internationalized labels */
  i18n: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.element])
  ).isRequired,
  totalColumns: PropTypes.number.isRequired,
  /** Empty error state to render */
  errorState: PropTypes.element,
  error: PropTypes.string,
  onErrorStateAction: PropTypes.func,
};

const defaultProps = {
  id: 'ErrorTable',
  testId: 'ErrorTable',
  error: null,
  errorState: null,
  onErrorStateAction: null,
};

const ErrorTable = ({
  id,
  testID,
  testId,
  i18n,
  totalColumns,
  error,
  errorState,
  onErrorStateAction,
}) => (
  <TableBody id={id} data-testid={testID || testId}>
    <TableRow className={`${iotPrefix}--empty-table--table-row`}>
      <TableCell colSpan={totalColumns}>
        <div className="empty-table-cell--default">
          {React.isValidElement(errorState) ? (
            errorState
          ) : (
            <EmptyState
              icon="error"
              title={i18n.tableErrorStateTitle}
              body={error || ''}
              action={
                onErrorStateAction
                  ? {
                      label: i18n.buttonLabelOnTableError,
                      onClick: onErrorStateAction,
                      kind: 'secondary',
                    }
                  : null
              }
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
);

ErrorTable.propTypes = propTypes;
ErrorTable.defaultProps = defaultProps;

export default ErrorTable;
