import React, { useState, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { Add } from '@carbon/react/icons';

import FullWidthWrapper from '../../internal/FullWidthWrapper';

import StatefulTileCatalog from './StatefulTileCatalog';
import CatalogContent from './CatalogContent';

const longDescription =
  'Really long string with lots of lots of text too much to show on one line and when it wraps it might cause some interesting issues especially if it starts vertically wrapping outside of tile bounds at the bottom of the tile';

const tileRenderFunction = ({ values }) => <CatalogContent {...values} icon={<Add size={32} />} />;

export const commonTileCatalogProps = {
  title: 'My Tile Catalog',
  id: 'entityType',
  tiles: [
    {
      id: 'test1',
      values: {
        title: 'Test Tile with really long title that should wrap',
        description: longDescription,
      },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test2',
      values: { title: 'Test Tile2', description: longDescription },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test3',
      values: { title: 'Test Tile3', description: 'Tile contents' },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test4',
      values: { title: 'Test Tile4', description: longDescription },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test5',
      values: { title: 'Test Tile5', description: longDescription },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test6',
      values: { title: 'Test Tile6', description: longDescription },
      renderContent: tileRenderFunction,
    },
    {
      id: 'test7',
      values: { title: 'Test Tile7', description: longDescription },
      renderContent: tileRenderFunction,
    },
  ],
  onSelection: action('onSelection'),
};

export default {
  title: '1 - Watson IoT/Catalog/Marketplace/TileCatalog',
  excludeStories: ['commonTileCatalogProps'],
};

export const Default = () => (
  <StatefulTileCatalog
    {...commonTileCatalogProps}
    selectedTileId={select(
      'id',
      commonTileCatalogProps.tiles.map((tile) => tile.id),
      commonTileCatalogProps.tiles[0].id
    )}
  />
);

Default.storyName = 'default';

export const WithSearch = () => (
  // Example stateful catalog component that can search
  <StatefulTileCatalog
    {...commonTileCatalogProps}
    search={{
      placeholder: 'Search catalog',
      onSearch: action('search'),
    }}
    pagination={{ pageSize: 6, onPage: action('onPage') }}
  />
);

WithSearch.storyName = 'with search';

export const WithPages = () => (
  <StatefulTileCatalog
    {...commonTileCatalogProps}
    pagination={{ pageSize: 6, onPage: action('onPage') }}
    selectedTileId={select(
      'id',
      commonTileCatalogProps.tiles.map((tile) => tile.id),
      commonTileCatalogProps.tiles[0].id
    )}
  />
);

WithPages.storyName = 'with pages';

export const Loading = () => <StatefulTileCatalog {...commonTileCatalogProps} isLoading />;

Loading.storyName = 'loading';

export const Error = () => (
  <FullWidthWrapper>
    <StatefulTileCatalog {...commonTileCatalogProps} tiles={[]} error="In error state" />
  </FullWidthWrapper>
);

Error.storyName = 'error';

export const AsyncLoadedWaitOneSecond = () => {
  const Container = () => {
    const [tilesProp, setTiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => {
        setTiles(commonTileCatalogProps.tiles);
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }, []);
    return (
      <StatefulTileCatalog {...commonTileCatalogProps} isLoading={isLoading} tiles={tilesProp} />
    );
  };
  return <Container />;
};

AsyncLoadedWaitOneSecond.storyName = 'async loaded wait one second';

export const IsSelectedByDefaultFalse = () => (
  <StatefulTileCatalog {...commonTileCatalogProps} isSelectedByDefault={false} />
);

IsSelectedByDefaultFalse.storyName = 'isSelectedByDefault false';
