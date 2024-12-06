import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { RadioTile, Tile, SkeletonText, TableToolbarSearch } from '@carbon/react';
import { Bee } from '@carbon/react/icons';
import classnames from 'classnames';

import SimplePagination from '../SimplePagination/SimplePagination';
import { settings } from '../../constants/Settings';
import deprecate from '../../internal/deprecate';

import TileGroup from './TileGroup';

const { iotPrefix } = settings;

export const propTypes = {
  /** Is the data actively loading? */
  isLoading: PropTypes.bool,
  /** error loading the tile catalog */
  error: PropTypes.string,
  pagination: PropTypes.shape({
    pageSize: PropTypes.number,
    pageText: PropTypes.string,
    /** Gets called back with arguments (page, maxPage) */
    pageOfPagesText: PropTypes.func,
    nextPageText: PropTypes.string,
    prevPageText: PropTypes.string,
    onPage: PropTypes.func,
    /** current page number */
    page: PropTypes.number,
    totalItems: PropTypes.number,
  }),

  /** We will callback with the search value */
  search: PropTypes.shape({
    placeHolderText: deprecate(
      PropTypes.string,
      '\n The prop `placeHolderText` has been deprecated in favor `placeholder`'
    ),
    placeholder: PropTypes.string,
    noMatchesFoundText: PropTypes.string,
    /** current search value */
    value: PropTypes.string,
    onSearch: PropTypes.func,
  }),

  /** form id */
  id: PropTypes.string.isRequired,
  /** title displayed above the catalog */
  title: PropTypes.node,
  /** tiles describes what to render */
  tiles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      /**  the values field is searched by the search widget */
      values: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
      /** renderContent is called back with the full value object and id to render */
      renderContent: PropTypes.func,
      className: PropTypes.string,
    })
  ).isRequired,
  /** Callbacks */
  onSelection: PropTypes.func.isRequired,
  /** currently selected tile id */
  selectedTileId: PropTypes.string,

  testId: PropTypes.string,
};

const defaultProps = {
  isLoading: false,
  title: null,
  error: null,
  pagination: null,
  search: null,
  selectedTileId: null,
  testId: 'tile-catalog',
};

/**
 * Renders a searchable and pageable catalog of RadioTiles from carbon. Couldn't reuse the TileGroup component from Carbon due to this limitation.
 * https://github.com/IBM/carbon-components-react/issues/1999
 *
 */
const TileCatalog = ({
  id,
  className,
  isLoading,
  error,
  search,
  pagination,
  tiles,
  onSelection,
  selectedTileId,
  testId,
}) => {
  const searchState = search ? search.value : '';
  const handleSearch = search && search.onSearch;
  const pageSize = pagination && pagination.pageSize ? pagination.pageSize : 10;
  const totalTiles = pagination && pagination.totalItems ? pagination.totalItems : 10;

  return (
    <div data-testid={testId} className={classnames(className, `${iotPrefix}--tile-catalog`)}>
      <div data-testid={`${testId}-header`} className={`${iotPrefix}--tile-catalog--header`}>
        {search && (search.placeHolderText || search.placeholder) ? (
          <TableToolbarSearch
            size="lg"
            value={searchState}
            labelText={search.placeHolderText ?? search.placeholder}
            placeholder={search.placeHolderText ?? search.placeholder}
            onChange={handleSearch}
            id={`${id}-searchbox`}
            data-testid={`${testId}-search-input`}
          />
        ) : null}
      </div>
      {isLoading ? ( // generate empty tiles for first page
        <TileGroup
          testId={`${testId}-loading-group`}
          tiles={[...Array(pageSize)].map((val, index) => (
            <Tile className={`${iotPrefix}--tile-catalog--empty-tile`} key={`emptytile-${index}`}>
              <SkeletonText />
            </Tile>
          ))}
          totalTiles={totalTiles}
        />
      ) : tiles.length > 0 ? (
        <TileGroup
          testId={`${testId}-group`}
          tiles={tiles.map((tile) => (
            <RadioTile
              className={tile.className}
              key={tile.id}
              id={tile.id}
              value={tile.id}
              name={id}
              checked={selectedTileId === tile.id}
              onChange={onSelection}
              data-testid={`${testId}-radio-tile-${tile.id}`}
            >
              {tile.renderContent
                ? tile.renderContent({ values: tile.values, id: tile.id })
                : tile.value}
            </RadioTile>
          ))}
        />
      ) : (
        <Tile data-testid={`${testId}-empty`} className={`${iotPrefix}--tile-catalog--empty-tile`}>
          {error || (
            <Fragment>
              <Bee size={32} />
              <p>{(search && search.noMatchesFoundText) || 'No matches found'}</p>
            </Fragment>
          )}
        </Tile>
      )}
      {!isLoading && tiles.length > 0 && !error && pagination ? (
        <SimplePagination
          {...pagination}
          maxPage={Math.ceil(totalTiles / pageSize)}
          // TODO: pass testId in v3 to override defaults
          // testId={`${testId}-pagination`}
        />
      ) : null}
    </div>
  );
};
TileCatalog.propTypes = propTypes;
TileCatalog.defaultProps = defaultProps;

export default TileCatalog;
