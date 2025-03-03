import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash-es';
import update from 'immutability-helper';
import { RadioButton, RadioButtonGroup, Toggle, NumberInput, Layer } from '@carbon/react';

import { settings } from '../../../../../constants/Settings';
import { Dropdown } from '../../../../Dropdown';
import { TableCardPropTypes } from '../../../../../constants/CardPropTypes';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: TableCardPropTypes.content,
  }),
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    rowsPerPage: PropTypes.string,
    sortBy: PropTypes.string,
    sortByDataItem: PropTypes.string,
    ascending: PropTypes.string,
    descending: PropTypes.string,
    showHeader: PropTypes.string,
    allowNavigation: PropTypes.string,
  }),
  /** Callback function to translate common ids */
  translateWithId: PropTypes.func.isRequired,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    rowsPerPage: 'Rows per page',
    sortBy: 'Sort by',
    sortByTitle: 'Sort by data item',
    ascending: 'Ascending',
    descending: 'Descending',
    showHeader: 'Show table header',
    allowNavigation: 'Allow navigation to assets',
    maximumDataPoints: 'Maximum data points',
  },
  availableDimensions: {},
};

/**
 * Helper function to update the column sort
 * @param {array} columns existing array of columns
 * @param {*} columnDataSourceId
 * @param {*} sortDirection
 * @returns {array} newColumns returned with updated sort
 */
export const updateColumnSort = (columns, sortDataSourceId, sortDirection) => {
  const existingColumnSort = columns.find((col) => col.sort);
  if (
    sortDataSourceId === existingColumnSort?.dataSourceId &&
    sortDirection !== existingColumnSort?.sort
  ) {
    // update existing column sort to the new sort direction
    return update(columns, {
      $splice: [
        [columns.findIndex((col) => col.sort), 1, { ...existingColumnSort, sort: sortDirection }],
      ],
    });
  }
  // Is it a new column sort?
  if (sortDataSourceId !== existingColumnSort?.dataSourceId) {
    const newColumnToSort = columns.find((col) => col.dataSourceId === sortDataSourceId);
    return update(columns, {
      $splice: [
        // if I have an existing Column, I need to clear the sort
        ...(existingColumnSort
          ? [
              [
                columns.findIndex((col) => col.sort),
                1,
                { ...existingColumnSort, sort: undefined }, // clear the existing sort
              ],
            ]
          : [[]]),
        [
          // update the new column with the new sort direction
          columns.findIndex((col) => col.dataSourceId === sortDataSourceId),
          1,
          { ...newColumnToSort, sort: sortDirection },
        ],
      ],
    });
  }
  // otherwise don't sort anything
  return columns;
};

/**
 * Stateless render component that renders the current settings panel based on the inbound cardConfig prop
 * and calls onChange with the updated cardConfig object every time the user interacts with the form
 */
const TableCardFormSettings = ({ cardConfig, onChange, i18n, translateWithId }) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const { content, id } = cardConfig;

  const baseClassName = `${iotPrefix}--card-edit-form`;
  const dataItems = useMemo(
    () =>
      Array.isArray(content?.columns) ? content?.columns.map((column) => column.dataSourceId) : [],
    [content]
  );

  // figure out if a column has been updated to be the default sort column
  const defaultSortColumn = useMemo(
    () => (Array.isArray(content?.columns) ? content.columns.find((col) => col.sort) : null),
    [content]
  );

  // updates the sort based on the direction
  const handleSortColumn = useCallback(
    (sortDirection) =>
      onChange(
        update(cardConfig, {
          content: {
            columns: {
              $set: updateColumnSort(
                cardConfig?.content?.columns,
                defaultSortColumn?.dataSourceId,
                sortDirection
              ),
            },
          },
        })
      ),
    [cardConfig, defaultSortColumn, onChange]
  );

  return (
    <>
      {!isEmpty(cardConfig?.content?.columns) ? (
        <>
          <div className={`${baseClassName}--input`}>
            <Dropdown
              id={`${id}_sort_by_dropdown`}
              titleText={mergedI18n.sortBy}
              direction="bottom"
              label={mergedI18n.sortBy}
              items={dataItems}
              light
              translateWithId={translateWithId}
              selectedItem={defaultSortColumn?.dataSourceId}
              onChange={({ selectedItem }) => {
                const existingColumn = cardConfig?.content?.columns.find(
                  (col) => col.dataSourceId === selectedItem
                );
                // default the sort for the newly selected field
                onChange(
                  update(cardConfig, {
                    content: {
                      columns: {
                        $set: updateColumnSort(
                          cardConfig?.content?.columns,
                          selectedItem,
                          existingColumn?.type === 'TIMESTAMP' ? 'DESC' : 'ASC'
                        ),
                      },
                    },
                  })
                );
              }}
            />
          </div>
          <div className={`${baseClassName}--input`}>
            <RadioButtonGroup
              name={`${baseClassName}--input-radios`}
              onChange={(evt) => handleSortColumn(evt)}
              orientation="vertical"
              legend={`${mergedI18n.descending}`}
              labelPosition="right"
              valueSelected={defaultSortColumn?.sort}
            >
              <RadioButton
                data-testid={`${baseClassName}--input-radio1`}
                value="DESC"
                id={`${baseClassName}--input-radio-1`}
                labelText={mergedI18n.descending}
              />
              <RadioButton
                data-testid={`${baseClassName}--input-radio2`}
                value="ASC"
                id={`${baseClassName}--input-radio-2`}
                labelText={mergedI18n.ascending}
              />
            </RadioButtonGroup>
          </div>
        </>
      ) : null}
      <div className={`${baseClassName}--input`}>
        <Layer>
          <NumberInput
            id={`${id}_maximum_data_points`}
            label={mergedI18n.maximumDataPoints}
            step={10}
            min={0}
            onChange={(event, { value }) => {
              const maximumDataPoints = Number.parseInt(value, 10);
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, maximumDataPoints },
              });
            }}
            value={content?.maximumDataPoints}
          />
        </Layer>
      </div>
      <div className={`${baseClassName}--input`}>
        <div className={`${baseClassName}--input--toggle-field`}>
          <span>{mergedI18n.showHeader}</span>
          <Toggle
            size="sm"
            data-testid={`${baseClassName}--input-toggle1`}
            id={`${baseClassName}--input-toggle-1`}
            aria-label={mergedI18n.showHeader}
            labelA=""
            labelB=""
            toggled={cardConfig.content?.showHeader}
            onToggle={(bool) =>
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, showHeader: bool },
              })
            }
          />
        </div>
      </div>
      <div className={`${baseClassName}--input`}>
        <div className={`${baseClassName}--input--toggle-field`}>
          <span>{mergedI18n.allowNavigation}</span>
          <Toggle
            size="sm"
            data-testid={`${baseClassName}--input-toggle2`}
            id={`${baseClassName}--input-toggle-2`}
            aria-label={mergedI18n.allowNavigation}
            labelA=""
            labelB=""
            toggled={cardConfig.content?.allowNavigation}
            onToggle={(bool) =>
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, allowNavigation: bool },
              })
            }
          />
        </div>
      </div>
    </>
  );
};

TableCardFormSettings.propTypes = propTypes;
TableCardFormSettings.defaultProps = defaultProps;

export default TableCardFormSettings;
