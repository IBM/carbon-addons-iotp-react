import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash-es';
import update from 'immutability-helper';

import Button from '../../Button/Button';
import ComposedModal from '../../ComposedModal/ComposedModal';
import { settings } from '../../../constants/Settings';
import { TableColumnsPropTypes, TableSortPropType } from '../TablePropTypes';
import { DragAndDrop } from '../../../utils/DragAndDropUtils';

import { TableMultiSortRow } from './TableMultiSortRow';

const { iotPrefix, prefix } = settings;

const propTypes = {
  columns: TableColumnsPropTypes.isRequired,
  ordering: PropTypes.arrayOf(
    PropTypes.shape({
      columnId: PropTypes.string.isRequired,
      /* Visibility of column in table, defaults to false */
      isHidden: PropTypes.bool,
    })
  ).isRequired,
  actions: PropTypes.shape({
    onAddMultiSortColumn: PropTypes.func,
    onRemoveMultiSortColumn: PropTypes.func,
    onSaveMultiSortColumns: PropTypes.func,
    onCancelMultiSortColumns: PropTypes.func,
    onClearMultiSortColumns: PropTypes.func,
  }).isRequired,
  sort: PropTypes.oneOfType([TableSortPropType, PropTypes.arrayOf(TableSortPropType)]).isRequired,
  showMultiSortModal: PropTypes.bool,
  i18n: PropTypes.shape({
    multiSortModalTitle: PropTypes.string,
    multiSortModalPrimaryLabel: PropTypes.string,
    multiSortModalSecondaryLabel: PropTypes.string,
    multiSortModalClearLabel: PropTypes.string,
    multiSortSelectColumnLabel: PropTypes.string,
    multiSortSelectColumnSortByTitle: PropTypes.string,
    multiSortSelectColumnThenByTitle: PropTypes.string,
    multiSortDirectionLabel: PropTypes.string,
    multiSortDirectionTitle: PropTypes.string,
    multiSortAddColumn: PropTypes.string,
    multiSortRemoveColumn: PropTypes.string,
    multiSortAscending: PropTypes.string,
    multiSortDescending: PropTypes.string,
    multiSortCloseModal: PropTypes.string,
    multiSortOpenMenu: PropTypes.string,
    multiSortCloseMenu: PropTypes.string,
    multiSortDragHandle: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  showMultiSortModal: false,
  i18n: {
    multiSortModalTitle: 'Select columns to sort',
    multiSortModalPrimaryLabel: 'Sort',
    multiSortModalSecondaryLabel: 'Cancel',
    multiSortModalClearLabel: 'Clear sorting',
    multiSortSelectColumnLabel: 'Select a column',
    multiSortSelectColumnSortByTitle: 'Sort by',
    multiSortSelectColumnThenByTitle: 'Then by',
    multiSortDirectionLabel: 'Select a direction',
    multiSortDirectionTitle: 'Sort order',
    multiSortAddColumn: 'Add column',
    multiSortRemoveColumn: 'Remove column',
    multiSortAscending: 'Ascending',
    multiSortDescending: 'Descending',
    multiSortCloseModal: 'Close',
    multiSortDragHandle: 'Drag handle',
  },
  testId: 'multi-sort-modal',
};

/**
 * Simple helper function to turn the sort object into an array and filter empty values from it
 * @param {Array|Object} sort A sort object or an array of sort objects
 * @returns Array
 */
const cleanSortArray = (sort) => {
  const sortArray = Array.isArray(sort) ? sort : sort !== undefined ? [sort] : [];

  return sortArray.filter(({ columnId }) => columnId);
};

const TableMultiSortModal = ({
  columns,
  ordering,
  sort,
  actions,
  showMultiSortModal,
  i18n,
  testId,
}) => {
  const {
    onAddMultiSortColumn,
    onRemoveMultiSortColumn,
    onSaveMultiSortColumns,
    onCancelMultiSortColumns,
    onClearMultiSortColumns,
  } = actions;

  const sortHelper = useCallback(() => {
    const sortArray = cleanSortArray(sort);

    if (!sortArray.length) {
      return [
        {
          columnId: '',
          direction: 'ASC',
        },
      ];
    }

    return sortArray;
  }, [sort]);

  const [selectedMultiSortColumns, setSelectedMultiSortColumns] = useState(sortHelper);

  useEffect(() => {
    setSelectedMultiSortColumns(sortHelper);
  }, [sort, sortHelper]);

  const sortDirections = useMemo(
    () => [
      {
        id: 'ASC',
        label: i18n.multiSortAscending,
      },
      {
        id: 'DESC',
        label: i18n.multiSortDescending,
      },
    ],
    [i18n.multiSortAscending, i18n.multiSortDescending]
  );

  const handleSelectMultiSortColumn = (index) => (event) => {
    const columnId = event.target.value;
    setSelectedMultiSortColumns((prev) => {
      const currentItem = prev[index];
      return Object.assign([], prev, {
        [index]: {
          ...currentItem,
          columnId,
        },
      });
    });
  };

  const handleSelectMultiSortColumnDirection = (index) => (event) => {
    const direction = event.target.value;
    setSelectedMultiSortColumns((prev) => {
      const currentItem = prev[index];
      return Object.assign([], prev, {
        [index]: {
          ...currentItem,
          direction,
        },
      });
    });
  };

  const multiSortColumns = useMemo(() => {
    return columns
      .filter(({ id, isSortable }) => {
        const orderCol = ordering.find(({ columnId }) => columnId === id);

        return isSortable && !orderCol.isHidden;
      })
      .map((col) => {
        const columnAlreadySorted =
          selectedMultiSortColumns.find(({ columnId }) => columnId === col.id) !== undefined;
        return { id: col.id, name: col.name, disabled: columnAlreadySorted };
      });
  }, [columns, ordering, selectedMultiSortColumns]);

  const getInitialSelectedColumn = (columnId) => {
    const selectedColumn = columns.find((col) => {
      return col.id === columnId;
    });

    return selectedColumn || multiSortColumns.filter((col) => !col.disabled)[0];
  };

  const getInitialSelectedDirection = (direction) => {
    const selectedDirection = sortDirections.find((dir) => {
      return dir.id === direction;
    });

    return selectedDirection || sortDirections[0];
  };

  const handleAddMultiSortColumn = (index) => () => {
    setSelectedMultiSortColumns((prev) => {
      const clone = [...prev];

      let nextColumnIndex = 0;
      // If the default column is in the first position, set it before adding the next column
      if (clone.length === 1 && Object.keys(clone[0]).length === 0) {
        clone.splice(index, 1, {
          columnId: multiSortColumns.filter((col) => !col.disabled)[nextColumnIndex]?.id,
          direction: 'ASC',
        });
        nextColumnIndex = 1;
      }

      clone.splice(index + 1, 0, {
        columnId: multiSortColumns.filter((col) => !col.disabled)[nextColumnIndex]?.id,
        direction: 'ASC',
      });
      return clone;
    });

    onAddMultiSortColumn(index);
  };

  const handleRemoveMultiSortColumn = (index) => () => {
    setSelectedMultiSortColumns((prev) => prev.filter((c, i) => i !== index));

    onRemoveMultiSortColumn(index);
  };

  const handleSaveMultiSortColumns = () => {
    // if empty strings were passed for columnId or direction
    // the dropdown will show the first available column and direction,
    // but if they save without performing a change, the initial state
    // is empty, so we perform a check to ensure the defaults are saved
    const defaulted = selectedMultiSortColumns.map(({ columnId, direction }) => {
      const column = getInitialSelectedColumn(columnId);
      const dir = getInitialSelectedDirection(direction);
      return {
        columnId: columnId || column.id,
        direction: direction || dir.id,
      };
    });

    if (!isEqual(selectedMultiSortColumns, defaulted)) {
      setSelectedMultiSortColumns(defaulted);
    }

    onSaveMultiSortColumns(defaulted);
  };

  const handleCancelMultiSortColumns = () => {
    setSelectedMultiSortColumns(cleanSortArray(sort));
    onCancelMultiSortColumns();
  };

  const handleClearMultiSortColumns = () => {
    setSelectedMultiSortColumns([]);
    onClearMultiSortColumns();
  };

  const onMoveRow = useCallback((dragIndex, hoverIndex) => {
    setSelectedMultiSortColumns((prev) => {
      const row = prev[dragIndex];
      return update(prev, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, row],
        ],
      });
    });
  }, []);

  return (
    <ComposedModal
      selectorPrimaryFocus={`.${prefix}--modal-header`}
      testId={testId}
      className={`${iotPrefix}--table-multi-sort-modal`}
      header={{
        title: i18n.multiSortModalTitle,
      }}
      iconDescription={i18n.multiSortCloseModal}
      onClose={handleCancelMultiSortColumns}
      footer={
        <div className={`${iotPrefix}--table-multi-sort-modal__footer`}>
          <Button
            kind="ghost"
            onClick={handleClearMultiSortColumns}
            testId={`${testId}-modal-clear-button`}
          >
            {i18n.multiSortModalClearLabel}
          </Button>
          <div />
          <Button
            kind="secondary"
            onClick={handleCancelMultiSortColumns}
            testId={`${testId}-modal-secondary-button`}
          >
            {i18n.multiSortModalSecondaryLabel}
          </Button>
          <Button
            kind="primary"
            onClick={handleSaveMultiSortColumns}
            testId={`${testId}-modal-primary-button`}
            data-modal-primary-focus
          >
            {i18n.multiSortModalPrimaryLabel}
          </Button>
        </div>
      }
      open={showMultiSortModal}
    >
      <DragAndDrop>
        {selectedMultiSortColumns.map(({ columnId, direction }, index) => {
          const defaultColumn = getInitialSelectedColumn(columnId);
          const defaultDirection = getInitialSelectedDirection(direction);
          return (
            <TableMultiSortRow
              key={`${columnId}-${direction}`}
              columnId={columnId || defaultColumn?.id}
              defaultColumnId={defaultColumn?.id}
              defaultDirectionId={defaultDirection?.id}
              i18n={i18n}
              index={index}
              multiSortColumns={multiSortColumns}
              numSelectedColumns={selectedMultiSortColumns?.length}
              onAddMultiSortColumn={handleAddMultiSortColumn(index)}
              onMoveRow={onMoveRow}
              onRemoveMultiSortColumn={handleRemoveMultiSortColumn(index)}
              onSelectMultiSortColumn={handleSelectMultiSortColumn(index)}
              onSelectMultiSortColumnDirection={handleSelectMultiSortColumnDirection(index)}
              sortDirections={sortDirections}
              testId={testId}
            />
          );
        })}
      </DragAndDrop>
    </ComposedModal>
  );
};

TableMultiSortModal.propTypes = propTypes;
TableMultiSortModal.defaultProps = defaultProps;

export default TableMultiSortModal;
