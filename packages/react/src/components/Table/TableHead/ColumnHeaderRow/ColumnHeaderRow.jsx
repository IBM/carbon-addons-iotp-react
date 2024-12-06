import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TableHeader, TableRow, Button } from '@carbon/react';
import { Settings } from '@carbon/react/icons';

import { settings } from '../../../../constants/Settings';
import { defaultFunction } from '../../../../utils/componentUtilityFunctions';
import { defaultI18NPropTypes } from '../../TablePropTypes';
import ColumnHeaderSelect from '../ColumnHeaderSelect/ColumnHeaderSelect';
import { DragAndDrop } from '../../../../utils/DragAndDropUtils';

const { iotPrefix } = settings;

class ColumnHeaderRow extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    ordering: PropTypes.arrayOf(
      PropTypes.shape({
        columnId: PropTypes.string.isRequired,
        /* Visibility of column in table, defaults to false */
        isHidden: PropTypes.bool,
      })
    ).isRequired,
    options: PropTypes.shape({
      hasRowSelection: PropTypes.oneOf(['multi', 'single', false]),
      hasRowExpansion: PropTypes.bool,
      hasColumnSelectionConfig: PropTypes.bool,
      hasRowActions: PropTypes.bool,
    }).isRequired,
    onChangeOrdering: PropTypes.func.isRequired,
    onColumnToggle: PropTypes.func.isRequired,
    onColumnSelectionConfig: PropTypes.func,
    columnSelectionConfigText: PropTypes.string,
    isDisabled: PropTypes.bool,
    testId: PropTypes.string,
    /** shows an additional column that can expand/shrink as the table is resized  */
    showExpanderColumn: PropTypes.bool.isRequired,
    /** Set to true if the table support drag and drop. Inserts a cell in the "darg handle" column
     * for spacing. */
    hasDragAndDrop: PropTypes.bool,
  };

  static defaultProps = {
    onColumnSelectionConfig: defaultFunction('actions.table.onColumnSelectionConfig'),
    columnSelectionConfigText: defaultI18NPropTypes.columnSelectionConfig,
    isDisabled: false,
    testId: '',
    hasDragAndDrop: false,
  };

  reorderColumn = (srcIndex, destIndex) => {
    const { ordering, onChangeOrdering } = this.props;

    ordering.splice(destIndex, 0, ordering.splice(srcIndex, 1)[0]);

    onChangeOrdering(ordering);
  };

  toggleColumn = (id) => {
    const { ordering, onColumnToggle } = this.props;
    onColumnToggle(
      id,
      ordering.map((i) => ({
        columnId: i.columnId,
        isHidden: i.columnId === id ? !i.isHidden : i.isHidden,
      }))
    );
  };

  render() {
    const {
      columns,
      ordering,
      options: { hasRowSelection, hasRowExpansion, hasRowActions, hasColumnSelectionConfig },
      onColumnSelectionConfig,
      columnSelectionConfigText,
      isDisabled,
      testId,
      showExpanderColumn,
      hasDragAndDrop,
    } = this.props;

    const visibleColumns = columns.filter(
      (c) => !(ordering.find((o) => o.columnId === c.id) || { isHidden: false }).isHidden
    );
    return (
      <DragAndDrop>
        <TableRow data-testid={testId} className={`${iotPrefix}--column-header-row--table-row`}>
          {hasDragAndDrop ? (
            <TableHeader className={`${iotPrefix}--column-header-row--table-header`} />
          ) : null}
          {hasRowSelection === 'multi' ? (
            <TableHeader className={`${iotPrefix}--column-header-row--table-header`} />
          ) : null}
          {hasRowExpansion ? (
            <TableHeader className={`${iotPrefix}--column-header-row--table-header`} />
          ) : null}
          <TableHeader
            className={`${iotPrefix}--column-header-row--table-header`}
            colSpan={visibleColumns.length + (hasRowActions ? 1 : 0) + (showExpanderColumn ? 1 : 0)}
            scope="col"
          >
            <div className={`${iotPrefix}--column-header-row--select-wrapper`}>
              {ordering.map((c, idx) => (
                <ColumnHeaderSelect
                  key={`${idx}-item`}
                  index={idx}
                  columnId={c.columnId}
                  isHidden={c.isHidden}
                  moveItem={(srcIndex, destIndex) => this.reorderColumn(srcIndex, destIndex)}
                  onClick={() => this.toggleColumn(c.columnId)}
                  isDisabled={isDisabled}
                >
                  {columns.find((i) => c.columnId === i.id).name}
                </ColumnHeaderSelect>
              ))}
            </div>
            {hasColumnSelectionConfig ? (
              <Button
                disabled={isDisabled}
                className="column-header__btn"
                kind="ghost"
                size="sm"
                renderIcon={Settings}
                onClick={() => onColumnSelectionConfig()}
              >
                {columnSelectionConfigText}
              </Button>
            ) : null}
          </TableHeader>
        </TableRow>
      </DragAndDrop>
    );
  }
}

export { ColumnHeaderRow as UnconnectedColumnHeaderRow };
export default ColumnHeaderRow;
