import React from 'react';
import PropTypes from 'prop-types';
import { TableBody, TableCell, TableRow } from '@carbon/react';

import EmptyState from '../../EmptyState';
import { settings } from '../../../constants/Settings';
import { EmptyStatePropTypes } from '../TablePropTypes';
import deprecate from '../../../internal/deprecate';

const { iotPrefix } = settings;

const propTypes = {
  /** The unique id of the table */
  id: PropTypes.string,
  /** Empty state to render, either a custom element or an object */
  emptyState: EmptyStatePropTypes.isRequired,
  totalColumns: PropTypes.number.isRequired,
  isFiltered: PropTypes.bool.isRequired,
  onEmptyStateAction: PropTypes.func,
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  /** icon to display while no data in table */
  emptyStateIcon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf(['error', 'error404', 'empty', 'not-authorized', 'no-result', 'success', '']),
  ]),
};

const defaultProps = {
  id: 'EmptyTable',
  onEmptyStateAction: null,
  testId: '',
  emptyStateIcon: '',
};

const EmptyTable = ({
  id,
  totalColumns,
  isFiltered,
  emptyState,
  onEmptyStateAction,
  emptyState: {
    messageWithFilters,
    message,
    buttonLabel,
    buttonLabelWithFilters,
    messageBody,
    messageWithFiltersBody,
  },
  // TODO: remove deprecated 'testID' in v3
  testID,
  testId,
  emptyStateIcon,
}) => {
  return (
    <TableBody
      id={`${id}-empty-table`}
      // TODO: remove deprecated 'testID' in v3
      data-testid={testID || testId}
    >
      <TableRow className={`${iotPrefix}--empty-table--table-row`}>
        <TableCell colSpan={totalColumns}>
          {React.isValidElement(emptyState) ? (
            emptyState
          ) : (
            <div className="empty-table-cell--default">
              {isFiltered ? (
                <EmptyState
                  icon="no-result"
                  title={messageWithFilters}
                  body={messageWithFiltersBody || ''}
                  action={
                    onEmptyStateAction
                      ? {
                          label: buttonLabelWithFilters,
                          onClick: onEmptyStateAction,
                          kind: 'secondary',
                        }
                      : null
                  }
                />
              ) : (
                <EmptyState
                  icon={emptyStateIcon !== '' ? emptyStateIcon : 'empty'}
                  title={message}
                  body={messageBody || ''}
                  action={
                    onEmptyStateAction
                      ? {
                          label: buttonLabel,
                          onClick: onEmptyStateAction,
                        }
                      : null
                  }
                />
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
EmptyTable.propTypes = propTypes;
EmptyTable.defaultProps = defaultProps;

export default EmptyTable;
