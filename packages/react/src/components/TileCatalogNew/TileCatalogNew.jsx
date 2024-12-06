import React, { useState } from 'react';
import { Select, SelectItem, TableToolbarSearch, SkeletonText, Tile } from '@carbon/react';
import { Bee } from '@carbon/react/icons';
import PropTypes from 'prop-types';

import { settings } from '../../constants/Settings';

import TilePagination from './TilePagination/TilePagination';

const { iotPrefix } = settings;

const propTypes = {
  /** Title for the product */
  title: PropTypes.string,
  /** Min width of each tile if no col/row nums are specified */
  minTileWidth: PropTypes.string,
  /** Number of columns to be rendered per page */
  numColumns: PropTypes.number,
  /** Number of rows to be rendered per page */
  numRows: PropTypes.number,
  /** A collection of tiles to to rendered  */
  tiles: PropTypes.arrayOf(PropTypes.node),
  /** Set to true if a search is needed */
  hasSearch: PropTypes.bool,
  /** Call back function of search */
  onSearch: PropTypes.func,
  /** Set to true if sorting is needed */
  hasSort: PropTypes.bool,
  /** Call back function of sort */
  onSort: PropTypes.func,
  /** Options in sort */
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  /** Default option in sort */
  selectedSortOption: PropTypes.string,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Error state */
  error: PropTypes.string,
  /** Set to true if filter is needed */
  i18n: PropTypes.shape({
    placeHolderText: PropTypes.string,
    error: PropTypes.string,
    searchPlaceHolderText: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  title: '',
  hasSort: false,
  hasSearch: false,
  onSearch: () => {},
  onSort: () => {},
  sortOptions: [],
  selectedSortOption: '',
  isLoading: false,
  error: '',
  minTileWidth: null,
  numColumns: 3,
  numRows: 3,
  i18n: {
    searchPlaceHolderText: 'Enter a value',
    error: 'An error has occurred. Please make sure your catalog has content.',
  },
  tiles: [],
  testId: 'tile-catalog-new',
};

const TileCatalogNew = ({
  title,
  minTileWidth,
  numColumns,
  numRows,
  tiles,
  hasSearch,
  onSearch,
  hasSort,
  onSort,
  sortOptions,
  selectedSortOption,
  isLoading,
  error,
  i18n,
  className,
  testId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // determine how many tiles to render per page
  const isInCurrentPageRange = (i) =>
    i < numColumns * numRows * currentPage && i >= numColumns * numRows * (currentPage - 1);

  const renderGrid = () => (
    <div
      data-testid={`${testId}-grid`}
      className={`${iotPrefix}--tile-catalog--grid-container`}
      style={{
        '--columns': minTileWidth
          ? // if the user specifies a minTileWidth, we will render all tiles on one responsive page
            `repeat(auto-fill, minmax(${minTileWidth}, 1fr))`
          : // if the user specifies numColumns we will render exactly that number
            `repeat(${numColumns}, 1fr)`,
      }}
    >
      {tiles.map((tile, i) =>
        isLoading ? (
          i < 4 ? ( // limit the amount of SkeletonText to render
            <SkeletonText key={`${iotPrefix}--tile-catalog--grid-${i}`} />
          ) : null
        ) : minTileWidth || isInCurrentPageRange(i) ? (
          <div key={`${iotPrefix}--tile-catalog--grid-${i}`}>{tile}</div>
        ) : null
      )}
    </div>
  );

  // only render pagination if there is no minTileWidth and there are more tiles than can fit in
  // the bounds of our specified number of rows and columns
  const hasPagination =
    !minTileWidth && !isLoading ? Math.ceil(tiles.length / (numRows * numColumns)) > 1 : null;

  return (
    <div data-testid={testId} className={className}>
      <div className={`${iotPrefix}--tile-catalog--canvas-container`}>
        <div className={`${iotPrefix}--tile-catalog--tile-canvas`}>
          {/* {featuredTile ? (
            <div>
              <div className="tile-catalog--tile-canvas--featured-tile-title">
                {featuredTileTitle}
              </div>
              <div className="tile-catalog--tile-canvas--featured-tile">{featuredTile}</div>
            </div>
          ) : null} */}
          <div
            data-testid={`${testId}-header`}
            className={`${iotPrefix}--tile-catalog--tile-canvas--header`}
          >
            {title ? (
              <div
                data-testid={`${testId}-title`}
                className={`${iotPrefix}--tile-catalog--tile-canvas--header--title`}
              >
                {title}
              </div>
            ) : null}
            {hasSearch ? (
              <TableToolbarSearch
                placeholder={i18n.searchPlaceHolderText}
                onChange={onSearch}
                size="md"
                className={`${iotPrefix}--tile-catalog--tile-canvas--header--search`}
                data-testid={`${testId}-search-input`}
              />
            ) : null}
            <div className={`${iotPrefix}--tile-catalog--tile-canvas--header--select`}>
              {hasSort ? (
                <Select
                  id={`${iotPrefix}--tile-catalog--tile-canvas--header--select`}
                  onChange={(evt) => onSort(evt.target.value)}
                  defaultValue={selectedSortOption}
                  labelText=""
                  data-testid={`${testId}-sort-select`}
                  role="listbox"
                >
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} text={option.text} value={option.id} />
                  ))}
                </Select>
              ) : null}
            </div>
          </div>
          {tiles.length > 0 && !error ? (
            <div className={`${iotPrefix}--tile-catalog--tile-canvas--content`}>{renderGrid()}</div>
          ) : (
            <Tile
              data-testid={`${testId}-empty`}
              className={`${iotPrefix}--tile-catalog--empty-tile`}
            >
              <>
                <Bee size={32} />
                <p>{error || i18n.error}</p>
              </>
            </Tile>
          )}

          <div className={`${iotPrefix}--tile-catalog--tile-canvas--bottom`}>
            {hasPagination ? (
              <TilePagination
                page={currentPage}
                numPages={Math.ceil(tiles.length / (numRows * numColumns))}
                onChange={(newPage) => setCurrentPage(newPage)}
                testId={`${testId}-pagination`}
              />
            ) : null}
          </div>
        </div>
        {/* {hasFilter ? (
          <div className="tile-catalog--filter">
            <div className="tile-catalog--filter--title">Refined results</div>
            <div className="tile-catalog--filter--content">
              {filter.selectFilter}
              {filter.checkboxFilter}
            </div>
          </div>
        ) : null} */}
      </div>
    </div>
  );
};

TileCatalogNew.propTypes = propTypes;
TileCatalogNew.defaultProps = defaultProps;

export default TileCatalogNew;
